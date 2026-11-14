import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { humanizeEnum } from '@/lib/ui/copy';
import { formatDelta } from '@/features/journal/deltaEngine';
import { InspectorView } from '@/features/inspector/HistoricalResumeInspector';
import { ExportDossierButton } from '@/features/dossier/ExportDossierButton';
import type { AuditEntry } from '@/domain/types';
import { Zap, Eye, ShieldCheck, ArrowUpRight, FileSearch } from 'lucide-react';

interface ScansSectionProps {
  selectedAuditId: string | null;
  onSelectAudit: (auditId: string | null) => void;
  entries?: Record<string, AuditEntry>;
}

type ScanTab = 'all' | 'ats' | 'talentlens';

interface TargetGroup {
  company: string;
  roleTitle: string;
  audits: AuditEntry[];
}

function groupByTarget(audits: AuditEntry[]): TargetGroup[] {
  const map = new Map<string, TargetGroup>();
  for (const audit of audits) {
    const key = audit.targetKey || `${audit.jd.company || 'general'}:${audit.jd.roleTitle || 'role'}`;
    const existing = map.get(key);
    if (existing) {
      existing.audits.push(audit);
    } else {
      map.set(key, {
        company: audit.jd.company || 'Target Organization',
        roleTitle: audit.jd.roleTitle || '',
        audits: [audit],
      });
    }
  }
  return Array.from(map.values());
}

