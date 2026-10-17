#!/usr/bin/env python3
"""
render.py - Turns a validated design JSON into the final plain-text brief
in the exact layout specified in Part 6.
"""

import sys
import json
import os

SEPARATOR_EQUAL = "=" * 70
SEPARATOR_DASH = "-" * 70

def format_stack(stack_items):
    formatted = []
    for s in stack_items:
        tool = s.get("tool", "")
        role = s.get("role", "")
        req = s.get("requires")
        parts = [role] if role else []
        if req:
            parts.append(f"Requires: {req}")
        if parts:
            formatted.append(f"{tool} ({'; '.join(parts)})")
        else:
            formatted.append(tool)
    return ", ".join(formatted)

def render_brief(data):
    lines = []
    
    # Header
    title = data.get("title", "")
    lines.append(f"PROJECT BRIEF — {title}")
    lines.append(SEPARATOR_EQUAL)
    lines.append("")
    
    domain = data.get("domain", "")
    difficulty = data.get("difficulty", "")
    milestones = data.get("milestones", [])
    est_time = sum(m.get("hours", 0) for m in milestones)
    ext_hours = data.get("extended_path", {}).get("hours", 0)
    
    time_str = f"{est_time} hours (core path, estimate)"
    if ext_hours and ext_hours > 0:
        time_str += f". Extended path: +{ext_hours} hours"
        
    stack_str = format_stack(data.get("stack", []))
    
    lines.append(f"Domain    : {domain}")
    lines.append(f"Difficulty: {difficulty}")
    lines.append(f"Est. Time : {time_str}")
    lines.append(f"Tech Stack: {stack_str}")
    lines.append("")
    
    # 1. PROBLEM STATEMENT
    lines.append("PROBLEM STATEMENT")
    lines.append(SEPARATOR_DASH)
    lines.append(data.get("problem", "").strip())
    lines.append("")
    
    # 2. USE CASES IN THE REAL WORLD
    lines.append("USE CASES IN THE REAL WORLD")
    lines.append(SEPARATOR_DASH)
    use_cases = data.get("use_cases", [])
    if isinstance(use_cases, list):
        for uc in use_cases:
            lines.append(f"- {uc}")
    else:
        lines.append(str(use_cases).strip())
    lines.append("")
    
    # 3. WHY THIS IS HARD
    lines.append("WHY THIS IS HARD")
    lines.append(SEPARATOR_DASH)
    hard_parts = data.get("hard_parts", [])
    for hp in hard_parts:
        lines.append(f"- {hp}")
    lines.append("")
    
    # 4. RECRUITER SHORTLIST SIGNAL
    lines.append("RECRUITER SHORTLIST SIGNAL")
    lines.append(SEPARATOR_DASH)
    signals = data.get("screener_signals", [])
    for sig in signals:
        lines.append(f"- {sig}")
    job_fams = data.get("job_families", [])
    if job_fams:
        lines.append(f"Relevant Job Families: {', '.join(job_fams)}")
    lines.append("")
    
    # 5. ARCHITECTURE & DATA FLOW
    lines.append("ARCHITECTURE & DATA FLOW")
    lines.append(SEPARATOR_DASH)
    arch = data.get("architecture", {})
    components = arch.get("components", [])
    lines.append("Components:")
    for comp in components:
        c_name = comp.get("name", "")
        c_tools = ", ".join(comp.get("tools_used", []))
        c_purpose = comp.get("purpose", "")
        lines.append(f"- {c_name} (Tools: {c_tools}): {c_purpose}")
    lines.append("")
    lines.append("Data Flow:")
    lines.append(arch.get("data_flow", "").strip())
    lines.append("")
    lines.append("Enforcement Mechanism:")
    lines.append(arch.get("enforcement_mechanism", "").strip())
    lines.append("")
    
    # 6. SCALE & PERFORMANCE TARGETS
    lines.append("SCALE & PERFORMANCE TARGETS")
    lines.append(SEPARATOR_DASH)
    targets = data.get("targets", [])
    lines.append("Metric | Method | Input/Dataset | Reference Environment | Minimum Pass | Target | Report Format")
    for t in targets:
        m = t.get("metric", "")
        method = t.get("method", "")
        inp = t.get("input", "")
        env = t.get("environment", "")
        mp = t.get("minimum_pass", "")
        tgt = t.get("target", "")
        rpt = t.get("report", "")
        lines.append(f"{m} | {method} | {inp} | {env} | {mp} | {tgt} | {rpt}")
    lines.append("")
    
    # 7. SKILLS COVERED
    lines.append("SKILLS COVERED")
    lines.append(SEPARATOR_DASH)
    skills = data.get("skills", [])
    lines.append(", ".join(skills))
    lines.append("")
    
    # 8. TARGET APPLICATION / STARTER INPUT
    lines.append("TARGET APPLICATION / STARTER INPUT")
    lines.append(SEPARATOR_DASH)
    si = data.get("starter_input", {})
    lines.append(f"- Specification: {si.get('spec', '')}")
    lines.append(f"- Dataset / Traffic Size: {si.get('size', '')}")
    lines.append(f"- Seeded Edge Cases: {si.get('seeded_cases', '')}")
    lines.append(f"- Label / Verification Source: {si.get('label_source', '')}")
    lines.append(f"- Personal Data Policy: {si.get('personal_data_policy', '')}")
    lines.append("")
    
    # 9. MILESTONES
    lines.append("MILESTONES")
    lines.append(SEPARATOR_DASH)
    for idx, ms in enumerate(milestones, start=1):
        m_name = ms.get("name", "")
        m_hours = ms.get("hours", 0)
        m_done = ms.get("done_criterion", "")
        lines.append(f"M{idx}: {m_name} ({m_hours}h) — Done when: {m_done}")
    lines.append(f"Total: {est_time} hours (estimate)")
    lines.append("")
    
    # 10. PREREQUISITES, ENVIRONMENT AND ACCOUNTS
    lines.append("PREREQUISITES, ENVIRONMENT AND ACCOUNTS")
    lines.append(SEPARATOR_DASH)
    prereqs = data.get("prerequisites", [])
    lines.append(f"Prerequisites: {', '.join(prereqs)}")
    lines.append("")
    env = data.get("environment", {})
    lines.append("Environment & Hardware:")
    lines.append(f"- OS: {env.get('os', '')}")
    lines.append(f"- Memory: {env.get('ram', '')}")
    lines.append(f"- Compute / GPU: {env.get('gpu', '')}")
    lines.append(f"- Estimated Cost: {env.get('cost', '')}")
    lines.append(f"- Accounts & Quotas: {env.get('accounts_keys_quotas', '')}")
    lines.append(f"- Reference Environment: {env.get('reference_environment', '')}")
    lines.append(f"- Fallback Path: {env.get('fallback_path', '')}")
    lines.append("")
    risk = data.get("riskiest_component", {})
    lines.append("Riskiest Component & Fallback:")
    lines.append(f"- Riskiest Component: {risk.get('name', '')}")
    lines.append(f"- Simpler Fallback: {risk.get('fallback', '')}")
    lines.append("")
    
    # 11. DELIVERABLES
    lines.append("DELIVERABLES")
    lines.append(SEPARATOR_DASH)
    deliverables = data.get("deliverables", [])
    for d in deliverables:
        lines.append(f"- {d}")
    lines.append("")
    
    # 12. OUT OF SCOPE AND EXTENDED PATH
    lines.append("OUT OF SCOPE AND EXTENDED PATH")
    lines.append(SEPARATOR_DASH)
    lines.append("Out of Scope:")
    for oos in data.get("out_of_scope", []):
        lines.append(f"- {oos}")
    lines.append("")
    ext_path = data.get("extended_path", {})
    ext_items = ext_path.get("items", [])
    if ext_items:
        lines.append(f"Extended Path (+{ext_path.get('hours', 0)} hours):")
        for item in ext_items:
            lines.append(f"- {item}")
    else:
        lines.append("Extended Path: None (self-contained core scope)")
    lines.append("")
    
    # 13. SAFETY AND ETHICS NOTE (only if present)
    safety_note = data.get("safety_note")
    if safety_note:
        lines.append("SAFETY AND ETHICS NOTE")
        lines.append(SEPARATOR_DASH)
        lines.append(str(safety_note).strip())
        lines.append("")
        
    # 14. LEARNING RESOURCES
    lines.append("LEARNING RESOURCES")
    lines.append(SEPARATOR_DASH)
    for res in data.get("resources", []):
        lines.append(f"- {res}")
    lines.append("")
    
    # 15. SCREENER VERIFICATION RUBRIC
    lines.append("SCREENER VERIFICATION RUBRIC")
    lines.append(SEPARATOR_DASH)
    rubric = data.get("rubric", [])
    for idx, r in enumerate(rubric, start=1):
        kind_tag = f" [{r.get('kind', 'normal')}]" if r.get('kind') == 'anti_fake' else ""
        lines.append(f"{idx}. Check{kind_tag}")
        lines.append(f"   Input: {r.get('input', '')}")
        lines.append(f"   Action: {r.get('action', '')}")
        lines.append(f"   Result: {r.get('expected_result', '')}")
        lines.append(f"   Evidence: {r.get('evidence_location', '')}")
        lines.append(f"   Pass: {r.get('pass_criterion', '')}")
    lines.append("")
    
    # 16. RESUME BULLET FORMULA
    lines.append("RESUME BULLET FORMULA")
    lines.append(SEPARATOR_DASH)
    bullet = data.get("bullet", {})
    lines.append(f'"{bullet.get("template", "")}"')
    lines.append("")
    lines.append(f'Do not claim: {bullet.get("do_not_claim", "")}')
    lines.append("")
    
    # Footer
    lines.append(SEPARATOR_EQUAL)
    lines.append("Generated by HireFlow — hireflow.io")
    lines.append("")
    
    return "\n".join(lines)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: render.py <design.json> [output.txt]")
        sys.exit(1)
        
    json_path = sys.argv[1]
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    rendered_text = render_brief(data)
    
    if len(sys.argv) >= 3:
        out_path = sys.argv[2]
        os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(rendered_text)
        print(f"Rendered brief written to: {out_path}")
    else:
        print(rendered_text)
