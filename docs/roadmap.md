# LMS Project Roadmap

## 1. Purpose

This roadmap defines the planned evolution of the LMS from its current MVP state toward a production-ready, AI-enabled learning platform.

The roadmap is intentionally incremental.

The project will prioritize:

```text
Foundation
    ↓
Reliability
    ↓
Testing
    ↓
Learning capabilities
    ↓
Analytics
    ↓
AI
    ↓
Production hardening
```

Features should not be implemented simply because they are technically interesting.

Each feature should solve a real learning, educator, administrative, or business problem.

---

## 2. Current Project State

The current LMS provides the foundation for:

- Clerk authentication
- Student and educator workflows
- Course creation
- Course publishing
- Course browsing
- Course enrollment
- Course purchases
- Stripe payments
- Course progress
- Course ratings
- Cloudinary media handling
- Educator dashboard functionality

The current architecture is suitable for continued development but requires engineering hardening before production-scale usage.

---

# 3. Phase 0 — Engineering Baseline

## Objective

Establish project governance, documentation, version control, and development standards.

### Completed

- Git repository initialized
- Initial baseline commit created
- `main` branch established
- `develop` branch established
- GitHub remote configured
- Branch protection configured
- Architecture documented
- Coding standards documented
- Development workflow documented
- Testing strategy documented
- API guidelines documented

### Status

```text
COMPLETE
```

---

# 4. Phase 1 — Testing Foundation

## Priority

P0

## Objective

Create automated testing infrastructure before performing major backend refactoring.

### Features

- Backend test runner
- Test configuration
- Unit test structure
- Integration test structure
- Test database strategy
- Mocking strategy
- First CI test pipeline

### Initial test targets

```text
Authentication
Authorization
Course services
Purchase services
Course progress
Webhook handling
```

### Definition of Done

- Test runner works locally
- At least one unit test exists
- At least one integration test exists
- Tests can run without production services
- CI executes tests
- Pull Requests report test results

---

# 5. Phase 2 — Backend Reliability

## Priority

P0

## Objective

Improve backend correctness and maintainability without changing product behavior unnecessarily.

### 5.1 Centralized Error Handling

Introduce a consistent error-handling system.

Target:

```text
Controller
    ↓
throw error
    ↓
Error middleware
    ↓
HTTP response
```

Benefits:

- consistent HTTP status codes
- predictable API responses
- reduced duplicated error handling
- easier debugging

---

## 5.2 Request Validation

Introduce schema validation for:

- request bodies
- query parameters
- route parameters
- uploaded files
- sensitive operations

Validation should occur before business logic.

---

## 5.3 Service Layer

Introduce services only where business logic justifies them.

Potential services:

```text
services/
├── courseService.js
├── purchaseService.js
├── enrollmentService.js
├── progressService.js
└── paymentService.js
```

The goal is not to create unnecessary abstractions.

---

## 5.4 Authentication and Authorization Hardening

Improve:

- authentication enforcement
- educator authorization
- resource ownership checks
- protected routes
- authorization tests

Clerk remains the authentication provider unless a future requirement clearly justifies changing it.

---

## 5.5 Webhook Reliability

Improve Clerk and Stripe webhook processing.

Requirements:

- signature verification
- idempotency
- duplicate event protection
- safe retries
- error handling
- structured logging

---

# 6. Phase 3 — Payment and Enrollment Reliability

## Priority

P0

## Objective

Make course purchases and access control reliable.

### Payment improvements

- Correct monetary calculations
- Store payment provider identifiers
- Improve Stripe event handling
- Handle failed payments
- Handle retries
- Prevent duplicate processing
- Improve purchase state management

### Enrollment improvements

The current system stores enrollment relationships in multiple locations.

The target architecture should establish a clear source of truth.

Potential future model:

```text
Enrollment
├── userId
├── courseId
├── purchaseId
├── status
├── enrolledAt
└── completedAt
```

The exact schema will be designed after testing and payment flows are understood.

---

# 7. Phase 4 — Course and Learning Model

