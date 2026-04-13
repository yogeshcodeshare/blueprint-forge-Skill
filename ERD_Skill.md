---
name: erd-skill
description: >
  Generate world-class, publication-quality Engineering Requirements Documents (ERDs) as professionally
  designed DOCX files. An ERD is a pure engineering spec that defines HOW to build a product.
  Use this skill any time someone asks to create, write, draft, generate, or build an ERD,
  engineering requirements document, engineering spec, technical spec, technical design document,
  software requirements specification, SRS, system design document, project spec, implementation spec,
  or build plan.
  Also triggers on "ERD for [feature]", "engineering spec for", "tech spec for", "how should we
  build [feature]", "write the technical requirements", "system design for [project]", "spec out the
  architecture", "define the tech stack for", "create database schema for", "API design for", or any
  request defining the engineering blueprint before coding begins.
  Output is always a professionally designed DOCX with architecture diagrams, database schema
  visualizations, API endpoint tables, ADR records, SLO/SLI definitions, NFR requirements,
  tech stack comparison matrices, risk heatmaps, and milestone timelines — designed to look like
  it was crafted by a senior engineering lead. Default to DOCX so engineers can annotate and maintain
  it as a living document with tracked changes.
---

# ERD Skill — World-Class Engineering Requirements Document Generator

## Purpose

This skill creates **publication-quality Engineering Requirements Documents (ERDs)** as professionally designed DOCX files. An ERD is the engineering blueprint telling the development team HOW to build a product. It follows IEEE/ISO 29148 standards combined with Google SRE practices, ADR (Architectural Decision Records) methodology, and OpenAPI 3.1 API design standards.

**An ERD covers:**
- Non-functional requirements (FURPS+: Performance, Reliability, Scalability, Security, Usability)
- Tech stack decisions with explicit ADRs (Architectural Decision Records) — the "why" behind every choice
- System architecture with component diagrams, data flows, and capacity planning
- Database schema with full column detail, **validation rules**, **data dictionary**, and **seed data**
- API design with OpenAPI-style contracts, versioning strategy, and complete error catalogs
- Authentication, authorization, and role-based access control
- Security requirements with **LINDDUN privacy threat modeling** and OWASP Top 10 mitigations
- SLO/SLI/SLA definitions with error budgets and alerting thresholds
- Infrastructure as Code (IaC) approach, CI/CD pipeline, and deployment strategy
- **Cross-team dependency mapping** for multi-team projects
- Feature flag & rollout strategy (dark launch → canary → GA)
- Monitoring & observability (dashboards, SLO burn rate alerts, runbooks)
- **AI/LLM System Design** section for AI-powered products
- Implementation plan with sprint breakdown and critical path
- Risk assessment and areas of concern

> **Pair with a PRD:** The ERD focuses on engineering "how" — product "what & why" belongs in the PRD Skill. Always reference the corresponding PRD user story IDs (US-XXX) and goal IDs (GM-XXX) in this ERD for full traceability.

---

## When to Use This Skill vs. PRD Skill vs. Milestone Skill

| Document | Audience | Focus | Depth |
|----------|----------|-------|-------|
| **PRD** | Product managers, stakeholders, executives | What to build and why | Business value, user stories, success metrics, personas |
| **ERD** | Engineering leads, architects, senior developers | How to build it (full system) | Tech stack, full architecture, full schema, full API design |
| **Milestone Doc** | Sprint team, developers | What to build THIS milestone | Task-level breakdown, acceptance criteria, dependencies, setup |

Use the ERD when the audience needs to **start architecture decisions and coding** after reading it.

---

## Workflow Overview

### Step 1: Auto-Research + Context Ingestion

**Before asking the user anything:**

1. **Check for existing documents:**
   - If a PRD exists → read it fully. Extract: user story IDs (US-XXX), goal IDs (GM-XXX), technical constraints, compliance requirements, timeline/milestone names, AI feature specs
   - If mockup images provided → analyze via Claude vision to understand UI complexity and API surface needed

2. **Auto-research** (web search, 2-3 queries):
   - Search: `"[tech stack] system design best practices 2025"` (e.g., "Next.js Supabase system design")
   - Search: `"[domain] engineering spec template enterprise"` (e.g., "fintech SRS template")
   - Search: `"[feature type] database schema design"` if complex data modeling involved
   - Incorporate domain-specific engineering standards into the document

