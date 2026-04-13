---
name: prd-skill
description: >
  Generate world-class, publication-quality Product Requirements Documents (PRDs) as professionally
  designed DOCX files. Use this skill any time someone asks to create, write, draft, generate, or build
  a PRD, product requirements document, product spec, feature spec, requirements document, engineering spec,
  technical requirements, project proposal, or product brief.
  Also triggers on "PRD for [feature]", "write requirements for", "spec out [feature]", "document requirements",
  "product document for client", "project kickoff document", "showcase to management", "project proposal",
  "create product spec", "working backwards document", "Amazon 6-pager", or any request to define
  what to build and why before engineering begins.
  Output is always a professionally designed DOCX (editable Word document) with cover page, TOC,
  color-coded sections, embedded charts, architecture diagrams, tables, and visual hierarchy —
  designed to impress clients, stakeholders, and management at first glance.
  Default to DOCX output because editable Word documents allow stakeholders to annotate, revise,
  and share with tracked changes.
---

# PRD Skill — World-Class Product Requirements Document Generator

## Purpose

This skill creates **publication-quality PRDs** as beautifully designed DOCX files. The PRDs follow best practices from Google, Amazon, Stripe, Linear, and Notion — combining Amazon's problem-first 6-pager style with rich visual documentation (user journey maps, architecture diagrams, priority matrices, timeline charts). The goal: produce documents that impress on first glance AND give engineers everything they need to build correctly.

---

## Workflow Overview

### Step 1: Auto-Research + Context Ingestion

**Before asking the user anything:**

1. **Check for existing documents** in the current directory:
   - If an ERD exists → read it for tech stack, constraints, API info
   - If Milestone/Phase documents exist → extract timeline context
   - If mockup images are provided → analyze via Claude vision to extract screens and user flows

2. **Auto-research** (web search, 2-3 queries):
   - Search: `"[product domain] PRD best practices 2025"` (e.g., "fintech PRD best practices 2025")
   - Search: `"[feature type] product requirements template"` (e.g., "AI chatbot product requirements")
   - Incorporate 2-3 current, domain-relevant insights into the document

3. **Then interview the user** (only for missing context):
   - Project name and one-line summary — what is being built?
   - **Goal type** — Learning / Validating / Prototyping / MVP / Production *(used by Tech-Project-Forge)*
   - Target audience for this PRD (client pitch / engineering kickoff / management review / investor)
   - Problem statement — what pain point or opportunity does this address?
   - Key features / scope — major capabilities (bullet points OK)
   - Success metrics — how will we know this succeeded? (KPIs, OKRs, targets)
   - Timeline / milestones — known deadlines or sprint plans?
   - Technical constraints — platform, tech stack, integrations, compliance?
   - Stakeholders — decision-makers and contributors?
   - Any existing docs, notes, or briefs to incorporate?

   If user provides a detailed prompt covering most of this, skip redundant questions.

---

### Step 2: Plan the Document Structure

Read `references/prd_template.md` for the full template. Decide which sections to include based on user input.

**Core sections (always include):**

