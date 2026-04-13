/**
 * generate_prd_docx.js — Professional PRD DOCX generator using docx.js
 *
 * Usage:
 *   node generate_prd_docx.js --data prd_data.json --output output_prd.docx
 *   node generate_prd_docx.js --data prd_data.json --charts /tmp/prd_charts/ --diagrams /tmp/prd_diagrams/ --output output_prd.docx
 *
 * Install: npm install docx
 *
 * Features:
 *   - Cover page with project metadata and Goal Type
 *   - Clickable Table of Contents (TOC)
 *   - All PRD sections: North Star, JTBD, Error States, Privacy, A11y, Launch Checklist, etc.
 *   - Embedded chart PNGs (Matplotlib output)
 *   - Embedded diagram PNGs (Kroki API output)
 *   - Professional styling (Arial, color-coded headings, callout boxes)
 *   - Headers with project name, footers with page numbers
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
  corporate_blue:  { primary: "1B3A6B", accent: "4A90D9", success: "27AE60", danger: "E74C3C", warning: "F39C12", light: "EBF5FF", header: "FFFFFF" },
  modern_teal:     { primary: "0D5C63", accent: "00B4D8", success: "2ECC71", danger: "E74C3C", warning: "F39C12", light: "E0FAFA", header: "FFFFFF" },
  executive_dark:  { primary: "2C3E50", accent: "F0C040", success: "27AE60", danger: "E74C3C", warning: "F39C12", light: "FDFAF0", header: "FFFFFF" },
  startup_vibrant: { primary: "6C3483", accent: "FF6B6B", success: "1ABC9C", danger: "E74C3C", warning: "F39C12", light: "FFF0FF", header: "FFFFFF" },
  minimal_mono:    { primary: "2C2C2C", accent: "888888", success: "444444", danger: "999999", warning: "666666", light: "F5F5F5", header: "FFFFFF" },
  nord_dev:        { primary: "2E3440", accent: "88C0D0", success: "A3BE8C", danger: "BF616A", warning: "EBCB8B", light: "ECEFF4", header: "FFFFFF" },
  engineering_dark:{ primary: "0A1628", accent: "00BFFF", success: "00E676", danger: "FF5252", warning: "FFD740", light: "E8F4F8", header: "FFFFFF" },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

const safe = (v, def = "") => (v != null ? String(v) : def);
const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeObj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function loadImage(imgPath) {
  try {
    if (imgPath && fs.existsSync(imgPath)) {
      return fs.readFileSync(imgPath);
    }
  } catch (e) {}
  return null;
}

function tableCell(text, options = {}) {
  const { bold = false, color = null, shade = null, width = null } = options;
  const cell = new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
    children: [new Paragraph({
      children: [new TextRun({
        text: safe(text),
        bold,
        size: 20,
        font: "Arial",
        color: color || "000000"
      })]
    })]
  });
  return cell;
}

function headerRow(cells, palette) {
  return new TableRow({
    children: cells.map(cell => tableCell(cell, { bold: true, shade: palette.primary, color: "FFFFFF" }))
  });
}

function dataRow(cells, isEven = false, palette) {
  const shade = isEven ? palette.light : "FFFFFF";
  return new TableRow({
    children: cells.map(cell => tableCell(cell, { shade }))
  });
}

function makeTable(headers, rows, palette, colWidths = null) {
  const totalWidth = 9360;
  const colW = colWidths || headers.map(() => Math.floor(totalWidth / headers.length));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      headerRow(headers, palette),
      ...rows.map((row, i) => dataRow(row, i % 2 === 0, palette))
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
    note: { fill: "F3E5F5", border: "7B1FA2" }
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
          new Paragraph({ children: [new TextRun({ text: `💡 ${title}`, bold: true, size: 22, font: "Arial", color: border })] }),
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
      altText: { title: "Chart", description: "Generated chart", name: "chart" }
    })],
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer(lines = 1) {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: 120 * lines } });
}

function statusBadge(status, palette) {
  const colors = { "Draft": "F39C12", "Review": "4A90D9", "Approved": "27AE60", "Active": "27AE60", "Deprecated": "E74C3C" };
  const color = colors[status] || palette.accent;
  return new TextRun({ text: ` [${status}] `, bold: true, color, size: 20, font: "Arial" });
}

// ─── DOCUMENT BUILDER ──────────────────────────────────────────────────────

function buildPRDDocument(data, chartsDir, diagramsDir, palette) {
  const children = [];

  // ── COVER PAGE ──────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: safe(data.project_name, "Product Requirements Document"), bold: true, size: 64, font: "Arial", color: palette.primary })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1440, after: 360 }
    }),
    new Paragraph({
      children: [new TextRun({ text: safe(data.subtitle, safe(data.project_summary, "")), size: 28, font: "Arial", color: palette.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 720 }
    }),
    // Horizontal rule
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: palette.accent, space: 1 } },
      spacing: { after: 360 }
    }),
    // Metadata table
    makeTable(
      ["Field", "Value"],
      [
        ["Version", safe(data.version, "1.0")],
        ["Date", safe(data.date, new Date().toISOString().split('T')[0])],
        ["Author", safe(data.author, "Product Team")],
        ["Goal Type", safe(data.goal_type, "MVP")],
        ["Status", safe(data.status, "Draft")],
        ["Audience", safe(data.audience, "Engineering + Stakeholders")],
      ],
      palette, [2800, 6560]
    ),
    spacer(2),
    pageBreak()
  );

  // ── TABLE OF CONTENTS ───────────────────────────────────────────────────
  children.push(
    heading1("Table of Contents", palette),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
      stylesWithLevels: [{ styleId: "Heading1", level: 1 }, { styleId: "Heading2", level: 2 }]
    }),
    pageBreak()
  );

  // ── EXECUTIVE SUMMARY ───────────────────────────────────────────────────
  if (data.executive_summary) {
    children.push(heading1("Executive Summary", palette));
    const es = safeObj(data.executive_summary);
    if (es.problem) {
      children.push(heading2("The Problem", palette), bodyPara(es.problem));
    }
    if (es.solution) {
      children.push(heading2("The Solution", palette), bodyPara(es.solution));
    }
    if (es.opportunity) {
      children.push(bodyPara(es.opportunity));
    }
    if (es.summary && typeof es.summary === 'string') {
      children.push(bodyPara(es.summary));
    }
    children.push(spacer());
  }

  // ── PROBLEM STATEMENT ────────────────────────────────────────────────────
  if (data.problem_statement) {
    children.push(heading1("Problem Statement", palette), bodyPara(data.problem_statement));
    if (data.problem_impact) children.push(bodyPara(`Impact: ${data.problem_impact}`));
    children.push(spacer());
  }

  // ── NORTH STAR METRIC ─────────────────────────────────────────────────
  if (data.north_star_metric) {
    children.push(heading1("North Star Metric", palette));
    const nsm = safeObj(data.north_star_metric);
    children.push(
      calloutBox("North Star Metric",
        `${safe(nsm.metric || data.north_star_metric)} — Target: ${safe(nsm.target, "TBD")} by ${safe(nsm.date, "launch")}. Measured by: ${safe(nsm.measurement, "analytics dashboard")}`,
        palette, "insight")
    );
    children.push(spacer());
  }

  // ── GOALS & SUCCESS METRICS ───────────────────────────────────────────
  const goals = safeArr(data.goals || data.success_metrics);
  if (goals.length > 0) {
    children.push(heading1("Goals & Success Metrics", palette));
    const goalsRows = goals.map(g => [
      safe(g.id || g.name), safe(g.name || g.metric), safe(g.current, "—"),
      safe(g.target), safe(g.measurement || g.how, "—"), safe(g.date, "—")
    ]);
    children.push(makeTable(
      ["ID", "Goal / Metric", "Current", "Target", "Measurement", "Date"],
      goalsRows, palette, [800, 2200, 1000, 1000, 2160, 1200]
    ));
    const goalsChart = loadImage(path.join(chartsDir, 'goals.png'));
    if (goalsChart) children.push(spacer(), embeddedImage(goalsChart));
    children.push(spacer());
  }

  // ── SCOPE ─────────────────────────────────────────────────────────────
  if (data.scope) {
    children.push(heading1("Scope", palette));
    const scope = safeObj(data.scope);
    if (safeArr(scope.in_scope).length > 0) {
      children.push(heading2("In Scope", palette));
      safeArr(scope.in_scope).forEach(item => children.push(bulletItem(item)));
    }
    if (safeArr(scope.out_of_scope).length > 0) {
      children.push(heading2("Out of Scope", palette));
      safeArr(scope.out_of_scope).forEach(item => children.push(bulletItem(item)));
    }
    children.push(spacer());
  }

  // ── USER PERSONAS ──────────────────────────────────────────────────────
  const personas = safeArr(data.user_personas || data.personas);
  if (personas.length > 0) {
    children.push(heading1("User Personas", palette));
    personas.forEach(p => {
      children.push(
        heading2(safe(p.name), palette),
        makeTable(["Field", "Detail"],
          [["Role", safe(p.role)], ["Goal", safe(p.goal)], ["Pain Point", safe(p.pain_point)], ["Tech Level", safe(p.tech_level, "—")]],
          palette, [2200, 7160])
      );
      children.push(spacer());
    });
  }

  // ── USER STORIES / JOB STORIES ────────────────────────────────────────
  const stories = safeArr(data.user_stories || data.requirements);
  if (stories.length > 0) {
    children.push(heading1("User Stories & Job Stories", palette));
    const storiesRows = stories.map(s => [
      safe(s.id, "US-?"), safe(s.priority, "—"),
      safe(s.user_story || s.story || s.description),
      safe(s.job_story || "—"),
      safe(s.acceptance_criteria || s.criteria || "—")
    ]);
    children.push(makeTable(
      ["ID", "Priority", "User Story", "Job Story (JTBD)", "Acceptance Criteria (BDD)"],
      storiesRows, palette, [800, 900, 2400, 2160, 3100]
    ));
    const priorityChart = loadImage(path.join(chartsDir, 'priority_matrix.png'));
    if (priorityChart) children.push(spacer(), embeddedImage(priorityChart));
    children.push(spacer());
  }

  // ── USER FLOWS ────────────────────────────────────────────────────────
  const userFlows = safeArr(data.user_flows);
  if (userFlows.length > 0) {
    children.push(heading1("User Flows", palette));
    userFlows.forEach(flow => {
      children.push(heading2(safe(flow.name || flow.title, "Primary Flow"), palette));
      if (flow.description) children.push(bodyPara(flow.description));
      const steps = safeArr(flow.steps);
      steps.forEach((step, i) => children.push(bulletItem(`${i + 1}. ${safe(step)}`)));
      children.push(spacer());
    });
    const flowDiagram = loadImage(path.join(diagramsDir, 'user_flow.png'));
    if (flowDiagram) children.push(embeddedImage(flowDiagram));
    children.push(spacer());
  }

  // ── ERROR STATES & EDGE CASES ────────────────────────────────────────
  const errorStates = safeArr(data.error_states);
  if (errorStates.length > 0) {
    children.push(heading1("Error States & Edge Cases", palette));
    const errRows = errorStates.map(e => [
      safe(e.feature || e.area), safe(e.scenario || e.error),
      safe(e.trigger || e.cause, "—"), safe(e.behavior || e.response), safe(e.user_message || "—")
    ]);
    children.push(makeTable(
      ["Feature", "Error Scenario", "Trigger", "Expected Behavior", "User Message"],
      errRows, palette, [1800, 2000, 1600, 2200, 1760]
    ));
    children.push(spacer());
  }

  // ── TECHNICAL ARCHITECTURE ────────────────────────────────────────────
  if (data.architecture || data.architecture_components) {
    children.push(heading1("Technical Architecture Overview", palette));
    if (data.architecture_description) children.push(bodyPara(data.architecture_description));
    const archDiagram = loadImage(path.join(diagramsDir, 'architecture.png'));
    if (archDiagram) {
      children.push(embeddedImage(archDiagram));
    }
    const components = safeArr(data.architecture_components);
    if (components.length > 0) {
      const compRows = components.map(c => [safe(c.layer), safe(c.name), safe(c.description || c.role, "—")]);
      children.push(spacer(), makeTable(["Layer", "Component", "Description"], compRows, palette, [2000, 3000, 4360]));
    }
    children.push(spacer());
  }

  // ── TELEMETRY & ANALYTICS ─────────────────────────────────────────────
  const telemetry = safeObj(data.telemetry);
  const events = safeArr(telemetry.events || data.analytics_events);
  if (events.length > 0) {
    children.push(heading1("Telemetry & Analytics Hooks", palette));
    if (telemetry.instrumentation_plan) children.push(bodyPara(telemetry.instrumentation_plan));
    const evtRows = events.map(e => [safe(e.event || e.name), safe(e.trigger || e.when, "—"), safe(e.properties || e.data, "—"), safe(e.destination || e.sdk, "—")]);
    children.push(makeTable(["Event Name", "Trigger", "Properties", "Destination"], evtRows, palette, [2500, 2200, 2560, 2100]));
    children.push(spacer());
  }

  // ── PRIVACY & COMPLIANCE ──────────────────────────────────────────────
  if (data.privacy_compliance || data.privacy) {
    const pc = safeObj(data.privacy_compliance || data.privacy);
    children.push(heading1("Privacy & Compliance", palette));
    if (safeArr(pc.regulations).length > 0) {
      children.push(heading2("Applicable Regulations", palette));
      safeArr(pc.regulations).forEach(r => children.push(bulletItem(safe(r))));
    }
    if (safeArr(pc.pii_fields).length > 0) {
      const piiRows = safeArr(pc.pii_fields).map(f => [safe(f.field || f), safe(f.classification, "PII"), safe(f.retention || "—"), safe(f.protection || "—")]);
      children.push(heading2("PII Fields", palette),
        makeTable(["Field", "Classification", "Retention", "Protection"], piiRows, palette, [2500, 1500, 2500, 2860]));
    }
    if (pc.right_to_delete) children.push(heading2("Right to Delete", palette), bodyPara(pc.right_to_delete));
    children.push(spacer());
  }

  // ── ACCESSIBILITY REQUIREMENTS ────────────────────────────────────────
  if (data.accessibility) {
    const a11y = safeObj(data.accessibility);
    children.push(heading1("Accessibility Requirements", palette));
    children.push(calloutBox("WCAG Standard",
      `Minimum standard: ${safe(a11y.standard, "WCAG 2.1 Level AA")}. Color contrast: ${safe(a11y.contrast_ratio, "≥4.5:1 for text")}`,
      palette, "note"));
    if (safeArr(a11y.requirements).length > 0) {
      safeArr(a11y.requirements).forEach(r => children.push(bulletItem(safe(r))));
    }
    children.push(spacer());
  }

  // ── TIMELINE & MILESTONES ─────────────────────────────────────────────
  const milestones = safeArr(data.milestones || data.timeline);
  if (milestones.length > 0) {
    children.push(heading1("Timeline & Milestones", palette));
    const msRows = milestones.map(m => [safe(m.name || m.title), safe(m.duration || m.weeks, "—"), safe(m.date || "—"), safe(m.features || m.deliverables, "—"), safe(m.success_criteria || "—")]);
    children.push(makeTable(
      ["Milestone", "Duration", "Target Date", "Key Features", "Success Criteria"],
      msRows, palette, [2200, 1200, 1500, 2500, 1960]
    ));
    const timelineChart = loadImage(path.join(chartsDir, 'timeline.png'));
    if (timelineChart) children.push(spacer(), embeddedImage(timelineChart));
    children.push(spacer());
  }

  // ── RISKS & MITIGATIONS ───────────────────────────────────────────────
  const risks = safeArr(data.risks);
  if (risks.length > 0) {
    children.push(heading1("Risks & Mitigations", palette));
    const riskRows = risks.map(r => [safe(r.name || r.risk), safe(r.severity || r.impact, "—"), safe(r.likelihood, "—"), safe(r.description || "—"), safe(r.mitigation || "—"), safe(r.owner || "—")]);
    children.push(makeTable(
      ["Risk", "Severity", "Likelihood", "Description", "Mitigation", "Owner"],
      riskRows, palette, [1500, 1000, 1000, 1800, 2400, 1660]
    ));
    const riskChart = loadImage(path.join(chartsDir, 'risk_heatmap.png'));
    if (riskChart) children.push(spacer(), embeddedImage(riskChart));
    children.push(spacer());
  }

  // ── LAUNCH CHECKLIST ──────────────────────────────────────────────────
  const launchChecklist = safeArr(data.launch_checklist);
  if (launchChecklist.length > 0) {
    children.push(heading1("Launch Checklist", palette));
    const launchRows = launchChecklist.map(item => [safe(item.category || item.area, "—"), safe(item.item || item.task), safe(item.status || "Pending"), safe(item.owner || "—")]);
    children.push(makeTable(["Category", "Item", "Status", "Owner"], launchRows, palette, [2000, 4000, 1500, 1860]));
    children.push(spacer());
  }

  // ── AI FEATURE SPECIFICATION ──────────────────────────────────────────
  if (data.ai_feature_spec) {
    const ai = safeObj(data.ai_feature_spec);
    children.push(heading1("AI Feature Specification", palette));
    if (ai.quality_metrics) {
      children.push(heading2("Quality Metrics", palette));
      const qmRows = safeArr(ai.quality_metrics).map(m => [safe(m.metric), safe(m.target), safe(m.measurement, "—")]);
      if (qmRows.length > 0) children.push(makeTable(["Metric", "Target", "Measurement"], qmRows, palette));
    }
    if (ai.guardrails) children.push(heading2("Guardrails", palette), bodyPara(ai.guardrails));
    if (ai.evaluation_framework) children.push(heading2("Evaluation Framework", palette), bodyPara(ai.evaluation_framework));
    if (ai.prompt_documentation) children.push(heading2("Prompt Engineering", palette), bodyPara(ai.prompt_documentation));
    children.push(spacer());
  }

  // ── APPENDIX ──────────────────────────────────────────────────────────
  if (data.appendix) {
    children.push(heading1("Appendix", palette));
    const app = safeObj(data.appendix);
    if (safeArr(app.glossary).length > 0) {
      children.push(heading2("Glossary", palette));
      safeArr(app.glossary).forEach(g => children.push(bodyPara(`${safe(g.term)}: ${safe(g.definition)}`)));
    }
    if (safeArr(app.open_questions).length > 0) {
      children.push(heading2("Open Questions", palette));
      safeArr(app.open_questions).forEach(q => children.push(bulletItem(safe(q.question || q))));
    }
  }

  return children;
}


// ─── MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const argMap = {};
  for (let i = 0; i < args.length; i += 2) {
    argMap[args[i].replace('--', '')] = args[i + 1];
  }

  const dataPath = argMap.data;
  const outputPath = argMap.output || 'output_prd.docx';
  const chartsDir = argMap.charts || '/tmp/prd_charts';
  const diagramsDir = argMap.diagrams || '/tmp/prd_diagrams';

  if (!dataPath || !fs.existsSync(dataPath)) {
    console.error(`ERROR: Data file not found: ${dataPath}`);
    console.error('Usage: node generate_prd_docx.js --data prd_data.json --output output.docx');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const paletteName = data.palette_name || 'corporate_blue';
  const palette = PALETTES[paletteName] || PALETTES.corporate_blue;

  console.log(`Generating PRD DOCX for: ${data.project_name || 'Untitled Project'}`);
  console.log(`Palette: ${paletteName} | Output: ${outputPath}`);

  const children = buildPRDDocument(data, chartsDir, diagramsDir, palette);

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22 } }
      },
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
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
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
              new TextRun({ text: safe(data.project_name, "PRD"), font: "Arial", size: 18, color: palette.primary }),
              new TextRun({ text: "\t" + new Date().toISOString().split('T')[0], font: "Arial", size: 18, color: "999999" })
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: palette.accent, space: 1 } }
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
              new TextRun({ text: " of ", font: "Arial", size: 18, color: "999999" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "999999" })
            ],
            alignment: AlignmentType.RIGHT
          })]
        })
      },
      children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✓ DOCX generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch(err => { console.error("ERROR:", err); process.exit(1); });
