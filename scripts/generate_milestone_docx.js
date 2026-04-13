/**
 * generate_milestone_docx.js — Professional Milestone Execution Document generator using docx.js
 *
 * Usage:
 *   node generate_milestone_docx.js --data milestone_data.json --output milestone_1.docx
 *   node generate_milestone_docx.js --data milestone_data.json --charts /tmp/ms_charts/ --diagrams /tmp/ms_diagrams/ --output milestone_1.docx
 *
 * Install: npm install docx
 *
 * Generates a single milestone execution document with:
 *   Cover Page, Context (what was delivered before), Milestone Entry/Exit Criteria,
 *   Definition of Ready (DoR), Definition of Done (DoD),
 *   Tech Stack (components used THIS milestone),
 *   Environment Setup Checklist, Task Breakdown (by week + story points),
 *   API Contracts (endpoints built THIS milestone),
 *   Database Changes (migrations for THIS milestone),
 *   Feature Flag Strategy, Testing Plan,
 *   Risk Register, Rollback Plan, Next Milestone Preview
 *
 * For multi-milestone projects, run once per milestone with different data files.
 */

const fs = require('fs');
const path = require('path');

let Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
    WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
    TableOfContents, ExternalHyperlink, Bookmark, LevelFormat, TabStopType,
    TabStopPosition, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
    PositionalTabLeader;

try {
  const docx = require('docx');
  ({
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
    WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
    TableOfContents, ExternalHyperlink, Bookmark, LevelFormat, TabStopType,
    TabStopPosition, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
    PositionalTabLeader
  } = docx);
} catch (e) {
  console.error("ERROR: 'docx' package not found. Run: npm install docx");
  process.exit(1);
}

// ─── PALETTES ──────────────────────────────────────────────────────────────

const PALETTES = {
  corporate_blue:   { primary: "1B3A6B", accent: "4A90D9", success: "27AE60", danger: "E74C3C", warning: "F39C12", light: "EBF5FF", header: "FFFFFF" },
  modern_teal:      { primary: "0D5C63", accent: "00B4D8", success: "2ECC71", danger: "E74C3C", warning: "F39C12", light: "E0FAFA", header: "FFFFFF" },
  sprint_green:     { primary: "1B5E20", accent: "4CAF50", success: "00C853", danger: "FF5252", warning: "FFD740", light: "E8F5E9", header: "FFFFFF" },
  nord_dev:         { primary: "2E3440", accent: "88C0D0", success: "A3BE8C", danger: "BF616A", warning: "EBCB8B", light: "ECEFF4", header: "FFFFFF" },
  minimal_mono:     { primary: "2C2C2C", accent: "888888", success: "444444", danger: "999999", warning: "666666", light: "F5F5F5", header: "FFFFFF" },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

const safe = (v, def = "") => (v != null ? String(v) : def);
const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeObj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function loadImage(imgPath) {
  try {
    if (imgPath && fs.existsSync(imgPath)) return fs.readFileSync(imgPath);
  } catch (e) {}
  return null;
}

const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function tableCell(text, options = {}) {
  const { bold = false, color = null, shade = null, width = null } = options;
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: BORDERS,
    children: [new Paragraph({
      children: [new TextRun({ text: safe(text), bold, size: 20, font: "Arial", color: color || "000000" })]
    })]
  });
}

function headerRow(cells, palette, widths = null) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((cell, i) => tableCell(cell, {
      bold: true, shade: palette.primary, color: "FFFFFF",
      width: widths ? widths[i] : null
    }))
  });
}

function dataRow(cells, isEven, palette, widths = null) {
  const shade = isEven ? palette.light : "FFFFFF";
  return new TableRow({
    children: cells.map((cell, i) => tableCell(cell, { shade, width: widths ? widths[i] : null }))
  });
}

function makeTable(headers, rows, palette, colWidths = null) {
  const totalWidth = 9360;
  const colW = colWidths || headers.map(() => Math.floor(totalWidth / headers.length));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      headerRow(headers, palette, colW),
      ...rows.map((row, i) => dataRow(row, i % 2 === 0, palette, colW))
    ]
  });
}

function heading1(text, palette) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, font: "Arial", color: palette.primary })],
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: palette.accent, space: 1 } }
  });
}

function heading2(text, palette) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial", color: palette.primary })],
    spacing: { before: 240, after: 120 }
  });
}

function heading3(text, palette) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: palette.accent })],
    spacing: { before: 180, after: 80 }
  });
}

function bodyPara(text) {
  return new Paragraph({
    children: [new TextRun({ text: safe(text), size: 22, font: "Arial" })],
    spacing: { after: 120 }
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text: safe(text), size: 22, font: "Arial" })],
    spacing: { after: 60 }
  });
}

