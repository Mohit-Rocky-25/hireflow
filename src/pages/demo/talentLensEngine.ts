// ============================================================
// HireFlow — TalentLens™ AI Calculation & Evaluation Engine (P2)
// Extracted pure computational logic, deterministic scoring,
// market intelligence analysis, and recommendation generation.
// ============================================================

export interface Role {
  title: string;
  level: string;
  desc: string;
  competencies: string[];
  reqLevel?: Record<string, string>;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  aboutRole?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  toolsAndTech?: string[];
  requiredSkills?: string[];
  fullText?: string;
  selectionProcess?: { stage: string }[];
  source?: string;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  status?: 'verified' | 'needs-recheck' | 'unverified';
  [key: string]: any;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  gradient: string;
  industry: string;
  hq: string;
  tier: string;
  hiring2023?: number;
  hiring2024?: number;
  openRoles?: number;
  roles: Role[];
  source?: string;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  status?: 'verified' | 'needs-recheck' | 'unverified';
  [key: string]: any;
}

export const INDUSTRIES = [
  "All", "Technology", "Fintech", "E-commerce", "IT Services", "SaaS",
  "Food Tech", "Mobility", "Quick Commerce", "Stock Broking", "Gaming",
  "Developer Tools", "HRTech SaaS", "Neobanking / Fintech",
  "Investment Banking Tech", "Semiconductor / AI", "Industrial Tech / Software",
  "Automotive Software / IoT", "Retail Tech", "Payments / Fintech",
  "Enterprise SaaS", "Enterprise Software"
];

export const TIERS = ["All", "FAANG", "Unicorn", "MNC", "IT Services", "Startup", "Enterprise"];

export const TREND_COLOR: Record<string, string> = { up: 'text-success', down: 'text-danger', stable: 'text-warning' };
export const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' };

export const STATUS_CONFIG = {
  expert: { label: 'Expert', color: 'text-success', bg: 'bg-success-bg', border: 'border-success/20', bar: 'bg-success' },
  strong: { label: 'Strong', color: 'text-primary', bg: 'bg-primary-light', border: 'border-primary/20', bar: 'bg-primary' },
  working: { label: 'Partial', color: 'text-warning', bg: 'bg-warning-bg', border: 'border-warning/20', bar: 'bg-warning' },
  absent: { label: 'Not Found', color: 'text-danger', bg: 'bg-danger-bg', border: 'border-danger/20', bar: 'bg-danger' },
};

export const getCompanySlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function getSentences(text: string): string[] {
  return text.split(/[.!\n]/).map(s => s.trim()).filter(s => s.length > 10);
}

export function verifyKeywordInContext(text: string, keyword: string): { inContext: boolean; contextSentences: string[] } {
  const sentences = getSentences(text);
  const experienceMarkers = [
    "built","developed","designed","implemented","used","worked","deployed",
    "architected","migrated","maintained","optimized","integrated","scaled","led",
    "created","shipped","managed","contributed","reduced","improved","automated",
    "solved","produced","handled"
  ];
  const contextSentences = sentences.filter(s => {
    const sl = s.toLowerCase();
    return sl.includes(keyword.toLowerCase()) && experienceMarkers.some(m => sl.includes(m));
  });
  return { inContext: contextSentences.length > 0, contextSentences: contextSentences.slice(0, 2) };
}

export function detectKeywordStuffing(text: string, keywords: string[]): { isStuffing: boolean; stuffingScore: number } {
  const sentences = getSentences(text);
  const totalKeywordsFound = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
  const keywordsInContext = keywords.filter(kw => sentences.some(s => {
    const sl = s.toLowerCase();
    return sl.includes(kw) && /built|developed|designed|implemented|used|worked|deployed|optimized/.test(sl);
  })).length;
  const ratio = totalKeywordsFound > 0 ? keywordsInContext / totalKeywordsFound : 1;
  return { isStuffing: totalKeywordsFound > 4 && ratio < 0.25, stuffingScore: Math.round(ratio * 100) };
}

export function parseImpactMetrics(text: string): {
  hasScale: boolean;
  hasMetrics: boolean;
  hasTeamSize: boolean;
  hasProduction: boolean;
  scaleDetails: string[];
  metricDetails: string[];
} {
  const tl = text.toLowerCase();
  const scalePatterns: [RegExp, string][] = [
    [/(\d[\d,.]*)\s*(million|billion)\s*(users?|customers?|requests?|transactions?)/gi, "M/B-scale users or transactions"],
    [/(\d[\d,.]*)k?\+?\s*(users?|dau|mau|customers?)/gi, "user-scale metrics"],
    [/(\d[\d,.]*)\s*(requests?|rps|qps)\s*(per\s*(second|minute|day))?/gi, "throughput / RPS metrics"],
    [/(\d[\d,.]*)\s*(tb|gb|pb)\s*(of\s*)?(data|storage)/gi, "data scale"],
    [/(\d[\d,.]*)\%\s*(uptime|availability|sla)/gi, "SLA / uptime metrics"],
  ];
  const metricPatterns: [RegExp, string][] = [
    [/(\d[\d,.]*)\s*%\s*(reduction|improvement|increase|faster|decrease)/gi, "percentage improvement"],
    [/reduced?\s+.*?(by\s+\d|latency|time|cost)/gi, "latency/cost reduction"],
    [/(\d+)x\s+(faster|improvement|speedup)/gi, "speedup multiplier"],
    [/saved?\s+.*?(hours?|\$|dollars?|time)/gi, "time/cost savings"],
  ];
  const scaleDetails: string[] = [];
  const metricDetails: string[] = [];
  scalePatterns.forEach(([p, label]) => { const rp = new RegExp(p); if (rp.test(tl)) scaleDetails.push(label); });
  metricPatterns.forEach(([p, label]) => { const rp = new RegExp(p); if (rp.test(tl)) metricDetails.push(label); });
  const hasTeamSize = /led\s+(a\s+)?(team\s+of)?\s*\d+|managed\s+\d+\s*(engineers?|developers?|people)|team\s+of\s*\d+/.test(tl);
  const hasProduction = /production|prod\s+env|live\s+(system|service|app)|deployed\s+to\s+(prod|aws|gcp|azure|cloud)|in\s+production/.test(tl);
  return { hasScale: scaleDetails.length > 0, hasMetrics: metricDetails.length > 0, hasTeamSize, hasProduction, scaleDetails, metricDetails };
}