export const ScansSection: React.FC<ScansSectionProps> = ({
  selectedAuditId,
  onSelectAudit,
  entries: propEntries,
}) => {
  const [activeTab, setActiveTab] = useState<ScanTab>('all');
  const storeEntries = useAuditStore((s) => s.entries);
  const entries = propEntries || storeEntries;
  const auditsList = Object.values(entries).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  // If viewing an inspector
  if (selectedAuditId) {
    return (
      <div className="h-full flex flex-col">
        <InspectorView
          auditId={selectedAuditId}
          onClose={() => onSelectAudit(null)}
        />
      </div>
    );
  }

  const atsAudits = auditsList.filter((a) => a.kind !== 'talentlens');
  const talentLensAudits = auditsList.filter((a) => a.kind === 'talentlens');

  const atsGroups = groupByTarget(atsAudits);
  const talentLensGroups = groupByTarget(talentLensAudits);

  const renderAuditGroupList = (groups: TargetGroup[]) => (
    <div className="space-y-4">
      {groups.map((group, idx) => (
        <div key={idx} className="border border-[#24241c] rounded-xl bg-[#10100d] p-5 shadow-xs">
          <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-[#24241c]">
            <div>
              <h4 className="text-base font-bold text-[#f1f1e8]">{group.company}</h4>
              {group.roleTitle && (
                <p className="text-xs text-[#9b9b8c] font-medium">{group.roleTitle}</p>
              )}
            </div>
            <span className="text-xs font-mono text-[#6d6d61]">
              {group.audits.length} {group.audits.length === 1 ? 'scan' : 'scans'}
            </span>
          </div>

          <div className="divide-y divide-[#1b1b15]">
            {group.audits.map((audit) => {
              const deltaPts = audit.delta?.overallDeltaPts ?? null;
              const dateLabel = new Date(audit.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={audit.id}
                  onClick={() => onSelectAudit(audit.id)}
                  className="py-3.5 px-3 -mx-3 rounded-lg flex items-center justify-between gap-4 hover:bg-[#16160f] cursor-pointer transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#f1f1e8] group-hover:text-[#faff69] transition-colors truncate">
                      {audit.resume.label}
                    </div>
                    <div className="text-xs text-[#6d6d61] mt-1 flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          audit.kind === 'talentlens'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30'
                        }`}
                      >
                        {audit.kind === 'talentlens' ? 'TalentLens' : 'ATS Roast'}
                      </span>
                      <span>{dateLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-bold font-mono tabular-nums text-[#f1f1e8]">
                      {audit.overallScore}{' '}
                      <small className="text-[#6d6d61] font-normal text-xs">of 100</small>
                    </span>

                    {deltaPts !== null ? (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          deltaPts >= 0
                            ? 'text-[#faff69] bg-[#faff69]/10'
                            : 'text-[#ff8a70] bg-[#ff8a70]/10'
                        }`}
                      >
                        {formatDelta(deltaPts)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#181814] text-[#6d6d61]">
                        Baseline
                      </span>
                    )}

                    <div onClick={(e) => e.stopPropagation()} className="ml-1 shrink-0">
                      <ExportDossierButton
                        audit={audit}
                        label={audit.kind === 'talentlens' ? 'TalentLens Report' : 'ATS Report'}
                      />
                    </div>

                    <span className="text-xs text-[#9b9b8c] group-hover:text-[#f1f1e8] transition-colors ml-1 font-mono">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-[900px] space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase mb-2">
          Candidate Career History
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8]">
              Scans &amp; Audits
            </h2>
            <p className="text-xs text-[#9b9b8c] mt-1">
              Historical benchmark dossiers and diagnostic reports categorized by evaluation engine.
            </p>
          </div>

          {/* Subsection Filter Navigation Pills */}
          <div className="inline-flex rounded-lg bg-[#141410] p-1 border border-[#24241c] text-xs font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#24241c] text-[#f1f1e8] font-bold shadow-xs'
                  : 'text-[#9b9b8c] hover:text-[#f1f1e8]'
              }`}
            >
              All Scans ({auditsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-[#24241c] text-[#faff69] font-bold shadow-xs'
                  : 'text-[#9b9b8c] hover:text-[#faff69]'
              }`}
            >
              <Zap className="w-3 h-3 text-[#faff69]" />
              ATS Scans ({atsAudits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('talentlens')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'talentlens'
                  ? 'bg-[#24241c] text-emerald-400 font-bold shadow-xs'
                  : 'text-[#9b9b8c] hover:text-emerald-400]'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              TalentLens ({talentLensAudits.length})
            </button>
          </div>
        </div>
      </div>

      {auditsList.length === 0 ? (
        <div className="py-12 text-center border border-[#24241c] rounded-xl bg-[#10100d] p-8 space-y-4">
          <FileSearch className="w-10 h-10 text-[#6d6d61] mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#f1f1e8]">No Scans Recorded Yet</h3>
            <p className="text-[#9b9b8c] text-xs mt-1 max-w-md mx-auto leading-relaxed">
              Run your first resume scan with ATS Resume Roaster or calibrate against target companies with TalentLens.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/tools/resume-checker"
              className="px-4 py-2 rounded bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors"
            >
              Run an ATS Scan
            </Link>
            <Link
              to="/demo"
              className="px-4 py-2 rounded bg-[#181814] text-[#f1f1e8] border border-[#24241c] hover:border-emerald-400 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Explore TalentLens
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* ════════════════════════════════════════════════════════════ */}
          {/* SUBSECTION 1: ATS RESUME ROASTER SCANS                    */}
          {/* ════════════════════════════════════════════════════════════ */}
          {(activeTab === 'all' || activeTab === 'ats') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#24241c]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#faff69]/10 border border-[#faff69]/30 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-[#faff69]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#f1f1e8]">
                        ATS Resume Roaster Scans
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181814] text-[#faff69] border border-[#faff69]/20 font-bold">
                        {atsAudits.length}
                      </span>
                    </div>
                    <p className="text-xs text-[#9b9b8c] mt-0.5">
                      Deterministic 7-dimension keyword coverage, bullet quality, and format safety audits.
                    </p>
                  </div>
                </div>

                <Link
                  to="/tools/resume-checker"
                  className="text-xs font-mono font-bold text-[#faff69] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                  <span>+ New ATS Roast</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {atsAudits.length === 0 ? (
                <div className="p-6 border border-dashed border-[#24241c] rounded-xl bg-[#10100d]/60 text-center space-y-3">
                  <p className="text-xs text-[#9b9b8c]">No ATS Resume Roaster scans recorded yet.</p>
                  <Link
                    to="/tools/resume-checker"
                    className="inline-block px-4 py-1.5 rounded bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors"
                  >
                    Run ATS Scan &rarr;
                  </Link>
                </div>
              ) : (
                renderAuditGroupList(atsGroups)
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* SUBSECTION 2: TALENTLENS BENCHMARK SCANS                  */}
          {/* ════════════════════════════════════════════════════════════ */}
          {(activeTab === 'all' || activeTab === 'talentlens') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#24241c]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#f1f1e8]">
                        TalentLens™ Benchmark Scans
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181814] text-emerald-400 border border-emerald-500/20 font-bold">
                        {talentLensAudits.length}
                      </span>
                    </div>
                    <p className="text-xs text-[#9b9b8c] mt-0.5">
                      Company-calibrated 6-layer competency evaluations, market intelligence, and project briefs.
                    </p>
                  </div>
                </div>

                <Link
                  to="/demo"
                  className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                  <span>+ New TalentLens Scan</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {talentLensAudits.length === 0 ? (
                <div className="p-6 border border-dashed border-[#24241c] rounded-xl bg-[#10100d]/60 text-center space-y-3">
                  <p className="text-xs text-[#9b9b8c]">No TalentLens company benchmark scans recorded yet.</p>
                  <Link
                    to="/demo"
                    className="inline-block px-4 py-1.5 rounded bg-[#181814] text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Calibrate with TalentLens &rarr;
                  </Link>
                </div>
              ) : (
                renderAuditGroupList(talentLensGroups)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
