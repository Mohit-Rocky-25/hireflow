// ============================================================
// Pathways Architecture — Non-Affiliation & Governance Footer
// Constitution C14: Standardized neutral disclosure on all routes.
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';

export const NonAffiliationFooter: React.FC = () => {
  return (
    <footer className="w-full mt-16 border-t border-zinc-800/80 bg-zinc-950/60 py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
          <Link to="/tools/pathways" className="hover:text-white transition-colors">Eligibility Radar</Link>
          <span>•</span>
          <Link to="/tools/pathways/plan" className="hover:text-white transition-colors">Action Plan</Link>
          <span>•</span>
          <Link to="/tools/pathways/offers" className="hover:text-white transition-colors">Offer Evaluator</Link>
          <span>•</span>
          <Link to="/tools/pathways/about-data" className="hover:text-white transition-colors">Data & Method</Link>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl mx-auto font-sans">
          HireFlow Pathways is an independent student decision tool. Company trademarks, logos, and program names belong to their respective holders. Inclusion does not imply sponsorship, endorsement, or formal affiliation. Eligibility criteria and compensation structures are extracted from recorded public notices and remain subject to change per institutional recruitment cycle.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Zero Runtime Egress (Local Only)</span>
          </span>
          <span>•</span>
          <span>Stays in your browser. Never uploaded.</span>
        </div>
      </div>
    </footer>
  );
};
