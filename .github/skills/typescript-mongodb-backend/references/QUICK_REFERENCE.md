# TypeScript + MongoDB Backend Skill

## Quick Reference

### Validation Commands

```bash
# Full validation (type check + lint + test)
./scripts/validate.sh

# Test a specific feature
./scripts/test-feature.sh login
./scripts/test-feature.sh bloodBank

# Auto-fix linting issues
./scripts/auto-fix.sh
```

### Common npm scripts (from package.json)

```bash
npm run type-check      # TypeScript validation
npm run lint            # ESLint validation
npm run lint:fix        # Auto-fix ESLint issues
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Check test coverage
```

### MongoDB + TypeScript Patterns

**Type-safe MongoDB queries:**
```typescript
import { MongoClient, ObjectId } from 'mongodb';

interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  location?: { city: string };
}

const users = db.collection<User>('users');
const user = await users.findOne({ email: 'user@example.com' });
```

**Error handling in API endpoints:**
```typescript
app.post('/api/login', async (req, res) => {
  try {
    const user = await users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

**MongoDB mock in Jest:**
```typescript
jest.mock('mongodb');

describe('User Service', () => {
  it('should find user by email', async () => {
    const mockUser = { _id: '1', email: 'test@example.com' };
    (db.collection().findOne as jest.Mock).mockResolvedValue(mockUser);
    
    const result = await findUserByEmail('test@example.com');
    expect(result).toEqual(mockUser);
  });
});
```

## File Organization

```
src/
├── api/services/        # API route handlers (loginApi, etc.)
├── features/*/service/  # Business logic & MongoDB operations
├── models/              # TypeScript interfaces matching MongoDB schema
├── types/               # Global TypeScript types
└── utilities/           # Helper functions (api.ts, etc.)

tests/ or __tests__/
├── api/                 # API endpoint tests
├── services/            # Service/database tests
└── integration/         # End-to-end tests
```

## Testing MongoDB Code

### Setup: MongoDB Memory Server (for tests)

```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Connect to memory database
});

afterAll(async () => {
  await mongoServer.stop();
});
```

### Testing a Query

```typescript
describe('Blood Bank Queries', () => {
  it('should filter blood banks by type', async () => {
    // Setup test data
    await bloodBanks.insertMany([
      { name: 'Bank A', type: 'O+' },
      { name: 'Bank B', type: 'AB-' },
    ]);
    
    // Query
    const result = await bloodBanks.find({ type: 'O+' }).toArray();
    
    // Verify
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bank A');
  });
});
```

## Debugging Tips

1. **Type errors?** Run `npx tsc --noEmit` to see exact location
2. **Test failing?** Add `.only` to focus on one test: `it.only('...')`
3. **MongoDB mock not working?** Check mock path matches import statement
4. **ESLint strict?** Run `npx eslint --fix` to auto-correct simple issues
