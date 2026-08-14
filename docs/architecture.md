# LMS Architecture

## 1. Overview

This document describes the current architecture of the LMS full-stack application.

The application is built using the MERN stack with Clerk for authentication, Stripe for payments, and Cloudinary for media storage.

The current architecture is intentionally documented as it exists today. Future architectural improvements will be documented separately and introduced through incremental changes.

---

## 2. Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Clerk React
- React Toastify

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- Clerk Express
- Stripe
- Cloudinary
- Multer
- Svix

### Authentication

Clerk is responsible for user authentication.

The Clerk user ID is used as the `_id` of the corresponding MongoDB `User` document.

### Payments

Stripe is used to process course purchases.

### Media Storage

Cloudinary is used for course thumbnail/media storage.

---

## 3. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │     React Client    │
                    │      (Vite)         │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │    Express API      │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
              Clerk Middleware       API Routes
                                          │
                         ┌────────────────┼────────────────┐
                         │                │                │
                         ▼                ▼                ▼
                     User Routes     Course Routes    Educator Routes
                         │                │                │
                         ▼                ▼                ▼
                    Controllers       Controllers      Controllers
                         │                │                │
                         └────────────────┼────────────────┘
                                          │
                                          ▼
                                  Mongoose Models
                                          │
                                          ▼
                                      MongoDB
```

External integrations:

```text
Clerk       → Authentication and user lifecycle
Stripe      → Payments and payment webhooks
Cloudinary  → Media storage
Svix        → Clerk webhook verification
```

---

## 4. Backend Structure

Current backend structure:

```text
server/
├── configs/
│   ├── cloudinary.js
│   ├── mongodb.js
│   └── multer.js
│
├── controllers/
│   ├── courseController.js
│   ├── educatorController.js
│   ├── userController.js
│   └── webhooks.js
│
├── middlewares/
│   └── authMiddleware.js
│
├── models/
│   ├── Course.js
│   ├── CourseProgress.js
│   ├── Purchase.js
│   └── User.js
│
├── routes/
│   ├── courseRoute.js
│   ├── educatorRoutes.js
│   └── userRoutes.js
│
└── server.js
```

---

## 5. Frontend Structure

Current frontend structure:

```text
client/
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── assets/
    ├── components/
    │   ├── educator/
    │   └── student/
    ├── context/
    │   └── AppContext.jsx
    └── pages/
        ├── educator/
        │   ├── AddCourse.jsx
        │   ├── Dashboard.jsx
        │   ├── Educator.jsx
        │   ├── MyCourses.jsx
        │   └── StudentsEnrolled.jsx
        │
        └── student/
            ├── CourseDetails.jsx
            ├── CoursesList.jsx
            ├── Home.jsx
            ├── MyEnrollments.jsx
            └── Player.jsx
```

---

## 6. Current Data Model

The current MongoDB models are:

```text
User
 ├── name
 ├── email
 ├── imageUrl
 └── enrolledCourses

Course
 ├── courseTitle
 ├── courseDescription
 ├── courseThumbnail
 ├── coursePrice
 ├── discount
 ├── courseContent
 │    └── chapters
 │         └── lectures
 ├── educator
 ├── courseRatings
 └── enrolledStudents

CourseProgress
 ├── userId
 ├── courseId
 ├── completed
 └── lectureCompleted

Purchase
 ├── courseId
 ├── userId
 ├── amount
 └── status
```

---

## 7. Current Request Flow

### Student request

```text
React
  ↓
Axios/API request
  ↓
Express
  ↓
Clerk middleware
  ↓
User/Course route
  ↓
Controller
  ↓
Mongoose model
  ↓
MongoDB
  ↓
JSON response
  ↓
React
```

### Educator request

```text
React
  ↓
API request
  ↓
Clerk middleware
  ↓
Educator route
  ↓
protectEducator
  ↓
Educator controller
  ↓
Mongoose
  ↓
MongoDB
```

---

## 8. Current External Service Flow

### Clerk

```text
Clerk
  ↓
Webhook
  ↓
Svix verification
  ↓
clerkWebhooks
  ↓
MongoDB User
```

### Stripe

```text
Student
  ↓
Purchase API
  ↓
Pending Purchase
  ↓
Stripe Checkout
  ↓
Stripe Webhook
  ↓
Purchase status
  ↓
Course/User enrollment
```

### Cloudinary

```text
Educator
  ↓
Course upload
  ↓
Multer
  ↓
Cloudinary
  ↓
Course thumbnail URL
  ↓
MongoDB Course
```

---

## 9. Known Technical Debt

The following issues have been identified during the initial architecture audit.

### TD-001 — Controllers contain business logic

Several controllers currently handle database operations, business rules, and third-party service interactions directly.

Future work may introduce service-layer abstractions where they provide clear value.

### TD-002 — Enrollment has multiple sources of truth

Enrollment information currently exists through User, Course, and Purchase data.

A future enrollment model should establish a clear source of truth.

### TD-003 — Course progress is minimal

The current progress model tracks completed lectures but does not capture richer learning activity.

This limits future analytics and personalization capabilities.

### TD-004 — Webhook reliability

Clerk and Stripe webhook handlers need stronger retry and idempotency handling before production use.

### TD-005 — Centralized error handling

The current API does not yet use a centralized error-handling strategy with consistent HTTP status codes and response formats.

### TD-006 — Request validation

API request validation needs to be strengthened and standardized.

### TD-007 — Testing infrastructure

Automated unit, integration, and end-to-end testing infrastructure needs to be established.

### TD-008 — Database performance

Database indexes and query patterns need to be reviewed before production scaling.

### TD-009 — Payment handling

Payment amount handling, webhook processing, and enrollment updates require additional production hardening.

---

## 10. Architectural Direction

The target architecture will evolve incrementally.

The intended direction is:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models / Data Access
```

External integrations should be isolated behind dedicated modules/services where appropriate.

Potential future structure:

```text
server/
├── configs/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
│   ├── auth/
│   ├── course/
│   ├── payment/
│   └── ai/
├── utils/
└── server.js
```

This is a target direction, not an instruction to immediately refactor the entire codebase.

---

## 11. Future AI Architecture

AI will be introduced only after the LMS data and application foundations are sufficiently stable.

The expected direction is:

```text
React
  ↓
AI API
  ↓
AI Service
  ↓
AI Provider Adapter
  ↓
LLM Provider
```

For course-grounded AI:

```text
Student Question
       ↓
AI Service
       ↓
Retrieval
       ↓
Relevant Course Content
       ↓
Prompt Construction
       ↓
LLM
       ↓
Validated Response
```

The AI system should not replace deterministic application logic.

For example:

- Database queries calculate course completion.
- Business logic determines permissions.
- AI may interpret learning data or generate explanations.

---

## 12. Architectural Principles

The project will follow these principles:

1. Prefer simple solutions over unnecessary abstraction.
2. Do not rewrite working code without a measurable reason.
3. Keep controllers focused on HTTP concerns.
4. Keep business logic testable and isolated.
5. Validate external input.
6. Never trust raw AI output.
7. Treat webhooks as retryable and potentially duplicated.
8. Protect secrets from source control.
9. Add tests alongside behavior changes.
10. Make small, reviewable Git commits.
11. Avoid unrelated changes in feature branches.
12. Document significant architectural decisions.