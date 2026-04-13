# Milestone Development Document Template (v2)

This template defines the complete structure for a Milestone Development Document. Each section includes guidance on what to include, how detailed to be, and examples of good content.

**Output format:** DOCX via `node scripts/generate_milestone_docx.js --data milestone_data.json --output milestone_1.docx`

**Two modes:**
- **Single Milestone** — Use when you need one specific milestone's execution plan
- **Multi-Milestone** — Pass PRD + ERD context to Milestone Skill; it auto-decomposes the project into 3-6 milestones and generates all docs with cross-milestone data sync

---

## 1. Cover Page

**Required fields:**
- Project name
- Milestone number and name (e.g., "Milestone 2: Core Features")
- Document version (start at 1.0, increment on revisions)
- Date
- Author / Team Lead
- Status badge: `Planning` | `In Progress` | `Complete`
- Team members assigned to this milestone
- Milestone duration (e.g., "Weeks 5-8" or "Sprint 3-4")
- PRD reference version
- ERD reference version

---

## 2. Context: What Was Delivered Before This Milestone

**Purpose:** This section prevents duplicate work and false assumptions. Every developer on this milestone must read it before starting their first task.

**Include:**
- **Previously Completed Milestones** — exact list of what each prior milestone delivered (not vague — specific: "users table migrated", "Clerk auth working", "EP-001 through EP-008 live on staging")
- **Inherited State** — current state of: database schema, API endpoints, environments, auth system, feature flags
- **What This Milestone Inherits** — what shared context (APIs, DB tables, env setup) is already done and ready to use

**Example:**
> **Milestone 1 delivered:**
> - Database: TB-001 (users), TB-002 (projects) tables migrated on staging
> - Auth: Clerk integration complete, JWT validation working, webhook sync creating users on sign-up
> - APIs: EP-001 (register), EP-002 (login), EP-003 (GET /users/me) live and tested
> - Environment: CI/CD pipeline green, staging environment accessible
>
> **This milestone (2) inherits:**
> - Auth system: users can log in and receive JWT tokens
> - Database: users table and RLS policies are stable — do not modify existing columns
> - Staging: all Milestone 1 migrations are applied — your migrations run AFTER these

---

## 3. Milestone Overview

Provide a concise overview of this development milestone.

**Include:**
- **Milestone Goal** — one sentence describing what this milestone achieves
- **Milestone Duration** — start date, end date, total weeks/sprints
- **Team** — names, roles, availability
- **Milestone Scope Summary** — 3-5 bullet points describing what will be delivered
- **Cross-Milestone Relationship** — what Milestone N-1 delivered that this builds on; what Milestone N+1 expects from this milestone

**Example:**
> **Milestone 2: Core Features** (Weeks 5-8)
>
> **Goal:** Build the primary product functionality that delivers the core value proposition to users.
>
> **Team:** Alice (Lead, full-stack), Bob (backend), Charlie (frontend, 80% allocation)
>
> **Delivers:** Feature X screens, Feature Y API, integration with third-party service Z.
>
> **Builds on:** Milestone 1 — auth system, core DB schema, basic CRUD APIs are stable.
>
> **Enables:** Milestone 3 (Integrations & Secondary Features) depends on Feature X APIs being stable.

---

## 4. Tech Stack (This Milestone)

Technology components actively used or configured in this milestone. Do not introduce new technologies without an ADR in the ERD.

**Format:**
| Technology | Version | Purpose | Status | Used For in This Milestone |
|-----------|---------|---------|--------|--------------------------|
| Next.js | 14.x | Frontend + API routes | Stable | All features |
| Supabase PostgreSQL | 15.x | Database | Stable | All data persistence |
| Drizzle ORM | 0.30+ | DB queries | Stable | All DB interactions |
| Clerk | 5.x | Auth | Stable | Auth middleware on all routes |
| Tailwind CSS + shadcn/ui | 3.x | Styling + components | Stable | All UI screens |

---

## 5. Definition of Ready (DoR)

