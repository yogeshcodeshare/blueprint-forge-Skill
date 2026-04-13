#!/usr/bin/env python3
"""
generate_diagrams.py — Diagram generator using Kroki API and/or draw.io MCP.

Converts text-based diagram definitions (Mermaid, PlantUML, DBML, Graphviz, C4)
to PNG images for embedding in DOCX documents via ImageRun.

Supported diagram types (via Kroki API — free, no auth):
  - mermaid       : Flowcharts, sequence, class, ER, state, pie, git graphs
  - plantuml      : UML diagrams, C4 architecture, sequence, component, deployment
  - dbml          : Database schema ER diagrams
  - graphviz      : Directed/undirected graphs, network diagrams
  - c4plantuml    : C4 model architecture diagrams
  - bpmn          : Business process diagrams

Usage:
  python3 generate_diagrams.py --type architecture --input arch.mmd --output /tmp/diagrams/
  python3 generate_diagrams.py --data data.json --output /tmp/diagrams/
  python3 generate_diagrams.py --demo                        # Generate all demo diagrams

Draw.io MCP (if configured):
  When jgraph/drawio-mcp is configured in Claude Code settings, use it directly
  via the search_shapes and diagram creation tools for editable .drawio files.
  This script is the fallback for environments without draw.io MCP.
"""

import argparse
import base64
import json
import os
import sys
import time
import zlib
from pathlib import Path
from typing import Optional

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("WARNING: 'requests' not installed. Run: pip install requests --break-system-packages")


KROKI_BASE_URL = "https://kroki.io"
TIMEOUT = 30  # seconds


def encode_diagram(diagram_text: str) -> str:
    """Encode diagram text for Kroki API URL."""
    compressed = zlib.compress(diagram_text.encode('utf-8'), level=9)
    return base64.urlsafe_b64encode(compressed).decode('ascii')


def render_via_kroki(diagram_text: str, diagram_type: str,
                     output_path: str, retries: int = 3) -> bool:
    """
    Render a diagram to PNG using Kroki API.

    Args:
        diagram_text: The diagram source code
        diagram_type: One of: mermaid, plantuml, dbml, graphviz, c4plantuml, bpmn
        output_path: Where to save the PNG file
        retries: Number of retry attempts on failure

    Returns:
        True if successful, False otherwise
    """
    if not REQUESTS_AVAILABLE:
        print(f"  SKIP: requests not available — cannot render {output_path}")
        return False

    encoded = encode_diagram(diagram_text)
    url = f"{KROKI_BASE_URL}/{diagram_type}/png/{encoded}"

    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=TIMEOUT)
            if response.status_code == 200:
                os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                return True
            else:
                print(f"  Kroki error {response.status_code} for {diagram_type}: {response.text[:200]}")
                if attempt < retries - 1:
                    time.sleep(1)
        except requests.exceptions.Timeout:
            print(f"  Timeout on attempt {attempt + 1}/{retries}")
            if attempt < retries - 1:
                time.sleep(2)
        except Exception as e:
            print(f"  Error: {e}")
            if attempt < retries - 1:
                time.sleep(1)

    return False


def render_via_post(diagram_text: str, diagram_type: str, output_path: str) -> bool:
    """Alternative: render via Kroki POST API (for very large diagrams)."""
    if not REQUESTS_AVAILABLE:
        return False

    url = f"{KROKI_BASE_URL}/{diagram_type}/png"
    payload = {"diagram_source": diagram_text, "diagram_type": diagram_type,
               "output_format": "png"}
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        if response.status_code == 200:
            os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"  POST error: {e}")
    return False


# ─── DIAGRAM TEMPLATES ────────────────────────────────────────────────────────

