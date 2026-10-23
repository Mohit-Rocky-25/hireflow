/**
 * HireFlow v4: Saved Job Description Library Page (A4.2, A4.3)
 * Full candidate JD library management, cross-JD demand aggregation,
 * and quick-launch into ATS Resume Roaster and JD Compare.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageNav } from '../../components/common/PageNav';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Metric } from '../../components/common/Metric';
import { Tag } from '../../components/common/Tag';
import { useSavedJdStore } from '../../store/savedJdStore';
import { useProfileStore } from '../../store/profileStore';
import { aggregateDemandedSkills } from '../../lib/jds/demandAggregation';
import {
  Briefcase,
  Search,
  Trash2,
  FileSearch,
  ArrowRight,
  TrendingUp,
  Tag as TagIcon,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function SavedJdLibraryPage() {
  const navigate = useNavigate();
  const { jds, deleteJd } = useSavedJdStore();
  const { activeResume, setLastTarget } = useProfileStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [jdToDelete, setJdToDelete] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    jds.forEach((j) => j.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [jds]);

  // Filter JDs
  const filteredJds = useMemo(() => {
    return jds.filter((j) => {
      const matchesSearch =
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.company && j.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        j.text.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = selectedTag === 'all' || j.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [jds, searchQuery, selectedTag]);

  // Aggregate demanded skills across saved JDs
  const demandResult = useMemo(() => {
    return aggregateDemandedSkills(jds, activeResume);
  }, [jds, activeResume]);

  const handleScanWithJd = (jdId: string) => {
    const targetJd = jds.find((j) => j.id === jdId);
    if (!targetJd) return;

    setLastTarget({
      jdId: targetJd.id,
      company: targetJd.company || undefined,
      role: targetJd.title,
    });

    // Store in session storage so Roaster picks it up
    try {
      sessionStorage.setItem('hireflow_prefill_jd', targetJd.text);
      sessionStorage.setItem('hireflow_prefill_jd_title', targetJd.title);
    } catch {
      // ignore
    }

    toast('info', `Loaded "${targetJd.title}" into ATS Resume Roaster.`);
    navigate('/tools/resume-checker');
  };

  const handleToggleSelectForCompare = (jdId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(jdId)) return prev.filter((id) => id !== jdId);
      if (prev.length >= 3) {
        toast('info', 'You can compare up to 3 job descriptions at once.');
        return prev;
      }
      return [...prev, jdId];
    });
  };

  const handleSendToCompare = () => {
    if (selectedForCompare.length < 2) {
      toast('warning', 'Please select at least 2 job descriptions to compare.');
      return;
    }

    const selectedJdObjects = jds.filter((j) => selectedForCompare.includes(j.id));
    try {
      sessionStorage.setItem(
        'hireflow_compare_prefill',
        JSON.stringify(selectedJdObjects.map((j) => ({ title: j.title, text: j.text })))
      );
    } catch {
      // ignore
    }

    toast('success', `Sent ${selectedForCompare.length} JDs to JD Compare.`);
    navigate('/tools/jd-compare');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <PageNav fallbackRoute="/tools" />

      <header className="max-w-5xl mx-auto px-4 pt-20 pb-4 text-center sm:text-left">
        <h1 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2 uppercase">
          <Briefcase className="h-6 w-6 text-volt" />
          <span>Saved Job Description Library</span>
        </h1>
        <p className="mt-1 text-sm font-mono text-neutral-400">
          Target postings, cross-posting skill demand aggregation, and fast multi-JD comparisons.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {/* Cross-JD Demand Aggregation Section */}
        <div className="rounded border border-charcoal bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-volt" />
              <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                Demanded Skills Across Your Saved JDs
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Based on {jds.length} saved JD{jds.length === 1 ? '' : 's'}
            </span>
          </div>

          {!demandResult.eligible ? (
            <div className="rounded border border-charcoal bg-surface-elevated p-4 text-xs text-neutral-400 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-neutral-200 font-medium font-mono">{demandResult.message}</p>
                <p className="mt-0.5 text-neutral-500 font-mono text-[11px]">
                  Save 3 or more postings to reveal overlapping skill requirements and evidence gaps.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-x-auto">
              <p className="text-xs font-mono text-neutral-400">
                Sorted by weighted demand (mandatory requirements count 3x). Click any metric info icon to inspect calculation.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {demandResult.skills.slice(0, 8).map((skill) => (
                  <div
                    key={skill.skillName}
                    className="rounded border border-charcoal bg-black p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-white text-xs">{skill.skillName}</span>
                        {skill.currentEvidenceLevel ? (
                          <Tag variant="verified" size="sm">Shown</Tag>
                        ) : (
                          <Tag variant="danger" size="sm">Gap</Tag>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono block mt-1">
                        In {skill.jdCount} JD{skill.jdCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-charcoal">
                      <Metric
                        label="Demand Score"
                        value={skill.weightedScore}
                        unit="pts"
                        explain={skill.explain}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-charcoal bg-surface pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-volt focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="rounded border border-charcoal bg-surface px-3 py-2 text-xs font-mono text-white focus:border-volt focus:outline-none"
              >
                <option value="all">All Tags ({jds.length})</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            {selectedForCompare.length >= 2 && (
              <button
                type="button"
                onClick={handleSendToCompare}
                className="inline-flex items-center gap-1.5 rounded bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-black" />
                <span>Compare Selected ({selectedForCompare.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* JD Cards List */}
        {filteredJds.length === 0 ? (
          <div className="rounded border border-charcoal bg-surface p-8 text-center space-y-2">
            <Briefcase className="h-8 w-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">No Job Descriptions Match</h3>
            <p className="text-xs font-mono text-neutral-400">
              Save job descriptions during ATS scanning or paste them into your library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJds.map((jd) => {
              const isSelectedForCompare = selectedForCompare.includes(jd.id);
              return (
                <div
                  key={jd.id}
                  className={`rounded border p-5 flex flex-col justify-between space-y-4 transition-all ${
                    isSelectedForCompare
                      ? 'border-volt bg-surface'
                      : 'border-charcoal bg-surface hover:border-neutral-500'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-mono font-semibold text-white tracking-tight">{jd.title}</h3>
                        {jd.company && <p className="text-xs text-volt font-mono font-medium">{jd.company}</p>}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectForCompare(jd.id)}
                          title="Select for JD Compare"
                          className={`rounded px-2 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                            isSelectedForCompare
                              ? 'border-volt bg-volt text-black'
                              : 'border-charcoal bg-surface-elevated text-neutral-300 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isSelectedForCompare ? '✓ Compare' : '+ Compare'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setJdToDelete(jd.id)}
                          aria-label="Delete JD"
                          className="rounded p-1 text-neutral-500 hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {jd.text}
                    </p>

                    {jd.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {jd.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded bg-surface-elevated px-2 py-0.5 text-[10px] text-neutral-300 font-mono border border-charcoal"
                          >
                            <TagIcon className="h-2.5 w-2.5 text-neutral-500" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-charcoal flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Added: {jd.addedAt.slice(0, 10)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScanWithJd(jd.id)}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-volt hover:text-volt-hover hover:underline text-xs uppercase tracking-wider"
                    >
                      <span>Scan with this JD</span>
                      <ArrowRight className="h-3.5 w-3.5 text-volt" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(jdToDelete)}
        onCancel={() => setJdToDelete(null)}
        onConfirm={() => {
          if (jdToDelete) {
            deleteJd(jdToDelete);
            setJdToDelete(null);
          }
        }}
        title="Delete Job Description?"
        message="This job description will be removed from your local library. Any previous scan records that used it will remain in your history."
        confirmText="Delete JD"
        isDestructive={true}
      />
    </div>
  );
}