The DoR ensures every backlog item entering this milestone/sprint meets a minimum quality bar. The milestone should NOT begin until all DoR items are satisfied.

### 5a. Backlog Readiness
- [ ] All user stories have written acceptance criteria (Given/When/Then) — Owner: PM
- [ ] Stories are estimated (story points assigned) — Owner: Tech Lead
- [ ] Stories are prioritized (P0-P3) and ordered in backlog — Owner: PM
- [ ] No story exceeds 8 story points (larger stories are broken down) — Owner: Tech Lead

### 5b. Design Readiness
- [ ] UI mockups / wireframes for all in-scope screens are finalized — Owner: Designer
- [ ] Design review completed with engineering team — Owner: Designer + Tech Lead
- [ ] Error states and empty states designed — Owner: Designer

### 5c. Technical Readiness
- [ ] API contracts for this milestone are documented and agreed upon — Owner: Tech Lead
- [ ] Database migration scripts are drafted — Owner: Backend Lead
- [ ] Feature flags for all new features are created (in OFF state) — Owner: DevOps
- [ ] Test environments are accessible with Milestone N-1 data migrated — Owner: DevOps

### 5d. Dependency Readiness
- [ ] All hard dependencies from prior milestones are delivered and verified — Owner: Tech Lead
- [ ] External team deliverables confirmed available — Owner: PM

---

## 6. Milestone Entry Criteria

Prerequisites that MUST be true before this milestone begins.

**Format:** Checkbox list. If any item is false, escalate to tech lead — do not start.

```
- [ ] PRD and ERD documents finalized and reviewed
- [ ] All tasks in this milestone estimated with story points
- [ ] Development environment running locally for all team members
- [ ] Database migrations from Milestone N-1 applied to staging
- [ ] All blocking dependencies from Milestone N-1 confirmed complete
- [ ] Feature flags for this milestone's features created (OFF state)
- [ ] Design mockups approved for all UI features in this milestone
```

---

## 7. Task Breakdown (by Week)

The heart of the Milestone Document. Break the milestone into granular, actionable tasks organized by week.

**Task attributes:**
| Field | Description | Example |
|-------|-------------|---------|
| Task ID | `MS{N}-T{NNN}` | MS2-T001 |
| Task Name | Short descriptive name | "Implement feature X API endpoint" |
| Description | What to build specifically | "Create POST /api/v1/features with Zod validation, Drizzle ORM insert, return 201..." |
| Story Points | Fibonacci: 1/2/3/5/8/13 | 5 |
| Assignee | Developer name | Alice |
| Acceptance Criteria | Given/When/Then format | "Given valid input, When POST /api/v1/features, Then returns 201 with created entity" |
| ERD Reference | Which ERD component | EP-005, TB-003 |
| Status | Todo / In Progress / Done / Blocked | Todo |

**Story Point Reference:** 1SP = trivial (<4h) | 2SP = small (4-8h) | 3SP = medium (~1 day) | 5SP = large (2-3 days) | 8SP = complex (3-5 days) | 13SP = very complex (>5 days, consider splitting)

**Capacity buffer:** Add 20% buffer for unplanned work. If total is 50SP, plan for 60SP capacity.

### Week 1: Setup + Foundation

| Task ID | Task | SP | Assignee | Status | Acceptance Criteria |
|---------|------|----|----------|--------|---------------------|
| MS2-T001 | Write database migration files for this milestone | 2 | Backend | Todo | Given migrations written, When drizzle-kit push, Then tables created without errors |
| MS2-T002 | Create feature flags for all new features | 1 | DevOps | Todo | Given flag tool configured, When flag created, Then toggleable ON/OFF |
| MS2-T003 | Write API endpoint skeletons with Zod validation | 3 | Backend | Todo | Given request, When endpoint called with invalid data, Then returns 400 with field error |

*(Continue for all weeks)*

---

## 8. Task Dependency Map

Visual representation of task dependencies:
- **Critical path** — longest chain of dependent tasks (determines minimum milestone duration)
- **Parallel work streams** — tasks that can run simultaneously
- **Milestones** — key checkpoints within the milestone

