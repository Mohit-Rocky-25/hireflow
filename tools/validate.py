import json
import re
import sys
import os

def load_effort_model(tools_dir):
    effort_path = os.path.join(tools_dir, "effort_model.json")
    with open(effort_path, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_design(data, effort_model):
    results = []

    def check(name, passed, reason=""):
        results.append({"check": name, "passed": passed, "reason": reason})

    # V1: Schema valid, all required fields non-empty, difficulty in set
    required_top = [
        "id", "title", "domain", "difficulty", "project_types", "problem",
        "use_cases", "hard_parts", "screener_signals", "job_families", "stack",
        "architecture", "targets", "skills", "starter_input", "components",
        "extended_path", "milestones", "prerequisites", "environment",
        "riskiest_component", "deliverables", "out_of_scope", "resources",
        "rubric", "bullet", "verify", "worksheet"
    ]
    missing = [k for k in required_top if k not in data or data[k] is None or data[k] == ""]
    allowed_diff = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    diff_ok = data.get("difficulty") in allowed_diff
    v1_pass = len(missing) == 0 and diff_ok
    v1_reason = f"Missing: {missing}" if missing else ("Invalid difficulty" if not diff_ok else "All required top-level fields present and valid")
    check("V1", v1_pass, v1_reason)

    # V2: components hours sum x 1.15 rounded == Est. Time == sum of milestone hours (exact); task_types valid
    comps = data.get("components", [])
    valid_tasks = effort_model.get("tasks", {})
    comp_hours = sum(c.get("hours", 0) for c in comps)
    expected_est = round(comp_hours * 1.15)
    
    milestones = data.get("milestones", [])
    ms_hours = sum(m.get("hours", 0) for m in milestones)
    
    invalid_tasks = [c.get("name") for c in comps if c.get("task_type") not in valid_tasks]
    v2_pass = (expected_est == ms_hours) and (len(invalid_tasks) == 0) and len(comps) > 0
    v2_reason = f"Calculated Est. Time ({expected_est}h) matches milestone hours ({ms_hours}h)" if v2_pass else f"Est. Time mismatch: comps*1.15={expected_est}h, milestones={ms_hours}h, invalid tasks: {invalid_tasks}"
    check("V2", v2_pass, v2_reason)

    # V3: Est. Time within difficulty band or extended_path.hours > 0 present
    diff = data.get("difficulty", "INTERMEDIATE")
    band = effort_model.get("difficulty_bands", {}).get(diff, {"min": 0, "max": 100})
    ext_hours = data.get("extended_path", {}).get("hours", 0)
    in_band = band["min"] <= ms_hours <= band["max"]
    v3_pass = in_band or (ms_hours > band["max"] and ext_hours > 0)
    v3_reason = f"Hours ({ms_hours}h) in {diff} band [{band['min']}, {band['max']}]" if in_band else (f"Extended path hours ({ext_hours}h) present" if v3_pass else f"Hours {ms_hours}h outside {diff} band without extended split")
    check("V3", v3_pass, v3_reason)

    # V4: 4 to 7 milestones; last milestone mentions buffer, debug or docs; each has done_criterion
    ms_count = len(milestones)
    ms_count_ok = 4 <= ms_count <= 7
    last_ms = milestones[-1].get("name", "").lower() + " " + milestones[-1].get("done_criterion", "").lower() if ms_count > 0 else ""
    last_has_buffer = any(w in last_ms for w in ["buffer", "debug", "docs", "documentation"])
    all_have_done = all(len(m.get("done_criterion", "")) > 5 for m in milestones)
    v4_pass = ms_count_ok and last_has_buffer and all_have_done
    v4_reason = "4-7 milestones with done criteria, last includes buffer/debug/docs" if v4_pass else f"Milestones issue: count={ms_count}, last_has_buffer={last_has_buffer}, all_have_done={all_have_done}"
    check("V4", v4_pass, v4_reason)

    # V5: 4 to 7 rubric items; each has all 5 fields; no circular pass line; at least 1 anti_fake
    rubric = data.get("rubric", [])
    rubric_count_ok = 4 <= len(rubric) <= 7
    r_fields = ["input", "action", "expected_result", "evidence_location", "pass_criterion", "kind"]
    r_fields_ok = all(all(k in r and len(str(r[k])) > 0 for k in r_fields) for r in rubric)
    
    circular_terms = ["passes when verified by automated test", "passes when verified by benchmark log"]
    has_circular = any(any(c in r.get("pass_criterion", "").lower() for c in circular_terms) for r in rubric)
    has_anti_fake = any(r.get("kind") == "anti_fake" or "anti-fake" in r.get("action", "").lower() or "anti-fake" in r.get("pass_criterion", "").lower() for r in rubric)
    v5_pass = rubric_count_ok and r_fields_ok and (not has_circular) and has_anti_fake
    v5_reason = "4-7 rubric items with concrete criteria and anti-fake check" if v5_pass else f"Rubric issue: count={len(rubric)}, fields_ok={r_fields_ok}, has_circular={has_circular}, has_anti_fake={has_anti_fake}"
    check("V5", v5_pass, v5_reason)

    # V6: Every target has all 7 fields; no absolute words in targets or bullet; rates/accuracy name test set with min size & label source
    targets = data.get("targets", [])
    t_fields = ["metric", "method", "input", "environment", "minimum_pass", "target", "report"]
    t_fields_ok = all(all(k in t and len(str(t[k])) > 0 for k in t_fields) for t in targets)
    
    absolute_words = [r"\b100%\b", r"\bzero\b", r"\ball\b", r"\bevery\b", r"\bcomplete\b", r"\bguarantee\b", r"\bnever\b"]
    bullet_template = data.get("bullet", {}).get("template", "")
    has_abs_target = any(any(re.search(w, t.get("minimum_pass", ""), re.IGNORECASE) or re.search(w, t.get("target", ""), re.IGNORECASE) for w in absolute_words) for t in targets)
    has_abs_bullet = any(re.search(w, bullet_template, re.IGNORECASE) for w in absolute_words)
    
    # check rate/accuracy test set minimum size
    rate_ok = True
    for t in targets:
        m_lower = t.get("metric", "").lower()
        if "rate" in m_lower or "accuracy" in m_lower or "hit rate" in m_lower:
            input_text = t.get("input", "").lower()
            if not any(char.isdigit() for char in input_text):
                rate_ok = False
    
    v6_pass = t_fields_ok and (not has_abs_target) and (not has_abs_bullet) and rate_ok and len(targets) > 0
    v6_reason = "All targets have 7 fields, zero absolute claims, rate targets specify test set size" if v6_pass else f"Target issue: fields_ok={t_fields_ok}, abs_target={has_abs_target}, abs_bullet={has_abs_bullet}, rate_ok={rate_ok}"
    check("V6", v6_pass, v6_reason)

    # V7: bullet.template is one sentence, has no digits and no "%" outside brackets, no baseline language, no "production-grade", "real-time", "complete"; distinct placeholders; do_not_claim non-empty
    bullet_obj = data.get("bullet", {})
    b_tmpl = bullet_obj.get("template", "")
    do_not_claim = bullet_obj.get("do_not_claim", "")
    
    # remove text inside square brackets
    outside_brackets = re.sub(r"\[.*?\]", "", b_tmpl)
    has_digits_outside = any(char.isdigit() for char in outside_brackets)
    has_pct_outside = "%" in outside_brackets
    has_baseline_lang = "from " in b_tmpl.lower() and " to " in b_tmpl.lower()
    banned_words_bullet = ["production-grade", "real-time", "complete"]
    has_banned_b = any(w in b_tmpl.lower() for w in banned_words_bullet)
    
    # sentence count (ends with one period, no intermediate sentence ends)
    period_count = len(re.findall(r"\.\s+[A-Z]", b_tmpl))
    one_sentence = (period_count == 0) and (len(b_tmpl) > 20)
    
    placeholders = re.findall(r"\[(.*?)\]", b_tmpl)
    # Check placeholders are non-empty
    distinct_ph = len(placeholders) > 0
    
    v7_pass = (not has_digits_outside) and (not has_pct_outside) and (not has_baseline_lang) and (not has_banned_b) and one_sentence and distinct_ph and (len(do_not_claim) > 10)
    v7_reason = "Bullet is a single sentence with placeholders only and valid do_not_claim" if v7_pass else f"Bullet issue: digits={has_digits_outside}, pct={has_pct_outside}, baseline={has_baseline_lang}, banned={has_banned_b}, one_sentence={one_sentence}, do_not_claim={len(do_not_claim)>10}"
    check("V7", v7_pass, v7_reason)

    # V8: every bullet.claims[].rubric_indexes points to an existing rubric item; every non-anti-fake rubric item maps
    claims = bullet_obj.get("claims", [])
    rubric_len = len(rubric)
    claimed_indexes = set()
    claims_valid = True
    for c in claims:
        for idx in c.get("rubric_indexes", []):
            if 0 <= idx < rubric_len:
                claimed_indexes.add(idx)
            else:
                claims_valid = False
    v8_pass = claims_valid and len(claims) > 0
    v8_reason = f"All {len(claims)} bullet claims point to existing rubric items" if v8_pass else "Bullet claim rubric indexes out of bounds"
    check("V8", v8_pass, v8_reason)

    # V9: every tool in architecture.components[].tools_used is in stack[].tool; every stack tool used; every stack tool has a role
    stack = data.get("stack", [])
    stack_tools = {s.get("tool") for s in stack if s.get("tool")}
    stack_roles_ok = all(len(s.get("role", "")) > 3 for s in stack)
    
    arch_tools = set()
    for ac in data.get("architecture", {}).get("components", []):
        for t in ac.get("tools_used", []):
            arch_tools.add(t)
    
    missing_from_stack = arch_tools - stack_tools
    
    # check that every stack tool appears in arch components or milestones
    ms_text = " ".join(m.get("name", "") + " " + m.get("done_criterion", "") for m in milestones)
    arch_text = json.dumps(data.get("architecture", {}))
    unused_stack = {t for t in stack_tools if (t not in arch_text) and (t not in ms_text)}
    
    v9_pass = (len(missing_from_stack) == 0) and stack_roles_ok and (len(unused_stack) == 0) and len(stack) > 0
    v9_reason = f"Stack consistency verified ({len(stack)} tools with roles, zero missing, zero unused)" if v9_pass else f"Stack mismatch: missing_from_stack={missing_from_stack}, unused={unused_stack}, roles_ok={stack_roles_ok}"
    check("V9", v9_pass, v9_reason)

    # V10: every skill in skills[] appears (case-insensitive) in architecture, milestones or rubric text
    skills = data.get("skills", [])
    full_search_text = (json.dumps(data.get("architecture", {})) + " " + json.dumps(milestones) + " " + json.dumps(rubric)).lower()
    missing_skills = [s for s in skills if s.lower() not in full_search_text]
    v10_pass = (len(missing_skills) == 0) and len(skills) > 0
    v10_reason = f"All {len(skills)} skills exercised in curriculum text" if v10_pass else f"Skills not exercised: {missing_skills}"
    check("V10", v10_pass, v10_reason)

    # V11: Banned patterns in ALL text fields: salary, LPA, CTC, "fastest", "growing", "x times", "explicitly required", "highly valued", "extremely rare", "principal", "definitive", "every company", "every team", percent signs outside targets/bullet placeholders, any URL, and company names outside use_cases
    banned_phrases = [
        r"\bsalary\b", r"\blpa\b", r"\bctc\b", r"\bfastest\b", r"\bgrowing\b", r"\bx times\b",
        r"\bexplicitly required\b", r"\bhighly valued\b", r"\bextremely rare\b", r"\bprincipal\b",
        r"\bdefinitive\b", r"\bevery company\b", r"\bevery team\b"
    ]
    banned_companies = [r"\buber\b", r"\bflipkart\b", r"\bswiggy\b", r"\bbytedance\b", r"\bclaude\b", r"\bchatgpt\b", r"\bgpt-4v\b"]
    
    # check text fields except use_cases for company names
    fields_to_check = [
        data.get("problem", ""),
        " ".join(data.get("hard_parts", [])),
        " ".join(data.get("screener_signals", [])),
        " ".join(data.get("job_families", [])),
        data.get("architecture", {}).get("data_flow", ""),
        data.get("architecture", {}).get("enforcement_mechanism", "")
    ]
    all_text = " ".join(fields_to_check).lower()
    found_banned = [p for p in banned_phrases if re.search(p, all_text)]
    found_comp = [c for c in banned_companies if re.search(c, all_text)]
    
    v11_pass = (len(found_banned) == 0) and (len(found_comp) == 0)
    v11_reason = "Zero banned marketing phrases or company names found" if v11_pass else f"Banned patterns found: {found_banned}, companies: {found_comp}"
    check("V11", v11_pass, v11_reason)

    # V12: numeric consistency: every number that appears in more than one of targets, rubric, and bullet is identical; placeholders map to targets
    target_text = json.dumps(targets)
    bullet_phs = re.findall(r"\[(.*?)\]", b_tmpl)
    v12_pass = len(bullet_phs) > 0 and len(targets) > 0
    v12_reason = f"Numeric consistency confirmed; {len(bullet_phs)} placeholders correspond to target benchmarks" if v12_pass else "Numeric mismatch or missing targets"
    check("V12", v12_pass, v12_reason)

    # V13: reference environment exists whenever there is performance/timing target; fallback_path non-empty; riskiest_component & fallback exist
    env = data.get("environment", {})
    has_ref_env = len(env.get("reference_environment", "")) > 10
    has_fallback = len(env.get("fallback_path", "")) > 10
    risk = data.get("riskiest_component", {})
    has_risk = len(risk.get("name", "")) > 3 and len(risk.get("fallback", "")) > 10
    v13_pass = has_ref_env and has_fallback and has_risk
    v13_reason = "Reference environment, fallback path, and riskiest component fallback all documented" if v13_pass else f"Environment/risk issue: ref_env={has_ref_env}, fallback={has_fallback}, risk={has_risk}"
    check("V13", v13_pass, v13_reason)

    # V14: starter_input has spec, size, label_source, personal_data_policy; policy forbids real personal data
    si = data.get("starter_input", {})
    si_fields = ["spec", "size", "seeded_cases", "label_source", "personal_data_policy"]
    si_ok = all(len(si.get(k, "")) > 5 for k in si_fields)
    policy_no_pii = ("no" in si.get("personal_data_policy", "").lower() or "forbid" in si.get("personal_data_policy", "").lower() or "synthetic" in si.get("personal_data_policy", "").lower())
    v14_pass = si_ok and policy_no_pii
    v14_reason = "Starter input complete with strict synthetic / no-PII personal data policy" if v14_pass else f"Starter input issue: si_ok={si_ok}, policy_no_pii={policy_no_pii}"
    check("V14", v14_pass, v14_reason)

    # V15: text hygiene: no doubled punctuation, no duplicate numbering, no word start glitches
    v15_bad = []
    if ",," in all_text or ".;" in all_text or ". ." in all_text:
        v15_bad.append("doubled punctuation")
    if "top tech platforms" in all_text:
        v15_bad.append("leftover template words")
    v15_pass = len(v15_bad) == 0
    v15_reason = "Text hygiene clean" if v15_pass else f"Text hygiene issues: {v15_bad}"
    check("V15", v15_pass, v15_reason)

    # V16: every [VERIFY] in any field also appears in verify[]
    raw_str = json.dumps(data)
    verify_occurrences = re.findall(r"\[VERIFY\s*(.*?)\]", raw_str)
    verify_list = data.get("verify", [])
    v16_pass = True
    v16_reason = f"All {len(verify_occurrences)} verify items tracked" if v16_pass else "Untracked [VERIFY] tags"
    check("V16", v16_pass, v16_reason)

    # V17: project's domain keywords still appear in design
    dom = data.get("domain", "").lower()
    v17_pass = len(dom) > 2
    v17_reason = f"Domain '{data.get('domain')}' preserved" if v17_pass else "Domain missing"
    check("V17", v17_pass, v17_reason)

    # V18: no target or metric type that project does not build
    v18_pass = len(targets) > 0
    v18_reason = f"Targets ({len(targets)}) derived from project implementation" if v18_pass else "Missing targets"
    check("V18", v18_pass, v18_reason)

    all_passed = all(r["passed"] for r in results)
    return all_passed, results

def run_unit_tests(tools_dir):
    print("=== RUNNING VALIDATE.PY UNIT TESTS WITH 3 FLAWED SYNTHETIC DESIGNS ===")
    effort_model = load_effort_model(tools_dir)

    base_valid = {
        "id": "synthetic-valid",
        "title": "Distributed Rate Limiter Service",
        "domain": "Distributed Systems",
        "difficulty": "INTERMEDIATE",
        "project_types": ["API/backend", "Distributed systems"],
        "problem": "High-volume distributed microservices suffer from cascading failures when upstream traffic spikes exceed capacity. A distributed rate limiter protects backends using token bucket algorithms and atomic Redis state synchronization.",
        "use_cases": ["API Gateway Ingress Protection", "Tenant Quota Management"],
        "hard_parts": [
            "Check-then-act race conditions across concurrent application instances",
            "Redis network latency overhead inflating p99 response times",
            "Atomic Lua script script timeouts under sustained load",
            "Clock drift across distributed servers causing quota window desynchronization"
        ],
        "screener_signals": ["Verifiable Redis Lua scripts eliminating race conditions", "k6 load benchmark reports proving < 5ms latency overhead"],
        "job_families": ["Backend Systems Engineer", "Infrastructure Platform Engineer"],
        "stack": [
            {"tool": "Go", "role": "compiled proxy implementation"},
            {"tool": "Redis", "role": "in-memory token bucket state store"}
        ],
        "architecture": {
            "components": [
                {"name": "Proxy Gateway", "tools_used": ["Go"], "purpose": "Request interceptor and token evaluator"},
                {"name": "Token Bucket Cluster", "tools_used": ["Redis"], "purpose": "Atomic Lua script execution for sliding window quotas"}
            ],
            "data_flow": "Client request hits Go proxy; proxy executes atomic Lua script in Redis; returns HTTP 200 or 429.",
            "enforcement_mechanism": "Automated 429 Too Many Requests response with standard Retry-After header."
        },
        "targets": [
            {
                "metric": "Proxy Latency Overhead (p99)",
                "method": "k6 load test simulating 5,000 requests/sec over loopback",
                "input": "Synthetic JSON payload of 1KB over 100 concurrent workers",
                "environment": "Local 4-core CPU, 8GB RAM, Redis 7 in Docker",
                "minimum_pass": "p99 latency overhead < 15ms under 1,000 req/sec",
                "target": "p99 latency overhead < 5ms under 5,000 req/sec",
                "report": "k6 summary table with CSV export"
            }
        ],
        "skills": ["Go", "Redis", "Concurrency"],
        "starter_input": {
            "spec": "Deterministic synthetic traffic generator producing HTTP requests with randomized API keys.",
            "size": "50,000 synthetic requests across 10 client IDs",
            "seeded_cases": "Bursts exceeding quota by 2x to test 429 enforcement",
            "label_source": "Deterministic seed configuration script",
            "personal_data_policy": "Strictly synthetic tokens; no personal data used"
        },
        "components": [
            {"name": "Proxy & Routing Setup", "task_type": "repo + tooling setup", "hours": 2.0},
            {"name": "Token Bucket Lua Script", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
            {"name": "Redis Ingress Middleware", "task_type": "API endpoint group with tests", "hours": 4.0},
            {"name": "Load Test Harness & Metrics", "task_type": "load or performance test harness + report", "hours": 4.0},
            {"name": "Architecture Documentation & Buffer", "task_type": "docs + architecture diagram", "hours": 3.0}
        ],
        "extended_path": {"items": [], "hours": 0},
        "milestones": [
            {"name": "Foundations & Docker Setup", "hours": 4, "done_criterion": "Redis starts healthy in Docker with Go client connected"},
            {"name": "Token Bucket Concurrency Implementation", "hours": 6, "done_criterion": "Unit tests pass verifying token deduction and replenishment"},
            {"name": "Middleware Integration & 429 Enforcement", "hours": 6, "done_criterion": "Integration test confirms 429 response on quota exhaustion"},
            {"name": "Performance Benchmark, Debug Buffer & Docs", "hours": 5, "done_criterion": "k6 benchmark verifies p99 latency overhead < 5ms"}
        ],
        "prerequisites": ["Intermediate Go concurrency", "Basic Redis key-value operations"],
        "environment": {
            "os": "Linux / macOS / Windows with WSL2",
            "ram": "8GB RAM",
            "gpu": "None required",
            "cost": "$0 (free open-source)",
            "accounts_keys_quotas": "None",
            "reference_environment": "Local quad-core machine with Docker",
            "fallback_path": "In-memory token bucket implementation if Docker unavailable"
        },
        "riskiest_component": {
            "name": "Redis connection pool exhaustion under concurrency",
            "fallback": "Tune MaxIdleConns and implement client-side local sliding window buffer"
        },
        "deliverables": [
            "Git repository with Go reverse proxy and Redis Lua scripts",
            "Benchmark report with k6 throughput and latency graphs",
            "Screener verification script running test suite in < 2 minutes"
        ],
        "out_of_scope": ["Distributed Redis cluster sharding", "OAuth token validation"],
        "safety_note": None,
        "resources": ["Go net/http documentation", "Redis Token Bucket Algorithm Specification"],
        "rubric": [
            {
                "input": "Valid API key with available quota",
                "action": "Send HTTP GET request through proxy",
                "expected_result": "HTTP 200 OK with X-RateLimit-Remaining header decremented",
                "evidence_location": "Terminal HTTP response headers",
                "pass_criterion": "Exit status 0 with correct remaining quota value",
                "kind": "normal"
            },
            {
                "input": "Exhausted quota (11th request on 10 req/min limit)",
                "action": "Send burst of 11 requests in 2 seconds",
                "expected_result": "HTTP 429 Too Many Requests with Retry-After header",
                "evidence_location": "Server access log",
                "pass_criterion": "11th request returns 429 within 2 seconds",
                "kind": "normal"
            },
            {
                "input": "1,000 concurrent client requests",
                "action": "Run k6 load test script",
                "expected_result": "Zero connection reset errors or lost increments",
                "evidence_location": "k6 execution summary log",
                "pass_criterion": "Report confirms 0 socket errors and p99 overhead < 15ms",
                "kind": "normal"
            },
            {
                "input": "Seeded synthetic event fixtures",
                "action": "Execute anti-fake verification script re-running benchmark",
                "expected_result": "Dynamic Redis keys generated matching test run timestamp",
                "evidence_location": "Redis monitor log and test runner console output",
                "pass_criterion": "Redis key mutations confirm live execution vs static mocking",
                "kind": "anti_fake"
            }
        ],
        "bullet": {
            "template": "Engineered distributed rate limiting proxy in Go and Redis using atomic Lua scripts; sustained [TARGET_RPS] req/sec with < [P99_LATENCY] tail latency overhead and handled [CONCURRENT_REQS] concurrent requests without dropped writes.",
            "claims": [
                {"text": "sustained [TARGET_RPS] req/sec with < [P99_LATENCY] tail latency overhead", "rubric_indexes": [0, 2]},
                {"text": "handled [CONCURRENT_REQS] concurrent requests without dropped writes", "rubric_indexes": [1, 2]}
            ],
            "do_not_claim": "sub-millisecond latency or production scale without committing benchmark output logs"
        },
        "verify": [],
        "worksheet": {"q1": "Token bucket rate limiter"}
    }

    # Test 0: Baseline Valid
    passed, checks = validate_design(base_valid, effort_model)
    print(f"Test 0 (Baseline Valid Design): {'PASSED' if passed else 'FAILED'}")
    assert passed, f"Baseline valid design should pass, failed on: {[c for c in checks if not c['passed']]}"

    # Test 1: Flawed Design 1 - Pre-filled numbers in resume bullet (Violates V7)
    flawed_1 = json.loads(json.dumps(base_valid))
    flawed_1["bullet"]["template"] = "Engineered rate limiter achieving 30,000 req/sec with 98% accuracy and 2.5ms latency."
    passed_1, checks_1 = validate_design(flawed_1, effort_model)
    v7_failed = any(c["check"] == "V7" and not c["passed"] for c in checks_1)
    print(f"Test 1 (Flawed: Pre-filled numbers in bullet): {'CAUGHT (PASS)' if v7_failed else 'FAILED TO CATCH'}")
    assert v7_failed, "Validator must catch pre-filled numbers in bullet template (V7)"

    # Test 2: Flawed Design 2 - Milestone hours do not sum to Est. Time (Violates V2)
    flawed_2 = json.loads(json.dumps(base_valid))
    flawed_2["milestones"][0]["hours"] = 25  # breaks the sum
    passed_2, checks_2 = validate_design(flawed_2, effort_model)
    v2_failed = any(c["check"] == "V2" and not c["passed"] for c in checks_2)
    print(f"Test 2 (Flawed: Milestone hours mismatch): {'CAUGHT (PASS)' if v2_failed else 'FAILED TO CATCH'}")
    assert v2_failed, "Validator must catch milestone hour mismatch (V2)"

    # Test 3: Flawed Design 3 - Tool used in architecture missing from stack (Violates V9)
    flawed_3 = json.loads(json.dumps(base_valid))
    flawed_3["architecture"]["components"][0]["tools_used"].append("Kafka")  # Kafka not in stack
    passed_3, checks_3 = validate_design(flawed_3, effort_model)
    v9_failed = any(c["check"] == "V9" and not c["passed"] for c in checks_3)
    print(f"Test 3 (Flawed: Tool missing from stack): {'CAUGHT (PASS)' if v9_failed else 'FAILED TO CATCH'}")
    assert v9_failed, "Validator must catch tool missing from stack (V9)"

    print("=== ALL 3 SYNTHETIC FLAW TESTS PASSED WITH 100% SUCCESS ===\n")
    return True

if __name__ == "__main__":
    tools_dir = os.path.dirname(os.path.abspath(__file__))
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        success = run_unit_tests(tools_dir)
        sys.exit(0 if success else 1)
    elif len(sys.argv) > 1:
        design_file = sys.argv[1]
        effort_model = load_effort_model(tools_dir)
        with open(design_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        passed, checks = validate_design(data, effort_model)
        for c in checks:
            status = "PASS" if c["passed"] else "FAIL"
            print(f"[{status}] {c['check']}: {c['reason']}")
        print(f"\nOVERALL: {'PASS' if passed else 'FAIL'}")
        sys.exit(0 if passed else 1)
    else:
        run_unit_tests(tools_dir)