def build_architecture_diagram(data: dict) -> tuple[str, str]:
    """Build Mermaid flowchart for system architecture."""
    components = data.get("architecture_components", [])
    if not components:
        # Default generic architecture
        diagram = """
graph TB
    subgraph Frontend
        FE[Next.js App]
        STYLE[Tailwind + ShadCN]
    end
    subgraph API
        GW[API Gateway / Next.js Routes]
        AUTH[Auth Middleware - Clerk]
    end
    subgraph Services
        BL[Business Logic]
        AI[AI Service - Claude API]
        EMAIL[Email Service - Resend]
    end
    subgraph Data
        DB[(Supabase PostgreSQL)]
        CACHE[Redis Cache]
        STORAGE[Cloudflare R2]
    end
    subgraph External
        STRIPE[Stripe Payments]
        SENTRY[Sentry Monitoring]
    end

    FE --> GW
    GW --> AUTH
    AUTH --> BL
    BL --> DB
    BL --> CACHE
    BL --> AI
    BL --> EMAIL
    BL --> STORAGE
    GW --> STRIPE
    BL --> SENTRY

    style Frontend fill:#dbeafe,stroke:#93c5fd
    style API fill:#dcfce7,stroke:#86efac
    style Services fill:#fef9c3,stroke:#fde047
    style Data fill:#fce7f3,stroke:#f9a8d4
    style External fill:#f3f4f6,stroke:#d1d5db
"""
        return diagram.strip(), "mermaid"

    # Build from components
    layers = {}
    for c in components:
        layer = c.get("layer", "services")
        layers.setdefault(layer, []).append(c)

    lines = ["graph TB"]
    layer_colors = {
        "frontend": "fill:#dbeafe,stroke:#93c5fd",
        "api": "fill:#dcfce7,stroke:#86efac",
        "service": "fill:#fef9c3,stroke:#fde047",
        "services": "fill:#fef9c3,stroke:#fde047",
        "data": "fill:#fce7f3,stroke:#f9a8d4",
        "external": "fill:#f3f4f6,stroke:#d1d5db",
    }

    for layer, comps in layers.items():
        safe_layer = layer.replace(" ", "_").replace("-", "_").upper()
        lines.append(f"    subgraph {safe_layer}")
        for c in comps:
            node_id = c.get("name", "C").replace(" ", "_").replace("-", "_")
            label = c.get("name", "Component")
            lines.append(f"        {node_id}[{label}]")
        lines.append("    end")

    # Add connections
    for c in components:
        src = c.get("name", "").replace(" ", "_").replace("-", "_")
        for conn in c.get("connects_to", []):
            dst = conn.replace(" ", "_").replace("-", "_")
            lines.append(f"    {src} --> {dst}")

    # Add layer styles
    for layer in layers:
        safe_layer = layer.replace(" ", "_").replace("-", "_").upper()
        color = layer_colors.get(layer.lower(), "fill:#f9fafb,stroke:#e5e7eb")
        lines.append(f"    style {safe_layer} {color}")

    return "\n".join(lines), "mermaid"


def build_erd_diagram(data: dict) -> tuple[str, str]:
    """Build DBML ER diagram for database schema."""
    tables = data.get("database_tables", data.get("entities", []))
    if not tables:
        diagram = """
Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  display_name varchar(100)
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table projects {
  id uuid [pk, default: `gen_random_uuid()`]
  owner_id uuid [ref: > users.id, not null]
  name varchar(255) [not null]
  status varchar(50) [default: 'active']
  created_at timestamptz [default: `now()`]
}

Table tasks {
  id uuid [pk, default: `gen_random_uuid()`]
  project_id uuid [ref: > projects.id, not null]
  assignee_id uuid [ref: > users.id]
  title varchar(500) [not null]
  status varchar(50) [default: 'todo']
  priority int [default: 2]
  created_at timestamptz [default: `now()`]
}
"""
        return diagram.strip(), "dbml"

    lines = []
    for table in tables:
        table_name = table.get("name", "table")
        lines.append(f"Table {table_name} {{")
        for col in table.get("columns", []):
            col_name = col.get("name", "col")
            col_type = col.get("type", "varchar")
            attrs = []
            if col.get("primary_key") or col.get("pk"):
                attrs.append("pk")
            if col.get("default"):
                attrs.append(f"default: `{col['default']}`")
            if col.get("not_null") or col.get("required"):
                attrs.append("not null")
            if col.get("unique"):
                attrs.append("unique")
            if col.get("ref"):
                attrs.append(f"ref: > {col['ref']}")
            attr_str = f" [{', '.join(attrs)}]" if attrs else ""
            lines.append(f"  {col_name} {col_type}{attr_str}")
        lines.append("}")
        lines.append("")

    return "\n".join(lines), "dbml"


def build_sequence_diagram(data: dict, flow_name: str = "auth_flow") -> tuple[str, str]:
    """Build PlantUML sequence diagram for API flows."""
    flows = data.get("sequence_flows", data.get("api_flows", {}))
    flow = flows.get(flow_name, {})

    if not flow:
        diagram = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam sequenceArrowColor #4A90D9
skinparam sequenceBoxBackgroundColor #F0F8FF
skinparam participantBackgroundColor #FFFFFF
skinparam participantBorderColor #4A90D9

actor User
participant "Frontend\\nNext.js" as FE
participant "API\\nGateway" as API
participant "Auth\\nClerk" as AUTH
database "Database\\nSupabase" as DB

User -> FE: Login Request
FE -> AUTH: Initiate OAuth Flow
AUTH -> User: Redirect to Provider
User -> AUTH: Credentials
AUTH -> API: JWT Token
API -> DB: Validate + Create Session
DB --> API: Session Created
API --> FE: Auth Success + Token
FE --> User: Redirect to Dashboard
@enduml
"""
        return diagram.strip(), "plantuml"

    lines = ["@startuml",
             "skinparam backgroundColor #FFFFFF",
             "skinparam sequenceArrowColor #4A90D9",
             ""]
    for participant in flow.get("participants", []):
        lines.append(f'participant "{participant}"')
    lines.append("")
    for step in flow.get("steps", []):
        lines.append(f'{step.get("from", "A")} -> {step.get("to", "B")}: {step.get("message", "...")}')
    lines.append("@enduml")
    return "\n".join(lines), "plantuml"


def build_user_flow_diagram(data: dict) -> tuple[str, str]:
    """Build Mermaid flowchart for user flows."""
    flows = data.get("user_flows", [])
    if not flows or not isinstance(flows[0], dict):
        diagram = """