## Priority

P0/P1

## Objective

Create a stronger foundation for learning functionality.

Current structure:

```text
Course
 └── Chapter
      └── Lecture
```

Future learning capabilities may require:

```text
Course
 ├── Module
 │    ├── Lesson
 │    ├── Resource
 │    ├── Assessment
 │    └── Assignment
 │
 └── Instructor
```

The existing embedded course structure should not be replaced automatically.

Any restructuring must be justified by actual product requirements and migration considerations.

---

# 8. Phase 5 — Progress and Learning Activity

## Priority

P1

## Objective

Turn basic lecture completion into meaningful learning progress data.

Current progress:

```text
userId
courseId
lectureCompleted
completed
```

Future progress may include:

```text
completion percentage
lecture completion
time spent
last activity
learning streak
assessment performance
attempt history
course completion
```

Potential future model:

```text
LearningActivity
├── userId
├── courseId
├── lessonId
├── activityType
├── duration
├── timestamp
└── metadata
```

This data will eventually support analytics and personalization.

---

# 9. Phase 6 — Assessment Engine

## Priority

P1

## Objective

Introduce structured assessment capabilities.

### Planned capabilities

- Question bank
- Multiple-choice questions
- True/false questions
- Short-answer questions
- Assessment creation
- Assessment publishing
- Student attempts
- Answer recording
- Automatic scoring
- Attempt history
- Assessment results

Potential entities:

```text
Question
Assessment
AssessmentAttempt
Answer
```

---

## 9.1 Assessment Flow

```text
Educator
    ↓
Create Assessment
    ↓
Add Questions
    ↓
Publish
    ↓
Student Attempts
    ↓
Submit Answers
    ↓
Evaluate
    ↓
Store Result
    ↓
Learning Analytics
```

---

# 10. Phase 7 — Learning Analytics

## Priority

P1

## Objective

Provide meaningful insight into learner and course performance.

### Student analytics

- Course completion
- Learning time
- Assessment scores
- Weak topics
- Progress trends
- Learning activity

### Educator analytics

- Course completion rate
- Student engagement
- Assessment performance
- Drop-off points
- Popular content
- Student progress

### Analytics architecture

```text
Learning Activity
       ↓
Data Processing
       ↓
Aggregated Metrics
       ↓
Analytics API
       ↓
Dashboard
```

Analytics calculations should remain deterministic.

AI should not be responsible for calculating basic metrics.

---

# 11. Phase 8 — Search and Content Retrieval

## Priority

P1/P2

## Objective

Make LMS content easier to discover and prepare the platform for grounded AI.

Initial capabilities:

- Course search
- Lesson search
- Filtering
- Sorting
- Content metadata

Later:

```text
Course Content
      ↓
Chunking
      ↓
Embeddings
      ↓
Vector Store
      ↓
Semantic Retrieval
```

This retrieval layer will support AI features.

---

# 12. Phase 9 — AI Foundation

## Priority

P2

## Objective

Introduce AI through a controlled service architecture.

AI should not be directly embedded inside controllers.

Target:

```text
AI Controller
      ↓
AI Service
      ↓
Provider Adapter
      ↓
LLM Provider
```

Potential providers may include:

- OpenAI
- Google Gemini
- Anthropic
- Other compatible providers

The project should avoid hard-coding the entire application to one provider when practical.

---

## 12.1 AI Provider Abstraction

Potential interface:

```text
AIService
├── generateText()
├── generateStructuredOutput()
├── generateEmbedding()
└── moderateContent()
```

Provider-specific implementation should remain isolated.

---

# 13. Phase 10 — AI Tutor

## Priority

P2

## Objective

Provide students with an AI assistant grounded in their enrolled course content.

### Example

Student asks:

> Explain this concept from the current lecture.

Flow:

```text
Student
   ↓
AI Tutor API
   ↓
Authentication
   ↓
Course Access Check
   ↓
Retrieve Relevant Content
   ↓
Prompt Construction
   ↓
LLM
   ↓
Output Validation
   ↓
Response
```