function checklistItem(text, done = false) {
  const prefix = done ? "[x] " : "[ ] ";
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({
      text: prefix + safe(text),
      size: 22, font: "Arial",
      color: done ? "27AE60" : "000000"
    })],
    spacing: { after: 60 }
  });
}

function calloutBox(title, text, palette, type = "insight") {
  const colors = {
    insight: { fill: palette.light, border: palette.accent },
    warning: { fill: "FFF3E0", border: "E65100" },
    note: { fill: "F3E5F5", border: "7B1FA2" },
    success: { fill: "E8F5E9", border: "2E7D32" },
    danger: { fill: "FFEBEE", border: "C62828" }
  };
  const { fill, border } = colors[type] || colors.insight;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        borders: {
          left: { style: BorderStyle.THICK, size: 12, color: border },
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        },
        children: [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 22, font: "Arial", color: border })] }),
          new Paragraph({ children: [new TextRun({ text: safe(text), size: 20, font: "Arial" })], spacing: { before: 60 } })
        ]
      })]
    })]
  });
}

function embeddedImage(imgData, maxWidthEmu = 6000000, maxHeightEmu = 3500000) {
  if (!imgData) return null;
  return new Paragraph({
    children: [new ImageRun({
      type: "png", data: imgData,
      transformation: { width: Math.round(maxWidthEmu / 9525), height: Math.round(maxHeightEmu / 9525) },
      altText: { title: "Chart", description: "Generated chart", name: "chart" }
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 240 }
  });
}

function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
function spacer(n = 1) { return new Paragraph({ children: [new TextRun("")], spacing: { after: 120 * n } }); }

function storyPointBadge(points) {
  const colors = { "1": "27AE60", "2": "27AE60", "3": "4A90D9", "5": "4A90D9", "8": "F39C12", "13": "E74C3C", "21": "E74C3C" };
  const color = colors[String(points)] || "888888";
  return new TextRun({ text: ` [${points}SP]`, color, bold: true, size: 18, font: "Arial" });
}

// ─── SECTION BUILDERS ──────────────────────────────────────────────────────

function buildCoverPage(data, palette) {
  const ms = safeObj(data.milestone);
  const items = [];
  items.push(spacer(3));

  // Milestone number banner
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));
  items.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Milestone ${msNum}`, bold: true, size: 80, font: "Arial", color: palette.accent })],
    spacing: { after: 120 }
  }));

  items.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: safe(ms.name, safe(data.milestone_name, "Foundation")), bold: true, size: 52, font: "Arial", color: palette.primary })],
    spacing: { after: 240 }
  }));

  items.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: safe(data.project_name, "Project Name"), size: 32, font: "Arial", color: "555555" })],
    spacing: { after: 480 }
  }));

  items.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: palette.primary, space: 1 } },
    children: [new TextRun("")], spacing: { after: 360 }
  }));

  // Metadata table
  const meta = [
    ["Milestone", `${msNum}: ${safe(ms.name, safe(data.milestone_name, ""))}`],
    ["Goal", safe(ms.goal, safe(data.milestone_goal, ""))],
    ["Duration", safe(ms.duration, safe(data.milestone_duration, "3 weeks"))],
    ["Status", safe(ms.status, "Planning")],
    ["Start Date", safe(ms.start_date, safe(data.start_date, "TBD"))],
    ["End Date", safe(ms.end_date, safe(data.end_date, "TBD"))],
    ["Version", safe(data.version, "1.0")],
    ["Author(s)", safe(data.authors, "Engineering Team")],
    ["ERD Reference", safe(data.erd_reference, "ERD v1.0")],
    ["PRD Reference", safe(data.prd_reference, "PRD v1.0")],
  ];
  items.push(makeTable(["Field", "Value"], meta, palette, [3000, 6360]));

  return items;
}

function buildContextSection(data, palette) {
  const items = [heading1("1. Context: What Was Delivered Before This Milestone", palette)];
  items.push(calloutBox(
    "Developer Orientation",
    "This section prevents duplicate work and false assumptions. Read before starting any task.",
    palette, "insight"
  ));
  items.push(spacer());

  const ms = safeObj(data.milestone);
  const msNum = parseInt(safe(ms.number, safe(data.milestone_number, "1")), 10);

  if (msNum === 0) {
    items.push(bodyPara("This is Milestone 0: the first milestone. There is no prior work. This milestone establishes the foundation everything else builds on."));
    items.push(spacer());
    items.push(heading2("1.1 What Milestone 0 Must Deliver (for Milestone 1)", palette));
    items.push(bodyPara("The following items must be complete and verified before Milestone 1 development begins:"));
    const m0Deliverables = safeArr(data.context?.deliverables_for_next).length > 0
      ? safeArr(data.context?.deliverables_for_next)
      : ["All cloud environments provisioned (dev, staging, prod)", "CI/CD pipeline running and green", "All secrets and environment variables configured", "Database project created with connection string working", "Auth provider configured with test accounts", "Repository with branch protection rules active"];
    m0Deliverables.forEach(d => items.push(bulletItem(safe(d))));
    return items;
  }

  const prevDeliveries = safeArr(data.context?.previous_deliveries);
  const defaultPrev = msNum === 1
    ? [
        { milestone: "Milestone 0", delivered: "Infrastructure setup: CI/CD, cloud accounts, database project, auth provider, repository with branch protection" },
      ]
    : [
        { milestone: `Milestone ${msNum - 1}`, delivered: `Prior milestone deliverables — see Milestone ${msNum - 1} document for complete list` }
      ];
  const prevList = prevDeliveries.length > 0 ? prevDeliveries : defaultPrev;

  items.push(heading2("1.1 Previously Completed Milestones", palette));
  prevList.forEach(prev => {
    items.push(new Paragraph({
      children: [new TextRun({ text: safe(prev.milestone), bold: true, size: 22, font: "Arial" })],
      spacing: { before: 120, after: 60 }
    }));
    const deliveredList = Array.isArray(prev.delivered) ? prev.delivered : [prev.delivered];
    deliveredList.forEach(d => items.push(bulletItem(safe(d))));
    items.push(spacer());
  });

  items.push(heading2("1.2 Inherited State", palette));
  const inherited = safeObj(data.context?.inherited_state);
  const inheritedRows = [
    ["Database Schema", safe(inherited.db_schema, `Tables from previous milestones are migrated and stable`)],
    ["API Endpoints", safe(inherited.api_endpoints, `Endpoints from previous milestones are live and tested`)],
    ["Auth System", safe(inherited.auth, `Auth is working — JWT tokens valid, user roles established`)],
    ["Environment", safe(inherited.environment, `All environments (dev/staging/prod) are provisioned and accessible`)],
    ["Feature Flags", safe(inherited.feature_flags, `Feature flags from previous milestones remain as-is unless noted below`)],
  ];
  items.push(makeTable(["What is Inherited", "Current State"], inheritedRows, palette, [3000, 6360]));

  return items;
}

function buildCriteriaSection(data, palette) {
  const items = [heading1("2. Milestone Entry & Exit Criteria", palette)];

  items.push(heading2("2.1 Entry Criteria (Must be TRUE before starting)", palette));
  items.push(bodyPara("All items below must be verified before the first development task is started. If any item is false, escalate to tech lead."));
  items.push(spacer());

  const entry = safeArr(data.entry_criteria);
  const defaultEntry = [
    "PRD and ERD documents are finalized and reviewed",
    "All tasks in this milestone are estimated with story points",
    "Development environment is set up and running locally",
    "Database migrations from previous milestone are applied to staging",
    "All blocking dependencies from previous milestone are confirmed complete",
    "Feature flags for this milestone's features are created (in OFF state)",
    "Design mockups for all UI features in this milestone are approved",
  ];
  (entry.length > 0 ? entry : defaultEntry).forEach(item => items.push(checklistItem(safe(item))));
  items.push(spacer());

  items.push(heading2("2.2 Exit Criteria (Must be TRUE before declaring done)", palette));
  items.push(bodyPara("All items below must be verified before releasing to the next milestone or to production."));
  items.push(spacer());

  const exit = safeArr(data.exit_criteria);
  const defaultExit = [
    "All tasks in this milestone have status: Done",
    "All acceptance criteria pass (Given/When/Then scenarios verified)",
    "Unit test coverage >= 80% for new code",
    "All E2E tests for user flows in this milestone pass on staging",
    "No P0 or P1 bugs open",
    "Performance benchmarks met (p95 < 500ms for new endpoints)",
    "Security review completed for auth/payment features (if applicable)",
    "Feature flags for this milestone's features tested in both ON and OFF states",
    "Database migrations tested with rollback script verified",
    "Staging environment matches production config",
    "Milestone retrospective document written",
  ];
  (exit.length > 0 ? exit : defaultExit).forEach(item => items.push(checklistItem(safe(item))));

  return items;
}

function buildDORDODSection(data, palette) {
  const items = [heading1("3. Definition of Ready (DoR) & Definition of Done (DoD)", palette)];

  items.push(heading2("3.1 Definition of Ready — Per Task", palette));
  items.push(bodyPara("A task is READY to start when ALL of the following are true:"));
  const dor = safeArr(data.definition_of_ready);
  const defaultDoR = [
    "Acceptance criteria written in Given/When/Then format",
    "Story points estimated and agreed by assignee",
    "Dependencies identified and unblocked",
    "Design/mockup attached (for UI tasks)",
    "API contract defined (for backend tasks)",
    "Database migration written (for DB tasks)",
    "Feature flag created and name documented in task",
  ];
  (dor.length > 0 ? dor : defaultDoR).forEach(item => items.push(bulletItem(safe(item))));
  items.push(spacer());

  items.push(heading2("3.2 Definition of Done — Per Task", palette));
  items.push(bodyPara("A task is DONE when ALL of the following are true:"));
  const dod = safeArr(data.definition_of_done);
  const defaultDoD = [
    "Code is written and passes all linting/type checks",
    "Unit tests written and passing (>= 80% coverage for new code)",
    "PR is reviewed and approved by at least 1 engineer",
    "All acceptance criteria manually verified on staging",
    "No console errors or warnings introduced",
    "Feature flag tested in ON and OFF states (if applicable)",
    "Rollback tested: migration can be reversed without data loss",
    "Documentation updated (API doc, README, or inline code comments where needed)",
  ];
  (dod.length > 0 ? dod : defaultDoD).forEach(item => items.push(bulletItem(safe(item))));

  return items;
}

function buildTechStackSection(data, palette) {
  const items = [heading1("4. Tech Stack (This Milestone)", palette)];
  items.push(bodyPara("Components actively used or configured in this milestone. Do not introduce new technologies without an ADR."));
  items.push(spacer());

  const stack = safeArr(data.tech_stack);
  const defaultStack = [
    ["Next.js 14", "Frontend framework + API routes", "Stable", "All features"],
    ["Supabase PostgreSQL", "Database + RLS policies", "Stable", "All data persistence"],
    ["Drizzle ORM", "Type-safe database queries", "Stable", "All DB interactions"],
    ["Clerk", "Authentication + user sessions", "Stable", "Auth flows"],
    ["Tailwind CSS + shadcn/ui", "Styling + UI components", "Stable", "All UI tasks"],
    ["Redis (Upstash)", "Session cache + rate limiting", "Stable", "API rate limiting"],
  ];
  const stackRows = stack.length > 0
    ? stack.map(t => [safe(t.technology), safe(t.purpose), safe(t.status, "Stable"), safe(t.used_for)])
    : defaultStack;
  items.push(makeTable(["Technology", "Purpose", "Status", "Used For in This Milestone"], stackRows, palette, [2500, 2500, 1200, 3160]));

  return items;
}

function buildEnvSetupSection(data, palette) {
  const items = [heading1("5. Environment Setup Checklist", palette)];
  items.push(bodyPara("Complete these once per environment (run once for dev, repeat for staging as needed). Exact commands prevent 'it works on my machine' issues."));
  items.push(spacer());

  const setupGroups = safeArr(data.env_setup_groups);
  const defaultGroups = [
    { title: "Local Development Setup", items: [
      "Clone repo: git clone <repo_url> && cd <project>",
      "Install dependencies: npm install",
      "Copy environment file: cp .env.example .env.local",
      "Fill in .env.local: SUPABASE_URL, SUPABASE_ANON_KEY, CLERK_SECRET_KEY, etc.",
      "Start Supabase local: npx supabase start",
      "Run database migrations: npx drizzle-kit push",
      "Seed development data: npm run db:seed",
      "Start dev server: npm run dev",
      "Verify: open http://localhost:3000 and confirm app loads",
    ]},
    { title: "Staging Environment", items: [
      "Confirm staging environment variables match production structure",
      "Run migrations on staging: npx drizzle-kit push --config drizzle.staging.config.ts",
      "Trigger staging deploy via CI/CD or: vercel --prod=false",
      "Run smoke tests: npm run test:e2e:staging",
    ]},
  ];

  const groups = setupGroups.length > 0 ? setupGroups : defaultGroups;
  groups.forEach((group, i) => {
    items.push(heading2(`5.${i + 1} ${safe(group.title)}`, palette));
    safeArr(group.items).forEach(item => items.push(checklistItem(safe(item))));
    items.push(spacer());
  });

  return items;
}

function buildTaskBreakdownSection(data, palette, chartsDir) {
  const items = [heading1("6. Task Breakdown by Week", palette)];

  const ganttImg = loadImage(path.join(chartsDir || "/tmp/ms_charts", "milestone_timeline.png"));
  if (ganttImg) {
    items.push(heading2("6.1 Timeline Overview (Gantt Chart)", palette));
    items.push(embeddedImage(ganttImg));
  }

  items.push(calloutBox(
    "Story Point Reference",
    "1SP = trivial (<4h) | 2SP = small (~4-8h) | 3SP = medium (~1 day) | 5SP = large (~2-3 days) | 8SP = complex (~3-5 days) | 13SP = very complex (>5 days, consider splitting). Velocity buffer: 20% of sprint capacity reserved for unplanned work.",
    palette, "note"
  ));
  items.push(spacer());

  const weeks = safeArr(data.task_weeks);
  const ms = safeObj(data.milestone);
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));

  if (weeks.length === 0) {
    // Generate default task structure
    const defaultWeeks = [
      {
        week: 1, goal: "Setup + Foundation",
        tasks: [
          { id: `MS${msNum}-T001`, title: "Write and review all database migration files", sp: 2, assignee: "Backend", status: "Todo", ac: "Given migration files exist, When drizzle-kit push runs, Then all tables created without errors" },
          { id: `MS${msNum}-T002`, title: "Apply database migrations to development environment", sp: 1, assignee: "Backend", status: "Todo", ac: "Given migrations are written, When applied locally, Then db matches schema" },
          { id: `MS${msNum}-T003`, title: "Set up feature flags for this milestone's features", sp: 1, assignee: "DevOps", status: "Todo", ac: "Given LaunchDarkly/feature flag tool is configured, When flag created, Then can toggle ON/OFF in dashboard" },
          { id: `MS${msNum}-T004`, title: "Write API endpoint skeletons with request/response validation", sp: 3, assignee: "Backend", status: "Todo", ac: "Given API contract from ERD, When endpoint receives valid request, Then returns 200; invalid request returns 400" },
        ]
      },
      {
        week: 2, goal: "Core Implementation",
        tasks: [
          { id: `MS${msNum}-T005`, title: "Implement business logic layer for primary feature", sp: 5, assignee: "Backend", status: "Todo", ac: "Given valid input data, When service function is called, Then correct data is persisted and returned" },
          { id: `MS${msNum}-T006`, title: "Build UI components for primary feature screens", sp: 5, assignee: "Frontend", status: "Todo", ac: "Given user navigates to feature page, When page loads, Then all required components render without errors" },
          { id: `MS${msNum}-T007`, title: "Wire UI to API endpoints", sp: 3, assignee: "Frontend", status: "Todo", ac: "Given user performs action in UI, When request is made, Then UI updates to reflect response" },
          { id: `MS${msNum}-T008`, title: "Write unit tests for business logic", sp: 3, assignee: "Backend", status: "Todo", ac: "Given test suite runs, When all unit tests execute, Then coverage >= 80% for new code" },
        ]
      },
      {
        week: 3, goal: "QA + Polish + Handoff",
        tasks: [
          { id: `MS${msNum}-T009`, title: "Manual QA testing of all acceptance criteria", sp: 2, assignee: "QA/Dev", status: "Todo", ac: "Given staging is deployed, When all ACs are verified manually, Then all pass" },
          { id: `MS${msNum}-T010`, title: "Write and run E2E tests for primary user flow", sp: 3, assignee: "QA/Dev", status: "Todo", ac: "Given Playwright tests are written, When they run on staging, Then all pass" },
          { id: `MS${msNum}-T011`, title: "Performance check: run load test on new endpoints", sp: 2, assignee: "Backend", status: "Todo", ac: "Given k6 load test runs at 200 RPS for 2 minutes, When test completes, Then p95 < 500ms" },
          { id: `MS${msNum}-T012`, title: "Documentation update (API docs, README changes)", sp: 1, assignee: "All", status: "Todo", ac: "Given new endpoints are live, When docs are updated, Then all new endpoints are documented in OpenAPI spec" },
        ]
      }
    ];
    weeks.push(...defaultWeeks);
  }

  let totalSP = 0;
  weeks.forEach((week, wi) => {
    const weekTasks = safeArr(week.tasks);
    const weekSP = weekTasks.reduce((sum, t) => sum + (parseInt(safe(t.sp, t.story_points, "0")) || 0), 0);
    totalSP += weekSP;

    items.push(heading2(`6.${wi + 2} Week ${safe(week.week, wi + 1)}: ${safe(week.goal, "")} — ${weekSP} SP`, palette));

    const taskRows = weekTasks.map(t => [
      safe(t.id), safe(t.title),
      safe(t.sp || t.story_points, "3"),
      safe(t.assignee, "TBD"),
      safe(t.status, "Todo"),
      safe(t.ac || t.acceptance_criteria, "AC to be written")
    ]);
    items.push(makeTable(
      ["Task ID", "Task Description", "SP", "Assignee", "Status", "Acceptance Criteria (Given/When/Then)"],
      taskRows, palette, [900, 2500, 500, 1000, 800, 3660]
    ));
    items.push(spacer());
  });

  items.push(calloutBox("Total Capacity", `Total story points this milestone: ${totalSP} SP. Add 20% buffer for unplanned work = ${Math.ceil(totalSP * 1.2)} SP recommended sprint capacity.`, palette, "insight"));

  return items;
}

function buildAPIContractsSection(data, palette) {
  const items = [heading1("7. API Contracts (This Milestone Only)", palette)];
  items.push(bodyPara("Only endpoints being BUILT in this milestone. Full API catalog is in the ERD. Each endpoint includes full request/response schema."));
  items.push(spacer());

  const endpoints = safeArr(data.api_contracts);
  const ms = safeObj(data.milestone);
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));

  if (endpoints.length === 0) {
    items.push(calloutBox("No Endpoints Defined", `Define API contracts from the ERD. Add them to milestone_data.json under "api_contracts": [{ "id": "EP-001", "method": "POST", "path": "/api/v1/...", "auth": true, "description": "...", "request_schema": {...}, "response_schema": {...}, "errors": "..." }]`, palette, "warning"));
    return items;
  }

  endpoints.forEach((ep, i) => {
    items.push(new Paragraph({
      children: [
        new TextRun({ text: `${safe(ep.id, `EP-${i+1}`)} `, bold: true, size: 22, font: "Arial", color: palette.primary }),
        new TextRun({ text: `${safe(ep.method)} ${safe(ep.path)}`, bold: true, size: 22, font: "Arial", color: "000000" }),
        new TextRun({ text: ep.auth ? "  [Auth Required]" : "  [Public]", size: 18, font: "Arial", color: ep.auth ? palette.accent : "888888" }),
      ],
      spacing: { before: 200, after: 80 }
    }));
    items.push(bodyPara(safe(ep.description)));

    const schema = [
      ["Request Body", safe(ep.request_schema || ep.request, "—")],
      ["Response (200)", safe(ep.response_schema || ep.response, "—")],
      ["Error Codes", safe(ep.errors, "400 validation, 401 unauthorized, 500 server error")],
      ["Task Reference", safe(ep.task_id, `MS${msNum}-T???`)],
    ];
    items.push(makeTable(["Field", "Details"], schema, palette, [2000, 7360]));
    items.push(spacer());
  });

  return items;
}

function buildDatabaseChangesSection(data, palette) {
  const items = [heading1("8. Database Changes (This Milestone Only)", palette)];
  items.push(bodyPara("Only migrations being applied in this milestone. Full schema is in the ERD. Each migration includes the rollback SQL."));
  items.push(spacer());

  const migrations = safeArr(data.database_migrations);
  const ms = safeObj(data.milestone);
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));

  if (migrations.length === 0) {
    items.push(calloutBox("No Migrations Defined", `Define DB changes from the ERD. Add them to milestone_data.json under "database_migrations": [{ "id": "M${msNum}01", "file": "0001_create_users.sql", "description": "Create users table", "up_sql": "CREATE TABLE...", "down_sql": "DROP TABLE...", "task_id": "MS${msNum}-T001" }]`, palette, "warning"));
    return items;
  }

  const migRows = migrations.map(m => [
    safe(m.id), safe(m.file), safe(m.description),
    safe(m.up_sql || m.migration_sql, "See migration file"),
    safe(m.down_sql || m.rollback_sql, "See rollback script"),
    safe(m.task_id, "—")
  ]);
  items.push(makeTable(
    ["Migration ID", "File Name", "Description", "Up SQL (Summary)", "Down SQL (Rollback)", "Task Ref"],
    migRows, palette, [1000, 2000, 2000, 1500, 1500, 1360]
  ));
  items.push(spacer());

  items.push(calloutBox("Migration Safety", "Before applying migrations to production: 1) Test rollback on staging DB copy. 2) Ensure migration is backwards-compatible (don't drop columns while old code is deployed). 3) Deploy code first, then migrate — never migrate first.", palette, "warning"));

  return items;
}

function buildFeatureFlagsSection(data, palette) {
  const items = [heading1("9. Feature Flag Strategy", palette)];
  items.push(bodyPara("Feature flags introduced in this milestone. All new features should launch behind a flag for safe rollout and instant kill-switch capability."));
  items.push(spacer());

  const flags = safeArr(data.feature_flags);
  const ms = safeObj(data.milestone);
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));

  const defaultFlags = [
    { name: `ms${msNum}_primary_feature`, feature: "Primary feature of this milestone", state: "OFF", rollout: "10% → 50% → 100% over 1 week per phase", kill_switch: "Set flag to OFF in LaunchDarkly; feature reverts to previous behavior" },
  ];
  const flagList = flags.length > 0 ? flags : defaultFlags;

  const flagRows = flagList.map(f => [safe(f.name), safe(f.feature), safe(f.state, "OFF"), safe(f.rollout, "Manual toggle"), safe(f.kill_switch, "Set flag to OFF")]);
  items.push(makeTable(["Flag Name", "Feature Controlled", "Initial State", "Rollout Plan", "Kill Switch Command"], flagRows, palette, [2200, 2200, 1000, 2000, 1960]));

  return items;
}

function buildTestingPlanSection(data, palette) {
  const items = [heading1("10. Testing Plan (This Milestone)", palette)];

  const tests = safeArr(data.testing_plan);
  const defaultTests = [
    ["Unit Tests", "Jest / Vitest", "Business logic functions, API input validation, utility functions", "All new code >= 80% coverage", "Run pre-commit hook + on every PR"],
    ["Integration Tests", "Jest + Supertest", "All API endpoints in this milestone (happy path + error cases)", "100% of new endpoints have tests", "PR open event in CI"],
    ["E2E Tests", "Playwright", "Primary user flow for features built in this milestone", "Happy path + 2 error paths per flow", "Before staging deploy"],
    ["Performance Test", "k6", "New API endpoints under load: 200 RPS for 2 minutes", "p95 < 500ms, error rate < 0.1%", "Weekly on staging + before milestone close"],
    ["Manual QA", "Browser + staging env", "All acceptance criteria verified manually", "100% of AC scenarios verified", "Before milestone exit sign-off"],
  ];
  const testRows = tests.length > 0
    ? tests.map(t => [safe(t.type), safe(t.tool), safe(t.scope), safe(t.criteria), safe(t.when_run)])
    : defaultTests;
  items.push(makeTable(["Test Type", "Tool", "Scope / What to Test", "Pass Criteria", "When Run"], testRows, palette, [1600, 1500, 2500, 2000, 1760]));

  return items;
}

function buildRiskRegisterSection(data, palette) {
  const items = [heading1("11. Risk Register (This Milestone)", palette)];

  const risks = safeArr(data.risks);
  const ms = safeObj(data.milestone);
  const defaultRisks = [
    ["Technical complexity underestimated", "Medium", "High", "Add spike tasks at start of week 1 for unfamiliar areas; re-estimate after spike"],
    ["External API instability (if integrating third-party)", "Low", "High", "Implement circuit breaker pattern; have mock data fallback for dev/testing"],
    ["Migration rollback issues", "Low", "Critical", "Test down migration on staging DB copy before applying to prod; keep old code deployable"],
    ["Scope creep from stakeholders", "Medium", "Medium", "Defer new requests to backlog; milestone scope is frozen after kickoff"],
    ["Developer availability (sick days, blockers)", "Medium", "Medium", "20% capacity buffer built into estimates; daily standups to surface blockers early"],
  ];
  const riskRows = risks.length > 0
    ? risks.map(r => [safe(r.risk), safe(r.probability), safe(r.impact), safe(r.mitigation)])
    : defaultRisks;
  items.push(makeTable(["Risk", "Probability", "Impact", "Mitigation"], riskRows, palette, [2500, 1200, 1200, 4460]));

  return items;
}

function buildRollbackPlanSection(data, palette) {
  const items = [heading1("12. Rollback Plan", palette)];
  items.push(calloutBox(
    "Rollback Trigger Conditions",
    "Initiate rollback if: (1) Error rate > 5% for more than 5 minutes after deploy. (2) P0 bug found that cannot be fixed with a feature flag toggle. (3) Data corruption detected. (4) SLO burn rate exceeds 10x expected rate.",
    palette, "danger"
  ));
  items.push(spacer());

  items.push(heading2("12.1 Rollback Procedure", palette));
  const rollbackSteps = safeArr(data.rollback_steps);
  const defaultRollback = [
    "1. DISABLE feature flags for all features in this milestone immediately (instant user impact rollback)",
    "2. Notify team in #incidents Slack channel with: rollback initiated, reason, and who is handling",
    "3. Revert code deployment: git revert <merge-commit-sha> → create PR → emergency merge to main",
    "4. Trigger production deploy from reverted code",
    "5. If DB migration was applied: run rollback script: npm run db:rollback -- --steps <n>",
    "6. Verify: check error rate drops to < 0.1% within 5 minutes of rollback completing",
    "7. Post incident report: root cause, timeline, impact, and prevention steps",
  ];
  (rollbackSteps.length > 0 ? rollbackSteps : defaultRollback).forEach(s => items.push(bulletItem(safe(s))));
  items.push(spacer());

  items.push(heading2("12.2 Rollback Verification", palette));
  const verifyItems = safeArr(data.rollback_verification);
  const defaultVerify = [
    "Error rate returns to baseline (< 0.1%)",
    "All previously working features still work",
    "No data loss or corruption (check key DB row counts)",
    "Performance metrics return to pre-deploy baseline",
    "Feature flags confirmed OFF for rolled-back features",
  ];
  (verifyItems.length > 0 ? verifyItems : defaultVerify).forEach(v => items.push(checklistItem(safe(v))));

  return items;
}

function buildNextMilestoneSection(data, palette) {
  const items = [heading1("13. Next Milestone Preview", palette)];
  items.push(bodyPara("What the next milestone will build, so this milestone's team knows what to prepare."));
  items.push(spacer());

  const next = safeObj(data.next_milestone);
  const ms = safeObj(data.milestone);
  const msNum = parseInt(safe(ms.number, safe(data.milestone_number, "1")), 10);

  items.push(makeTable(["Property", "Details"], [
    ["Next Milestone", safe(next.number || next.name, `Milestone ${msNum + 1}`)],
    ["Goal", safe(next.goal, "Define in milestone planning")],
    ["Key Features", safe(next.features, "To be determined")],
    ["What We Must Hand Off", safe(next.handoff_from_us, "Complete and stable: all DB migrations, all API endpoints, working auth")],
    ["Their Entry Dependency on Us", safe(next.dependency_on_us, `Must complete: milestone ${msNum} exit criteria fully signed off`)],
  ], palette, [3000, 6360]));
  items.push(spacer());

  if (next.api_needed_from_us) {
    items.push(calloutBox("APIs Next Milestone Will Consume", safe(next.api_needed_from_us), palette, "insight"));
  }
  if (next.db_tables_needed) {
    items.push(calloutBox("DB Tables Next Milestone Will Extend", safe(next.db_tables_needed), palette, "note"));
  }

  return items;
}

// ─── MAIN DOCUMENT BUILDER ─────────────────────────────────────────────────

function buildMilestoneDocument(data, chartsDir, diagramsDir, palette) {
  const children = [
    ...buildCoverPage(data, palette),
    pageBreak(),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),
    ...buildContextSection(data, palette),
    pageBreak(),
    ...buildCriteriaSection(data, palette),
    pageBreak(),
    ...buildDORDODSection(data, palette),
    pageBreak(),
    ...buildTechStackSection(data, palette),
    pageBreak(),
    ...buildEnvSetupSection(data, palette),
    pageBreak(),
    ...buildTaskBreakdownSection(data, palette, chartsDir),
    pageBreak(),
    ...buildAPIContractsSection(data, palette),
    pageBreak(),
    ...buildDatabaseChangesSection(data, palette),
    pageBreak(),
    ...buildFeatureFlagsSection(data, palette),
    pageBreak(),
    ...buildTestingPlanSection(data, palette),
    pageBreak(),
    ...buildRiskRegisterSection(data, palette),
    pageBreak(),
    ...buildRollbackPlanSection(data, palette),
    pageBreak(),
    ...buildNextMilestoneSection(data, palette),
  ];

  const ms = safeObj(data.milestone);
  const msNum = safe(ms.number, safe(data.milestone_number, "1"));
  const msName = safe(ms.name, safe(data.milestone_name, "Foundation"));
  const projectName = safe(data.project_name, "Project");
  const dateStr = safe(data.date, new Date().toISOString().split("T")[0]);

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: palette.primary },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: palette.primary },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: palette.accent },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
      ]
    },
    numbering: {
      config: [
        { reference: "bullets",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
          ]
        },
        { reference: "numbers",
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `${projectName} — Milestone ${msNum}: ${msName}`, size: 18, font: "Arial", color: "666666" }),
              new TextRun({ children: [new PositionalTab({
                alignment: PositionalTabAlignment.RIGHT,
                relativeTo: PositionalTabRelativeTo.MARGIN,
                leader: PositionalTabLeader.NONE
              }), dateStr], size: 18, font: "Arial", color: "666666" })
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } }
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Page ", size: 18, font: "Arial", color: "888888" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "888888" }),
              new TextRun({ text: " of ", size: 18, font: "Arial", color: "888888" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Arial", color: "888888" })
            ]
          })]
        })
      },
      children
    }]
  });

  return doc;
}

// ─── CLI ENTRYPOINT ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const dataFile = getArg("--data");
const outputFile = getArg("--output") || "output_milestone.docx";
const chartsDir = getArg("--charts") || "/tmp/ms_charts";
const diagramsDir = getArg("--diagrams") || "/tmp/ms_diagrams";
const paletteName = getArg("--palette") || "sprint_green";

if (!dataFile) {
  console.error("Usage: node generate_milestone_docx.js --data milestone_data.json --output milestone_1.docx");
  console.error("  --charts   /tmp/ms_charts    Directory with PNG charts from generate_charts.py");
  console.error("  --diagrams /tmp/ms_diagrams  Directory with PNG diagrams from generate_diagrams.py");
  console.error("  --palette  sprint_green      Color palette (corporate_blue|modern_teal|sprint_green|nord_dev|minimal_mono)");
  process.exit(1);
}

let data = {};
try {
  data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
} catch (e) {
  console.error(`ERROR reading data file: ${e.message}`);
  process.exit(1);
}

const palette = PALETTES[paletteName] || PALETTES.sprint_green;
const ms = safeObj(data.milestone);
const msNum = safe(ms.number, safe(data.milestone_number, "?"));
const msName = safe(ms.name, safe(data.milestone_name, ""));
console.log(`Generating Milestone DOCX: ${outputFile}`);
console.log(`  Project: ${data.project_name || "(no name)"}`);
console.log(`  Milestone: ${msNum} — ${msName}`);
console.log(`  Palette: ${paletteName}`);

const doc = buildMilestoneDocument(data, chartsDir, diagramsDir, palette);

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputFile, buffer);
  console.log(`\nDone: ${outputFile} (${(buffer.length / 1024).toFixed(0)} KB)`);
}).catch(err => {
  console.error("ERROR generating DOCX:", err);
  process.exit(1);
});