export function detectProgressionSignals(text: string): {
  hasProgression: boolean;
  yearsOfExperience: number;
  hasPremiumEdu: boolean;
  hasOpenSource: boolean;
  details: string[];
} {
  const tl = text.toLowerCase();
  let yearsOfExperience = 0;
  const yrMatch = /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp|working|in\s+)/i.exec(tl);
  if (yrMatch) yearsOfExperience = parseInt(yrMatch[1]);
  const hasPremiumEdu = /\b(iit|nit|bits\s+pilani|iiit|iisc|iim|mit\b|stanford|berkeley|cmu|carnegie\s+mellon|waterloo|oxford|cambridge)\b/i.test(tl);
  const hasOpenSource = /github\.com\/([\w-]+\/[\w-]+)|open[- ]?source\s+contributor|maintainer\s+of|published\s+(npm|pypi)|(\d+)\s*stars?\s+on\s+github/i.test(tl);
  const hasProgression = /promoted|senior\s+engineer|lead\s+engineer|principal|staff\s+engineer|architect|engineering\s+manager|founded|co-?founded/i.test(tl);
  const details: string[] = [];
  if (yearsOfExperience > 0) details.push(`${yearsOfExperience}+ years experience`);
  if (hasPremiumEdu) details.push("Premium institution");
  if (hasOpenSource) details.push("Open source contributions");
  if (hasProgression) details.push("Career growth signals");
  return { hasProgression, yearsOfExperience, hasPremiumEdu, hasOpenSource, details };
}