3. **Then interview the user** (only for missing context):
   - Project name and one-line summary
   - Tech stack preferences (or use default recommended stack)
   - Existing infrastructure (greenfield vs. integrating with existing systems)
   - Scale expectations — 100 users or 100,000? (drives architecture decisions)
   - Third-party integrations — payment, auth, email, AI, storage, analytics?
   - Deployment target — cloud provider, serverless vs. containers, CI/CD?
   - Team size and skill level (affects technology choices)
   - Timeline and constraints (hard deadlines, budget limits, compliance)
   - Existing PRD to reference?

---

### Default Recommended Tech Stack

When the user doesn't specify, recommend this modern production-ready stack:

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js (App Router) | SSR/SSG, server components, file-based routing, React ecosystem |
| **Styling** | Tailwind CSS + ShadCN/ui | Utility-first CSS, accessible pre-built components |
| **Hosting** | Vercel | Zero-config Next.js, edge functions, preview deploys |
| **Database** | Supabase (PostgreSQL) | Relational data + real-time + row-level security + managed |
| **Authentication** | Clerk | Drop-in auth UI, social logins, org management, webhooks |
| **Payments** | Stripe | Industry standard, subscriptions, invoicing, webhooks |
| **Email** | Resend | Developer-friendly transactional email, React templates |
| **AI — Text** | Anthropic Claude API | Best-in-class reasoning, long context, tool use |
| **AI — Images** | Google Gemini | Multimodal, image generation and understanding |
| **File Storage** | Cloudflare R2 | S3-compatible, zero egress fees, global CDN |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, performance monitoring, web vitals |
| **Search** | Algolia or pg_vector | Depends on search complexity and existing DB |

Always explain the "why" and the tradeoffs. Document alternatives considered using the ADR format.

---

### Step 2: Plan the Document Structure

Read `references/erd_template.md` for the full ERD template. Decide which sections to include.

**Core Sections (always include):**

1. Cover Page — project name, version, date, author, status badge, linked PRD reference
2. **Non-Functional Requirements (FURPS+)** *(NEW — moved to front so all arch decisions trace to NFRs)*
   - Performance (p50/p95/p99 latency targets, RPS, throughput)
   - Scalability (concurrent users, data growth per month, sharding trigger)
   - Reliability (uptime target, MTBF, MTTR, RPO/RTO)
   - Security (encryption standards, auth requirements, compliance level)
   - Usability (accessibility level, browser/device support)
   - Maintainability (code coverage threshold, documentation standards)
   - All requirements MUST be measurable with units — "fast" is not a requirement
3. Tech Stack Decision Matrix + **ADRs (Architectural Decision Records)** *(ENHANCED)*
   - One ADR per major technology decision
   - ADR format: Title | Status | Context (problem being solved) | Decision | Rationale | Alternatives considered (with pros/cons) | Consequences (positive, negative, trade-offs)
   - Example: "ADR-001: PostgreSQL via Supabase over MongoDB — why relational data model fits our join-heavy reporting"
4. System Architecture
   - Component diagram with data flow arrows
   - Layered view (frontend → API gateway → services → data → external)
   - Capacity planning (expected RPS at launch, 10x scale trigger thresholds, data growth per month)
   - **Infrastructure as Code approach** (Terraform / AWS CDK / Pulumi — choice and rationale)
   - Environment topology (dev / staging / production) with promotion strategy
5. Database Schema + **Data Dictionary** *(ENHANCED)*
   - **Database type declaration**: "PostgreSQL (SQL, relational)" or "MongoDB (NoSQL, document)"
   - Entity tables: column name, type, nullable, constraints, default, **PII classification**, **validation rules** (min/max/pattern/enum), business definition
   - Relationships (1-1, 1-M, M-M) with FK definitions
   - Indexes (composite, partial) with query optimization rationale
   - **Seed data requirements** — what test/demo data to create at project initialization
   - Migration strategy and naming convention (e.g., `001_create_users.sql`)
6. API Design — OpenAPI 3.1-style contracts *(ENHANCED)*
   - For each endpoint: method, path, auth required, request body schema with field types + validation rules, response schema, **complete error catalog** (all 4xx/5xx responses), rate limit headers
   - API versioning strategy (URI path `/v1/` vs header — choose one, document deprecation policy)
   - Request/response examples for every endpoint
7. Authentication & Authorization
   - Auth flow diagram (sequence diagram via PlantUML/Mermaid)
   - Role definitions with permission matrix
   - Token strategy (JWT expiry, refresh token rotation)
   - Session management
