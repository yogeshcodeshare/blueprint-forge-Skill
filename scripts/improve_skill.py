#!/usr/bin/env python3
"""
improve_skill.py — Karpathy Auto-Research Self-Improvement Loop

Implements the two-layer improvement strategy:
  Layer 1: Skill activation (handled by Anthropic skill-creator plugin — unchanged)
  Layer 2: Output quality (this script — binary assertion eval loop)

Loop logic:
  1. Load eval assertions from eval/eval_{skill}.json
  2. For each test prompt, simulate skill output (or use cached runs)
  3. Evaluate each binary assertion (true/false)
  4. Calculate pass_rate = passing / total
  5. If pass_rate == 1.0 → done
  6. Identify worst-failing assertion → propose ONE targeted change to SKILL.md
  7. Apply change → re-run evals
  8. If improved → keep, continue
  9. If same/worse → revert, try different assertion
  10. Log every iteration to eval/improve_log.json

Usage:
  python3 scripts/improve_skill.py --skill prd --dry-run        # Show what would change, don't apply
  python3 scripts/improve_skill.py --skill erd                  # Run full loop for ERD skill
  python3 scripts/improve_skill.py --skill milestone --max 10   # Max 10 iterations
  python3 scripts/improve_skill.py --skill prd --eval-only      # Just run evals, no changes
  python3 scripts/improve_skill.py --report                     # Show improvement report from log

Requirements:
  pip install anthropic --break-system-packages  (for Claude API calls)
  ANTHROPIC_API_KEY must be set in environment

Note: This script uses Claude API to evaluate assertions and propose improvements.
Without an API key it runs in mock mode (50% random pass rate for demonstration).
"""

import argparse
import copy
import json
import os
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path

# ─── CONSTANTS ─────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
PRD_SKILL_DIR = SCRIPT_DIR.parent
SKILL_FILES = {
    "prd": PRD_SKILL_DIR / "PRD_Skill.md",
    "erd": PRD_SKILL_DIR / "ERD_Skill.md",
    "milestone": PRD_SKILL_DIR / "Milestone_Skill.md",
}
EVAL_FILES = {
    "prd": PRD_SKILL_DIR / "eval" / "eval_prd.json",
    "erd": PRD_SKILL_DIR / "eval" / "eval_erd.json",
    "milestone": PRD_SKILL_DIR / "eval" / "eval_milestone.json",
}
LOG_FILE = PRD_SKILL_DIR / "eval" / "improve_log.json"

MAX_ITERATIONS = 20
API_MODEL = "claude-opus-4-6"  # Use most capable model for meta-reasoning


# ─── LOGGING ───────────────────────────────────────────────────────────────

def log(msg, level="INFO"):
    ts = datetime.now().strftime("%H:%M:%S")
    symbols = {"INFO": "  ", "OK": "✓ ", "FAIL": "✗ ", "WARN": "⚠ ", "ITER": "→ "}
    print(f"[{ts}] {symbols.get(level, '  ')}{msg}")


def load_log():
    if LOG_FILE.exists():
        with open(LOG_FILE) as f:
            return json.load(f)
    return {"iterations": [], "summary": {}}


def save_log(data):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ─── EVAL LOADING ──────────────────────────────────────────────────────────

def load_eval(skill):
    path = EVAL_FILES.get(skill)
    if not path or not path.exists():
        log(f"Eval file not found: {path}", "FAIL")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def load_skill(skill):
    path = SKILL_FILES.get(skill)
    if not path or not path.exists():
        log(f"Skill file not found: {path}", "FAIL")
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def save_skill(skill, content):
    path = SKILL_FILES.get(skill)
    path.write_text(content, encoding="utf-8")


# ─── CLAUDE API ────────────────────────────────────────────────────────────

def get_claude_client():
    try:
        import anthropic
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            log("ANTHROPIC_API_KEY not set — running in MOCK MODE (random assertions)", "WARN")
            return None
        return anthropic.Anthropic(api_key=api_key)
    except ImportError:
        log("anthropic package not installed. Run: pip install anthropic --break-system-packages", "WARN")
        log("Running in MOCK MODE (random assertions for demo)", "WARN")
        return None


