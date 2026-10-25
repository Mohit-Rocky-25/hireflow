// ============================================================
// HireFlow — In-Product Data Provenance & Legal Disclosures Modal
// Provides transparent public sourcing proof for 140+ companies,
// deterministic engine logic explanation, and Nominative Fair Use legal shields.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Cpu,
  Scale,
  ExternalLink,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Lock,
  Layers,
} from 'lucide-react';

export interface DataProvenanceModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: 'company-sources' | 'engine-logic' | 'legal-shield';
  triggerButtonText?: string;
  triggerButtonClassName?: string;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  defaultTab = 'company-sources',
  triggerButtonText = 'Data Provenance & Legal Disclosures',
  triggerButtonClassName,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'company-sources' | 'engine-logic' | 'legal-shield'>(defaultTab);

  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalOpen;
  const handleClose = isControlled ? (controlledOnClose || (() => {})) : () => setInternalOpen(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className={
            triggerButtonClassName ||
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-silver hover:text-white text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer'
          }
          title="Inspect verified data sources and legal disclaimers"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
          <span>{triggerButtonText}</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-3xl bg-[#0c0c0c] border border-charcoal rounded-xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provenance-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-silver hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              aria-label="Close provenance modal"
            >
              <X className="w-5 h-5 stroke-[1.5px]" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal">
              <div className="p-2.5 rounded bg-black border border-volt/40 text-volt">
                <ShieldCheck className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div>
                <h2 id="provenance-modal-title" className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Data Provenance & Legal Disclosures
                </h2>
                <p className="text-xs text-silver mt-0.5 font-mono">
                  Single Source of Truth • 140+ Verified Tech Employers • Nominative Fair Use Shield
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-charcoal pb-3 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('company-sources')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'company-sources'
                    ? 'bg-near-black text-volt border border-volt font-bold'
                    : 'bg-black text-silver hover:text-white border border-charcoal'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 stroke-[1.5px]" />
                <span>1. Company JDs & CTC Sourcing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('engine-logic')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'engine-logic'
                    ? 'bg-near-black text-volt border border-volt font-bold'
                    : 'bg-black text-silver hover:text-white border border-charcoal'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 stroke-[1.5px]" />
                <span>2. How the Engine Works</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('legal-shield')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'legal-shield'
                    ? 'bg-near-black text-volt border border-volt font-bold'
                    : 'bg-black text-silver hover:text-white border border-charcoal'
                }`}
              >
                <Scale className="w-3.5 h-3.5 stroke-[1.5px]" />
                <span>3. Legal Shield & Trademarks</span>
              </button>
            </div>

            {/* TAB 1: Company Sources */}
            {activeTab === 'company-sources' && (
              <div className="space-y-5 text-sm text-silver leading-relaxed">
                <div className="p-4 bg-near-black border border-charcoal rounded-lg">
                  <h3 className="font-bold text-white uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-volt stroke-[1.5px]" />
                    Where did we get the 140+ Company Roles and JDs?
                  </h3>
                  <p className="text-xs text-silver">
                    We do not use generic AI hallucinations or fictional numbers. Every role in TalentLens and the ATS Roaster is built from three verifiable, publicly published touchpoints:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-black border border-charcoal rounded-lg space-y-2">
                    <div className="text-[11px] font-bold text-white uppercase tracking-[1px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-volt"></span>
                      1. Official Portals
                    </div>
                    <p className="text-[12px] text-silver leading-normal">
                      Sourced directly from live corporate graduate recruitment portals:
                    </p>
                    <ul className="text-[11px] text-silver/80 space-y-1 list-disc pl-4">
                      <li><strong>TCS NextStep</strong>: Published 60% aggregate criteria & NQT tracks.</li>
                      <li><strong>Google Careers</strong>: University Graduate SDE specifications.</li>
                      <li><strong>Infosys Graduate</strong>: Specialist Programmer & DSE test structures.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-black border border-charcoal rounded-lg space-y-2">
                    <div className="text-[11px] font-bold text-white uppercase tracking-[1px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-volt"></span>
                      2. Verified Submissions
                    </div>
                    <p className="text-[12px] text-silver leading-normal">
                      Compensation bands (Base, RSUs, Bonus) reflect verified India-office pay:
                    </p>
                    <ul className="text-[11px] text-silver/80 space-y-1 list-disc pl-4">
                      <li><strong>Levels.fyi (India)</strong>: Verified offer letters across Bengaluru, Hyderabad, NCR.</li>
                      <li><strong>AmbitionBox</strong>: Employee disclosures for IT services and Indian GCCs.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-black border border-charcoal rounded-lg space-y-2">
                    <div className="text-[11px] font-bold text-white uppercase tracking-[1px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-volt"></span>
                      3. Placement Reports
                    </div>
                    <p className="text-[12px] text-silver leading-normal">
                      Campus hiring reality calibrated against published placement cell reports:
                    </p>
                    <ul className="text-[11px] text-silver/80 space-y-1 list-disc pl-4">
                      <li><strong>IIT Bombay, IIT Delhi</strong>: Day-1/Day-2 domestic CTC distributions.</li>
                      <li><strong>BITS Pilani, NIT Trichy</strong>: Tier-1 campus drive criteria.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-black border border-charcoal rounded-lg flex items-center justify-between text-xs font-mono">
                  <span className="text-silver">Employer Catalog Audited:</span>
                  <span className="font-bold text-volt">140+ Individual Employers across 4 Tiers</span>
                </div>
              </div>
            )}

            {/* TAB 2: Engine Logic */}
            {activeTab === 'engine-logic' && (
              <div className="space-y-5 text-sm text-silver leading-relaxed">
                <div className="p-4 bg-near-black border border-charcoal rounded-lg">
                  <h3 className="font-bold text-white uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-volt stroke-[1.5px]" />
                    How Does the Evaluation Engine Work?
                  </h3>
                  <p className="text-xs text-silver">
                    HireFlow runs a deterministic, 100% client-side evaluation engine. It never invents criteria or guesses grades:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-black border border-charcoal rounded-lg flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-near-black border border-charcoal text-volt font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-[1px]">Ingests Exact Public Job Spec</h4>
                      <p className="text-xs text-silver mt-0.5">
                        Reads the target company role's required qualifications, must-have technologies, and operational responsibilities.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-near-black border border-charcoal text-volt font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-[1px]">Verbatim Token & Evidence Boundary Matching</h4>
                      <p className="text-xs text-silver mt-0.5">
                        Scans your resume for verbatim text citations. When text is marked "Found in resume", it was detected with exact word boundaries.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-near-black border border-charcoal text-volt font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-[1px]">5-Pillar Calibrated Audit</h4>
                      <p className="text-xs text-silver mt-0.5">
                        Scores Requirement Coverage, Evidence Quality (action verbs & quantified metrics), Project Readiness, Parser-Friendliness, and Seniority Alignment according to our published Canonical Scoring Spec.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Legal Shield */}
            {activeTab === 'legal-shield' && (
              <div className="space-y-4 text-xs text-silver leading-relaxed">
                <div className="p-4 bg-near-black border border-charcoal rounded-lg space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-[1px] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-volt stroke-[1.5px]" />
                    Legal Safe Harbor & Nominative Fair Use Doctrine
                  </div>
                  <p className="text-silver text-[11px] leading-relaxed">
                    This platform operates under established intellectual property standards for educational career research:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">1. Nominative Fair Use of Company Marks</span>
                    <p className="text-silver/90">
                      All company names, logos, and trademarks (Google, Microsoft, Amazon, TCS, Infosys, Wipro, Flipkart, Swiggy, and others) are the registered property of their respective owners. Their mention on HireFlow is strictly for nominative, educational, and identification purposes under the <strong>Nominative Fair Use doctrine</strong> and <strong>Section 52 of the Indian Copyright Act (Fair Dealing for educational study and research)</strong>. Mention of these names does not imply any affiliation, sponsorship, or endorsement by these organizations.
                    </p>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">2. Educational Simulation Disclaimer</span>
                    <p className="text-silver/90">
                      HireFlow is an independent educational simulator. Match scores, interview rounds, and salary bands represent community-reported estimates and public recruitment benchmarks. They do not constitute official corporate evaluation rubrics or employment guarantees.
                    </p>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">3. Notice, Takedown & Profile Review</span>
                    <p className="text-silver/90">
                      If you represent an employer and wish to update your graduate hiring profile, clarify recruitment eligibility criteria, or report an inaccuracy, please contact <span className="text-volt font-bold">compliance@hireflow.app</span> for review and updates within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-charcoal flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] font-mono text-silver">
                HireFlow Integrity & Transparency Framework • v4.0.0
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-white font-semibold text-xs uppercase tracking-[1px] rounded transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