8. Third-Party Integrations — external services, SDK versions, API key management, webhook handling, failure handling
9. Infrastructure & DevOps
   - Hosting architecture (cloud provider, regions)
   - CI/CD pipeline (stages: lint → test → build → security scan → deploy → smoke test)
   - Environment variables management (`.env.example` schema)
   - Deployment strategy (blue/green, rolling, canary)
   - Rollback strategy (triggers + step-by-step procedure)
   - **IaC resource naming conventions and tagging strategy**
10. Security Requirements + **LINDDUN Privacy Threat Modeling** *(ENHANCED)*
    - OWASP Top 10 mitigations (concrete implementations, not vague "we'll handle it")
    - LINDDUN privacy threat analysis:
      - Linkability (can events be linked to identify individuals?)
      - Identifiability (can data points identify a person?)
      - Non-repudiation (can users deny their actions?)
      - Detectability (can attackers detect system state?)
      - Disclosure of information (unintended PII exposure risks)
      - Unawareness (are users unaware of data collection?)
      - Non-compliance (regulatory violation risks)
    - PII data flows (what PII is collected, stored, transmitted, retained)
    - Data encryption (at rest, in transit — specific algorithms)
    - Audit logging requirements
11. Performance Requirements + **SLO/SLI/SLA Definitions** *(ENHANCED)*
    - SLI: exact measurement formula (e.g., "fraction of HTTP requests completing in <300ms")
    - SLO: target value + time window (e.g., "99.5% of requests meet SLI over 28-day rolling window")
    - SLA: external customer commitment (if applicable)
    - Error budget: `1 - SLO` (e.g., "0.5% = 3.6 hours/month allowed downtime")
    - Alerting threshold: "page oncall when error budget burns at 5× expected rate"
    - Caching strategy (CDN, application cache, database cache — what to cache, TTL, invalidation)
12. Error Handling & Logging
    - Standardized error response format (schema for all API errors)
    - Error code catalog (4xx/5xx with business meaning)
    - Log levels (Debug/Info/Warn/Error/Critical) with when to use each
    - Structured logging schema (required fields: timestamp, level, service, traceId, requestId, userId, message, metadata)
    - TraceId/RequestId propagation across services
    - Log retention policy
13. Testing Strategy — full matrix with tools, coverage targets, and CI gate requirements
    - Unit tests (coverage target, framework)
    - Integration tests (scope, test database strategy)
    - E2E automation (Playwright/Cypress, critical user journeys covered)
    - API contract tests (consumer-driven contracts with Pact)
    - Performance tests (load testing tool, acceptance threshold)
    - Security scanning (SAST, dependency scanning, container scanning)
    - CI/CD gates: which test types block merge/deploy
14. Feature Flag & Rollout Strategy
    - Flagging system (LaunchDarkly / Unleash / custom)
    - Flag naming convention (e.g., `feature_[service]_[name]`)
    - Rollout phases: dark launch (0%) → internal (employees) → canary (1%) → early access (10%) → GA (100%)
    - Kill switch protocol (how to disable a feature in <5 minutes)
    - Flag retirement process (prevent flag debt accumulation)
15. Monitoring & Observability
    - Metrics to track (request rate, error rate, latency percentiles, resource utilization)
    - Dashboard definition (what metrics, for which audience — engineering vs. business)
    - Alerting rules (threshold, severity, escalation path, oncall rotation)
    - Error budget burn rate alerts
    - Runbook triggers (what condition maps to which runbook)
    - Observability tools (Prometheus, Datadog, New Relic, Sentry — choice with rationale)
16. **Cross-Team Dependency Mapping** *(NEW)*
    - Dependency matrix: which teams need what from which teams
    - Handoff points: exact deliverable, owner, target date
    - Critical path dependencies (blocking vs. non-blocking)
    - Communication plan for dependency status changes
    - Risk mitigation if dependency team misses timeline
17. Implementation Plan
    - Sprint/milestone breakdown with specific deliverables per milestone
    - Task dependencies and critical path
    - "Definition of Done" per milestone (aligns with Milestone Skill input)
    - Milestone names MUST match PRD timeline section (for cross-document traceability)
18. Risk Assessment & Areas of Concern
    - Technical risks with likelihood × impact heatmap
    - Time-boxed spikes for unknowns (e.g., "Spike: load test Supabase real-time at 10K listeners — Week 1, 3 days max")
    - Fallback plans for high-likelihood risks
19. Infrastructure Provisioning Checklist
    - Day 0 setup items (accounts, API keys, databases, hosting, CI/CD) by milestone
    - Each item: task, owner, status, notes
