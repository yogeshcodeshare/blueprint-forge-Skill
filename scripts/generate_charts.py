#!/usr/bin/env python3
"""
generate_charts.py — Matplotlib chart generator for PRD, ERD, and Milestone DOCX documents.

Usage:
  python3 generate_charts.py --type prd --data data.json --output /tmp/charts/
  python3 generate_charts.py --type erd --data data.json --output /tmp/charts/
  python3 generate_charts.py --type milestone --data data.json --output /tmp/charts/

Output: PNG image files in the specified output directory.
These PNGs are embedded into DOCX documents via ImageRun.
"""

import argparse
import json
import os
import sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from io import BytesIO


# ─── COLOR PALETTES ──────────────────────────────────────────────────────────

PALETTES = {
    "corporate_blue":   {"primary": "#1B3A6B", "accent": "#4A90D9", "success": "#27AE60", "danger": "#E74C3C", "warning": "#F39C12", "bg": "#F8FAFF"},
    "modern_teal":      {"primary": "#0D5C63", "accent": "#00B4D8", "success": "#2ECC71", "danger": "#E74C3C", "warning": "#F39C12", "bg": "#F0FAFA"},
    "executive_dark":   {"primary": "#2C3E50", "accent": "#F0C040", "success": "#27AE60", "danger": "#E74C3C", "warning": "#F39C12", "bg": "#F5F5F5"},
    "startup_vibrant":  {"primary": "#6C3483", "accent": "#FF6B6B", "success": "#1ABC9C", "danger": "#E74C3C", "warning": "#F39C12", "bg": "#FFF8FF"},
    "minimal_mono":     {"primary": "#2C2C2C", "accent": "#888888", "success": "#444444", "danger": "#999999", "warning": "#666666", "bg": "#FAFAFA"},
    "nord_dev":         {"primary": "#2E3440", "accent": "#88C0D0", "success": "#A3BE8C", "danger": "#BF616A", "warning": "#EBCB8B", "bg": "#ECEFF4"},
    "engineering_dark": {"primary": "#0A1628", "accent": "#00BFFF", "success": "#00E676", "danger": "#FF5252", "warning": "#FFD740", "bg": "#F0F4F8"},
}


def _safe_float(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _safe_list(v, default=None):
    if default is None:
        default = []
    return v if isinstance(v, list) else default


def _safe_str(v, default=""):
    return str(v) if v is not None else default


def save_chart(fig, output_dir: str, filename: str) -> str:
    """Save figure to PNG and return the file path."""
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, filename)
    fig.savefig(path, format='png', dpi=200, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    return path


# ─── GANTT / TIMELINE CHART ──────────────────────────────────────────────────

def create_gantt_chart(data: dict, palette: dict, output_dir: str, filename="gantt.png") -> str:
    """Generate a Gantt chart from task breakdown data."""
    tasks = _safe_list(data.get("tasks"))
    if not tasks:
        return None

    # Group tasks by week
    week_map = {}
    for task in tasks:
        week = _safe_str(task.get("week", "Week 1"))
        week_map.setdefault(week, []).append(task)

    weeks = sorted(week_map.keys(), key=lambda w: int(''.join(filter(str.isdigit, w.split()[1].split('-')[0])) or '1'))
    total_bars = sum(len(v) for v in week_map.values())

    fig_height = max(4, total_bars * 0.5 + 2)
    fig, ax = plt.subplots(figsize=(12, fig_height))
    ax.set_facecolor(palette["bg"])
    fig.patch.set_facecolor('white')

    colors_by_priority = {
        "P0": palette["danger"], "P1": palette["warning"],
        "P2": palette["accent"], "P3": palette["success"],
        "Must Have": palette["danger"], "Should Have": palette["warning"],
        "Could Have": palette["accent"], "Won't Have": "#CCCCCC",
    }

    y = 0
    yticks, ylabels = [], []
    week_starts = {}

    for week in weeks:
        week_starts[week] = y
        week_tasks = week_map[week]
        week_num = int(''.join(filter(str.isdigit, week.split()[1].split('-')[0])) or '1')

        for task in week_tasks:
            name = _safe_str(task.get("name", "Task"))[:45]
            priority = _safe_str(task.get("priority", "P2"))
            bar_color = colors_by_priority.get(priority, palette["accent"])

            # Draw bar spanning this week
            ax.barh(y, 1.8, left=week_num - 1, height=0.6,
                    color=bar_color, alpha=0.85, edgecolor='white', linewidth=0.5)

            yticks.append(y)
            ylabels.append(name)
            y += 1

        # Week separator line
        if week != weeks[-1]:
            ax.axhline(y - 0.1, color='#CCCCCC', linewidth=0.5, linestyle='--')

    ax.set_yticks(yticks)
    ax.set_yticklabels(ylabels, fontsize=8, fontfamily='DejaVu Sans')
    ax.set_xlabel("Week", fontsize=10, color=palette["primary"])
    ax.set_title("Milestone Task Timeline", fontsize=13, fontweight='bold',
                 color=palette["primary"], pad=12)
    ax.set_xlim(-0.2, len(weeks) + 0.5)
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3, linestyle='--')

    # Legend
    legend_handles = [
        mpatches.Patch(color=palette["danger"], label='P0 / Must Have'),
        mpatches.Patch(color=palette["warning"], label='P1 / Should Have'),
        mpatches.Patch(color=palette["accent"], label='P2 / Could Have'),
    ]
    ax.legend(handles=legend_handles, loc='lower right', fontsize=8, framealpha=0.9)
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── SCOPE DISTRIBUTION PIE CHART ────────────────────────────────────────────