**The dependency map answers:**
1. What can start on Day 1? (tasks with no dependencies)
2. What's the critical path?
3. Where can teams parallelize?
4. Where are the bottlenecks?

---

## 9. Environment & Setup Checklist

Everything a developer needs to be productive on Day 1 of this milestone.

### Local Development
- [ ] Clone repository: `git clone <repo_url> && cd <project>`
- [ ] Install dependencies: `npm install`
- [ ] Copy env file: `cp .env.example .env.local` and fill in values
- [ ] Start Supabase local: `npx supabase start`
- [ ] Run Milestone N-1 migrations: `npx drizzle-kit push`
- [ ] Seed development data: `npm run db:seed`
- [ ] Start dev server: `npm run dev` — verify at http://localhost:3000

### Environment Variables (New in This Milestone)
| Variable | Service | Where to Get | Required By |
|----------|---------|-------------|-------------|
| `NEW_SERVICE_API_KEY` | ServiceName | ServiceName dashboard | MS2-T005 |

### Branch Strategy
- Main branch: `main` (protected, requires PR review)
- Milestone branch: `milestone-2/core-features` (created from main)
- Feature branches: `milestone-2/MS2-T001-migration-files` (from milestone branch)
- Merge strategy: Feature → Milestone branch → Main (squash merge)

---

## 10. API Contracts (This Milestone Only)

Only document endpoints being BUILT in this milestone. Full API catalog is in the ERD. Reference by endpoint ID (EP-XXX from ERD).

**Format for each endpoint:**
```
### EP-005: POST /api/v1/features

Purpose:    Create a new feature for the authenticated user
Auth:       Required (Clerk JWT) — middleware validates token before handler
Rate Limit: 30 requests/minute per user
Task Ref:   MS2-T003, MS2-T004
ERD Ref:    EP-005

Request Body:
{
  "name": string,        // required, 1-100 chars
  "type": "A" | "B",    // required, enum
  "description": string  // optional, max 500 chars
}

Response (201 Created):
{
  "id": "uuid",
  "name": "Feature name",
  "type": "A",
  "user_id": "uuid",
  "created_at": "2026-04-01T10:00:00Z"
}

Error Responses:
- 400: VALIDATION_ERROR — missing/invalid fields (field + message in response)
- 401: UNAUTHORIZED — missing or expired JWT
- 403: LIMIT_REACHED — user has hit plan limit
- 429: RATE_LIMITED — too many requests (Retry-After header included)
- 500: INTERNAL_ERROR — server error (traceId in response for debugging)
```

---

## 11. Database Changes (This Milestone Only)

Only schema changes being made in this milestone. Full schema is in ERD. Reference by migration ID and table ID (TB-XXX).

**Format:**
```
### Migration M201: 0004_create_features_table.sql

Table:   features (TB-003)
Action:  CREATE TABLE
Task Ref: MS2-T001

Columns:
| Column      | Type        | Constraints           | Notes |
|-------------|-------------|----------------------|-------|
| id          | uuid        | PK, gen_random_uuid() | |
| user_id     | uuid        | FK → users.id, NOT NULL | RLS key |
| name        | varchar(100)| NOT NULL              | |
| type        | varchar(10) | CHECK IN ('A','B')    | |
| created_at  | timestamptz | DEFAULT now()         | |

Indexes:    (user_id) — for RLS performance
RLS Policy: auth.uid() = user_id

Rollback SQL (Down):
  DROP TABLE IF EXISTS features;
```

**Migration safety rules:**
- Test down migration on staging DB copy before applying to prod
- Deploy code FIRST, then migrate — never migrate first (blue/green safety)
- All migrations must be backwards-compatible (no column drops while old code is running)

---

## 12. Testing Plan

Define testing requirements specific to this milestone's deliverables.

### 12a. Testing Layers

