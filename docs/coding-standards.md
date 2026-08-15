# Coding Standards

## 1. Purpose

This document defines the coding standards for the LMS project.

The goal is to keep the codebase readable, predictable, maintainable, testable, and consistent as the project grows.

These standards apply to both frontend and backend development.

---

## 2. General Principles

1. Prefer simple, readable code over clever code.
2. Follow the existing architecture unless there is a clear reason to change it.
3. Avoid premature abstraction.
4. Keep functions focused on one responsibility.
5. Avoid duplicated business logic.
6. Validate external input.
7. Handle errors explicitly.
8. Never commit secrets.
9. Write code that can be tested independently.
10. Keep changes focused and avoid unrelated modifications.

---

## 3. JavaScript Standards

### 3.1 Modules

Use ES Modules.

Preferred:

```js
import express from 'express';
import User from './models/User.js';

export const getUser = async () => {};
```

Avoid CommonJS unless there is a specific dependency requirement:

```js
const express = require('express');
```

---

## 4. Naming Conventions

### Variables and functions

Use camelCase:

```js
const courseData = {};
const userId = '123';

const getCourseById = async () => {};
```

### React components

Use PascalCase:

```text
CourseCard.jsx
Dashboard.jsx
CourseDetails.jsx
```

### Models

Use PascalCase:

```text
User.js
Course.js
Purchase.js
```

### Routes

Use descriptive names:

```text
userRoutes.js
courseRoutes.js
educatorRoutes.js
```

### Constants

Use descriptive names. Uppercase may be used for true constants:

```js
const MAX_FILE_SIZE = 10 * 1024 * 1024;
```

---

## 5. Functions

Functions should have one clear responsibility.

Avoid:

```js
async function processCourse() {
    // validate user
    // upload image
    // create course
    // send email
    // create payment
    // calculate analytics
}
```

Prefer separating responsibilities:

```text
Controller
    ↓
Course Service
    ↓
Course Repository / Model

Media Service
Payment Service
Notification Service
```

Do not introduce abstractions without a real need.

---

## 6. Async/Await

Prefer `async/await` for asynchronous application code.

Preferred:

```js
const user = await User.findById(userId);
```

Avoid unnecessary promise chaining:

```js
User.findById(userId)
    .then(...)
    .catch(...);
```

Errors from asynchronous operations must be handled appropriately.

---

## 7. Error Handling

Do not silently ignore errors.

Avoid:

```js
try {
    await operation();
} catch (error) {
}
```

Errors should either:

- be handled locally when recovery is possible, or
- be passed to centralized error handling.

The application should use appropriate HTTP status codes.

Examples:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

---

## 8. API Response Standards

API responses should use a consistent structure.

Success example:

```json
{
  "success": true,
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "message": "Course not found"
}
```

When appropriate, errors should also include a stable error code.

Example:

```json
{
  "success": false,
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

The final response format will be standardized as part of API hardening.

---

## 9. Input Validation

Never trust client input.

Validate:

- request body
- query parameters
- route parameters
- uploaded files
- webhook payloads
- external API responses

Validation should happen before business logic executes.

Preferred flow:

```text
Request
  ↓
Validation
  ↓
Authentication
  ↓
Authorization
  ↓
Business Logic
  ↓
Database
```

The exact middleware ordering may vary by endpoint.

---

## 10. Authentication and Authorization

Authentication determines:

> Who is the user?

Authorization determines:

> Is this user allowed to perform this action?

These concerns must remain separate.

The project uses Clerk for authentication.

Authorization checks must be enforced on the server.

Never rely solely on frontend route protection.

---

## 11. Database Standards

### Mongoose

Models should:

- define clear schemas
- use appropriate data types
- enforce required fields where appropriate
- define useful indexes
- avoid unnecessary duplication
- use references carefully

### Queries

Avoid unnecessary database queries.

Bad pattern:

```js
for (const course of courses) {
    await User.find(...);
}
```

Prefer an appropriate bulk query, aggregation, or population strategy when practical.

Database optimization should be based on actual query behavior rather than premature optimization.

---

## 12. Controllers

Controllers should primarily handle HTTP concerns:

```text
Request
  ↓
Controller
  ↓
Service
  ↓
Database / External Service
  ↓
