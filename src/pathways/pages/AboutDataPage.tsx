// ============================================================
// Pathways Architecture — Route 5: About Data & Methodology
// Wireframe C13 Screen 5. Zero component arithmetic (Constitution E6).
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHWAYS_MANIFEST } from '../facts/manifest.generated';
import { PATHWAYS_STATUTORY_RULES } from '../facts/rules.generated';
import { EDITORIAL_ASSUMPTIONS } from '../models/assumptions';
import { NonAffiliationFooter } from '../components/NonAffiliationFooter';
import { FeedbackModal } from '../components/FeedbackModal';

export const AboutDataPage: React.FC = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between font-sans">
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link
            to="/tools/pathways"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Radar
          </Link>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="text-xs font-mono text-volt border border-volt/30 bg-volt/10 hover:bg-volt/20 px-3 py-1.5 rounded transition-colors"
          >
            Submit Data Correction ↗
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-zinc-800 text-zinc-200 uppercase tracking-wider">
              Provenance Ledger
            </span>
            <span className="text-zinc-400 text-xs font-mono font-medium">
              Build {PATHWAYS_MANIFEST.generatedAt.slice(0, 10)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Pathways: Data & Methodology
          </h1>
          <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed font-medium">
            Deterministic career facts and compensation rules for Indian engineering graduates. Every fact in the ledger is backed by an official primary document with an audit trail.
          </p>
        </div>

        {/* Data Provenance Census */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
            Data Provenance Census
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-mono text-xs font-semibold">Verified Programs</div>
              <div className="text-2xl font-black font-mono text-white">
                {PATHWAYS_MANIFEST.totalPrograms}
              </div>
              <div className="text-xs text-zinc-400 font-medium">Campus Tracks</div>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-mono text-xs font-semibold">Ledger Facts</div>
              <div className="text-2xl font-black font-mono text-volt">
                {PATHWAYS_MANIFEST.totalLedgerRows}
              </div>
              <div className="text-xs text-zinc-400 font-medium">Primary Evidence Rows</div>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-mono text-xs font-semibold">Statutory Rules</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {PATHWAYS_MANIFEST.totalStatutoryRules}
              </div>
              <div className="text-xs text-zinc-400 font-medium">Govt Notifications</div>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-mono text-xs font-semibold">Runtime Egress</div>
              <div className="text-2xl font-black font-mono text-white">
                0
              </div>
              <div className="text-xs text-zinc-400 font-medium">Pure Local Storage</div>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 text-xs font-mono text-zinc-300 space-y-1 font-medium">
            <div>Programs Hash: {PATHWAYS_MANIFEST.programsHash}</div>
            <div>Rules Hash: {PATHWAYS_MANIFEST.rulesHash}</div>
          </div>
        </section>

        {/* Statutory Rules Used */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Statutory Government Rules Used in Evaluator
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Government Gazette</span>
          </div>

          <div className="space-y-2 text-xs">
            {PATHWAYS_STATUTORY_RULES.slice(0, 8).map((rule) => (
              <div
                key={rule.rowId}
                className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-mono text-zinc-200 font-medium">{rule.field}</div>
                  <div className="text-zinc-500 text-[11px] italic">
                    &quot;{rule.snippet}&quot;
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded text-[11px]">
                    {String(rule.value)} {rule.unit || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Assumptions Register */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Editorial Assumptions Register (Constitution B5)
            </h2>
            <span className="text-[11px] font-mono text-amber-400">All Draft Until Reviewed</span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.values(EDITORIAL_ASSUMPTIONS).map((assump) => (
              <div key={assump.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-volt font-semibold">{assump.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {assump.status}
                  </span>
                </div>
                <p className="text-zinc-300">{assump.rationale}</p>
                <div className="text-[11px] text-zinc-500">
                  Required Reviewer Category: {assump.reviewerCategory || 'Unassigned'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Known Limitations (Always Shown per Spec C8) */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
            Known Limitations (Always Stated)
          </h2>

          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-300">
            <li>
              <strong>College Tier & Referrals:</strong> Campus criteria recorded here represent published baseline criteria. Institute tier positioning, internal referrals, and specific drive adjustments are not modelled.
            </li>
            <li>
              <strong>Drive & Batch Changes:</strong> Companies may modify cutoff percentages, backlog rules, or test platforms between individual campus drives or batches.
            </li>
            <li>
              <strong>Tax & Statutory Updates:</strong> Tax slabs and EPFO contribution rules are governed by Finance Acts and Ministry of Labour gazettes. They reflect the FY 2026-27 regime.
            </li>
            <li>
              <strong>Not Legal or Financial Advice:</strong> All compensation evaluations and take-home estimates are computational simulations based on user input and recorded rules. They do not constitute financial or legal advice.
            </li>
            <li>
              <strong>Editorial Assumptions:</strong> Action planning timelines use draft assumptions pending review by academic and placement advisory panels.
            </li>
          </ul>
        </section>
      </main>

      {feedbackOpen && (
        <FeedbackModal
          isOpen={feedbackOpen}
          subjectId="methodology"
          onClose={() => setFeedbackOpen(false)}
        />
      )}

      <NonAffiliationFooter />
    </div>
  );
};