| Layer | Scope | Tool | Coverage Target | When Run |
|-------|-------|------|----------------|----------|
| Unit | Business logic, utilities | Jest / Vitest | 80%+ new code | Pre-commit + PR |
| Integration | API routes, DB queries | Jest + Supertest | All new endpoints | PR open |
| E2E (Playwright) | Primary user flows | Playwright | All flows in PRD User Flows | Before staging deploy |
| API Contract | Endpoint request/response | Supertest / Pact | All new endpoints | PR open |
| Accessibility | WCAG 2.1 AA | axe-core + Playwright | All new pages | PR open |
| Performance | k6 load test | k6 | p95 < 500ms at 200 RPS | Weekly on staging |
| Manual QA | Acceptance criteria | Manual checklist | 100% of ACs | Before milestone exit |

### 12b. E2E Test Scope (Playwright)

Playwright E2E tests must cover every flow listed in the PRD User Flows section that is implemented in this milestone.

**Minimum required tests per feature:**
- Happy path: user completes the core flow successfully
- Error path 1: invalid input → error message shown
- Error path 2: unauthorized access → redirected
- Empty state: user has no data → empty state shown

**Test IDs:** Use format `MS{N}-E2E-{NNN}` (e.g., MS2-E2E-001)

### 12c. CI Pipeline Gates

| Gate | When | Pass Criteria | Action on Fail |
|------|------|--------------|----------------|
| Unit + Integration | Every PR | All pass, no type errors, lint clean | Block merge |
| E2E (Chromium) | Every PR | All critical flow tests pass on staging | Block merge |
| Accessibility | Every UI PR | 0 critical violations | Block merge |
| Performance | Weekly | p95 < 500ms at target load | Slack alert |

---

## 13. Feature Flag Strategy

Features introduced in this milestone that are behind toggles.

**All new features default to OFF in production.** Enable per environment explicitly.

### 13a. Flags in This Milestone

| Flag Name | Feature | Default | Rollout Plan | Kill Switch |
|-----------|---------|---------|-------------|-------------|
| `ms2_feature_x` | Feature X | Off | Internal → 10% → 50% → 100% (1 week each) | Set OFF in LaunchDarkly |
| `ms2_feature_y` | Feature Y | Off | Manual toggle after QA sign-off | Set OFF in LaunchDarkly |

**Flag naming convention:** `ms{N}_{feature_area}` (e.g., `ms2_checkout`, `ms3_notifications`)

### 13b. Rollout Schedule

| Phase | Audience | Duration | Success Criteria | Rollback Trigger |
|-------|----------|----------|-----------------|----------------|
| Internal | Team only | 3-5 days | No errors in Sentry | Any P0/P1 bug |
| Canary | 5-10% of users | 3-5 days | Error rate delta < 0.1% | Error rate > 0.5% |
| Early Access | 25-50% of users | 5-7 days | User feedback positive | NPS drop > 10 points |
| GA | 100% of users | Permanent | All metrics stable | Hotfix |

### 13c. Kill Switch Protocol

| Trigger | Action | Who Can Pull | SLA |
|---------|--------|-------------|-----|
| Error rate > 0.5% for 5 min | Disable flag immediately | Any on-call engineer | < 2 min |
| P0 bug from flag feature | Disable flag, page on-call | QA Lead | < 5 min |
| Performance degradation > 2x baseline | Disable, investigate | Backend Lead | < 10 min |

---

## 14. Risk & Blocker Register

Milestone-specific risks and current blockers.

| ID | Risk / Blocker | Severity | Likelihood | Mitigation | Owner | Status |
|----|---------------|----------|------------|------------|-------|--------|
| R1 | Technical complexity underestimated | Medium | Medium | Spike at start of Week 1; re-estimate after spike | Tech Lead | Open |
| R2 | Third-party API instability | Low | High | Circuit breaker + mock fallback for dev/testing | Backend Lead | Mitigated |
| B1 | Design mockups not ready for Screen X | Blocker | — | Escalate to designer; use placeholder UI if not ready by Week 2 | PM | Open |

---

## 15. Rollback Plan

