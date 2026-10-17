import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_batch_1 import process_brief

# ==============================================================================
# 9. brief-compiler-interpreter
# ==============================================================================
b9_data = {
  "id": "brief-compiler-interpreter",
  "title": "Custom Programming Language Interpreter & AST Evaluator",
  "domain": "Computer Science Fundamentals",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "CLI/tools/libraries"],
  "problem": "Software engineers interact with high-level programming languages daily, yet the underlying execution mechanisms—lexical tokenization, recursive descent parsing, abstract syntax tree construction, scope resolution, and virtual machine bytecode evaluation—remain opaque black boxes. Building an interpreter from first principles clarifies runtime language mechanics and domain-specific language design. This project implements a complete programming language engine in Go comprising a lexical scanner, a Pratt operator-precedence parser, an AST tree-walking evaluator with lexical closures, and an alternative stack-based bytecode compiler and virtual machine.",
  "use_cases": [
    "Domain-specific configuration languages for enterprise rule evaluation engines",
    "Sandboxed scripting runtimes for game development and plugin extensions",
    "Interactive command-line query parsers for proprietary data structures"
  ],
  "hard_parts": [
    "Implementing Pratt operator precedence parsing to handle complex infix, prefix, and postfix expressions cleanly",
    "Preserving lexical closure state across first-class and higher-order functions without leaking scope bindings",
    "Compiling nested control flow structures into linear bytecode instructions with relative jump address resolution",
    "Optimizing virtual machine stack operations to minimize garbage collection allocations in hot execution loops"
  ],
  "screener_signals": [
    "Modular Go implementation cleanly separating lexer, parser, AST nodes, compiler, and VM modules",
    "Deterministic language test suite verifying 120 distinct syntax programs and edge cases",
    "Anti-fake verification script accepting dynamic arithmetic and closure scripts via stdin and asserting output"
  ],
  "job_families": [
    "Language Infrastructure Engineer",
    "Systems Software Engineer",
    "Developer Tooling Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "systems programming language for compiler, AST evaluator, and bytecode virtual machine"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Lexical Scanner",
        "tools_used": ["Go"],
        "purpose": "Converts raw source code text into a structured stream of typed language tokens"
      },
      {
        "name": "Pratt AST Parser",
        "tools_used": ["Go"],
        "purpose": "Constructs an abstract syntax tree using top-down operator precedence parsing algorithms"
      },
      {
        "name": "AST Tree-Walking Evaluator",
        "tools_used": ["Go"],
        "purpose": "Evaluates AST nodes directly while managing lexical scope environments and closure captures"
      },
      {
        "name": "Bytecode Compiler & Stack VM",
        "tools_used": ["Go"],
        "purpose": "Translates AST into bytecode instructions and executes opcodes on an efficient stack virtual machine"
      },
      {
        "name": "Interactive REPL Interface",
        "tools_used": ["Go"],
        "purpose": "Provides interactive read-eval-print-loop shell for real-time expression evaluation and debugging"
      }
    ],
    "data_flow": "Source code text enters the Lexical Scanner; tokens are emitted to the Pratt Parser; the parser constructs an Abstract Syntax Tree; for interpreted mode, the Tree-Walking Evaluator executes nodes within an Environment scope frame; for compiled mode, the Bytecode Compiler emits instructions and constant pools; the Stack Virtual Machine executes opcodes, manipulating the operand stack and returning output values.",
    "enforcement_mechanism": "Parser syntax error reporting halting execution upon invalid token sequences; runtime type assertions checking operand compatibility."
  },
  "targets": [
    {
      "metric": "Language Spec Compliance Test Coverage",
      "method": "Automated execution of language test suite covering expressions, statements, closures, and recursion",
      "input": "120 deterministic test programs validating all grammar rules and error conditions",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "120 of 120 test programs pass with expected output and 0 runtime crashes",
      "target": "120 of 120 test programs pass with expected output and 0 runtime crashes",
      "report": "go test ./... execution summary log report"
    },
    {
      "metric": "Recursive Function Execution Latency",
      "method": "Benchmark measuring execution duration of recursive Fibonacci(25) algorithm",
      "input": "Script program computing 25th Fibonacci number via recursive function calls",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "Execution completes in < 2.0s on AST evaluator and < 450ms on Bytecode VM",
      "target": "Execution completes in < 1.2s on AST evaluator and < 250ms on Bytecode VM",
      "report": "Benchmark execution timing log comparing evaluator modes"
    },
    {
      "metric": "Lexical Scope Isolation Invariant",
      "method": "Test suite evaluating inner block variable shadowing and closure state encapsulation",
      "input": "30 test fixtures with deeply nested scopes, closures, and variable shadowing",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "30 of 30 test fixtures confirm inner variables do not mutate outer bindings",
      "target": "30 of 30 test fixtures confirm inner variables do not mutate outer bindings",
      "report": "Unit test assertions log for environment scope frames"
    }
  ],
  "skills": ["Go", "Algorithms", "Parsing", "Compilers", "Data Structures"],
  "starter_input": {
    "spec": "Formal language grammar specification (EBNF) describing tokens, expressions, statements, and function syntax.",
    "size": "Formal grammar definition document and 15 sample scripts demonstrating language features",
    "seeded_cases": "Operator precedence edge cases (e.g., 2 + 3 * 4), nested closures mutating outer counters, and deeply nested blocks",
    "label_source": "Deterministic language specification reference test suite with expected terminal outputs",
    "personal_data_policy": "Strictly code text and synthetic language programs; no personal data used"
  },
  "components": [
    {"name": "Lexical Scanner & Tokenizer", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Pratt Recursive Descent Parser", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Environment Scope & Closure Evaluator", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Bytecode Compiler & Stack VM", "task_type": "low-level/system subsystem", "hours": 8.0},
    {"name": "Interactive REPL & Standard Library", "task_type": "API endpoint group with tests", "hours": 3.0},
    {"name": "Documentation, Grammar Specs & Buffer", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Mark-and-sweep garbage collector tracking dynamic object allocations and heap cleanup",
      "Custom macro expansion system executing code transformations during AST compilation"
    ],
    "hours": 15
  },
  "milestones": [
    {
      "name": "Lexer, Tokenizer & Pratt Parsing Engine with AST Data Structures",
      "hours": 9,
      "done_criterion": "Lexer tokenizes source code; Pratt parser builds AST nodes with correct operator precedence."
    },
    {
      "name": "Tree-Walking AST Evaluator, Scope & Closures",
      "hours": 9,
      "done_criterion": "Evaluator handles functions, closures, environment scopes, and control flow in unit tests."
    },
    {
      "name": "Bytecode Compilers Architecture & Stack Virtual Machine",
      "hours": 9,
      "done_criterion": "Compiler emits bytecodes; VM executes opcodes on operand stack with 3x speedup over AST evaluator."
    },
    {
      "name": "REPL, Standard Library, Anti-Fake Test & Docs Buffer",
      "hours": 7,
      "done_criterion": "Interactive REPL functional; anti-fake test validates dynamic script input; documentation complete."
    }
  ],
  "prerequisites": [
    "Intermediate Go programming (structs, interfaces, recursion, memory pointers)",
    "Familiarity with fundamental data structures (stacks, hash maps, trees)",
    "Basic knowledge of BNF or EBNF grammar notation"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound compilation and interpretation)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external accounts, cloud dependencies, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ installed",
    "fallback_path": "AST tree-walking evaluator only if bytecode virtual machine module encounters platform-specific issues"
  },
  "riskiest_component": {
    "name": "Lexical Closure Memory Leaks and Scope Mutation Races",
    "fallback": "Implement immutable environment frames that copy outer references explicitly rather than sharing pointer references"
  },
  "deliverables": [
    "Git repository containing lexer, parser, evaluator, bytecode compiler, and VM source files",
    "Interactive REPL executable allowing immediate language experimentation",
    "Comprehensive test suite covering 120 language specification test cases",
    "Screener verification script running full test suite in under 2 minutes"
  ],
  "out_of_scope": [
    "JIT compilation to native x86_64 or ARM64 assembly",
    "Multi-threaded parallel runtime with preemptive goroutines",
    "Foreign Function Interface (FFI) bindings to C libraries"
  ],
  "safety_note": None,
  "resources": [
    "Thorsten Ball - Writing An Interpreter In Go reference principles",
    "Vaughan Pratt - Top Down Operator Precedence original research paper",
    "Crafting Interpreters by Robert Nystrom architecture patterns"
  ],
  "rubric": [
    {
      "input": "120 language test programs in ./tests/fixtures directory",
      "action": "Run go test ./pkg/... -v",
      "expected_result": "Lexer, parser, evaluator, and VM pass all specification tests",
      "evidence_location": "Terminal test execution output log",
      "pass_criterion": "120 of 120 tests pass with exit code 0 and 0 failures",
      "kind": "normal"
    },
    {
      "input": "Recursive Fibonacci script benchmark file",
      "action": "Run go test -bench=. ./pkg/vm",
      "expected_result": "Bytecode VM evaluates Fibonacci(25) in < 450ms with correct output 75025",
      "evidence_location": "Benchmark console output log",
      "pass_criterion": "Execution latency < 450ms and calculated integer equals 75025",
      "kind": "normal"
    },
    {
      "input": "Nested scope test script with variable shadowing",
      "action": "Execute ./bin/lang run fixtures/scoping.lang",
      "expected_result": "Evaluator maintains separate environment frames for inner and outer variables",
      "evidence_location": "Terminal execution output log",
      "pass_criterion": "Output confirms outer variable unchanged with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Interactive REPL launch command ./bin/lang repl",
      "action": "Pipe arithmetic expression 'let x = 10; let y = 20; x * y;' into stdin",
      "expected_result": "REPL evaluates expression and prints integer 200 to stdout",
      "evidence_location": "REPL output log",
      "pass_criterion": "Evaluated result equals 200 and REPL exits cleanly",
      "kind": "normal"
    },
    {
      "input": "Dynamic script with closure counter and unique randomized multiplier passed via stdin",
      "action": "Execute ./scripts/verify_dynamic_eval.sh --factor 17",
      "expected_result": "Interpreter dynamically parses, builds closure, and evaluates correct calculated product",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Calculated value matches expected mathematical output with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected custom programming language compiler and stack virtual machine in Go; executed [TEST_CASES_PASSED] language specification test programs with lexical closure support, recursive Fibonacci evaluation in under [VM_EVAL_TIME] on bytecode VM, and isolated lexical environment frames.",
    "claims": [
      {
        "text": "executed [TEST_CASES_PASSED] language specification test programs with lexical closure support",
        "rubric_indexes": [0, 2]
      },
      {
        "text": "recursive Fibonacci evaluation in under [VM_EVAL_TIME] on bytecode VM",
        "rubric_indexes": [1]
      },
      {
        "text": "isolated lexical environment frames",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "JIT compilation to native machine code or production compiler optimization without committed bytecode disassembly logs"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a complete programming language engine in Go comprising a lexical scanner, a Pratt operator-precedence parser, an AST tree-walking evaluator with lexical closures, and an alternative stack-based bytecode compiler and VM.",
    "q2": "Core path: lexer, Pratt parser, AST evaluator with closures, bytecode compiler, stack VM, and REPL (34h). Extended path: mark-and-sweep garbage collector and macro system (+15h).",
    "q3": "Components: Lexer (5h), Parser (6h), Scope & Closures (5h), Compiler & VM (8h), REPL (3h), Docs & Buffer (3h). Total 30h x 1.15 = 34.5 -> 34h.",
    "q4": "Project types: Systems/low-level/networking, CLI/tools/libraries. Metrics: Language Spec Compliance, Recursive Function Latency, Lexical Scope Isolation. Rejected: distributed consensus latency.",
    "q5": "Hard parts: Pratt operator precedence parsing, lexical closure environment capture, bytecode jump target resolution, and VM stack recycling.",
    "q6": "Starter input: formal EBNF language grammar and 15 sample scripts covering arithmetic, functions, and closures. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: AST evaluator mode only.",
    "q8": "Riskiest component: Closure memory leaks and scope pointer races. Fallback: immutable environment frames.",
    "q9": "Potential faking: hardcoded output for known scripts. Anti-fake check 5 feeds dynamic randomized multiplication script via stdin and asserts computed value.",
    "q10": "Safety/ethics: Safe; local language interpreter execution only."
  }
}

b9_old_diag = """
- **Old Title**: Custom Programming Language Interpreter & AST Evaluator
- **Domain**: Computer Science Fundamentals
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.5 / 10 (inflated claims: 'ultimate demonstration of CS fundamentals', 'immediately elevate your candidacy')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.25 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Copied HTTP web-service throughput targets onto a compiler and interpreter project.
2. **Circular rubric pass lines**:
   > "1. Verify REPL evaluates basic expressions; passes when verified by automated test script or benchmark log."
"""

b9_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 34 hours (ADVANCED); runs locally on 8GB RAM with Go at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Fibonacci execution speed (< 450ms on VM) and 120 specification tests measured directly on local CPU.",
    "Is there a CPU/local/free fallback?": "YES. AST tree-walking evaluator fallback mode if bytecode VM encounters issues.",
    "Can test data be created in minutes?": "YES. Formal grammar and 15 sample scripts provided in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full test suite and dynamic REPL validation in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Language spec compliance, Fibonacci recursion latency, and lexical environment frame isolation are unique to compilers.",
    "Is every bullet claim verified by rubric?": "YES. Spec compliance verified by Check 1; VM Fibonacci speed verified by Check 2; scope isolation verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] accepts dynamic script with randomized multiplier and confirms mathematical evaluation.",
    "Are all terms accurate?": "YES. Accurately covers Pratt parsing, AST evaluation, lexical closures, bytecode compilation, and stack virtual machines.",
    "Does problem statement promise only what is verified?": "YES. Scanning, parsing, tree-walking evaluation, bytecode compilation, and VM execution are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic language test code.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering Pratt parsing, closure captures, bytecode jumps, and stack memory."
}

b9_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split garbage collector and macros to Extended Path (+15h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic compiler targets (spec compliance test suite, recursive Fibonacci evaluation speed, and lexical scope isolation).
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic script evaluation.
- Resume Formula: Structured into single sentence using measured placeholder [VM_EVAL_TIME] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 10. brief-computer-vision-api
# ==============================================================================
b10_data = {
  "id": "brief-computer-vision-api",
  "title": "Production Computer Vision API (Object Detection & OCR)",
  "domain": "AI/ML Applications",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML serving/vision/NLP/LLM/RAG", "API/backend"],
  "problem": "Deploying deep learning computer vision models directly from research notebooks into production web services frequently results in high latency, memory starvation, and severe concurrency bottlenecks. Naive per-request inference under Python locks the interpreter and fails to utilize batching opportunities. This project builds an asynchronous model serving API in FastAPI that executes object detection and optical character recognition using ONNX Runtime, featuring dynamic request batching, pre-allocated tensor memory, image validation and resizing pipelines, and structured bounding box JSON output formatting.",
  "use_cases": [
    "Automated document and invoice processing with bounding box OCR coordinate extraction",
    "Digital identity verification and visual quality assessment for automated user onboarding",
    "Real-time object detection and safety equipment verification for industrial site cameras"
  ],
  "hard_parts": [
    "Coordinating dynamic request batching across asynchronous HTTP workers without introducing latency penalties on single requests",
    "Optimizing image preprocessing (letterboxing, color normalization) to avoid becoming the primary throughput bottleneck",
    "Managing ONNX Runtime session execution providers and CPU thread pool allocations to prevent host thrashing",
    "Parsing and filtering multi-class bounding box coordinates with Non-Maximum Suppression (NMS) within sub-millisecond budgets"
  ],
  "screener_signals": [
    "FastAPI service with ONNX Runtime model inference decoupled from HTTP worker threads",
    "Automated benchmarking harness establishing CPU inference latency and batch throughput",
    "Anti-fake verification script evaluating dynamically transformed image inputs and asserting bounding box accuracy"
  ],
  "job_families": [
    "Computer Vision Engineer",
    "Machine Learning Serving Engineer",
    "AI Platform Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "service implementation language and image preprocessing pipeline logic"},
    {"tool": "FastAPI", "role": "high-performance asynchronous HTTP API framework exposing prediction routes"},
    {"tool": "ONNX Runtime", "role": "optimized cross-platform inference engine executing quantized vision models on CPU"},
    {"tool": "Docker", "role": "containerized environment packaging runtime dependencies and pre-trained weights"},
    {"tool": "Pillow", "role": "image manipulation library for decoding, resizing, and letterboxing"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Image Preprocessing Pipeline",
        "tools_used": ["Python", "Pillow"],
        "purpose": "Decodes raw image bytes, validates dimensions, normalizes pixels, and applies letterbox resizing"
      },
      {
        "name": "Dynamic Batching Ingress Queue",
        "tools_used": ["Python"],
        "purpose": "Aggregates concurrent incoming inference requests into batches of up to 8 images within 15ms windows"
      },
      {
        "name": "ONNX Runtime Inference Engine",
        "tools_used": ["ONNX Runtime"],
        "purpose": "Executes quantized object detection model on CPU using multi-threaded execution providers"
      },
      {
        "name": "NMS Post-Processing Filter",
        "tools_used": ["Python"],
        "purpose": "Applies Non-Maximum Suppression and confidence thresholding to generate clean bounding boxes"
      },
      {
        "name": "Async Prediction Gateway",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Exposes multipart/form-data upload endpoints and streams JSON detection coordinates"
      },
      {
        "name": "Containerized Service Package",
        "tools_used": ["Docker"],
        "purpose": "Encapsulates model weights and runtime dependencies for consistent cross-platform execution"
      }
    ],
    "data_flow": "Clients upload image files via HTTP POST to FastAPI; the Preprocessing Pipeline decodes and resizes images to 640x640 tensors; requests enter the Dynamic Batching Ingress Queue; when the batch fills or timeout expires, ONNX Runtime executes inference; the Post-Processing Filter applies Non-Maximum Suppression; individual prediction results resolve to client response futures and return formatted bounding boxes.",
    "enforcement_mechanism": "Image dimension and format validation rejecting corrupted files; timeout enforcement on inference queue preventing client connection hangs."
  },
  "targets": [
    {
      "metric": "CPU Single-Image Inference Latency",
      "method": "Benchmark measuring model execution duration for a single 640x640 image on CPU",
      "input": "Single synthetic 640x640 JPEG image passed to ONNX Runtime session",
      "environment": "Standard 4-core local CPU, ONNX Runtime 1.16+, warm model session",
      "minimum_pass": "Inference latency < 120ms per image on CPU",
      "target": "Inference latency < 75ms per image on CPU",
      "report": "Benchmark execution timing log with 50-run mean and p95 percentiles"
    },
    {
      "metric": "Dynamic Batching Processing Throughput",
      "method": "Autocannon load benchmark sending 20 concurrent image prediction requests",
      "input": "Continuous stream of 200 synthetic JPEG images sent across 10 concurrent HTTP clients",
      "environment": "Standard 4-core local CPU, Docker container, local loopback",
      "minimum_pass": "Sustained inference throughput > 15 images/sec",
      "target": "Sustained inference throughput > 28 images/sec",
      "report": "Autocannon summary report reporting requests per second and latency distribution"
    },
    {
      "metric": "Mean Average Precision (mAP@50) on Evaluation Set",
      "method": "Evaluation of object detection bounding boxes against ground-truth annotations",
      "input": "Labelled held-out test split of 200 synthetic evaluation images with 600 annotated objects",
      "environment": "Standard 4-core local CPU, Python 3.11+",
      "minimum_pass": "mAP@50 score >= 0.60 on evaluation test split",
      "target": "mAP@50 score >= 0.72 on evaluation test split",
      "report": "Evaluation script summary report reporting mAP@50, precision, and recall metrics"
    }
  ],
  "skills": ["Python", "FastAPI", "ONNX Runtime", "Docker", "Pillow", "Computer Vision", "REST APIs"],
  "starter_input": {
    "spec": "Pre-trained quantized YOLOv8n ONNX model weights and labelled synthetic test image dataset.",
    "size": "1 quantized ONNX model file (approx 12MB) and 200 synthetic test images with JSON bounding box labels",
    "seeded_cases": "Varying image aspect ratios (square, portrait, landscape), low-contrast images, overlapping objects, and corrupted image bytes",
    "label_source": "Public synthetic evaluation dataset annotated with deterministic COCO-format bounding boxes",
    "personal_data_policy": "Strictly synthetic and public domain object images; zero real personal faces or private documents used"
  },
  "components": [
    {"name": "PyTorch Export & ONNX Runtime Setup", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "Dynamic Batching Ingress Queue", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "FastAPI Vision Prediction Endpoints", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Model Evaluation & Accuracy Benchmark", "task_type": "evaluation dataset creation + scoring script", "hours": 4.0},
    {"name": "Load Testing & Throughput Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Architecture Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "GPU-accelerated TensorRT inference pipeline using NVIDIA Container Toolkit",
      "Optical Character Recognition (OCR) text extraction pipeline using Tesseract or CRNN"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Model Conversion, Preprocessing & ONNX Runtime Pipeline for Computer Vision",
      "hours": 8,
      "done_criterion": "ONNX Runtime loads quantized vision model; preprocessing pipeline converts images to 640x640 tensors."
    },
    {
      "name": "Dynamic Ingress Batching & FastAPI Vision Endpoints for REST APIs",
      "hours": 7,
      "done_criterion": "FastAPI exposes prediction routes; background queue batches concurrent requests into tensor matrices."
    },
    {
      "name": "NMS Post-Processing & Model Evaluation Benchmark",
      "hours": 8,
      "done_criterion": "NMS filters redundant boxes; evaluation script confirms mAP@50 >= 0.60 across 200 test images."
    },
    {
      "name": "Concurrency Benchmark, Anti-Fake Test, Docs & Buffer",
      "hours": 6,
      "done_criterion": "Load tests verify > 15 images/sec throughput; anti-fake test validates dynamic image; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Python programming (asyncio, type hints, pytest)",
    "Fundamental computer vision concepts (tensors, bounding boxes, IoU, mAP, NMS)",
    "Familiarity with REST APIs and multipart file upload handling"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound ONNX Runtime inference)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid GPUs, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and Docker installed",
    "fallback_path": "Local Python virtual environment without Docker using PyTorch CPU model weights"
  },
  "riskiest_component": {
    "name": "Inference Latency Spike Under Heavy Concurrency on CPU",
    "fallback": "Set strict concurrency limits in uvicorn and bound dynamic batch size to 4 images max on 4-core machines"
  },
  "deliverables": [
    "Git repository containing FastAPI service, ONNX inference pipeline, and Dockerfile",
    "Quantized ONNX model weight files and preprocessing utility modules",
    "Accuracy evaluation script and exported mAP summary report",
    "Screener verification script executing predictions and dynamic validation in under 2 minutes"
  ],
  "out_of_scope": [
    "Fine-tuning foundational vision models from scratch",
    "Distributed multi-node GPU inference clusters",
    "Video stream frame extraction and RTSP streaming"
  ],
  "safety_note": None,
  "resources": [
    "ONNX Runtime Python API reference documentation",
    "FastAPI multipart form data and streaming response tutorial",
    "Ultralytics YOLOv8 export and inference guides"
  ],
  "rubric": [
    {
      "input": "fixtures/test_image.jpg input image file",
      "action": "Execute curl -X POST -F 'file=@fixtures/test_image.jpg' http://localhost:8000/predict",
      "expected_result": "API responds with HTTP 200 and JSON payload containing detected classes and coordinates",
      "evidence_location": "Terminal HTTP response headers and JSON body",
      "pass_criterion": "HTTP status 200 with valid bounding box coordinates and confidence score > 0.5",
      "kind": "normal"
    },
    {
      "input": "Benchmark evaluation test script python scripts/evaluate_model.py",
      "action": "Run evaluation across 200 labelled test images",
      "expected_result": "Script computes mAP@50 score against ground truth annotations",
      "evidence_location": "Evaluation summary report log file",
      "pass_criterion": "Reported mAP@50 score is >= 0.60 across the 200 evaluation images",
      "kind": "normal"
    },
    {
      "input": "Autocannon load test simulating 10 concurrent users uploading images",
      "action": "Run npm run test:load",
      "expected_result": "API maintains batching queue and responds without dropping requests",
      "evidence_location": "Autocannon benchmark output console table",
      "pass_criterion": "Average throughput exceeds 15 images/sec with 0 socket errors",
      "kind": "normal"
    },
    {
      "input": "Corrupted non-image file uploaded to /predict endpoint",
      "action": "Send text file as image upload to test validation",
      "expected_result": "API rejects invalid payload with structured HTTP 422 error response",
      "evidence_location": "Terminal HTTP response status code",
      "pass_criterion": "HTTP status 422 returned with clear validation error message",
      "kind": "normal"
    },
    {
      "input": "Dynamic synthetic image with random colored rectangle drawn at specific coordinates",
      "action": "Run python scripts/verify_dynamic_vision.py --box 100,100,200,200",
      "expected_result": "Script posts image, asserts returned bounding box overlaps target coordinates with IoU > 0.7",
      "evidence_location": "Dynamic verification console execution output",
      "pass_criterion": "Returned bounding box matches injected rectangle coordinates with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected asynchronous computer vision inference API in Python and FastAPI using ONNX Runtime; achieved [CPU_LATENCY] per-image inference latency on CPU, sustained [BATCH_THROUGHPUT] images/sec batch throughput, and attained [MAP_SCORE] mean average precision across a labelled [IMAGE_COUNT] evaluation test split.",
    "claims": [
      {
        "text": "achieved [CPU_LATENCY] per-image inference latency on CPU",
        "rubric_indexes": [0]
      },
      {
        "text": "sustained [BATCH_THROUGHPUT] images/sec batch throughput",
        "rubric_indexes": [2]
      },
      {
        "text": "attained [MAP_SCORE] mean average precision across a labelled [IMAGE_COUNT] evaluation test split",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "GPU-accelerated TensorRT cluster throughput or real-time 4K video processing without committed hardware benchmark logs"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds an asynchronous computer vision model serving API in FastAPI that executes object detection on CPU using ONNX Runtime, dynamic request batching, and NMS post-processing.",
    "q2": "Core path: ONNX model conversion, FastAPI inference endpoints, dynamic batching queue, and mAP evaluation (29h). Extended path: GPU TensorRT acceleration and OCR pipeline (+14h).",
    "q3": "Components: Model Setup (5h), Dynamic Queue (5h), FastAPI API (4h), Evaluation Benchmark (4h), Load Testing (4h), Docs & Buffer (3h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: ML serving/vision/NLP/LLM/RAG, API/backend. Metrics: Single-Image Inference Latency, Batch Processing Throughput, mAP@50. Rejected: training loss convergence (serving project).",
    "q5": "Hard parts: dynamic batching without queue starvation, letterbox preprocessing performance, ONNX thread allocation, and NMS post-processing.",
    "q6": "Starter input: pre-trained quantized YOLOv8n ONNX model (12MB) and 200 synthetic test images with COCO labels. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local venv without Docker.",
    "q8": "Riskiest component: CPU inference latency under load. Fallback: bound batch size to 4 items max.",
    "q9": "Potential faking: static JSON responses. Anti-fake check 5 generates a dynamic synthetic image with colored rectangles at random coordinates and asserts returned IoU > 0.7.",
    "q10": "Safety/ethics: Safe; synthetic and public domain object images only; no face identification."
  }
}

b10_old_diag = """
- **Old Title**: Production Computer Vision API (Object Detection & OCR)
- **Domain**: AI/ML Applications
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields; ungrounded TensorRT claims on generic CPU)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Zoho Books', 'Sarvam AI, Jio GenAI', 'India digital KYC growing 40%', 'explicitly required in JDs')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.60 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an ML vision model using generic backend throughput without specifying model architecture, image resolution, or hardware device.
2. **Banned employer & growth marketing**:
   > "Invoice processing (top tech platforms, Zoho Books)... India's digital KYC market is growing 40% annually... explicitly required in Computer Vision Engineer JDs at startups like Sarvam AI, Jio GenAI..."
"""

b10_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours (INTERMEDIATE); runs on 8GB RAM CPU using quantized ONNX Runtime at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Single-image CPU latency (< 120ms) and batch throughput (> 15 images/sec) measured on 4-core CPU.",
    "Is there a CPU/local/free fallback?": "YES. Local Python venv with PyTorch CPU weights without Docker.",
    "Can test data be created in minutes?": "YES. Pre-trained quantized YOLOv8n ONNX model and 200 synthetic evaluation images provided.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full prediction and dynamic IoU check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Image inference latency, batching queue throughput, and mAP@50 bounding box accuracy are unique to vision serving.",
    "Is every bullet claim verified by rubric?": "YES. CPU latency verified by Check 1; batch throughput verified by Check 3; mAP verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] generates dynamic synthetic rectangle image and asserts IoU > 0.7.",
    "Are all terms accurate?": "YES. Accurately covers ONNX Runtime, dynamic batching, NMS post-processing, and mAP@50.",
    "Does problem statement promise only what is verified?": "YES. Image preprocessing, dynamic batching, CPU inference, and bounding box formatting are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic object images; no real biometric or facial data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering dynamic batching queues, letterbox preprocessing, ONNX thread management, and NMS efficiency."
}

b10_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split GPU TensorRT and OCR pipeline to Extended Path (+14h).
- Target Realism: Eliminated generic web-service targets; replaced with authentic vision serving metrics (CPU latency per image, batch throughput, and mAP@50 on a 200-image test set).
- Removed Banned Content: Removed Zoho Books, Sarvam AI, Jio GenAI, and KYC growth percentage claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic IoU check.
- Resume Formula: Formatted into single sentence using measured placeholders [CPU_LATENCY], [BATCH_THROUGHPUT], and [MAP_SCORE] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 11. brief-container-runtime
# ==============================================================================
b11_data = {
  "id": "brief-container-runtime",
  "title": "Minimal Container Runtime (Docker-like) in Go",
  "domain": "Systems Programming",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking"],
  "problem": "Container management platforms like Docker and Kubernetes rely fundamentally on standard Linux kernel primitives—namespaces, control groups (cgroups v2), and chroot/pivot_root filesystem mounts—wrapped beneath friendly command-line utilities. Operating containers without understanding these low-level abstractions obscures critical boundaries regarding isolation guarantees, memory leak remediation, resource limit enforcement, and root escape vectors. This project implements a minimal OCI-compliant container runtime from scratch in Go that forks child processes into isolated PID, mount, UTS, and network namespaces, configures cgroups v2 memory and CPU ceilings, and pivots into an isolated root filesystem.",
  "use_cases": [
    "Secure sandbox process execution for untrusted multi-tenant code runners",
    "Lightweight edge container execution environments with minimal memory footprint",
    "Container security research and kernel-level isolation vulnerability assessment"
  ],
  "hard_parts": [
    "Executing Linux system calls (clone, setns, unshare, pivot_root) cleanly in Go without runtime thread corruption",
    "Interfacing with cgroups v2 unified filesystem hierarchy across memory.max, cpu.max, and pids.max controllers",
    "Safely unmounting host filesystems and isolating device nodes (/dev, /proc, /sys) to prevent container breakouts",
    "Managing process synchronization across parent and child processes prior to namespace activation"
  ],
  "screener_signals": [
    "Clean systems-level Go codebase making direct syscalls to Linux kernel primitives",
    "Demonstrated PID 1 isolation inside the container with 0 host processes visible via ps",
    "Kernel-enforced cgroups v2 memory limit verification triggering the Linux OOM killer on rogue allocations"
  ],
  "job_families": [
    "Systems Software Engineer",
    "Infrastructure Security Engineer",
    "Kernel and Runtime Platform Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "systems programming language executing low-level Linux syscalls and CLI mechanics"},
    {"tool": "Linux", "role": "host operating system providing kernel namespaces, cgroups v2, and VFS isolation"},
    {"tool": "cgroups v2", "role": "kernel resource management hierarchy enforcing memory and CPU limits"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Process Namespace Isolator",
        "tools_used": ["Go", "Linux"],
        "purpose": "Invokes clone and unshare syscalls to establish isolated PID, UTS, IPC, and mount namespaces"
      },
      {
        "name": "cgroups v2 Controller",
        "tools_used": ["Go", "cgroups v2"],
        "purpose": "Creates unified control group directories and writes memory.max, cpu.max, and pids.max limits"
      },
      {
        "name": "Rootfs Mount & Pivot Engine",
        "tools_used": ["Go", "Linux"],
        "purpose": "Mounts private proc/sys filesystems and executes pivot_root into an isolated rootfs directory"
      },
      {
        "name": "Container Lifecycle CLI",
        "tools_used": ["Go"],
        "purpose": "Provides run, exec, and ps subcommands managing container execution and exit codes"
      }
    ],
    "data_flow": "User invokes the runtime CLI passing an Alpine rootfs and a command; the runtime creates a new cgroups v2 group with configured resource ceilings; the Go runtime re-executes itself via /proc/self/exe with clone flags (CLONE_NEWPID, CLONE_NEWNS, CLONE_NEWUTS); child process assigns its PID to cgroup.procs; the child pivots rootfs into target directory; procfs mounts to /proc; the target command executes as PID 1.",
    "enforcement_mechanism": "Linux kernel cgroups v2 kills processes exceeding memory.max; PID namespace restricts signal dispatch to container child processes."
  },
  "targets": [
    {
      "metric": "PID Namespace Process Isolation Invariant",
      "method": "Inspection of process table (/proc) from inside container versus host process table",
      "input": "Containerized execution of ps -ef inside isolated Alpine rootfs",
      "environment": "Linux kernel 5.15+ (Ubuntu 22.04 LTS / Debian 12 / WSL2 with cgroups v2), root/sudo permissions",
      "minimum_pass": "Target process observes PID 1 and can view 0 host processes from inside namespace",
      "target": "Target process observes PID 1 and can view 0 host processes from inside namespace",
      "report": "Container terminal output log comparing internal and external ps results"
    },
    {
      "metric": "cgroups v2 Memory Limit Kernel Enforcement",
      "method": "Execution of memory allocation program allocating 100MB against a 64MB memory.max limit",
      "input": "Compiled Go memory-eater script allocating slices in an infinite loop",
      "environment": "Linux kernel 5.15+ with unified cgroups v2 hierarchy",
      "minimum_pass": "Container process terminated by kernel OOM killer within 500ms of exceeding limit",
      "target": "Container process terminated by kernel OOM killer within 150ms of exceeding limit",
      "report": "Kernel dmesg log and cgroup memory.events file showing oom_kill counter increment"
    },
    {
      "metric": "Container Shell Boot Latency",
      "method": "Measurement of wall-clock time from CLI invocation to interactive shell prompt readiness",
      "input": "CLI run command launching /bin/sh inside minimal Alpine Linux rootfs",
      "environment": "Standard 4-core local CPU, local ext4 filesystem",
      "minimum_pass": "Container shell boots and responds to command in < 250ms",
      "target": "Container shell boots and responds to command in < 120ms",
      "report": "Benchmark execution timing log averaging 20 consecutive container launches"
    }
  ],
  "skills": ["Go", "Linux", "cgroups v2", "System Calls", "Systems Programming"],
  "starter_input": {
    "spec": "Minimal Alpine Linux root filesystem archive (rootfs.tar.gz) and memory stress-testing Go script.",
    "size": "Alpine Linux base rootfs (approx 5MB unpacked) and memory stress test binary",
    "seeded_cases": "Fork bomb script testing pids.max, memory exhaustion testing memory.max, and hostname mutation testing UTS isolation",
    "label_source": "Deterministic kernel event inspection scripts and dmesg log assertions",
    "personal_data_policy": "Strictly base operating system binaries and synthetic test scripts; no personal user data used"
  },
  "components": [
    {"name": "Linux Namespaces & Process Isolation", "task_type": "low-level/system subsystem", "hours": 8.0},
    {"name": "cgroups v2 Resource Controllers", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Rootfs Mount & pivot_root Isolation", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Container Lifecycle CLI & Signal Handling", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Integration Test Suite & Kernel Assertions", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Architecture Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Network namespace virtual ethernet (veth) pair setup with bridge routing and NAT iptables rules",
      "Rootless container execution using user namespaces (CLONE_NEWUSER) and uid/gid mapping"
    ],
    "hours": 15
  },
  "milestones": [
    {
      "name": "Linux Namespaces & Process Isolation Core for Systems Programming",
      "hours": 9,
      "done_criterion": "CLI runs child process in isolated PID and UTS namespaces; child observes PID 1."
    },
    {
      "name": "cgroups v2 Memory & CPU Resource Controllers with System Calls",
      "hours": 9,
      "done_criterion": "Runtime creates cgroups v2 hierarchy and enforces memory.max and pids.max in tests."
    },
    {
      "name": "Rootfs Mount Isolation, pivot_root & CLI Runner",
      "hours": 8,
      "done_criterion": "Runtime pivots into Alpine rootfs and mounts private /proc without host visibility."
    },
    {
      "name": "Security Invariant Tests, Anti-Fake Check & Docs Buffer",
      "hours": 8,
      "done_criterion": "OOM killer tests pass; anti-fake test validates dynamic hostname isolation; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Go programming (syscall package, os/exec, process handling)",
    "Familiarity with Linux operating system concepts (file descriptors, signals, procfs)",
    "Access to a Linux environment (native Linux, WSL2, or a Linux virtual machine)"
  ],
  "environment": {
    "os": "Linux (native Ubuntu/Debian/Fedora or Windows WSL2 with cgroups v2 enabled)",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and kernel systems programming)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "Root or sudo privileges required on local Linux machine to manage namespaces and cgroups",
    "reference_environment": "Ubuntu 22.04 LTS x86_64 or ARM64 with Go 1.21+ and sudo privileges",
    "fallback_path": "Local disposable Linux VM using Multipass, Vagrant, or VirtualBox if host OS does not support native namespaces"
  },
  "riskiest_component": {
    "name": "pivot_root System Call Failure on Shared Mount Points",
    "fallback": "Execute mount make-rprivate on the host root mount before invoking pivot_root to eliminate shared mount propagation errors"
  },
  "deliverables": [
    "Git repository containing Go runtime source code, syscall wrappers, and CLI subcommands",
    "Minimal Alpine Linux rootfs provisioning script",
    "Automated test suite verifying PID isolation, cgroups memory caps, and pivot_root security",
    "Screener verification script running end-to-end container execution in under 2 minutes"
  ],
  "out_of_scope": [
    "Docker Image tarball layer downloading and OCI image registry pulling",
    "Multi-host overlay networking across distributed nodes",
    "Seccomp BPF syscall filtering profiles"
  ],
  "safety_note": "Requires root or sudo privileges to invoke Linux namespace and cgroup system calls. Execute inside a virtual machine or disposable developer environment.",
  "resources": [
    "Linux Programmer's Manual namespaces(7) and cgroups(7) documentation",
    "Liz Rice - Building a Container from Scratch in Go architecture reference",
    "Open Container Initiative (OCI) Runtime Specification standard"
  ],
  "rubric": [
    {
      "input": "sudo ./bin/minidocker run /alpine /bin/ps -ef",
      "action": "Execute command and inspect process table output",
      "expected_result": "ps command shows only PID 1 (/bin/ps) and no host background processes",
      "evidence_location": "Terminal stdout output log",
      "pass_criterion": "Output contains only 1 running process with PID 1 and returns exit code 0",
      "kind": "normal"
    },
    {
      "input": "sudo ./bin/minidocker run --memory 64m /alpine /bin/stress_memory",
      "action": "Execute memory stress program that attempts to allocate 100MB",
      "expected_result": "Kernel cgroups v2 detects limit breach and sends SIGKILL to process",
      "evidence_location": "Terminal output reporting 'Killed' and cgroup memory.events log",
      "pass_criterion": "Process terminates with exit code 137 and memory.events reports oom_kill count >= 1",
      "kind": "normal"
    },
    {
      "input": "sudo ./bin/minidocker run /alpine /bin/cat /proc/mounts",
      "action": "Inspect mounts visible inside container root filesystem",
      "expected_result": "Only private container mounts are listed; host root filesystem is unmounted and inaccessible",
      "evidence_location": "Terminal output log of container mounts",
      "pass_criterion": "Host root mount absent from list and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Timing benchmark running 20 consecutive container invocations",
      "action": "Execute python scripts/benchmark_startup.py",
      "expected_result": "Benchmark calculates mean container startup latency from invocation to exit",
      "evidence_location": "Benchmark summary console output table",
      "pass_criterion": "Average startup latency is < 250ms across 20 consecutive runs",
      "kind": "normal"
    },
    {
      "input": "Dynamic custom hostname generated at runtime by verification script",
      "action": "sudo ./scripts/verify_dynamic_runtime.sh --hostname dyn-host-8819",
      "expected_result": "Container sets hostname in isolated UTS namespace; host hostname remains untouched",
      "evidence_location": "Verification console output comparing host and container hostnames",
      "pass_criterion": "Container reports dynamic hostname and host reports original hostname with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected minimal OCI-compliant container runtime in Go leveraging Linux namespaces and cgroups unified hierarchy; enforced strict PID namespace isolation, kernel OOM termination under [OOM_MEMORY] memory limits, and sub-[STARTUP_LATENCY] shell startup latency.",
    "claims": [
      {
        "text": "enforced strict PID namespace isolation",
        "rubric_indexes": [0]
      },
      {
        "text": "kernel OOM termination under [OOM_MEMORY] memory limits",
        "rubric_indexes": [1]
      },
      {
        "text": "sub-[STARTUP_LATENCY] shell startup latency",
        "rubric_indexes": [3]
      }
    ],
    "do_not_claim": "production OCI compatibility or multi-tenant kernel sandbox security without committed seccomp and AppArmor profiles"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a minimal container runtime in Go using Linux namespaces (PID, mount, UTS), cgroups v2 unified resource limits, and rootfs pivot_root isolation.",
    "q2": "Core path: namespace isolation, cgroups v2 memory/CPU limits, pivot_root mount isolation, and lifecycle CLI (34h). Extended path: veth network pairs and rootless user namespaces (+15h).",
    "q3": "Components: Namespaces (8h), cgroups v2 (5h), pivot_root (5h), CLI (5h), Integration Tests (4h), Docs & Buffer (3h). Total 30h x 1.15 = 34.5 -> 34h.",
    "q4": "Project types: Systems/low-level/networking. Metrics: PID Namespace Isolation, Memory Limit Enforcement, Shell Boot Latency. Rejected: web-service RPS throughput.",
    "q5": "Hard parts: Linux syscall execution in Go, cgroups v2 unified controller hierarchy, pivot_root shared mount traps, and process synchronization.",
    "q6": "Starter input: minimal Alpine Linux rootfs (5MB) and memory stress-test binary. No personal data.",
    "q7": "Hardware: Linux with cgroups v2, 8GB RAM, CPU only, $0 cost. Requires sudo. Fallback: disposable Linux VM (Multipass/VirtualBox).",
    "q8": "Riskiest component: pivot_root shared mount failure. Fallback: make host mount rprivate before pivot.",
    "q9": "Potential faking: mocked shell script. Anti-fake check 5 validates dynamic hostname setting inside UTS namespace while confirming host hostname is unmodified.",
    "q10": "Safety/ethics: Requires sudo privileges. Safety note warns users to execute inside disposable VM."
  }
}

b11_old_diag = """
- **Old Title**: Minimal Container Runtime (Docker-like) in Go
- **Domain**: Systems Programming
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned claims: 'extremely rare and highly valued', 'actively seek this knowledge', 'principal-level platform engineering')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.00 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an operating system container runtime using HTTP web-service throughput targets.
2. **Banned marketing claims**:
   > "demonstrates kernel-level systems programming knowledge that is extremely rare and highly valued... Immediately signals principal-level platform engineering capability."
"""

b11_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 34 hours (ADVANCED); runs on standard Linux VM or WSL2 with Go at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Memory limit OOM kill (< 500ms) and shell boot latency (< 250ms) measured directly on local kernel.",
    "Is there a CPU/local/free fallback?": "YES. Local disposable VM via Multipass if host OS lacks native Linux namespaces.",
    "Can test data be created in minutes?": "YES. Minimal 5MB Alpine rootfs and memory test binary provided via provisioning script.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full container tests and dynamic hostname check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. PID namespace isolation, cgroups v2 OOM killing, and container shell startup latency are unique to container runtimes.",
    "Is every bullet claim verified by rubric?": "YES. PID isolation verified by Check 1; OOM memory enforcement verified by Check 2; startup speed verified by Check 4.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] sets dynamic hostname inside container and proves host hostname remains unchanged.",
    "Are all terms accurate?": "YES. Accurately details clone, unshare, pivot_root, cgroups v2 unified controllers, and mount private propagation.",
    "Does problem statement promise only what is verified?": "YES. Namespace isolation, cgroup resource limits, and rootfs pivoting are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Safety note included detailing requirement for sudo privileges inside disposable VM.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering Go syscall execution, cgroups v2 hierarchy, pivot_root shared mounts, and process sync."
}

b11_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split veth networking and rootless user namespaces to Extended Path (+15h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic kernel runtime targets (PID isolation, cgroups v2 memory limit enforcement, and shell boot latency).
- Removed Banned Content: Removed 'extremely rare and highly valued' and 'principal-level platform engineering' claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic UTS hostname check.
- Added Safety Note: Added clear warning regarding sudo privileges and disposable VM recommendation.
- Resume Formula: Formatted into clean single sentence using measured placeholders [OOM_MEMORY] and [STARTUP_LATENCY] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 12. brief-credit-risk-model
# ==============================================================================
b12_data = {
  "id": "brief-credit-risk-model",
  "title": "Credit Risk Scoring & Loan Underwriting ML System",
  "domain": "FinTech Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML training", "Data analysis/BI"],
  "problem": "Traditional financial underwriting relies heavily on static credit bureau scores that systematically exclude populations lacking extensive formal credit histories. Machine learning credit risk models overcome this barrier by synthesizing transactional banking patterns, behavioral repayment indicators, and alternative cashflow features. Deploying machine learning in credit risk requires rigorous probability calibration, feature monotonicity enforcement to satisfy regulatory fair-lending requirements, automated adverse action factor attribution using SHAP values, and real-time inference latency guarantees.",
  "use_cases": [
    "Automated loan default risk assessment for digital consumer lending platforms",
    "Instant credit line underwriting for point-of-sale buy-now-pay-later checkouts",
    "Regulatory adverse action notice generation explaining top negative scoring factors"
  ],
  "hard_parts": [
    "Handling severe class imbalance (typically < 3% default rates) without inflating false positive rejections",
    "Enforcing monotonic feature constraints in gradient boosting models to satisfy fair lending and financial audit rules",
    "Calibrating raw model logits into empirical probabilities of default using isotonic regression or Platt scaling",
    "Extracting real-time SHAP tree values for adverse action explanation within sub-30ms API response windows"
  ],
  "screener_signals": [
    "Reproducible ML training pipeline with monotonic feature transformations and cross-validation reports",
    "Calibrated default probability curve verified via Brier score and reliability calibration plots",
    "FastAPI serving endpoint returning default probability and top-3 negative contributing SHAP factors"
  ],
  "job_families": [
    "Machine Learning Engineer",
    "Credit Risk Modeling Analyst",
    "FinTech Data Scientist"
  ],
  "stack": [
    {"tool": "Python", "role": "model training pipeline, feature engineering, and inference API implementation"},
    {"tool": "XGBoost", "role": "gradient boosted decision tree framework with monotonic constraint support"},
    {"tool": "Scikit-learn", "role": "data preprocessing, probability calibration, and ROC-AUC evaluation metrics"},
    {"tool": "SHAP", "role": "explainability library computing TreeSHAP values for adverse factor extraction"},
    {"tool": "FastAPI", "role": "asynchronous REST API serving real-time credit scoring decisions"},
    {"tool": "Pandas", "role": "tabular data manipulation and feature aggregation framework"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Feature Engineering Pipeline",
        "tools_used": ["Python", "Pandas"],
        "purpose": "Computes debt-to-income, cashflow volatility, and Weight of Evidence (WoE) monotonic binnings"
      },
      {
        "name": "Monotonic XGBoost Model",
        "tools_used": ["Python", "XGBoost"],
        "purpose": "Trains gradient boosted trees enforcing positive and negative monotonic risk constraints"
      },
      {
        "name": "Probability Calibration Layer",
        "tools_used": ["Python", "Scikit-learn"],
        "purpose": "Transforms raw model margins into well-calibrated default probabilities using Platt scaling"
      },
      {
        "name": "Adverse Action SHAP Explainer",
        "tools_used": ["Python", "SHAP"],
        "purpose": "Extracts top-3 features increasing applicant default probability for regulatory disclosure notices"
      },
      {
        "name": "Real-Time Underwriting Gateway",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Exposes HTTP scoring route returning credit decisions, default probabilities, and reason codes"
      }
    ],
    "data_flow": "Applicant financial attributes enter via HTTP POST to FastAPI; Feature Pipeline calculates WoE transformed vectors; XGBoost scores risk margins with monotonic constraints; Probability Calibration Layer maps margin to default probability; SHAP Explainer extracts top adverse contributing features; Gateway returns decision (APPROVE, REVIEW, DECLINE) with calibrated probability and top-3 reason codes.",
    "enforcement_mechanism": "Monotonic constraints enforced during tree building preventing higher income from increasing default probability; automated decision cutoffs routing high-risk applications to manual review."
  },
  "targets": [
    {
      "metric": "Model Discrimination Power (ROC-AUC)",
      "method": "5-fold stratified cross-validation evaluated on held-out test split with zero feature leakage",
      "input": "Labelled synthetic dataset of 10,000 credit applicant profiles with 2.8% historical default rate",
      "environment": "Standard 4-core local CPU, Python 3.11+",
      "minimum_pass": "ROC-AUC >= 0.74 on held-out test split",
      "target": "ROC-AUC >= 0.81 on held-out test split",
      "report": "Scikit-learn classification report and ROC curve plot export"
    },
    {
      "metric": "Probability Calibration Reliability (Brier Score)",
      "method": "Brier score calculation comparing calibrated predicted default probabilities against true outcomes",
      "input": "Held-out test split of 2,000 credit applications across all score deciles",
      "environment": "Standard 4-core local CPU, Scikit-learn CalibratedClassifierCV",
      "minimum_pass": "Brier score <= 0.14 across evaluation dataset",
      "target": "Brier score <= 0.09 across evaluation dataset",
      "report": "Reliability calibration curve plot and decile calibration table"
    },
    {
      "metric": "Real-Time Underwriting Decision Latency",
      "method": "Autocannon benchmark measuring duration of feature preprocessing, model scoring, and SHAP extraction",
      "input": "1,000 synthetic applicant requests sent across 10 concurrent HTTP clients",
      "environment": "Standard 4-core local CPU, local loopback network",
      "minimum_pass": "p95 decision latency < 45ms per applicant request",
      "target": "p95 decision latency < 22ms per applicant request",
      "report": "Benchmark latency distribution log and Locust percentile export"
    }
  ],
  "skills": ["Python", "XGBoost", "Scikit-learn", "SHAP", "FastAPI", "FinTech", "Machine Learning"],
  "starter_input": {
    "spec": "Tabular credit application dataset with financial attributes (income, debt-to-income, delinquencies, utilization) and default label.",
    "size": "10,000 synthetic applicant rows with 18 financial feature columns and binary default flag",
    "seeded_cases": "Extreme low debt applicants with delinquencies, zero-income outliers, missing credit utilization entries, and high-income applicants",
    "label_source": "Deterministic synthetic data generator using fixed seed 9912 modeling realistic credit distributions",
    "personal_data_policy": "Strictly synthetic financial attributes; zero real personal identifiable information, bank accounts, or SSNs used"
  },
  "components": [
    {"name": "Feature Engineering & Monotonic WoE Binning", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "XGBoost Model Training & Calibration", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "SHAP Explainability & Attribution Engine", "task_type": "evaluation dataset creation + scoring script", "hours": 4.0},
    {"name": "FastAPI Underwriting Decision API", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Fairness & Disparity Verification Script", "task_type": "security hardening checks", "hours": 3.0},
    {"name": "Documentation, Fairness Report & Buffer", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Dynamic population stability index (PSI) monitoring tracking feature drift over consecutive monthly batches",
      "Alternative cashflow time-series feature extractor analyzing simulated bank transaction streams"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Feature Engineering & Monotonic WoE Binning Pipeline",
      "hours": 8,
      "done_criterion": "Feature pipeline computes WoE transformations and enforces monotonic risk relationships."
    },
    {
      "name": "XGBoost Training, Machine Learning Calibration & Evaluation",
      "hours": 7,
      "done_criterion": "XGBoost model trains with monotonic constraints; Platt calibration achieves Brier score <= 0.14."
    },
    {
      "name": "SHAP Explainability & FastAPI FinTech Decision Gateway",
      "hours": 8,
      "done_criterion": "API endpoint scores applicants and returns top-3 SHAP adverse factor codes in < 45ms."
    },
    {
      "name": "Fairness Audit, Anti-Fake Test, Docs & Buffer",
      "hours": 6,
      "done_criterion": "Disparity audit verifies fairness metrics; anti-fake test validates dynamic applicant; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Python programming (Pandas, NumPy, Scikit-learn)",
    "Applied machine learning concepts (gradient boosting, cross-validation, ROC-AUC, calibration)",
    "Basic knowledge of credit underwriting metrics (debt-to-income, probability of default)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound tabular machine learning)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 installed",
    "fallback_path": "Logistic Regression with statsmodels if XGBoost installation encounters platform compiler issues"
  },
  "riskiest_component": {
    "name": "TreeSHAP Computation Latency on Complex Ensembles",
    "fallback": "Constrain XGBoost max_depth to 4 trees and evaluate fast TreeExplainer approximations"
  },
  "deliverables": [
    "Git repository containing training pipelines, calibrated model artifact, and FastAPI application",
    "Synthetic 10,000-applicant training and validation datasets",
    "Model card and explainability report documenting ROC-AUC, calibration curves, and SHAP distributions",
    "Screener verification script running scoring and dynamic applicant evaluation in under 2 minutes"
  ],
  "out_of_scope": [
    "Real-money credit underwriting or live credit card issuance",
    "Integration with licensed credit reporting bureaus",
    "Core banking payment ledger integration"
  ],
  "safety_note": None,
  "resources": [
    "XGBoost official documentation on monotonic constraints",
    "Scikit-learn probability calibration guide and Brier score documentation",
    "SHAP Python documentation for tree explainers and local attribution"
  ],
  "rubric": [
    {
      "input": "Synthetic dataset of 10,000 credit applicant profiles",
      "action": "Run python scripts/train_model.py",
      "expected_result": "Model trains with monotonic constraints and reports validation metrics",
      "evidence_location": "Training console execution log and artifacts/model.json",
      "pass_criterion": "Validation ROC-AUC is >= 0.74 with Platt calibration applied",
      "kind": "normal"
    },
    {
      "input": "Calibrated model artifact evaluated on held-out test split",
      "action": "Run python scripts/evaluate_calibration.py",
      "expected_result": "Script computes Brier score and generates reliability calibration curve",
      "evidence_location": "reports/calibration_summary.json and reliability_curve.png",
      "pass_criterion": "Calculated Brier score is <= 0.14 across all test deciles",
      "kind": "normal"
    },
    {
      "input": "Sample loan application payload POSTed to /underwrite endpoint",
      "action": "Execute curl -X POST -H 'Content-Type: application/json' -d @fixtures/applicant.json http://localhost:8000/underwrite",
      "expected_result": "API returns decision, calibrated default probability, and top-3 SHAP adverse factor codes in < 45ms",
      "evidence_location": "Terminal HTTP response payload",
      "pass_criterion": "HTTP status 200 with valid probability float and 3 distinct adverse factor reasons",
      "kind": "normal"
    },
    {
      "input": "Monotonicity verification script python scripts/verify_monotonicity.py",
      "action": "Evaluate risk predictions across synthetic applicant pairs with increasing debt-to-income",
      "expected_result": "Predicted probability of default monotonically increases as debt-to-income increases",
      "evidence_location": "Monotonicity verification report log",
      "pass_criterion": "0 monotonicity constraint violations detected across 1,000 synthetic test pairs",
      "kind": "normal"
    },
    {
      "input": "Dynamic applicant profile with heavily elevated revolving credit utilization generated at runtime",
      "action": "Run python scripts/verify_dynamic_applicant.py --utilization 95.5",
      "expected_result": "API evaluates applicant dynamically and identifies credit utilization as the #1 adverse factor",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Primary adverse reason code equals HIGH_REVOLVING_UTILIZATION with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected credit risk underwriting ML system in Python and FastAPI using XGBoost and SHAP; achieved [MODEL_AUC] ROC-AUC on a [TEST_SET_SIZE] applicant test split, calibrated default probabilities to [BRIER_SCORE] Brier score, and delivered top adverse factors with sub-[DECISION_LATENCY] decision latency.",
    "claims": [
      {
        "text": "achieved [MODEL_AUC] ROC-AUC on a [TEST_SET_SIZE] applicant test split",
        "rubric_indexes": [0]
      },
      {
        "text": "calibrated default probabilities to [BRIER_SCORE] Brier score",
        "rubric_indexes": [1]
      },
      {
        "text": "delivered top adverse factors with sub-[DECISION_LATENCY] decision latency",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "compliance with specific sovereign financial regulations or real-money lending decisions without licensed financial underwriting data"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a credit risk underwriting ML system using XGBoost with monotonic constraints, Platt probability calibration, and SHAP explainability served via FastAPI.",
    "q2": "Core path: WoE feature engineering, monotonic XGBoost model, probability calibration, SHAP adverse factors, and FastAPI underwriting endpoint (29h). Extended path: population stability index (PSI) and cashflow time-series models (+14h).",
    "q3": "Components: Feature Pipeline (5h), XGBoost Training (5h), SHAP Explainability (4h), FastAPI API (4h), Fairness Audit (3h), Docs & Buffer (4h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: ML training, Data analysis/BI. Metrics: ROC-AUC, Brier Score, Underwriting Decision Latency. Rejected: search recall at k (not a recommendation system).",
    "q5": "Hard parts: class imbalance handling, monotonic constraint enforcement, probability calibration, and fast TreeSHAP extraction.",
    "q6": "Starter input: 10,000 synthetic credit applicant records with 18 financial features and binary default labels with seed 9912. No real PII.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: Logistic Regression with statsmodels.",
    "q8": "Riskiest component: TreeSHAP calculation latency. Fallback: constrain tree depth to 4.",
    "q9": "Potential faking: hardcoded mock reason codes. Anti-fake check 5 injects an applicant with 95.5% utilization at runtime and asserts utilization is identified as top adverse factor.",
    "q10": "Safety/ethics: Safe; synthetic credit application data only; includes disclaimer forbidding real-money underwriting without regulatory compliance."
  }
}

b12_old_diag = """
- **Old Title**: Credit Risk Scoring & Loan Underwriting ML System
- **Domain**: FinTech Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Slice, KreditBee, EarlySalary, Navi, and MoneyTap', 'BNPL companies (LazyPay, Simpl)', 'FinTech ML roles at Slice, Navi, top tech platforms')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.60 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an ML financial risk model with generic web-service throughput targets.
2. **Heavy employer marketing list**:
   > "Slice, KreditBee, EarlySalary, Navi, and MoneyTap are all building alternative credit models in India. RBI guidelines require explainable AI for credit decisions. BNPL companies (LazyPay, Simpl) need this..."
"""

b12_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Scikit-learn and XGBoost at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. ROC-AUC (>= 0.74) and Brier score (<= 0.14) evaluated directly on held-out test split.",
    "Is there a CPU/local/free fallback?": "YES. Logistic regression with statsmodels if XGBoost installation encounters issues.",
    "Can test data be created in minutes?": "YES. Synthetic 10,000-applicant financial dataset provided with fixed seed 9912.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full model evaluation and dynamic applicant check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. ROC-AUC discrimination, Brier score calibration, and monotonicity constraint verification are unique to credit risk ML.",
    "Is every bullet claim verified by rubric?": "YES. ROC-AUC verified by Check 1; Brier score verified by Check 2; decision latency verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] generates dynamic applicant with 95.5% utilization and asserts adverse reason code.",
    "Are all terms accurate?": "YES. Accurately covers monotonic constraints, Platt scaling, Brier score, and TreeSHAP attribution.",
    "Does problem statement promise only what is verified?": "YES. Feature engineering, monotonic tree training, probability calibration, and SHAP explainability are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic financial attributes; disclaimer forbidding real-money underwriting without compliance.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering class imbalance, monotonic constraints, probability calibration, and TreeSHAP latency."
}

b12_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split population stability index (PSI) and cashflow time-series to Extended Path (+14h).
- Target Realism: Eliminated generic web-service targets; replaced with authentic credit scoring metrics (ROC-AUC discrimination, Brier score calibration, and real-time decision latency).
- Removed Banned Content: Removed all mentions of Slice, KreditBee, EarlySalary, Navi, MoneyTap, LazyPay, and Simpl.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic applicant test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [MODEL_AUC], [TEST_SET_SIZE], [BRIER_SCORE], and [DECISION_LATENCY] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 13. brief-data-quality-framework
# ==============================================================================
b13_data = {
  "id": "brief-data-quality-framework",
  "title": "Automated Data Quality Monitoring & Anomaly Detection",
  "domain": "Data Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Data pipeline/ETL/streaming", "CLI/tools/libraries"],
  "problem": "Modern analytical and machine learning data pipelines suffer from silent data corruption when upstream schemas drift, values violate business domain constraints, or statistical distributions shift unexpectedly. Undetected corrupted data propagates through downstream warehouses and dashboards, producing flawed metrics and erroneous automated business decisions. This project implements an automated, declarative data quality monitoring and anomaly detection engine in Python and DuckDB that validates dataset contracts, checks referential integrity, detects statistical outliers and distribution shifts, and enforces automated blocking gates before pipeline loading.",
  "use_cases": [
    "Automated data contract enforcement on daily batch data warehouse ingestion tables",
    "Pre-training data validation for machine learning feature stores preventing corrupt inputs",
    "Continuous schema drift and anomaly detection on third-party API data sync pipelines"
  ],
  "hard_parts": [
    "Executing complex declarative validation rules across hundreds of thousands of rows within sub-second execution limits",
    "Calculating statistical distribution drift metrics (Wasserstein distance, z-scores) without loading entire datasets into memory",
    "Preventing false positive alerts on legitimate seasonal or high-variance data spikes",
    "Designing fail-fast blocking ingestion gates that halt downstream jobs while outputting actionable failure diagnostics"
  ],
  "screener_signals": [
    "Declarative YAML contract parser validating column types, nullability, uniqueness, and custom SQL expressions",
    "High-speed analytical validation engine executing inside DuckDB without external database dependencies",
    "Anti-fake verification script injecting dynamic anomalous rows at runtime and asserting automated gate blockage"
  ],
  "job_families": [
    "Data Reliability Engineer",
    "Data Platform Engineer",
    "Analytics Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "core framework implementation language, CLI runner, and statistical profiling logic"},
    {"tool": "DuckDB", "role": "in-process vectorized SQL analytical engine executing high-speed quality checks"},
    {"tool": "Pandas", "role": "tabular data manipulation and statistical metric calculation framework"},
    {"tool": "SQL", "role": "declarative rule formulation language checking domain invariants and aggregates"},
    {"tool": "Docker", "role": "containerized environment packaging runtime dependencies and test datasets"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Contract Specification Parser",
        "tools_used": ["Python"],
        "purpose": "Parses YAML data contract definitions, validating column constraints, rules, and alert thresholds"
      },
      {
        "name": "DuckDB Validation Engine",
        "tools_used": ["DuckDB", "SQL"],
        "purpose": "Executes vectorized SQL queries evaluating completeness, freshness, uniqueness, and referential checks"
      },
      {
        "name": "Statistical Anomaly Profiler",
        "tools_used": ["Python", "Pandas"],
        "purpose": "Computes historical baseline metrics, z-score outlier bounds, and distribution drift distances"
      },
      {
        "name": "Pipeline Ingestion Blocking Gate",
        "tools_used": ["Python"],
        "purpose": "Evaluates contract results, emits exit codes, and blocks downstream pipeline execution on severe breaches"
      },
      {
        "name": "Diagnostics & Alert Dispatcher",
        "tools_used": ["Python"],
        "purpose": "Generates structured JSON and markdown reports detailing failing row samples and column summaries"
      }
    ],
    "data_flow": "Data pipeline triggers the validation CLI passing a dataset path and a YAML contract; the Contract Parser loads rule definitions; DuckDB scans the target Parquet or CSV file directly; vectorized SQL assertions execute in parallel; the Statistical Profiler compares current summary statistics against historical baselines; if all checks pass, the CLI returns exit code 0; if any critical rule fails, the Blocking Gate returns exit code 1 and outputs failing row diagnostics.",
    "enforcement_mechanism": "CLI non-zero exit codes halting orchestrator pipelines; strict schema assertions rejecting unmapped or invalidly typed columns."
  },
  "targets": [
    {
      "metric": "Seeded Quality Defect Detection Rate",
      "method": "Execution of validation suite across benchmark dataset with 20 intentionally injected data defects",
      "input": "Dataset of 200,000 rows containing 20 injected defects (nulls, range violations, regex mismatch, duplicates)",
      "environment": "Standard 4-core local CPU, Python 3.11+",
      "minimum_pass": "Detection of 20 of 20 injected defects with 0 false negatives",
      "target": "Detection of 20 of 20 injected defects with 0 false negatives",
      "report": "Validation execution report listing detected rule breaches and row indexes"
    },
    {
      "metric": "Dataset Validation Execution Latency",
      "method": "Wall-clock execution duration to run 15 comprehensive quality checks on tabular dataset",
      "input": "250,000 tabular records stored in Parquet format evaluated with 15 SQL contract rules",
      "environment": "Standard 4-core local CPU, DuckDB in-memory execution",
      "minimum_pass": "Execution completes in < 4.5 seconds across 250,000 rows",
      "target": "Execution completes in < 2.2 seconds across 250,000 rows",
      "report": "Benchmark execution timing log reporting per-rule execution durations"
    },
    {
      "metric": "False Positive Violation Rate on Clean Baseline",
      "method": "Validation of verified clean historical baseline dataset against configured quality contract",
      "input": "50,000 verified clean tabular rows matching expected production distributions",
      "environment": "Standard 4-core local CPU, Python 3.11+",
      "minimum_pass": "0 false positive rule violations reported on verified clean dataset",
      "target": "0 false positive rule violations reported on verified clean dataset",
      "report": "Validation output summary confirming clean pass"
    }
  ],
  "skills": ["Python", "DuckDB", "Pandas", "SQL", "Docker", "Data Quality", "Data Engineering"],
  "starter_input": {
    "spec": "YAML data contract specification file and e-commerce transactions dataset in CSV/Parquet format.",
    "size": "250,000 transaction rows with 12 columns (transaction_id, customer_id, amount, timestamp, status, country)",
    "seeded_cases": "Negative transaction amounts, future timestamps, null customer IDs, invalid country codes, and duplicate transaction IDs",
    "label_source": "Deterministic test fixture generation script injecting exact defect rows at known indices",
    "personal_data_policy": "Strictly mock synthetic e-commerce transaction data; zero real customer or financial details used"
  },
  "components": [
    {"name": "YAML Contract Parser & Rule Engine", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "DuckDB SQL Validation Engine", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Statistical Anomaly & Drift Profiler", "task_type": "evaluation dataset creation + scoring script", "hours": 5.0},
    {"name": "Blocking Ingestion Gate & Reporter", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "Benchmark Harness with Dirty Data", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Architecture Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Automated Slack and PagerDuty notification integration with interactive alert acknowledge buttons",
      "Automated Great Expectations and dbt-expectations contract importer and exporter"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Declarative Schema Contracts & DuckDB Rule Engine for Data Quality",
      "hours": 8,
      "done_criterion": "Parser loads YAML contracts; DuckDB executes null, range, uniqueness, and regex checks."
    },
    {
      "name": "Statistical Profiling & Distributional Drift Detection in Data Engineering",
      "hours": 7,
      "done_criterion": "Profiler computes summary statistics and flags z-score outliers and distribution shifts."
    },
    {
      "name": "Automated Blocking Gate, Docker Setup & Alert Dispatcher",
      "hours": 8,
      "done_criterion": "CLI returns exit code 1 and outputs failed row samples when quality rules are violated."
    },
    {
      "name": "Dirty Data Invariant Testing, Anti-Fake Check & Buffer",
      "hours": 6,
      "done_criterion": "Benchmark confirms 20 of 20 defects detected in < 4.5s; anti-fake test validates dynamic row injection; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Python programming (Pandas, type hints, pytest)",
    "Strong SQL aggregation and analytical querying skills",
    "Familiarity with data pipeline orchestration principles (DAGs, tasks, exit codes)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound in-process SQL execution)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and DuckDB installed",
    "fallback_path": "In-memory SQLite execution engine without DuckDB if local DuckDB binaries encounter architecture issues"
  },
  "riskiest_component": {
    "name": "Memory Exhaustion During In-Memory Parquet Scans",
    "fallback": "Leverage DuckDB streaming chunk execution (PRAGMA memory_limit) to bound RAM consumption to 1GB"
  },
  "deliverables": [
    "Git repository containing Python data quality framework, CLI executable, and DuckDB runner",
    "Sample declarative YAML contracts defining rules for tabular datasets",
    "Benchmark script verifying defect detection rate and execution speed across 250,000 rows",
    "Screener verification script executing automated validation in under 2 minutes"
  ],
  "out_of_scope": [
    "Distributed Apache Spark cluster execution",
    "Real-time streaming quality validation on Kafka topics",
    "Automated data cleaning and synthetic value imputation"
  ],
  "safety_note": None,
  "resources": [
    "DuckDB SQL documentation and analytical query performance guide",
    "Data Contracts architecture principles and specification guidelines",
    "Scipy statistical distances and drift detection documentation"
  ],
  "rubric": [
    {
      "input": "data/dirty_transactions.parquet with 20 injected defects",
      "action": "Run python -m dq_framework check --contract contracts/ecommerce.yaml --data data/dirty_transactions.parquet",
      "expected_result": "Validation engine halts execution, returns exit code 1, and reports all 20 failing rule assertions",
      "evidence_location": "Terminal execution output log and reports/dq_run.json",
      "pass_criterion": "Exit code 1 with exactly 20 distinct failure records reported",
      "kind": "normal"
    },
    {
      "input": "Benchmark test running 15 quality checks across 250,000 rows",
      "action": "Run python scripts/benchmark_speed.py",
      "expected_result": "DuckDB executes all 15 checks in < 4.5 seconds",
      "evidence_location": "Benchmark summary console table",
      "pass_criterion": "Total execution latency is < 4.5 seconds on local machine",
      "kind": "normal"
    },
    {
      "input": "data/clean_transactions.parquet baseline dataset",
      "action": "Run python -m dq_framework check --contract contracts/ecommerce.yaml --data data/clean_transactions.parquet",
      "expected_result": "Validation engine confirms all rules pass with zero violations",
      "evidence_location": "Terminal stdout execution log",
      "pass_criterion": "Exit code 0 with 0 rule violations reported",
      "kind": "normal"
    },
    {
      "input": "Synthetically skewed dataset with shifted amount distribution",
      "action": "Run python -m dq_framework drift --baseline data/clean.parquet --target data/skewed.parquet",
      "expected_result": "Profiler flags significant distribution drift on amount column",
      "evidence_location": "Drift analysis output report",
      "pass_criterion": "Drift detected with calculated distance exceeding configured threshold and warning logged",
      "kind": "normal"
    },
    {
      "input": "Dynamic anomalous row with negative order amount (-999.00) injected at runtime by verification script",
      "action": "Run python scripts/verify_dynamic_quality.py --amount -999.00",
      "expected_result": "Engine detects injected negative amount, triggers rule NEGATIVE_AMOUNT_VIOLATION, and blocks ingestion",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Exit code 1 with report pinpointing dynamic row index and rule violation",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected automated data quality monitoring engine in Python and DuckDB; executed declarative schema contracts across [ROW_COUNT] rows in under [VALIDATION_TIME], detected [DEFECT_COUNT] of [TOTAL_DEFECTS] injected quality defects, and enforced automated pipeline ingestion blocking gates.",
    "claims": [
      {
        "text": "executed declarative schema contracts across [ROW_COUNT] rows in under [VALIDATION_TIME]",
        "rubric_indexes": [1]
      },
      {
        "text": "detected [DEFECT_COUNT] of [TOTAL_DEFECTS] injected quality defects",
        "rubric_indexes": [0]
      },
      {
        "text": "enforced automated pipeline ingestion blocking gates",
        "rubric_indexes": [0, 4]
      }
    ],
    "do_not_claim": "petabyte streaming data observability or universal enterprise metadata governance without committed cluster benchmarks"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds an automated declarative data quality engine in Python and DuckDB that validates dataset contracts, checks referential integrity, detects statistical drift, and enforces automated pipeline blocking gates.",
    "q2": "Core path: YAML contract parser, DuckDB SQL validation runner, statistical drift profiler, and blocking ingestion gate (29h). Extended path: Slack/PagerDuty alerts and Great Expectations importer/exporter (+14h).",
    "q3": "Components: Contract Parser (5h), DuckDB Engine (4h), Drift Profiler (5h), Blocking Gate (4h), Dirty Data Benchmark (4h), Docs & Buffer (3h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: Data pipeline/ETL/streaming, CLI/tools/libraries. Metrics: Seeded Quality Defect Detection Rate, Dataset Validation Execution Latency, False Positive Rate on Clean Baseline. Rejected: model prediction accuracy.",
    "q5": "Hard parts: executing complex declarative SQL across large files efficiently, distribution drift calculation without memory bloat, tuning outlier thresholds, and fail-fast pipeline gating.",
    "q6": "Starter input: 250,000 transaction rows with 12 columns and 20 injected defects at known row indices. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory SQLite if DuckDB encounters issues.",
    "q8": "Riskiest component: Memory bloat on large Parquet scans. Fallback: DuckDB PRAGMA memory_limit.",
    "q9": "Potential faking: hardcoded pass/fail reports. Anti-fake check 5 appends a dynamic row with negative order amount at runtime and asserts blocking gate failure.",
    "q10": "Safety/ethics: Safe; synthetic e-commerce transaction data only."
  }
}

b13_old_diag = """
- **Old Title**: Automated Data Quality Monitoring & Anomaly Detection
- **Domain**: Data Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'top tech platforms, top tech platforms, top tech platforms', 'Monte Carlo, Great Expectations, and dbt', 'highly paid and in-demand')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an analytical data quality framework with generic web-service throughput targets.
2. **Extreme marketing duplication**:
   > "Every data team at a mature tech company (top tech platforms, top tech platforms, top tech platforms) runs data quality checks... a highly paid and in-demand role."
"""

b13_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using DuckDB and Python at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Validation execution speed (< 4.5s on 250k rows) and 20 of 20 defect detections measured directly on local CPU.",
    "Is there a CPU/local/free fallback?": "YES. In-memory SQLite execution engine without DuckDB if binaries fail.",
    "Can test data be created in minutes?": "YES. Synthetic 250,000 transaction dataset with 20 injected defects provided via script.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full validation and dynamic defect check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Quality defect detection rate, DuckDB validation execution speed, and clean baseline false positive rates are unique to data quality frameworks.",
    "Is every bullet claim verified by rubric?": "YES. Execution speed verified by Check 2; defect count verified by Check 1; blocking gate verified by Check 1 & 5.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic negative amount row at runtime and asserts blocking gate failure.",
    "Are all terms accurate?": "YES. Accurately covers declarative contracts, DuckDB vectorized SQL, distribution drift, and pipeline blocking gates.",
    "Does problem statement promise only what is verified?": "YES. Contract parsing, SQL assertions, drift profiling, and automated blocking gates are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic e-commerce transaction data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering declarative rule performance, distribution drift without memory bloat, false positive tuning, and fail-fast gating."
}

b13_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split Slack/PagerDuty alerts and Great Expectations exporter to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic data quality metrics (seeded defect detection rate, validation execution latency, and clean baseline false positive rate).
- Removed Banned Content: Removed 'top tech platforms' triple duplication and 'highly paid and in-demand' claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic defect check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ROW_COUNT], [VALIDATION_TIME], [DEFECT_COUNT], and [TOTAL_DEFECTS] with strict 'Do not claim' boundary.
"""

def run_part2_all():
    res9 = process_brief(b9_data, b9_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 6.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True}, b9_reviewer, b9_changelog)
    res10 = process_brief(b10_data, b10_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 4.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b10_reviewer, b10_changelog)
    res11 = process_brief(b11_data, b11_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b11_reviewer, b11_changelog)
    res12 = process_brief(b12_data, b12_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 4.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b12_reviewer, b12_changelog)
    res13 = process_brief(b13_data, b13_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b13_reviewer, b13_changelog)
    return [res9, res10, res11, res12, res13]

if __name__ == "__main__":
    results = run_part2_all()
    print("Part 2 all finished successfully:", results)

