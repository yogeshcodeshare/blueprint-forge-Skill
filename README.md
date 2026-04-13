<div align="center">

# Blueprint Forge

### The Ultimate Claude Code Skill Suite for Professional Document Generation

[![Claude Code Skill](https://img.shields.io/badge/Claude_Code-Skill-blueviolet?style=for-the-badge)](https://docs.anthropic.com/en/docs/claude-code)
[![Self-Improving](https://img.shields.io/badge/Self--Improving-AI-ff6b6b?style=for-the-badge)](./scripts/improve_skill.py)
[![Eval Assertions](https://img.shields.io/badge/Eval_Assertions-150-success?style=for-the-badge)](./eval/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

**3 Skills. 1 Pipeline. World-Class PRD + ERD + Milestone Documents in Minutes.**

[Quick Install](#-quick-install) · [Features](#-features) · [How It Works](#-how-it-works) · [Skill Architecture](#-skill-architecture) · [Self-Improvement](#-self-improvement-system)

---

*The spec-generation counterpart to [Tech Project Forge](https://github.com/yogeshcodeshare/Tech-project-forge-skill). Blueprint Forge creates the documents — Tech Project Forge builds the project from them.*

</div>

---

## Quick Install

**One command (works with any IDE):**

```bash
npx skills add yogeshcodeshare/blueprint-forge-Skill -y -g
```

> Works with: **Claude Code** · **Cursor** · **Cline** · **GitHub Copilot** · **Windsurf** · **Amp** · **Gemini CLI** · **Warp** · **OpenCode** and 35+ more agents.

<details>
<summary>Install for a specific IDE only</summary>

```bash
# Claude Code only
npx skills add yogeshcodeshare/blueprint-forge-Skill -y -a claude-code

# Cursor only
npx skills add yogeshcodeshare/blueprint-forge-Skill -y -a cursor

# Cline only
npx skills add yogeshcodeshare/blueprint-forge-Skill -y -a cline
```

</details>

<details>
<summary>Alternative Installation Methods</summary>

**Via git clone:**
```bash
git clone https://github.com/yogeshcodeshare/blueprint-forge-Skill.git ~/.claude/skills/blueprint-forge
```

**Manual:**
```bash
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git clone https://github.com/yogeshcodeshare/blueprint-forge-Skill.git blueprint-forge
```

</details>

**Then just say:**

```
"Create a PRD for my project"
"Write an ERD for my Next.js app"
"Generate all milestones from my PRD and ERD"
```

> After installation, restart Claude Code. Each skill auto-activates when you mention any [trigger phrase](#-trigger-phrases).

---

## The Full Pipeline

```
  You describe your project
          |
          v
  +-----------------+     +-----------------+     +-------------------+
  |   PRD Skill     | --> |   ERD Skill     | --> |  Milestone Skill  |
  |  (What & Why)   |     |  (How — Full    |     |  (What NOW —      |
  |                 |     |   System)       |     |   Per Sprint)     |
  +-----------------+     +-----------------+     +-------------------+
          |                       |                        |
          v                       v                        v
     PRD.docx               ERD.docx              Milestone_N.docx
          |                       |
          +----------+------------+
                     |
                     v
          +---------------------+
          | Tech Project Forge  |
          | (Auto-scaffolds     |
          |  complete project)  |
          +---------------------+
```

---

## Features

### 3 Specialized Skills in One Suite

| Skill | What It Generates | Key Sections |
|:------|:-----------------|:-------------|
| **PRD Skill** | Product Requirements Document (DOCX) | North Star Metric, JTBD + User Stories, User Flows, Error States, Privacy & Compliance (GDPR/CCPA), Accessibility (WCAG 2.1 AA), Launch Checklist, A/B Test Plan, AI Feature Spec |
| **ERD Skill** | Engineering Requirements Document (DOCX) | NFRs (FURPS+), ADRs, Database Schema + Data Dictionary, OpenAPI-style API Contracts, SLO/SLI/SLA with Error Budgets, LINDDUN Privacy Threat Model, IaC Notes, Cross-Team Dependency Map |
| **Milestone Skill** | Per-Milestone Execution Documents (DOCX) | Context (what was delivered before), DoR/DoD, Weekly Task Breakdown with Story Points, API Contracts Slice, DB Migration Slice, Feature Flags, Rollback Plan, Next Milestone Preview |

### What Makes It Different

| Feature | Details |
|:--------|:--------|
| **Editable DOCX Output** | Not PDF — stakeholders can annotate, revise, and track changes in Word/Google Docs |
| **Embedded Charts** | Gantt timelines, risk heatmaps, priority matrices, NFR radar charts (Matplotlib) |
| **Embedded Diagrams** | Architecture, ERD, sequence, user flow diagrams via Kroki API (Mermaid/PlantUML/DBML) |
| **Auto-Research** | Web search for latest best practices before generating each document |
| **Cross-Document Sync** | Traceability IDs (US-XXX, EP-XXX, TB-XXX, ADR-XXX) chain PRD -> ERD -> Milestone |
| **Multi-Milestone Mode** | Give it PRD + ERD -> auto-decomposes into 3-6 milestones with shared context registry |
| **Mockup Analysis** | Pass Figma exports / screenshots -> Claude Vision extracts screens and maps to milestones |
| **Forge Compatible** | Output designed for direct consumption by [Tech Project Forge](https://github.com/yogeshcodeshare/Tech-project-forge-skill) |
| **Self-Improving** | Karpathy-style eval loop with 150 binary assertions across 15 test prompts |
| **Professional Styling** | 7 color palettes, cover pages, TOC, headers/footers, callout boxes, status badges |

---

## How It Works

### Step-by-Step Workflow (Same for All 3 Skills)

```
Step 1: Context Ingestion
   - Auto-reads existing PRD/ERD if provided
   - Web search for domain-specific best practices
   - Analyzes mockup images via Claude Vision (if provided)

Step 2: Smart Interview
   - Asks only what it can't infer from existing docs
   - 5-8 targeted questions (not 20 generic ones)
   - PRD + ERD provided? Zero questions for Milestone Skill

Step 3: Document Planning
   - Builds section outline based on project complexity
   - Selects relevant optional sections automatically
   - Maps traceability IDs across documents

Step 4: Generation Pipeline
   pip install matplotlib requests --break-system-packages
   python3 scripts/generate_charts.py   -> /tmp/charts/*.png
   python3 scripts/generate_diagrams.py -> /tmp/diagrams/*.png
   npm install docx
   node scripts/generate_xxx_docx.js    -> output.docx

Step 5: Review & Cross-Check
   - Verifies cross-document consistency
   - Checks all traceability IDs are linked
   - Validates forge compatibility requirements

Step 6: Deliver
   - Professional DOCX with all sections, charts, and diagrams

Step 7: Self-Improve (Optional)
   python3 scripts/improve_skill.py --skill prd --eval-only
```

---

## Trigger Phrases

### PRD Skill
| Phrase | Action |
|:-------|:-------|
| "Create a PRD" | Generate Product Requirements Document |
| "Write a product spec" | Same as above |
| "PRD for my project" | Same as above |
| "Product requirements document" | Same as above |

### ERD Skill
| Phrase | Action |
|:-------|:-------|
| "Create an ERD" | Generate Engineering Requirements Document |
| "Write an engineering spec" | Same as above |
| "Technical spec for my project" | Same as above |
| "Engineering requirements document" | Same as above |

### Milestone Skill
| Phrase | Action |
|:-------|:-------|
| "Create a milestone document" | Generate single milestone execution doc |
| "Generate all milestones from my PRD" | Auto-decompose into 3-6 milestones |
| "Break project into milestones" | Same as above |
| "Sprint plan for milestone 2" | Generate specific milestone doc |
| "Create milestones for my project" | Multi-milestone mode with auto-sync |

---

## Skill Architecture

```
blueprint-forge/
├── PRD_Skill.md                    # PRD skill definition
├── ERD_Skill.md                    # ERD skill definition
├── Milestone_Skill.md              # Milestone skill definition
├── eval/
│   ├── eval_prd.json               # 5 prompts x 10 assertions = 50
│   ├── eval_erd.json               # 5 prompts x 10 assertions = 50
│   └── eval_milestone.json         # 5 prompts x 10 assertions = 50
├── references/
│   ├── prd_template.md             # PRD section reference + examples
│   ├── erd_template.md             # ERD section reference + examples
│   └── phase_template.md           # Milestone section reference + examples
└── scripts/
    ├── generate_charts.py          # Matplotlib -> PNG (Gantt, risk, radar)
    ├── generate_diagrams.py        # Kroki API -> PNG (arch, ERD, sequence)
    ├── generate_prd_docx.js        # docx.js PRD generator
    ├── generate_erd_docx.js        # docx.js ERD generator
    ├── generate_milestone_docx.js  # docx.js Milestone generator
    └── improve_skill.py            # Karpathy self-improvement loop
```

### Technology Stack

| Component | Technology | Purpose |
|:----------|:-----------|:--------|
| Document Generation | docx.js (Node.js) | Professional DOCX output with TOC, tables, images |
| Charts | Matplotlib (Python) | Gantt, risk heatmaps, scope charts, NFR radar |
| Diagrams | Kroki API (free, no auth) | Mermaid, PlantUML, DBML, Graphviz diagrams |
| Self-Improvement | Claude API + Python | Binary assertion eval loop |
| Styling | 7 built-in palettes | Corporate Blue, Modern Teal, Nord Dev, etc. |

---

## Cross-Document Sync

All three documents form a **traceable chain**:

```
PRD (What & Why)                ERD (How)                    Milestone (What NOW)
├── US-001 User Story    ──>   ├── CO-001 Component    ──>  ├── MS1-T001 Task
├── US-002 User Story    ──>   ├── EP-001 API Endpoint ──>  ├── MS1-T002 Task
├── GM-001 Goal Metric   ──>   ├── TB-001 DB Table     ──>  ├── MS1-AC001 Acceptance
└── GM-002 Goal Metric   ──>   └── ADR-001 Decision    ──>  └── Exit Criteria refs GM-001
```

**Rules:**
- Each ERD component references which PRD user stories it implements
- Each Milestone task references which ERD components it builds
- Each Milestone exit criteria references which PRD goals it proves
- All three documents use **identical names** for entities, features, and API endpoints

---

## Tech Project Forge Compatibility

Blueprint Forge outputs are designed for direct consumption by [Tech Project Forge](https://github.com/yogeshcodeshare/Tech-project-forge-skill):

| Forge Expects | Blueprint Forge Provides |
|:-------------|:-----------------------|
| Project name + description | PRD Cover Page |
| Goal type (Learning/MVP/Production) | PRD Cover Page metadata |
| User Flows (step-by-step) | PRD Section 10: User Flows |
| Entities with validation rules | ERD Section 5: Data Dictionary |
| Database type (SQL/NoSQL) | ERD Section 5: Database Configuration |
| API endpoints | ERD Section 5: Endpoint Catalog |
| Seed data requirements | ERD Section 5.1: Seed Data |
| Milestones with features | PRD Section 16 + Milestone docs |

---

## Self-Improvement System

Based on the **Karpathy auto-research pattern** — a continuous improvement loop that makes the skills better over time.

### How It Works

```
Loop (max 20 iterations):
  1. Run skill with test prompt -> capture output
  2. Evaluate each binary assertion (TRUE/FALSE)
  3. Calculate pass_rate = passing / total
  4. If pass_rate == 1.0 -> done
  5. Identify worst-failing assertion
  6. Propose ONE targeted change to SKILL.md
  7. Apply change -> re-evaluate
  8. If improved -> keep change
  9. If same/worse -> revert, try different assertion
  10. Log to eval/improve_log.json
```

### Running Self-Improvement

```bash
# Preview what would change (safe)
python3 scripts/improve_skill.py --skill prd --dry-run

# Run eval only (no changes)
python3 scripts/improve_skill.py --skill erd --eval-only

# Full auto-improvement loop
python3 scripts/improve_skill.py --skill milestone --max 10

# View improvement history
python3 scripts/improve_skill.py --report
```

### Eval Coverage

| Skill | Test Prompts | Assertions | Total Checks |
|:------|:------------|:-----------|:-------------|
| PRD | 5 diverse scenarios | 10 per prompt | 50 |
| ERD | 5 diverse scenarios | 10 per prompt | 50 |
| Milestone | 5 diverse scenarios | 10 per prompt | 50 |
| **Total** | **15** | **—** | **150** |

Assertions are **binary** (true/false) — no subjective judgment needed. Examples:
- "Document contains a North Star Metric section"
- "All acceptance criteria use Given/When/Then format"
- "Database type is explicitly declared"
- "Rollback Plan includes trigger conditions"

---

## DOCX Output Quality

### Professional Styling

Every generated DOCX includes:

- **Cover Page** — project name (72pt), subtitle, metadata table, horizontal rule
- **Table of Contents** — clickable, auto-generated from headings 1-3
- **Styled Tables** — header row (bold + shaded), alternating row colors, cell padding
- **Embedded Charts** — Gantt timelines, risk heatmaps, priority matrices (PNG via Matplotlib)
- **Embedded Diagrams** — architecture, ERD, sequence, user flow (PNG via Kroki API)
- **Callout Boxes** — Key Insight (blue), Warning (orange), Note (purple), Danger (red)
- **Headers** — project name + date on every page
- **Footers** — "Page N of M" on every page
- **Status Badges** — color-coded inline: Active (green), Draft (orange), Blocked (red)

### 7 Color Palettes

| Palette | Primary | Best For |
|:--------|:--------|:---------|
| `corporate_blue` | Navy | Enterprise, formal documents |
| `modern_teal` | Teal | Startups, modern brands |
| `engineering_dark` | Dark blue | Technical audiences |
| `sprint_green` | Forest green | Milestone/sprint documents |
| `nord_dev` | Arctic dark | Developer-focused |
| `startup_vibrant` | Purple | Pitch decks, investor docs |
| `minimal_mono` | Charcoal | Clean, distraction-free |

---

## Requirements

| Dependency | Install Command | Used By |
|:-----------|:---------------|:--------|
| Node.js 18+ | (pre-installed on most systems) | DOCX generators |
| docx (npm) | `npm install docx` | DOCX generators |
| Python 3.8+ | (pre-installed on most systems) | Charts + diagrams |
| matplotlib | `pip install matplotlib --break-system-packages` | Chart generation |
| requests | `pip install requests --break-system-packages` | Kroki API calls |
| anthropic (optional) | `pip install anthropic --break-system-packages` | Self-improvement loop |

---

## Example Usage

### Generate a PRD

```
You: "Create a PRD for a habit tracking mobile app using Next.js and Supabase"

Blueprint Forge:
  1. Searches web for "habit tracking app PRD best practices 2025"
  2. Asks 5-8 targeted questions about your specific requirements
  3. Generates charts (Gantt timeline, risk heatmap, scope chart)
  4. Generates diagrams (architecture, user flow)
  5. Builds professional DOCX with 19 sections
  6. Delivers: habit_tracker_prd.docx (editable Word document)
```

### Generate All Milestones from PRD + ERD

```
You: "Generate all milestones from my PRD and ERD" 
     [attaches PRD.docx and ERD.docx]

Blueprint Forge:
  1. Reads PRD: extracts features, user stories, timeline
  2. Reads ERD: extracts API catalog, DB schema, tech stack
  3. Auto-decomposes into 5 milestones (WBS + Rolling Wave)
  4. Confirms breakdown: "I've planned 5 milestones: [list]. Proceed?"
  5. Generates 5 DOCX files with cross-milestone data sync
  6. Each milestone knows exactly what prior milestones delivered
  7. Delivers: milestone_0.docx through milestone_4.docx
```

---

## Contributing

Contributions welcome! This skill improves through:

1. **Adding eval assertions** — edit `eval/eval_*.json` to add new test scenarios
2. **Running the improvement loop** — `python3 scripts/improve_skill.py --skill prd`
3. **Template enhancements** — improve `references/*.md` templates
4. **New chart/diagram types** — extend `scripts/generate_charts.py` or `scripts/generate_diagrams.py`

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Blueprint Forge** creates the blueprints. **[Tech Project Forge](https://github.com/yogeshcodeshare/Tech-project-forge-skill)** builds from them.

Together, they take you from idea to production-ready project.

*Built with Claude Code*

</div>