export function deepAnalyzeCompetency(
  resumeText: string,
  competency: string,
  reqLevel: string,
  competencySignalsOverride?: Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }>
): {
  status: "expert" | "strong" | "working" | "absent";
  confidence: number;
  evidence: string[];
  gaps: string[];
  layerScores: { l1: number; l2: number; l3: number; l4: number; l5: number };
  contextSentences: string[];
  antiGamingFlag: boolean;
} {
  const text = resumeText.toLowerCase();
  const signals = (competencySignalsOverride && competencySignalsOverride[competency]) || {
    keywords: [competency],
    contextPhrases: [],
    redFlags: []
  };

  const kwMatches = signals.keywords.filter(kw => text.includes(kw));
  const l1Score = Math.min(100, kwMatches.length * 14);

  const contextResults = kwMatches.map(kw => verifyKeywordInContext(text, kw)).filter(r => r.inContext);
  const contextSentences = contextResults.flatMap(r => r.contextSentences).slice(0, 3);
  const l2Score = contextResults.length > 0 ? Math.min(100, contextResults.length * 25) : 0;

  const ctxMatches = signals.contextPhrases.filter(phrase => text.includes(phrase));
  const l3Score = Math.min(100, ctxMatches.length * 30);

  const impact = parseImpactMetrics(text);
  const l4Score = (impact.hasScale ? 35 : 0) + (impact.hasMetrics ? 30 : 0) + (impact.hasTeamSize ? 20 : 0) + (impact.hasProduction ? 15 : 0);

  const stuffing = detectKeywordStuffing(text, signals.keywords);
  const antiGamingFlag = stuffing.isStuffing;
  const l5Penalty = stuffing.isStuffing ? -30 : 0;

  const redFlagCount = signals.redFlags.filter(rf => text.includes(rf)).length;

  const rawScore = (l1Score * 0.15) + (l2Score * 0.30) + (l3Score * 0.25) + (l4Score * 0.30) + l5Penalty - (redFlagCount * 15);
  const clampedScore = Math.max(0, Math.min(100, rawScore));

  let detectedLevel: "expert" | "strong" | "working" | "absent";
  let confidence: number;
  if (redFlagCount > 0 && kwMatches.length < 2) { detectedLevel = "absent"; confidence = 5; }
  else if (antiGamingFlag && contextResults.length < 2) { detectedLevel = "working"; confidence = 20; }
  else if (clampedScore >= 72 && contextResults.length >= 2) { detectedLevel = "expert"; confidence = Math.round(clampedScore); }
  else if (clampedScore >= 45 && contextResults.length >= 1) { detectedLevel = "strong"; confidence = Math.round(clampedScore); }
  else if (kwMatches.length >= 1) { detectedLevel = "working"; confidence = Math.round(Math.max(15, clampedScore)); }
  else { detectedLevel = "absent"; confidence = 5; }

  const LEVELS = ["working", "strong", "expert"];
  const detectedIdx = LEVELS.indexOf(detectedLevel === "absent" ? "working" : detectedLevel);
  const requiredIdx = LEVELS.indexOf(reqLevel === "working" ? "working" : reqLevel);
  const meetsRequirement = detectedLevel !== "absent" && detectedIdx >= requiredIdx;

  const evidence: string[] = [];
  const gaps: string[] = [];

  if (contextSentences.length > 0) {
    evidence.push(`Verified in ${contextResults.length} experience/project sentence(s) — authentic contextual usage confirmed, not just a skills list.`);
  } else if (kwMatches.length > 0) {
    evidence.push(`"${kwMatches[0]}" keyword detected but found only in skills section or list — no experience context sentence confirmed.`);
  }
  if (ctxMatches.length > 0) evidence.push(`Production-depth signals: "${ctxMatches.slice(0, 2).join('", "')}" — indicates real professional hands-on exposure.`);
  if (impact.hasScale) evidence.push(`System-scale metrics detected (${impact.scaleDetails.slice(0, 2).join(", ")}) — strong signal of real distributed system ownership.`);
  if (impact.hasMetrics) evidence.push(`Quantified impact found (${impact.metricDetails.slice(0, 2).join(", ")}) — interviewers at top companies heavily weight measurable outcomes.`);
  if (impact.hasTeamSize) evidence.push("Team leadership context detected — relevant signal for senior and staff-level positions.");
  if (impact.hasProduction) evidence.push("Production/live deployment context confirmed — significantly more credible than side-project or dev-only experience.");

  if (antiGamingFlag) gaps.push(`Evidence Depth Notice: "${competency.toUpperCase()}" appears ${kwMatches.length}x primarily in list format. To maximize recruiter confidence, demonstrate it in project bullets with active verbs and measurable outcomes.`);
  if (!impact.hasScale && reqLevel === "expert") gaps.push(`Scale metrics are key for Expert-level ${competency.toUpperCase()} at top-tier companies. Add: "system handled 5M req/day", "served 2M active users", "processed ₹200Cr daily transactions". Without this, expert-level claim has no evidence.`);
  if (!impact.hasMetrics && detectedLevel !== "absent") gaps.push(`No measurable outcomes found for ${competency.toUpperCase()}. Add: "reduced p99 latency by 60% (800ms→320ms)", "improved throughput by 3x using connection pooling", "cut cloud spend by ₹5L/month via reserved instances".`);
  if (!ctxMatches.length && reqLevel === "expert") gaps.push(`No production-depth language detected for ${competency.toUpperCase()}. Expert-level requires context like: "architected from scratch", "led migration from X to Y", "performance-tuned production system serving N users", "designed database schema for N-billion rows".`);
  if (detectedLevel === "absent") gaps.push(`${competency.toUpperCase()} is completely absent from resume. This is a required competency — application will be automatically rejected at ATS stage. Minimum: 2 real projects with ${competency.toUpperCase()} plus quantified outcomes before applying.`);
  if (!meetsRequirement && detectedLevel !== "absent") gaps.push(`Role requires "${reqLevel}" level but resume evidence demonstrates only "${detectedLevel}". To bridge: deploy 2-3 production projects with documented scale, contribute to high-starred open source ${competency.toUpperCase()} projects, and get relevant certifications backed by project portfolios.`);
  if (contextSentences.length === 0 && kwMatches.length > 0) gaps.push(`${competency.toUpperCase()} only appears in skills section header. Add a specific experience bullet: "Led [specific project] using ${competency.toUpperCase()} to [solve problem], resulting in [measurable outcome] for [N users/systems]."`);

  return {
    status: meetsRequirement ? detectedLevel : (detectedLevel === "absent" ? "absent" : "working"),
    confidence: Math.round(confidence),
    evidence,
    gaps,
    layerScores: {
      l1: Math.round(l1Score),
      l2: Math.round(l2Score),
      l3: Math.round(l3Score),
      l4: Math.round(l4Score),
      l5: stuffing.stuffingScore
    },
    contextSentences,
    antiGamingFlag
  };
}

export function computeScore(
  roleAnalysis: ReturnType<typeof deepAnalyzeCompetency>[],
  reqLevels: Record<string, string>,
  resumeText: string
): number {
  const text = resumeText.toLowerCase();
  const LEVEL_WEIGHTS: Record<string, number> = { expert: 1.5, strong: 1.2, working: 1.0 };
  const LEVEL_VALUES: Record<string, number> = { absent: 0, working: 0.35, strong: 0.70, expert: 1.0 };
  
  let totalWeight = 0;
  let earned = 0;
  const reqLevelValues = Object.values(reqLevels);
  roleAnalysis.forEach((a, i) => {
    const reqLevel = reqLevelValues[i] || "working";
    const weight = LEVEL_WEIGHTS[reqLevel] ?? 1.0;
    totalWeight += weight;
    earned += (LEVEL_VALUES[a.status] ?? 0) * weight;
  });

  // Base competency match: 70% of total score
  const competencyScore = totalWeight > 0 ? (earned / totalWeight) * 70 : 0;

  // Evidence & Scale Rigor: 20% of total score
  const impact = parseImpactMetrics(text);
  const scaleScore = (impact.hasScale ? 8 : 0) + 
                     (impact.hasMetrics ? 6 : 0) + 
                     (impact.hasProduction ? 4 : 0) + 
                     (impact.hasTeamSize ? 2 : 0);

  // Provenance & Growth Breadth: 10% of total score
  const progression = detectProgressionSignals(text);
  const breadthScore = (progression.hasOpenSource ? 5 : 0) + 
                       (progression.hasProgression ? 3 : 0) + 
                       (progression.hasPremiumEdu ? 2 : 0);

  // Unnatural repetition penalty (max 10 points)
  const stuffedCount = roleAnalysis.filter(a => a.antiGamingFlag).length;
  const penalty = Math.min(10, stuffedCount * 3);

  const finalScore = Math.round(competencyScore + scaleScore + breadthScore - penalty);
  return Math.min(100, Math.max(0, finalScore));
}