def simulate_skill_output(client, skill_content, prompt):
    """
    Use Claude to simulate what the skill would produce for a given prompt.
    Returns a text summary of the document that would be generated.
    """
    if client is None:
        # Mock mode: return a generic placeholder
        return f"[MOCK OUTPUT for: {prompt[:80]}...]\n\nDocument structure: Introduction, Core Sections, Conclusion.\nContains: metrics, user stories, technical details."

    system_prompt = f"""You are acting as a document generation skill. Given the skill instructions below, generate a BRIEF OUTLINE (not full document) of what you would create for the user prompt. Output just the section headings and 1-2 bullet points per section. This is for quality evaluation purposes.

SKILL INSTRUCTIONS:
{skill_content[:8000]}

Be concise — output just an outline with section names and brief content notes."""

    try:
        msg = client.messages.create(
            model=API_MODEL,
            max_tokens=2000,
            messages=[
                {"role": "user", "content": f"User request: {prompt}\n\nGenerate document outline:"}
            ],
            system=system_prompt
        )
        return msg.content[0].text
    except Exception as e:
        log(f"API call failed: {e}", "WARN")
        return f"[API ERROR] {str(e)}"


def evaluate_assertion(client, assertion_text, document_output):
    """
    Evaluate whether a binary assertion is TRUE or FALSE given the document output.
    Returns (bool, confidence, reasoning)
    """
    if client is None:
        # Mock mode: 60% pass rate to simulate room for improvement
        result = random.random() > 0.4
        return result, 0.7, "MOCK: random evaluation (no API key)"

    prompt = f"""Evaluate whether the following assertion is TRUE or FALSE about this document outline.

ASSERTION: {assertion_text}

DOCUMENT OUTLINE:
{document_output}

Respond with EXACTLY this format (no other text):
RESULT: TRUE
CONFIDENCE: 0.95
REASONING: The document contains... [1 sentence]

or

RESULT: FALSE
CONFIDENCE: 0.9
REASONING: The document does not... [1 sentence]"""

    try:
        msg = client.messages.create(
            model=API_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()

        result_match = re.search(r"RESULT:\s*(TRUE|FALSE)", text, re.IGNORECASE)
        conf_match = re.search(r"CONFIDENCE:\s*([0-9.]+)", text)
        reason_match = re.search(r"REASONING:\s*(.+)", text)

        result = result_match.group(1).upper() == "TRUE" if result_match else False
        confidence = float(conf_match.group(1)) if conf_match else 0.5
        reasoning = reason_match.group(1) if reason_match else text[:100]

        return result, confidence, reasoning
    except Exception as e:
        log(f"Assertion eval failed: {e}", "WARN")
        return False, 0.0, f"Error: {str(e)}"


def propose_skill_improvement(client, skill_content, failing_assertions, skill_name):
    """
    Given failing assertions, propose ONE targeted change to the skill file.
    Returns (description, old_text, new_text) or None if no change needed.
    """
    if client is None:
        # Mock mode: return a placeholder change
        return (
            "MOCK: Add reminder about acceptance criteria format",
            "# Step 2: Plan Document Structure",
            "# Step 2: Plan Document Structure\n\n> IMPORTANT: All acceptance criteria must use Given/When/Then format."
        )

    failing_text = "\n".join([f"- {a}" for a in failing_assertions[:5]])

    prompt = f"""You are improving a Claude skill file to make it produce better document output.

The skill currently FAILS these binary assertions (what the output should contain but doesn't):
{failing_text}

SKILL FILE (excerpt, {skill_name}):
{skill_content[:12000]}

Propose ONE specific, minimal change to the skill file that would fix the most important failing assertion.
The change must be:
1. Specific to one section of the skill file
2. Small enough to test quickly (add/modify 2-5 sentences max)
3. Not break existing passing behavior

Respond with EXACTLY this format:
DESCRIPTION: What this change does (1 sentence)
OLD_TEXT: <exact text to find in the skill file — must be verbatim from the file>
NEW_TEXT: <replacement text>
TARGET_ASSERTION: <which failing assertion this targets>"""

    try:
        msg = client.messages.create(
            model=API_MODEL,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()

        desc_match = re.search(r"DESCRIPTION:\s*(.+?)(?=OLD_TEXT:|$)", text, re.DOTALL)
        old_match = re.search(r"OLD_TEXT:\s*(.+?)(?=NEW_TEXT:|$)", text, re.DOTALL)
        new_match = re.search(r"NEW_TEXT:\s*(.+?)(?=TARGET_ASSERTION:|$)", text, re.DOTALL)

        if not all([desc_match, old_match, new_match]):
            log("Could not parse improvement proposal from API response", "WARN")
            return None

        desc = desc_match.group(1).strip()
        old = old_match.group(1).strip()
        new = new_match.group(1).strip()

        return (desc, old, new)
    except Exception as e:
        log(f"Improvement proposal failed: {e}", "WARN")
        return None


# ─── EVAL RUN ──────────────────────────────────────────────────────────────

def run_eval(client, skill_content, eval_data, verbose=False):
    """
    Run all eval tests and return results.
    Returns: { pass_count, total, pass_rate, failures: [{test, assertion, reasoning}] }
    """
    tests = eval_data.get("tests", [])
    total = 0
    passed = 0
    failures = []

    for test in tests:
        prompt = test.get("prompt", "")
        assertions = test.get("assertions", [])

        log(f"Testing: {prompt[:70]}...", "ITER")

        # Simulate skill output for this prompt
        doc_output = simulate_skill_output(client, skill_content, prompt)

        for assertion in assertions:
            assertion_text = assertion.get("text", "")
            total += 1

            result, confidence, reasoning = evaluate_assertion(client, assertion_text, doc_output)

            if result:
                passed += 1
                if verbose:
                    log(f"  PASS [{confidence:.0%}]: {assertion_text[:60]}", "OK")
            else:
                failures.append({
                    "test": prompt[:80],
                    "assertion": assertion_text,
                    "confidence": confidence,
                    "reasoning": reasoning
                })
                if verbose:
                    log(f"  FAIL [{confidence:.0%}]: {assertion_text[:60]}", "FAIL")
                    log(f"    Reason: {reasoning[:100]}", "INFO")

    pass_rate = passed / total if total > 0 else 0.0
    return {
        "pass_count": passed,
        "total": total,
        "pass_rate": pass_rate,
        "failures": failures
    }


# ─── MAIN LOOP ─────────────────────────────────────────────────────────────

def run_improvement_loop(skill, max_iterations, dry_run, eval_only):
    log(f"=== Karpathy Improvement Loop: {skill.upper()} skill ===")
    log(f"Mode: {'dry-run' if dry_run else 'eval-only' if eval_only else 'full auto-improve'}")

    client = get_claude_client()
    eval_data = load_eval(skill)
    skill_content = load_skill(skill)
    improvement_log = load_log()

    test_count = len(eval_data.get("tests", []))
    assertion_count = sum(len(t.get("assertions", [])) for t in eval_data.get("tests", []))
    log(f"Loaded: {test_count} tests, {assertion_count} assertions from eval_{skill}.json")

    # Run initial eval
    log("Running initial evaluation...")
    result = run_eval(client, skill_content, eval_data, verbose=True)
    log(f"Initial pass rate: {result['pass_rate']:.1%} ({result['pass_count']}/{result['total']})")

    if eval_only:
        log("Eval-only mode — no changes made.")
        return

    if result["pass_rate"] >= 1.0:
        log("All assertions passing! Nothing to improve.", "OK")
        return

    iteration_data = {
        "skill": skill,
        "started_at": datetime.now().isoformat(),
        "initial_pass_rate": result["pass_rate"],
        "iterations": []
    }

    best_pass_rate = result["pass_rate"]
    best_skill_content = skill_content

    for i in range(max_iterations):
        log(f"\n--- Iteration {i + 1}/{max_iterations} (current: {result['pass_rate']:.1%}) ---")

        failures = result["failures"]
        if not failures:
            log("All assertions now passing!", "OK")
            break

        # Get unique failing assertions (most common failures first)
        failing_assertions = [f["assertion"] for f in failures]
        top_failures = list(dict.fromkeys(failing_assertions))  # deduplicate preserving order

        log(f"Top failing assertion: {top_failures[0][:80]}")

        # Propose improvement
        log("Asking Claude to propose improvement...")
        proposal = propose_skill_improvement(client, skill_content, top_failures, skill)

        if not proposal:
            log("No improvement proposed — trying next assertion", "WARN")
            continue

        desc, old_text, new_text = proposal
        log(f"Proposed: {desc}")

        if dry_run:
            log(f"DRY RUN — would replace:\n  OLD: {old_text[:80]}...\n  NEW: {new_text[:80]}...", "INFO")
            break

        # Check if old_text is actually in the skill file
        if old_text not in skill_content:
            log(f"Cannot apply: old_text not found in skill file ('{old_text[:50]}...')", "WARN")
            iteration_data["iterations"].append({
                "iteration": i + 1,
                "proposal": desc,
                "applied": False,
                "reason": "old_text not found in skill file"
            })
            continue

        # Apply change
        new_skill_content = skill_content.replace(old_text, new_text, 1)
        log("Applying change...")

        # Re-evaluate with new content
        new_result = run_eval(client, new_skill_content, eval_data, verbose=False)
        log(f"New pass rate: {new_result['pass_rate']:.1%} (was {result['pass_rate']:.1%})")

        iter_record = {
            "iteration": i + 1,
            "description": desc,
            "pass_rate_before": result["pass_rate"],
            "pass_rate_after": new_result["pass_rate"],
            "applied": False,
            "timestamp": datetime.now().isoformat()
        }

        if new_result["pass_rate"] > result["pass_rate"]:
            log(f"Improvement! +{(new_result['pass_rate'] - result['pass_rate']):.1%}", "OK")
            skill_content = new_skill_content
            save_skill(skill, skill_content)
            result = new_result
            iter_record["applied"] = True

            if new_result["pass_rate"] > best_pass_rate:
                best_pass_rate = new_result["pass_rate"]
                best_skill_content = skill_content

            if new_result["pass_rate"] >= 1.0:
                log("All assertions now passing!", "OK")
                iteration_data["iterations"].append(iter_record)
                break
        else:
            log(f"No improvement — reverting (was {result['pass_rate']:.1%}, got {new_result['pass_rate']:.1%})", "WARN")
            iter_record["applied"] = False

        iteration_data["iterations"].append(iter_record)

        # Small delay to avoid rate limiting
        if client is not None:
            time.sleep(1)

    iteration_data["final_pass_rate"] = result["pass_rate"]
    iteration_data["improvement"] = result["pass_rate"] - iteration_data["initial_pass_rate"]
    iteration_data["ended_at"] = datetime.now().isoformat()

    # Save log
    improvement_log["iterations"].append(iteration_data)
    improvement_log["summary"][skill] = {
        "last_run": datetime.now().isoformat(),
        "pass_rate": result["pass_rate"],
        "total_assertions": result["total"]
    }
    save_log(improvement_log)

    log(f"\n=== Summary ===")
    log(f"Skill: {skill.upper()}")
    log(f"Initial pass rate: {iteration_data['initial_pass_rate']:.1%}")
    log(f"Final pass rate:   {result['pass_rate']:.1%}")
    log(f"Improvement:       +{iteration_data['improvement']:.1%}")
    log(f"Iterations run:    {len(iteration_data['iterations'])}")
    log(f"Log saved:         {LOG_FILE}")

    if result["failures"]:
        log("\nStill failing assertions:")
        for f in result["failures"][:5]:
            log(f"  - {f['assertion'][:80]}", "FAIL")


def show_report():
    """Display improvement report from log file."""
    if not LOG_FILE.exists():
        log("No improvement log found. Run improve_skill.py first.", "WARN")
        return

    data = load_log()
    summary = data.get("summary", {})
    iterations = data.get("iterations", [])

    print("\n=== Skill Improvement Report ===\n")

    if summary:
        print("Current Pass Rates:")
        for skill, s in summary.items():
            print(f"  {skill.upper():12s} {s['pass_rate']:.1%} ({s['total_assertions']} assertions) — last run: {s['last_run'][:10]}")

    print(f"\nTotal improvement runs: {len(iterations)}")
    for run in iterations[-5:]:  # Last 5 runs
        skill = run.get("skill", "?")
        initial = run.get("initial_pass_rate", 0)
        final = run.get("final_pass_rate", 0)
        improvement = final - initial
        iters = len(run.get("iterations", []))
        print(f"  [{run.get('started_at', '')[:10]}] {skill.upper():12s} {initial:.1%} → {final:.1%} (+{improvement:.1%}) in {iters} iterations")


# ─── CLI ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Karpathy Auto-Research Self-Improvement Loop for skill files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scripts/improve_skill.py --skill prd --dry-run        # Preview changes
  python3 scripts/improve_skill.py --skill erd                  # Run full loop
  python3 scripts/improve_skill.py --skill milestone --max 10   # Limit iterations
  python3 scripts/improve_skill.py --skill prd --eval-only      # Just check pass rate
  python3 scripts/improve_skill.py --report                     # Show history report

Environment:
  ANTHROPIC_API_KEY   Required for real evaluation (otherwise runs in mock mode)
        """
    )
    parser.add_argument("--skill", choices=["prd", "erd", "milestone"], help="Which skill to improve")
    parser.add_argument("--max", type=int, default=MAX_ITERATIONS, dest="max_iter", help=f"Max iterations (default: {MAX_ITERATIONS})")
    parser.add_argument("--dry-run", action="store_true", help="Show proposed changes without applying them")
    parser.add_argument("--eval-only", action="store_true", help="Run evaluations only, no changes")
    parser.add_argument("--report", action="store_true", help="Show improvement report from log file")
    args = parser.parse_args()

    if args.report:
        show_report()
        sys.exit(0)

    if not args.skill:
        parser.error("--skill is required (unless using --report)")

    run_improvement_loop(
        skill=args.skill,
        max_iterations=args.max_iter,
        dry_run=args.dry_run,
        eval_only=args.eval_only
    )
