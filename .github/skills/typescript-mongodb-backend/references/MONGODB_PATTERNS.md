# MongoDB + TypeScript Patterns for Backend

## Connection & Type Safety

### Setup with TypeScript

```typescript
// src/db/connection.ts
import { MongoClient, Db, Collection } from 'mongodb';

interface BloodDonor {
  _id?: ObjectId;
  name: string;
  bloodType: string;
  email: string;
  phone: string;
  location: {
    city: string;
    coordinates: { lat: number; lng: number };
  };
  lastDonation?: Date;
  createdAt: Date;
}

interface BloodRequest {
  _id?: ObjectId;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  requestedBy: string;
  createdAt: Date;
}

let db: Db;

export async function connectDB(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  db = client.db('blood_donation');
}

export function getDB(): Db {
  if (!db) throw new Error('Database not connected');
  return db;
}

export function getCollection<T>(name: string): Collection<T> {
  return getDB().collection<T>(name);
}

export const bloodDonors = () => getCollection<BloodDonor>('bloodDonors');
export const bloodRequests = () => getCollection<BloodRequest>('bloodRequests');
```

## Common Queries

### Find with Filters

```typescript
// Find donors by blood type
async function findDonorsByType(bloodType: string): Promise<BloodDonor[]> {
  return bloodDonors().find({ bloodType }).toArray();
}

// Find donors near a location
async function findNearbyDonors(
  lat: number,
  lng: number,
  maxDistance: number = 50000 // meters
): Promise<BloodDonor[]> {
  return bloodDonors()
    .find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    })
    .toArray();
}

// Find donors eligible to donate (no donation in last 56 days)
async function findEligibleDonors(): Promise<BloodDonor[]> {
  const fiftyDaysAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  return bloodDonors()
    .find({
      $or: [
        { lastDonation: { $exists: false } },
        { lastDonation: { $lt: fiftyDaysAgo } },
      ],
    })
    .toArray();
}
```

### Aggregation Pipelines

```typescript
// Count donations by blood type
async function getDonationStats() {
  return bloodDonors()
    .aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          lastDonations: {
            $avg: {
              $cond: [{ $exists: ['$lastDonation'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray();
}

// Find requests by urgency and get closest donors
async function getUrgentRequestsWithDonors() {
  return bloodRequests()
    .aggregate([
      { $match: { urgency: 'high', fulfilled: false } },
      {
        $lookup: {
          from: 'bloodDonors',
          let: { reqType: '$bloodType' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$bloodType', '$$reqType'] },
              },
            },
            { $limit: 5 },
          ],
          as: 'matchedDonors',
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();
}

// Time-series: donations per day (last 30 days)
async function getDonationTrend() {
  return bloodDonors()
    .aggregate([
      {
        $match: {
          lastDonation: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$lastDonation',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}
```

### Updates & Inserts

```typescript
// Record a donation
async function recordDonation(donorId: ObjectId, bloodType: string): Promise<void> {
  await bloodDonors().updateOne(
    { _id: donorId },
    {
      $set: { lastDonation: new Date() },
      $inc: { donationCount: 1 },
    }
  );
}

// Create a blood request
async function createRequest(data: Omit<BloodRequest, '_id' | 'createdAt'>): Promise<ObjectId> {
  const result = await bloodRequests().insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId;
}

// Batch update multiple requests as fulfilled
async function markRequestsFulfilled(requestIds: ObjectId[]): Promise<void> {
  await bloodRequests().updateMany(
    { _id: { $in: requestIds } },
    {
      $set: { fulfilled: true, fulfilledAt: new Date() },
    }
  );
}
```

## Error Handling

```typescript
// Safe database operation with error handling
async function getDonorSafely(email: string): Promise<BloodDonor | null> {
  try {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email parameter');
    }
    return await bloodDonors().findOne({ email });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database error:', error.message);
    }
    throw new Error('Failed to fetch donor');
  }
}

// API endpoint with error handling
async function handleGetDonor(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    
    const donor = await bloodDonors().findOne({ email });
    if (!donor) {
      res.status(404).json({ message: 'Donor not found' });
      return;
    }
    
    res.json({ donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
```

## Testing MongoDB Code

### Unit Test with Mock Data

```typescript
// tests/services/bloodDonors.test.ts
import { bloodDonors } from '../../src/db/connection';

jest.mock('../../src/db/connection', () => ({
  bloodDonors: jest.fn(),
}));

describe('Blood Donor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find donors by blood type', async () => {
    const mockDonors = [
      { _id: '1', name: 'John', bloodType: 'O+' },
      { _id: '2', name: 'Jane', bloodType: 'O+' },
    ];
    
    const mockFind = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockDonors),
    });
    
    (bloodDonors as jest.Mock).mockReturnValue({
      find: mockFind,
    });
    
    // Call your actual function
    const result = await findDonorsByType('O+');
    
    expect(result).toHaveLength(2);
    expect(mockFind).toHaveBeenCalledWith({ bloodType: 'O+' });
  });
});
```

### Integration Test with Memory MongoDB

```typescript
// tests/integration/bloodDonors.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

describe('Blood Donor Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_blood_donation');
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  it('should insert and retrieve donor', async () => {
    const donors = db.collection('bloodDonors');
    const testDonor = {
      name: 'Test Donor',
      bloodType: 'O+',
      email: 'test@example.com',
      createdAt: new Date(),
    };

    const result = await donors.insertOne(testDonor);
    const inserted = await donors.findOne({ _id: result.insertedId });

    expect(inserted).toBeDefined();
    expect(inserted?.name).toBe('Test Donor');
  });
});
```

## Best Practices

✅ **Do:**
- Use TypeScript interfaces for type safety
- Create indexes on frequently queried fields (`email`, `bloodType`, location)
- Validate inputs before database operations
- Use projection to limit returned fields
- Handle connection errors gracefully
- Use transactions for multi-document operations

❌ **Don't:**
- Return entire collections without limits
- Use `ObjectId.toString()` without reason
- Skip error handling in production code
- Store sensitive data (passwords) in plain text
- Create indexes for every field (storage overhead)
- Make synchronous database calls

## Indexes for Performance

```typescript
// src/db/indexes.ts
export async function createIndexes(db: Db): Promise<void> {
  await db.collection('bloodDonors').createIndex({ email: 1 }, { unique: true });
  await db.collection('bloodDonors').createIndex({ bloodType: 1 });
  await db.collection('bloodDonors').createIndex({
    'location.coordinates': '2dsphere', // Geospatial index
  });
  
  await db.collection('bloodRequests').createIndex({ bloodType: 1 });
  await db.collection('bloodRequests').createIndex({ createdAt: -1 });
  await db.collection('bloodRequests').createIndex({ urgency: 1, fulfilled: 1 });
}
```
