# Testing Strategy

## 1. Purpose

This document defines the testing strategy for the LMS project.

The goal is to detect defects early, protect existing functionality during refactoring, and provide confidence when introducing new LMS and AI capabilities.

Testing will be introduced incrementally rather than attempting to build the entire test suite at once.

---

## 2. Testing Principles

The project follows these principles:

1. Test behavior rather than implementation details.
2. Prioritize critical business logic.
3. Keep tests deterministic.
4. Keep tests isolated where practical.
5. Test failure paths, not only successful paths.
6. Avoid unnecessary mocking.
7. Run automated tests before merging.
8. Add regression tests when fixing bugs.
9. Keep test data controlled and predictable.
10. Critical payment, authentication, authorization, and enrollment flows require stronger test coverage.

---

## 3. Testing Pyramid

The project will follow a testing pyramid:

```text
                 ┌───────────────┐
                 │  E2E Tests    │
                 │   Few         │
                 └───────┬───────┘
                         │
                 ┌───────▼───────┐
                 │ Integration   │
                 │    Tests      │
                 │   Moderate    │
                 └───────┬───────┘
                         │
              ┌──────────▼──────────┐
              │    Unit Tests       │
              │       Many          │
              └─────────────────────┘
```

### Unit tests

Test isolated business logic.

Examples:

- course price calculation
- progress calculation
- validation
- authorization helpers
- service functions

### Integration tests

Test multiple application components together.

Examples:

- route → middleware → controller → database
- course creation
- enrollment
- progress updates
- authentication-protected endpoints

### End-to-end tests

Test complete user workflows.

Examples:

```text
Student login
    ↓
Browse course
    ↓
Purchase course
    ↓
Access course
    ↓
Complete lecture
    ↓
View progress
```

E2E tests should remain focused on high-value workflows.

---

## 4. Current Testing Status

The current project does not yet have a complete automated testing infrastructure.

Testing infrastructure will therefore be introduced before major production-oriented refactoring.

The initial goal is to establish:

```text
Test runner
    ↓
Test configuration
    ↓
First passing test
    ↓
CI execution
```

---

## 5. Backend Testing

The backend should eventually contain tests for:

```text
server/
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

The exact test runner and supporting libraries will be selected during implementation based on the existing Node.js/ES Module setup.

---

## 6. Backend Unit Tests

Unit tests should cover business logic that can be tested independently.

Examples:

```text
Course service
Purchase service
Enrollment service
Progress service
Validation
Authorization
Utility functions
```

Example:

```js
describe('calculateCoursePrice', () => {
    it('applies the course discount correctly', () => {
        // test
    });
});
```

Tests should verify both expected and invalid inputs.

---

## 7. Backend Integration Tests

Integration tests should verify API behavior.

Example:

```text
POST /api/course/create
        ↓
Authentication
        ↓
Authorization
        ↓
Validation
        ↓
Controller
        ↓
Database
        ↓
Response
```

Important integration tests include:

- authenticated requests
- unauthorized requests
- educator authorization
- invalid course data
- missing resources
- database persistence
- duplicate operations

---

## 8. Authentication Tests

Authentication and authorization are security-sensitive.

Tests should verify:

### Authentication

- authenticated user succeeds
- unauthenticated user is rejected
- invalid authentication context is rejected

### Authorization

- student cannot access educator-only operations
- educator can access educator operations
- users cannot modify another user's protected resources

Never rely exclusively on frontend route protection.

---

## 9. Course Tests

Important course scenarios include:

```text
Create course
Update course
Publish course
Unpublish course
Retrieve course
Retrieve published courses
Reject invalid course
Reject unauthorized course modification
```

Tests should cover both successful and failed operations.

---

## 10. Enrollment Tests

Enrollment is a critical business workflow.

Tests should verify:

```text
Purchase completed
      ↓
Enrollment created
      ↓