20. Appendix
    - Glossary of domain terms
    - Open questions with owner and due date
    - Decision log (decisions made during ERD creation, not ADR-worthy)
    - ADR index (summary table of all ADRs with title, status, date)
    - PRD-to-ERD Traceability table (US-ID → ERD component/section)

**Optional Sections (include when relevant):**

- Data Migration Plan — if replacing existing system
- Compliance Requirements — GDPR, SOC2, HIPAA, PCI DSS (with specific control implementations)
- Cost Estimation — infrastructure costs, API usage projections per milestone
- Accessibility Requirements — WCAG compliance, screen reader support, color contrast targets
- Data Flow Diagrams — for critical user journeys with PII data flows
- **AI/LLM System Design** *(NEW — include when product has AI features)*
  - Orchestration layer design (LangChain, LlamaIndex, custom — with rationale)
  - RAG pipeline design (retrieval strategy, vector database choice, embedding model, context window management, chunking strategy)
  - Prompt engineering documentation (system prompt template, few-shot examples, temperature/top-p settings, max tokens)
  - Guardrails (topic restrictions, content filters, PII redaction, safety layers)
  - LLM-specific performance targets (time-to-first-token ≤Xms, streaming latency, context length limits)
  - Cost projections (per-request token costs, caching strategy to reduce costs, batch vs. streaming decision)
  - Quality monitoring (hallucination detection approach, semantic drift monitoring, retraining/fine-tuning triggers)
  - Model versioning strategy (how to pin and upgrade model versions safely)

---

### Step 3: Write the Content

**Writing Principles:**

- **Every tech choice needs an ADR** — don't just list technologies; document context, decision, rationale, and trade-offs. Future engineers should understand WHY the system looks the way it does.
- **NFRs are measurable, not vague** — "p99 API latency < 300ms at 1000 RPS sustained" is a requirement; "the API should be fast" is not.
- **Database schemas must be complete** — include table names, column names, types, constraints, indexes, relationships, validation rules, PII classifications, and business definitions. Engineers should never guess what a column means.
- **Validation rules are engineering contracts** — document `email: pattern RFC5322, max 255`, `age: integer, min 0, max 150`. These become model validators and API request validation.
- **Seed data prevents startup confusion** — specify what test/demo data to create: default admin user, sample records per entity, test API keys.
- **API errors are first-class specs** — document ALL error responses, not just 200. Developers building clients need to know every failure mode.
- **SLOs ground architecture decisions** — "99.9% availability" means fundamentally different infrastructure than "95% availability." Define SLOs first, then design to meet them.
- **LINDDUN forces privacy-first design** — going through each privacy threat type surfaces PII risks early, when fixing them is cheap.
- **ADRs preserve institutional knowledge** — "We chose DynamoDB over PostgreSQL because [reasons]" prevents re-litigating decisions and helps future engineers understand constraints.
- **Provision infrastructure upfront** — list every account, API key, database, and hosting environment that needs creation BEFORE coding starts. This eliminates velocity killers.
- **Areas of concern show maturity** — listing unknowns with time-boxed spikes is more professional than pretending certainty.

**Visual Content Planning:**

Plan at least 5-6 visual elements per ERD:

- **Architecture component diagram** — layered flow with services and connections (Mermaid/C4 via Kroki)
- **Database ERD diagram** — entity-relationship diagram (DBML/PlantUML via Kroki)
- **API sequence diagram** — authentication flow, key user journey API calls (PlantUML via Kroki)
- **Risk heatmap** — likelihood × impact 5×5 grid
- **Tech stack ADR table** — decision cards with status badges
- **SLO dashboard mockup** — what the monitoring dashboard should show
- **Milestone/Sprint Gantt chart** — implementation timeline
- **NFR requirements table** — category × requirement × target × measurement method
- **Dependency matrix** — team × team dependency grid (if multi-team)
- **Threat model table** — LINDDUN threats with mitigations

---

### Step 4: Generate the DOCX

**Setup (one-time):**
```bash
pip install matplotlib requests --break-system-packages
npm install -g docx
```

**Generation pipeline:**
```bash
# Step 4a: Generate chart images
python3 scripts/generate_charts.py --type erd --data erd_data.json --output /tmp/erd_charts/

# Step 4b: Generate diagram images (Kroki API — architecture, ERD, sequence diagrams)
python3 scripts/generate_diagrams.py --data erd_data.json --output /tmp/erd_diagrams/

# Step 4c: Generate DOCX
node scripts/generate_erd_docx.js --data erd_data.json --charts /tmp/erd_charts/ --diagrams /tmp/erd_diagrams/ --output output_erd.docx
```

