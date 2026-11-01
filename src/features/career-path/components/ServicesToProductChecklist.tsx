// ============================================================
// HIREFLOW CAREER PATH — SERVICES TO PRODUCT TRANSITION CHECKLIST
// Honest, realistic guidance for candidates moving from IT Services
// (TCS, Infosys, Wipro, Cognizant, etc.) to Product Companies
// ============================================================

import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  shortSummary: string;
  detailedGuidance: string;
  actionPoints: string[];
}

const TRANSITION_ITEMS: ChecklistItem[] = [
  {
    id: 'dsa',
    icon: Code2,
    title: '1. DSA & Problem Solving (Depth over Syntax)',
    badge: 'Interview Screen',
    shortSummary: 'Expect LeetCode Medium/Hard algorithmic problem solving, not syntax or framework trivia.',
    detailedGuidance:
      'Product companies screen heavily on data structures and algorithms (arrays, trees, graphs, dynamic programming, sliding window) where you must analyze time and space complexity tradeoffs in real time under ~45-minute constraints. Memorized syntax or basic framework questions will not pass the bar.',
    actionPoints: [
      'Focus on pattern mastery: two pointers, binary search, tree traversals, DFS/BFS graph patterns, and dynamic programming.',
      'Target 150–250 quality LeetCode problems (Blind 75 or NeetCode 150) rather than superficial quantity.',
      'Practice whiteboarding or live Google Docs coding without IDE auto-completion assistance.',
    ],
  },
  {
    id: 'system-design',
    icon: Cpu,
    title: '2. System Design: Low-Level + High-Level Design',
    badge: 'Technical Rounds',
    shortSummary: 'Expect both OOP design patterns (LLD) and distributed systems architecture (HLD), not just framework configuration.',
    detailedGuidance:
      'Services roles often focus on implementing specifications within existing frameworks. Product companies expect you to architect systems from scratch: class diagrams and schema design for SDE-1/2, plus distributed caching, message queues, idempotency, and partition tolerance for SDE-2/3.',
    actionPoints: [
      'Low-Level Design (LLD): Master SOLID principles, Factory/Strategy/Observer patterns, schema normalization, and concurrency safety.',
      'High-Level Design (HLD): Understand when to choose Redis vs. Memcached, Kafka vs. RabbitMQ, and SQL vs. NoSQL indexing tradeoffs.',
      'Be prepared to justify why you chose an architectural pattern, including failure modes and operational blast radiuses.',
    ],
  },
  {
    id: 'resume-framing',
    icon: FileText,
    title: '3. Resume Framing (Outcomes over Client Roster)',
    badge: 'Truth Gate',
    shortSummary: 'Shift from "worked on project X for client Y" to "built feature Z with measurable engineering outcome W".',
    detailedGuidance:
      'Product recruiters care about the systems you built, the scale you operated at, and the engineering tradeoffs you made. Avoid vendor confidentiality buzzwords or vague maintenance statements. Adhere strictly to the Truth Gate: never fabricate metrics, but clearly articulate business impact and technical ownership.',
    actionPoints: [
      'Transform bullet points: "Created REST endpoints for banking client" -> "Engineered event-driven reconciliation pipeline processing payment webhooks with automated idempotency retry logic".',
      'Highlight independent engineering initiatives: automation scripts, test suites, CI/CD pipelines, or latency optimizations you personally introduced.',
      'Only claim tools, architectures, and numbers you can defend deeply in technical interview grilling.',
    ],
  },
  {
    id: 'notice-period',
    icon: Clock,
    title: '4. Notice Period Reality & Strategic Navigation',
    badge: 'Crucial Hurdle',
    shortSummary: '90-day notice periods are a major barrier; navigate strategically via buyouts, late-pipeline timing, or accommodating firms.',
    detailedGuidance:
      'Fast-growing tech startups and product unicorns frequently cannot wait 3 months for a candidate to join. In a competitive market, candidates with 15–30 day availability are prioritized. You must manage this constraint proactively rather than hoping recruiters will waive it.',
    actionPoints: [
      'Target Global Capability Centers (GCCs) and mature product firms (Amazon, Microsoft, Walmart, Salesforce) that regularly accommodate 60–90 day joiners.',
      'Check your current employer policy for official notice period buyout or accrued earned leave (EL) adjustments.',
      'Consider kicking off high-velocity interview loops once you enter the final 30–45 days of your notice period when your availability becomes competitive.',
    ],
  },
  {
    id: 'comp-jump',
    icon: TrendingUp,
    title: '5. Realistic Compensation Expectations',
    badge: 'Market Reality',
    shortSummary: 'Realistic first transition jump is typically 40–80%, rarely the 300% sensationalized on social media.',
    detailedGuidance:
      'Social media influencers often highlight exceptional 300%+ salary jumps from services to unicorns. While possible for exceptional campus switchers or top-tier niche skillsets, standard market calibration for a first lateral transition is a 40–80% hike over your fixed base, supplemented by annualized stock or retention incentives.',
    actionPoints: [
      'Benchmark against peer bands on verified portals (LeetCode Compensation discussions, Glassdoor India, Levels.fyi Bangalore/Hyderabad).',
      'Distinguish fixed annual base salary from variable bonuses and multi-year vesting equity.',
      'Prioritize engineering scope, mentorship culture, and brand tier in your first jump: compounding compensation accelerates rapidly on subsequent promotions.',
    ],
  },
];

export function ServicesToProductChecklist() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    dsa: true,
    'notice-period': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="rounded-xl border border-charcoal bg-near-black p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black text-volt text-xs font-mono font-bold border border-charcoal">
            <Info className="w-3.5 h-3.5" />
            <span>Honest Career Transition Guide</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            Services-to-Product Transition Checklist
          </h3>
          <p className="text-xs sm:text-sm text-silver max-w-2xl">
            Practical, unvarnished guidance for engineers transitioning from IT Services (TCS, Infosys, Wipro, Cognizant, HCL) to Tier-1 product firms and unicorns.
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {TRANSITION_ITEMS.map((item) => {
          const isOpen = !!openItems[item.id];
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className="rounded-lg border border-charcoal bg-black/60 overflow-hidden transition-colors hover:border-silver/40"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-near-black border border-charcoal text-volt shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-near-black text-volt border border-charcoal">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-silver mt-1">{item.shortSummary}</p>
                  </div>
                </div>

                <div className="text-silver p-1 shrink-0 mt-1">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-charcoal/60 space-y-3 text-xs">
                  <p className="text-silver leading-relaxed">{item.detailedGuidance}</p>

                  <div className="p-3 rounded bg-near-black border border-charcoal space-y-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block font-mono">
                      Actionable Roadmap Points:
                    </span>
                    <ul className="space-y-1.5 text-silver">
                      {item.actionPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-volt shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded bg-black border border-charcoal text-[11px] text-silver flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-pale-yellow shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Reality Check: </span>
          <span>
            Transitions take typically 4 to 9 months of dedicated preparation. Do not resign without a confirmed written offer and verified joining date.
          </span>
        </div>
      </div>
    </div>
  );
}

