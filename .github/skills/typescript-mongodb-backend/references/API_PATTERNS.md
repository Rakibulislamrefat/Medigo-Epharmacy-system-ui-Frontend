# API Endpoint Patterns & Best Practices

## Express API Structure

```typescript
// src/api/bloodDonors.ts
import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { bloodDonors } from '../db/connection';

const router = Router();

// GET /api/blood-donors
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodType, limit = '10', skip = '0' } = req.query;

    // Validate inputs
    if (typeof bloodType !== 'string' && bloodType !== undefined) {
      res.status(400).json({ message: 'Invalid blood type filter' });
      return;
    }

    // Build query
    const query: Record<string, any> = {};
    if (bloodType) query.bloodType = bloodType;

    // Execute query with pagination
    const donors = await bloodDonors()
      .find(query)
      .skip(parseInt(skip as string))
      .limit(parseInt(limit as string))
      .toArray();

    res.json({ donors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch donors' });
  }
});

// GET /api/blood-donors/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid donor ID' });
      return;
    }

    const donor = await bloodDonors().findOne({ _id: new ObjectId(id) });
    if (!donor) {
      res.status(404).json({ message: 'Donor not found' });
      return;
    }

    res.json({ donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch donor' });
  }
});

// POST /api/blood-donors
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, bloodType, email, phone, location } = req.body;

    // Validate required fields
    if (!name || !bloodType || !email || !phone) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Check if email already exists
    const existing = await bloodDonors().findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // Insert new donor
    const result = await bloodDonors().insertOne({
      name,
      bloodType,
      email,
      phone,
      location,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Donor registered successfully',
      donorId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register donor' });
  }
});

// PUT /api/blood-donors/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid donor ID' });
      return;
    }

    // Prevent updating sensitive fields
    delete updates._id;
    delete updates.createdAt;

    const result = await bloodDonors().updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Donor not found' });
      return;
    }

    res.json({ message: 'Donor updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update donor' });
  }
});

// DELETE /api/blood-donors/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid donor ID' });
      return;
    }

    const result = await bloodDonors().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Donor not found' });
      return;
    }

    res.json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete donor' });
  }
});

export default router;
```

## Error Response Patterns

```typescript
// Consistent error response format
interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Custom error class
class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
  }
}

// Error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response
): void => {
  console.error(error);

  if (error instanceof APIError) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
```

## Request Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

// Type-safe validation
interface ValidatorSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'email';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

export const validateRequest = (schema: ValidatorSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check required
      if (rules.required && !value) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (!value) continue;

      // Check type
      if (typeof value !== rules.type) {
        errors[field] = `${field} must be ${rules.type}`;
        continue;
      }

      // Check string constraints
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.min && value.length < rules.min) {
          errors[field] = `${field} must be at least ${rules.min} characters`;
        }
        if (rules.max && value.length > rules.max) {
          errors[field] = `${field} must be at most ${rules.max} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = `${field} format is invalid`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    next();
  };
};

// Usage
app.post(
  '/api/blood-donors',
  validateRequest({
    name: { type: 'string', required: true, min: 2 },
    email: { type: 'email', required: true },
    bloodType: { type: 'string', required: true, pattern: /^[ABO][+-]$/ },
    phone: { type: 'string', required: true, pattern: /^\d{10}$/ },
  }),
  createDonorHandler
);
```

## Response Types

```typescript
// src/types/api.ts

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponseBody {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Type-safe response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode: number = 400
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void => {
  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
```

## Testing API Endpoints

```typescript
// tests/api/bloodDonors.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Blood Donors API', () => {
  describe('POST /api/blood-donors', () => {
    it('should create a new donor', async () => {
      const response = await request(app).post('/api/blood-donors').send({
        name: 'John Doe',
        bloodType: 'O+',
        email: 'john@example.com',
        phone: '1234567890',
      });

      expect(response.status).toBe(201);
      expect(response.body.donorId).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app).post('/api/blood-donors').send({
        name: 'John Doe',
        bloodType: 'O+',
        email: 'john@example.com',
        phone: '1234567890',
      });

      // Second registration with same email
      const response = await request(app).post('/api/blood-donors').send({
        name: 'Jane Doe',
        bloodType: 'O+',
        email: 'john@example.com',
        phone: '0987654321',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Email already registered');
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/blood-donors').send({
        name: 'John Doe',
        // Missing bloodType, email, phone
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/blood-donors/:id', () => {
    it('should retrieve a donor by ID', async () => {
      // First create a donor
      const createResponse = await request(app).post('/api/blood-donors').send({
        name: 'John Doe',
        bloodType: 'O+',
        email: 'john@example.com',
        phone: '1234567890',
      });

      const donorId = createResponse.body.donorId;

      // Then retrieve it
      const getResponse = await request(app).get(`/api/blood-donors/${donorId}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.donor.name).toBe('John Doe');
    });

    it('should return 404 for non-existent donor', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/blood-donors/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });
});
```

## Checklist for New Endpoints

- ✅ Input validation (required fields, types, formats)
- ✅ Error handling (try-catch, proper status codes)
- ✅ Response types (TypeScript interfaces)
- ✅ Logging (error logs for debugging)
- ✅ MongoDB ObjectId validation
- ✅ Unit tests (happy path + error cases)
- ✅ Pagination (for list endpoints)
- ✅ Authorization (if needed)
- ✅ Rate limiting (if public API)
- ✅ Documentation (JSDoc comments)