export const MARKET_INTELLIGENCE: Record<string, {
  currentStandard: string[];
  outdated: string[];
  emerging: string[];
  productionPatterns: string[];
  architectureSignals: string[];
  marketAdoption2024: string;
  redFlags: string[];
}> = {
  java: {
    currentStandard: ["spring boot 3", "virtual threads", "graalvm", "micronaut", "quarkus", "reactive", "webflux", "java 17", "java 21", "loom", "records", "sealed classes"],
    outdated: ["struts", "ejb", "spring 4", "xml config", "servlet 2", "log4j 1", "ant build"],
    emerging: ["project loom", "project valhalla", "jdk 21", "graalvm native image", "spring ai"],
    productionPatterns: ["connection pooling (hikari)", "circuit breaker (resilience4j)", "distributed tracing (micrometer/otel)", "caching (caffeine/redis)", "idempotency keys", "outbox pattern", "cqrs"],
    architectureSignals: ["hexagonal architecture", "clean architecture", "domain-driven design", "event-driven", "cdc (debezium)", "kafka streams"],
    marketAdoption2024: "Java 17/21 is standard. Spring Boot 3 + GraalVM adoption is high across fintech and tier-1 tech.",
    redFlags: ["e.printstacktrace in prod", "synchronous rest chaining > 4 hops", "no connection timeout configured", "raw jdbc without pool"]
  },
  python: {
    currentStandard: ["fastapi", "pydantic v2", "poetry", "ruff", "uv", "asyncio", "python 3.11+", "type hints", "httpx", "sqlalchemy 2.0", "alembic", "celery 5"],
    outdated: ["django 1.x", "python 2", "flask without blueprints", "pipenv", "flake8/black (replaced by ruff)", "setup.py for new projects"],
    emerging: ["uv (astral)", "polars", "mojo", "marimo", "langchain/llamaindex production patterns", "litestar"],
    productionPatterns: ["async workers (gunicorn+uvicorn)", "task queue with backpressure", "structured logging (structlog)", "connection pooling", "database migrations in ci/cd"],
    architectureSignals: ["event-driven microservices", "hexagonal architecture", "cqrs", "feature store integration"],
    marketAdoption2024: "FastAPI is the default for APIs. Type hints and Pydantic v2 are expected in production codebases.",
    redFlags: ["no type hints in new services", "blocking io inside async def", "bare except clauses", "no virtual environment management"]
  },
  golang: {
    currentStandard: ["go 1.21+", "structured logging (slog)", "generics", "context propagation", "golangci-lint", "air (live reload)", "testify", "sqlc", "chi/gin", "grpc-go"],
    outdated: ["gorilla/mux (archived)", "glide/dep (replaced by go modules)", "panic in request handlers", "untyped context values"],
    emerging: ["go 1.22 routing", "ebpf with cilium/cilium", "wasm with go", "temporal go sdk"],
    productionPatterns: ["graceful shutdown", "channel buffers for rate limiting", "errgroup for concurrency", "prometheus metrics middleware", "pprof profiling"],
    architectureSignals: ["internal package pattern", "hexagonal/ports-and-adapters", "grpc service mesh", "event streaming (kafka/pulsar)"],
    marketAdoption2024: "Go is standard for high-throughput infrastructure, microservices, and platforms across tech unicorns.",
    redFlags: ["ignoring returned errors", "goroutine leaks without context cancellation", "sharing memory without synchronization"]
  },
  react: {
    currentStandard: ["react 18/19", "next.js 14+ (app router)", "vite", "typescript", "tailwind css", "zustand", "tanstack query", "server components", "shadcn/ui", "react hook form + zod"],
    outdated: ["class components", "redux boilerplate (pre-rtk)", "create-react-app (deprecated)", "enzyme", "styled-components for new projects"],
    emerging: ["react 19 compiler", "server actions", "tanstack start", "bun + react", "island architecture"],
    productionPatterns: ["optimistic updates", "code-splitting / lazy loading", "virtualized lists (tanstack virtual)", "error boundaries per route", "skeleton states"],
    architectureSignals: ["component-driven architecture", "atomic design", "micro-frontends (where justified)", "design system token architecture"],
    marketAdoption2024: "React 18 with Vite/Next.js and Tailwind is industry standard for modern frontend applications.",
    redFlags: ["useEffect for derived state", "unmemoized expensive computations in render", "prop drilling > 4 levels without context/store"]
  },
  typescript: {
    currentStandard: ["typescript 5.x", "strict: true", "zod", "type-fest", "satisfies operator", "template literal types", "const type parameters"],
    outdated: ["any everywhere", "tslint (deprecated)", "type assertions (as any)", "namespaces (use modules)"],
    emerging: ["isolated declarations", "type-level programming patterns", "arktype"],
    productionPatterns: ["branded types for ids", "exhaustive switch checks", "discriminated unions", "runtime schema validation with inference"],
    architectureSignals: ["monorepo sharing types between fe/be", "contract-first api design (openapi to ts)", "shared domain types"],
    marketAdoption2024: "Strict TypeScript is universal across tier-1 software companies.",
    redFlags: ["any types in public interfaces", "ts-ignore without tracking comments", "unchecked type assertions"]
  },
  kubernetes: {
    currentStandard: ["k8s 1.28+", "helm 3", "kustomize", "argo cd (gitops)", "istio/linkerd (service mesh)", "cert-manager", "horizontal pod autoscaler (hpa)", "prometheus operator"],
    outdated: ["helm 2 (tiller)", "manual kubectl apply in prod", "dockershim", "pod security policies (deprecated)"],
    emerging: ["gateway api", "karpenter (node autoscaling)", "cilium mesh", "open feature flags in k8s"],
    productionPatterns: ["pod disruption budgets", "resource requests/limits on all containers", "readiness and liveness probes with tuned timings", "network policies", "sealed secrets / external secrets operator"],
    architectureSignals: ["gitops deployment pipelines", "multi-tenant cluster isolation", "canary deployments (argo rollouts)", "dr / multi-region clusters"],
    marketAdoption2024: "ArgoCD + Helm/Kustomize is standard. Production clusters mandate strict security standards.",
    redFlags: ["containers running as root", "no resource limits (causes oom cascading)", "plain secrets in git", "missing probes"]
  },
  aws: {
    currentStandard: ["aws cdk v2", "terraform 1.6+", "lambda with arm/graviton", "ecs fargate", "aurora serverless v2", "eventbridge", "sqs/sns fifo", "secrets manager", "iam identity center"],
    outdated: ["cloudformation raw json/yaml for new infra", "ec2 without auto-scaling", "s3 without encryption", "hardcoded credentials in code", "classic load balancer"],
    emerging: ["graviton 4", "bedrock for generative ai", "step functions distributed map", "lambda response streaming"],
    productionPatterns: ["least-privilege iam roles", "vpc private subnets with nat gateways", "kms customer-managed keys", "cloudwatch alarms with sns routing", "waf on cloudfront/alb"],
    architectureSignals: ["well-architected framework", "multi-account organization (landing zone)", "event-driven architecture (eda)", "disaster recovery (active-active or warm standby)"],
    marketAdoption2024: "CDK/Terraform is mandatory for IaC. Serverless-first is standard for APIs and event handlers.",
    redFlags: ["root account api keys", "security groups with 0.0.0.0/0 on ssh/db ports", "no automated backups", "unencrypted at rest"]
  },
  dsa: {
    currentStandard: ["neetcode 150 patterns", "two pointers", "sliding window", "monotonic stack", "trie", "union-find", "dijkstra/bfs/dfs", "dynamic programming (1d/2d/knapsack)", "topological sort", "segment trees"],
    outdated: ["bubble/insertion sort in practical context", "recursion without memoization on exponential problems"],
    emerging: ["competitive programming algorithms in interview screens for high-frequency trading"],
    productionPatterns: ["cache-aware data structures", "bloom filters in production", "consistent hashing", "lru cache with o(1) operations", "radix tree for routing"],
    architectureSignals: ["algorithm selection based on p99 constraints", "memory vs time trade-off documentation"],
    marketAdoption2024: "DSA proficiency is the universal gate for FAANG and top unicorn hiring.",
    redFlags: ["o(n^2) nested loops on unbounded user input", "unbounded recursion without base case validation"]
  },
  systemdesign: {
    currentStandard: ["caching tiers (redis/cdn)", "distributed locking (redlock)", "rate limiting (token bucket)", "idempotency keys", "message brokers (kafka/sqs)", "database sharding", "read replicas", "eventual consistency"],
    outdated: ["monolith without horizontal scalability plan", "single database without backup/failover", "unauthenticated internal apis"],
    emerging: ["event sourcing with cqrs", "distributed tracing with opentelemetry", "cell-based architecture", "edge computing / edge workers"],
    productionPatterns: ["circuit breaker", "retry with exponential backoff and jitter", "dead letter queues", "graceful degradation", "bulkhead pattern"],
    architectureSignals: ["cap theorem trade-off justification", "data flow diagrams with p99 latency budgets", "capacity planning equations"],
    marketAdoption2024: "System design rounds are mandatory for all Mid, Senior, and Staff engineering hiring.",
    redFlags: ["single point of failure", "no caching", "synchronous blocking", "no retry logic", "no circuit breaker", "no observability"]
  },
};

