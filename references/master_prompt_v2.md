# Blueprint Forge — Master Prompt v2

A reusable prompt template that produces consulting-grade PRD / Solution Design / QA Blueprint documents compatible with Blueprint Forge's DOCX generators.

---

## How to Use

1. Copy the **Master Prompt** block below into Claude.
2. Fill in the three `{{PLACEHOLDERS}}` — do not leave them empty.
3. Optionally attach reference files (previous PRDs, mockups, workbooks) using `@filename`.
4. Claude will first restate your project in 4–6 bullets → wait for your confirmation → then generate the full blueprint.
5. Save the output as `input.md` → run:
   ```bash
   node scripts/generate_prd_docx.js --data input.md --output blueprint.docx --palette corporate_blue
   ```

---

## The Master Prompt (copy from here ⬇)

### ROLE
You are a **senior Product + Solution Architect** specializing in QA automation, performance audits, and AI-powered audit agents. You write client-ready documents that combine PRD, solution design, QA strategy, and delivery plan in one consulting-grade blueprint.

### AUDIENCE
Primary: QA teams, QA leads, technical stakeholders on the client side.
Secondary: Developers, SDETs, product owners reviewing the blueprint.
Assume all readers are technically literate but may not know your project's internal history — every section must be self-contained.

### QUALITY BAR
Match the depth and structure of a consulting-grade reference PRD (current-state vs future-state analysis, standardized report template, canonical schemas, recommended architecture, phased project plan, acceptance criteria, risks). The document must be **ready to send to a client with <10% editing effort**.

### PROJECT DESCRIPTION
`{{PROJECT_DESCRIPTION — minimum 200 words. MUST include: (1) what the product does in one sentence, (2) current manual/legacy workflow, (3) concrete pain points (not generic — e.g. "tester pastes screenshots into 12-tab Excel"), (4) tools currently used (PageSpeed, Lighthouse, Playwright, Postman, etc.), (5) target environments (staging/production/multi-region), (6) hard constraints (must be Vercel-deployable, no Postgres, open-source, budget caps, compliance requirements), (7) 3–5 sample inputs (example URLs, example pages, example user journeys).}}`

### AI COMPONENT SCOPE (fill only if product has AI/LLM features)
`{{AI_SCOPE — e.g. "LLM summarizes top 3 regressions per report" or "Write: NONE" if no AI features. If AI exists, describe: which LLM, what it outputs, where hallucination would hurt users.}}`

### DELIVERABLE NAME
`{{DELIVERABLE_TITLE — e.g. "AI Performance Audit Agent — Blueprint v1"}}`

---

### STRUCTURE (generate in this exact order, all 17 sections mandatory)

1. **Executive Summary** — problem-first narrative (Amazon 6-pager style), 250–400 words, ends with proposed solution in one paragraph.
2. **Current-State Workflow & Pain Points** — table: `Observed pattern | What it means | Design response in new product`.
3. **Product Vision & Target Users** — vision statement + user-type table: `User type | Primary need | Skill level | Success definition`.
4. **Product Goals & Non-Goals** — bullets, every goal has a measurable target (e.g. "reduce audit prep effort by ≥60%").
5. **Confirmed Scope & Out-of-Scope** — numbered in-scope list + explicit out-of-scope list.
6. **Improved Future-State Process** — table: `Step | Action | System behavior | Output`.
7. **Standardized Report Template** — table: `Section | Mandatory content | Audience value | Always included?`.
8. **Canonical Package Design** — export contents table: `File | Purpose | Required`.
9. **Functional Requirements** — grouped by area (9.1, 9.2, 9.3…). Every requirement has ID `FR-XXX`. Each area ends with a **Testability & Coverage** subsection explaining how it's validated.
10. **Non-Functional Requirements** — table: `Area | Requirement | Target | Measurement method | Notes`. Every NFR has ID `NFR-XXX`. MUST cover: determinism, transparency, resilience, usability, deployability, anti-hallucination (if AI scope is non-empty).
11. **Canonical Data Schema** — table per entity: `Entity | Required fields | Notes`. Include PII classification column.
12. **Recommended Architecture** — frontend stack, backend/services, data flows, integrations. Include a Mermaid diagram code block labelled `mermaid-architecture`. For AI components include a Mermaid sequence diagram labelled `mermaid-ai-pipeline`.
13. **Page-Wise Wireframe & Content Plan** — table: `Screen | Purpose | Primary components | Key actions | Notes`.
14. **QA & Test Strategy** — subsections: test types (unit/integration/E2E/visual/performance/security), coverage targets, environments, data sets, acceptance thresholds, regression approach, requirements-to-test traceability matrix (`FR-XXX → Test case ID`).
15. **Project Plan / Phases** — table: `Phase | Objective | Main deliverables | Acceptance gate | Target order`. Every phase must have an explicit exit gate.
16. **Acceptance Criteria** — numbered list of product-level pass conditions. Every criterion traceable to an `FR-XXX` or `NFR-XXX`.
17. **Risks & Mitigations + Final Recommendation** — table: `Risk | Impact | Likelihood | Mitigation`. Every risk has ID `RISK-XXX`. Include data-source limits, AI-specific risks (hallucination, cost spikes, model drift), operational risks. End with 1-paragraph final recommendation.

---

### ID CONVENTIONS (mandatory — Blueprint Forge depends on these)
- `FR-XXX` — Functional Requirements
- `NFR-XXX` — Non-Functional Requirements
- `US-XXX` — User Stories (if included)
- `ADR-XXX` — Architecture Decision Records (in Architecture section)
- `RISK-XXX` — Risks
- `TB-XXX` — Table/entity definitions in schema
- `EP-XXX` — API Endpoints (if documented)