The AI should prefer available course content rather than inventing unsupported information.

---

## 13.1 AI Tutor Requirements

- authenticated access
- course access authorization
- content retrieval
- conversation context
- prompt management
- output validation
- rate limiting
- token/cost controls
- logging
- evaluation

---

# 14. Phase 11 — AI Question Generator

## Priority

P2

## Objective

Help educators generate assessment questions from course content.

Flow:

```text
Educator
    ↓
Select Course/Lesson
    ↓
AI Generation
    ↓
Structured Questions
    ↓
Validation
    ↓
Instructor Review
    ↓
Approval
    ↓
Question Bank
```

AI-generated questions should never automatically become published assessments without appropriate review.

---

# 15. Phase 12 — AI Learning Recommendations

## Priority

P2/P3

## Objective

Use learning activity and assessment performance to recommend useful learning actions.

Examples:

```text
"You should review Module 3 before attempting the final assessment."

"You may benefit from revisiting asynchronous JavaScript."

"You have improved your assessment score by 18%."
```

The recommendation system should use deterministic learning data first.

AI can transform structured insights into natural-language recommendations.

---

# 16. Phase 13 — AI Performance Insights

## Priority

P3

## Objective

Provide educators with AI-assisted summaries of learner and course performance.

Example:

```text
Course Analytics
      ↓
Aggregated Metrics
      ↓
AI Analysis
      ↓
Instructor Summary
```

Possible output:

- strongest topics
- weak topics
- student engagement patterns
- assessment difficulty indicators
- content drop-off points

AI-generated insights should always be traceable to underlying metrics.

---

# 17. Phase 14 — Production Hardening

## Priority

P0/P1/P2 throughout development

Production hardening is not a single final phase.

It should happen continuously.

### Security

- authentication hardening
- authorization
- rate limiting
- input validation
- secure headers
- CORS configuration
- secret management
- file upload security
- webhook verification

### Performance

- database indexes
- query optimization
- caching where justified
- API response optimization
- frontend bundle optimization

### Reliability

- structured logging
- health checks
- error tracking
- monitoring
- graceful shutdown
- retry strategies

---

# 18. Phase 15 — Observability

## Priority

P1/P2

## Objective

Understand what is happening in development and production.

Required capabilities:

```text
Logs
Metrics
Errors
Traces
Health Checks
Alerts
```

Potential tools may include:

- Sentry
- OpenTelemetry
- application logging
- cloud monitoring services

The final toolset should be selected based on deployment architecture and project requirements.

---

# 19. Phase 16 — CI/CD

## Priority

P1

## Objective

Automate quality checks and deployment.

Target pipeline:

```text
Pull Request
    ↓
Install Dependencies
    ↓
Lint
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Build
    ↓
Security Checks
    ↓
Merge
```

Deployment pipeline:

```text
develop
    ↓
Staging
    ↓
Validation
    ↓
main
    ↓
Production
```

---

# 20. Feature Priority Matrix

| Feature                    | Priority | Phase |
| --------------------------- | -------- | ----- |
| Testing foundation         | P0       | 1     |
| Error handling              | P0       | 2     |
| Request validation          | P0       | 2     |
| Auth hardening               | P0       | 2     |
| Webhook reliability         | P0       | 2     |
| Payment hardening           | P0       | 3     |
| Enrollment source of truth  | P0/P1    | 3     |
| Progress redesign            | P1       | 5     |
| Assessment engine            | P1       | 6     |
| Learning analytics           | P1       | 7     |
| Search/retrieval             | P1/P2    | 8     |
| AI foundation                 | P2       | 9     |
| AI Tutor                       | P2       | 10    |
| AI Question Generator          | P2       | 11    |
| AI Recommendations            | P2/P3    | 12    |
| AI Performance Insights       | P3       | 13    |
| Observability                  | P1/P2    | 15    |
| CI/CD                            | P1       | 16    |

---

# 21. AI Development Rules

AI features must follow these rules:

1. Do not expose provider API keys to the frontend.
2. Validate user input before sending it to an LLM.
3. Authorize access to LMS content before retrieval.
4. Prefer grounded responses for course-specific questions.
5. Validate structured AI output.
6. Do not blindly persist AI-generated content.
7. Track AI usage and cost.
8. Apply rate limits.
9. Evaluate AI behavior with representative test cases.
10. Monitor hallucination and grounding failures.
11. Protect sensitive learner information.
12. Keep provider-specific code isolated.
13. Provide graceful fallback behavior when AI services fail.

---

# 22. Development Checkpoints

Each major phase should have a checkpoint.

## Checkpoint A — Foundation

Confirm:

```text
Git
Documentation
Testing
CI
```

## Checkpoint B — Reliability

Confirm:

```text
Auth
Validation
Errors
Webhooks
Payments
```

## Checkpoint C — Learning

Confirm:

```text
Enrollment
Progress
Assessments
Analytics
```

## Checkpoint D — AI

Confirm:

```text
AI architecture
Retrieval
AI Tutor
Evaluation
Cost controls
```

## Checkpoint E — Production

Confirm:

```text
Security
Performance
Monitoring
Deployment
Backup/recovery
```

No major phase should begin until the previous phase meets its agreed Definition of Done.

---

# 23. Scope Control

The project should avoid uncontrolled feature expansion.

Every new feature should answer:

1. What user problem does this solve?
2. Who benefits?
3. What data does it require?
4. What APIs are required?
5. What security risks exist?
6. What testing is required?
7. What operational cost does it introduce?
8. Does it affect the existing architecture?
9. Is it more important than current roadmap work?

If these questions cannot be answered clearly, the feature should not immediately enter development.

---

# 24. Roadmap Execution Strategy

Development should proceed in vertical slices.

Example:

```text
Feature:
Course Progress

Step 1
Database

Step 2
Service

Step 3
API

Step 4
Tests

Step 5
Frontend

Step 6
Integration

Step 7
Documentation
```

Each slice should be independently testable.

Avoid building large disconnected layers that cannot be validated until the end.

---

# 25. Change Management

Architectural changes should be introduced through Pull Requests.

For significant decisions, document:

```text
Problem
Options
Decision
Reasoning
Trade-offs
Consequences
```

Large architectural changes should not be introduced casually inside unrelated feature PRs.

---

# 26. Definition of Done for Roadmap Phases

A phase is complete when:

- planned functionality is implemented
- critical tests pass
- known security issues are addressed
- APIs are documented
- relevant monitoring exists
- technical debt created by the phase is recorded
- PRs are reviewed and merged
- deployment impact is understood
- the next phase has a clear starting point

---

# 27. Current Recommended Execution Order

The immediate execution plan is:

```text
1. Complete engineering documentation
        ↓
2. Testing infrastructure
        ↓
3. CI pipeline
        ↓
4. Error handling
        ↓
5. Validation
        ↓
6. Authentication/authorization hardening
        ↓
7. Webhook reliability
        ↓
8. Payment/enrollment hardening
        ↓
9. Progress redesign
        ↓
10. Assessment engine
        ↓
11. Learning analytics
        ↓
12. Search/retrieval
        ↓
13. AI foundation
        ↓
14. AI Tutor
        ↓
15. AI question generation
        ↓
16. AI recommendations
        ↓
17. Production hardening
        ↓
18. Production release
```

This order is intentionally conservative.

The AI features are valuable, but they should be built on reliable authentication, learning data, assessments, retrieval, testing, and observability.

---

# 28. Success Criteria

The LMS will be considered production-ready when it can demonstrate:

```text
Reliable authentication
        +
Secure authorization
        +
Reliable payments
        +
Consistent enrollment
        +
Accurate progress
        +
Working assessments
        +
Useful analytics
        +
Test coverage of critical workflows
        +
CI/CD
        +
Monitoring
        +
Secure AI integration
```

The objective is not to add the most features. The objective is to build a reliable LMS whose features are useful, testable, secure, observable, and maintainable.