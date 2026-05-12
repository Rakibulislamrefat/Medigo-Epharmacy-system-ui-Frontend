---
name: medigo-epharmacy
description: "Workspace-specific coding assistant for the Medigo Epharmacy UI and backend repository. Use when working on React/TypeScript frontend pages, Redux state, API integration, Express/Mongo backend routes, or repository configuration in this project."
applyTo:
  - "src/**"
  - "server/**"
  - "package.json"
  - "tsconfig*.json"
  - "vite.config.ts"
  - "README.md"
---

# Medigo Epharmacy Workspace Agent

## When to Use
Use this agent whenever you want repository-aware guidance for:
- React/TypeScript frontend development in `src/`
- Admin, user, and shared UI components
- Redux store and state management
- Backend routes, authentication, and MongoDB integration in `server/`
- Build, lint, and TypeScript issues in this repo
- Refactoring or documenting existing code

## Why This Agent
This agent keeps suggestions aligned with the Medigo Epharmacy codebase and file structure. It should be picked over the default agent when you want focused assistance for this workspace rather than a generic TypeScript or React helper.

## Example Prompts
- "Update the admin medicines page so it supports search and pagination."
- "Fix the login flow in `src/features/login` and ensure the Redux state updates correctly."
- "Refactor `server/routes/auth.ts` to validate user credentials and handle JWT tokens."
- "Review `src/shared/components/Form.tsx` for accessibility and reusable validation patterns."
