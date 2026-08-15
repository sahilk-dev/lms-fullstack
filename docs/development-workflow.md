# Development Workflow

## 1. Purpose

This document defines the development workflow for the LMS project.

The goal is to keep development predictable, reviewable, testable, and safe as the application evolves from its current MVP state toward production readiness.

The workflow applies to frontend, backend, database, infrastructure, documentation, and AI-related changes.

---

## 2. Branch Strategy

The project uses three levels of branches.

```text
main
  ↑
develop
  ↑
feature / fix / refactor / docs
```

### main

`main` represents production-ready code.

Rules:

- Direct pushes are prohibited.
- Changes must arrive through a Pull Request.
- CI checks must pass before merging once CI is configured.
- Production deployments originate from `main`.

### develop

`develop` is the integration branch for completed development work.

Rules:

- Direct pushes are prohibited.
- Changes arrive through Pull Requests.
- Features should be integrated here before production release.
- `develop` should remain in a buildable and testable state.

### Working branches

All development work should happen on a short-lived working branch.

Examples:

```text
feature/course-progress
feature/assessment-engine
feature/ai-tutor
fix/stripe-webhook
fix/course-access
refactor/payment-service
docs/api-guidelines
test/course-service
chore/github-actions
```

---

## 3. Branch Naming

Use the following prefixes:

```text
feature/   New functionality
fix/       Bug fixes
refactor/  Code restructuring without intended behavior changes
docs/      Documentation
test/      Testing changes
chore/     Tooling/configuration/maintenance
perf/      Performance improvements
security/  Security-related changes
```

Examples:

```text
feature/assessment-engine
fix/stripe-webhook-idempotency
refactor/course-service
docs/api-guidelines
test/course-progress
chore/setup-ci
perf/educator-dashboard
security/rate-limit-auth
```

Branch names should be:

- lowercase
- descriptive
- short
- focused on one task

Avoid:

```text
new-feature
changes
test
final
my-branch
update-code
```

---

## 4. Starting New Work

Always begin from the latest `develop`.

```bash
git switch develop
git pull origin develop
```

Then create a working branch:

```bash
git switch -c feature/<feature-name>
```

Example:

```bash
git switch -c feature/course-progress
```

Never create a feature branch from an outdated local branch when the work depends on recent changes in `develop`.

---

## 5. Before Making Changes

Before writing code:

1. Understand the requirement.
2. Identify affected modules.
3. Check existing implementation.
4. Identify database/API changes.
5. Identify security implications.
6. Identify testing requirements.
7. Decide whether documentation needs updating.

For larger changes, document the design before implementation.

---

## 6. Keep Changes Focused

A working branch should solve one coherent problem.

Good:

```text
feature/course-progress
```

Contains:

- progress API
- progress service
- progress model changes
- progress tests

Bad:

```text
feature/lms-improvements
```

Contains:

- authentication refactor
- payment changes
- dashboard redesign
- AI integration
- random CSS changes

Unrelated changes make code review and debugging harder.

---

## 7. Commit Strategy

Commits should represent logical units of work.

Use Conventional Commits.

Examples:

```text
feat: add course progress endpoint
fix: prevent duplicate lecture completion
refactor: extract course progress service
test: add course progress service tests
docs: document progress API
chore: configure test environment
```

A commit should ideally be:

- understandable
- focused
- buildable where practical
- easy to review
- easy to revert

Avoid:

```text
update
changes
final
final2
working
misc fixes
```

---

## 8. Commit Frequency

Do not wait until an entire feature is finished before committing.

A reasonable sequence is:

```text
Model
  ↓
commit

Service
  ↓
commit

Controller/API
  ↓
commit

Tests
  ↓
commit

Frontend
  ↓
commit
```

However, do not create meaningless micro-commits for every file change.

The goal is logical history, not maximum commit count.

---

## 9. Inspect Before Committing

Before every commit:

```bash
git status
git diff
```

For staged changes:

```bash
git diff --cached
```

Verify:

- no secrets
- no `.env`
- no `node_modules`
- no unrelated files
- no debugging code
- no accidental changes

Then commit.

---

## 10. Push Working Branches

Push a new branch using:

```bash
git push -u origin <branch-name>
```

For subsequent pushes:

```bash
git push
```

Do not push feature branches directly to `main` or `develop`.

---

## 11. Pull Request Workflow

The standard workflow is:

```text
develop
   ↓
Create working branch
   ↓
Implement
   ↓
Test
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
Review
   ↓
CI
   ↓
Merge into develop
```

For production:

```text
develop
   ↓
Release Pull Request
   ↓
Review
   ↓
CI
   ↓
main
   ↓
Production
```

---

## 12. Pull Request Target

Normal development PR:

```text
base: develop
compare: feature/...
```

Production release PR:

```text
base: main
compare: develop
```

Feature branches should not normally target `main`.

---

## 13. Pull Request Title

Use a clear Conventional Commit-style title.

Examples:

```text
feat: add course progress tracking
fix: make Stripe webhook processing idempotent
refactor: extract payment service
test: add authentication middleware tests
docs: document API standards
```

---

## 14. Pull Request Description

Every meaningful PR should explain:

