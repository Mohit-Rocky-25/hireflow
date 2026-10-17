"""
sync_to_app.py
Synchronizes all 83 newly redesigned and validated brief designs into src/data/suite/project-briefs.json
so the React UI reflects the brand-new, un-invented, Band A briefs.
"""
import os
import json
import glob

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "out", "design"))
TARGET_JSON = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "data", "suite", "project-briefs.json"))

def sync():
    files = sorted(glob.glob(os.path.join(OUT_DIR, "*.json")))
    print(f"Reading {len(files)} design files from {OUT_DIR}...")
    
    briefs = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fp:
            d = json.load(fp)
            
        b_id = d.get("id")
        title = d.get("title")
        domain = d.get("domain")
        diff = d.get("difficulty", "INTERMEDIATE").lower()
        ms = d.get("milestones", [])
        est_hours = sum(m.get("hours", 0) for m in ms)
        skills = d.get("skills", [])
        
        # Use cases
        ucs = d.get("use_cases", [])
        if isinstance(ucs, list):
            uc_text = " | ".join([f"{u.get('title')}: {u.get('first_sentence')} {u.get('second_sentence')}" if isinstance(u, dict) else str(u) for u in ucs])
        else:
            uc_text = str(ucs)
            
        hard_parts = d.get("hard_parts", [])
        prob_solves = " ".join(hard_parts) if isinstance(hard_parts, list) else str(hard_parts)
        
        signals = d.get("screener_signals", [])
        rec_signal = " ".join(signals) if isinstance(signals, list) else str(signals)
        
        arch = d.get("architecture", {})
        arch_text = arch.get("data_flow", "") if isinstance(arch, dict) else str(arch)
        
        targets = d.get("targets", [])
        if isinstance(targets, list):
            scale_text = " | ".join([f"{t.get('metric')}: {t.get('target')}" if isinstance(t, dict) else str(t) for t in targets])
        else:
            scale_text = str(targets)
            
        stack = d.get("stack", [])
        tech_stack = [s.get("tool") for s in stack if isinstance(s, dict) and s.get("tool")]
        
        rubric = d.get("rubric", [])
        rubric_list = []
        for idx, r in enumerate(rubric, 1):
            if isinstance(r, dict):
                rubric_list.append(f"{idx}. {r.get('action')}: {r.get('expected_result')} [{r.get('pass_criterion')}]")
            else:
                rubric_list.append(str(r))
                
        bullet = d.get("bullet", {}).get("template", "")
        
        brief_item = {
            "id": b_id,
            "title": title,
            "domain": domain,
            "estimatedHours": est_hours,
            "difficulty": diff,
            "coveredSkills": skills,
            "problemStatement": d.get("problem", ""),
            "useCases": uc_text,
            "problemItSolves": prob_solves,
            "recruiterSignal": rec_signal,
            "architecture": arch_text,
            "scaleTargets": scale_text,
            "techStack": tech_stack,
            "verificationRubric": rubric_list,
            "portfolioBulletFormula": bullet
        }
        briefs.append(brief_item)
        
    print(f"Writing {len(briefs)} redesigned briefs to {TARGET_JSON}...")
    with open(TARGET_JSON, "w", encoding="utf-8") as fp:
        json.dump(briefs, fp, indent=2, ensure_ascii=False)
        
    print("Sync complete successfully!")

if __name__ == "__main__":
    sync()
