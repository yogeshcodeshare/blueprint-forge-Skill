---
name: milestone-skill
description: >
  Generate world-class, publication-quality Milestone Development Documents as professionally
  designed DOCX files. Can generate a SINGLE milestone document OR automatically decompose an
  entire project into ALL milestones from PRD + ERD context.
  Use this skill any time someone asks to create, write, draft, generate, or build a milestone
  document, milestone plan, sprint document, sprint plan, milestone breakdown, development milestone,
  milestone kickoff, milestone handoff, iteration plan, development cycle document, or work
  breakdown document.
  Also triggers on "milestone 1 document for", "create sprint plan for", "break project into milestones",
  "development plan for milestone", "milestone kickoff document", "what should we build in milestone 1",
  "create all milestones for my project", "generate full project breakdown into milestones",
  "auto-generate milestones from PRD", "create 3 milestones from our requirements",
  "break project into development milestones", "generate milestones from PRD and ERD".
  Automatically reads PRD and ERD if available — zero interview needed for technical content.
  Can analyze mockup images (Figma exports, wireframes) via Claude vision.
  Output is always professionally designed DOCX files with Gantt charts, dependency graphs,
  acceptance criteria matrices, environment setup checklists, risk registers, and rollback plans.
  Default to DOCX — editable Word documents let developers annotate tasks and track progress.
---

# Milestone Skill — World-Class Development Milestone Document Generator

## Purpose

This skill creates **publication-quality Milestone Development Documents** as professionally designed DOCX files. A Milestone Document is the **execution blueprint for a single development milestone/sprint** — telling the team exactly what to build, in what order, with what dependencies, and how to verify completion.

**Two modes:**

| Mode | When to Use | How to Trigger |
|------|------------|----------------|
| **Multi-Milestone (Auto)** | Full project needs milestone planning | "Create all milestones for my project", "Generate milestones from my PRD/ERD" |
| **Single Milestone** | One specific milestone needs documentation | "Create Milestone 2 document", "Sprint 3 plan for notification system" |

**A Milestone Document covers:**
- Milestone overview with goals, scope boundary, and success criteria
- Context from prior milestones (what was delivered, what this milestone inherits)
- Task breakdown — developer-ready work items with story points, week-by-week organization
- Task dependency map showing critical path and parallel work streams
- Acceptance criteria for every deliverable (Given/When/Then format)
- Definition of Ready (DoR) — prerequisites before milestone starts
- Environment & infrastructure setup checklist (for Milestone 0)
- API contracts relevant to THIS milestone only (sliced from ERD)
- Database changes for THIS milestone only (sliced from ERD schema)
- Testing requirements specific to this milestone's deliverables
- Feature flag strategy for features introduced this milestone
- Risk callouts and blockers specific to this milestone
- Rollback plan — mandatory recovery procedure
- Milestone entry criteria (what must be done BEFORE this milestone starts)
- Milestone exit criteria (Definition of Done — what must be true to call this milestone complete)
- Next Milestone Preview — what the following milestone adds
- Handoff notes for the next milestone

> **Note:** The Milestone Document assumes a **PRD** (what & why) and **ERD** (how — architecture, full schema, full API design) already exist. If neither exists, the skill will work from user interview but will recommend creating them first.

---

## When to Use This Skill vs. PRD/ERD Skills

| Document | Audience | Focus | Depth |
|----------|----------|-------|-------|
| **PRD** | Product managers, stakeholders, executives | What to build and why | Business value, user stories, success metrics, personas |
| **ERD** | Engineering leads, architects | How to build it (full system) | Tech stack, full architecture, full schema, full API design |
| **Milestone Doc** | Developers, sprint team, tech leads | What to build THIS milestone | Task-level breakdown, acceptance criteria, dependencies, setup |

---

## Workflow Overview

### Step 1A: Context Ingestion (Automatic — No Interview)

**Before asking the user anything, check for available input files:**