export interface MarketIntelligenceReport {
  overallMarketFit: number;
  buildAuthenticity: number;
  techCurrencyScore: number;
  fundamentalDepth: number;
  findings: {
    category: string;
    icon: string;
    status: "cutting-edge" | "current" | "dated" | "critical";
    finding: string;
    marketContext: string;
    evidence: string[];
  }[];
  stackCurrency: {
    modernPractices: string[];
    outdatedSignals: string[];
    emergingAdoption: string[];
    missingForMarket: string[];
  };
  buildVerdict: string;
  marketPosition: "Industry Leader" | "Market Current" | "Needs Modernization" | "Significantly Behind";
}

export function runMarketIntelligenceEngine(
  resumeText: string,
  competencies: string[],
  company: { name: string; tier: string; industry: string },
  role: { title: string }
): MarketIntelligenceReport {
  const text = resumeText.toLowerCase();

  const findings: MarketIntelligenceReport["findings"] = [];
  const modernPractices: string[] = [];
  const outdatedSignals: string[] = [];
  const emergingAdoption: string[] = [];
  const missingForMarket: string[] = [];

  let modernScore = 0;
  let outdatedPenalty = 0;
  let emergingBonus = 0;
  let fundamentalScore = 0;

  competencies.forEach(comp => {
    const intel = MARKET_INTELLIGENCE[comp];
    if (!intel) return;

    const foundModern = intel.currentStandard.filter(s => text.includes(s));
    const foundOutdated = intel.outdated.filter(s => text.includes(s));
    const foundEmerging = intel.emerging.filter(s => text.includes(s));
    const foundProduction = intel.productionPatterns.filter(s => text.includes(s));
    const foundArchitecture = intel.architectureSignals.filter(s => text.includes(s));
    const foundRedFlags = intel.redFlags.filter(s => text.includes(s));

    foundModern.forEach(m => modernPractices.push(`${comp.toUpperCase()}: ${m}`));
    foundOutdated.forEach(o => outdatedSignals.push(`${comp.toUpperCase()}: ${o}`));
    foundEmerging.forEach(e => emergingAdoption.push(`${comp.toUpperCase()}: ${e}`));

    const compModernRatio = (foundModern.length + foundEmerging.length * 1.5) /
      Math.max(1, intel.currentStandard.length * 0.3);
    const compProductionDepth = foundProduction.length + foundArchitecture.length;

    modernScore += Math.min(100, compModernRatio * 100);
    outdatedPenalty += foundOutdated.length * 12 + foundRedFlags.length * 20;
    emergingBonus += foundEmerging.length * 8;
    fundamentalScore += compProductionDepth * 10;

    const compScore = Math.min(100, Math.max(0,
      (compModernRatio * 60) + (compProductionDepth * 8) - (foundOutdated.length * 15) - (foundRedFlags.length * 25) + (foundEmerging.length * 10)
    ));

    let status: "cutting-edge" | "current" | "dated" | "critical";
    let icon: string;
    let finding: string;

    if (foundRedFlags.length > 0) {
      status = "critical";
      icon = "🚨";
      const flagList = foundRedFlags.slice(0, 2).join(', ');
      finding = `Practice note: Resume references ${flagList}. Modern production environments at ${company.name} typically emphasize ${foundModern.slice(0,2).join(', ') || intel.currentStandard.slice(0,2).join(', ')}.`;
    } else if (compScore >= 70 || foundEmerging.length >= 2) {
      status = "cutting-edge";
      icon = "⚡";
      finding = `Demonstrates cutting-edge ${comp.toUpperCase()} usage: ${foundModern.slice(0, 3).join(', ')}${foundEmerging.length ? ` + emerging: ${foundEmerging[0]}` : ''}. Aligns with ${company.name}'s 2024-25 engineering stack.`;
    } else if (compScore >= 40 || foundModern.length >= 2) {
      status = "current";
      icon = "✓";
      finding = `${comp.toUpperCase()} usage appears current (${foundModern.slice(0,2).join(', ')}) but lacks depth in production patterns. ${company.tier} companies expect: ${intel.productionPatterns.slice(0,3).join(', ')}.`;
    } else if (foundOutdated.length > 0) {
      status = "dated";
      icon = "⚠";
      const outdatedList = foundOutdated.slice(0,2).join(', ');
      finding = `${comp.toUpperCase()} stack appears dated (${outdatedList}). ${intel.marketAdoption2024} Add at least 2 modern practices to remain competitive.`;
    } else {
      status = "current";
      icon = "◑";
      finding = `${comp.toUpperCase()} signals are present but insufficient to assess production depth. Market standard: ${intel.marketAdoption2024}`;
    }

    if (intel.currentStandard.every(s => !text.includes(s))) {
      missingForMarket.push(`${comp.toUpperCase()}: No modern practices found (need: ${intel.currentStandard.slice(0,3).join(', ')})`);
    }

    findings.push({
      category: comp.toUpperCase(),
      icon,
      status,
      finding,
      marketContext: intel.marketAdoption2024,
      evidence: [
        ...foundModern.slice(0, 3).map(m => `Modern: "${m}"`),
        ...foundEmerging.slice(0, 2).map(e => `Emerging: "${e}"`),
        ...foundProduction.slice(0, 2).map(p => `Production pattern: "${p}"`),
        ...foundOutdated.slice(0, 2).map(o => `⚠ Dated: "${o}"`),
        ...foundRedFlags.slice(0, 2).map(r => `🚨 Red flag: "${r}"`),
      ].filter(Boolean).slice(0, 5)
    });
  });

  const hasMultipleProjects = (text.match(/project|built|developed|created|shipped|launched/gi) || []).length >= 4;
  const hasTeamContext = /team of \d+|led \d+|managed \d+|collaborated with|cross.functional/i.test(text);
  const hasOpenSource = /github\.com|open.?source|contributor|stars|fork|pull request|pr merged/i.test(text);
  const hasDeployment = /deployed|production|live|aws|gcp|azure|vercel|heroku|docker|kubernetes/i.test(text);
  const hasMonitoring = /monitoring|observability|prometheus|grafana|datadog|sentry|new relic|cloudwatch|logging/i.test(text);
  const hasTesting = /unit test|integration test|e2e|tdd|jest|pytest|junit|coverage|ci.?cd/i.test(text);
  const hasDocumentation = /documented|architecture doc|rfc|adr|confluence|wiki|readme|swagger|openapi/i.test(text);

  const buildAuthFactors = [hasMultipleProjects, hasTeamContext, hasOpenSource, hasDeployment, hasMonitoring, hasTesting, hasDocumentation];
  const buildAuthScore = Math.round((buildAuthFactors.filter(Boolean).length / buildAuthFactors.length) * 100);

  const n = competencies.length || 1;
  const techCurrency = Math.min(99, Math.max(5,
    Math.round((modernScore / n) - (outdatedPenalty / n) + emergingBonus)
  ));
  const fundamentalDepth = Math.min(99, Math.max(5, Math.round(fundamentalScore / n * 3)));
  const overallMarketFit = Math.round((techCurrency * 0.40) + (buildAuthScore * 0.35) + (fundamentalDepth * 0.25));

  let marketPosition: MarketIntelligenceReport["marketPosition"];
  let buildVerdict: string;
  if (overallMarketFit >= 75) {
    marketPosition = "Industry Leader";
    buildVerdict = `Stack and build patterns are at or ahead of what ${company.name} engineers use in production. Strong candidate for immediate contribution.`;
  } else if (overallMarketFit >= 55) {
    marketPosition = "Market Current";
    buildVerdict = `Core stack is current but some production practices are missing. Would need 4-8 weeks of targeted modernization to be fully competitive at ${company.name}.`;
  } else if (overallMarketFit >= 35) {
    marketPosition = "Needs Modernization";
    buildVerdict = `Several key technologies appear outdated relative to ${company.name}'s stack. Systematic modernization of ${outdatedSignals.length} signals needed before applying.`;
  } else {
    marketPosition = "Significantly Behind";
    buildVerdict = `Stack significantly lags the current market. ${company.tier} companies like ${company.name} will screen this out at the ATS or first technical phone screen. Requires 3-6 months of deliberate stack modernization.`;
  }

  return {
    overallMarketFit: Math.min(99, Math.max(5, overallMarketFit)),
    buildAuthenticity: buildAuthScore,
    techCurrencyScore: Math.min(99, Math.max(5, techCurrency)),
    fundamentalDepth: Math.min(99, Math.max(5, fundamentalDepth)),
    findings,
    stackCurrency: { modernPractices, outdatedSignals, emergingAdoption, missingForMarket },
    buildVerdict,
    marketPosition,
  };
}