flowchart TD
    A([User Opens App]) --> B{Logged In?}
    B -->|Yes| C[Dashboard]
    B -->|No| D[Login Page]
    D --> E{Login Method}
    E -->|Email/Password| F[Enter Credentials]
    E -->|OAuth| G[OAuth Provider]
    F --> H{Valid?}
    H -->|Yes| C
    H -->|No| I[Show Error]
    I --> D
    G --> H
    C --> J[Main Features]

    style A fill:#27AE60,color:#fff
    style C fill:#2980B9,color:#fff
    style J fill:#8E44AD,color:#fff
    style I fill:#E74C3C,color:#fff
"""
        return diagram.strip(), "mermaid"

    lines = ["flowchart TD"]
    node_ids = {}
    for i, flow in enumerate(flows[:1]):  # First flow
        steps = flow.get("steps", flow) if isinstance(flow, dict) else []
        for j, step in enumerate(steps[:15]):
            node_id = f"N{i}{j}"
            label = str(step)[:40] if isinstance(step, str) else str(step.get("action", step))[:40]
            node_ids[j] = node_id
            lines.append(f'    {node_id}["{label}"]')
            if j > 0:
                lines.append(f"    N{i}{j-1} --> {node_id}")

    return "\n".join(lines), "mermaid"


# ─── DATA-DRIVEN DIAGRAM GENERATION ──────────────────────────────────────────

def generate_diagrams_from_data(data: dict, output_dir: str) -> list:
    """Generate all relevant diagrams from document data."""
    generated = []
    os.makedirs(output_dir, exist_ok=True)

    doc_type = data.get("doc_type", "prd")

    # Architecture diagram — all document types
    diagram_text, diagram_type = build_architecture_diagram(data)
    path = os.path.join(output_dir, "architecture.png")
    if render_via_kroki(diagram_text, diagram_type, path):
        generated.append(path)
        print(f"  ✓ Architecture diagram: {path}")
    else:
        print(f"  ✗ Architecture diagram failed")

    # ERD diagram — for ERD docs
    if doc_type in ("erd", "all"):
        diagram_text, diagram_type = build_erd_diagram(data)
        path = os.path.join(output_dir, "erd_schema.png")
        if render_via_kroki(diagram_text, diagram_type, path):
            generated.append(path)
            print(f"  ✓ ERD schema diagram: {path}")

    # Sequence diagram — auth flow
    if doc_type in ("erd", "prd", "all"):
        diagram_text, diagram_type = build_sequence_diagram(data)
        path = os.path.join(output_dir, "auth_sequence.png")
        if render_via_kroki(diagram_text, diagram_type, path):
            generated.append(path)
            print(f"  ✓ Auth sequence diagram: {path}")

    # User flow diagram — for PRD and milestone
    if doc_type in ("prd", "milestone", "all"):
        diagram_text, diagram_type = build_user_flow_diagram(data)
        path = os.path.join(output_dir, "user_flow.png")
        if render_via_kroki(diagram_text, diagram_type, path):
            generated.append(path)
            print(f"  ✓ User flow diagram: {path}")

    return generated


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate diagram PNGs via Kroki API")
    parser.add_argument("--data", help="Path to JSON data file")
    parser.add_argument("--output", default="/tmp/diagrams", help="Output directory")
    parser.add_argument("--type", choices=["prd", "erd", "milestone", "all"], default="all")
    parser.add_argument("--demo", action="store_true", help="Generate demo diagrams")
    parser.add_argument("--input", help="Direct diagram text file")
    parser.add_argument("--diagram-type", default="mermaid",
                        choices=["mermaid", "plantuml", "dbml", "graphviz", "c4plantuml"],
                        help="Diagram language (used with --input)")
    args = parser.parse_args()

    if args.demo:
        print("Generating demo diagrams...")
        demo_data = {"doc_type": "all"}
        generated = generate_diagrams_from_data(demo_data, args.output)
        print(f"\nGenerated {len(generated)} demo diagram(s) in {args.output}")

    elif args.input:
        with open(args.input, 'r') as f:
            diagram_text = f.read()
        filename = Path(args.input).stem + ".png"
        output_path = os.path.join(args.output, filename)
        success = render_via_kroki(diagram_text, args.diagram_type, output_path)
        print(f"{'✓' if success else '✗'} {output_path}")

    elif args.data:
        with open(args.data, 'r') as f:
            data = json.load(f)
        data["doc_type"] = args.type
        generated = generate_diagrams_from_data(data, args.output)
        print(f"\nGenerated {len(generated)} diagram(s):")
        for path in generated:
            print(f"  ✓ {path}")

    else:
        parser.print_help()