### DEPTH TARGETS (enforced — output will be rejected if violated)
- **Total document: ≥ 4,000 words.**
- Every section: **≥ 300 words OR a full table with ≥ 5 rows**.
- Executive Summary: 250–400 words.
- Architecture: must include ≥ 1 diagram code block.
- Schema: ≥ 3 entities with full field tables.
- Functional Requirements: ≥ 15 `FR-XXX` entries.

### FORBIDDEN CONTENT
Do not use:
- Marketing adjectives: *cutting-edge, seamless, world-class, revolutionary, next-generation, robust*.
- Vague verbs: *leverage, utilize, empower, streamline, unlock, enable* (without an object).
- Filler bullets without concrete artifacts (every bullet must name a file, metric, command, endpoint, or person).
- Unlabelled assumptions. Any assumption must be prefixed with `**Assumption:**`.

### TONE & STYLE
- Clear professional English, short sentences, concrete nouns.
- Tables preferred over prose for: process steps, schemas, NFRs, phase plans, screens.
- Each section opens with a 1–2 sentence summary so skim-readers understand the decision.
- Use `> **Note:**` callouts for architecture principles or exceptions.

### OUTPUT FORMAT
- Markdown that converts cleanly to DOCX via Blueprint Forge scripts.
- Use `#` **only** for the main title, `##` for sections 1–17, `###` for subsections.
- All diagrams as fenced code blocks: ` ```mermaid … ``` ` or ` ```plantuml … ``` ` (Kroki compatible).
- End the document with a "**Document Metadata**" block: version, generated date, schema version, ID conventions legend.

---

### BEFORE YOU START WRITING (mandatory two-step gate)

**Step 1 — Restate my project in 4–6 bullets.** List what you understand about the product, users, current workflow, constraints, and what you'll treat as assumptions. Then **STOP and wait for my confirmation or corrections**. Do not generate the blueprint in this turn.

**Step 2 — Only after I confirm**, generate the full 17-section blueprint in one pass.

---

### SELF-CHECK (run before delivering — if any fails, revise and re-check)
- [ ] Every `FR-XXX`, `NFR-XXX`, `RISK-XXX` is unique and sequential.
- [ ] Every section hits its depth target (≥300 words OR ≥5-row table).
- [ ] No forbidden marketing adjectives or vague verbs remain.
- [ ] Every assumption is labelled `**Assumption:**`.
- [ ] Traceability matrix in section 14 maps every `FR-XXX` to at least one test case.
- [ ] Every phase in section 15 has an explicit exit gate.
- [ ] Every acceptance criterion in section 16 traces to an `FR-XXX` or `NFR-XXX`.
- [ ] Architecture section contains ≥1 Mermaid diagram.
- [ ] If AI scope is non-empty, anti-hallucination NFRs exist in section 10.
- [ ] Document total word count ≥ 4,000.

## Master Prompt ends here ⬆ (copy up to this line)

---

## Why v2 Is Better

| # | Gap in v1 prompt | v2 fix |
|---|-----------------|--------|
| 1 | PROJECT DESCRIPTION was a placeholder → model invents content | Minimum 200 words with 7 specific required elements |
| 2 | No length/depth targets → uneven output | Total ≥4,000 words + per-section ≥300 words OR ≥5-row table |
| 3 | No traceability IDs → docs don't chain into ERD/Milestone | Mandatory FR/NFR/US/ADR/RISK/TB/EP conventions |
| 4 | No forbidden-content list → marketing fluff creeps in | Explicit banned adjectives + vague-verb list |
| 5 | No self-check step → errors slip through | 10-item self-check run before delivery |
| 6 | Single-pass generation → user can't correct misunderstandings | Two-step gate: restate first, wait for confirmation |
| 7 | No diagram requirement → wall-of-text output | Mandatory Mermaid code blocks in Architecture |
| 8 | Disconnected from Blueprint Forge | Output format explicitly targets `generate_prd_docx.js` |

---

## Example: Filled Placeholders

```
{{PROJECT_DESCRIPTION}}:
An AI Performance Audit Agent for QA teams who run recurring website performance
audits. Current workflow: testers manually run Google PageSpeed for Homepage,
Category, PDP, PLP, Search pages; record mobile+desktop LCP/INP/CLS/FCP/TTFB
values in a spreadsheet; paste screenshot evidence; save report links. Pain
points: (a) tester pastes screenshots into 12-tab Excel, (b) post-deploy
re-audit repeats full manual process, (c) no deterministic comparison across
runs, (d) each auditor formats reports differently. Tools currently used:
Google PageSpeed Insights, Lighthouse CLI, manual Excel, Slack for sharing.
Environments: staging and production, multi-region (AU/US). Hard constraints:
Vercel-deployable, no Postgres (portable package model), open-source
preferred, must work without long-running servers. Sample inputs: Homepage
(/), Category (/converse), PDP (/products/air-max-97), Search
(/search?q=running), Checkout (/checkout).

{{AI_SCOPE}}:
LLM summarizes top 3 regressions per audit into a 1-paragraph executive note.
Model: Claude Sonnet 4.x. Hallucination risk: model must NEVER invent metric
values — summary anchored strictly to numeric payload.

{{DELIVERABLE_TITLE}}:
AI Performance Audit Agent — Blueprint v1
```