Response
```

Controllers should not become large collections of business logic.

As the application grows, complex business logic should move into services.

---

## 13. Services

Services should contain reusable business logic.

Example:

```text
services/
├── courseService.js
├── purchaseService.js
├── enrollmentService.js
└── paymentService.js
```

Services should not depend unnecessarily on Express request/response objects.

This makes business logic easier to test.

---

## 14. React Standards

### Components

Components should have a clear responsibility.

Avoid large components containing:

- API calls
- complex business logic
- data transformation
- multiple unrelated UI sections

Prefer smaller reusable components when there is meaningful reuse.

### Hooks

Reusable stateful logic should be extracted into custom hooks when appropriate.

Example:

```text
hooks/
├── useAuth.js
├── useCourse.js
└── useCourseProgress.js
```

Do not create custom hooks simply to wrap one trivial operation.

---

## 15. React State Management

Use local component state when state is local.

Use shared context/state only when multiple components genuinely need the same state.

Avoid putting all application state into global context.

---

## 16. API Calls

API communication should be consistent.

Prefer a centralized Axios configuration where practical:

```text
api/
└── client.js
```

Avoid scattering duplicated API configuration throughout components.

Components should not contain large amounts of API/business logic.

---

## 17. Environment Variables

Secrets must never be hardcoded.

Examples:

```text
MONGODB_URI
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CLERK_WEBHOOK_SECRET
CLOUDINARY_API_KEY
```

Environment files containing secrets must not be committed.

Use `.env.example` to document required variables without exposing values.

Example:

```env
MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 18. Security

Never:

- commit secrets
- trust client-side authorization
- expose private API keys
- log passwords or tokens
- return unnecessary sensitive data
- blindly trust uploaded files
- trust raw third-party webhook payloads

Security checks must happen on the server.

---

## 19. Webhooks

Webhook handlers must be designed with the assumption that events can be:

- retried
- duplicated
- delayed
- received out of order

Webhook processing should therefore be idempotent where required.

Webhook signatures must be verified before processing.

External event IDs should be used to prevent duplicate processing where appropriate.

---

## 20. AI-Specific Standards

AI functionality must follow stricter validation rules.

Never trust raw LLM output.

Expected flow:

```text
User Input
    ↓
Validation
    ↓
AI Service
    ↓
LLM
    ↓
Structured Output
    ↓
Schema Validation
    ↓
Business Validation
    ↓
Application Response
```

AI-generated content must not automatically become trusted LMS data.

For example:

```text
AI Question Generation
        ↓
Instructor Review
        ↓
Approval
        ↓
Question Bank
```

AI should assist users rather than silently making important business decisions.

---

## 21. Logging

Logs should provide useful operational information without exposing sensitive data.

Good:

```text
Course creation failed for courseId=123
```

Bad:

```text
User password: ...
JWT token: ...
Stripe secret: ...
```

Use appropriate log levels:

```text
INFO
WARN
ERROR
DEBUG
```

Production logging will be standardized as observability is introduced.

---

## 22. Comments

Write comments that explain why something exists, not what obvious code is doing.

Bad:

```js
// Find user
const user = await User.findById(userId);
```

Better:

```js
// Clerk user IDs are used as the MongoDB User document IDs.
const user = await User.findById(userId);
```

Avoid comments that simply restate the code.

---

## 23. Formatting and Linting

The project should use automated formatting and linting.

Before submitting a PR:

```bash
npm run lint
```

Code should not be committed with known lint errors unless explicitly documented.

Formatting should be automated rather than manually enforced during code review.

---

## 24. Testing Expectations

New business logic should include tests.

At minimum, important services and critical workflows should have automated tests.

Critical LMS workflows include:

- authentication
- course creation
- enrollment
- payments
- course progress
- assessments
- AI functionality

Tests should verify behavior rather than implementation details.

---

## 25. Git Commit Standards

Use Conventional Commits.

Examples:

```text
feat: add course progress tracking
fix: prevent duplicate enrollment
refactor: extract payment service
test: add course service tests
docs: document API guidelines
chore: configure linting
perf: optimize educator dashboard query
```

Avoid vague commits:

```text
update
changes
final
fix
new code
```

Each commit should represent one coherent change.

---

## 26. Pull Request Standards

Pull requests should:

- have a clear title
- explain what changed
- explain why it changed
- describe testing performed
- identify database/API changes
- identify breaking changes
- avoid unrelated modifications

A PR should be small enough to review confidently.

---

## 27. Definition of Done

A feature is considered complete when:

- requirements are satisfied
- implementation is complete
- validation is implemented
- authorization is verified
- errors are handled
- tests are added where appropriate
- lint passes
- documentation is updated when necessary
- Git changes are focused
- PR review is complete
- CI passes when configured

---

## 28. Engineering Principle

The project will prioritize:

```text
Correctness
    ↓
Security
    ↓
Maintainability
    ↓
Testability
    ↓
Performance
    ↓
Scale
```

New technology should only be introduced when it solves a real problem.

The project will avoid unnecessary complexity, premature abstraction, and feature-driven architectural decisions.