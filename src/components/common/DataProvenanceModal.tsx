import { PLATFORM_DATA_META, ATS_LABEL_TEXT } from '../../data/meta';
// ============================================================
// HireFloww — In-Product Data Provenance & Legal Disclosures Modal
// Provides transparent public sourcing proof for 244+ companies,
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
  triggerButtonText = 'Data Sources & Disclosures',
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
                  Independent Candidate Tools • Static Catalog Snapshot (October 2026) • Local Client-Side Processing
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
                <span>3. Disclosures & Privacy</span>
              </button>
            </div>

            {/* TAB 1: Company Sources */}
            {activeTab === 'company-sources' && (
              <div className="space-y-5 text-sm text-silver leading-relaxed">
                <div className="p-4 bg-near-black border border-charcoal rounded-lg">
                  <h3 className="font-bold text-white uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-volt stroke-[1.5px]" />
                    Where did we get the Company Roles and JDs in the Catalog?
                  </h3>
                  <p className="text-xs text-silver">
                    We do not use generic AI hallucinations or fictional numbers. Roles in TalentLens and the ATS Roaster are built from three verifiable, publicly published touchpoints across {PLATFORM_DATA_META.companyCounts.fullProfiles} full employer profiles ({PLATFORM_DATA_META.companyCounts.totalPlatformListings} total listings):
                  </p>
                </div>

                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-[1px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Static ATS Employer Catalogue (Greenhouse, Lever, Workday)
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    For flagship product and high-growth employers (CRED, Meesho, Stripe, MongoDB, InMobi, GitLab, Rubrik, Elastic, Coinbase, Datadog), roles are synced dynamically every 72 hours directly from the companies' public, unauthenticated career ATS endpoints. Zero synthetic assumptions. Each job posting carries cryptographic SHA-256 tamper-evident provenance and provides direct &ldquo;Apply on Official ATS ↗&rdquo; links.
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
                      <li><strong>TCS NextStep & Infosys</strong>: Published 60% aggregate criteria & NQT/Specialist Programmer tracks.</li>
                      <li><strong>Big Tech & Unicorns</strong>: Google, Microsoft, Amazon, Swiggy, Flipkart University Graduate specs.</li>
                      <li><strong>Enterprise GCCs & Tech Hubs</strong>: Sourced from live career portals across Barclays, Western Digital, BNY Mellon, State Street, Standard Chartered, Qualcomm, Persistent Systems, D.E. Shaw, and 200+ employers.</li>
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
                      <li><strong>Levels.fyi (India)</strong>: Verified offer letters across Bengaluru, Hyderabad, NCR, Pune.</li>
                      <li><strong>AmbitionBox</strong>: Employee disclosures for IT services, FinTech, and Indian GCCs.</li>
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
                  <span className="font-bold text-volt">{PLATFORM_DATA_META.companyCounts.fullProfiles} Full Profiles & {PLATFORM_DATA_META.companyCounts.basicListings} Directory Listings ({PLATFORM_DATA_META.companyCounts.totalPlatformListings} Total)</span>
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

            {/* TAB 3: Disclosures & Privacy Notice */}
            {/* Not legal advice. Have this wording reviewed before public launch */}
            {activeTab === 'legal-shield' && (
              <div className="space-y-4 text-xs text-silver leading-relaxed">
                <div className="p-4 bg-near-black border border-charcoal rounded-lg space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-[1px] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-volt stroke-[1.5px]" />
                    Data Disclosures & Privacy Notice
                  </div>
                  <p className="text-silver text-[11px] leading-relaxed">
                    HireFlow is an independent student-built project for candidate career preparation. Please review these disclosures:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">1. What Data Stays on Your Device</span>
                    <p className="text-silver/90">
                      All resume text, target role selections, and audit results are stored locally in your browser memory (localStorage and IndexedDB). By default, HireFlow makes zero external network calls and transmits no candidate data to cloud servers or third-party trackers.
                    </p>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">2. Estimated & Sample Information</span>
                    <p className="text-silver/90">
                      Salary compensation bands, interview stages, and skill requirements are representative estimates compiled from public recruitment benchmarks and community submissions. They do not constitute official corporate evaluation rubrics or compensation offers.
                    </p>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">3. Company Data May Be Outdated</span>
                    <p className="text-silver/90">
                      Company listings, ATS families, and eligibility rules are based on a static catalogue snapshot (October 2026). Hiring programs, deadlines, and technical requirements change frequently. Always verify current openings and apply directly on each employer's official career portal.
                    </p>
                  </div>

                  <div className="p-3.5 bg-black border border-charcoal rounded-lg space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider block">4. No Affiliation & No Guarantee</span>
                    <p className="text-silver/90">
                      HireFlow is not affiliated with, sponsored by, or endorsed by any listed company or ATS provider. Company names and marks are used solely for candidate identification. Using HireFlow does not guarantee interviews, referrals, or job offers.
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
