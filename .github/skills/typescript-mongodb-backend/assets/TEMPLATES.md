# TypeScript + MongoDB Backend Skill - Asset Templates

## New API Endpoint Template

```typescript
// Template: src/api/[feature].ts
import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { [collection] } from '../db/connection';

const router = Router();

// GET /api/[feature]
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10', skip = '0' } = req.query;

    const items = await [collection]()
      .find()
      .skip(parseInt(skip as string))
      .limit(parseInt(limit as string))
      .toArray();

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// GET /api/[feature]/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const item = await [collection]().findOne({ _id: new ObjectId(id) });
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
});

// POST /api/[feature]
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // TODO: Add validation here
    if (!data) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const result = await [collection]().insertOne({
      ...data,
      createdAt: new Date(),
    });

    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create item' });
  }
});

// PUT /api/[feature]/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    delete updates._id;
    delete updates.createdAt;

    const result = await [collection]().updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json({ message: 'Item updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// DELETE /api/[feature]/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const result = await [collection]().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

export default router;
```

## New MongoDB Service Template

```typescript
// Template: src/services/[feature]Service.ts
import { ObjectId } from 'mongodb';
import { [collection] } from '../db/connection';

export interface [Item] {
  _id?: ObjectId;
  // TODO: Add fields
  createdAt?: Date;
  updatedAt?: Date;
}

export class [FeatureName]Service {
  
  /**
   * Find all items with optional filters
   */
  static async findAll(filter?: Record<string, any>) {
    try {
      return await [collection]()
        .find(filter || {})
        .toArray();
    } catch (error) {
      console.error('Find all error:', error);
      throw error;
    }
  }

  /**
   * Find single item by ID
   */
  static async findById(id: ObjectId | string) {
    if (typeof id === 'string') {
      if (!ObjectId.isValid(id)) throw new Error('Invalid ID');
      id = new ObjectId(id);
    }

    try {
      return await [collection]().findOne({ _id: id });
    } catch (error) {
      console.error('Find by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new item
   */
  static async create(data: Omit<[Item], '_id' | 'createdAt'>) {
    try {
      const result = await [collection]().insertOne({
        ...data,
        createdAt: new Date(),
      } as [Item]);

      return result.insertedId;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  }

  /**
   * Update item by ID
   */
  static async update(id: ObjectId | string, updates: Partial<[Item]>) {
    if (typeof id === 'string') {
      if (!ObjectId.isValid(id)) throw new Error('Invalid ID');
      id = new ObjectId(id);
    }

    try {
      delete updates._id;
      delete updates.createdAt;

      const result = await [collection]().updateOne(
        { _id: id },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  /**
   * Delete item by ID
   */
  static async delete(id: ObjectId | string) {
    if (typeof id === 'string') {
      if (!ObjectId.isValid(id)) throw new Error('Invalid ID');
      id = new ObjectId(id);
    }

    try {
      const result = await [collection]().deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}
```

## New Test Template

```typescript
// Template: tests/[feature]/[feature].test.ts
import { [FeatureName]Service } from '../../src/services/[FeatureName]Service';
import { [collection] } from '../../src/db/connection';

jest.mock('../../src/db/connection');

describe('[FeatureName] Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const mockItems = [
        // TODO: Add mock data
      ];

      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockItems),
      });

      ([collection] as jest.Mock).mockReturnValue({
        find: mockFind,
      });

      const result = await [FeatureName]Service.findAll();

      expect(result).toEqual(mockItems);
      expect(mockFind).toHaveBeenCalledWith({});
    });

    it('should return filtered items', async () => {
      const mockItems = [
        // TODO: Add filtered mock data
      ];

      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockItems),
      });

      ([collection] as jest.Mock).mockReturnValue({
        find: mockFind,
      });

      const filter = { status: 'active' };
      const result = await [FeatureName]Service.findAll(filter);

      expect(result).toEqual(mockItems);
      expect(mockFind).toHaveBeenCalledWith(filter);
    });
  });

  describe('create', () => {
    it('should create new item', async () => {
      const mockInsertOne = jest.fn().mockResolvedValue({
        insertedId: '507f1f77bcf86cd799439011',
      });

      ([collection] as jest.Mock).mockReturnValue({
        insertOne: mockInsertOne,
      });

      const newItem = {
        // TODO: Add test data
      };

      const result = await [FeatureName]Service.create(newItem);

      expect(result).toBeDefined();
      expect(mockInsertOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update item by ID', async () => {
      const mockUpdateOne = jest.fn().mockResolvedValue({
        modifiedCount: 1,
      });

      ([collection] as jest.Mock).mockReturnValue({
        updateOne: mockUpdateOne,
      });

      const id = '507f1f77bcf86cd799439011';
      const updates = {
        // TODO: Add update data
      };

      const result = await [FeatureName]Service.update(id, updates);

      expect(result).toBe(true);
      expect(mockUpdateOne).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete item by ID', async () => {
      const mockDeleteOne = jest.fn().mockResolvedValue({
        deletedCount: 1,
      });

      ([collection] as jest.Mock).mockReturnValue({
        deleteOne: mockDeleteOne,
      });

      const id = '507f1f77bcf86cd799439011';
      const result = await [FeatureName]Service.delete(id);

      expect(result).toBe(true);
      expect(mockDeleteOne).toHaveBeenCalled();
    });
  });
});
```

## API Integration Test Template

```typescript
// Template: tests/integration/[feature]-api.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('[Feature] API Integration Tests', () => {
  describe('POST /api/[feature]', () => {
    it('should create new item', async () => {
      const response = await request(app)
        .post('/api/[feature]')
        .send({
          // TODO: Add test data
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/[feature]')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/[feature]', () => {
    it('should retrieve all items', async () => {
      const response = await request(app).get('/api/[feature]');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe('GET /api/[feature]/:id', () => {
    it('should retrieve item by ID', async () => {
      // First create an item
      const createResponse = await request(app)
        .post('/api/[feature]')
        .send({
          // TODO: Add test data
        });

      const itemId = createResponse.body.id;

      // Then retrieve it
      const getResponse = await request(app).get(`/api/[feature]/${itemId}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.item).toBeDefined();
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get(
        '/api/[feature]/507f1f77bcf86cd799439011'
      );

      expect(response.status).toBe(404);
    });
  });
});
```

## How to Use Templates

1. Copy the relevant template
2. Replace all `[TODO]` comments with your specific implementation
3. Replace all `[Placeholders]` with your actual names:
   - `[Feature]` → e.g., `BloodDonor`
   - `[feature]` → e.g., `blood-donor`
   - `[collection]` → e.g., `bloodDonors`
   - `[FeatureName]` → e.g., `BloodDonorService`
4. Save the file with the correct name
5. Run: `npm test -- --testPathPattern="[feature]"` to validate