def create_scope_chart(data: dict, palette: dict, output_dir: str, filename="scope.png") -> str:
    """Generate a scope distribution pie chart."""
    streams = _safe_list(data.get("scope_streams") or data.get("work_streams"))
    if not streams:
        return None

    labels = [_safe_str(s.get("name", "Unknown")) for s in streams]
    values = [_safe_float(s.get("effort", s.get("percentage", 1))) for s in streams]

    if sum(values) == 0:
        return None

    colors = plt.cm.get_cmap('Set3')(np.linspace(0, 1, len(labels)))
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.patch.set_facecolor('white')

    wedge_props = {'edgecolor': 'white', 'linewidth': 2}
    wedges, texts, autotexts = ax.pie(
        values, labels=None, autopct='%1.0f%%',
        colors=colors, wedgeprops=wedge_props,
        startangle=90, pctdistance=0.82
    )
    for t in autotexts:
        t.set_fontsize(9)
        t.set_color('white')
        t.set_fontweight('bold')

    ax.legend(wedges, labels, loc="center left", bbox_to_anchor=(1, 0.5),
              fontsize=9, title="Work Streams", title_fontsize=10)
    ax.set_title("Scope Distribution by Work Stream", fontsize=13,
                 fontweight='bold', color=palette["primary"], pad=12)
    ax.set_aspect('equal')
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── RISK HEATMAP ─────────────────────────────────────────────────────────────