export function generateImprovementPlan(
  breakdown: { competency: string; reqLevel: string; analysis: ReturnType<typeof deepAnalyzeCompetency> }[],
  company: { name: string; tier: string; industry: string },
  role: { title: string; desc: string },
  score: number
): { priority: "critical" | "high" | "medium"; title: string; detail: string; timeframe: string; resources: string[] }[] {
  const plans: { priority: "critical" | "high" | "medium"; title: string; detail: string; timeframe: string; resources: string[] }[] = [];
  const SKILL_RESOURCES: Record<string, string[]> = {
    dsa: ["NeetCode 150 → Blind 75 → LeetCode Hard patterns (NeetCode.io)", "CTCI — Gayle Laakmann McDowell (6th Ed.)", "Codeforces Div.2 A-D with editorial deep-reading"],
    systemdesign: ["System Design Interview Vol.1+2 — Alex Xu (ByteByteGo.io)", "Designing Data-Intensive Applications — Martin Kleppmann", "ByteByteGo YouTube + newsletter"],
    java: ["Effective Java 3rd Ed. — Joshua Bloch", "Production Spring Boot patterns (Baeldung.com advanced guides)", "Build Java microservice: 10K+ rps + JVM tuning + metrics"],
    python: ["Fluent Python 2nd Ed. — Luciano Ramalho", "FastAPI production tutorial (Real Python, full stack)", "Deploy ML inference API: FastAPI + Docker + AWS Lambda"],
    golang: ["Effective Go + A Tour of Go (official, golang.org)", "Gophercises — Jon Calhoun (gophercises.com)", "Build 3 concurrent Go microservices with goroutines + gRPC + Prometheus"],
    react: ["Epic React — Kent C. Dodds (epicreact.dev)", "Josh Comeau's Joy of React", "Build real-time collaborative app: React + WebSocket + state management"],
    typescript: ["Total TypeScript — Matt Pocock (totaltypescript.com)", "TypeScript Deep Dive — Basarat Ali Syed (gitbook, free)", "Migrate personal project to strict TypeScript with zero 'any'"],
    kubernetes: ["Kubernetes The Hard Way — Kelsey Hightower (GitHub, free)", "CKA certification official curriculum (Linux Foundation)", "Deploy 5-service app: Helm charts + HPA + Istio service mesh + Prometheus"],
    aws: ["AWS Solutions Architect Associate SAA-C03 (Stephane Maarek, Udemy)", "Cloud Resume Challenge (cloudresumechallenge.dev, free)", "Build: API Gateway + Lambda + DynamoDB + CloudFront + WAF + CI/CD"],
    ml: ["Fast.ai Practical Deep Learning for Coders (free, fast.ai)", "Kaggle competitions — aim for silver medal in tabular/NLP track", "End-to-end: Train → Experiment track (MLflow) → FastAPI endpoint → Docker → AWS"],
    databases: ["Use The Index, Luke! — Markus Winand (free, use-the-index-luke.com)", "CMU 15-445 Database Systems — Andy Pavlo (free YouTube)", "Optimise real PostgreSQL queries on 10M+ row dataset, document before/after plans"],
    security: ["OWASP Top 10 — official OWASP documentation + labs", "TryHackMe Web Fundamentals path or HackTheBox (ethical hacking)", "Build OWASP-compliant REST API: JWT rotation + RBAC + rate-limiting + audit logs"],
    devops: ["DevOps Roadmap (roadmap.sh/devops)", "GitHub Actions + Terraform end-to-end CI/CD pipeline project", "Multi-env Infrastructure as Code: Terraform + Ansible + Packer + Monitoring"],
    leadership: ["Staff Engineer — Will Larson (staffeng.com, chapters free)", "Mentor 2 junior devs for 12 weeks, measure and document their growth", "Write 3 engineering RFCs/design docs with full peer review process"],
    finance: ["Flash Boys — Michael Lewis (market microstructure, highly readable)", "Build real-time stock dashboard using Alpha Vantage / Zerodha Kite API", "Study FIX protocol, order book mechanics, and settlement cycles"],
    communication: ["The Pyramid Principle — Barbara Minto (structured writing)", "Write 5 technical blog posts (dev.to / Hashnode) + measure engagement", "Give internal tech talks and collect written feedback from 3+ senior engineers"],
  };

  breakdown.filter(b => b.analysis.status === "absent").forEach(b => {
    plans.push({
      priority: "critical",
      title: `Critical Gap: ${b.competency.toUpperCase()} Completely Absent`,
      detail: `"${role.title}" at ${company.name} lists ${b.competency.toUpperCase()} as a mandatory requirement. Applications without it are filtered before a human recruiter reviews your profile. Action plan: (1) Complete one structured learning path, (2) Build 2 production-deployed projects using ${b.competency.toUpperCase()}, (3) Document each project with scale and metrics, (4) Add working demos, (5) Update resume bullets using STAR format.`,
      timeframe: b.reqLevel === "expert" ? "3-6 months intensive" : "6-10 weeks",
      resources: SKILL_RESOURCES[b.competency] || [`${b.competency} official documentation`, `Build 2 real projects using ${b.competency}`, `Open source contributions to ${b.competency} ecosystem`]
    });
  });

  breakdown.filter(b => b.analysis.status === "working" && (b.reqLevel === "expert" || b.reqLevel === "strong")).forEach(b => {
    plans.push({
      priority: "high",
      title: `Deepen ${b.competency.toUpperCase()}: Partial Evidence → ${b.reqLevel === "expert" ? "Expert" : "Strong"}`,
      detail: `Your resume references ${b.competency.toUpperCase()} but lacks the production-depth language that ${company.name} (${company.tier} tier) screeners look for. At "${role.title}" level, interviewers expect you to have solved non-trivial ${b.competency.toUpperCase()} problems at scale. Required upgrades: (1) Add system scale, (2) Name specific sub-tools and versions, (3) Describe a complex problem you solved, (4) Add a measurable business outcome.`,
      timeframe: "4-8 weeks",
      resources: [`Deploy a ${b.competency} project with real production traffic`, `Contribute a meaningful PR (>100 lines) to a 1K+ star ${b.competency} open source project`, `Write: "How I solved [hard ${b.competency} problem] in production"`]
    });
  });

  breakdown.filter(b => b.analysis.antiGamingFlag).forEach(b => {
    plans.push({
      priority: "high",
      title: `Rewrite ${b.competency.toUpperCase()} Bullets — Keyword Stuffing Detected`,
      detail: `TalentLens™ detected "${b.competency.toUpperCase()}" appears multiple times primarily outside experience/project descriptions. Every mention should be in a project bullet. Formula: "Used [${b.competency.toUpperCase()} + pattern] to [solve specific problem] resulting in [metric outcome].`,
      timeframe: "3-5 days (focused rewrite session)",
      resources: ["STAR format for each bullet", `LinkedIn: study ${company.name} engineers' resumes for ${b.competency} bullet structure`, "r/cscareerquestions resume advice"]
    });
  });

  const anyNoMetrics = breakdown.some(b => b.analysis.status !== "absent" && !b.analysis.evidence.some(e => e.includes("Quantified") || e.includes("scale")));
  if (anyNoMetrics) {
    plans.push({
      priority: "medium",
      title: "Quantify Every Project & Experience Bullet with Metrics",
      detail: `${company.name} (${company.tier}) receives hundreds of weekly applications. Engineers who quantify impact stand out immediately. Every project bullet must answer: How many users? What throughput/latency? What scale? What improved by how much?`,
      timeframe: "3-5 days",
      resources: ["Google's XYZ resume formula", "LinkedIn Resume Review tool", "Request review from a senior engineer"]
    });
  }

  const tierAdvice: Record<string, string> = {
    FAANG: `${company.name} runs a structured hiring pipeline: Resume Screen → OA/Phone Screen → Virtual Onsite. Your current score (${score}%) suggests: ${score >= 75 ? "strong foundation — focus on System Design at scale" : score >= 50 ? "addressable gaps — fix critical missing skills, then prepare DSA at Hard level" : "target 6 months: DSA + System Design + missing skills"}.`,
    Unicorn: `${company.name} moves faster than FAANG. Product ownership and "I shipped this" stories are weighted heavily. Prepare 5 STAR stories about high-impact product decisions and public GitHub code.`,
    MNC: `${company.name} values domain expertise in ${company.industry} alongside strong engineering fundamentals. Relevant certifications carry real weight.`,
    "IT Services": `${company.name} conducts standardised technical assessments followed by panel interviews. Certifications significantly differentiate candidates.`,
    Startup: `${company.name} is highly selective with small teams. Prioritise: breadth of skills, shipped products with real users, and open source presence.`,
    Enterprise: `${company.name} (${company.industry}) values deep domain knowledge and large-scale system integrations.`,
  };

  plans.push({
    priority: "medium",
    title: `${company.name} Interview Preparation Roadmap`,
    detail: tierAdvice[company.tier] || `Research ${company.name}'s engineering blog and public interview reports. Current TalentLens™ score: ${score}%.`,
    timeframe: "2-4 weeks of targeted company-specific prep",
    resources: [`"${company.name} engineering" blog`, `Public interview reports for "${role.title}" at ${company.name}`, `Connect with engineers at ${company.name}`]
  });

  return plans.slice(0, 7);
}

export type CompetencyAnalysis = ReturnType<typeof deepAnalyzeCompetency>;
export type ImprovementPlan = ReturnType<typeof generateImprovementPlan>;

export interface AnalysisResult {
  score: number;
  breakdown: {
    competency: string;
    reqLevel: string;
    analysis: CompetencyAnalysis;
  }[];
  plans: ImprovementPlan;
  marketIntel: MarketIntelligenceReport;
}

export const findCompanyBySlug = (slug: string, companyCatalog: Company[] = []): Company | undefined => {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const cleaned = normalized.replace(/[^a-z0-9]/g, '');
  return companyCatalog.find(c => {
    const slugName = getCompanySlug(c.name);
    const slugId = getCompanySlug(c.id);
    const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanId = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      slugName === normalized ||
      slugId === normalized ||
      c.id.toLowerCase() === normalized ||
      cleanName === cleaned ||
      cleanId === cleaned ||
      (cleaned.length >= 5 && (cleanName.includes(cleaned) || cleanId.includes(cleaned)))
    );
  });
};