Student receives course access
```

Also verify:

- duplicate enrollment prevention
- invalid course handling
- invalid user handling
- unauthorized access
- failed payment does not grant access

---

## 11. Payment Tests

Payment logic requires special care.

Tests should cover:

```text
Pending purchase
Successful payment
Failed payment
Duplicate webhook
Invalid webhook signature
Missing purchase
Missing course
Missing user
```

Payment tests should never use real production transactions.

Use Stripe test/sandbox mechanisms or mocked external interactions where appropriate.

---

## 12. Webhook Tests

Webhook handlers must be tested as unreliable external inputs.

Tests should verify:

```text
Valid webhook
Invalid signature
Duplicate webhook
Malformed payload
Unknown event
Missing related record
Retry behavior
```

The system must not grant course access based solely on an unverified webhook.

---

## 13. Course Progress Tests

Progress tests should verify:

```text
Lecture completion
Repeated lecture completion
Course completion
Invalid lecture
Unauthorized progress update
Progress retrieval
```

Future progress tracking will also test:

```text
Time spent
Learning activity
Assessment performance
Completion percentage
```

---

## 14. Frontend Testing

Frontend testing should focus on user-visible behavior.

Important areas include:

```text
Authentication state
Course browsing
Course details
Course player
Course progress
Educator dashboard
Course creation
Purchase flow
Error states
Loading states
```

Avoid testing implementation details such as exact internal component state when user behavior provides a better test boundary.

---

## 15. End-to-End Testing

E2E tests should cover the most important business workflows.

Priority workflow:

```text
Student
  ↓
Authentication
  ↓
Course discovery
  ↓
Course details
  ↓
Purchase
  ↓
Enrollment
  ↓
Course player
  ↓
Lecture completion
  ↓
Progress
```

Educator workflow:

```text
Educator
  ↓
Authentication
  ↓
Create course
  ↓
Upload content
  ↓
Publish course
  ↓
View enrolled students
```

---

## 16. Test Data

Test data must be isolated from development and production data.

Never run automated tests against the production database.

Test environments should use dedicated:

```text
Database
API credentials
Cloud services
Webhook configuration
Authentication configuration
```

Test fixtures should be deterministic and reproducible.

---

## 17. Regression Testing

Every production bug should result in a regression test when practical.

Workflow:

```text
Bug
 ↓
Reproduce
 ↓
Write failing test
 ↓
Fix bug
 ↓
Test passes
 ↓
Commit
```

Example:

```text
Bug:
Duplicate Stripe webhook creates duplicate enrollment.

Regression test:
Repeated webhook event must not create another enrollment.
```

---

## 18. AI Testing

AI functionality requires additional evaluation beyond traditional unit tests.

AI tests should evaluate:

### Correctness

Does the response answer the intended question?

### Grounding

Does the response rely on the supplied course content when required?

### Hallucination resistance

Does the system avoid inventing information that is not supported by the available content?

### Safety

Does the system avoid inappropriate or unsafe behavior?

### Structured output

Does the model return the required schema?

### Cost

Does the request remain within expected token and API cost limits?

### Latency

Does the response meet the expected performance target?

Example:

```text
Student Question
      ↓
Retrieve course content
      ↓
AI response
      ↓
Evaluate:
- relevance
- grounding
- correctness
- format
- latency
- cost
```

AI evaluation cases should be maintained as the AI system evolves.

---

## 19. Test Naming

Test names should describe behavior.

Good:

```js
it('rejects course creation when the user is not an educator', () => {});
```

Good:

```js
it('does not create duplicate enrollment when the same payment webhook is received twice', () => {});
```

Avoid:

```js
it('test function', () => {});
```

---

## 20. Test Isolation

Tests should not depend on the execution order of other tests.

Avoid shared mutable state.

Each test should establish the data it needs or use controlled fixtures.

---

## 21. Mocking Strategy

Mock external systems when testing application behavior that does not require the real service.

Potential external systems:

```text
Clerk
Stripe
Cloudinary
LLM providers
Email providers
```

However, excessive mocking should be avoided.

At least some integration tests should verify important boundaries realistically.

---

## 22. CI Testing

Once GitHub Actions is configured, every Pull Request should run automated checks.

Expected flow:

```text
Pull Request
     ↓
Install dependencies
     ↓
Lint
     ↓
Unit tests
     ↓
Integration tests
     ↓
Build
     ↓
PR status
```

A Pull Request should not be merged when required CI checks fail.

---

## 23. Test Coverage

Coverage is a useful signal but not the primary goal.

The project should prioritize coverage of:

- authentication
- authorization
- payments
- enrollment
- course access
- progress
- assessments
- critical AI workflows

A high percentage of meaningless tests is less valuable than strong tests around critical behavior.

---

## 24. Definition of Test Completion

A feature is considered adequately tested when:

- happy paths are covered
- important failure paths are covered
- authorization is tested
- validation is tested
- critical side effects are tested
- regression cases are included
- relevant frontend behavior is tested
- CI checks pass

---

## 25. Testing Principle

The goal of testing is not to prove that the code works once.

The goal is to make future changes safer.

```text
Change
  ↓
Tests
  ↓
Confidence
  ↓
Review
  ↓
Merge
  ↓
Deploy
```

Tests are therefore treated as part of the feature, not as an optional task after implementation.