def create_risk_heatmap(data: dict, palette: dict, output_dir: str, filename="risk_heatmap.png") -> str:
    """Generate a 5x5 risk heat map (likelihood × severity)."""
    risks = _safe_list(data.get("risks"))
    if not risks:
        return None

    fig, ax = plt.subplots(figsize=(8, 7))
    fig.patch.set_facecolor('white')

    # 5×5 grid background
    grid = np.array([
        [1, 2, 3, 4, 5],
        [2, 4, 6, 8, 10],
        [3, 6, 9, 12, 15],
        [4, 8, 12, 16, 20],
        [5, 10, 15, 20, 25],
    ])
    cmap = plt.cm.RdYlGn_r
    ax.imshow(grid, cmap=cmap, aspect='auto', alpha=0.6, vmin=1, vmax=25)

    labels_x = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    labels_y = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    ax.set_xticks(range(5))
    ax.set_xticklabels(labels_x, fontsize=9)
    ax.set_yticks(range(5))
    ax.set_yticklabels(labels_y, fontsize=9)
    ax.set_xlabel("Likelihood →", fontsize=11, color=palette["primary"])
    ax.set_ylabel("Severity →", fontsize=11, color=palette["primary"])
    ax.set_title("Risk Heat Map", fontsize=13, fontweight='bold',
                 color=palette["primary"], pad=12)

    # Plot risk points
    severity_map = {"very low": 0, "low": 1, "medium": 2, "high": 3, "very high": 4,
                    "1": 0, "2": 1, "3": 2, "4": 3, "5": 4}
    for i, risk in enumerate(risks[:15]):
        sev = severity_map.get(_safe_str(risk.get("severity", "medium")).lower(), 2)
        lik = severity_map.get(_safe_str(risk.get("likelihood", "medium")).lower(), 2)
        ax.plot(lik, sev, 'o', markersize=16, color=palette["primary"], alpha=0.85,
                markeredgecolor='white', markeredgewidth=1.5)
        ax.text(lik, sev, str(i + 1), ha='center', va='center',
                color='white', fontsize=7, fontweight='bold')

    # Legend
    legend_text = "\n".join([f"{i+1}. {_safe_str(r.get('name', 'Risk'))[:30]}"
                              for i, r in enumerate(risks[:10])])
    ax.text(5.5, 2.5, legend_text, fontsize=7, va='center',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='white', alpha=0.9, edgecolor='#CCCCCC'))
    ax.set_xlim(-0.5, 7)
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── GOALS BAR CHART ──────────────────────────────────────────────────────────

def create_goals_chart(data: dict, palette: dict, output_dir: str, filename="goals.png") -> str:
    """Generate a goals/KPI bar chart with current vs. target."""
    goals = _safe_list(data.get("goals") or data.get("success_metrics"))
    if not goals:
        return None

    metrics = [(
        _safe_str(g.get("metric", g.get("name", "Metric"))),
        _safe_float(g.get("current", 0)),
        _safe_float(g.get("target", 100))
    ) for g in goals if g.get("target")]

    if not metrics:
        return None

    names, current_vals, target_vals = zip(*metrics)
    x = np.arange(len(names))
    width = 0.35

    fig, ax = plt.subplots(figsize=(max(8, len(names) * 1.5), 6))
    fig.patch.set_facecolor('white')
    ax.set_facecolor(palette["bg"])

    bars1 = ax.bar(x - width/2, current_vals, width, label='Current',
                   color=palette["accent"], alpha=0.8, edgecolor='white')
    bars2 = ax.bar(x + width/2, target_vals, width, label='Target',
                   color=palette["primary"], alpha=0.9, edgecolor='white')

    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=30, ha='right', fontsize=9)
    ax.set_ylabel("Value", fontsize=11)
    ax.set_title("Goals & Success Metrics: Current vs. Target", fontsize=13,
                 fontweight='bold', color=palette["primary"], pad=12)
    ax.legend(fontsize=10)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.yaxis.set_tick_params(labelsize=9)
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── PRIORITY MATRIX ──────────────────────────────────────────────────────────