Mandatory recovery procedures. Every milestone must be safely reversible.

### 15a. Rollback Trigger Conditions

Initiate rollback if ANY of these are true after deployment:
- Error rate > 5% sustained for more than 5 minutes
- P0 bug found that cannot be fixed with a feature flag toggle
- Data corruption detected
- SLO burn rate exceeds 10x expected rate

### 15b. Rollback Procedure

```
1. DISABLE all feature flags for this milestone (instant user-facing rollback)
   Command: Set all ms{N}_* flags to OFF in LaunchDarkly/flag tool

2. NOTIFY team: post in #incidents Slack with reason and ETA

3. REVERT code deployment:
   git revert <merge-commit-sha>
   Create PR → emergency merge to main → trigger CI/CD deploy

4. IF database migration was applied:
   npm run db:rollback -- --steps <n>
   Verify: check table schemas match pre-milestone state

5. VERIFY rollback successful:
   - Error rate drops to < 0.1% within 5 min
   - Previously working features still work
   - No data loss (check key DB row counts)

6. POST incident report: root cause, timeline, impact, prevention
```

### 15c. Data Migration Reversal

| Migration ID | Forward Action | Reverse Action | Data Risk |
|-------------|---------------|----------------|-----------|
| M201 | CREATE TABLE features | DROP TABLE features | Low — new table, no existing data |
| M202 | ALTER TABLE users ADD column | ALTER TABLE users DROP COLUMN | Medium — verify no data loss |

### 15d. Post-Rollback Verification Checklist

- [ ] Error rate at or below pre-deployment baseline
- [ ] All health check endpoints return 200
- [ ] Core user flows work (sign-in, primary actions)
- [ ] No orphaned data or broken foreign keys
- [ ] Monitoring dashboards show normal metrics
- [ ] On-call has confirmed stability for 30 minutes post-rollback

---

## 16. Milestone Exit Criteria (Definition of Done)

The checklist that must be 100% complete before declaring this milestone done.

### Code Quality
- [ ] All tasks in the Task Breakdown are marked "Done"
- [ ] All code has been peer-reviewed and approved (min 1 reviewer)
- [ ] No P0 or P1 bugs open
- [ ] Code coverage >= 80% for new code
- [ ] ESLint/TypeScript report zero errors

### Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests for milestone scope pass on staging
- [ ] Manual QA checklist 100% verified
- [ ] Performance: p95 < 500ms for new endpoints on staging

### Deployment
- [ ] Code deployed to staging environment
- [ ] All database migrations applied to staging
- [ ] No regressions in Milestone N-1 functionality
- [ ] Feature flags tested in both ON and OFF states
- [ ] Rollback procedure reviewed and down migrations tested

### Documentation
- [ ] API documentation updated for new/changed endpoints
- [ ] README updated if setup steps changed
- [ ] Handoff notes for next milestone written

### Stakeholder Sign-off
- [ ] Demo conducted with stakeholders
- [ ] Product owner accepts all deliverables against acceptance criteria
- [ ] Tech lead approves code quality and architecture

---

## 17. Next Milestone Preview

Document what the next milestone will build so this team knows what to prepare.

**Include:**
- **What we must hand off** — exact items the next milestone depends on from us
- **What next milestone will build on top of** — which of our APIs, tables, env items they'll use
- **Their DoR items that reference us** — what they won't be able to start without our deliverables

**Example:**
> **Milestone 3 Preview (Integrations)**
>
> Milestone 3 will integrate Stripe payments and email notifications. They need from us:
> - EP-005 through EP-009 (Feature X APIs) — live and stable on staging
> - TB-003 (features table) — migration applied and RLS policies working
> - `ms2_feature_x` flag — at 100% rollout before their Milestone 3 start
>
> Our handoff contract: all Milestone 2 exit criteria signed off, staging matches production config.

---

## Document Metadata

- Version: 1.0, 1.1, etc.
- Status: Planning → In Progress → Complete
- Last updated: Date
- Changelog: Brief description of each revision