**PRD Document:**
- If user provides PRD path → Read fully. Extract:
  - Project name, goal type, feature list with US-IDs and priorities
  - User stories with acceptance criteria
  - Success metrics with GM-IDs
  - Timeline/milestone names and feature lists per milestone
  - Technical constraints and third-party integrations
  - Privacy/compliance requirements

**ERD Document:**
- If user provides ERD path → Read fully. Extract:
  - Full API catalog (all endpoints with methods, paths, auth, schemas)
  - Full DB schema (all tables, columns, types, validation rules, relationships)
  - Infrastructure checklist (becomes Milestone 0 tasks)
  - Feature flag strategy (which flags for which features)
  - Tech stack (becomes each Milestone's Tech Stack table)
  - Implementation plan (milestone breakdown and dependencies)
  - Third-party integrations (which to configure in which milestone)
  - Testing strategy (which test types for which milestone)

**Mockup Images:**
- If user provides image paths (Figma exports, wireframes, screenshots) → Analyze each via Claude vision
- Claude vision accepts: JPEG, PNG, WebP (up to 20MB per image)
- From each mockup, extract:
  - Screen name and purpose
  - UI components present (forms, tables, charts, modals, navigation)
  - User actions possible (click, submit, navigate, filter, search)
  - Data displayed (what entities and fields are visible)
  - UI complexity score (Simple/Medium/Complex → affects story point estimates)
- Map screens to milestones (core screens → Milestone 1-2, advanced → Milestone 3-4)

**Auto-Research:**
- Search: `"[tech stack] development milestone breakdown"` (e.g., "Next.js Supabase sprint breakdown")
- Search: `"[feature type] story point estimation"` (e.g., "auth system story points estimate")
- Search: `"[domain] typical development timeline"` for estimation calibration
- Incorporate findings to calibrate task estimates and setup steps

---

### Step 1B: Project Decomposition (Multi-Milestone Mode)

Using ingested context, apply **Work Breakdown Structure (WBS) + Rolling Wave Planning**:

**WBS Decomposition:**
- Level 1: Full project
- Level 2: Milestone (3-6 milestones typical, adjust to project complexity)
- Level 3: Feature area per milestone (2-5 feature areas)
- Level 4: Tasks per feature area (3-8 developer-ready tasks)

**Rolling Wave Planning:**
- Milestone 1-2: Full detail (week-by-week tasks, story points, acceptance criteria, API contracts)
- Milestone 3-4: Medium detail (feature list, high-level tasks, rough estimates)
- Milestone 5+: High-level only (goals, scope, known dependencies) — detail added when milestone approaches

**Standard Milestone Template:**

| Milestone | Typical Focus | Example Name |
|-----------|--------------|-------------|
| Milestone 0 | Environment setup, infrastructure, CI/CD, scaffolding | "Milestone 0: Infrastructure & Setup" |
| Milestone 1 | Core data model, authentication, basic CRUD | "Milestone 1: Foundation" |
| Milestone 2 | Primary feature set, core business logic | "Milestone 2: Core Features" |
| Milestone 3 | Secondary features, third-party integrations | "Milestone 3: Integrations & Advanced Features" |
| Milestone 4 | Performance hardening, security audit, testing | "Milestone 4: Hardening & QA" |
| Milestone 5 | Launch prep, monitoring, rollout | "Milestone 5: Launch & Monitoring" |

**Confirm with user (ONE question):**
> "I've broken your project into [N] milestones: [names list with 1-sentence goal each]. Should I generate all [N] milestone documents, or adjust the breakdown first?"

---

### Step 1C: Cross-Milestone Registry (Multi-Milestone Mode)

Before generating individual milestone documents, build the **Shared Context Registry** — the master data structure used by ALL milestone documents:

```
shared_context = {
  project: { name, tech_stack, repo_structure, environments },
  data_model: {
    tables: [...]              # Full schema from ERD
    migrations_by_milestone: { # Which migrations belong to which milestone
      "M0": [],
      "M1": ["001_create_users.sql", "002_create_projects.sql"],
      ...
    }
  },
  api_catalog: {
    endpoints: [...]           # All endpoints from ERD
    endpoints_by_milestone: {  # Which endpoints are built in which milestone
      "M1": ["POST /api/auth", "GET /api/users/:id"],
      ...
    }
  },
  environment: {               # Setup items from ERD infrastructure checklist
    by_milestone: {
      "M0": ["Create GitHub repo", "Configure Vercel", "Set up Supabase", ...]
    }
  },
  feature_flags: [             # All flags from ERD, assigned to introducing milestone
    { name, feature, milestone, status }
  ],
  cross_milestone_dependencies: {
    "M2": ["M1.auth_system_complete", "M1.db_migrations_applied"],
    "M3": ["M2.core_api_complete"],
    ...
  },
  tech_debt: []                # Grows as milestones complete
}
```

This registry is:
- Built once from PRD + ERD before any milestone document is generated
- Used as context when generating each milestone document
- Ensures each milestone document has accurate "what was built before" and "what this milestone delivers for next milestone"

---

### Step 2: Plan Each Milestone Document Structure

Read `references/milestone_template.md` for the full template. For each milestone, decide which sections to include based on milestone type and available context.

**Core Sections (always include):**

1. Cover Page — project name, milestone name/number, version, date, team, status badge
2. Milestone Overview — goal, duration, team, scope boundary, success criteria, linked PRD/ERD references
3. **Context: What Was Delivered Before** *(NEW — prevents developer confusion)*
   - For Milestone 1: "Starting from scratch"
   - For Milestone 2+: Exact list of deliverables from prior milestone (pulled from prior milestone's exit criteria)
   - APIs available at milestone start (from cross-milestone registry)
   - Database state at milestone start (tables/migrations already applied)
   - Environment state (accounts, configs, secrets already configured)
4. Tech Stack — component names, versions, purpose, status (Configured/Pending/Evaluating), assigned milestone
5. **Definition of Ready (DoR)** — prerequisites ensuring sprint start is viable:
   - Backlog items have acceptance criteria
   - Mockups finalized and approved (link to mockup files)
   - Test environments provisioned
   - All cross-milestone dependencies resolved (with evidence)
   - Technical spikes from previous milestone completed
6. Milestone Entry Criteria — specific, verifiable prerequisites (e.g., "Milestone 1 auth system JWT tokens working and tested", "DB migrations M001-M003 applied to staging")
7. Task Breakdown — **WEEK-WISE organized** with developer-ready tasks:
   - Each week: list tasks from ALL relevant work streams
   - Per task: name, description (specific enough to start without questions), priority (P0-P3), estimate (story points + hours), owner role, dependencies, status, linked US-ID and EP/TB IDs from ERD
   - Story point estimation: Fibonacci (1/2/3/5/8/13) for current milestone; T-shirt sizes (XS/S/M/L/XL) for future milestones
   - Velocity buffer: 20% of total capacity reserved for unplanned work (sprint failure research: >10% unplanned work kills delivery)
8. Task Dependency Map — visual Gantt chart showing task sequences, parallel streams, critical path
9. Acceptance Criteria Matrix — deliverable × testable conditions (Given/When/Then format, traces to US-IDs)
10. Environment & Setup Checklist — accounts, tools, repos, branches, CI/CD, API keys, secrets needed for THIS milestone (Day 1 complete)
11. API Contracts (Milestone Scope) — only the endpoints built or modified IN THIS MILESTONE (sliced from ERD catalog)
12. Database Changes (Milestone Scope) — only schema changes, migrations, seed data for THIS MILESTONE (sliced from ERD schema)
13. Testing Plan — test types relevant to this milestone's deliverables:
    - Unit tests (what to cover, coverage target)
    - Integration tests (what services to test together)
    - E2E tests (Playwright — user journeys covered this milestone)
    - API contract tests (if this milestone builds shared APIs consumed by other teams)
    - Security scans (if auth or payment features introduced)
    - CI gate requirements (which tests block merge)
14. **Feature Flag Strategy** — flags introduced this milestone:
    - Flag name, feature covered, rollout phase (dark launch → canary → GA)
    - Kill switch command
    - Retirement criteria
15. Risk & Blocker Register — milestone-specific risks:
    - Description, likelihood, impact, mitigation plan, escalation path, owner
    - Critical path tasks have zero tolerance — call these out
    - Time-boxed spikes for unknowns (max 3 days each)
16. **Rollback Plan** — mandatory:
    - Trigger conditions (error rate threshold, latency spike, critical bug)
    - Step-by-step revert process (git commands, DB migration reversal, config restore)
    - Data migration reversal strategy (for destructive schema changes)
    - Communication protocol (who to notify, how)
    - Post-rollback verification steps
17. Milestone Exit Criteria (Definition of Done) — specific, measurable checklist:
    - All tasks marked complete by assignees
    - Acceptance criteria verified for all deliverables
    - Test suite passing (unit, integration, E2E)
    - Code reviewed and merged to main
    - Staging environment updated and verified
    - Documentation updated (README, API docs, architecture docs)
    - Security checklist passed
    - Performance targets met
18. **Next Milestone Preview** — what the following milestone adds:
    - High-level goal and scope
    - Features that will BUILD on this milestone's deliverables
    - Infrastructure changes planned
    - New dependencies that will be introduced
19. Handoff Notes — what the next milestone team inherits:
    - What was actually delivered vs. planned
    - Deferred items and why (feeds next milestone's DoR)
    - Known technical debt introduced
    - Lessons learned
    - Updated cross-milestone registry state
20. Appendix — glossary, reference links, tool URLs, coding standards, naming conventions, sample data, Jira ticket format templates

**Optional Sections:**
- UI/UX Deliverables — screens and components being built this milestone
- Performance Targets — latency/throughput goals specific to this milestone's work
- Third-Party Integration Setup — new external services being integrated
- Data Migration Tasks — migrating data from legacy systems
- Documentation Deliverables — README updates, API docs, ADRs due this milestone
- Demo Script — what to show at end-of-milestone review

---

### Step 3: Write the Content

**Writing Principles:**

- **Tasks must be developer-ready** — each task specific enough to start without questions. Bad: "Build the auth system." Good: "Implement Clerk webhook handler at `/api/webhooks/clerk` that syncs `user.created` and `user.updated` events to the `users` table (clerk_id, email, display_name columns). Include idempotency check for duplicate events. Unit test the webhook signature verification. Reference: EP-003, TB-001."

- **Organize tasks by week** — week ranges (e.g., "Week 1", "Week 1-2") give developers clear sprint cadence and show parallel work within each period.

- **Acceptance criteria are non-negotiable** — every deliverable needs Given/When/Then criteria. Example: "Given a logged-in user, When they POST `/api/habits` with a valid habit name, Then a new habit is created with status 'active', the response returns 201 with the habit object, and the habit appears in GET `/api/habits` list."

- **Depend on the ERD, don't reinvent it** — API contracts and DB changes are SLICES of the ERD, not new specs. If the ERD defines an endpoint, the milestone document uses it as-is. New discoveries should trigger an ERD update.

- **Context awareness prevents confusion** — always open with what was delivered before this milestone. Developers joining mid-project should be able to start immediately from any milestone document.

- **Critical path is the real plan** — a flat task list is a wish list. Mark which tasks have zero float (must complete on time) and which can slip. The dependency map transforms a task list into a project plan.

- **Rollback is mandatory** — every milestone must have a documented rollback plan. "We can't roll back" = "we aren't ready to deploy."

- **Velocity buffer is real** — sprint failure research shows teams consistently overcommit. Always include 20% buffer for unplanned work, bugs, and context switching.

**Visual Content Planning:**

Plan at least 4-5 visual elements per milestone:

- **Task Breakdown Table** — priority, estimate, owner, status, dependencies, ERD refs
- **Dependency Graph / Gantt Chart** — visual timeline with parallel streams and critical path (Matplotlib)
- **Phase Scope Pie Chart** — effort distribution across work streams
- **Acceptance Criteria Matrix** — deliverable × criteria grid
- **Risk Severity Heat Map** — color-coded by critical/high/medium/low
- **API Endpoint Table** — method badges, paths, status (New/Modified/Existing)
- **Database Migration Table** — changes being made with migration order
- **Feature Flag Table** — names, rollout stage, kill switch
- **Testing Layer Summary** — test type × tool × coverage × CI gate
- **Tech Stack Table** — technology × version × purpose × status

---

### Step 4: Generate the DOCX

**Setup (one-time):**
```bash
pip install matplotlib requests --break-system-packages
npm install -g docx
```

**Generation pipeline:**
```bash
# Step 4a: Generate chart images (Gantt, pie, risk heatmap, etc.)
python3 scripts/generate_charts.py --type milestone --data milestone_data.json --output /tmp/milestone_charts/

# Step 4b: Generate diagram images
python3 scripts/generate_diagrams.py --data milestone_data.json --output /tmp/milestone_diagrams/

# Step 4c: Generate DOCX
node scripts/generate_milestone_docx.js --data milestone_data.json --charts /tmp/milestone_charts/ --diagrams /tmp/milestone_diagrams/ --output milestone_1_foundation.docx
```

**For Multi-Milestone generation, loop:**
```bash
for i in 0 1 2 3 4 5; do
  node scripts/generate_milestone_docx.js --milestone $i --project project_data.json --output milestone_${i}.docx
done
```

**DOCX Document Structure:**
- Cover page with milestone number badge (large colored circle), project title, team, status badge
- Table of Contents (hyperlinked, Heading levels 1-3)
- Color-coded sections by milestone type (setup=gray, foundation=blue, features=teal, hardening=orange, launch=green)
- Styled tables with dual widths, alternating rows, bold headers
- Embedded Gantt chart (Matplotlib PNG)
- Embedded scope distribution pie chart (Matplotlib PNG)
- Embedded risk heatmap (Matplotlib PNG)
- Callout boxes for Key Insights, Warnings, and Blockers
- Headers (project + milestone name), Footers (Page N)

**Color Palettes Available:**
- `engineering_dark` — Dark navy/cyan, technical (default for milestones)
- `corporate_blue` — Navy/steel blue, professional
- `modern_teal` — Teal/emerald, fresh
- `startup_vibrant` — Purple/coral, energetic
- `minimal_mono` — Grayscale, clean
- `nord_dev` — Arctic/frost, developer-centric

---

### Step 5: Review and Cross-Check

For SINGLE milestone, verify:
1. Every task is developer-ready (specific enough to start immediately)
2. Acceptance criteria exist for every deliverable (Given/When/Then format)
3. Dependency graph shows critical path
4. Environment setup checklist is Day-1 complete for a new team member
5. Entry criteria reference specific prior-milestone artifacts
6. Exit criteria are measurable (not subjective like "looks good")
7. API contracts and DB changes are SLICES of ERD (not independently invented)
8. Feature flag strategy covers naming, rollout phases, kill switches
9. Rollback plan has triggers, step-by-step procedures, and verification
10. "Context: What Was Delivered Before" section is accurate and complete
11. Next Milestone Preview is consistent with the multi-milestone breakdown

For MULTI-MILESTONE set, additionally verify:
1. DoR of Milestone N+1 matches Exit Criteria of Milestone N (the chain is consistent)
2. API endpoints appear in exactly ONE milestone as "New" (no duplicate building)
3. DB migrations appear in exactly ONE milestone (no duplicate creation)
4. Environment setup items from ERD are all assigned to Milestone 0
5. Feature flags track from introducing milestone through to retirement
6. Tech debt from Milestone N appears in Milestone N+1's DoR or backlog

---

### Step 6: Deliver

**Single milestone:** Save DOCX to user's workspace. Summary: milestone number/name, total tasks, estimated effort, key risks, critical path items.

**Multi-milestone set:** Save all DOCX files + a summary index table showing: milestone name, goal, duration, task count, key deliverables, dependencies on prior milestone.

Include note: "For projects initialized with `tech-project-forge`, these milestone documents serve as deep execution guides for each milestone in your forge-generated `docs/STATUS.md`."

---

### Step 7: Self-Improve (Run Overnight — Optional)

```bash
python3 scripts/improve_skill.py --skill milestone
```
Runs Karpathy auto-research loop against `eval/eval_milestone.json` binary assertions. Logs improvements to `eval/improve_log.json`.

---

## Key Design Principles

**1. Multi-Milestone Intelligence**
When PRD + ERD are available, the skill decomposes the ENTIRE project into milestones automatically using WBS + Rolling Wave Planning. Near milestones get full detail; far milestones get high-level planning (elaborated as they approach).

**2. Context Propagation**
Each milestone document opens with exactly what was delivered before it. Developers who join mid-project, return from leave, or pick up a context-switched task can onboard from a single document.

**3. ERD as Source of Truth**
API contracts and DB changes in milestone documents are SLICES of the ERD, not independent specs. This prevents drift between architecture documentation and sprint-level execution.

**4. Rolling Wave Planning**
Detailed planning for near milestones; high-level planning for far milestones. As the team delivers real progress, far milestone plans are elaborated with real velocity data — not early guesses.

**5. Cross-Milestone DoR/DoD Chain**
Milestone N's Exit Criteria (Definition of Done) automatically becomes Milestone N+1's Definition of Ready. This creates a disciplined quality gate chain across the project.

**6. Developer-Ready Tasks**
Every task should be specific enough that a developer can start working without asking questions. If someone needs to ask "what exactly does this task mean?", the task isn't ready.

**7. Scope = Contract**
What's listed in a milestone document is what gets built. What's not listed is explicitly out of scope for this milestone. Deferred items go in the Handoff Notes, preventing scope creep.

**8. Rollback is Mandatory**
No milestone document is complete without a rollback plan. If the team can't articulate how to undo this milestone's changes in under 30 minutes, they are not ready to deploy.

---

## Milestone Numbering and Naming Convention

| Milestone | Typical Focus | Example Name |
|-----------|--------------|-------------|
| Milestone 0 | Infrastructure, environment setup, CI/CD | "Milestone 0: Infrastructure & Setup" |
| Milestone 1 | Core data model, authentication, basic CRUD | "Milestone 1: Foundation" |
| Milestone 2 | Primary feature set, core business logic | "Milestone 2: Core Features" |
| Milestone 3 | Secondary features, third-party integrations | "Milestone 3: Integrations & Polish" |
| Milestone 4 | Performance hardening, security audit, testing | "Milestone 4: Hardening & QA" |
| Milestone 5 | Launch prep, monitoring, rollout strategy | "Milestone 5: Launch & Monitoring" |

This is a guideline — adapt to project needs. B2B SaaS might need 7 milestones; a simple MVP might need 3.

---

## Cross-Document Sync (PRD → ERD → Milestone)

**From PRD, Milestone consumes:**
- User story IDs (US-XXX) → referenced in task descriptions and acceptance criteria
- Goal IDs (GM-XXX) → referenced in milestone exit criteria
- Feature list per milestone → milestone scope definition
- User flows → task breakdown (each flow step often maps to one or more tasks)

**From ERD, Milestone consumes:**
- API endpoint catalog → per-milestone API Contracts (slice by milestone assignment)
- DB schema → per-milestone Database Changes (slice by migration milestone)
- Infrastructure checklist → Milestone 0 Environment Setup
- Feature flag strategy → per-milestone Feature Flag table
- Tech stack → Milestone Tech Stack table
- Implementation plan → Milestone task structure and dependencies
- NFR targets → Milestone exit criteria performance requirements

**Milestone outputs that feed forward:**
- Exit criteria → next milestone's Definition of Ready
- Handoff notes → next milestone's context section
- Tech debt list → next milestone's backlog items
- Updated cross-milestone registry state → next milestone document generation

**Traceability IDs:**
- Reference PRD story IDs in task descriptions: `US-003, US-007`
- Reference ERD component IDs: `CO-002 (auth service), EP-005 (POST /api/auth/login), TB-001 (users table)`
- Use format: `MS1-T001` for Milestone 1, Task 001; `MS1-AC001` for Milestone 1, Acceptance Criterion 001

**When No PRD or ERD Exists:**

| Available | Milestone Skill Action |
|-----------|----------------------|
| PRD + ERD (both) | Full auto mode — zero interview for technical content |
| PRD only | Auto-generates lightweight ERD sketch (tech stack, DB sketch, API sketch) before milestone planning |
| ERD only | Uses ERD implementation plan as milestone breakdown; asks 2 questions for missing business context |
| Neither | Full interview mode + recommends creating PRD and ERD first |
| Forge PROJECT_SPEC.md | Use this as combined PRD+ERD substitute for milestone generation |

---

## Reference Files

- `references/milestone_template.md` — Full Milestone Document template with all sections and examples
- `scripts/generate_milestone_docx.js` — Node.js docx.js DOCX generation script
- `scripts/generate_charts.py` — Matplotlib chart → PNG helper
- `scripts/generate_diagrams.py` — Kroki API / draw.io diagram → PNG helper
- `eval/eval_milestone.json` — Binary assertion test suite for self-improvement loop
- `scripts/improve_skill.py` — Karpathy auto-research self-improvement loop

---

## Example Invocations

**User says:** "Create all milestones for my e-commerce project — I have a PRD and ERD"
**Action:** Read PRD and ERD. Decompose into 5 milestones (M0: Infrastructure, M1: Product Catalog + Auth, M2: Cart + Checkout, M3: Order Management + Notifications, M4: Search + Reviews + Launch). Build cross-milestone registry. Generate all 5 DOCX files in order, each document aware of what came before. Deliver with summary index table.

**User says:** "Create Milestone 2 document for our SaaS dashboard — here's the PRD and ERD"
**Action:** Read PRD and ERD. Build registry. Identify that Milestone 2 covers: core dashboard features, data visualization components, and API endpoints EP-010 through EP-018. Generate single DOCX with full detail: week-by-week tasks, dependency Gantt, 8 API contracts sliced from ERD, 3 DB migrations sliced from ERD, feature flag for dashboard beta toggle.

**User says:** "Break our habit tracking app into milestones and create Milestone 1"
**Action:** Auto-research "habit tracking app milestone breakdown." Propose: M0 (Setup), M1 (Auth + Habit CRUD), M2 (Streaks + Stats), M3 (Notifications + Social), M4 (Launch). Confirm with user. Generate Milestone 1 DOCX with full detail: Clerk auth setup, habits/entries schema (sliced from ERD), 6 REST API endpoints, Playwright E2E for habit creation flow.

**User says:** "Create milestones from my tech-project-forge PROJECT_SPEC.md"
**Action:** Read `docs/PROJECT_SPEC.md` as combined context (treats it as PRD+ERD substitute). Extract: project overview, tech stack, data models, API endpoints, milestones from STATUS.md. Build registry. Generate deep execution milestone docs for each forge milestone, giving developers complete execution guidance that complements forge's scaffolded project structure.

**User says:** "I have mockups of 12 screens — generate milestones from these"
**Action:** Analyze all 12 mockup images via Claude vision. Extract screen inventory, user flows, UI component complexity. Map screens to milestones (login/signup + dashboard → M1, reports + settings → M2, admin panel + integrations → M3). Interview for tech stack. Generate 3 milestone DOCX files with screen-specific tasks derived from mockup analysis.
