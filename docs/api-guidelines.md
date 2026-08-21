# API Guidelines

## 1. Purpose

This document defines the API conventions for the LMS backend.

The goal is to provide APIs that are predictable, secure, consistent, testable, and easy for the React client and future external consumers to use.

These guidelines apply to current and future REST API endpoints.

---

## 2. Current API Structure

The current backend exposes the following primary route groups:

```text
/api/user
/api/course
/api/educator
```

Webhook endpoints are currently exposed separately:

```text
/clerk
/stripe
```

Future API changes should preserve clear separation between application APIs and external webhook endpoints.

---

## 3. Resource-Oriented URLs

API URLs should represent resources rather than actions where practical.

Prefer:

```text
GET /api/courses
GET /api/courses/:courseId
POST /api/courses
PATCH /api/courses/:courseId
DELETE /api/courses/:courseId
```

Avoid unnecessarily action-oriented URLs such as:

```text
GET /api/getAllCourses
POST /api/createCourse
POST /api/deleteCourse
```

Existing routes do not need to be rewritten immediately.

Changes should be introduced incrementally when the related feature is being modified.

---

## 4. HTTP Methods

Use HTTP methods according to their intended purpose.

### GET

Retrieve resources.

```text
GET /api/courses
GET /api/courses/:courseId
```

### POST

Create resources or perform operations that are not naturally represented as resource replacement.

```text
POST /api/courses
POST /api/purchases
```

### PUT

Replace a resource when full replacement semantics are appropriate.

### PATCH

Partially update a resource.

```text
PATCH /api/courses/:courseId
```

### DELETE

Delete or deactivate a resource.

```text
DELETE /api/courses/:courseId
```

---

## 5. HTTP Status Codes

APIs should use meaningful HTTP status codes.

Common statuses:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

Examples:

```text
GET /api/courses/:id
→ 200 when found

GET /api/courses/:id
→ 404 when not found

POST /api/courses
→ 201 when successfully created

Unauthenticated request
→ 401

Authenticated but unauthorized request
→ 403
```

---

## 6. Response Structure

The API should use a consistent response structure.

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Collection

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

The exact response contract may evolve as the API is hardened.

---

## 7. Request Validation

Every externally supplied value should be validated before business logic executes.

Validate:

```text
Request body
Query parameters
Route parameters
Headers when applicable
Uploaded files
Webhook payloads
External API data
```

Example:

```text
POST /api/courses

Request
  ↓
Schema validation
  ↓
Authentication
  ↓
Authorization
  ↓
Business logic
```

Validation errors should produce a client-understandable response.

---

## 8. Authentication

Protected APIs must verify the authenticated user on the server.

The project currently uses Clerk.

The client must not be treated as the source of truth for identity.

Bad:

```text
Client says:
"I am educator."
```

Good:

```text
Server verifies Clerk identity
        ↓
Server determines user identity
        ↓
Server checks authorization
```

---

## 9. Authorization

Authentication and authorization are separate concerns.

Example:

```text
Authentication
    ↓
Who is this user?

Authorization
    ↓
Can this user perform this action?
```

Examples:

```text
Student
→ Can access enrolled course

Student
→ Cannot create educator courses

Educator
→ Can manage permitted courses

User
→ Cannot modify another user's protected data
```

Authorization must always be enforced server-side.

---

## 10. Resource Ownership

When an API modifies a resource, the server must verify that the requesting user has permission to modify it.

Example:

```text
PATCH /api/courses/:courseId
```

The server should verify:

```text
Authenticated user
      ↓
Course exists
      ↓
User is authorized to modify course
      ↓
Update course
```

Never rely on a client-provided owner ID alone.

---

## 11. Pagination

Collection endpoints should support pagination when datasets can become large.

Preferred parameters:

```text
?page=1&limit=20
```

Example:

```text
GET /api/courses?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The API should enforce reasonable maximum limits.

For example:

```text
limit <= 100
```

The exact limit should be defined based on actual application requirements.

---

## 12. Filtering

Filtering should use query parameters.

Example:

```text
GET /api/courses?published=true
```

Multiple filters may be supported when useful:

```text
GET /api/courses?published=true&educatorId=123
```

Filters must be validated and restricted to supported fields.

---

## 13. Sorting

Sorting should use explicit query parameters.

Example:

```text
GET /api/courses?sort=createdAt&order=desc
```

Only approved sortable fields should be accepted.

The server must not blindly pass arbitrary client values into database queries.

---

## 14. Searching

Search parameters should be explicit.

Example:

```text
GET /api/courses?search=javascript
```

Search implementation may initially use MongoDB capabilities.

Future search requirements may introduce dedicated search infrastructure.

---

## 15. Route Parameters

Use route parameters for resource identifiers.

Example:

```text
GET /api/courses/:courseId
```

The API should validate the identifier before querying the database.

Invalid identifiers should return a meaningful client error rather than an unhandled database exception.

---

## 16. Error Handling

Errors should be handled consistently.

Avoid returning successful HTTP status codes for failed requests.

Bad:

```text
HTTP 200
{
  "success": false
}
```

Preferred:

```text
HTTP 404
{
  "success": false,
  "message": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

Internal errors should not expose sensitive implementation details.

Bad:

```text
{
  "message": "MongoServerError: ..."
}
```

Production responses should expose safe, useful information while detailed errors are recorded in server logs.

---

## 17. API Error Codes

Stable error codes should be introduced for important application errors.

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
COURSE_NOT_FOUND
COURSE_ACCESS_DENIED
INVALID_COURSE_DATA
PURCHASE_NOT_FOUND
PAYMENT_FAILED
ENROLLMENT_EXISTS
RESOURCE_NOT_FOUND
VALIDATION_ERROR
INTERNAL_ERROR
```

Error codes make frontend behavior more reliable than matching human-readable messages.

---

## 18. Webhook APIs

Webhook endpoints are different from normal application APIs.

Current endpoints:

```text
POST /clerk
POST /stripe
```

Webhook handlers must:

1. Verify the webhook signature.
2. Validate the event.
3. Determine whether the event has already been processed.
4. Process the event safely.
5. Avoid duplicate side effects.
6. Return an appropriate response.

Webhook endpoints must not trust arbitrary requests from clients.

---

## 19. AI APIs

Future AI endpoints should be treated as application services rather than direct proxy endpoints to an LLM provider.

Preferred architecture:

```text
React
  ↓
POST /api/ai/...
  ↓
Authentication
  ↓
Authorization
  ↓
Input validation
  ↓
AI Service
  ↓
Retrieval / Business Logic
  ↓
LLM Provider
  ↓
Output validation
  ↓
Response
```

Example future endpoint:

```text
POST /api/ai/tutor
```

Request:

```json
{
  "courseId": "course-id",
  "lectureId": "lecture-id",
  "question": "Explain this concept."
}
```

The server must verify that the student has permission to access the referenced course content.

The AI provider must never be called directly from the browser using a private API key.

---

## 20. API Principle

The API should optimize for:

```text
Consistency
Security
Correctness
Testability
Maintainability
```

The API should not expose internal implementation details unnecessarily.

When introducing a new endpoint, ask:

1. Is the resource clearly defined?
2. Is authentication required?
3. Is authorization required?
4. Is input validated?
5. Are errors handled?
6. Is the response consistent?
7. Is the endpoint tested?
8. Does the endpoint introduce a breaking change?
9. Does the endpoint need documentation?
10. Does the endpoint create security, performance, or cost concerns?

Every new API should be designed with these questions in mind.