1. Cover Page — project name, **goal type**, version, date, author, status badge
2. Executive Summary — problem-first narrative (Amazon 6-pager style: state the problem before the solution)
3. Problem Statement — specific pain point, who feels it, quantified impact
4. North Star Metric — the single number that proves success *(NEW)*
5. Goals & Success Metrics — measurable objectives with target values (KPIs, OKRs)
6. Scope — what's in AND what's explicitly out-of-scope (prevents scope creep)
7. User Personas — name, role, goals, pain points, technical proficiency
8. User Stories / Job Stories — requirements using both formats:
   - User Story: `As a [persona], I want [action] so that [benefit]`
   - Job Story (JTBD): `When [situation], I want to [motivation], so I can [outcome]`
   - Each with MoSCoW priority (Must/Should/Could/Won't) and ID (US-001, US-002...)
   - All acceptance criteria in BDD Given/When/Then format
9. User Flows *(NEW — required for Tech-Project-Forge compatibility)*
   - Step-by-step narrative of primary user journeys (numbered steps)
   - At least one flow per major feature
   - Example: "1. User opens app → 2. Clicks 'New Project' → 3. Fills form → 4. System creates project → 5. Redirects to project dashboard"
10. Error States & Edge Cases *(NEW)* — network failures, empty states, invalid input, rate limiting, conflict resolution per major feature
11. Technical Architecture Overview — layered system diagram (auto-generated from `architecture_components` data)
12. Telemetry & Analytics Hooks — events, funnels, dashboards, instrumentation plan (SDK, event schema, data destinations)
13. Privacy & Compliance *(NEW)* — applicable regulations (GDPR/HIPAA/CCPA/PCI DSS), PII fields list, data retention policy, right-to-delete approach, user consent mechanism
14. Accessibility Requirements *(NEW)* — WCAG 2.1 Level AA, keyboard navigation, screen reader (ARIA), color contrast ≥4.5:1, focus indicators, alt text
15. Timeline & Milestones — phased delivery plan with dates and milestone-level feature lists
16. Risks & Mitigations — risk matrix (severity × likelihood) with specific mitigation per risk
17. Launch Checklist *(NEW)* — product readiness, analytics setup, marketing, support, legal review, performance benchmarks
18. Appendix — glossary, references, open questions, decision log

**Optional sections (include when relevant):**

- Competitive Analysis — positioning, feature comparison matrix
- Localization / i18n — supported languages, RTL, date/number formatting *(NEW)*
- A/B Test Plan — hypothesis, metric, traffic split, success threshold *(NEW)*
- Data Model / API Contracts — high-level entity relationships (for technical audiences)
- Budget / Resource Allocation — headcount, infrastructure costs, third-party API costs
- Dependencies & Integration Points — external systems, partner APIs
- Go-To-Market (GTM) Summary — launch channels, messaging, rollout plan, adoption metrics
- UI/UX Requirements — key screens list, layout preferences, design system, component library *(NEW — required for Forge)*
- AI Feature Specification *(NEW — only when product includes AI/LLM features)*:
  - Quality metrics (accuracy %, hallucination rate limit, latency targets)
  - Evaluation framework (labeled test sets, validation process, update cadence)
  - Conversation design and guardrails (topics to avoid, fallback handling, safety filters)
  - Prompt engineering documentation (system prompt template, parameters)
  - Model monitoring and feedback loops (drift detection, retraining triggers)
  - Transparency disclosures (when/how to tell users AI is involved)
- Working Backwards / Press Release *(NEW — Amazon-style)* — hypothetical press release announcing successful launch

---

### Step 3: Write the Content

**Writing Quality Standards:**

- **Problem before solution** — every section explains WHY before WHAT (Amazon 6-pager style)
- **Dense and specific** — "improve load time by 40%" beats "make it faster"; "≤200ms p95 API response" beats "fast API"
- **Audience-calibrated** — client pitch emphasizes ROI; engineering audience gets technical constraints and BDD criteria; management gets timeline, risks, resources
- **JTBD alongside User Stories** — give both formats for key features to surface context and outcomes
- **Active voice, short paragraphs** — 3-4 sentences max per paragraph
- **MoSCoW consistently applied** — every requirement has a priority
- **All acceptance criteria in BDD** — `Given [context], When [action], Then [outcome]` — directly maps to automated test cases
- **Traceability IDs** — tag every user story (US-001), goal (GM-001) for ERD cross-reference

**Visual Content Planning:**

Plan at least 4-5 visual elements per PRD. These are not decoration — they make complex information immediately scannable:

- **Priority matrix chart** — features by effort vs. impact (smart label placement)
- **Timeline / Gantt-style chart** — milestones with auto-fit labels
- **Risk heat map** — severity vs. likelihood grid (5×5)
- **Goals bar chart** — KPIs with current vs. target values
- **System architecture diagram** — layered component flow (frontend → API → service → data → external)
- **User journey map** — stages, actions, emotional state, pain points, opportunities
- **Donut/pie chart** — scope distribution, feature splits, user segments
- **User flow diagram** — navigation flow between screens (via Mermaid → Kroki API)

---

### Step 4: Generate the DOCX

**Setup (one-time):**
```bash
pip install matplotlib requests --break-system-packages
npm install -g docx   # or: npm install docx
```

**Generation pipeline:**
```bash
# Step 4a: Generate chart images
python3 scripts/generate_charts.py --type prd --data prd_data.json --output /tmp/prd_charts/

# Step 4b: Generate diagram images (Kroki API — architecture, flows)
python3 scripts/generate_diagrams.py --data prd_data.json --output /tmp/prd_diagrams/

# Step 4c: Generate DOCX
node scripts/generate_prd_docx.js --data prd_data.json --charts /tmp/prd_charts/ --diagrams /tmp/prd_diagrams/ --output output_prd.docx
```

**DOCX Document Structure:**
- Cover page (Arial 36pt title, metadata table: Version/Date/Author/Goal Type/Status badge)
- Table of Contents (hyperlinked, auto-generated from Heading styles, levels 1-3)
- Sections with Heading1/2/3 (Arial, color-coded by palette)
- Styled tables (dual widths, alternating rows, bold headers, cell margins)
- Embedded chart PNGs (Matplotlib → ImageRun)
- Embedded diagram PNGs (Kroki API → ImageRun)
- Callout boxes (single-cell table with shading: Key Insight / Warning / Note)
- Status badges (colored TextRun: green=Active, orange=Draft, red=Blocked)
- Headers (project name left, date right via tab stop)
- Footers (Page N, right-aligned)

**Diagram Generation (draw.io MCP or Kroki API):**

If `jgraph/drawio-mcp` is configured in Claude Code settings, use it to generate editable `.drawio` architecture diagrams via the `search_shapes` tool (10,000+ shapes).

Otherwise, use Kroki API (free, no auth):
```python
# In generate_diagrams.py
import requests, base64, zlib

def render_mermaid(diagram_text, output_path):
    encoded = base64.urlsafe_b64encode(zlib.compress(diagram_text.encode())).decode()
    url = f"https://kroki.io/mermaid/png/{encoded}"
    resp = requests.get(url, timeout=30)
    with open(output_path, "wb") as f:
        f.write(resp.content)
```

**Color Palettes Available (set `palette_name` in data):**
- `corporate_blue` — Navy/steel blue, professional (default)
- `modern_teal` — Teal/emerald, fresh and innovative
- `executive_dark` — Charcoal/gold, premium and authoritative
- `startup_vibrant` — Purple/coral, energetic and creative
- `minimal_mono` — Grayscale with accent, clean
- `nord_dev` — Arctic/frost, developer-centric (#2E3440 primary, #88C0D0 accent)

---

### Step 5: Review and Refine

After generating the DOCX, verify:

1. All core sections present and correctly formatted
2. Every user story has a unique ID (US-XXX) and BDD acceptance criteria
3. Every goal has a unique ID (GM-XXX) with measurable numeric target
4. North Star Metric clearly defined
5. Error states documented for every major feature
6. Privacy & Compliance section lists specific applicable regulations and PII fields
7. Accessibility requirements call out WCAG 2.1 AA minimum
8. Launch Checklist is complete and actionable
9. User Flows give step-by-step narratives (for Forge extraction)
10. Timeline milestones include feature lists per milestone (for Forge extraction)
11. Technical constraints section is complete enough for ERD team to start
12. At least 4-5 visual elements embedded
13. Charts and diagrams render correctly and are legible
14. TOC links are functional
15. Document reads coherently from cover to appendix

If anything is off, adjust the data dictionary and regenerate.

---

### Step 6: Deliver

Save the final DOCX to the user's workspace. Include a brief summary of:
- Project and goal type
- Number of user stories (Must Have vs. Should Have vs. Could Have)
- Key risks identified
- Suggested next document (ERD) with what to provide to the ERD Skill

---

### Step 7: Self-Improve (Run Overnight — Optional)

After generating a PRD, optionally run the self-improvement loop:

1. Review `eval/eval_prd.json` — add test prompts based on real user requests
2. Run: `python3 scripts/improve_skill.py --skill prd`
3. Loop runs autonomously using Karpathy auto-research pattern:
   - Read SKILL.md → Make ONE change → Run binary assertion tests → Check pass_rate → Keep if improved / Revert if worse → Repeat until 100% pass rate or 20 iterations
4. Review `eval/improve_log.json` for what changed and why

---

## Key Design Principles

**1. Problem-First, Amazon 6-Pager Style**
The Executive Summary must state the customer problem before describing the solution. Teams that write the solution first anchor on features instead of outcomes.

**2. Audience-First Writing**
Client pitch → business value, ROI, competitive differentiation. Engineering kickoff → technical constraints, BDD acceptance criteria. Management review → timeline, risks, resource needs.

**3. JTBD Over Generic User Stories**
"When I'm reviewing a vendor proposal, I want to compare pricing quickly, so I can make a decision before the meeting ends" captures context and outcome better than "As a user, I want to compare prices."

**4. Scope Discipline**
The "Out of Scope" section is as important as "In Scope." It prevents scope creep and sets expectations. Be explicit about what this version will NOT do.

**5. Observability by Default**
Every feature must have at least one tracked event. Never launch a feature without knowing how to measure its success.

**6. Privacy by Design**
PII fields must be identified at requirements time, not after schema design. GDPR right-to-delete, data retention, and consent mechanisms belong in the PRD.

**7. Living Document**
Include version, date, status (Draft/Review/Approved), and changelog. PRDs evolve — make it easy to track what changed.

---

## Cross-Document Sync (PRD → ERD → Milestone)

The PRD is the first document in a three-document chain. For the chain to work:

**PRD outputs that ERD consumes:**
- User story IDs (US-001...) → ERD traces each component to implementing story IDs
- Goal IDs (GM-001...) → ERD SLO targets trace back to GM-IDs
- Technical constraints section → ERD ADR decision context
- Privacy & Compliance section → ERD LINDDUN threat model inputs
- Timeline milestone names → ERD implementation plan phase names
- AI Feature Specification (if present) → ERD AI/LLM System Design section

**PRD outputs that Tech-Project-Forge consumes:**
- Goal Type field (cover page) → forge calibrates setup complexity
- User Flows section → forge extracts step-by-step navigation
- UI/UX Requirements (if present) → forge generates slash commands and component stubs
- Timeline milestones with feature lists → forge creates milestone board
- Third-party integrations → forge configures MCP servers and `.env` variables

**Cross-document review checklist (before delivery):**
- [ ] Every user story has ID (US-XXX) and BDD criteria
- [ ] Every goal has ID (GM-XXX) with numeric target
- [ ] Goal Type field is set on cover page
- [ ] User Flows section has step-by-step narratives
- [ ] Technical constraints complete for ERD team
- [ ] Privacy regulations explicitly named
- [ ] Milestone names will match ERD implementation plan names
- [ ] If AI features: AI Feature Spec section is complete

---

## Layout Intelligence (Automatic in Generation Script)

1. **Cover Page Title Auto-Sizing** — scales from 36pt down to 18pt to prevent overflow
2. **Empty Column Stripping** — removes table columns where all rows are empty
3. **Auto-Proportional Column Widths** — allocates width proportionally to content length (40pt minimum)
4. **Dynamic TOC** — built from actual Heading styles; excludes sections with no data
5. **Type-Safe Data Handling** — all data access uses safe getters with defaults

---

## Reference Files

- `references/prd_template.md` — Full PRD template with all sections, guidance, and examples
- `scripts/generate_prd_docx.js` — Node.js docx.js DOCX generation script
- `scripts/generate_charts.py` — Matplotlib chart → PNG image helper
- `scripts/generate_diagrams.py` — Kroki API / draw.io diagram → PNG helper
- `eval/eval_prd.json` — Binary assertion test suite for self-improvement loop
- `scripts/improve_skill.py` — Karpathy auto-research self-improvement loop

---

## Example Invocations

**User says:** "Create a PRD for a real-time chat feature in our mobile app"
**Action:** Auto-research "mobile chat PRD best practices 2025". Ask 2-3 targeted questions (goal type, audience, tech constraints). Generate full PRD with user journey map, architecture diagram, BDD acceptance criteria, telemetry plan, privacy section (message data PII), error states (offline handling, message delivery failure), and milestone timeline.

**User says:** "I need a product spec to present to the client for our e-commerce redesign"
**Action:** Client-facing PRD → emphasize business value, ROI, competitive analysis. Use executive_dark palette. Include GTM summary, budget section, A/B test plan. Goal type = MVP. Include user flows for checkout journey and product discovery.

**User says:** "Write requirements for an AI-powered customer support agent — engineering audience"
**Action:** Include AI Feature Specification section: accuracy target ≥95%, hallucination rate <2%, system prompt documentation, evaluation dataset description, guardrails for out-of-scope queries. Use nord_dev palette. Heavy on BDD criteria, architecture diagram showing LLM integration, telemetry for AI quality monitoring.

**User says:** "Create PRD and I'll feed it to my tech-project-forge skill"
**Action:** Ensure Goal Type is on cover page, User Flows section is detailed with numbered steps, UI/UX Requirements section present, third-party integrations listed clearly, milestone table includes feature list per milestone. This makes the forge extraction reliable and complete.
