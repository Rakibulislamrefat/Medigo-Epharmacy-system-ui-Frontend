---
name: typescript-mongodb-backend
description: "Develop and test TypeScript backend code with MongoDB integration. Auto-validate code quality, run unit tests, and verify type safety. Use when: writing API endpoints, creating database operations, fixing failing tests, or reviewing code before commit. Includes linting, type checking, Jest testing, and MongoDB query validation."
argument-hint: "Describe what backend code you need: e.g., 'Create API endpoint for user login', 'Write MongoDB aggregation query', 'Fix failing test for blood donation feature'"
---

# TypeScript + MongoDB Backend Development

## When to Use This Skill

Use this skill when you need to:
- **Write new API endpoints** safely with automatic testing
- **Create MongoDB operations** (queries, aggregations) with schema validation
- **Write utility/helper functions** with type safety enforced
- **Fix failing tests** with automated diagnostics
- **Review code before commit** for quality and correctness
- **Validate TypeScript types** and catch errors early

## Workflow Overview

This skill provides a complete development cycle:

1. **Code Generation** — Write TypeScript endpoints, queries, or utilities
2. **Auto-Validation** — Run ESLint and TypeScript type checking
3. **Test Execution** — Run Jest tests automatically
4. **Error Diagnosis** — Identify and fix issues
5. **Verification** — Confirm all tests pass before committing

## Getting Started

### Prerequisites

Ensure your project has:
- TypeScript configured (`tsconfig.json`)
- Jest installed and configured (`jest.config.js`)
- ESLint configured (`.eslintrc.js` or similar)
- MongoDB client set up in your backend

### Quick Examples

#### Example 1: Write a new API endpoint
```
/typescript-mongodb-backend

Create a login endpoint in src/api/auth.ts that:
- Accepts email and password
- Queries MongoDB users collection
- Returns JWT token on success
- Includes proper error handling
```

#### Example 2: Create a MongoDB query
```
/typescript-mongodb-backend

Write a MongoDB aggregation pipeline that:
- Groups blood donations by type
- Counts donations per type
- Filters by date range (last 30 days)
- Returns sorted by count descending
```

#### Example 3: Debug a failing test
```
/typescript-mongodb-backend

Test failing: UserLoginTest. Error: connection refused to MongoDB
Fix the test to:
- Use MongoDB mock instead of real connection
- Verify all assertions pass
```

## Step-by-Step Procedure

### Phase 1: Code Generation

1. **Define requirements** clearly (inputs, outputs, side effects)
2. **Generate TypeScript code** with proper types
3. **Include error handling** for edge cases
4. **Add JSDoc comments** for complex logic

### Phase 2: Auto-Validation (Automatic)

The following checks run automatically after code generation:

#### TypeScript Type Checking
```bash
# Validates all types are correct
npx tsc --noEmit
```
- Catches type mismatches
- Ensures imports are valid
- Flags unused variables

#### ESLint Code Quality
```bash
# Lints code for style and best practices
npx eslint src/ --ext .ts,.tsx
```
- Validates naming conventions
- Checks for unused imports
- Enforces code style

### Phase 3: Test Execution (Automatic)

#### Unit Tests with Jest
```bash
# Runs all tests in the project
npm test -- --testPathPattern="<file-or-feature>" --passWithNoTests
```

What gets tested:
- **API endpoint logic** (mocking MongoDB calls)
- **MongoDB query logic** (with test fixtures)
- **Error handling** (edge cases and failures)
- **Type correctness** (TypeScript validation)

### Phase 4: Error Diagnosis

If tests fail, the system will:
1. **Display test output** with error details
2. **Show failing assertions** (expected vs actual)
3. **Provide stack traces** for debugging
4. **Identify root cause** (logic error, type mismatch, mock issue)

### Phase 5: Verification

Before committing:
1. ✅ All tests pass
2. ✅ No TypeScript errors
3. ✅ ESLint shows no violations
4. ✅ Code follows MongoDB best practices

## Common Tasks

### Writing an API Endpoint

**Request:**
```
/typescript-mongodb-backend

Create POST /api/blood-request in src/api/bloodRequest.ts that:
- Accepts bloodType, quantity, location, urgency
- Validates inputs
- Stores request in MongoDB
- Returns request ID on success
```

**What happens:**
- Code is generated with full types
- TypeScript checks types are valid
- ESLint validates style
- Jest tests verify the endpoint logic
- MongoDB mock validates queries
- All tests run and pass

### Creating a MongoDB Query

**Request:**
```
/typescript-mongodb-backend

Create a query to find all blood donors near a location within 50km radius
```

**What happens:**
- Aggregation pipeline is generated
- TypeScript validates the pipeline structure
- Unit tests verify query returns correct results
- Geospatial query is validated
- Performance considerations are checked

### Fixing a Failing Test

**Request:**
```
/typescript-mongodb-backend

Test is failing: DonorFilterTest
Error: expected array length 5 to equal 6
```

**What happens:**
- Test output is analyzed
- Cause is identified (incorrect filter logic, mock data issue)
- Code is fixed
- Test runs again automatically
- Result is confirmed

## Code Organization

Follow this structure for the skill to work optimally:

```
src/
├── api/            # Express route handlers
├── services/       # Business logic + MongoDB operations
├── models/         # MongoDB schemas and types
├── utils/          # Helper functions
├── middleware/     # Express middleware
└── types/          # TypeScript type definitions

tests/ (or __tests__/)
├── api/            # API endpoint tests
├── services/       # Service/database tests
└── utils/          # Utility function tests
```

## Best Practices

### TypeScript
- ✅ Use strict mode (`strict: true` in tsconfig.json)
- ✅ Define explicit return types for all functions
- ✅ Use interfaces for data shapes
- ✅ Avoid `any` type — use specific types instead

### MongoDB
- ✅ Use TypeScript interfaces matching your schema
- ✅ Validate ObjectId before queries
- ✅ Handle connection errors gracefully
- ✅ Use projection to limit returned fields

### Testing
- ✅ Mock external dependencies (MongoDB, APIs)
- ✅ Test both success and error paths
- ✅ Use descriptive test names
- ✅ Keep tests focused and isolated

### Code Quality
- ✅ Follow ESLint rules (no exceptions)
- ✅ Add error handling (try-catch blocks)
- ✅ Write comments for complex logic
- ✅ Keep functions small and focused

## Troubleshooting

### Jest tests won't run
- Check `jest.config.js` exists and is valid
- Verify test files match pattern: `*.test.ts` or `*.spec.ts`
- Run `npm test -- --passWithNoTests` to see specific errors

### TypeScript errors about MongoDB
- Ensure MongoDB types are installed: `npm install --save-dev @types/mongodb`
- Verify interfaces match actual MongoDB document structure
- Check connection type is `MongoClient` not string

### ESLint violations
- Run `npx eslint --fix src/` to auto-fix common issues
- Review [project ESLint config](.eslintrc.js) for rules
- If rule conflicts with your style, discuss with team

### Tests pass but code still has issues
- Run full validation: `npm run type-check && npm run lint && npm test`
- Check for runtime errors in actual API calls
- Verify MongoDB mock matches real data structure

## Integration with Your Project

This skill works best when you:
1. Run linting/type-check before every commit (use pre-commit hooks)
2. Keep test coverage above 80%
3. Use MongoDB TestContainers or mocks in tests (not real database)
4. Document complex queries with inline comments
5. Review test output after each code generation

## Next Steps

After using this skill:
- Review generated code carefully
- Run the full test suite: `npm run test:all`
- Commit only after all validations pass
- Push to your branch for code review
