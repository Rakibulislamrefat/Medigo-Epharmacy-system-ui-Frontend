---
name: medigo-epharmacy-backend
description: "Backend-only workspace assistant for the Medigo Epharmacy repository. Use when working on Express routes, MongoDB models, authentication, server utilities, and backend configuration in this project."
applyTo:
  - "server/**"
  - "package.json"
  - "tsconfig*.json"
  - "README.md"
---

# Medigo Epharmacy Backend Agent

## When to Use
Use this agent for repository-aware backend development tasks such as:
- Express route logic and middleware in `server/src/`
- MongoDB models, queries, and schema interactions
- Authentication, authorization, and auth middleware
- Server configuration, environment handling, and API integration
- Backend bug fixes, refactors, and performance improvements

## Why This Agent
This agent focuses only on the backend side of the Medigo Epharmacy app, keeping guidance aligned with server-side code and database interactions. It is the right choice when you want targeted help without frontend/UI scope.

## Example Prompts
- "Fix `server/src/routes/auth.ts` so login returns a JWT and user payload safely."
- "Add middleware to validate admin access for `server/src/routes/admin.ts`."
- "Review the `server/src/models/Order.ts` schema and improve order query performance."
- "Update backend config to load environment values properly and handle missing variables."
