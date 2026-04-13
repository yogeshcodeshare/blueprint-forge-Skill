# Engineering Requirements Document (ERD) Template Reference (v2)

This document provides the full template for an Engineering Requirements Document. The ERD defines HOW to build a product — the tech stack, system architecture, database schema, API design, infrastructure, and implementation plan.

**Output format:** DOCX via `node scripts/generate_erd_docx.js --data erd_data.json --output output_erd.docx`

**Forge Compatibility:** This ERD is designed to be consumed by `tech-project-forge` skill. Ensure: database type is declared explicitly, validation rules per field are documented, seed data section is present, traceability IDs (CO-XXX, EP-XXX, TB-XXX, ADR-XXX) are used.

---

## Table of Contents

1. [Cover Page](#1-cover-page)
2. [Non-Functional Requirements (FURPS+)](#2-non-functional-requirements-furps) *(NEW — first section)*
3. [Tech Stack + ADRs](#3-tech-stack--architectural-decision-records-adrs) *(ENHANCED)*
4. [System Architecture + Capacity Planning](#4-system-architecture)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [Infrastructure & DevOps](#8-infrastructure--devops)
9. [Security Requirements & Threat Modeling](#9-security-requirements--threat-modeling)
10. [Performance Requirements & SLOs](#10-performance-requirements--slos)
11. [Error Handling & Logging](#11-error-handling--logging)
12. [Testing Strategy](#12-testing-strategy)
13. [Feature Flag & Rollout Strategy](#13-feature-flag--rollout-strategy)
14. [Monitoring & Observability](#14-monitoring--observability)
15. [Implementation Plan](#15-implementation-plan)
16. [Risk Assessment & Areas of Concern](#16-risk-assessment--areas-of-concern)
17. [Infrastructure Provisioning Checklist](#17-infrastructure-provisioning-checklist)
18. [Appendix](#18-appendix)

---

## 1. Cover Page

The cover page should clearly signal this is a technical document for engineering teams:

- **Project Title** — Clear, descriptive name
- **Document Type** — "Engineering Requirements Document"
- **Version** — Semantic versioning (v0.1 = draft, v1.0 = approved)
- **Date** — Document creation/last update date
- **Author(s)** — Engineering lead + product owner
- **Status** — Draft | In Review | Approved | In Development | Completed
- **Confidentiality** — Internal / Confidential / Public
- **Related PRD** — Link to the corresponding Product Requirements Document

---

## 2. Non-Functional Requirements (FURPS+)

**Purpose:** Measurable quality attributes. Placed FIRST because they constrain every downstream architectural decision. "Fast" is not a requirement. "p99 < 300ms over 28-day rolling window" is.

**FURPS+ Categories:**

| Category | Requirement | Target Value | Measurement Method |
|----------|------------|-------------|-------------------|
| **Performance** | API response time | p95 < 200ms, p99 < 500ms | APM (Datadog/Sentry) |
| **Performance** | Page load (LCP) | < 2.5s | Lighthouse / Web Vitals |
| **Performance** | Database query | p95 < 50ms | Query analyzer |
| **Scalability** | Concurrent users | [X] concurrent sessions | Load test (k6) |
| **Scalability** | Data growth | [X] GB/month | Storage monitoring |
| **Reliability** | Uptime | 99.9% (8.76h downtime/year) | Uptime monitor |
| **Reliability** | MTTR | < 30 minutes | Incident tracking |
| **Reliability** | Error rate | < 0.1% of all requests | APM error dashboard |
| **Maintainability** | Test coverage | > 80% line coverage | Coverage report |
| **Security** | Auth standard | OAuth 2.0 + OIDC, JWT RS256 | Auth system audit |
| **Security** | Encryption at rest | AES-256 | Cloud provider config |
| **Security** | Encryption in transit | TLS 1.3 minimum | SSL Labs |
| **Portability** | Browser support | Chrome 90+, Firefox 88+, Safari 14+ | BrowserStack |
| **Portability** | Mobile | Responsive down to 375px | Responsive testing |

**Rule:** Every NFR must have a numeric value. If you cannot measure it, it is not a requirement — it's a wish.

---

## 3. Tech Stack + Architectural Decision Records (ADRs)

**Purpose:** Document every technology choice with rationale AND alternatives considered. ADRs preserve institutional knowledge and prevent re-litigating decisions. One ADR per major technology choice.

### 3.1 Tech Stack Decision Matrix

| Category | Chosen | Alternatives Considered | Why This Choice |
|----------|--------|------------------------|----------------|
| Framework | Next.js 14 (App Router) | Remix, SvelteKit, Nuxt | Server components for performance, largest ecosystem, Vercel-native deployment |
| Styling | Tailwind CSS + ShadCN/ui | Chakra UI, MUI, Styled Components | Utility-first for speed, ShadCN gives accessible components with full control |
| Database | Supabase (PostgreSQL) | Firebase, PlanetScale, Neon | Need relational queries for analytics; RLS built-in; real-time subscriptions |
| Auth | Clerk | NextAuth, Supabase Auth, Auth0 | Best DX for Next.js, handles social login + org management, webhook support |
| Hosting | Vercel | AWS Amplify, Netlify, Railway | Zero-config Next.js deploy, edge functions, preview deploys per PR |
| Payments | Stripe | Paddle, LemonSqueezy | Industry standard, best docs, handles tax + subscriptions |
| Email | Resend | SendGrid, Postmark, SES | React Email templates, developer-first API, generous free tier |
| AI (Text) | Anthropic Claude | OpenAI GPT-4, Google Gemini | Superior reasoning for habit coaching, tool use for structured outputs |
| Storage | Cloudflare R2 | AWS S3, Supabase Storage | S3-compatible, zero egress fees, global distribution |
| Monitoring | Sentry + Vercel Analytics | Datadog, LogRocket | Error tracking + web vitals at low cost for early stage |
| IaC | Terraform | AWS CDK, Pulumi | Most widely adopted, rich provider ecosystem, Terraform Cloud for state |

### 3.2 Architectural Decision Records (ADRs)

**Format per ADR:** One ADR per major architectural decision. ID format: `ADR-XXX`.

```
ADR-001: [Decision Title]
Status:  Proposed | Approved | Deprecated | Superseded by ADR-XXX
Date:    YYYY-MM-DD

Context (Problem):
  [What problem are we solving? What forces are at play?]

Decision:
  [What did we decide?]

Rationale:
  [Why is this the right choice for our context?]

Alternatives Considered:
  - Option A: [pros / cons]
  - Option B: [pros / cons]

Consequences:
  + [Positive outcome]
  + [Positive outcome]
  - [Negative trade-off or risk]
  - [Negative trade-off or risk]
```

**Example ADR:**
```
ADR-001: PostgreSQL over MongoDB for primary data store
Status:  Approved

Context: Application needs ACID guarantees for billing and audit data.
  Team proposed MongoDB for schema flexibility early on.

Decision: Use PostgreSQL (via Supabase).

Rationale: Strong ACID transactions required for financial records.
  Supabase RLS provides multi-tenant isolation out of the box.
  Rich JOIN queries reduce API complexity.

Alternatives:
  - MongoDB: Rejected — no ACID across collections, poor aggregation
  - DynamoDB: Rejected — vendor lock-in, expensive for complex queries

Consequences:
  + Type safety via Drizzle ORM
  + Native PostGIS available if location features added
  - Horizontal sharding complex at massive scale (mitigated by read replicas)
```

**ADR Index Table:**

| ID | Decision Title | Status | Date | Impact |
|----|---------------|--------|------|--------|
| ADR-001 | Database choice | Approved | 2026-04-01 | High |
| ADR-002 | Auth provider | Approved | 2026-04-01 | High |
| ADR-003 | IaC framework | Proposed | 2026-04-05 | Medium |

---

## 4. System Architecture

**Purpose:** Show how all the pieces fit together. Every ERD must include an architecture overview.

**Include:**
- High-level component diagram (client → API → DB → services)
- Data flow for the 2-3 most critical user journeys
- External service integrations and their touch points
- Caching layers and their invalidation strategy
- Background job / queue architecture (if applicable)

**Architecture Diagram Description Format:**
```
[Browser/Mobile]
    ↓ HTTPS
[Vercel Edge Network]
    ↓
[Next.js App (Vercel)]
    ├── Server Components → [Supabase PostgreSQL]
    ├── API Routes → [Supabase PostgreSQL]
    ├── Auth Middleware → [Clerk]
    ├── Webhook Handlers → [Stripe, Clerk]
    └── Edge Functions → [Anthropic API]
                            [Resend (Email)]
                            [Cloudflare R2 (Storage)]
```

**Key Design Decisions:**
- Why this architecture pattern? (monolith vs. microservices, server-side vs. client-side)
- What are the scaling limits of this design?
- What would need to change at 10x scale? 100x?

### 3a. Capacity Planning

**Purpose:** Ground the architecture in concrete numbers so the team knows when the design will break and what to do about it.

**Expected Load:**

| Metric | Launch (Month 1) | Growth (Month 6) | Scale (Month 12) | Breaking Point |
|--------|------------------|-------------------|-------------------|----------------|
| Requests per second (RPS) | 10 | 100 | 500 | 1,000 (connection pool limit) |
| Concurrent users | 50 | 500 | 2,000 | 5,000 (WebSocket limit) |
| API calls / day | 50K | 500K | 2M | 5M (rate limit ceiling) |

**Data Storage Growth:**

| Data Type | Growth Rate | Month 1 | Month 6 | Month 12 | Storage Limit |
|-----------|-------------|---------|---------|----------|---------------|
| User records | ~500/month | 500 | 3,000 | 6,000 | 500K (free tier) |
| Habit entries | ~10K/month | 10K | 60K | 120K | N/A (no practical limit) |
| File uploads | ~2GB/month | 2GB | 12GB | 24GB | 10GB free (R2) |

**Scaling Triggers:**
Define explicit thresholds that trigger infrastructure changes:
- DB connection pool > 80% utilization → migrate to connection pooler (PgBouncer / Supavisor)
- API p95 latency > 500ms for 30 minutes → add caching layer or optimize hot queries
- Storage > 80% of free tier → upgrade plan or implement object lifecycle rules
- Daily API calls > 4M → evaluate horizontal scaling or edge caching

---

## 5. Database Schema + Data Dictionary

**Purpose:** Define every table, column, type, constraint, index, and relationship — plus the business meaning and validation rules for each column. This is the engineering heart of the ERD.

**Database Type Declaration (required — used by tech-project-forge):**
```
Database Type: PostgreSQL 15 (SQL / Relational)
Hosting:       Supabase Cloud
ORM:           Drizzle ORM
Migration Tool: Drizzle Kit
RLS Enabled:   Yes — all tables use Row-Level Security policies
```

**Format per table (with Data Dictionary):**

### `users` table (TB-001)

**Description:** Registered user accounts. Core identity table — all other tables reference this.

| Column | Type | Constraints | PII? | Default | Validation Rules | Business Definition |
|--------|------|------------|------|---------|-----------------|---------------------|
| id | uuid | PK, NOT NULL | No | gen_random_uuid() | UUID v4 | Unique user identifier, immutable after creation |
| clerk_id | varchar(255) | UNIQUE, NOT NULL | No | — | clerk_user_XXXX format | Clerk external ID, used for JWT validation |
| email | varchar(255) | UNIQUE, NOT NULL | Yes | — | RFC 5322, max 255 chars, lowercase | Primary login. PII — handle per GDPR Art. 17 |
| display_name | varchar(100) | NOT NULL | Yes | — | 1-100 chars, no HTML | User's chosen name. PII — visible to collaborators |
| plan | varchar(50) | NOT NULL | No | 'free' | ENUM: free \| pro \| enterprise | Subscription tier, synced from Stripe webhook |
| created_at | timestamptz | NOT NULL | No | now() | UTC timezone required | Account creation, immutable |
| updated_at | timestamptz | NOT NULL | No | now() | Auto-updated via trigger | Last modification |

**Indexes:** `(clerk_id)` UNIQUE, `(email)` UNIQUE, `(plan)` for admin analytics
**RLS Policy:** `auth.uid() = clerk_id` — users can only read/write their own row
**Forge compatibility:** Validation rules column enables forge to generate Zod schemas automatically

### Relationships

```
users 1──────< many habits        (habits.user_id → users.id)
habits 1─────< many entries       (entries.habit_id → habits.id)
users 1──────< many subscriptions (subscriptions.user_id → users.id)
```

### Migration Strategy
- Use Supabase migrations (SQL files in `supabase/migrations/`)
- Each migration file is versioned (e.g., `0001_create_users.sql`) and has a corresponding rollback
- Migration IDs format: `M{n}{nn}` (e.g., M001, M002) for cross-milestone traceability
- See: Milestone docs for which migrations are applied in each milestone

### 5.1 Seed Data Requirements (required — used by tech-project-forge)

| Table | Seed Data Description | Purpose |
|-------|----------------------|---------|
| users | 3 accounts: admin@demo.com (enterprise), user@demo.com (pro), guest@demo.com (free) | Testing all permission levels |
| plans | 3 tiers: free ($0/mo), pro ($29/mo), enterprise ($99/mo) with feature limits | Subscription flow testing |
| settings | Default feature flag values, rate limits, system config | App initialization |

---

## 5. API Design

**Purpose:** Define every endpoint the frontend will call. This is the contract between frontend and backend.

### 5a. API Versioning Strategy

**Purpose:** Prevent breaking changes from disrupting existing clients. Define the versioning approach before writing the first endpoint.

**Versioning Approach:** *(Choose one and document the rationale)*

| Strategy | Format | Example | Best For |
|----------|--------|---------|----------|
| URI Path (recommended) | `/v1/resource` | `GET /v1/habits` | Public APIs, clear routing, easy to reason about |
| Header | `Accept-Version: v1` | `Accept-Version: v2` | Internal APIs, clean URIs |
| Query Param | `?version=1` | `GET /habits?version=2` | Simple APIs, quick prototyping |

**Version Lifecycle:**

| Phase | Duration | Description |
|-------|----------|-------------|
| Active | Indefinite | Current version, all new features land here |
| Deprecated | 6 months | Still functional, returns `Sunset` header with retirement date |
| Retired | — | Returns 410 Gone with migration guide URL |

**Breaking Change Policy:**
- Field additions are NOT breaking (additive)
- Field removals, type changes, and renamed fields ARE breaking → require new version
- New required fields on request bodies ARE breaking → require new version
- Deprecation notice must be communicated at least 90 days before retirement

**Format per endpoint:**

### `POST /v1/habits`
| Field | Value |
|-------|-------|
| **Method** | POST |
| **Auth** | Required (Clerk JWT) |
| **Rate Limit** | 30/minute per user |
| **Description** | Create a new habit for the authenticated user |

**Request Body:**
```json
{
  "name": "Read for 20 minutes",
  "frequency": "daily",
  "color": "#4A9BD9",
  "reminder_time": "09:00",
  "reminder_enabled": false
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Read for 20 minutes",
  "frequency": "daily",
  "color": "#4A9BD9",
  "streak_current": 0,
  "streak_best": 0,
  "created_at": "2026-04-05T10:30:00Z"
}
```

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing or invalid fields |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | HABIT_LIMIT_REACHED | Free tier: max 20 habits |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

**Endpoint Catalog Summary:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /v1/habits | Yes | List user's habits |
| POST | /v1/habits | Yes | Create a habit |
| PATCH | /v1/habits/:id | Yes | Update a habit |
| DELETE | /v1/habits/:id | Yes | Delete a habit |
| POST | /v1/habits/:id/check-in | Yes | Mark habit complete today |
| DELETE | /v1/habits/:id/check-in | Yes | Unmark today's check-in |
| GET | /v1/habits/:id/stats | Yes | Get streak & analytics |
| GET | /v1/user/dashboard | Yes | Aggregated dashboard data |

---

## 6. Authentication & Authorization

**Purpose:** Define the auth flow, token strategy, and permission model.

**Include:**
- Auth provider setup (Clerk configuration, social providers enabled)
- Token flow (JWT validation in API routes)
- Role-based access control (if applicable)
- Session management (duration, refresh strategy)
- Webhook handling (user.created, user.deleted events from Clerk)

---

## 7. Third-Party Integrations

**Purpose:** Map every external service, its purpose, and the API keys needed.

| Service | Purpose | API Key Needed | Free Tier Limits | Setup Status |
|---------|---------|---------------|-----------------|-------------|
| Clerk | Authentication | CLERK_SECRET_KEY | 10K MAUs | Not provisioned |
| Supabase | Database + Realtime | SUPABASE_URL, SUPABASE_KEY | 500MB DB, 50K MAUs | Not provisioned |
| Stripe | Payments | STRIPE_SECRET_KEY | No limit (2.9% + 30¢) | Not provisioned |
| Resend | Transactional email | RESEND_API_KEY | 3K emails/month | Not provisioned |
| Anthropic | AI habit coaching | ANTHROPIC_API_KEY | Pay per token | Not provisioned |
| Cloudflare R2 | File storage | R2_ACCESS_KEY, R2_SECRET | 10GB free | Not provisioned |
| Sentry | Error tracking | SENTRY_DSN | 5K errors/month | Not provisioned |

---

## 8. Infrastructure & DevOps

**Include:**
- **Environments:** Development, Staging, Production
- **CI/CD:** GitHub Actions → Vercel (auto-deploy on push to main)
- **Preview Deploys:** Every PR gets a unique preview URL
- **Environment Variables:** List every env var needed per environment
- **Database Branching:** Supabase branching for preview environments
- **Monitoring:** Sentry for errors, Vercel Analytics for performance, Supabase dashboard for DB

---

## 9. Security Requirements & Threat Modeling

**Purpose:** Define security controls AND proactively identify threats. Security is not a checklist — it's an ongoing design constraint.

### 9a. Security Controls

**Include:**
- Input validation strategy (Zod schemas for all API inputs)
- SQL injection prevention (parameterized queries via Supabase client)
- XSS prevention (React's built-in escaping + CSP headers)
- CSRF protection (SameSite cookies, Clerk handles this)
- Rate limiting (per-user and per-IP)
- Data encryption (at-rest: Supabase default; in-transit: HTTPS everywhere)
- Secrets management (Vercel environment variables, never in code)
- OWASP Top 10 considerations

### 9b. LINDDUN Privacy Threat Model

**Purpose:** Systematically identify privacy-specific threats beyond security vulnerabilities. LINDDUN is the privacy equivalent of STRIDE.

| Threat | Description | System-Specific Risk | Mitigation |
|--------|-------------|---------------------|------------|
| **L**inkability | Correlating user actions across sessions/features | Usage analytics could link anonymized users | Random session tokens, data minimization, k-anonymity in aggregates |
| **I**dentifiability | Identifying a user from supposedly anonymous data | Log files contain IP + user agent → fingerprinting | Hash IPs in logs, generalize user agents, GDPR-compliant log retention |
| **N**on-repudiation | Preventing user from denying their actions | Audit logs could be used against users unfairly | Audit logs accessible only to admins; user can request their own audit trail |
| **D**etectability | Detecting that a user exists in the system | "User not found" vs "Wrong password" reveals account existence | Generic error messages regardless of account existence |
| **D**isclosure | Leaking private data to unauthorized parties | API response includes fields user shouldn't see | Field-level permission checks, never include PII in error responses |
| **U**nawareness | User not knowing how their data is used | New tracking features added without disclosure | Privacy policy update notification, consent for new data uses |
| **N**on-compliance | Failure to meet legal requirements | GDPR right-to-delete not fully implemented | Cascade delete for all PII, 30-day deletion SLA, documented evidence |

### 9c. Threat Modeling — STRIDE/Security

**Purpose:** Systematically identify what can go wrong and how to prevent it.

**PII Data Inventory:**

| Data Element | Storage Location | Classification | Encryption | Retention | Right-to-Delete |
|-------------|-----------------|---------------|------------|-----------|-----------------|
| Email address | `users.email` | PII | At-rest (AES-256) | Account lifetime | Yes — cascade delete |
| Display name | `users.display_name` | PII | At-rest (AES-256) | Account lifetime | Yes — cascade delete |
| Habit names | `habits.name` | Sensitive (behavioral) | At-rest (AES-256) | Until habit archived + 90d | Yes — hard delete |
| Payment info | Stripe (external) | PCI | Stripe-managed | Per Stripe policy | Via Stripe dashboard |

**OWASP Top 10 Mitigations:**

| OWASP Risk | Mitigation | Implementation |
|-----------|-----------|----------------|
| A01: Broken Access Control | Row Level Security (RLS) on all tables | Supabase RLS policies per table, tested in integration suite |
| A02: Cryptographic Failures | AES-256 at rest, TLS 1.3 in transit | Supabase default encryption, Vercel HTTPS enforcement |
| A03: Injection | Parameterized queries only | Supabase client SDK (no raw SQL), Zod validation on inputs |
| A04: Insecure Design | Threat model in ERD, security review on PRs | This section + PR checklist item |
| A05: Security Misconfiguration | Automated env var audit, CSP headers | GitHub Actions secret scanner, next.config.js CSP |
| A06: Vulnerable Components | Automated dependency scanning | Dependabot + `npm audit` in CI |
| A07: Auth Failures | Clerk-managed auth, rate limiting | Clerk JWT + per-user rate limits on auth endpoints |
| A08: Data Integrity Failures | Stripe webhook signature verification | `stripe.webhooks.constructEvent()` in webhook handler |
| A09: Logging Failures | Structured logging with traceId | See Error Handling section, PII redaction in logs |
| A10: SSRF | No user-supplied URLs fetched server-side | If needed later: allowlist domains, validate URLs |

**Attack Surface Summary:**
- **External entry points:** Browser, webhook endpoints (Clerk, Stripe), Anthropic API callbacks
- **Internal trust boundaries:** Next.js middleware → API routes → Supabase RLS → PostgreSQL
- **Data flows requiring encryption:** User auth tokens, payment webhooks, AI API keys

---

## 10. Performance Requirements (SLO/SLI/SLA + Error Budgets)

**Purpose:** Define measurable performance targets with the SLI/SLO/SLA framework used in Google SRE. Each level is distinct.

**Definitions:**
- **SLI (Service Level Indicator):** The measurement formula (what we observe)
- **SLO (Service Level Objective):** Our internal target (what we commit to internally)
- **SLA (Service Level Agreement):** External customer commitment (softer than SLO)
- **Error Budget:** `1 - SLO` = allowed failure within the window

**SLO Definitions:**

| Metric | SLI Formula | SLO Target | Time Window | SLA (External) | Error Budget | Alert Threshold |
|--------|------------|-----------|-------------|---------------|-------------|----------------|
| Availability | Fraction of minutes with 2xx responses | 99.9% | 28-day rolling | 99.5% | 0.1% = 8.76 hrs/year | Burn rate > 5x for 1hr |
| Latency | Fraction of requests completing < 500ms | 95% | 28-day rolling | — | 5% = 50K/1M requests | p95 > 300ms for 5 min |
| Error Rate | Fraction of requests returning non-5xx | 99.5% | 28-day rolling | — | 0.5% = 5K errors/1M | 5xx rate > 1% for 2 min |

**Error Budget Policy:**
- When error budget is < 50% remaining: flag in weekly engineering meeting
- When error budget is < 25% remaining: freeze new features, focus on reliability
- When error budget is exhausted: full reliability sprint until budget restored
- Authority: Engineering lead can declare reliability sprint without PM approval

**Detailed SLO Targets:**

| Metric | Target | SLO | Measurement |
|--------|--------|-----|-------------|
| Time to First Byte (TTFB) | < 200ms | 99.5% of requests | Vercel Analytics |
| Largest Contentful Paint (LCP) | < 2.5s | 95% of page loads | Lighthouse CI / Web Vitals |
| API Response Time (p95) | < 300ms | 99.9% of requests | APM (Datadog/Sentry) |
| Database Query Time (p95) | < 50ms | 99.5% of queries | Query analyzer |
| Uptime | 99.9% | Monthly | Better Uptime |

**Caching Strategy:**
- Static pages: ISR with 60s revalidation
- User data: SWR with stale-while-revalidate
- Habit check-ins: Optimistic updates with background sync

---

## 11. Error Handling & Logging

**Purpose:** Define standardized error handling patterns and structured logging so the team produces consistent, debuggable code from day one.

**Error Response Format:**
All API endpoints must return errors in a consistent JSON structure:
```json
{
  "error": {
    "code": "HABIT_LIMIT_REACHED",
    "message": "Free tier allows maximum 20 habits",
    "status": 403,
    "traceId": "req_abc123xyz"
  }
}
```

**Error Code Registry:**
Maintain a central registry of all error codes with their HTTP status, user-facing message, and internal meaning. Group by domain (AUTH_, HABIT_, PAYMENT_, etc.).

**Logging Standards:**
- **Log Levels:** DEBUG (dev only), INFO (key events), WARN (recoverable), ERROR (failures), CRITICAL (system down)
- **Structured Logging:** JSON format with timestamp, level, message, traceId, userId, and context
- **TraceId Propagation:** Every request gets a unique traceId that propagates through all service calls and logs
- **PII Redaction:** Never log passwords, tokens, or full email addresses

**Retry & Circuit Breaker:**
Define retry policies for external services (Anthropic API: 3 retries with exponential backoff, Stripe webhooks: idempotency keys, Supabase: connection pooling with automatic reconnect).

---

## 12. Testing Strategy

**Purpose:** Define testing requirements for the system. For detailed Playwright E2E test specifications, refer to the Milestone docs.

### 12a. Testing Matrix

| Test Type | Tool | Coverage Target | When Run | CI Gate |
|-----------|------|----------------|----------|---------|
| Unit Tests | Jest / Vitest | > 80% line coverage for business logic | Every commit (pre-push) | Block on failure |
| Integration Tests | Jest + Supertest | All API endpoints, happy + error paths | Every PR | Block on failure |
| E2E Tests | Playwright | Critical user journeys from PRD User Flows section | Before staging deploy | Block prod promotion |
| Performance Tests | k6 | p95 < 500ms at target RPS for 5 min | Weekly on staging | Advisory |
| Security Scans | Snyk + OWASP ZAP | No critical/high CVEs; no OWASP Top 10 | Weekly + on demand | Block on critical |
| Accessibility | axe-core + Lighthouse | 0 critical a11y violations; Lighthouse >= 90 | Every UI PR | Advisory |
| Contract Tests | Pact.io | All third-party API integrations | On integration changes | Block on failure |
| Database Tests | Drizzle integration | All migrations reversible; RLS policies correct | On schema changes | Block on failure |

### 12b. CI/CD Gates

| Gate | When | Pass Criteria | Action on Fail |
|------|------|--------------|----------------|
| PR Check | Every PR | Unit + integration pass, lint clean, type check | Block merge |
| Staging Gate | Merge to main | E2E pass, API contracts valid | Block prod deploy |
| Prod Smoke | After prod deploy | Health check + 3 critical flows | Auto-rollback |
| Nightly | Daily 2am | Full regression + performance | Slack alert |

### 12c. Test Data Strategy

- Seed script for local development (see Database Schema §5.1 Seed Data)
- Factory functions in `tests/fixtures/` for test data generation
- Isolated test database per CI run (Supabase branching or ephemeral container)

---

## 13. Feature Flag & Rollout Strategy

**Purpose:** Enable dark launches, progressive delivery, and instant kill switches for every new feature. Feature flags reduce blast radius and give the team confidence to ship faster.

### 13a. Flagging System

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Provider | Vercel Feature Flags / LaunchDarkly / custom via Supabase | Choose based on cost and existing stack |
| Flag Storage | Database table (`feature_flags`) or external service | Supabase table for MVP; migrate to LaunchDarkly at scale |
| Evaluation | Server-side (API routes) + client-side (React context) | Server-side for API behavior, client-side for UI toggles |
| Default State | Off (features launch dark) | New flags default to `false` — explicitly enable per environment |

### 13b. Flag Naming Convention

```
<scope>.<feature>.<variant>
```
Examples: `habits.ai-coaching.enabled`, `payments.annual-plan.visible`, `ui.new-dashboard.beta`

### 13c. Rollout Strategy

| Phase | Audience | Duration | Monitoring Checkpoint |
|-------|----------|----------|-----------------------|
| Dark Launch | Internal team only | 3-5 days | No errors in Sentry, feature behaves as expected |
| Canary | 1% of users (random) | 2-3 days | Error rate delta < 0.1%, no p95 latency regression |
| Early Access | 10% of users | 3-5 days | NPS/feedback positive, no support ticket spike |
| General Availability | 50% → 100% | 2-3 days per step | All SLOs maintained |

### 13d. Kill Switch Protocol

| Trigger | Action | Who Can Pull | Recovery |
|---------|--------|-------------|----------|
| Error rate > 2× baseline | Disable flag immediately | Any engineer on-call | Investigate root cause, re-enable after fix |
| P1 Sentry alert linked to flag | Disable flag immediately | Automated via alert rule | Postmortem required |
| User-reported critical bug | Disable within 15 min | Engineering lead | Hotfix or revert |

### 13e. Flag Lifecycle & Hygiene

| Phase | Max Duration | Action |
|-------|-------------|--------|
| Active (rollout in progress) | 30 days | Feature rolling out to users |
| Fully Rolled Out | 14 days post-100% | Remove flag, hardcode behavior, clean up code |
| Stale (past deadline) | — | Auto-alert in Slack, must be resolved within 7 days |

**Rule:** No feature flag should live longer than 60 days. Stale flags are tech debt. The weekly standup should include a "flag cleanup" check.

---

## 14. Monitoring & Observability

**Purpose:** Define how the team will detect, diagnose, and respond to production issues. Observability means you can ask new questions about your system without deploying new code.

**Dashboards:**

| Dashboard | Tool | Key Metrics | Alert Threshold |
|-----------|------|-------------|----------------|
| API Health | Sentry | Error rate, p95 latency, throughput | Error rate > 1% for 5min |
| Web Vitals | Vercel Analytics | LCP, FID, CLS, TTFB | LCP > 3s for 10% of users |
| Database | Supabase Dashboard | Query time, connection count, storage | Query p95 > 100ms |
| Business | Custom (Supabase query) | DAU, check-ins/day, new signups | DAU drop > 30% day-over-day |

**Alerting Rules:**
- P1 (page immediately): API error rate > 5%, database connection failure, auth service down
- P2 (Slack alert): API error rate > 1%, p95 latency > 500ms, deployment failure
- P3 (daily digest): Elevated 4xx rates, slow queries, approaching rate limits

**Error Budget Policy:**
When monthly error budget is < 25% remaining: halt feature work and focus on reliability. Document who has authority to make this call.

**Deployment & Rollback Strategy:**
- **Deploy method:** Git push to main → Vercel auto-deploy
- **Rollback trigger:** Error rate > 3% within 10 minutes of deploy
- **Rollback method:** Vercel instant rollback to previous deployment
- **DB rollback:** Reversible migrations only; destructive changes require a 2-step migration

---

## 15. Cross-Team Dependency Mapping

**Purpose:** Identify all inter-team dependencies explicitly. Ambiguous dependencies are the #1 cause of missed milestones. Every dependency should have an owner and a delivery date.

### 15a. Dependency Matrix

| This Team Needs | From Team | Deliverable | Required By | Status |
|----------------|-----------|------------|-------------|--------|
| Design mockups for all screens | Design | Figma links for each screen in PRD | Milestone 1 start | Pending |
| Clerk webhook endpoint | DevOps | `CLERK_WEBHOOK_SECRET` configured in prod | Before Milestone 1 Week 2 | Pending |
| Stripe product IDs | Business/PM | Price IDs for each subscription tier | Milestone 3 start | Pending |
| Security review sign-off | Security | Approval of auth and payment flows | Before production deploy | Not started |

### 15b. Blocking Dependencies (Critical Path)

List dependencies that will block development if not delivered on time:
- [ ] [Dependency] — needed by [date] — owner: [team] — escalation: [name]

### 15c. Non-Blocking Dependencies

Dependencies that cause delay but have workarounds:
- [ ] [Dependency] — can use [mock/stub] until ready — owner: [team]

---

## 16. Implementation Plan

**Purpose:** Break the engineering work into milestones with clear deliverables. Milestone names here must match exactly what's used in PRD and Milestone docs.

| Milestone | Duration | Goal | Key Deliverables | Exit Criteria |
|-----------|----------|------|-----------------|---------------|
| Milestone 0 | 2 weeks | Infrastructure Setup | CI/CD, environments, secrets, DB project | All envs accessible, CI green |
| Milestone 1 | 3 weeks | Foundation: Auth + Core Data | DB schema, auth integration, basic CRUD APIs | Users can register/login, core CRUD works |
| Milestone 2 | 4 weeks | Primary Features | Main product functionality, UI screens | Core user journey works end-to-end on staging |
| Milestone 3 | 3 weeks | Integrations | Stripe, email, third-party APIs | All integrations tested with real credentials |
| Milestone 4 | 2 weeks | Hardening & QA | Performance, security review, full test coverage | All SLOs met, security sign-off |
| Milestone 5 | 1 week | Launch | Production deploy, runbooks, monitoring | Successful production smoke test |

**Deep execution docs for each milestone are generated by the Milestone Skill.** Pass this ERD as context: `milestone-skill` reads the full API catalog and assigns each endpoint to the correct milestone automatically.

---

## 16. Risk Assessment & Areas of Concern

**Purpose:** Identify technical unknowns and risks honestly. Each concern should have a proposed spike.

| Risk / Concern | Severity | Likelihood | Proposed Spike | Deadline |
|---------------|----------|-----------|---------------|---------|
| Supabase real-time performance at scale | High | Medium | Load test with 1K concurrent connections | Week 1 |
| Streak calculation edge cases (timezone, missed days) | Medium | High | Write comprehensive unit tests for all timezone scenarios | Week 2 |
| Clerk webhook reliability | Medium | Low | Set up dead letter queue for failed webhooks | Week 3 |
| Anthropic API latency for coaching feature | Medium | Medium | Benchmark response times, implement streaming | Week 5 |

**Areas of Concern (from FloQast ERD pattern):**
List significant concerns identified during ERD creation. These translate to **spikes** — time-boxed user stories used to clarify significant doubts around potential solutions before committing to a full implementation.

---

## 17. Infrastructure Provisioning Checklist

**Purpose:** List everything that must be set up BEFORE coding begins. This is the "Day 0" checklist.

| Item | Service | Action | Owner | Status |
|------|---------|--------|-------|--------|
| Create GitHub repo | GitHub | New repo with branch protection rules | Tech Lead | ☐ |
| Create Supabase project | Supabase | New project, note URL + anon/service keys | Tech Lead | ☐ |
| Set up Clerk application | Clerk | New app, configure social providers | Tech Lead | ☐ |
| Create Stripe account | Stripe | New account, set up products/prices | PM | ☐ |
| Get Anthropic API key | Anthropic | Create account, fund with initial credits | Tech Lead | ☐ |
| Create Resend account | Resend | Verify domain, get API key | Tech Lead | ☐ |
| Set up Cloudflare R2 | Cloudflare | Create bucket, generate access keys | Tech Lead | ☐ |
| Create Sentry project | Sentry | New project for Next.js | Tech Lead | ☐ |
| Configure Vercel project | Vercel | Connect repo, set environment variables | Tech Lead | ☐ |
| Set up all env vars | Vercel | Add all API keys to dev/staging/prod | Tech Lead | ☐ |

---

## 18. Appendix

- **Glossary** — Define technical terms and acronyms
- **PRD-to-ERD Mapping** — Trace each product requirement to its engineering implementation
- **Open Questions** — Decisions still needed (with owner and deadline)
- **Decision Log** — Record of key architectural decisions and their rationale
- **Changelog** — Document revision history