```text
What changed?

Why was it needed?

How was it implemented?

How was it tested?

Are there database changes?

Are there API changes?

Are there breaking changes?

Are there security considerations?

Are there performance considerations?
```

---

## 15. Pull Request Size

Prefer small PRs.

A feature should be divided when it becomes difficult to review.

Example:

```text
PR #1
Add assessment database models

PR #2
Add assessment service and API

PR #3
Add assessment UI

PR #4
Add assessment analytics
```

Avoid one enormous PR:

```text
"Implement entire assessment system"
```

---

## 16. Code Review

Reviewers should evaluate:

### Correctness

Does the implementation satisfy the requirement?

### Architecture

Does the change fit the existing architecture?

### Security

Can unauthorized users access or modify data?

### Validation

Are external inputs validated?

### Error handling

Are failures handled correctly?

### Performance

Are there unnecessary database queries or expensive operations?

### Testing

Does the test suite cover important behavior?

### Maintainability

Will another developer understand this code?

---

## 17. Handling Review Comments

When review feedback is received:

1. Understand the reason behind the comment.
2. Make the required change.
3. Run relevant tests.
4. Push the new commit.
5. Respond to the review comment.

Do not argue about style when an automated formatter or lint rule can settle the issue.

Technical disagreements should be resolved based on:

- requirements
- correctness
- security
- maintainability
- performance
- project conventions

---

## 18. Updating a Working Branch

Before opening a PR, ensure the branch is current with `develop`.

Preferred approach:

```bash
git fetch origin
git rebase origin/develop
```

If the team chooses merge-based synchronization instead, use:

```bash
git fetch origin
git merge origin/develop
```

The project should use one consistent strategy rather than mixing approaches randomly.

---

## 19. Merge Strategy

For normal feature PRs:

```text
feature branch
      ↓
Pull Request
      ↓
develop
```

The preferred merge method should preserve a readable history.

The exact GitHub merge option will be standardized when repository governance is finalized.

Do not manually rewrite shared branch history.

---

## 20. Branch Cleanup

After a PR is successfully merged:

Delete the remote working branch when it is no longer needed.

Then locally:

```bash
git switch develop
git pull origin develop
git branch -d <branch-name>
```

Short-lived branches should not accumulate indefinitely.

---

## 21. Emergency Fixes

Production-critical fixes may use:

```text
hotfix/<description>
```

Example:

```text
hotfix/stripe-payment-failure
```

The exact hotfix workflow will be documented when production deployment is introduced.

---

## 22. Database Changes

Database changes must be treated carefully.

Before changing a model:

1. Identify existing documents.
2. Determine compatibility with existing data.
3. Identify migration requirements.
4. Consider indexes.
5. Test against representative data.
6. Document breaking changes.

Never assume that changing a Mongoose schema automatically migrates existing MongoDB documents.

---

## 23. API Changes

Before modifying an API:

1. Identify frontend consumers.
2. Identify external consumers if applicable.
3. Determine whether the change is backward compatible.
4. Update validation.
5. Update tests.
6. Update API documentation.

Breaking API changes should be explicitly documented.

---

## 24. Environment Management

Development, staging, and production environments must remain separate.

```text
Development
     ↓
Staging
     ↓
Production
```

Secrets must never be committed to Git.

Use environment variables or a dedicated secret-management system.

---

## 25. Testing Before PR

Before opening a PR, run the appropriate checks.

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```bash
npm test
```

once the backend test script is configured.

For critical features, run integration and end-to-end tests as appropriate.

---

## 26. AI Development Workflow

AI features require additional review.

The workflow is:

```text
Requirement
    ↓
AI use-case definition
    ↓
Prompt/design
    ↓
Input validation
    ↓
AI implementation
    ↓
Output schema validation
    ↓
Evaluation tests
    ↓
Security review
    ↓
Cost/latency review
    ↓
PR
```

AI-generated content must not automatically be trusted.

Examples:

```text
AI question
    ↓
Instructor review
    ↓
Approval
    ↓
Published question
```

and:

```text
Course content
    ↓
Retrieval
    ↓
AI
    ↓
Grounded response
```

---

## 27. AI Prompt Changes

Prompts that affect production behavior should be treated as code changes.

A meaningful prompt change should:

- have a clear commit
- have evaluation cases
- be reviewed
- document expected behavior
- consider token/cost impact

Example:

```text
feat: improve AI tutor explanations
```

or:

```text
test: add AI tutor grounding evaluations
```

---

## 28. No Direct Production Changes

Developers should not manually modify production code or production data as part of normal development.

The expected path is:

```text
Local
 ↓
Pull Request
 ↓
CI
 ↓
Staging
 ↓
Validation
 ↓
Production
```

Emergency production changes must follow the documented incident/hotfix process.

---

## 29. Definition of Done

A development task is complete when:

- implementation is complete
- relevant tests pass
- lint/build checks pass
- security considerations are addressed
- documentation is updated where necessary
- changes are committed cleanly
- PR is reviewed
- CI passes
- PR is merged
- working branch is cleaned up

---

## 30. Golden Rule

Before making a change, understand it.

Before committing, inspect it.

Before merging, test it.

Before deploying, verify it.