**Diagram Generation (draw.io MCP or Kroki API):**

If `jgraph/drawio-mcp` is configured in Claude Code settings, use it for editable architecture diagrams via the `search_shapes` tool.

Otherwise, use Kroki API (free, no auth required):
```python
# Supports: mermaid, plantuml, dbml, graphviz, c4plantuml, bpmn, and 15+ more
def render_diagram(diagram_text, diagram_type, output_path):
    import base64, zlib, requests
    encoded = base64.urlsafe_b64encode(zlib.compress(diagram_text.encode())).decode()
    resp = requests.get(f"https://kroki.io/{diagram_type}/png/{encoded}", timeout=30)
    with open(output_path, "wb") as f:
        f.write(resp.content)
```

**Color Palettes Available:**
- `engineering_dark` — Dark navy/cyan, technical and authoritative (default)
- `corporate_blue` — Navy/steel blue, professional
- `modern_teal` — Teal/emerald, fresh
- `startup_vibrant` — Purple/coral, energetic
- `minimal_mono` — Grayscale with accent
- `nord_dev` — Arctic/frost, developer-centric (#2E3440, #88C0D0)

---

### Step 5: Review and Refine

Verify before delivery:

1. Every tech choice has an ADR entry (title, status, context, decision, rationale, alternatives, consequences)
2. All NFRs are measurable with units (no vague "fast" or "reliable")
3. Database schema includes: types, constraints, **validation rules**, **PII classification**, **business definitions**, **seed data**
4. **Database type** explicitly declared (SQL vs. NoSQL)
5. Every API endpoint has: complete request schema, response schema, **all error codes**
6. SLO/SLI clearly defined (not just "99.9% uptime" — include measurement formula and error budget)
7. LINDDUN analysis covers all 7 threat categories with mitigations
8. Implementation plan milestone names MATCH PRD timeline milestone names
9. PRD-to-ERD traceability table in Appendix maps every US-ID to a component
10. Cross-team dependency matrix present (for multi-team projects)
11. Infrastructure provisioning checklist is Day-0 complete
12. AI/LLM section present if product has AI features
13. At least 5-6 visual elements embedded and legible
14. Document is specific enough that a developer could start coding without questions

---

### Step 6: Deliver

Save DOCX to user's workspace. Summary should include:
- Tech stack choices made and key ADR decisions
- Number of API endpoints, database tables
- Key SLOs defined
- Risks requiring immediate spikes
- Suggested next document (Milestone 1 doc) with what to provide to the Milestone Skill

---

### Step 7: Self-Improve (Run Overnight — Optional)

```bash
python3 scripts/improve_skill.py --skill erd
```
Runs Karpathy auto-research loop against `eval/eval_erd.json` binary assertions. Logs improvements to `eval/improve_log.json`.

---

## Key Design Principles

**1. Specificity is Everything**
`users(id UUID PK, email VARCHAR(255) UNIQUE NOT NULL CHECK(email ~* '^[^@]+@[^@]+\.[^@]+$'), created_at TIMESTAMPTZ DEFAULT NOW())` is a spec. "We need a users table" is not.

**2. ADRs Preserve Institutional Knowledge**
Future engineers who join 6 months later need to understand WHY the system was designed this way. ADRs prevent re-litigating decisions and explain constraints that aren't obvious from the code.

**3. NFRs Before Architecture**
Define performance targets, availability requirements, and compliance constraints BEFORE choosing the tech stack. Architecture decisions should trace back to NFRs — not the other way around.

**4. Privacy by Design (LINDDUN)**
GDPR right-to-delete, data retention policies, and consent mechanisms are 10× cheaper to design into the schema now than to bolt on after launch. Every PII field must be identified and mapped to a privacy control.

**5. SLOs Ground Architecture**
"99.9% availability = 8.7 hours downtime/year, single-region OK" vs "99.99% = 52 minutes/year, multi-region required, 10× cost." Define SLOs first; then design the infrastructure to meet them.

**6. Security by Design**
Threat modeling (OWASP + LINDDUN) is first-class, not an afterthought. Every identified threat must have a concrete mitigation, not "we'll address security later."

**7. Safe Rollouts**
Feature flags + progressive delivery prevent outages. Kill switch = ability to disable a feature in <5 minutes without a deploy. No feature ships without a kill switch.

**8. Living Document**
ERD evolves with the project. Version, date, status, and changelog are mandatory. Engineers who implement deviations from the ERD should update it — not treat it as a frozen artifact.

---

## Cross-Document Sync (PRD → ERD → Milestone)

**From PRD, ERD consumes:**
- User Story IDs (US-XXX) → PRD-to-ERD Traceability table in Appendix
- Goal IDs (GM-XXX) → SLO targets (e.g., "GM-003 requires <2s page load → p95 SLO = 2000ms")
- Technical constraints → ADR context sections
- Privacy/compliance requirements → LINDDUN threat model + security section
- Timeline milestone names → Implementation plan phase names (must match exactly)
- AI Feature Spec (from PRD) → AI/LLM System Design section in ERD

**For Tech-Project-Forge, ERD must contain:**
- Entities with all fields, types, constraints ✓
- **Validation rules per field** (NEW addition — forge reads these for model validators)
- **Database type declaration** (SQL vs. NoSQL — forge uses this for ORM selection)
- **Seed data requirements** (forge creates init scripts)
- API endpoints with method, path, auth, description ✓
- Third-party integrations list ✓

**ERD outputs that Milestone Skill consumes:**
- Full API catalog → sliced per milestone (only endpoints built in that milestone)
- Full DB schema → sliced per milestone (only migrations in that milestone)
- Implementation plan → expanded into developer-ready task breakdown
- Infrastructure checklist → becomes Milestone 0 setup checklist
- Feature flag strategy → per-milestone flag implementation

**Traceability IDs:**
- Tag each ERD component: CO-001, CO-002 (components/services)
- Tag each endpoint: EP-001, EP-002
- Tag each table: TB-001, TB-002
- Tag each ADR: ADR-001, ADR-002
- Each component references PRD story IDs it implements: `CO-002 (PRD: US-003, US-007)`

**Cross-document review checklist (before delivery):**
- [ ] Every major tech choice has an ADR entry
- [ ] Implementation plan milestone names match PRD Timeline section names
- [ ] PRD-to-ERD Traceability table in Appendix covers all US-IDs
- [ ] SLO targets trace back to PRD goal IDs (GM-XXX)
- [ ] Database schema includes validation rules, PII flags, and seed data (for Forge)
- [ ] Database type explicitly declared (for Forge)
- [ ] Infrastructure checklist complete for Milestone 0 handoff

---

## Reference Files

- `references/erd_template.md` — Full ERD template with all sections, guidance, and examples
- `scripts/generate_erd_docx.js` — Node.js docx.js DOCX generation script
- `scripts/generate_charts.py` — Matplotlib chart → PNG helper
- `scripts/generate_diagrams.py` — Kroki API / draw.io diagram → PNG helper
- `eval/eval_erd.json` — Binary assertion test suite for self-improvement loop
- `scripts/improve_skill.py` — Karpathy auto-research self-improvement loop

---

## Example Invocations

**User says:** "Create an ERD for a habit tracking mobile app"
**Action:** Auto-research "habit tracking app database schema" and "mobile app React Native Supabase architecture 2025." Ask about scale and compliance. Generate ERD with ADRs for Supabase vs Firebase, full schema with validation rules and seed data, API catalog with OpenAPI-style contracts, LINDDUN analysis for user habit data PII, SLO definitions, and AI section if app uses ML for habit recommendations.

**User says:** "Write the engineering spec for our SaaS dashboard — we use Next.js and Supabase"
**Action:** Tech choices already made → write ADRs documenting why (reverse-engineer rationale). Focus on: new components, schema extensions, API endpoints with versioning, SLO targets for dashboard load time, multi-tenant security model (row-level security), cost projections, and monitoring for SLO burn rate.

**User says:** "I need a technical spec for an AI-powered resume builder — hand off to dev team"
**Action:** Include full AI/LLM System Design section: RAG pipeline for job description matching, vector DB design (pgvector in Supabase), prompt templates for resume generation, hallucination mitigation, cost projections per resume generation, and quality metrics (user satisfaction, format compliance rate). LINDDUN analysis for resume PII data. Feature flags for AI feature rollout.

**User says:** "Create ERD to feed into tech-project-forge"
**Action:** Ensure: all entity fields have validation rules, database type declared, seed data section present, API endpoints table complete with method/path/auth. This maximizes forge's PROJECT_SPEC.md quality and enables accurate ORM/migration generation.