def create_priority_matrix(data: dict, palette: dict, output_dir: str, filename="priority_matrix.png") -> str:
    """Generate an effort vs. impact priority matrix."""
    features = _safe_list(data.get("features") or data.get("user_stories"))
    if not features:
        return None

    fig, ax = plt.subplots(figsize=(10, 8))
    fig.patch.set_facecolor('white')
    ax.set_facecolor(palette["bg"])

    quadrant_colors = {
        "quick_win": "#D5F5E3", "strategic": "#D6EAF8",
        "fill_in": "#FEF9E7", "avoid": "#FADBD8"
    }
    ax.fill_between([0, 5], [5, 5], [10, 10], color=quadrant_colors["strategic"], alpha=0.3)
    ax.fill_between([5, 10], [5, 5], [10, 10], color=quadrant_colors["quick_win"], alpha=0.3)
    ax.fill_between([0, 5], [0, 0], [5, 5], color=quadrant_colors["avoid"], alpha=0.3)
    ax.fill_between([5, 10], [0, 0], [5, 5], color=quadrant_colors["fill_in"], alpha=0.3)

    ax.text(2.5, 7.5, "Strategic\n(Long-term)", ha='center', va='center', fontsize=9,
            color='#2980B9', fontweight='bold', alpha=0.7)
    ax.text(7.5, 7.5, "Quick Win\n(Do First)", ha='center', va='center', fontsize=9,
            color='#27AE60', fontweight='bold', alpha=0.7)
    ax.text(2.5, 2.5, "Avoid\n(Don't Do)", ha='center', va='center', fontsize=9,
            color='#E74C3C', fontweight='bold', alpha=0.7)
    ax.text(7.5, 2.5, "Fill-In\n(Nice to Have)", ha='center', va='center', fontsize=9,
            color='#F39C12', fontweight='bold', alpha=0.7)

    plotted_positions = []
    for feature in features[:20]:
        effort = _safe_float(feature.get("effort", feature.get("story_points", 5)))
        impact = _safe_float(feature.get("impact", feature.get("value", 5)))
        if effort > 10: effort = 10
        if impact > 10: impact = 10
        name = _safe_str(feature.get("name", feature.get("title", "Feature")))[:25]

        # Collision avoidance
        offset_x, offset_y = 0, 0
        for px, py in plotted_positions:
            if abs(effort - px) < 1.2 and abs(impact - py) < 1.2:
                offset_x += 0.8
                offset_y += 0.3

        ax.scatter(effort + offset_x, impact + offset_y, s=80,
                   color=palette["accent"], zorder=5, edgecolors=palette["primary"])
        ax.annotate(name, (effort + offset_x, impact + offset_y),
                    xytext=(8, 4), textcoords='offset points',
                    fontsize=7, color=palette["primary"],
                    bbox=dict(boxstyle='round,pad=0.2', facecolor='white', alpha=0.85, edgecolor='#DDDDDD'))
        plotted_positions.append((effort + offset_x, impact + offset_y))

    ax.axhline(5, color='#AAAAAA', linewidth=1, linestyle='--')
    ax.axvline(5, color='#AAAAAA', linewidth=1, linestyle='--')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.set_xlabel("Effort →  (Low = Easy)", fontsize=11, color=palette["primary"])
    ax.set_ylabel("Impact →  (High = Valuable)", fontsize=11, color=palette["primary"])
    ax.set_title("Feature Priority Matrix: Effort vs. Impact", fontsize=13,
                 fontweight='bold', color=palette["primary"], pad=12)
    ax.grid(alpha=0.2, linestyle='--')
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── MILESTONE TIMELINE ───────────────────────────────────────────────────────

def create_milestone_timeline(data: dict, palette: dict, output_dir: str, filename="timeline.png") -> str:
    """Generate a milestone timeline bar chart."""
    milestones = _safe_list(data.get("milestones") or data.get("timeline"))
    if not milestones:
        return None

    names = [_safe_str(m.get("name", m.get("title", f"Milestone {i}")))[:40]
             for i, m in enumerate(milestones)]
    durations = [_safe_float(m.get("duration", m.get("weeks", 2))) for m in milestones]

    if not durations:
        return None

    colors = [palette["accent"], palette["primary"], palette["success"],
              palette["warning"], palette["danger"]] * 3

    fig, ax = plt.subplots(figsize=(12, max(4, len(names) * 0.7 + 2)))
    fig.patch.set_facecolor('white')
    ax.set_facecolor(palette["bg"])

    starts = [sum(durations[:i]) for i in range(len(durations))]
    for i, (name, start, dur) in enumerate(zip(names, starts, durations)):
        ax.barh(i, dur, left=start, height=0.5, color=colors[i % len(colors)],
                alpha=0.85, edgecolor='white', linewidth=1.5)
        ax.text(start + dur / 2, i, f"{dur:.0f}w", ha='center', va='center',
                fontsize=9, color='white', fontweight='bold')

    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=10)
    ax.set_xlabel("Duration (Weeks)", fontsize=11, color=palette["primary"])
    ax.set_title("Project Milestone Timeline", fontsize=13, fontweight='bold',
                 color=palette["primary"], pad=12)
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── NFR RADAR CHART (ERD) ────────────────────────────────────────────────────

