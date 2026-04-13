/**
 * generate_erd_docx.js — Professional ERD/Engineering Spec DOCX generator using docx.js
 *
 * Usage:
 *   node generate_erd_docx.js --data erd_data.json --output output_erd.docx
 *   node generate_erd_docx.js --data erd_data.json --charts /tmp/erd_charts/ --diagrams /tmp/erd_diagrams/ --output output_erd.docx
 *
 * Install: npm install docx
 *
 * Sections generated:
 *   Cover Page, TOC, Non-Functional Requirements (FURPS+), Tech Stack + ADRs,
 *   System Architecture, Database Schema + Data Dictionary, API Design (OpenAPI-style),
 *   Authentication & Authorization, Third-Party Integrations, Infrastructure & DevOps,
 *   Security + LINDDUN Privacy, Performance (SLO/SLI/SLA), Error Handling & Logging,
 *   Testing Strategy, Feature Flags, Monitoring & Observability,
 *   Cross-Team Dependency Mapping, Implementation Plan, Risk Assessment,
 *   Infrastructure Provisioning Checklist, Appendix
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
  engineering_dark: { primary: "0A1628", accent: "00BFFF", success: "00E676", danger: "FF5252", warning: "FFD740", light: "E8F4F8", header: "FFFFFF" },
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
  const { bold = false, color = null, shade = null, width = null, align = AlignmentType.LEFT } = options;
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: BORDERS,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: safe(text), bold, size: 20, font: "Arial", color: color || "000000" })]
    })]
  });
}

function headerRow(cells, palette, widths = null) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((cell, i) => tableCell(cell, {
      bold: true,
      shade: palette.primary,
      color: "FFFFFF",
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

function calloutBox(title, text, palette, type = "insight") {
  const colors = {
    insight: { fill: palette.light, border: palette.accent },
    warning: { fill: "FFF3E0", border: "E65100" },
    note: { fill: "F3E5F5", border: "7B1FA2" },
    adr: { fill: "E8F5E9", border: "2E7D32" }
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
      type: "png",
      data: imgData,
      transformation: { width: Math.round(maxWidthEmu / 9525), height: Math.round(maxHeightEmu / 9525) },
      altText: { title: "Diagram", description: "Generated diagram", name: "diagram" }
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 240 }
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer(lines = 1) {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: 120 * lines } });
}

function statusBadge(status) {
  const MAP = {
    "Active": "27AE60", "Approved": "27AE60", "Stable": "27AE60",
    "Draft": "F39C12", "Proposed": "4A90D9", "Review": "4A90D9",
    "Deprecated": "E74C3C", "Rejected": "E74C3C", "Blocked": "E74C3C"
  };
  const color = MAP[status] || "888888";
  return new TextRun({ text: ` [${status}]`, color, bold: true, size: 18, font: "Arial" });
}

// ─── SECTION BUILDERS ──────────────────────────────────────────────────────

function buildCoverPage(data, palette) {
  const items = [];
  // Title block
  items.push(spacer(4));
  items.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: safe(data.project_name, "Project Name"), bold: true, size: 72, font: "Arial", color: palette.primary })],
    spacing: { after: 240 }
  }));
  items.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Engineering Requirements Document (ERD)", size: 40, font: "Arial", color: palette.accent })],
    spacing: { after: 480 }
  }));

  // Horizontal rule
  items.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: palette.primary, space: 1 } },
    children: [new TextRun("")], spacing: { after: 360 }
  }));

  // Metadata table
  const meta = [
    ["Version", safe(data.version, "1.0")],
    ["Status", safe(data.status, "Draft")],
    ["Date", safe(data.date, new Date().toISOString().split("T")[0])],
    ["Author(s)", safe(data.authors, "Engineering Team")],
    ["Database Type", safe(data.database_type, "PostgreSQL (SQL)")],
    ["Primary Language", safe(data.primary_language, "TypeScript")],
    ["Deployment Target", safe(data.deployment_target, "Cloud")],
  ];
  items.push(makeTable(["Field", "Value"], meta, palette, [3000, 6360]));
  items.push(spacer(2));

  if (data.description) {
    items.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: safe(data.description), size: 22, font: "Arial", italics: true, color: "555555" })]
    }));
  }

  return items;
}

function buildNFRSection(data, palette) {
  const items = [heading1("1. Non-Functional Requirements (FURPS+)", palette)];
  items.push(bodyPara("Measurable quality attributes that constrain the system design. All values must be expressed with units and time windows. 'Fast' is not a requirement — 'p99 < 300ms over 28-day rolling window' is."));
  items.push(spacer());

  const nfr = safeObj(data.non_functional_requirements);

  const categories = [
    { key: "performance", label: "Performance", rows: [
      ["API Response Time", safe(nfr.performance?.api_response_time, "p95 < 200ms, p99 < 500ms"), "APM tool (Datadog/New Relic)"],
      ["Page Load Time", safe(nfr.performance?.page_load, "LCP < 2.5s, TTI < 3.5s"), "Lighthouse / Web Vitals"],
      ["Throughput", safe(nfr.performance?.throughput, "1,000 RPS at peak load"), "Load testing (k6)"],
      ["Database Query Time", safe(nfr.performance?.db_query_time, "p95 < 50ms for read queries"), "Query analyzer / APM"],
    ]},
    { key: "scalability", label: "Scalability", rows: [
      ["Concurrent Users", safe(nfr.scalability?.concurrent_users, "10,000 concurrent sessions"), "Load test simulation"],
      ["Data Growth Rate", safe(nfr.scalability?.data_growth, "50 GB/month"), "Storage monitoring"],
      ["Horizontal Scale Trigger", safe(nfr.scalability?.scale_trigger, "CPU > 70% for 3 minutes"), "Auto-scaling policy"],
    ]},
    { key: "reliability", label: "Reliability", rows: [
      ["Uptime Target", safe(nfr.reliability?.uptime, "99.9% (8.76 hours downtime/year)"), "Uptime monitor (Better Uptime)"],
      ["MTBF", safe(nfr.reliability?.mtbf, "> 720 hours"), "Incident tracking"],
      ["MTTR", safe(nfr.reliability?.mttr, "< 30 minutes"), "Incident tracking"],
      ["Error Rate", safe(nfr.reliability?.error_rate, "< 0.1% of all requests"), "APM error dashboard"],
    ]},
    { key: "security", label: "Security", rows: [
      ["Auth Standard", safe(nfr.security?.auth_standard, "OAuth 2.0 + OIDC, JWT RS256"), "Auth system"],
      ["Encryption at Rest", safe(nfr.security?.encryption_rest, "AES-256"), "Cloud provider config"],
      ["Encryption in Transit", safe(nfr.security?.encryption_transit, "TLS 1.3 minimum"), "SSL Labs scan"],
      ["Vulnerability Scanning", safe(nfr.security?.vuln_scanning, "Weekly automated SAST + DAST"), "Snyk / Dependabot"],
    ]},
    { key: "maintainability", label: "Maintainability", rows: [
      ["Test Coverage", safe(nfr.maintainability?.test_coverage, "> 80% line coverage"), "Coverage report (Jest/Vitest)"],
      ["Code Review", safe(nfr.maintainability?.code_review, "Required: 2 approvals before merge"), "GitHub branch protection"],
      ["Documentation", safe(nfr.maintainability?.documentation, "All public APIs documented in OpenAPI 3.1"), "Swagger/Stoplight"],
    ]},
  ];

  for (const cat of categories) {
    items.push(heading2(`1.${categories.indexOf(cat) + 1} ${cat.label}`, palette));
    items.push(makeTable(["Requirement", "Target Value", "Measurement Method"], cat.rows, palette, [2500, 4000, 2860]));
    items.push(spacer());
  }

  return items;
}

function buildTechStackSection(data, palette) {
  const items = [heading1("2. Tech Stack & Architectural Decision Records (ADRs)", palette)];
  items.push(bodyPara("Technology decisions with rationale. Each major choice is documented as an ADR to preserve institutional knowledge and prevent re-litigating decisions."));
  items.push(spacer());

  // Tech stack table
  items.push(heading2("2.1 Tech Stack Decision Matrix", palette));
  const stack = safeArr(data.tech_stack);
  const stackRows = stack.length > 0
    ? stack.map(t => [safe(t.layer), safe(t.technology), safe(t.version), safe(t.purpose), safe(t.status, "Stable")])
    : [
        ["Frontend", "Next.js 14 (App Router)", "14.x", "React framework with SSR/SSG", "Stable"],
        ["Styling", "Tailwind CSS + shadcn/ui", "3.x", "Utility-first CSS + component library", "Stable"],
        ["Backend", "Next.js API Routes", "14.x", "Serverless API endpoints", "Stable"],
        ["Auth", "Clerk", "5.x", "Authentication + user management", "Stable"],
        ["Database", "Supabase PostgreSQL", "15.x", "Managed relational database", "Stable"],
        ["ORM", "Drizzle ORM", "0.30+", "Type-safe SQL ORM", "Stable"],
        ["Cache", "Redis (Upstash)", "7.x", "Session cache + rate limiting", "Stable"],
        ["Storage", "Cloudflare R2", "—", "Object storage (S3-compatible)", "Stable"],
        ["Payments", "Stripe", "latest", "Subscription billing + webhooks", "Stable"],
        ["Email", "Resend", "latest", "Transactional email delivery", "Stable"],
        ["Monitoring", "Sentry + Datadog", "latest", "Error tracking + APM", "Stable"],
        ["CI/CD", "GitHub Actions", "—", "Automated testing + deployment", "Stable"],
        ["IaC", safe(data.iac_tool, "Terraform"), "—", "Infrastructure as code", "Proposed"],
      ];
  items.push(makeTable(["Layer", "Technology", "Version", "Purpose", "Status"], stackRows, palette, [1600, 2400, 900, 3100, 1360]));
  items.push(spacer());

  // ADRs
  items.push(heading2("2.2 Architectural Decision Records (ADRs)", palette));
  const adrs = safeArr(data.adrs);
  const defaultADRs = [
    {
      id: "ADR-001",
      title: "PostgreSQL over MongoDB for primary data store",
      status: "Approved",
      context: "Application needs strong relational consistency for user data, billing records, and audit logs. Initial team proposed MongoDB for flexibility.",
      decision: "Use PostgreSQL (via Supabase) as the primary database.",
      rationale: "Strong ACID guarantees required for financial data. Rich query capabilities with JOINs reduce API complexity. Supabase provides RLS (Row Level Security) for multi-tenant isolation out of the box.",
      alternatives: "MongoDB (rejected: no ACID transactions across collections, complex aggregation for reporting); DynamoDB (rejected: vendor lock-in, poor JOIN support, expensive for complex queries)",
      consequences: "Positive: Type safety via Drizzle ORM, native PostGIS if location features added, full-text search via pg_vector. Negative: Horizontal sharding is complex at massive scale; mitigated by read replicas."
    }
  ];
  const adrList = adrs.length > 0 ? adrs : defaultADRs;

  adrList.forEach((adr, i) => {
    items.push(new Paragraph({
      children: [
        new TextRun({ text: `${safe(adr.id, `ADR-00${i+1}`)}: ${safe(adr.title)}`, bold: true, size: 24, font: "Arial", color: palette.primary }),
        statusBadge(safe(adr.status, "Proposed"))
      ],
      spacing: { before: 180, after: 80 }
    }));
    const adrRows = [
      ["Context (Problem)", safe(adr.context)],
      ["Decision", safe(adr.decision)],
      ["Rationale", safe(adr.rationale)],
      ["Alternatives Considered", safe(adr.alternatives)],
      ["Consequences (+ and -)", safe(adr.consequences)],
    ];
    items.push(makeTable(["Field", "Details"], adrRows, palette, [2200, 7160]));
    items.push(spacer());
  });

  return items;
}

function buildArchitectureSection(data, palette, diagramsDir) {
  const items = [heading1("3. System Architecture", palette)];

  const archImg = loadImage(path.join(diagramsDir || "/tmp/diagrams", "architecture.png"));
  if (archImg) {
    items.push(embeddedImage(archImg));
  } else {
    items.push(calloutBox("Architecture Diagram", "Run: python3 scripts/generate_diagrams.py --type erd --data erd_data.json --output /tmp/diagrams/", palette, "note"));
  }

  items.push(heading2("3.1 Component Overview", palette));
  const components = safeArr(data.architecture_components);
  const defaultComponents = [
    ["CO-001", "Frontend (Next.js)", "UI rendering, routing, client state", "Vercel", "EP-001 to EP-015"],
    ["CO-002", "API Layer", "Request validation, auth middleware, rate limiting", "Vercel Serverless", "EP-001 to EP-015"],
    ["CO-003", "Auth Service (Clerk)", "User identity, sessions, JWT issuance", "Clerk SaaS", "—"],
    ["CO-004", "Business Logic", "Domain rules, data processing, orchestration", "Vercel Serverless", "TB-001 to TB-008"],
    ["CO-005", "Database (Supabase)", "Persistent data storage, RLS policies", "Supabase Cloud", "TB-001 to TB-008"],
    ["CO-006", "Cache (Redis)", "Session data, rate limit counters, hot queries", "Upstash Redis", "—"],
    ["CO-007", "Storage (R2)", "User uploads, media files, exports", "Cloudflare R2", "—"],
    ["CO-008", "Email Service (Resend)", "Transactional email delivery", "Resend SaaS", "—"],
    ["CO-009", "Payment Service (Stripe)", "Subscription billing, webhook processing", "Stripe SaaS", "EP-011, EP-012"],
  ];
  const compRows = components.length > 0
    ? components.map(c => [safe(c.id), safe(c.name), safe(c.responsibility), safe(c.hosting), safe(c.interfaces)])
    : defaultComponents;
  items.push(makeTable(["ID", "Component", "Responsibility", "Hosting", "Interfaces"], compRows, palette, [1000, 2200, 3000, 1800, 1360]));

  items.push(heading2("3.2 Capacity Planning", palette));
  const cap = safeObj(data.capacity_planning);
  items.push(makeTable(["Metric", "Current Target", "12-Month Projection", "Scale Trigger"], [
    ["Registered Users", safe(cap.users_current, "10,000"), safe(cap.users_12m, "100,000"), "Auto-scale at 70% CPU"],
    ["API Requests/Day", safe(cap.rps_current, "500,000"), safe(cap.rps_12m, "5,000,000"), "Add read replica at 80% DB CPU"],
    ["Database Size", safe(cap.db_current, "10 GB"), safe(cap.db_12m, "200 GB"), "Partition at 500 GB"],
    ["Storage", safe(cap.storage_current, "50 GB"), safe(cap.storage_12m, "2 TB"), "CDN cache large assets"],
  ], palette, [2500, 2000, 2300, 2560]));

  return items;
}

function buildDatabaseSection(data, palette, diagramsDir) {
  const items = [heading1("4. Database Schema + Data Dictionary", palette)];

  const erdImg = loadImage(path.join(diagramsDir || "/tmp/diagrams", "erd_schema.png"));
  if (erdImg) {
    items.push(heading2("4.1 Entity Relationship Diagram", palette));
    items.push(embeddedImage(erdImg));
  }

  items.push(heading2("4.2 Database Configuration", palette));
  const dbConfig = [
    ["Database Type", safe(data.database_type, "PostgreSQL 15 (SQL / Relational)")],
    ["Hosting", safe(data.database_hosting, "Supabase Cloud")],
    ["ORM / Query Builder", safe(data.orm, "Drizzle ORM")],
    ["Connection Pooling", safe(data.connection_pooling, "PgBouncer (via Supabase, max 100 pooled connections)")],
    ["Row-Level Security", safe(data.rls_enabled, "Enabled — all tables use RLS policies")],
    ["Backup Strategy", safe(data.backup_strategy, "Daily automated backups, 30-day retention, PITR enabled")],
    ["Migration Tool", safe(data.migration_tool, "Drizzle Kit (drizzle-kit push for dev, generate for prod)")],
  ];
  items.push(makeTable(["Setting", "Value"], dbConfig, palette, [3000, 6360]));
  items.push(spacer());

  // Database tables with data dictionary
  items.push(heading2("4.3 Schema Tables + Data Dictionary", palette));
  items.push(bodyPara("Each column includes: type, constraints, PII classification, validation rules, and business definition. Engineers must not make assumptions about column meaning."));
  items.push(spacer());

  const tables = safeArr(data.database_tables);
  const defaultTables = [
    {
      name: "users", id: "TB-001", description: "Registered user accounts",
      columns: [
        { name: "id", type: "uuid", pk: true, nullable: false, pii: false, default: "gen_random_uuid()", validation: "UUID v4 format", definition: "Unique user identifier, immutable after creation" },
        { name: "email", type: "varchar(255)", pk: false, nullable: false, pii: true, unique: true, validation: "RFC 5322 format, max 255 chars, lowercase enforced", definition: "Primary login identifier. PII — handle per GDPR Article 17" },
        { name: "display_name", type: "varchar(100)", pk: false, nullable: true, pii: true, validation: "1-100 chars, no HTML/script injection", definition: "User's chosen display name. PII — visible to other users" },
        { name: "avatar_url", type: "text", pk: false, nullable: true, pii: false, validation: "Must be valid URL, max 2048 chars", definition: "Profile avatar, points to R2 storage path" },
        { name: "plan", type: "varchar(50)", pk: false, nullable: false, default: "'free'", validation: "ENUM: free | pro | enterprise", definition: "Subscription plan tier, synced from Stripe webhook" },
        { name: "created_at", type: "timestamptz", pk: false, nullable: false, default: "now()", validation: "UTC timezone required", definition: "Account creation timestamp, immutable" },
        { name: "updated_at", type: "timestamptz", pk: false, nullable: false, default: "now()", validation: "Auto-updated via trigger", definition: "Last modification timestamp" },
      ]
    }
  ];

  const tableList = tables.length > 0 ? tables : defaultTables;
  tableList.forEach(tbl => {
    items.push(new Paragraph({
      children: [new TextRun({ text: `Table: ${safe(tbl.name)}`, bold: true, size: 26, font: "Arial", color: palette.primary })],
      spacing: { before: 240, after: 80 }
    }));
    if (tbl.id) items.push(bodyPara(`ID: ${tbl.id} — ${safe(tbl.description)}`));

    const colRows = safeArr(tbl.columns).map(col => [
      safe(col.name),
      safe(col.type),
      col.pk ? "PK" : col.nullable ? "nullable" : "NOT NULL",
      col.pii ? "PII" : "—",
      safe(col.default, "—"),
      safe(col.validation, "—"),
      safe(col.definition, "—")
    ]);
    if (colRows.length > 0) {
      items.push(makeTable(
        ["Column", "Type", "Constraints", "PII?", "Default", "Validation Rules", "Business Definition"],
        colRows, palette, [1300, 1500, 1000, 500, 1100, 1800, 2160]
      ));
    }
    items.push(spacer());
  });

  // Seed data
  items.push(heading2("4.4 Seed Data Requirements", palette));
  items.push(bodyPara("Data required at project initialization for development and staging environments."));
  const seedData = safeArr(data.seed_data);
  const defaultSeed = [
    ["users", "3 demo accounts: admin@demo.com, user@demo.com, enterprise@demo.com with plan free/pro/enterprise"],
    ["plans", "3 subscription tiers: free (0/mo), pro (29/mo), enterprise (99/mo) with feature limits"],
    ["settings", "Default system configuration values (feature flags, rate limits, email templates)"],
  ];
  const seedRows = seedData.length > 0
    ? seedData.map(s => [safe(s.table), safe(s.data)])
    : defaultSeed;
  items.push(makeTable(["Table", "Seed Data Description"], seedRows, palette, [2000, 7360]));

  return items;
}

function buildAPISection(data, palette, diagramsDir) {
  const items = [heading1("5. API Design (OpenAPI-Style Contracts)", palette)];
  items.push(bodyPara("All endpoints documented with request/response schemas, auth requirements, and error catalog. Format follows OpenAPI 3.1 conventions."));

  const seqImg = loadImage(path.join(diagramsDir || "/tmp/diagrams", "auth_sequence.png"));
  if (seqImg) {
    items.push(heading2("5.1 Auth Flow Sequence", palette));
    items.push(embeddedImage(seqImg, 6000000, 3000000));
  }

  items.push(heading2("5.2 API Versioning Strategy", palette));
  items.push(makeTable(["Property", "Value"], [
    ["Versioning Method", safe(data.api_versioning, "URL Path prefix: /api/v1/")],
    ["Current Version", safe(data.api_version, "v1")],
    ["Deprecation Policy", safe(data.api_deprecation, "12 months notice, version sunset communicated via response header: Sunset: <date>")],
    ["Breaking Change Policy", safe(data.api_breaking_changes, "Major version bump required; additive changes (new fields) are non-breaking")],
    ["Rate Limiting", safe(data.api_rate_limit, "100 req/min per user (authenticated), 20 req/min (unauthenticated). Headers: X-RateLimit-Limit, X-RateLimit-Remaining")],
    ["Base URL", safe(data.api_base_url, "https://api.yourapp.com/v1")],
    ["Auth Header", safe(data.api_auth_header, "Authorization: Bearer <jwt_token>")],
  ], palette, [3000, 6360]));
  items.push(spacer());

  // Endpoint catalog
  items.push(heading2("5.3 Endpoint Catalog", palette));
  const endpoints = safeArr(data.api_endpoints);
  const defaultEndpoints = [
    { id: "EP-001", method: "POST", path: "/auth/register", auth: false, description: "Register new user account", request: "{ email, password, display_name }", response: "{ user_id, email, plan }", errors: "400 validation, 409 email exists" },
    { id: "EP-002", method: "POST", path: "/auth/login", auth: false, description: "Authenticate user, return JWT", request: "{ email, password }", response: "{ access_token, refresh_token, expires_in }", errors: "400 invalid, 401 wrong credentials, 429 rate limit" },
    { id: "EP-003", method: "GET", path: "/users/me", auth: true, description: "Get current user profile", request: "—", response: "{ id, email, display_name, plan, created_at }", errors: "401 unauthorized, 404 not found" },
    { id: "EP-004", method: "PATCH", path: "/users/me", auth: true, description: "Update user profile fields", request: "{ display_name?, avatar_url? }", response: "{ updated user object }", errors: "400 validation, 401 unauthorized" },
    { id: "EP-005", method: "DELETE", path: "/users/me", auth: true, description: "Delete account (GDPR right-to-delete)", request: "{ confirm: 'DELETE' }", response: "204 No Content", errors: "400 missing confirm, 401 unauthorized" },
    { id: "EP-006", method: "POST", path: "/webhooks/stripe", auth: false, description: "Stripe payment event webhook", request: "Stripe event payload (verified by signature)", response: "200 OK", errors: "400 invalid signature, 422 unprocessable" },
  ];
  const epList = endpoints.length > 0 ? endpoints : defaultEndpoints;
  const epRows = epList.map(ep => [
    safe(ep.id), safe(ep.method), safe(ep.path),
    ep.auth ? "JWT Required" : "Public",
    safe(ep.description), safe(ep.request), safe(ep.response), safe(ep.errors)
  ]);
  items.push(makeTable(
    ["ID", "Method", "Path", "Auth", "Description", "Request Body", "Response (200)", "Error Codes"],
    epRows, palette, [700, 700, 1600, 900, 1500, 1400, 1400, 1160]
  ));
  items.push(spacer());

  // Standard error format
  items.push(heading2("5.4 Standard Error Response Format", palette));
  items.push(calloutBox(
    "Standardized Error Schema",
    `All errors return: { "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "field": "email", "docs_url": "https://docs.app.com/errors/VALIDATION_ERROR" } }. Error codes are snake_case constants (not HTTP status text). HTTP status codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Rate Limited, 500 Internal Error.`,
    palette, "insight"
  ));

  return items;
}

function buildAuthSection(data, palette) {
  const items = [heading1("6. Authentication & Authorization", palette)];

  const authConfig = [
    ["Auth Provider", safe(data.auth_provider, "Clerk")],
    ["Protocol", safe(data.auth_protocol, "OAuth 2.0 + OIDC (OpenID Connect)")],
    ["Token Format", safe(data.auth_token, "JWT (RS256 signed, 15-minute expiry)")],
    ["Refresh Token", safe(data.auth_refresh, "Rotating refresh tokens, 7-day expiry, stored in HttpOnly cookie")],
    ["MFA Support", safe(data.auth_mfa, "TOTP (Google Authenticator), SMS OTP, Passkeys (WebAuthn)")],
    ["Session Management", safe(data.auth_sessions, "Server-side session store (Redis), invalidated on logout or password change")],
    ["Social OAuth", safe(data.auth_social, "Google, GitHub, Microsoft (configurable per environment)")],
  ];
  items.push(makeTable(["Property", "Value"], authConfig, palette, [3000, 6360]));
  items.push(spacer());

  items.push(heading2("6.1 Authorization Model", palette));
  const authModel = safeArr(data.auth_roles);
  const defaultRoles = [
    ["admin", "Full system access, user management, system config, all data", "Internal staff only — provisioned manually"],
    ["owner", "Full access to own organization resources, billing management", "Account creator, can invite members"],
    ["member", "Read/write own resources within organization, no billing access", "Standard user role"],
    ["viewer", "Read-only access to shared resources", "Guest collaborator"],
    ["service_account", "API-only access via API key, no UI login", "CI/CD pipelines, integrations"],
  ];
  const roleRows = authModel.length > 0
    ? authModel.map(r => [safe(r.role), safe(r.permissions), safe(r.notes)])
    : defaultRoles;
  items.push(makeTable(["Role", "Permissions", "Assignment Rules"], roleRows, palette, [1800, 4800, 2760]));

  return items;
}

function buildSecuritySection(data, palette) {
  const items = [heading1("7. Security + LINDDUN Privacy Threat Model", palette)];

  items.push(heading2("7.1 OWASP Top 10 Mitigations", palette));
  const owaspRows = [
    ["A01: Broken Access Control", "Row-Level Security (RLS) on all DB tables, auth middleware on all private endpoints, RBAC enforced at API layer"],
    ["A02: Cryptographic Failures", "AES-256 at rest, TLS 1.3 in transit, bcrypt/Argon2 for passwords, secrets in env vars (never committed)"],
    ["A03: Injection", "Drizzle ORM parameterized queries only, input validation via Zod on all endpoints"],
    ["A04: Insecure Design", "Threat modeling before implementation, security review required for auth/payment features"],
    ["A05: Security Misconfiguration", "Infrastructure as Code (no manual config), secrets via Vault/env manager, CORS whitelist"],
    ["A06: Vulnerable Components", "Dependabot auto-PRs, weekly Snyk scans, lock files committed"],
    ["A07: Auth Failures", "Clerk manages auth complexity, brute force protection via rate limiting, account lockout after 5 failures"],
    ["A09: Logging Failures", "Structured JSON logs, no PII in logs, audit log for all data mutations, logs shipped to SIEM"],
    ["A10: SSRF", "URL validation on all user-provided URLs, internal network blocked for outbound requests"],
  ];
  items.push(makeTable(["OWASP Risk", "Mitigation"], owaspRows, palette, [3000, 6360]));
  items.push(spacer());

  items.push(heading2("7.2 LINDDUN Privacy Threat Model", palette));
  items.push(bodyPara("LINDDUN identifies privacy-specific threats beyond security vulnerabilities. Each threat category is analyzed for this system."));
  items.push(spacer());
  const linddunRows = [
    ["Linkability", "Ability to correlate a user's actions across sessions/features", "Random session tokens, no cross-feature tracking IDs, data minimization"],
    ["Identifiability", "Ability to identify a user from supposedly anonymous data", "k-anonymity for analytics aggregates, hashed user IDs in logs"],
    ["Non-repudiation", "Preventing a user from denying their actions (can be a privacy risk)", "Audit logs accessible only to admins, user can request own audit trail"],
    ["Detectability", "Ability to detect that a user exists in the system", "Generic error responses (no 'user not found' vs 'wrong password'), rate limiting"],
    ["Disclosure of Information", "Leaking private data to unauthorized parties", "Field-level encryption for PII, RLS policies, no PII in API error messages"],
    ["Unawareness", "User not knowing how their data is used", "Privacy policy link on all data collection forms, consent banners, data export feature"],
    ["Non-Compliance", "Failure to meet legal requirements (GDPR, CCPA)", "Right-to-delete (EP-005), data export endpoint, consent management, DPA signed with vendors"],
  ];
  items.push(makeTable(["Threat", "Description", "Mitigation"], linddunRows, palette, [1600, 3000, 4760]));

  return items;
}

function buildPerformanceSection(data, palette, chartsDir) {
  const items = [heading1("8. Performance Requirements (SLO/SLI/SLA)", palette)];
  items.push(bodyPara("Service Level Indicators measure what we observe. Service Level Objectives set targets. Service Level Agreements are external commitments. Error Budgets define acceptable failure within the SLO."));
  items.push(spacer());

  const sloImg = loadImage(path.join(chartsDir || "/tmp/charts", "nfr_radar.png"));
  if (sloImg) items.push(embeddedImage(sloImg, 5000000, 3000000));

  const perf = safeObj(data.slo_definitions);
  items.push(heading2("8.1 SLO Definitions", palette));
  const sloRows = [
    ["Availability SLI", safe(perf.availability_sli, "Fraction of minutes where service returns 2xx responses"), "99.9%", "99.5% external SLA", "0.1% failures = 8.76 hrs/year", "Alert when burn rate > 5x expected"],
    ["Latency SLI", safe(perf.latency_sli, "Fraction of valid requests completing in < 500ms"), "95% of requests < 500ms", "—", "5% slow requests = alerting threshold", "Alert when p95 > 300ms over 5 min"],
    ["Error Rate SLI", safe(perf.error_sli, "Fraction of requests returning 5xx responses"), "< 0.5% error rate", "—", "0.5% = 5,000 errors per 1M requests", "Alert when 5xx rate > 1% over 2 min"],
  ];
  items.push(makeTable(["SLI Metric", "Definition", "SLO Target", "SLA (External)", "Error Budget", "Alert Threshold"], sloRows, palette, [1600, 2200, 1400, 1200, 1600, 1360]));

  return items;
}

function buildTestingSection(data, palette) {
  const items = [heading1("9. Testing Strategy", palette)];

  const testRows = [
    ["Unit Tests", "Jest / Vitest", "> 80% coverage on business logic", "Run on every commit (pre-push hook)"],
    ["Integration Tests", "Jest + Supertest", "All API endpoints, happy + error paths", "Run on PR open, merge to main"],
    ["E2E Tests", "Playwright", "Critical user journeys (register, login, payment, core features)", "Run on staging before prod deploy"],
    ["Performance Tests", "k6", "p95 < 500ms at 1000 RPS sustained for 5 minutes", "Run weekly on staging"],
    ["Security Scans", "Snyk + OWASP ZAP", "No critical/high CVEs in dependencies; no OWASP Top 10 in APIs", "Weekly automated + on demand"],
    ["Database Tests", "pg-tap or Drizzle integration", "All migrations reversible; RLS policies enforced correctly", "Run on DB schema changes"],
    ["Accessibility Tests", "Axe-core + Lighthouse", "0 critical a11y violations; Lighthouse a11y score >= 90", "Run on UI PRs"],
    ["Contract Tests", "Pact.io", "Consumer-driven contracts for all third-party API integrations", "Run on integration changes"],
  ];
  items.push(makeTable(["Test Type", "Tool", "Coverage/Criteria", "When Run"], testRows, palette, [1800, 2000, 3800, 1760]));

  return items;
}

function buildMonitoringSection(data, palette) {
  const items = [heading1("10. Monitoring & Observability", palette)];

  items.push(heading2("10.1 Observability Stack", palette));
  const stackRows = [
    ["Logs", "Structured JSON via Pino/Winston → Datadog Log Management", "All API requests, errors, auth events, data mutations"],
    ["Metrics", "Datadog APM + custom metrics via StatsD", "Latency histograms, request rates, error rates, DB connection pool, queue depth"],
    ["Traces", "OpenTelemetry → Datadog APM", "Distributed traces across API → DB → external services"],
    ["Uptime", "Better Uptime / Pingdom", "Public endpoint checks every 60 seconds from 3 regions"],
    ["Errors", "Sentry (frontend + backend)", "Error grouping, stack traces, release tracking, user impact"],
    ["Dashboards", "Datadog + Grafana", "Real-time SLO burn rate, latency p50/p95/p99, active users"],
  ];
  items.push(makeTable(["Signal Type", "Tool", "What is Monitored"], stackRows, palette, [1500, 3000, 4860]));
  items.push(spacer());

  items.push(heading2("10.2 Alerting Thresholds", palette));
  const alertRows = [
    ["P0 - Critical", "Service down > 2 min", "Page oncall immediately (PagerDuty)", "< 5 min MTTA"],
    ["P0 - Critical", "Error rate > 5% over 5 min", "Page oncall + Slack #incidents", "< 5 min MTTA"],
    ["P1 - High", "p99 latency > 2s over 10 min", "Slack #oncall channel", "< 15 min MTTA"],
    ["P1 - High", "SLO burn rate > 5x for 1 hour", "Slack #oncall + email to eng lead", "< 30 min MTTA"],
    ["P2 - Medium", "Disk/memory > 80% on DB", "Slack #alerts", "Next business day"],
    ["P2 - Medium", "Dependency rate limit approaching (80%)", "Slack #alerts", "Next business day"],
  ];
  items.push(makeTable(["Severity", "Trigger Condition", "Notification", "Response Target"], alertRows, palette, [1500, 3000, 3000, 1860]));

  return items;
}

function buildInfraSection(data, palette) {
  const items = [heading1("11. Infrastructure & DevOps", palette)];

  items.push(heading2("11.1 Environment Overview", palette));
  const envRows = [
    ["Development", "Local machines + Supabase local", "Feature development + unit testing", "Manual deploy via CLI"],
    ["Staging", "Vercel Preview + Supabase staging project", "Integration testing + UAT", "Auto-deploy from main branch"],
    ["Production", "Vercel Production + Supabase production project", "Live users", "Manual promotion from staging with approval"],
  ];
  items.push(makeTable(["Environment", "Infrastructure", "Purpose", "Deployment Method"], envRows, palette, [1800, 3000, 2500, 2060]));
  items.push(spacer());

  items.push(heading2("11.2 Infrastructure as Code (IaC)", palette));
  const iacConfig = [
    ["IaC Framework", safe(data.iac_framework, "Terraform (HashiCorp)")],
    ["State Backend", safe(data.iac_state, "Terraform Cloud / S3 with DynamoDB lock table")],
    ["Resource Naming", safe(data.iac_naming, "{project}-{env}-{resource}: myapp-prod-db, myapp-staging-api")],
    ["Tagging Strategy", safe(data.iac_tagging, "All resources tagged: project, env, team, cost-center, managed-by=terraform")],
    ["Environment Promotion", safe(data.iac_promotion, "dev → staging via PR merge; staging → prod via manual approval in CI/CD")],
    ["Drift Detection", safe(data.iac_drift, "terraform plan in CI on schedule; alert if diff detected outside IaC")],
  ];
  items.push(makeTable(["Property", "Value"], iacConfig, palette, [3000, 6360]));

  return items;
}

function buildImplementationSection(data, palette) {
  const items = [heading1("12. Implementation Plan", palette)];

  const milestones = safeArr(data.implementation_milestones);
  const defaultMilestones = [
    ["Milestone 0", "2 weeks", "Infrastructure & Environment Setup", "All environments running, CI/CD green, secrets configured"],
    ["Milestone 1", "3 weeks", "Foundation: Auth + Core Data Model", "Users can register/login, core DB schema migrated, basic CRUD working"],
    ["Milestone 2", "4 weeks", "Primary Features", "Main product functionality accessible to users, all core endpoints live"],
    ["Milestone 3", "3 weeks", "Integrations & Secondary Features", "Stripe payments, email flows, third-party integrations complete"],
    ["Milestone 4", "2 weeks", "Hardening, QA & Performance", "All tests passing, performance SLOs met, security review complete"],
    ["Milestone 5", "1 week", "Launch & Monitoring", "Production deploy, runbooks written, on-call rotation established"],
  ];
  const msRows = milestones.length > 0
    ? milestones.map(m => [safe(m.name), safe(m.duration), safe(m.goal), safe(m.exit_criteria)])
    : defaultMilestones;
  items.push(makeTable(["Milestone", "Duration", "Goal", "Exit Criteria"], msRows, palette, [1800, 1200, 3000, 3360]));

  return items;
}

function buildRiskSection(data, palette) {
  const items = [heading1("13. Risk Assessment", palette)];

  const risks = safeArr(data.risks);
  const defaultRisks = [
    ["Scope Creep", "High", "Medium", "Lock requirements before dev starts; change request process for new features"],
    ["Third-party API downtime (Stripe, Clerk)", "Medium", "High", "Circuit breakers, graceful degradation (read-only mode), vendor SLA review"],
    ["Database performance at scale", "Medium", "High", "Query optimization, read replicas, caching layer, connection pooling"],
    ["Security breach / data leak", "Low", "Critical", "LINDDUN threat model, penetration testing before launch, incident response plan"],
    ["Key engineer turnover", "Medium", "High", "ADRs document all decisions, onboarding docs, no single points of knowledge"],
    ["Compliance violation (GDPR)", "Low", "Critical", "DPA with all vendors, right-to-delete implementation, privacy review pre-launch"],
    ["Integration complexity underestimated", "Medium", "Medium", "Spike stories before committing to estimates on new integrations"],
  ];
  const riskRows = risks.length > 0
    ? risks.map(r => [safe(r.risk), safe(r.probability), safe(r.impact), safe(r.mitigation)])
    : defaultRisks;
  items.push(makeTable(["Risk", "Probability", "Impact", "Mitigation"], riskRows, palette, [2500, 1200, 1200, 4460]));

  return items;
}

function buildChecklistSection(data, palette) {
  const items = [heading1("14. Infrastructure Provisioning Checklist", palette)];
  items.push(bodyPara("Complete these steps in order before Milestone 1 development begins. Mark complete in project tracker (Linear/Jira)."));
  items.push(spacer());

  const groups = [
    { title: "Repository & Code", items: [
      "[ ] Create GitHub organization and repository",
      "[ ] Configure branch protection rules (require 2 PR reviews, require CI pass)",
      "[ ] Add CODEOWNERS file mapping feature areas to team members",
      "[ ] Set up repository secrets (GitHub Actions secrets for each environment)",
      "[ ] Create .env.example with all required variables documented",
      "[ ] Initialize project with chosen framework (Next.js + Drizzle ORM)",
    ]},
    { title: "Cloud & Database", items: [
      "[ ] Create Supabase project (staging and production)",
      "[ ] Configure Supabase RLS policies template",
      "[ ] Set up database connection strings in env vars",
      "[ ] Enable Supabase Point-in-Time Recovery (PITR)",
      "[ ] Set up Upstash Redis instance (or Redis Cloud)",
      "[ ] Configure Cloudflare R2 bucket + CORS policy",
    ]},
    { title: "Auth & Payments", items: [
      "[ ] Create Clerk application (dev + prod instances)",
      "[ ] Configure Clerk webhook endpoint for user events",
      "[ ] Create Stripe account, products, and price IDs",
      "[ ] Configure Stripe webhook endpoint + secret",
      "[ ] Set up Resend domain + sender email verification",
    ]},
    { title: "CI/CD & Monitoring", items: [
      "[ ] Configure GitHub Actions workflows (test, build, deploy)",
      "[ ] Set up Vercel project with environment variables",
      "[ ] Configure auto-deploy: main → staging, manual → production",
      "[ ] Set up Sentry project (frontend + backend DSNs)",
      "[ ] Configure Datadog agent or equivalent APM",
      "[ ] Set up uptime monitoring for public endpoints",
      "[ ] Create runbook template for common incidents",
    ]},
    { title: "Security & Compliance", items: [
      "[ ] Enable Dependabot for dependency updates",
      "[ ] Set up Snyk or GitHub Advanced Security for vulnerability scanning",
      "[ ] Add pre-commit hooks (ESLint, type check, secret scan)",
      "[ ] Review and sign DPAs with all data processors",
      "[ ] Create privacy policy and terms of service documents",
    ]},
  ];

  groups.forEach(group => {
    items.push(heading2(`14.${groups.indexOf(group) + 1} ${group.title}`, palette));
    group.items.forEach(item => items.push(bulletItem(item)));
    items.push(spacer());
  });

  return items;
}

function buildAppendixSection(data, palette) {
  const items = [heading1("15. Appendix", palette)];

  items.push(heading2("15.1 Glossary", palette));
  const glossary = safeArr(data.glossary);
  const defaultGlossary = [
    ["ADR", "Architectural Decision Record — documents a significant technical decision with context, rationale, and consequences"],
    ["FURPS+", "Non-functional requirements categories: Functionality, Usability, Reliability, Performance, Supportability"],
    ["LINDDUN", "Privacy threat modeling framework: Linkability, Identifiability, Non-repudiation, Detectability, Disclosure, Unawareness, Non-compliance"],
    ["RLS", "Row-Level Security — database feature enforcing per-row access control based on session user context"],
    ["SLI", "Service Level Indicator — measurable metric (e.g., 'fraction of requests completing in < 500ms')"],
    ["SLO", "Service Level Objective — target for an SLI over a time window (e.g., '99.9% of requests meet SLI over 28 days')"],
    ["SLA", "Service Level Agreement — external, contractual commitment to customers (typically softer than SLO)"],
    ["IaC", "Infrastructure as Code — managing cloud resources via code (Terraform, CDK, Pulumi) rather than manual config"],
    ["JTBD", "Jobs To Be Done — framework for understanding user motivations: 'When X, I want Y, so I can Z'"],
  ];
  const glossaryRows = glossary.length > 0
    ? glossary.map(g => [safe(g.term), safe(g.definition)])
    : defaultGlossary;
  items.push(makeTable(["Term", "Definition"], glossaryRows, palette, [2000, 7360]));
  items.push(spacer());

  items.push(heading2("15.2 Open Questions", palette));
  const questions = safeArr(data.open_questions);
  if (questions.length > 0) {
    questions.forEach(q => items.push(bulletItem(safe(q))));
  } else {
    items.push(bodyPara("No open questions at time of writing."));
  }

  return items;
}

// ─── MAIN DOCUMENT BUILDER ─────────────────────────────────────────────────

function buildERDDocument(data, chartsDir, diagramsDir, palette) {
  const children = [
    ...buildCoverPage(data, palette),
    pageBreak(),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),
    ...buildNFRSection(data, palette),
    pageBreak(),
    ...buildTechStackSection(data, palette),
    pageBreak(),
    ...buildArchitectureSection(data, palette, diagramsDir),
    pageBreak(),
    ...buildDatabaseSection(data, palette, diagramsDir),
    pageBreak(),
    ...buildAPISection(data, palette, diagramsDir),
    pageBreak(),
    ...buildAuthSection(data, palette),
    pageBreak(),
    ...buildSecuritySection(data, palette),
    pageBreak(),
    ...buildPerformanceSection(data, palette, chartsDir),
    pageBreak(),
    ...buildTestingSection(data, palette),
    pageBreak(),
    ...buildMonitoringSection(data, palette),
    pageBreak(),
    ...buildInfraSection(data, palette),
    pageBreak(),
    ...buildImplementationSection(data, palette),
    pageBreak(),
    ...buildRiskSection(data, palette),
    pageBreak(),
    ...buildChecklistSection(data, palette),
    pageBreak(),
    ...buildAppendixSection(data, palette),
  ];

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
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
          ]
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
              new TextRun({ text: projectName + " — ERD", size: 18, font: "Arial", color: "666666" }),
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
const outputFile = getArg("--output") || "output_erd.docx";
const chartsDir = getArg("--charts") || "/tmp/erd_charts";
const diagramsDir = getArg("--diagrams") || "/tmp/erd_diagrams";
const paletteName = getArg("--palette") || "engineering_dark";

if (!dataFile) {
  console.error("Usage: node generate_erd_docx.js --data erd_data.json --output output_erd.docx");
  console.error("  --charts   /tmp/erd_charts    Directory with PNG charts from generate_charts.py");
  console.error("  --diagrams /tmp/erd_diagrams  Directory with PNG diagrams from generate_diagrams.py");
  console.error("  --palette  engineering_dark   Color palette (corporate_blue|modern_teal|engineering_dark|nord_dev|minimal_mono)");
  process.exit(1);
}

let data = {};
try {
  data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
} catch (e) {
  console.error(`ERROR reading data file: ${e.message}`);
  process.exit(1);
}

const palette = PALETTES[paletteName] || PALETTES.engineering_dark;
console.log(`Generating ERD DOCX: ${outputFile}`);
console.log(`  Project: ${data.project_name || "(no name)"}`);
console.log(`  Palette: ${paletteName}`);

const doc = buildERDDocument(data, chartsDir, diagramsDir, palette);

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputFile, buffer);
  console.log(`\nDone: ${outputFile} (${(buffer.length / 1024).toFixed(0)} KB)`);
}).catch(err => {
  console.error("ERROR generating DOCX:", err);
  process.exit(1);
});
