import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_batch_1 import process_brief

# ==============================================================================
# 4. brief-api-sdk-design
# ==============================================================================
b4_data = {
  "id": "brief-api-sdk-design",
  "title": "Developer-First API SDK with Type Safety & Auto-Generation",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["CLI/tools/libraries", "API/backend"],
  "problem": "Integrating REST APIs without strongly-typed client libraries forces engineering teams to write repetitive HTTP boilerplate, maintain fragile interface declarations, and handle network failures in an ad-hoc manner. When backend API schemas evolve, unsynchronized frontend and backend codebases fail silently at runtime rather than at compile time. This project builds a code-generation pipeline and runtime SDK engine that parses OpenAPI 3.0 specifications into idiomatic TypeScript client packages, featuring request authentication, exponential retry logic with jitter, local sandbox mocking, and dual CommonJS and ECMAScript module distribution bundles.",
  "use_cases": [
    "Enterprise developer platforms publishing typed client packages for public REST APIs",
    "Internal microservice communication libraries ensuring synchronized API contract types",
    "Offline-capable developer testing sandboxes using schema-compliant mock responses"
  ],
  "hard_parts": [
    "Resolving recursive schema references and circular dependencies in OpenAPI documents without stack overflow errors",
    "Translating complex schema compositions into idiomatic TypeScript discriminated unions without falling back to any types",
    "Ensuring dual CommonJS and ECMAScript module compatibility with clean declaration maps across different bundlers",
    "Implementing exponential backoff with full jitter to avoid thundering herd retry storms against rate-limited backends"
  ],
  "screener_signals": [
    "Clean CLI tool parsing OpenAPI specifications and emitting modular TypeScript source files",
    "Zero compile-time errors under tsc strict mode with zero occurrences of the any type keyword",
    "Vitest test suite validating automated retries, mock interceptors, and dual-module resolution"
  ],
  "job_families": [
    "Developer Experience Engineer",
    "API Platform Engineer",
    "Full-Stack Software Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language for code generation AST and emitted client library"},
    {"tool": "Node.js", "role": "runtime environment executing the CLI generator and test harnesses"},
    {"tool": "tsup", "role": "esbuild-powered bundler producing dual CommonJS and ESM artifacts with types"},
    {"tool": "Vitest", "role": "fast unit test framework verifying client runtime behavior and mocking"},
    {"tool": "MSW", "role": "Mock Service Worker simulating upstream HTTP error codes and latency in tests"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Spec Parser & AST Normalizer",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Parses YAML and JSON OpenAPI specifications, dereferences pointers, and builds an intermediate representation"
      },
      {
        "name": "TypeScript Code Generator",
        "tools_used": ["TypeScript"],
        "purpose": "Emits strongly-typed API client classes, parameter interfaces, and discriminated union response types"
      },
      {
        "name": "Resilient Runtime Client",
        "tools_used": ["TypeScript", "Vitest"],
        "purpose": "Executes HTTP requests with interceptors for authentication, idempotency keys, and exponential backoff retry"
      },
      {
        "name": "Offline Mock Sandbox",
        "tools_used": ["TypeScript", "MSW"],
        "purpose": "Intercepts outbound SDK calls and returns schema-compliant mock payloads during local development"
      },
      {
        "name": "Library Packaging Pipeline",
        "tools_used": ["tsup"],
        "purpose": "Compiles generated TypeScript files into tree-shakeable CJS and ESM distributions with sourcemaps"
      }
    ],
    "data_flow": "The CLI parses OpenAPI specifications into an intermediate model; the code generator emits TypeScript interfaces and client classes; developers initialize the SDK client; runtime interceptors attach authorization headers and telemetry; native fetch executes HTTP requests; if a transient error occurs, exponential backoff retries the request; responses deserialize into validated typed objects.",
    "enforcement_mechanism": "Strict compile-time type verification via tsc --noEmit; runtime response status checks that throw structured API exceptions."
  },
  "targets": [
    {
      "metric": "SDK Code Generation Latency",
      "method": "Benchmark measuring wall-clock duration to parse specification and emit full client source files",
      "input": "Petstore OpenAPI 3.0 specification fixture containing 30 REST endpoints and 20 schema models",
      "environment": "Standard 4-core local CPU, Node.js 18+",
      "minimum_pass": "Generation completes in < 8.0 seconds",
      "target": "Generation completes in < 3.5 seconds",
      "report": "Console benchmark timing summary log"
    },
    {
      "metric": "Type System Strictness Verification",
      "method": "Execution of tsc --noEmit --strict on emitted client source code",
      "input": "Entire generated client codebase across all endpoints, models, and union types",
      "environment": "Standard local CPU, TypeScript 5.0+",
      "minimum_pass": "Passes with 0 type diagnostics and 0 occurrences of any keyword",
      "target": "Passes with 0 type diagnostics and 0 occurrences of any keyword",
      "report": "tsc compiler output log confirming clean compilation"
    },
    {
      "metric": "Transient Fault Retry Recovery Rate",
      "method": "Vitest test suite executing simulated requests against MSW injecting transient 429 and 503 status codes",
      "input": "50 consecutive requests with injected 40% transient failure rate on initial attempts",
      "environment": "Standard 4-core local CPU, Vitest test runner",
      "minimum_pass": "Recovery rate >= 90% across 50 test requests with exponential backoff",
      "target": "Recovery rate >= 98% across 50 test requests with exponential backoff",
      "report": "Vitest test execution report with retry timing trace logs"
    }
  ],
  "skills": ["TypeScript", "Node.js", "tsup", "Vitest", "MSW", "REST APIs", "Packaging"],
  "starter_input": {
    "spec": "Collection of OpenAPI 3.0 specification files containing path items, parameters, request bodies, and polymorphic responses.",
    "size": "3 specification files ranging from small (5 endpoints) to comprehensive (30 endpoints and 25 schema models)",
    "seeded_cases": "Circular reference pointers, allOf inheritance schemas, optional query parameters, and 429 rate limit responses",
    "label_source": "Standardized OpenAPI 3.0 test fixtures validated via official swagger-parser",
    "personal_data_policy": "Strictly mock synthetic API models (synthetic products and users); zero real personal data used"
  },
  "components": [
    {"name": "OpenAPI Parser & AST Normalizer", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "TypeScript Code Generator Engine", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Resilient Runtime Client & Retries", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Offline Mock Sandbox & MSW Setup", "task_type": "one third-party integration", "hours": 4.0},
    {"name": "Dual CJS and ESM Packaging Pipeline", "task_type": "repo + tooling setup", "hours": 4.0},
    {"name": "Documentation, Schema Diagrams & Buffer", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Automated SDK release workflow publishing versioned packages to private npm registry",
      "Server-Sent Events streaming client generation for real-time AI and webhook event streams"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "Spec Parser & Intermediate AST Normalization for REST APIs",
      "hours": 8,
      "done_criterion": "CLI tool loads YAML and JSON OpenAPI specs, dereferences pointers, and validates AST structure in unit tests."
    },
    {
      "name": "TypeScript Client Code Generator",
      "hours": 7,
      "done_criterion": "Generator outputs TypeScript client code passing tsc --strict with zero any escape hatches."
    },
    {
      "name": "Resilient Runtime Client & Mock Sandbox with Vitest",
      "hours": 8,
      "done_criterion": "Runtime wraps fetch with exponential jitter retries and passes MSW offline mock integration tests in Vitest."
    },
    {
      "name": "Packaging Pipeline, Anti-Fake Test, Docs & Buffer",
      "hours": 6,
      "done_criterion": "tsup builds working CJS and ESM packages; anti-fake test validates dynamic spec generation; documentation complete."
    }
  ],
  "prerequisites": [
    "Advanced TypeScript concepts (generics, template literals, discriminated unions)",
    "Familiarity with REST APIs and HTTP specifications",
    "Basic knowledge of Node.js package bundling and npm module formats"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound code generation)",
    "cost": "$0 (fully open-source toolchain)",
    "accounts_keys_quotas": "No external cloud accounts or paid API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+ and npm installed",
    "fallback_path": "Standard tsc compile mode without tsup bundling if local build tools encounter native binding issues"
  },
  "riskiest_component": {
    "name": "Circular Reference Dereferencing in Nested Schemas",
    "fallback": "Implement lazy type reference getters using TypeScript type alias indirection rather than inlining schemas"
  },
  "deliverables": [
    "Git repository containing CLI generator, runtime core, and test fixture suites",
    "Emitted client package demonstrating CJS and ESM import compatibility",
    "Vitest test suite covering schema compilation, retry resilience, and mock interceptors",
    "Screener verification script executing generation and validation in under 2 minutes"
  ],
  "out_of_scope": [
    "GraphQL client code generation",
    "gRPC protobuf code generation",
    "Native mobile iOS and Android SDK generation"
  ],
  "safety_note": None,
  "resources": [
    "OpenAPI 3.0.3 specification standard reference documentation",
    "TypeScript official handbook on conditional and template literal types",
    "tsup bundling documentation for dual-module library authors"
  ],
  "rubric": [
    {
      "input": "fixtures/petstore.json specification file",
      "action": "Run npm run generate -- --input fixtures/petstore.json --output ./generated",
      "expected_result": "CLI parses spec and writes complete TypeScript client files without error",
      "evidence_location": "Terminal output and generated directory file tree",
      "pass_criterion": "Exit code 0 and presence of generated index.ts and api.ts files",
      "kind": "normal"
    },
    {
      "input": "Generated client codebase in ./generated directory",
      "action": "Run npx tsc --noEmit --project ./generated/tsconfig.json",
      "expected_result": "TypeScript compiler validates all declarations with zero errors",
      "evidence_location": "Terminal compilation log output",
      "pass_criterion": "Exit code 0 with zero type diagnostics reported",
      "kind": "normal"
    },
    {
      "input": "MSW mock handler injecting consecutive 429 status codes",
      "action": "Run npm run test:retries",
      "expected_result": "SDK executes retry loop with exponential backoff and succeeds on 3rd attempt",
      "evidence_location": "Vitest test execution console log",
      "pass_criterion": "Retry assertions pass confirming 3 attempts made before resolution",
      "kind": "normal"
    },
    {
      "input": "Dual module import test script testing CJS require and ESM import",
      "action": "Run npm run test:packaging",
      "expected_result": "Both node require('./dist/index.cjs') and import('./dist/index.js') resolve correctly",
      "evidence_location": "Packaging test execution log",
      "pass_criterion": "Both import methods instantiate client instance with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic OpenAPI specification with random endpoint path and custom model created at runtime",
      "action": "Run npm run test:anti-fake -- --seed 7712",
      "expected_result": "Generator parses dynamic spec, produces typed endpoint method, and executes successful mock call",
      "evidence_location": "Anti-fake test console output log",
      "pass_criterion": "Dynamic method invocation compiles and returns expected mock data with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected schema-driven TypeScript API SDK generator from OpenAPI specifications; achieved strict compile-time type safety across [OPERATION_COUNT] operations, sub-[GENERATION_TIME] generation speed, and resilient runtime client with jittered retries.",
    "claims": [
      {
        "text": "strict compile-time type safety across [OPERATION_COUNT] operations",
        "rubric_indexes": [1]
      },
      {
        "text": "sub-[GENERATION_TIME] generation speed",
        "rubric_indexes": [0]
      },
      {
        "text": "resilient runtime client with jittered retries",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "universal protocol code generation or automated breaking change resolution without committed AST test logs"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a TypeScript code generator that transforms OpenAPI specs into typed client packages featuring retry interceptors, mock sandboxing, and dual CJS/ESM bundling.",
    "q2": "Core path: AST normalizer, TypeScript code generator, resilient runtime client, mock sandbox, and tsup packaging (29h). Extended path: automated npm publish workflow and SSE streaming client (+12h).",
    "q3": "Components: Parser (5h), Generator (4h), Runtime Client (4h), Mock Sandbox (4h), Packaging (4h), Docs & Buffer (4h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: CLI/tools/libraries, API/backend. Metrics: Code Generation Latency, Type System Strictness, Transient Fault Retry Recovery. Rejected: high-concurrency gateway throughput (it's a client SDK generator, not a proxy server).",
    "q5": "Hard parts: circular $ref dereferencing, discriminated union synthesis, dual CJS/ESM module compatibility, and exponential jitter retry calibration.",
    "q6": "Starter input: 3 OpenAPI specification files (5 to 30 endpoints) containing recursive references, inheritance schemas, and rate limit definitions. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: standard tsc compiler mode without tsup.",
    "q8": "Riskiest component: Circular schema dereferencing. Fallback: lazy type reference indirection.",
    "q9": "Potential faking: pre-generated static TypeScript files. Anti-fake check 5 accepts dynamic OpenAPI spec at runtime and compiles and executes custom typed methods on the fly.",
    "q10": "Safety/ethics: Not required for client SDK code generation."
  }
}

b4_old_diag = """
- **Old Title**: Developer-First API SDK with Type Safety & Auto-Generation
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 35 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of implementation; ungrounded stated hours without task breakdown.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 4.5 / 10 (missing 5 fields, no anti-fake check)
- Technical Accuracy: 6.0 / 10 (targets lack 7 fields, claimed '100% strict type safety with 0 any types' using absolute words)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 7.0 / 10 (no direct salary claims, but exaggerated marketing language)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.72 / 10 (Band C)

### Problems Found (with exact quotes)
1. **Absolute words in targets**:
   > "Strict Type Coverage: 100% strict type safety with 0 any types verified via tsc --strict"
   *Flaw*: Targets used absolute language ('100%') and lacked reference environments and report formats.
2. **Missing operational sections**:
   *Flaw*: Missing `TARGET APPLICATION / STARTER INPUT`, `MILESTONES`, `DELIVERABLES`, `PREREQUISITES, ENVIRONMENT AND ACCOUNTS`, `OUT OF SCOPE`, and `LEARNING RESOURCES`.
3. **No Anti-Fake Verification**:
   *Flaw*: Screener checks tested static fixtures that could be hardcoded without building a real code generator.
"""

b4_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours; environment requires only local Node.js and TypeScript on 8GB RAM at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Generation latency is bounded at < 8.0s on Petstore spec; retry recovery is evaluated against MSW injected faults.",
    "Is there a CPU/local/free fallback?": "YES. Standard tsc compile mode without tsup bundling if local bundler bindings fail.",
    "Can test data be created in minutes?": "YES. Standard OpenAPI 3.0 specification fixtures provided in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Verification script runs full generation, type checks, and retry tests in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. OpenAPI parsing duration, tsc strict mode compilation, and jittered HTTP retry recovery are specific to SDK generators.",
    "Is every bullet claim verified by rubric?": "YES. Type safety verified by Check 2; generation speed verified by Check 1; retries verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] generates and validates client code from a dynamic runtime specification.",
    "Are all terms accurate?": "YES. Accurately covers OpenAPI 3.0, AST normalization, discriminated unions, and dual CJS/ESM bundling.",
    "Does problem statement promise only what is verified?": "YES. Spec parsing, type-safe generation, retry runtime, and bundling are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strict synthetic mock API data policy.",
    "Are all hard parts technical?": "YES. 4 detailed technical challenges covering circular references, discriminated unions, module compatibility, and retry storms."
}

b4_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split private npm publishing and SSE streaming to Extended Path (+12h).
- Scale Targets: Replaced absolute 100% claims with 7-field targets (generation latency, strict compile verification, and retry recovery rate).
- Verification: Added 5 concrete rubric checks including dynamic spec anti-fake test.
- Completeness: Added complete Starter Input spec, 4 milestones summing to 29h, environment specs, and learning resources.
- Resume Formula: Structured with Google X-Y-Z formula using measured placeholders [OPERATION_COUNT], [GENERATION_TIME] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 5. brief-blockchain-defi
# ==============================================================================
b5_data = {
  "id": "brief-blockchain-defi",
  "title": "DeFi Lending Protocol Smart Contract on Ethereum",
  "domain": "Blockchain & Web3",
  "difficulty": "ADVANCED",
  "project_types": ["Blockchain/smart contracts"],
  "problem": "Traditional financial lending requires credit scoring intermediaries, physical collateral appraisals, and centralized custody. Decentralized finance protocols enable permissionless overcollateralized lending through autonomous smart contracts that adjust borrowing interest rates algorithmically and enforce liquidations when collateral valuations drop. Developing robust lending protocols requires mitigating critical vulnerabilities such as reentrancy exploits, flash loan price manipulation, rounding errors, and gas exhaustion while maintaining deterministic financial invariants.",
  "use_cases": [
    "Algorithmic crypto-asset lending with dynamic supply and borrow interest rate curves",
    "Overcollateralized stablecoin borrowing against cryptocurrency reserve assets",
    "Automated collateral liquidation bots monitoring position health factors via price oracles"
  ],
  "hard_parts": [
    "Preventing reentrancy vulnerabilities across state mutations and external token transfers using the checks-effects-interactions pattern",
    "Formulating the Jump Rate interest model using integer fixed-point arithmetic without precision loss or overflow",
    "Securing liquidation transactions against oracle manipulation and front-running via staleness threshold checks",
    "Minimizing gas consumption across high-frequency deposit, borrow, and liquidation execution paths"
  ],
  "screener_signals": [
    "Comprehensive Hardhat test suite with mainnet fork tests simulating price drop liquidations",
    "Automated Slither static analysis report confirming zero high or critical security vulnerabilities",
    "Gas consumption report generated via hardhat-gas-reporter establishing bounded execution costs"
  ],
  "job_families": [
    "Smart Contract Engineer",
    "Blockchain Security Engineer",
    "Web3 Protocol Developer"
  ],
  "stack": [
    {"tool": "Solidity", "role": "smart contract implementation language enforcing EVM state transitions"},
    {"tool": "Hardhat", "role": "local Ethereum development environment, compiler, and test runner"},
    {"tool": "Ethers.js", "role": "client library for interacting with deployed EVM contracts in tests"},
    {"tool": "OpenZeppelin", "role": "audited base contracts providing ReentrancyGuard and ERC20 interfaces"},
    {"tool": "Slither", "role": "static analysis framework detecting common smart contract security flaws"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Lending Pool Core Contract",
        "tools_used": ["Solidity", "OpenZeppelin"],
        "purpose": "Manages collateral deposits, borrow balances, and reserves with reentrancy guards"
      },
      {
        "name": "Jump Rate Interest Model",
        "tools_used": ["Solidity"],
        "purpose": "Computes dynamic borrow and supply interest rates based on pool utilization ratio"
      },
      {
        "name": "Price Oracle Adapter",
        "tools_used": ["Solidity"],
        "purpose": "Interfaces with Chainlink price feeds with heartbeat and deviation threshold validation"
      },
      {
        "name": "Liquidation Engine",
        "tools_used": ["Solidity"],
        "purpose": "Allows external liquidators to repay underwater loans in exchange for discounted collateral"
      },
      {
        "name": "Hardhat Fork Simulation Suite",
        "tools_used": ["Hardhat", "Ethers.js"],
        "purpose": "Executes integration scenarios including oracle crashes and liquidation cascades"
      }
    ],
    "data_flow": "Users deposit ERC20 collateral into the lending pool; borrowers draw loans against collateral up to maximum loan-to-value limits; interest accrues algorithmically each second based on pool utilization; price feeds update asset values; if an account health factor drops below 1.0, third-party liquidators repay up to 50% of the debt and seize collateral with a liquidation incentive bonus.",
    "enforcement_mechanism": "ReentrancyGuard prevents reentrant state modifications; pool checks require health factor >= 1.0 prior to borrow and withdrawal completion."
  },
  "targets": [
    {
      "metric": "Deposit and Borrow Gas Consumption Ceiling",
      "method": "Measurement via hardhat-gas-reporter on standard EVM execution trace",
      "input": "Simulated ERC20 deposit and borrow function calls under standard pool state",
      "environment": "Hardhat local EVM node with London/Cancun EVM rules",
      "minimum_pass": "deposit() gas < 95,000 and borrow() gas < 160,000",
      "target": "deposit() gas < 80,000 and borrow() gas < 135,000",
      "report": "hardhat-gas-reporter execution summary table"
    },
    {
      "metric": "Liquidation Invariant Verification",
      "method": "Hardhat simulation test simulating 30% collateral asset price crash via mock oracle",
      "input": "100 distinct borrower positions with varying loan-to-value ratios between 60% and 90%",
      "environment": "Hardhat local test network, Node.js 18+",
      "minimum_pass": "100 of 100 underwater positions liquidated without pool insolvency",
      "target": "100 of 100 underwater positions liquidated without pool insolvency",
      "report": "Hardhat test execution log reporting position health factors and recovered collateral"
    },
    {
      "metric": "Static Security Vulnerability Count",
      "method": "Slither static analysis scan executed across all smart contract source files",
      "input": "Complete Solidity codebase including pool, interest rate model, and oracle adapters",
      "environment": "Standard local CPU, Python Slither 0.10+",
      "minimum_pass": "0 high and 0 medium severity issues reported by Slither",
      "target": "0 high, 0 medium, and 0 low severity issues reported by Slither",
      "report": "Slither JSON output report summarizing detector results"
    }
  ],
  "skills": ["Solidity", "Hardhat", "Ethers.js", "OpenZeppelin", "Slither", "Smart Contracts", "Security"],
  "starter_input": {
    "spec": "Standard mock ERC20 token contracts and mock price oracle contracts with programmable prices.",
    "size": "2 mock ERC20 tokens (WETH and USDC) and 1 mock Chainlink price feed aggregator",
    "seeded_cases": "Zero-utilization cold pool, 99% utilization pool, oracle price drop of 40%, and reentrancy attack callback tokens",
    "label_source": "Deterministic Hardhat test fixtures and mathematical spreadsheet interest models",
    "personal_data_policy": "Strictly local EVM mock accounts; no personal data or live private keys used"
  },
  "components": [
    {"name": "Lending Pool Core & Accounting", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Jump Rate Model Fixed-Point Math", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "Oracle Integration & Liquidation Logic", "task_type": "one third-party integration", "hours": 5.0},
    {"name": "Hardhat Fork & Chaos Test Harness", "task_type": "load or performance test harness + report", "hours": 5.0},
    {"name": "Security Hardening & Slither Audits", "task_type": "security hardening checks", "hours": 3.0},
    {"name": "Test Dashboard, Diagrams & Buffer", "task_type": "docs + architecture diagram", "hours": 7.0}
  ],
  "extended_path": {
    "items": [
      "Flash loan borrowing facility with EIP-3156 standard interface and fee collection",
      "Multi-collateral risk parameters allowing isolated lending markets for volatile tokens"
    ],
    "hours": 15
  },
  "milestones": [
    {
      "name": "Pool Core Accounting & ERC20 Smart Contracts Vault",
      "hours": 9,
      "done_criterion": "Smart contracts compile with solc; unit tests confirm deposit, borrow, and interest accrual mechanics."
    },
    {
      "name": "Jump Rate Model & Oracle Integration",
      "hours": 8,
      "done_criterion": "Fixed-point interest rates update based on utilization; Chainlink oracle adapter validates price freshness."
    },
    {
      "name": "Liquidation Engine & Hardhat Fork Invariant Tests",
      "hours": 9,
      "done_criterion": "Liquidation tests confirm debt repayment and collateral seizure when health factor drops below 1.0."
    },
    {
      "name": "Slither Security Audit, Gas Benchmarks & Docs Buffer",
      "hours": 8,
      "done_criterion": "Slither scan passes with zero high/medium issues; gas reporter benchmarks pass; architecture docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Solidity programming (inheritance, modifiers, memory vs storage)",
    "Familiarity with ERC-20 token standards and EVM execution mechanics",
    "Basic knowledge of DeFi lending primitives (LTV, collateralization ratio, oracles)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound EVM emulation)",
    "cost": "$0 (local Hardhat network and public testnets)",
    "accounts_keys_quotas": "No paid RPC keys or mainnet ETH required; uses local Hardhat accounts",
    "reference_environment": "Local 4-core CPU with Node.js 18+ and Python 3.10+ (for Slither)",
    "fallback_path": "Solidity compiler built-in tests without Slither if Python environment is restricted"
  },
  "riskiest_component": {
    "name": "Fixed-Point Arithmetic Rounding Errors in Debt Accrual",
    "fallback": "Adopt OpenZeppelin Math library for multiplication and division with explicit rounding direction"
  },
  "deliverables": [
    "Git repository containing Solidity contracts, Hardhat test scripts, and deployment configurations",
    "Slither security analysis log file demonstrating zero critical/high findings",
    "Hardhat gas consumption report detailing gas metrics across all public entrypoints",
    "Screener verification script executing automated test suites in under 3 minutes"
  ],
  "out_of_scope": [
    "Mainnet contract deployment with real capital",
    "Automated decentralized governance voting modules",
    "Cross-chain bridge integrations"
  ],
  "safety_note": None,
  "resources": [
    "Ethereum Improvement Proposal EIP-20 Token Standard specification",
    "OpenZeppelin Contracts security documentation and ReentrancyGuard",
    "Slither Static Analysis Framework documentation and detector list"
  ],
  "rubric": [
    {
      "input": "npx hardhat test command execution",
      "action": "Run complete unit test suite across pool and interest rate model",
      "expected_result": "All test assertions pass verifying deposit, borrow, repay, and withdrawal balances",
      "evidence_location": "Hardhat test console execution log",
      "pass_criterion": "Exit code 0 with 25 passing test cases and zero assertion failures",
      "kind": "normal"
    },
    {
      "input": "Mock price crash scenario dropping collateral asset price by 30%",
      "action": "Execute npx hardhat test test/liquidation.test.js",
      "expected_result": "Liquidator successfully calls liquidate(), receiving seized collateral and discount incentive",
      "evidence_location": "Liquidation test execution summary output",
      "pass_criterion": "Account health factor restored to >= 1.0 and transaction succeeds with event LiquidationCall emitted",
      "kind": "normal"
    },
    {
      "input": "Slither static security analysis execution",
      "action": "Run slither . --exclude-dependencies",
      "expected_result": "Slither scans all contract files and outputs vulnerability summary",
      "evidence_location": "slither_report.json or terminal output log",
      "pass_criterion": "Zero high and zero medium severity security issues detected",
      "kind": "normal"
    },
    {
      "input": "hardhat-gas-reporter plugin enabled in hardhat.config.js",
      "action": "Run REPORT_GAS=true npx hardhat test",
      "expected_result": "Gas report generates table of average gas costs per method call",
      "evidence_location": "Gas reporter console output table",
      "pass_criterion": "deposit() method consumes < 95,000 gas and borrow() consumes < 160,000 gas",
      "kind": "normal"
    },
    {
      "input": "Malicious reentrant attacker contract attempting recursive borrow drain",
      "action": "Run npx hardhat test test/reentrancy_attack.test.js",
      "expected_result": "Lending pool detects reentrancy and reverts transaction with custom error",
      "evidence_location": "Terminal test output log",
      "pass_criterion": "Attack transaction fails with revert error ReentrancyGuardReentrantCall",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected decentralized overcollateralized lending protocol in Solidity using Hardhat and OpenZeppelin; implemented Jump Rate dynamic interest curves, automated liquidation engine, and verified gas ceilings under [DEPOSIT_GAS] gas per deposit with [AUDIT_ISSUES] critical vulnerabilities on Slither static audit.",
    "claims": [
      {
        "text": "implemented Jump Rate dynamic interest curves, automated liquidation engine",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "verified gas ceilings under [DEPOSIT_GAS] gas per deposit",
        "rubric_indexes": [3]
      },
      {
        "text": "[AUDIT_ISSUES] critical vulnerabilities on Slither static audit",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "managing live mainnet total value locked or audited production security without professional third-party certification"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds an overcollateralized DeFi lending protocol in Solidity featuring dynamic Jump Rate interest calculations, Chainlink oracle adapters, liquidation mechanics, and Slither security hardening.",
    "q2": "Core path: lending pool vault, Jump Rate math, oracle adapter, liquidation engine, and Slither audit (34h). Extended path: flash loans and multi-collateral risk parameters (+15h).",
    "q3": "Components: Pool Core (5h), Jump Rate Math (5h), Liquidation Logic (5h), Fork Test Harness (5h), Security Hardening (3h), Docs & Buffer (7h). Total 30h x 1.15 = 34.5 -> 34h.",
    "q4": "Project types: Blockchain/smart contracts. Metrics: Gas Consumption Ceilings, Liquidation Invariants, Static Vulnerability Count. Rejected: web-service RPS throughput (inappropriate for smart contracts).",
    "q5": "Hard parts: reentrancy prevention, fixed-point interest rate math, oracle manipulation resistance, and EVM gas minimization.",
    "q6": "Starter input: mock ERC20 tokens and mock price aggregator contracts with deterministic seed scenarios. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows, 8GB RAM, CPU only, $0 cost, zero real ETH. Fallback: local Hardhat node without external RPCs.",
    "q8": "Riskiest component: Fixed-point math precision loss. Fallback: OpenZeppelin Math library.",
    "q9": "Potential faking: mocked test scripts. Anti-fake check 5 executes an actual reentrancy exploit contract and asserts EVM revert with exact guard error.",
    "q10": "Safety/ethics: Safe; local testnet execution with mock tokens; no real funds at risk."
  }
}

b5_old_diag = """
- **Old Title**: DeFi Lending Protocol Smart Contract on Ethereum
- **Domain**: Blockchain & Web3
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-25 hours; inflated and copied generic web-service targets.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines: 'passes when verified by automated test script or benchmark log' across all 5 checks)
- Technical Accuracy: 4.0 / 10 (copied web-service targets: 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' onto a SMART CONTRACT project! Cap applied: max 5)
- Scope Realism: 5.0 / 10 (no component mapping)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 4.0 / 10 (banned employer and growth claims: 'SEBI and RBI. Web3 companies like CoinDCX, WazirX... actively seek'; pre-filled bullet: 'managing simulated $[K]+ TVL')
- Resume Bullet Safety: 4.0 / 10 (pre-filled numbers and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.48 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Pasted web-service targets onto smart contract**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Smart contracts run on the EVM; evaluating them with k6 throughput is technically absurd and demonstrates template copying.
2. **Circular rubric pass criteria**:
   > "1. Verify mainnet fork test simulating real price crashes... passes when verified by automated test script or benchmark log."
   *Flaw*: Every single rubric item ended with this meaningless tautological phrase.
3. **Banned employer & growth marketing**:
   > "In India, crypto lending and DeFi are growing with regulatory clarity from SEBI and RBI. Web3 companies like CoinDCX, WazirX, and international DeFi protocols hire for smart contract engineering."
"""

b5_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 34 hours (ADVANCED); runs locally on Hardhat node without gas fees or cloud accounts.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Gas ceilings (< 95k deposit, < 160k borrow) and liquidation invariants measured directly via Hardhat gas reporter.",
    "Is there a CPU/local/free fallback?": "YES. Local Hardhat in-memory node with mock price oracles at $0 cost.",
    "Can test data be created in minutes?": "YES. Mock ERC20 tokens and Chainlink price aggregator contracts provided as code fixtures.",
    "Can screener check rubric in under 10 minutes?": "YES. Hardhat test runner and Slither scan run in under 3 minutes.",
    "Are targets and rubric project-specific?": "YES. EVM gas consumption, liquidation health factor restoration, and Slither detector rules are unique to smart contracts.",
    "Is every bullet claim verified by rubric?": "YES. Jump Rate and liquidation verified by Checks 1 & 2; gas verified by Check 4; Slither verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] executes live reentrancy exploit contract and validates EVM revert.",
    "Are all terms accurate?": "YES. Replaced web-service metrics with EVM gas, utilization ratios, health factors, and Slither audits.",
    "Does problem statement promise only what is verified?": "YES. Core lending pool, interest rates, liquidation, and security audits are directly built and tested.",
    "Are privacy and safety notes addressed?": "YES. Synthetic local test accounts only; no real private keys or funds.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering reentrancy, fixed-point math, oracle manipulation, and gas optimization."
}

b5_changelog = """
- Scope & Hours: Recalculated bottom-up (30 component hours * 1.15 buffer = 34 hours). Split flash loans and multi-collateral isolation to Extended Path (+15h).
- Removed Generic Targets: Completely eliminated pasted web-service k6 throughput targets; replaced with authentic smart contract metrics (gas consumption ceilings, liquidation invariants, and Slither zero-vulnerability count).
- Eliminated Banned Content: Removed CoinDCX, WazirX, SEBI, and RBI marketing mentions.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake reentrancy exploit test.
- Resume Formula: Formatted with measured gas placeholder [DEPOSIT_GAS] and explicit 'Do not claim' boundary.
"""

# ==============================================================================
# 6. brief-canary-deployment
# ==============================================================================
b6_data = {
  "id": "brief-canary-deployment",
  "title": "Canary Deployment Controller with Automated Rollback",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["CI/CD/DevOps/security pipelines", "IaC/cloud"],
  "problem": "Deploying software updates to production instances without gradual traffic shifting risks catastrophic outages when defect-laden releases escape staging environments. Progressive delivery mitigates deployment blast radiuses by routing a small fraction of real user requests to canary replicas while monitoring reliability metrics. This project implements a custom Kubernetes operator in Go that reconciles declarative CanaryDeployment resources, coordinates traffic shifting across service meshes, evaluates Prometheus service-level indicators, and triggers automated rollbacks when error rate or latency thresholds are breached.",
  "use_cases": [
    "Progressive release management for microservices with automated error rate rollback gates",
    "Canary latency regression detection during cloud service upgrades",
    "Automated traffic migration across Blue-Green and canary service endpoints"
  ],
  "hard_parts": [
    "Managing Kubernetes reconciliation loops with exponential backoff and idempotency without state desynchronization",
    "Translating dynamic traffic weight distributions across service mesh routing objects without connection drops",
    "Querying Prometheus metrics reliably across sliding inspection windows while handling sparse or delayed samples",
    "Enforcing safe automated rollback state transitions during active deployments without human intervention"
  ],
  "screener_signals": [
    "Custom Resource Definition and Go operator built using client-go and controller-runtime",
    "Automated progressive traffic shifting verified across 4 distinct step percentages",
    "End-to-end chaos integration test demonstrating automated rollback within 30 seconds of an injected fault"
  ],
  "job_families": [
    "Site Reliability Engineer",
    "Platform Engineer",
    "DevOps Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "operator reconciliation logic and Kubernetes API client implementation"},
    {"tool": "Kubernetes", "role": "container orchestration platform hosting pods, services, and custom resources"},
    {"tool": "Prometheus", "role": "time-series monitoring database scraped for error rate and latency metrics"},
    {"tool": "Docker", "role": "local container runtime packaging the operator image and mock applications"},
    {"tool": "Helm", "role": "chart packaging for operator CRDs, RBAC roles, and deployment manifests"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Canary Controller",
        "tools_used": ["Go", "Kubernetes"],
        "purpose": "Reconciles CanaryDeployment CRDs, tracking rollout phases and updating target pod replica counts"
      },
      {
        "name": "Traffic Routing Manager",
        "tools_used": ["Go", "Kubernetes"],
        "purpose": "Updates traffic split weights between primary and canary services via service mesh virtual routers"
      },
      {
        "name": "Metric Analyzer",
        "tools_used": ["Go", "Prometheus"],
        "purpose": "Queries Prometheus HTTP API to compute error rates and p99 latency against configured SLO thresholds"
      },
      {
        "name": "Automated Rollback Engine",
        "tools_used": ["Go"],
        "purpose": "Shifts traffic weights back to primary version and scales canary to zero upon threshold violation"
      },
      {
        "name": "Cluster Manifest Package",
        "tools_used": ["Helm", "Docker"],
        "purpose": "Packages operator container and manifests for local execution on Minikube or Kind clusters"
      }
    ],
    "data_flow": "Developers apply a CanaryDeployment manifest; the controller detects the spec change and creates a canary deployment; traffic shifts incrementally (10%, 25%, 50%, 100%) across scheduled intervals; the Metric Analyzer queries Prometheus every 15 seconds; if error rates remain below threshold, rollout advances; if SLOs are violated, the Rollback Engine immediately shifts 100% traffic to stable pods and marks status FAILED.",
    "enforcement_mechanism": "Reconciliation loop terminates canary rollout and restores stable routing weights if error rate exceeds 5% or p99 latency exceeds 200ms."
  },
  "targets": [
    {
      "metric": "Traffic Shift Progression Accuracy",
      "method": "Measurement of request routing distribution across primary and canary pods at each progression step",
      "input": "1,000 synthetic HTTP requests routed through proxy at 10%, 25%, and 50% target weights",
      "environment": "Local Kubernetes cluster (Kind/Minikube), single node, 4-core CPU",
      "minimum_pass": "Observed traffic percentage within 4.0% of target weight at each progression stage",
      "target": "Observed traffic percentage within 1.5% of target weight at each progression stage",
      "report": "Traffic distribution summary log table from curl benchmarking client"
    },
    {
      "metric": "Automated Rollback Detection & Convergence Duration",
      "method": "Injection of 10% HTTP 500 error rate into canary pods during 50% traffic stage",
      "input": "Continuous background load of 100 requests per second across active pods",
      "environment": "Local Kubernetes cluster (Kind/Minikube) with local Prometheus instance",
      "minimum_pass": "Detection of breach and full traffic restoration to stable version in < 45 seconds",
      "target": "Detection of breach and full traffic restoration to stable version in < 25 seconds",
      "report": "Controller event log and Prometheus metric series showing rollback timeline"
    },
    {
      "metric": "Controller Memory Footprint Under Reconciliation",
      "method": "Continuous resource monitoring of operator pod during repeated deployment reconciliations",
      "input": "5 concurrent CanaryDeployment objects under continuous metric evaluation",
      "environment": "Local Kubernetes cluster (Kind/Minikube), Go 1.21+",
      "minimum_pass": "Operator pod resident memory consumption < 65MB",
      "target": "Operator pod resident memory consumption < 40MB",
      "report": "kubectl top pod output log and Prometheus container memory metric"
    }
  ],
  "skills": ["Go", "Kubernetes", "Prometheus", "Docker", "Helm", "CI/CD", "DevOps"],
  "starter_input": {
    "spec": "Mock microservice application container image in Go exposing /version, /healthz, and /inject-fault endpoints.",
    "size": "2 application versions (v1 stable, v2 candidate) with configurable latency and error rates",
    "seeded_cases": "Healthy 4-stage progression, immediate crash-loop backoff on v2, 8% HTTP 500 error injection, and Prometheus scrape timeout",
    "label_source": "Deterministic chaos test execution scripts and Kubernetes event streams",
    "personal_data_policy": "Strictly mock synthetic microservices and telemetry; no personal data or live production traffic used"
  },
  "components": [
    {"name": "CRD Definition & Operator Skeleton", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Traffic Routing Splitter Integration", "task_type": "one third-party integration", "hours": 4.0},
    {"name": "Prometheus Metric Scraper & Analyzer", "task_type": "observability", "hours": 4.0},
    {"name": "Automated Rollback State Machine", "task_type": "concurrency/consistency mechanism with tests", "hours": 4.0},
    {"name": "Chaos Test Harness & Helm Charts", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Architecture Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Dynamic webhook notifications sending deployment failure summaries to Slack",
      "Multi-cluster traffic shifting using Istio multi-primary deployment topologies"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Custom Resource Definition & Controller Reconciliation",
      "hours": 8,
      "done_criterion": "Operator watches CanaryDeployment CRDs and manages canary pod deployment lifecycles."
    },
    {
      "name": "Traffic Splitting & Service Mesh Integration",
      "hours": 7,
      "done_criterion": "Controller shifts traffic weights between stable and canary pods according to step schedule."
    },
    {
      "name": "Prometheus Metric Analysis & Automated Rollback",
      "hours": 8,
      "done_criterion": "Controller queries Prometheus metrics and reverts traffic to stable version on error threshold breach."
    },
    {
      "name": "Chaos Testing, Helm Packaging, CI/CD Pipeline Automation, DevOps Docs & Buffer",
      "hours": 6,
      "done_criterion": "Helm chart deploys operator cleanly on local Kind cluster; chaos test confirms automated rollback; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Go programming (goroutines, channels, interfaces)",
    "Familiarity with Kubernetes core objects (Deployments, Services, CRDs)",
    "Basic understanding of Prometheus PromQL queries and time-series metrics"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM (minimum 4GB allocated to Docker)",
    "gpu": "None required (purely CPU-bound operator and mock pods)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts or paid services required",
    "reference_environment": "Local 4-core CPU with Docker, Kind or Minikube, and kubectl installed",
    "fallback_path": "Kubernetes controller tests running against envtest (API server + etcd binary) without requiring full cluster"
  },
  "riskiest_component": {
    "name": "Prometheus Metrics Delay Causing Rollback Decision Latency",
    "fallback": "Configure short scrape intervals (5s) in local Prometheus config and enforce minimum evaluation window count"
  },
  "deliverables": [
    "Git repository containing Go operator source code, CRD YAML manifests, and Helm charts",
    "Mock microservice with programmable error and latency injection endpoints",
    "Automated chaos test script demonstrating traffic progression and rollback",
    "Screener verification script executing end-to-end deployment verification in under 3 minutes"
  ],
  "out_of_scope": [
    "Multi-cloud federation across distinct cloud providers",
    "Automated canary analysis using Bayesian statistical models",
    "Production ingress TLS certificate management"
  ],
  "safety_note": None,
  "resources": [
    "Kubernetes client-go and controller-runtime official documentation",
    "Prometheus HTTP API query specification and PromQL tutorial",
    "Kubernetes Custom Resource Definition official design guidelines"
  ],
  "rubric": [
    {
      "input": "kubectl apply -f config/samples/canary_v1.yaml command",
      "action": "Inspect operator pod logs and Kubernetes deployment objects",
      "expected_result": "Operator initializes CanaryDeployment object and creates corresponding primary deployment",
      "evidence_location": "kubectl get canarydeployments output and operator logs",
      "pass_criterion": "CanaryDeployment status transitions to Initialized with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Trigger canary update to version v2 via kubectl apply",
      "action": "Run traffic monitoring script while progression advances",
      "expected_result": "Traffic weights step through configured percentages without connection drops",
      "evidence_location": "Traffic monitor output log file",
      "pass_criterion": "Observed request routing matches target weights within 4% tolerance across all steps",
      "kind": "normal"
    },
    {
      "input": "Fault injection script triggering 10% HTTP 500 responses on canary pods",
      "action": "Execute chaos test during 50% traffic rollout stage",
      "expected_result": "Prometheus metric analyzer detects SLO violation and triggers immediate rollback",
      "evidence_location": "Operator event log and kubectl get canarydeployments status field",
      "pass_criterion": "Traffic immediately shifted 100% to stable pods and canary status marked Failed",
      "kind": "normal"
    },
    {
      "input": "helm install canary-operator ./charts/canary-operator on empty Kind cluster",
      "action": "Inspect installed pods and CRD registration",
      "expected_result": "Operator pod starts running with 1/1 ready status and CRDs established",
      "evidence_location": "kubectl get pods -n canary-system output",
      "pass_criterion": "Pod is in Running state and ready probe returns HTTP 200",
      "kind": "normal"
    },
    {
      "input": "Dynamic error rate threshold and unique test namespace injected at runtime by verification script",
      "action": "Run ./scripts/verify_operator.sh --dynamic-threshold 3.5",
      "expected_result": "Script deploys canary, injects controlled errors, and confirms automated rollback at dynamic threshold",
      "evidence_location": "Verification execution console output log",
      "pass_criterion": "Operator successfully halts deployment and logs matching dynamic threshold with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected Kubernetes canary deployment controller in Go using Prometheus metrics; automated progressive traffic shifting across [TRAFFIC_STAGES] stages and implemented automated rollback within [ROLLBACK_TIME] seconds of SLO error rate breach.",
    "claims": [
      {
        "text": "automated progressive traffic shifting across [TRAFFIC_STAGES] stages",
        "rubric_indexes": [1]
      },
      {
        "text": "implemented automated rollback within [ROLLBACK_TIME] seconds of SLO error rate breach",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "managing multi-region production clusters or zero-downtime database schema migrations without committed controller logs"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a Kubernetes operator in Go that reconciles custom CanaryDeployment resources, progressively shifts traffic via service routers, queries Prometheus metrics, and rolls back on SLO breach.",
    "q2": "Core path: CRD definition, client-go operator, traffic routing manager, Prometheus analyzer, automated rollback, and Helm chart (29h). Extended path: Slack webhook alerts and multi-cluster traffic shifting (+14h).",
    "q3": "Components: CRD & Operator (5h), Routing Integration (4h), Metric Analyzer (4h), Rollback Engine (4h), Chaos Test & Helm (4h), Docs & Buffer (4h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: CI/CD/DevOps/security pipelines, IaC/cloud. Metrics: Traffic Shift Progression Accuracy, Automated Rollback Duration, Controller Memory Footprint. Rejected: storage disk compression (not an OLAP project).",
    "q5": "Hard parts: client-go reconciliation idempotency, traffic weight synchronicity, Prometheus scrape window lag, and fail-safe rollback state transitions.",
    "q6": "Starter input: mock microservice image in Go with /version, /healthz, and /inject-fault endpoints. 2 versions. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: controller-runtime envtest mode without full Kubernetes cluster.",
    "q8": "Riskiest component: Prometheus scrape lag delaying rollback. Fallback: configure 5s local scrape interval.",
    "q9": "Potential faking: hardcoded mock logs. Anti-fake check 5 accepts dynamic error threshold at runtime and asserts live operator controller event log mutation.",
    "q10": "Safety/ethics: Safe; local Kind/Minikube cluster only."
  }
}

b6_old_diag = """
- **Old Title**: Canary Deployment Controller with Automated Rollback
- **Domain**: Platform & DevOps
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 4.5 / 10 (copied web-service targets onto Kubernetes controller; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned marketing: 'FAANG companies', 'top tech platforms, top tech platforms, and top tech platforms', 'principal-level', 'Any company')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results, two sentences joined by semicolon glitch)
- **Old Weighted Score**: 4.50 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Pasted identical backend service targets onto a Kubernetes operator controller.
2. **Extreme marketing glitches**:
   > "Progressive delivery is the gold standard at FAANG companies. top tech platforms, top tech platforms, and top tech platforms deploy hundreds of times per day..."
3. **Syntax glitch in resume bullet**:
   > "within 60 seconds of threshold violation.; achieved [N] throughput with < [M ms] latency overhead across [K] test transactions."
"""

b6_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours (INTERMEDIATE); runs locally on Kind or Minikube with Docker at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Progression accuracy within 4% and rollback duration < 45s measured directly on local Kind cluster.",
    "Is there a CPU/local/free fallback?": "YES. Controller-runtime envtest test suite without needing full Kubernetes cluster.",
    "Can test data be created in minutes?": "YES. Mock Go microservice with programmable fault endpoints provided in repo.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full test and dynamic threshold rollback in under 3 minutes.",
    "Are targets and rubric project-specific?": "YES. Traffic shifting accuracy, rollback convergence latency, and operator memory footprint are specific to canary controllers.",
    "Is every bullet claim verified by rubric?": "YES. Progressive traffic shifting verified by Check 2; rollback timing verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic error threshold and confirms live operator rollback.",
    "Are all terms accurate?": "YES. Accurately covers CRDs, client-go, Prometheus scraping, and service mesh traffic weights.",
    "Does problem statement promise only what is verified?": "YES. Controller reconciliation, traffic shifting, metric analysis, and rollback are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic local microservices and mock telemetry.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering reconciliation idempotency, traffic synchronicity, scrape lag, and rollback safety."
}

b6_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split Slack webhooks and multi-cluster federation to Extended Path (+14h).
- Target Realism: Replaced copied web-service targets with genuine Kubernetes controller targets (traffic shift accuracy, automated rollback duration, and pod memory footprint).
- Removed All Banned Content: Removed FAANG, 'top tech platforms' triple duplication, and 'principal-level' marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic threshold check.
- Resume Formula: Formatted into a single sentence using placeholders [TRAFFIC_STAGES] and [ROLLBACK_TIME] with strict 'Do not claim' boundary.
"""

# ==============================================================================
# 7. brief-cdc-pipeline
# ==============================================================================
b7_data = {
  "id": "brief-cdc-pipeline",
  "title": "Change Data Capture (CDC) & Event Sourcing Pipeline",
  "domain": "Data Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Data pipeline/ETL/streaming", "Distributed systems"],
  "problem": "Maintaining consistency between primary transactional databases and downstream search indexes, caches, and analytical stores using batch polling generates excessive database load and introduces unacceptable propagation latency. Polling-based architectures fail to capture intermediate updates and cannot provide reliable audit trails. A Change Data Capture pipeline overcomes these limitations by streaming row-level mutations directly from the database write-ahead log into a partitioned event broker, enabling real-time event dissemination across downstream consumers with low latency and idempotent deduplication guarantees.",
  "use_cases": [
    "Synchronizing search indexes with transactional relational databases in real time",
    "Invalidating distributed application cache layers immediately upon database row mutation",
    "Streaming transactional events to audit stores and downstream analytical warehouses"
  ],
  "hard_parts": [
    "Configuring PostgreSQL logical decoding and write-ahead log slot management without causing disk saturation during consumer downtime",
    "Enforcing idempotent consumer writes to prevent duplicate record processing during network partitions and consumer rebalances",
    "Handling upstream database schema migrations without terminating active Kafka Connect streaming connectors",
    "Maintaining event ordering across horizontal consumer instances when processing multi-row transactions"
  ],
  "screener_signals": [
    "Reproducible Docker Compose environment running PostgreSQL with wal_level=logical, Kafka, and Debezium",
    "Demonstrated sub-second end-to-end synchronization from PostgreSQL mutations to Elasticsearch search documents",
    "Anti-fake verification script validating dynamic column mutations and live search index reflections"
  ],
  "job_families": [
    "Data Platform Engineer",
    "Data Engineer",
    "Backend Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "Debezium", "role": "distributed change data capture connector reading PostgreSQL logical replication streams"},
    {"tool": "Kafka", "role": "distributed event streaming broker buffering row mutation events into partitioned topics"},
    {"tool": "PostgreSQL", "role": "source relational database configured with logical write-ahead logging"},
    {"tool": "Python", "role": "consumer service implementation transforming CDC payloads and updating downstream stores"},
    {"tool": "Docker", "role": "containerized multi-service orchestration for local pipeline testing"},
    {"tool": "Elasticsearch", "role": "downstream search engine receiving synchronized document updates"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Transactional Source Database",
        "tools_used": ["PostgreSQL"],
        "purpose": "Stores application entities and writes row-level mutations to the logical replication write-ahead log"
      },
      {
        "name": "CDC Connector Engine",
        "tools_used": ["Debezium", "Kafka"],
        "purpose": "Streams WAL changes as structured JSON event messages into partitioned Kafka topics"
      },
      {
        "name": "Streaming Event Broker",
        "tools_used": ["Kafka"],
        "purpose": "Buffers database change events with key-based partitioning ensuring order per entity ID"
      },
      {
        "name": "Search Synchronization Consumer",
        "tools_used": ["Python", "Elasticsearch"],
        "purpose": "Consumes CDC events, deduplicates records, and updates search index documents idempotently"
      },
      {
        "name": "Containerized Infrastructure",
        "tools_used": ["Docker"],
        "purpose": "Orchestrates PostgreSQL, Kafka broker, Debezium Connect, and Elasticsearch containers"
      }
    ],
    "data_flow": "An application executes INSERT, UPDATE, or DELETE operations in PostgreSQL; the PostgreSQL WAL records the transaction; the Debezium connector captures the mutation and produces a structured event to Kafka; Python consumer processes read the topic; consumers enforce idempotent upserts into Elasticsearch using entity IDs as document identifiers; search queries immediately reflect the latest database state.",
    "enforcement_mechanism": "Idempotent consumer upserts using PostgreSQL primary keys as Elasticsearch document IDs; Kafka key partitioning ensuring strict per-record ordering."
  },
  "targets": [
    {
      "metric": "End-to-End Change Propagation Latency",
      "method": "Timestamp delta measurement between PostgreSQL commit and Elasticsearch document indexing",
      "input": "1,000 synthetic database mutation transactions streamed at 100 operations per second",
      "environment": "Standard 4-core local CPU, 8GB RAM, Docker Compose",
      "minimum_pass": "p95 end-to-end propagation latency < 1,500ms",
      "target": "p95 end-to-end propagation latency < 750ms",
      "report": "Latency benchmark summary table and timestamp difference histogram"
    },
    {
      "metric": "Idempotent Deduplication Invariant",
      "method": "Injection of 500 duplicate Kafka message offsets into consumer group",
      "input": "1,000 unique entity mutations with 500 deliberately redelivered duplicate payloads",
      "environment": "Standard 4-core local CPU, Docker Compose environment",
      "minimum_pass": "Downstream Elasticsearch document count equals exactly 1,000 with 0 duplicate records",
      "target": "Downstream Elasticsearch document count equals exactly 1,000 with 0 duplicate records",
      "report": "Verification script report comparing source table count with index count"
    },
    {
      "metric": "CDC Pipeline Ingestion Throughput",
      "method": "High-volume batch insertion load test measuring processed CDC events per second",
      "input": "20,000 synthetic row insertions executed via bulk transaction script",
      "environment": "Standard 4-core local CPU, 8GB RAM, local SSD storage",
      "minimum_pass": "Sustained pipeline capture throughput > 1,000 events/sec without connector lag buildup",
      "target": "Sustained pipeline capture throughput > 2,500 events/sec without connector lag buildup",
      "report": "Debezium metrics log reporting source-record-poll-rate and consumer lag"
    }
  ],
  "skills": ["Debezium", "Kafka", "PostgreSQL", "Python", "Docker", "Elasticsearch", "Data Pipelines"],
  "starter_input": {
    "spec": "E-commerce product catalog schema in PostgreSQL with products, inventory, and categories tables.",
    "size": "5,000 initial product records and synthetic mutation generator producing 20,000 updates",
    "seeded_cases": "Rapid multi-column updates, out-of-order event arrivals, schema column addition (ALTER TABLE), and transaction aborts",
    "label_source": "Deterministic SQL migration scripts and Python test generators with fixed seed 8821",
    "personal_data_policy": "Strictly mock synthetic product catalog and inventory data; no personal user information used"
  },
  "components": [
    {"name": "PostgreSQL WAL Replication & Schema Setup", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "Debezium Kafka Connect Configuration", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Idempotent Python Consumer & Sync Logic", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Elasticsearch Sync & Schema Evolution", "task_type": "one third-party integration", "hours": 4.0},
    {"name": "Benchmark Harness & Chaos Duplicate Tests", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Schema Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Transactional Outbox pattern implementation using Debezium Outbox Event Router",
      "Schema Registry integration enforcing Avro or JSON Schema compatibility checks"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "PostgreSQL Logical Replication & Kafka Connect Setup",
      "hours": 8,
      "done_criterion": "PostgreSQL wal_level=logical configured; Debezium connector captures row mutations to Kafka topics."
    },
    {
      "name": "Python Consumer & Idempotent Elasticsearch Sync for Data Pipelines",
      "hours": 7,
      "done_criterion": "Python consumer ingests CDC events from Kafka and synchronizes documents into Elasticsearch."
    },
    {
      "name": "Deduplication Testing & Schema Evolution Verification",
      "hours": 8,
      "done_criterion": "Test suite verifies 0 duplicate index documents on injected redeliveries and handles ALTER TABLE changes."
    },
    {
      "name": "Latency Benchmarks, Anti-Fake Test, Docs & Buffer",
      "hours": 6,
      "done_criterion": "Benchmark verifies p95 sync latency < 1,500ms; anti-fake test validates dynamic record sync; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Python programming and async IO concepts",
    "Relational database administration basics (PostgreSQL WAL, replication slots)",
    "Familiarity with event streaming concepts (Kafka topics, partitions, consumer groups)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM (minimum 4GB allocated to Docker)",
    "gpu": "None required (purely CPU-bound event streaming)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts or paid API keys required",
    "reference_environment": "Local 4-core CPU with Docker Engine 24+ and Docker Compose installed",
    "fallback_path": "Local SQLite WAL polling mock pipeline without Docker if container resources are constrained"
  },
  "riskiest_component": {
    "name": "PostgreSQL Replication Slot Disk Saturation during Consumer Inactivity",
    "fallback": "Configure max_slot_wal_keep_size in postgresql.conf to bound WAL retention on local disk"
  },
  "deliverables": [
    "Git repository containing Docker Compose files, Debezium connector configurations, and Python consumers",
    "SQL migration scripts creating source schemas and test transaction generators",
    "Benchmark script measuring end-to-end synchronization latency and throughput",
    "Screener verification script executing pipeline tests and dynamic record validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Bi-directional active-active database replication",
    "Heterogeneous cross-cloud CDC synchronization",
    "Real-time stream processing with Apache Flink"
  ],
  "safety_note": None,
  "resources": [
    "Debezium PostgreSQL Connector official documentation",
    "Apache Kafka consumer group and partition rebalancing architecture guide",
    "PostgreSQL documentation on logical decoding and write-ahead logging"
  ],
  "rubric": [
    {
      "input": "docker compose up -d command execution",
      "action": "Check health of PostgreSQL, Kafka, and Debezium containers",
      "expected_result": "All containers report healthy and Debezium connector status shows RUNNING",
      "evidence_location": "Docker status output and curl http://localhost:8083/connectors/postgres-cdc/status",
      "pass_criterion": "Connector state equals RUNNING with 1/1 tasks running and exit code 0",
      "kind": "normal"
    },
    {
      "input": "SQL INSERT statement executed in PostgreSQL products table",
      "action": "Query Elasticsearch products index for newly inserted record",
      "expected_result": "Elasticsearch returns matching document within 1,500ms of database commit",
      "evidence_location": "Elasticsearch search response JSON payload",
      "pass_criterion": "Document matches PostgreSQL row fields with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Injection of 500 duplicate Kafka messages into product CDC topic",
      "action": "Execute deduplication verification test script",
      "expected_result": "Consumer idempotently handles duplicates without creating duplicate Elasticsearch documents",
      "evidence_location": "Elasticsearch index count API output",
      "pass_criterion": "Final document count exactly equals source table count with 0 duplicates",
      "kind": "normal"
    },
    {
      "input": "High-volume batch load of 1,000 mutations across 10 seconds",
      "action": "Run python scripts/benchmark_latency.py",
      "expected_result": "Benchmark script measures end-to-end latency for each transaction",
      "evidence_location": "Benchmark summary console report",
      "pass_criterion": "Measured p95 end-to-end sync latency is < 1,500ms across all mutations",
      "kind": "normal"
    },
    {
      "input": "Dynamic product SKU and randomized price generated at runtime by verification script",
      "action": "Run python scripts/verify_dynamic_mutation.py --sku DYN-7890",
      "expected_result": "Script executes SQL update, monitors Kafka offset, and confirms dynamic SKU in Elasticsearch",
      "evidence_location": "Verification execution console output log",
      "pass_criterion": "Script confirms dynamic record reflected in search index within 2 seconds with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected Change Data Capture pipeline using Debezium and Kafka streaming PostgreSQL write-ahead logs to Elasticsearch; achieved [P95_LATENCY] tail sync freshness and sustained [THROUGHPUT_RATE] events/sec throughput with idempotent deduplication across [EVENT_COUNT] event mutations.",
    "claims": [
      {
        "text": "achieved [P95_LATENCY] tail sync freshness",
        "rubric_indexes": [1, 3]
      },
      {
        "text": "sustained [THROUGHPUT_RATE] events/sec throughput",
        "rubric_indexes": [3]
      },
      {
        "text": "idempotent deduplication across [EVENT_COUNT] event mutations",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "zero-lag replication across global regions or multi-master conflict resolution without committed cluster logs"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a Change Data Capture pipeline using Debezium to stream PostgreSQL write-ahead log mutations into Kafka, synchronizing a downstream Elasticsearch search index idempotently.",
    "q2": "Core path: PostgreSQL logical replication, Debezium connector, Kafka streaming, Python idempotent consumer, and Elasticsearch sync (29h). Extended path: Transactional outbox router and Schema Registry integration (+14h).",
    "q3": "Components: PostgreSQL WAL (4h), Debezium Connect (5h), Python Consumer (4h), Elasticsearch Sync (4h), Benchmark & Chaos (4h), Docs & Buffer (4h). Total 25h x 1.15 = 29h.",
    "q4": "Project types: Data pipeline/ETL/streaming, Distributed systems. Metrics: End-to-End Change Propagation Latency, Idempotent Deduplication Invariant, Ingestion Throughput. Rejected: GPU inference throughput.",
    "q5": "Hard parts: PostgreSQL replication slot disk retention, consumer duplicate handling, schema evolution handling, and event ordering across partitions.",
    "q6": "Starter input: synthetic product catalog schema with 5,000 initial records and update script producing 20,000 mutations. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: SQLite WAL mock without Docker.",
    "q8": "Riskiest component: Replication slot WAL disk buildup. Fallback: configure max_slot_wal_keep_size.",
    "q9": "Potential faking: pre-populated Elasticsearch index. Anti-fake check 5 inserts a dynamic random product SKU at runtime and verifies live end-to-end synchronization.",
    "q10": "Safety/ethics: Safe; synthetic e-commerce catalog data only."
  }
}

b7_old_diag = """
- **Old Title**: Change Data Capture (CDC) & Event Sourcing Pipeline
- **Domain**: Data Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of actual code; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 4.5 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 4.0 / 10 (banned marketing: 'LinkedIn, top tech platforms', 'table stakes for senior data', 'explicitly listed in JDs')
- Resume Bullet Safety: 4.0 / 10 (syntax glitch: 'at [N] req/sec events/sec with exactly-once guarantees')
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CDC pipeline using HTTP endpoint benchmarking rather than replication freshness lag and capture throughput.
2. **Circular rubric pass lines**:
   > "1. Verify database INSERT/UPDATE/DELETE replicated to Elasticsearch within 500ms; passes when verified by automated test script or benchmark log."
3. **Syntax glitch in resume bullet**:
   > "within [M ms] at [N] req/sec events/sec with exactly-once guarantees."
"""

b7_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 29 hours (INTERMEDIATE); runs locally using Docker Compose on 8GB RAM at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Sync freshness latency (< 1,500ms) and capture throughput (> 1,000 events/sec) measured across 1,000 synthetic mutations.",
    "Is there a CPU/local/free fallback?": "YES. Local SQLite WAL mock pipeline without Docker if container memory is restricted.",
    "Can test data be created in minutes?": "YES. E-commerce product catalog SQL migration and mutation scripts provided.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full pipeline tests and dynamic record validation in under 3 minutes.",
    "Are targets and rubric project-specific?": "YES. Write-ahead log propagation latency, idempotent deduplication, and CDC record throughput are unique to change data pipelines.",
    "Is every bullet claim verified by rubric?": "YES. Freshness verified by Check 1 & 3; throughput verified by Check 3; deduplication verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] generates dynamic product SKU at runtime and verifies live search index reflection.",
    "Are all terms accurate?": "YES. Accurately details logical decoding, write-ahead logging, Debezium connectors, and idempotent consumer upserts.",
    "Does problem statement promise only what is verified?": "YES. PostgreSQL WAL capture, Kafka streaming, and idempotent search indexing are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic product catalog data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering replication slot disk management, consumer deduplication, schema evolution, and event ordering."
}

b7_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split transactional outbox router and Schema Registry to Extended Path (+14h).
- Target Realism: Replaced copied web-service targets with genuine CDC metrics (end-to-end sync freshness latency, idempotent deduplication, and capture throughput).
- Removed Banned Content: Removed LinkedIn and 'top tech platforms' marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic mutation check.
- Resume Formula: Fixed syntax glitch ('[N] req/sec events/sec') into clean placeholders [P95_LATENCY], [THROUGHPUT_RATE], and [EVENT_COUNT] with 'Do not claim' boundary.
"""

# ==============================================================================
# 8. brief-ci-cd-from-scratch
# ==============================================================================
b8_data = {
  "id": "brief-ci-cd-from-scratch",
  "title": "Minimal CI/CD System from Scratch with Build Agents",
  "domain": "Platform & DevOps",
  "difficulty": "ADVANCED",
  "project_types": ["CI/CD/DevOps/security pipelines", "CLI/tools/libraries"],
  "problem": "Relying on black-box hosted CI/CD services obscures the fundamental distributed systems principles required to build scalable, secure continuous integration infrastructure. Multi-tenant build systems must parse pipeline definitions, schedule directed acyclic graph (DAG) tasks across worker pools, enforce process isolation between untrusted build jobs, stream live terminal logs without memory leaks, and persist artifacts securely. This project implements a custom containerized CI/CD engine in Go consisting of a central job scheduler server and autonomous worker agents that execute pipeline stages in isolated Docker containers with live WebSocket log streaming.",
  "use_cases": [
    "Air-gapped and self-hosted build automation for regulated enterprise environments",
    "High-performance continuous integration runner with localized Docker layer caching",
    "Lightweight task orchestration engine for automated test execution and artifact bundling"
  ],
  "hard_parts": [
    "Parsing pipeline definitions into directed acyclic graphs and scheduling parallel tasks without deadlock",
    "Managing Docker container lifecycles safely on worker nodes to prevent zombie containers upon job cancellation",
    "Streaming high-volume stdout and stderr terminal logs over WebSockets without unbounded memory buffers",
    "Enforcing secure agent-to-server communication and mutual authentication across untrusted networks"
  ],
  "screener_signals": [
    "Modular Go architecture cleanly separating controller scheduler from worker execution daemons",
    "Deterministic DAG scheduler executing parallel stages with topological sort verification",
    "Anti-fake verification script running dynamic job specifications and validating live log output streams"
  ],
  "job_families": [
    "Platform Engineer",
    "DevOps Infrastructure Engineer",
    "Systems Software Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "core implementation language for scheduler server, agent daemon, and CLI tool"},
    {"tool": "Docker", "role": "container engine providing hermetic process isolation for build job steps"},
    {"tool": "SQLite", "role": "lightweight transactional database storing pipeline runs, stages, and agent states"},
    {"tool": "WebSockets", "role": "bidirectional real-time protocol for task dispatch and live terminal log streaming"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Pipeline DAG Engine",
        "tools_used": ["Go"],
        "purpose": "Parses YAML pipeline specifications into dependency graphs and validates topological execution order"
      },
      {
        "name": "Central Scheduler Server",
        "tools_used": ["Go", "SQLite"],
        "purpose": "Manages job queues, persists pipeline execution history, and assigns ready tasks to available agents"
      },
      {
        "name": "Worker Execution Agent",
        "tools_used": ["Go", "Docker"],
        "purpose": "Pulls assigned tasks, spawns isolated Docker worker containers, and monitors container exit status"
      },
      {
        "name": "Log Streaming Daemon",
        "tools_used": ["Go", "WebSockets"],
        "purpose": "Captures container stdout and stderr streams and broadcasts live chunks to connected clients"
      }
    ],
    "data_flow": "Users submit a pipeline YAML file via CLI; the DAG Engine resolves task dependencies; the Scheduler persists stages in SQLite and enqueues root tasks; an available Worker Agent claims the task via WebSockets; the agent spawns an isolated Docker container with the specified image; container logs stream in real-time over WebSockets to the server; upon container exit, the agent reports exit codes, triggering subsequent dependent tasks.",
    "enforcement_mechanism": "Container resource limits enforce CPU and memory boundaries; timeout watchdog terminates hung containers after configured duration."
  },
  "targets": [
    {
      "metric": "DAG Stage Execution Dependency Adherence",
      "method": "Verification of topological stage execution order across complex dependency graphs",
      "input": "20 test pipeline specifications with parallel branches, join stages, and sequential dependencies",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "20 of 20 test pipelines execute stages in strict dependency order with 0 race conditions",
      "target": "20 of 20 test pipelines execute stages in strict dependency order with 0 race conditions",
      "report": "Unit test execution output and stage execution timestamp logs"
    },
    {
      "metric": "Worker Container Cancellation Cleanup Duration",
      "method": "Measurement of time elapsed between pipeline cancellation command and container destruction",
      "input": "Running build job executing infinite loop inside Docker worker container",
      "environment": "Standard 4-core local CPU, Docker Engine 24+",
      "minimum_pass": "Worker container stopped and removed within 4.0 seconds of cancellation signal",
      "target": "Worker container stopped and removed within 1.5 seconds of cancellation signal",
      "report": "Docker daemon event log confirming container kill and rm events"
    },
    {
      "metric": "Terminal Log Streaming Transmission Latency",
      "method": "Measurement of latency from container stdout write to WebSocket client delivery",
      "input": "Synthetic build job emitting 5,000 log lines at 500 lines per second",
      "environment": "Standard 4-core local CPU, local loopback network",
      "minimum_pass": "p95 log transmission latency < 80ms without dropped lines",
      "target": "p95 log transmission latency < 35ms without dropped lines",
      "report": "Benchmark log analyzer reporting packet send and receive timestamps"
    }
  ],
  "skills": ["Go", "Docker", "SQLite", "WebSockets", "CI/CD", "DevOps"],
  "starter_input": {
    "spec": "YAML pipeline schema specification and collection of test build definitions covering lint, test, and build stages.",
    "size": "5 test pipeline definitions ranging from simple single-step jobs to complex multi-stage fan-out/fan-in DAGs",
    "seeded_cases": "Cyclic dependency graphs, failing intermediate stages, runaway memory jobs, and abrupt agent disconnects",
    "label_source": "Deterministic Go test fixtures and expected exit status assertions",
    "personal_data_policy": "Strictly synthetic build commands (echo, test mocks, sleep); zero real credentials or repository code used"
  },
  "components": [
    {"name": "YAML Parser & DAG Topological Scheduler", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Docker Isolation Runner & Lifecycle Manager", "task_type": "low-level/system subsystem", "hours": 8.0},
    {"name": "WebSocket Dispatch & Communication Protocol", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "SQLite State Persistence & Job Queuing", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Log Streaming Daemon & Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Documentation, Architecture Diagram & Buffer", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Distributed artifact storage using local MinIO S3-compatible object store",
      "GitHub Webhook receiver validating HMAC SHA-256 signatures and reporting commit statuses"
    ],
    "hours": 15
  },
  "milestones": [
    {
      "name": "Pipeline Parser, DAG Scheduling & Concurrency Setup for CI/CD and DevOps Workflows",
      "hours": 9,
      "done_criterion": "Parser resolves pipeline YAML into DAG; unit tests verify topological sorting and cycle rejection."
    },
    {
      "name": "Docker Worker Isolation & Container Lifecycle Runner",
      "hours": 9,
      "done_criterion": "Worker daemon spawns isolated Docker containers, executes commands, and enforces memory limits."
    },
    {
      "name": "WebSocket Agent Protocol & Real-Time Log Streaming",
      "hours": 9,
      "done_criterion": "Server dispatches jobs over WebSockets; agent streams stdout/stderr chunks with sub-80ms latency."
    },
    {
      "name": "Cancellation Cleanup, Anti-Fake Test, Docs & Buffer",
      "hours": 7,
      "done_criterion": "Cancellation cleanly removes containers in < 4s; anti-fake test validates dynamic pipeline; docs complete."
    }
  ],
  "prerequisites": [
    "Intermediate Go programming (goroutines, channels, network sockets, context cancellation)",
    "Familiarity with Docker container APIs and volume mounts",
    "Basic understanding of graph algorithms (directed acyclic graphs, topological sorting)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound build job execution)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and Docker Engine installed",
    "fallback_path": "Local shell execution runner without Docker if Docker socket permissions are restricted"
  },
  "riskiest_component": {
    "name": "Dangling Zombie Docker Containers upon Abrupt Agent Termination",
    "fallback": "Implement an automated reaper process on server startup that labels and prunes orphaned runner containers"
  },
  "deliverables": [
    "Git repository containing Go server, agent daemon, CLI tool, and SQLite schema",
    "Sample pipeline YAML definitions demonstrating parallel and sequential stages",
    "Benchmark script verifying log streaming transmission latency",
    "Screener verification script executing pipeline runs and dynamic validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Kubernetes pod-based runner autoscaling",
    "Windows container execution support",
    "Hardware-assisted virtual machine isolation (Firecracker microVMs)"
  ],
  "safety_note": None,
  "resources": [
    "Docker Engine API SDK for Go official reference",
    "Gorilla WebSocket package documentation and connection lifecycle patterns",
    "Directed Acyclic Graph topological sorting algorithms in Go"
  ],
  "rubric": [
    {
      "input": "fixtures/pipeline_valid.yaml file",
      "action": "Run go test ./pkg/scheduler -v",
      "expected_result": "DAG scheduler parses steps and outputs valid topological execution plan",
      "evidence_location": "Terminal test output log",
      "pass_criterion": "All scheduler unit tests pass with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Pipeline run execution via CLI ./bin/ci run fixtures/build_job.yaml",
      "action": "Inspect Docker container lifecycle on worker host",
      "expected_result": "Worker spawns container, runs commands, captures stdout, and removes container on completion",
      "evidence_location": "CLI terminal output and docker ps -a log",
      "pass_criterion": "Build completes successfully with exit code 0 and container removed from host",
      "kind": "normal"
    },
    {
      "input": "Active running build job canceled via ./bin/ci cancel <job-id>",
      "action": "Verify worker container termination",
      "expected_result": "Worker intercepts cancellation and forcibly destroys container within 4 seconds",
      "evidence_location": "Agent log file and Docker daemon event stream",
      "pass_criterion": "Container state transitions to destroyed within 4 seconds with 0 leftover containers",
      "kind": "normal"
    },
    {
      "input": "5,000 log lines emitted by worker container",
      "action": "Run python scripts/verify_log_stream.py",
      "expected_result": "Log streaming client receives all lines in sequential order with p95 latency < 80ms",
      "evidence_location": "Verification summary report file",
      "pass_criterion": "Total received line count equals 5,000 with 0 dropped lines",
      "kind": "normal"
    },
    {
      "input": "Dynamic echo token generated at runtime by verification script",
      "action": "Run ./scripts/verify_dynamic_job.sh --token DYN-TOKEN-9941",
      "expected_result": "Server schedules job, agent executes echo command in clean container, and returns matching token in log stream",
      "evidence_location": "Verification execution console output log",
      "pass_criterion": "Execution log matches dynamic token with exit status 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected containerized CI/CD pipeline engine in Go using Docker and WebSockets; executed parallel task DAGs with topological dependency scheduling, live terminal log streaming under [STREAM_LATENCY] latency, and automated container teardown within [TEARDOWN_TIME] seconds.",
    "claims": [
      {
        "text": "executed parallel task DAGs with topological dependency scheduling",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "live terminal log streaming under [STREAM_LATENCY] latency",
        "rubric_indexes": [3]
      },
      {
        "text": "automated container teardown within [TEARDOWN_TIME] seconds",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "carrier-grade enterprise runner scale or multi-tenant kernel sandbox security without microVM isolation"
  },
  "verify": [],
  "worksheet": {
    "q1": "The student builds a containerized CI/CD system in Go consisting of a DAG task scheduler, a worker agent daemon executing steps in isolated Docker containers, and WebSocket log streaming.",
    "q2": "Core path: YAML parser, DAG scheduler, Docker worker isolation, WebSocket log streaming, and cancellation cleanup (34h). Extended path: S3 artifact store and GitHub webhook receiver (+15h).",
    "q3": "Components: DAG Parser (5h), Docker Runner (8h), WebSocket Protocol (5h), SQLite Queuing (4h), Log Streaming (4h), Docs & Buffer (4h). Total 30h x 1.15 = 34.5 -> 34h.",
    "q4": "Project types: CI/CD/DevOps/security pipelines, CLI/tools/libraries. Metrics: DAG Execution Adherence, Container Cleanup Duration, Log Streaming Latency. Rejected: SQL query execution plans (not an analytical database).",
    "q5": "Hard parts: DAG cycle detection and topological sorting, Docker container cleanup on cancellation, WebSocket memory buffering, and agent authentication.",
    "q6": "Starter input: 5 YAML pipeline definitions covering parallel stages, cyclic errors, and failing tests. No real user data.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local shell runner without Docker.",
    "q8": "Riskiest component: Dangling zombie Docker containers. Fallback: startup container reaper process.",
    "q9": "Potential faking: static mocked logs. Anti-fake check 5 passes a dynamic token at runtime and asserts live container execution and token logging.",
    "q10": "Safety/ethics: Safe; local Docker container execution only."
  }
}

b8_old_diag = """
- **Old Title**: Minimal CI/CD System from Scratch with Build Agents
- **Domain**: Platform & DevOps
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.5 / 10 (vague marketing statements)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.25 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CI/CD build runner using HTTP service metrics rather than DAG scheduling adherence and log streaming latencies.
2. **Circular rubric pass lines**:
   > "1. Verify master receives webhook, queues job, and assigns to available worker; passes when verified by automated test script or benchmark log."
"""

b8_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 34 hours (ADVANCED); runs locally on 8GB RAM with Go and Docker at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Container cleanup (< 4s) and log streaming latency (< 80ms) measured directly on local Docker host.",
    "Is there a CPU/local/free fallback?": "YES. Local shell runner mode without Docker if socket access is restricted.",
    "Can test data be created in minutes?": "YES. Test YAML pipeline definitions provided in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full pipeline tests and dynamic token job in under 3 minutes.",
    "Are targets and rubric project-specific?": "YES. DAG dependency adherence, container teardown time, and terminal log transmission latency are unique to CI/CD engines.",
    "Is every bullet claim verified by rubric?": "YES. DAG scheduling verified by Checks 1 & 2; log streaming verified by Check 4; container teardown verified by Check 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] executes job with dynamic echo token and verifies live output.",
    "Are all terms accurate?": "YES. Accurately details DAG resolution, topological sorting, Docker isolation, and WebSocket streaming.",
    "Does problem statement promise only what is verified?": "YES. Pipeline scheduling, container isolation, and log streaming are directly built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic test scripts and mock build commands.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering DAG deadlocks, zombie container cleanup, log streaming memory, and agent authentication."
}

b8_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split S3 artifact storage and GitHub webhooks to Extended Path (+15h).
- Target Realism: Replaced copied web-service targets with genuine CI/CD engine metrics (DAG stage adherence, container cancellation teardown, and log streaming latency).
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic token job test.
- Resume Formula: Structured into single sentence using measured placeholders [STREAM_LATENCY] and [TEARDOWN_TIME] with strict 'Do not claim' boundary.
"""

def run_part1():
    res4 = process_brief(b4_data, b4_old_diag, {"topic_value": 9.0, "verification_rubric": 4.5, "technical_accuracy": 6.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 7.0, "resume_bullet_safety": 6.0}, {"no_milestones_and_deliverables": True}, b4_reviewer, b4_changelog)
    res5 = process_brief(b5_data, b5_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 4.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 4.0, "resume_bullet_safety": 4.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b5_reviewer, b5_changelog)
    res6 = process_brief(b6_data, b6_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 4.5, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 4.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b6_reviewer, b6_changelog)
    res7 = process_brief(b7_data, b7_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 4.5, "scope_realism": 5.0, "completeness": 4.0, "honesty": 4.0, "resume_bullet_safety": 4.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b7_reviewer, b7_changelog)
    res8 = process_brief(b8_data, b8_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 6.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True}, b8_reviewer, b8_changelog)
    return [res4, res5, res6, res7, res8]

if __name__ == "__main__":
    results = run_part1()
    print("Part 1 finished successfully:", results)