def create_nfr_radar(data: dict, palette: dict, output_dir: str, filename="nfr_radar.png") -> str:
    """Generate a radar chart for Non-Functional Requirements coverage."""
    nfr_categories = ["Performance", "Scalability", "Reliability", "Security",
                      "Usability", "Maintainability"]
    nfrs = data.get("non_functional_requirements", {})
    if not nfrs:
        return None

    scores = []
    for cat in nfr_categories:
        cat_data = nfrs.get(cat.lower(), nfrs.get(cat, {}))
        if isinstance(cat_data, dict):
            score = 8 if cat_data else 4
        elif isinstance(cat_data, list):
            score = min(10, len(cat_data) * 2)
        else:
            score = 5
        scores.append(score)

    N = len(nfr_categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    scores_plot = scores + [scores[0]]
    angles_plot = angles + [angles[0]]
    labels_plot = nfr_categories + [nfr_categories[0]]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor('white')
    ax.plot(angles_plot, scores_plot, color=palette["accent"], linewidth=2)
    ax.fill(angles_plot, scores_plot, color=palette["accent"], alpha=0.25)
    ax.set_xticks(angles)
    ax.set_xticklabels(nfr_categories, fontsize=10, color=palette["primary"])
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(["2", "4", "6", "8", "10"], fontsize=8, color='#999999')
    ax.set_title("NFR Coverage (FURPS+)", fontsize=13, fontweight='bold',
                 color=palette["primary"], pad=20)
    ax.grid(color='#CCCCCC', linestyle='--', linewidth=0.5)
    plt.tight_layout()
    return save_chart(fig, output_dir, filename)


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def generate_charts(doc_type: str, data: dict, output_dir: str):
    """Generate all applicable charts for a document type."""
    palette_name = data.get("palette_name", "corporate_blue")
    if doc_type in ("erd", "milestone"):
        palette_name = data.get("palette_name", "engineering_dark")
    palette = PALETTES.get(palette_name, PALETTES["corporate_blue"])

    generated = []

    if doc_type == "prd":
        r = create_goals_chart(data, palette, output_dir)
        if r: generated.append(r)
        r = create_priority_matrix(data, palette, output_dir)
        if r: generated.append(r)
        r = create_milestone_timeline(data, palette, output_dir)
        if r: generated.append(r)
        r = create_risk_heatmap(data, palette, output_dir)
        if r: generated.append(r)
        r = create_scope_chart(data, palette, output_dir)
        if r: generated.append(r)

    elif doc_type == "erd":
        r = create_risk_heatmap(data, palette, output_dir)
        if r: generated.append(r)
        r = create_milestone_timeline(data, palette, output_dir)
        if r: generated.append(r)
        r = create_nfr_radar(data, palette, output_dir)
        if r: generated.append(r)
        r = create_goals_chart(data, palette, output_dir, "slo_targets.png")
        if r: generated.append(r)

    elif doc_type == "milestone":
        r = create_gantt_chart(data, palette, output_dir)
        if r: generated.append(r)
        r = create_scope_chart(data, palette, output_dir)
        if r: generated.append(r)
        r = create_risk_heatmap(data, palette, output_dir)
        if r: generated.append(r)

    return generated


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate chart PNGs for DOCX documents")
    parser.add_argument("--type", required=True, choices=["prd", "erd", "milestone"])
    parser.add_argument("--data", required=True, help="Path to JSON data file")
    parser.add_argument("--output", required=True, help="Output directory for PNG files")
    args = parser.parse_args()

    with open(args.data, 'r') as f:
        data = json.load(f)

    generated = generate_charts(args.type, data, args.output)
    print(f"Generated {len(generated)} chart(s):")
    for path in generated:
        print(f"  ✓ {path}")
