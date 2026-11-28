import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, Trash2, Compass } from 'lucide-react';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useSavedRoleStore } from '@/store/savedRoleStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';

export const SavedJdsSection: React.FC = () => {
  const navigate = useNavigate();
  const savedJds = useSavedJdStore((s) => s.jds);
  const deleteJd = useSavedJdStore((s) => s.deleteJd);
  const savedRoles = useSavedRoleStore((s) => s.roles);
  const unsaveRole = useSavedRoleStore((s) => s.unsaveRole);

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  const filteredJds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = savedJds.filter((jd) =>
      !q
        ? true
        : jd.title.toLowerCase().includes(q) ||
          (jd.company || '').toLowerCase().includes(q) ||
          jd.tags.some((t) => t.toLowerCase().includes(q))
    );
    if (sortBy === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [savedJds, query, sortBy]);

  const handleLaunchTailorForJd = (jd: (typeof savedJds)[number]) => {
    const primaryWs =
      Object.values(useResumeStore.getState().workspaces).find((w) => !w.archivedAt && w.isPrimary) ??
      Object.values(useResumeStore.getState().workspaces).find((w) => !w.archivedAt);
    const headVer = primaryWs?.headVersionId
      ? useResumeStore.getState().versions[primaryWs.headVersionId]
      : undefined;
    const launch = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'my_space',
      mode: 'full_tailor',
      workspaceId: primaryWs?.id ?? null,
      versionId: headVer?.id ?? null,
      snapshotHash: headVer?.snapshotHash ?? null,
      resumeLabel: primaryWs?.name,
      auditId: null,
      talentLensAssessmentId: null,
      jdIds: [jd.id],
      jdSnapshotHash: jd.textHash,
      jdTitle: jd.title,
      jdCompany: jd.company ?? undefined,
      dualJdComparisonId: null,
      targetKey: null,
      selectedSection: null,
      selectedBullet: null,
      focusSkill: null,
    });
    navigate(`/tools/tailor?ctx=${launch.launchId}`);
  };

  return (
    <div className="max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mb-1">
            Target Roles
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f1e8]">Saved JDs</h1>
          <p className="text-sm text-[#9b9b8c] mt-1">
            Job descriptions saved for Tailor My Resume, ATS compatibility, and head-to-head comparison.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tools/jd-compare"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#24241c] bg-[#10100d] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40"
          >
            <span>Open Dual-JD Compare</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/jd-library"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#faff69] text-[#090907] text-xs font-bold hover:bg-[#ebf059]"
          >
            <span>Full JD Library</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      {savedJds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9b9b8c]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, company, or tag..."
              aria-label="Filter saved job descriptions"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#10100d] border border-[#24241c] text-xs text-[#f1f1e8] placeholder-[#9b9b8c]/70 focus:outline-none focus:border-[#faff69]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
            aria-label="Sort saved job descriptions"
            className="px-3 py-1.5 rounded-lg bg-[#10100d] border border-[#24241c] text-xs text-[#f1f1e8] focus:outline-none focus:border-[#faff69]"
          >
            <option value="recent">Sort: Saved Order</option>
            <option value="title">Sort: Title (A–Z)</option>
          </select>
        </div>
      )}

      {savedJds.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#24241c] bg-[#10100d] text-center space-y-3">
          <p className="text-sm text-[#9b9b8c]">No saved job descriptions in this session yet.</p>
          <Link
            to="/jd-library"
            className="inline-block px-5 py-2 rounded-full border border-[#24241c] text-xs font-semibold text-[#faff69] hover:border-[#faff69]/40"
          >
            Manage Saved JDs
          </Link>
        </div>
      ) : filteredJds.length === 0 ? (
        <div className="p-6 rounded-xl border border-[#24241c] bg-[#10100d] text-center text-sm text-[#9b9b8c]">
          No saved JDs match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="divide-y divide-[#1b1b15] border border-[#24241c] rounded-xl bg-[#10100d] px-5">
          {filteredJds.map((jd) => (
            <div key={jd.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#f1f1e8] truncate">{jd.title}</div>
                <div className="text-xs text-[#9b9b8c] mt-0.5">
                  {jd.company || 'Company'} &middot; {jd.tags.slice(0, 4).join(', ') || 'No tags'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLaunchTailorForJd(jd)}
                  className="px-3.5 py-1.5 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-xs font-semibold text-[#faff69] hover:bg-[#faff69] hover:text-[#0a0a08] transition-colors cursor-pointer"
                >
                  Tailor
                </button>
                <Link
                  to="/tools/resume-checker"
                  className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40"
                >
                  Scan
                </Link>
                <button
                  type="button"
                  onClick={() => deleteJd(jd.id)}
                  aria-label={`Delete ${jd.title}`}
                  className="p-2 rounded-full text-[#9b9b8c] hover:text-[#ff8a70] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved TalentLens Role Benchmarks */}
      {savedRoles.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f1f1e8] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#faff69]" />
              <span>Saved TalentLens Roles ({savedRoles.length})</span>
            </h2>
            <Link to="/demo" className="text-xs text-[#9b9b8c] hover:text-[#faff69]">
              Explore TalentLens
            </Link>
          </div>
          <div className="divide-y divide-[#1b1b15] border border-[#24241c] rounded-xl bg-[#10100d] px-5">
            {savedRoles.map((role) => (
              <div key={role.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#f1f1e8] truncate">
                    {role.companyName} — {role.roleTitle}
                  </div>
                  <div className="text-xs text-[#9b9b8c]">
                    Saved {new Date(role.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/demo/company/${encodeURIComponent(role.companyId || role.companyName.toLowerCase())}`}
                    className="px-3 py-1 rounded-full border border-[#24241c] text-xs font-semibold text-[#faff69] hover:border-[#faff69]/40"
                  >
                    Open Benchmark
                  </Link>
                  <button
                    type="button"
                    onClick={() => unsaveRole(role.id)}
                    aria-label={`Remove saved role ${role.roleTitle}`}
                    className="p-1.5 rounded-full text-[#9b9b8c] hover:text-[#ff8a70] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
