import React, { useState, useMemo } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  Tile,
  MintPanel,
  CompareBadge,
  FieldShell,
  TextInput,
  Modal,
} from '../../ui';
import {
  bundleBriefsForGaps,
  ALL_PROJECT_BRIEFS,
  ProjectBrief,
  BriefDifficulty,
  getBriefHoursRange,
} from '../../../../features/suite/briefs/bundleBriefs';
import { useProfile } from '../../../../features/suite/profile/ProfileContext';
import {
  Search,
  Filter,
  Copy,
  Check,
  Download,
  Bookmark,
  BookmarkCheck,
  Layers,
  Sparkles,
  Target,
  ExternalLink,
  Code2,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const TRACK_OPTIONS = [
  { id: 'fullstack', title: 'Full-Stack & Cloud', desc: 'React, Node.js, Go, Distributed APIs & PostgreSQL' },
  { id: 'data', title: 'Data & Distributed Infra', desc: 'Kafka, Spark, ClickHouse, Docker & Systems' },
  { id: 'ai', title: 'Applied AI & LLM Systems', desc: 'Vector DBs, Python, Embeddings, RAG & Evaluation' },
];

export function SpruceBuildBriefsPage() {
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState<'bundle' | 'library'>('bundle');
  const [selectedTrack, setSelectedTrack] = useState<string>('fullstack');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active gaps from candidate profile or track
  const activeGaps = useMemo<string[]>(() => {
    if (profile?.skills && profile.skills.length > 0) {
      const low = profile.skills.filter((s) => s.evidenceLevel < 2).map((s) => s.displayName);
      if (low.length > 0) return low;
      return profile.skills.map((s) => s.displayName);
    }
    if (selectedTrack === 'fullstack') return ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Go'];
    if (selectedTrack === 'data') return ['Kafka', 'Python', 'DuckDB', 'Docker', 'PostgreSQL', 'System Design'];
    return ['Python', 'FastAPI', 'Vector DB', 'Docker', 'PostgreSQL', 'LangChain'];
  }, [profile, selectedTrack]);

  const bundleResult = useMemo(() => {
    return bundleBriefsForGaps(activeGaps, ALL_PROJECT_BRIEFS, 4);
  }, [activeGaps]);

  const allDomains = useMemo(() => {
    const set = new Set<string>();
    ALL_PROJECT_BRIEFS.forEach((b) => set.add(b.domain));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredLibrary = useMemo(() => {
    return ALL_PROJECT_BRIEFS.filter((b) => {
      if (selectedDomain !== 'all' && b.domain !== selectedDomain) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.domain.toLowerCase().includes(q) ||
          b.techStack.some((t) => t.toLowerCase().includes(q)) ||
          b.coveredSkills.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedDomain, searchQuery]);

  const handleCopyBrief = (brief: ProjectBrief) => {
    const text = `PROJECT BRIEF: ${brief.title}\nDomain: ${brief.domain}\nDifficulty: ${brief.difficulty}\nEst. Hours: ${brief.estimatedHours}\nTech Stack: ${brief.techStack.join(', ')}\n\nProblem Statement:\n${brief.problemStatement}\n\nRecruiter Signal:\n${brief.recruiterSignal}\n\nScale Targets:\n${brief.scaleTargets}`;
    navigator.clipboard.writeText(text);
    setCopiedId(brief.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownloadBrief = (brief: ProjectBrief) => {
    const text = `PROJECT BRIEF: ${brief.title}\nDomain: ${brief.domain}\nDifficulty: ${brief.difficulty}\nEst. Hours: ${brief.estimatedHours}\nTech Stack: ${brief.techStack.join(', ')}\n\nProblem Statement:\n${brief.problemStatement}\n\nArchitecture & Delivery:\n${brief.architecture}\n\nScale Targets:\n${brief.scaleTargets}\n\nRecruiter Signal:\n${brief.recruiterSignal}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-${brief.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Project Build Briefs' },
        ]}
        title="Project Build Briefs"
        subtitle="79 deeply researched, market-backed engineering briefs. Every brief closes a real job description skill gap with verifiable architecture."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Track Selector Tiles */}
        <div className="space-y-3">
          <span className="sp-eyebrow text-sp-muted">Target Career Track</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRACK_OPTIONS.map((track) => {
              const isSelected = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`p-5 rounded-sp-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-2 border-sp-primary bg-sp-mint-50 shadow-sp-3'
                      : 'border-sp-hairline-strong bg-sp-surface hover:bg-sp-mint-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="sp-h3 text-sp-ink">{track.title}</h3>
                    <StatusChip
                      status={isSelected ? 'matched' : 'partial'}
                      label={isSelected ? 'Active Track' : 'Select'}
                    />
                  </div>
                  <p className="sp-body-sm text-sp-muted mt-2 leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher: Bundler vs Library */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
          <Tabs
            items={[
              { id: 'bundle', label: `Suggested Bundle (${bundleResult.recommendedBriefs.length})` },
              { id: 'library', label: `Complete Library (${ALL_PROJECT_BRIEFS.length})` },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />

          {activeTab === 'library' && (
            <div className="flex items-center gap-3">
              <FieldShell className="max-w-xs">
                <TextInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by skill, tech, or title..."
                />
              </FieldShell>
            </div>
          )}
        </div>

        {/* Tab 1: Suggested Bundle View */}
        {activeTab === 'bundle' && (
          <div className="space-y-6">
            {/* Set-Cover Coverage Metric Banner */}
            <MintPanel className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="sp-eyebrow text-sp-primary-text font-bold">Greedy Set-Cover Synthesis</span>
                  <h3 className="sp-h2 text-sp-ink mt-0.5">
                    {bundleResult.recommendedBriefs.length} Projects Cover {bundleResult.coveredSkills.length} of {activeGaps.length} Target Skills
                  </h3>
                  <p className="sp-body-sm text-sp-muted mt-1">
                    Minimal set algorithm selected projects with high coverage density to optimize your portfolio development timeline.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="px-5 py-3 rounded-sp-lg bg-sp-surface border border-sp-hairline text-center">
                    <span className="sp-h2 text-sp-primary-text font-bold tabular-nums">
                      {bundleResult.coveragePercentage}%
                    </span>
                    <p className="sp-caption text-sp-muted">Gap Coverage</p>
                  </div>
                  <div className="px-5 py-3 rounded-sp-lg bg-sp-surface border border-sp-hairline text-center">
                    <span className="sp-h2 text-sp-ink font-bold tabular-nums">
                      {bundleResult.totalEstimatedHours}h
                    </span>
                    <p className="sp-caption text-sp-muted">Estimated Time</p>
                  </div>
                </div>
              </div>

              {/* Active Skills List */}
              <div className="mt-4 pt-4 border-t border-sp-hairline flex flex-wrap gap-1.5 items-center">
                <span className="sp-caption text-sp-body font-bold mr-2">Target Skills:</span>
                {activeGaps.map((skill) => {
                  const isCovered = bundleResult.coveredSkills.includes(skill);
                  return (
                    <StatusChip
                      key={skill}
                      status={isCovered ? 'matched' : 'missing'}
                      label={skill}
                    />
                  );
                })}
              </div>
            </MintPanel>

            {/* Grid of Recommended Project Brief Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bundleResult.recommendedBriefs.map((brief, idx) => (
                <Card
                  key={brief.id}
                  className="p-5 bg-sp-surface flex flex-col justify-between space-y-4 hover:border-sp-primary-text transition-colors cursor-pointer"
                  onClick={() => setActiveBrief(brief)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="sp-eyebrow text-sp-primary-text font-bold">
                        #{idx + 1} {brief.domain}
                      </span>
                      <StatusChip
                        status={brief.difficulty === 'advanced' ? 'missing' : brief.difficulty === 'intermediate' ? 'partial' : 'matched'}
                        label={brief.difficulty}
                      />
                    </div>

                    <h3 className="sp-h3 text-sp-ink leading-snug line-clamp-2">
                      {brief.title}
                    </h3>

                    <p className="sp-body-sm text-sp-muted line-clamp-3">
                      {brief.problemStatement}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-sp-hairline">
                    <div className="space-y-1">
                      <span className="sp-caption text-sp-body font-bold">Skills Addressed:</span>
                      <div className="flex flex-wrap gap-1">
                        {brief.coveredSkills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="sp-micro px-2 py-0.5 rounded-sp-xs bg-sp-mint-100 text-sp-primary-text font-semibold"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBrief(brief);
                        }}
                      >
                        View Full Brief →
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Complete Library View */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLibrary.map((brief) => (
                <Card
                  key={brief.id}
                  className="p-5 bg-sp-surface flex flex-col justify-between space-y-4 hover:border-sp-primary-text transition-colors cursor-pointer"
                  onClick={() => setActiveBrief(brief)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="sp-eyebrow text-sp-muted font-bold truncate">
                        {brief.domain}
                      </span>
                      <StatusChip
                        status={brief.difficulty === 'advanced' ? 'missing' : brief.difficulty === 'intermediate' ? 'partial' : 'matched'}
                        label={brief.difficulty}
                      />
                    </div>

                    <h3 className="sp-h3 text-sp-ink leading-snug line-clamp-2">
                      {brief.title}
                    </h3>

                    <p className="sp-body-sm text-sp-muted line-clamp-3 leading-relaxed">
                      {brief.problemStatement}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-sp-hairline">
                    <div className="flex flex-wrap gap-1">
                      {brief.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="sp-micro px-2 py-0.5 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-body"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBrief(brief);
                        }}
                      >
                        Inspect Specifications
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brief Detail Modal per Appendix 5.4 */}
      {activeBrief && (
        <Modal
          isOpen={Boolean(activeBrief)}
          onClose={() => setActiveBrief(null)}
          title={activeBrief.title}
          className="max-w-[850px]"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-sp-hairline">
              <span className="sp-caption font-bold text-sp-primary-text">{activeBrief.domain}</span>
              <span className="sp-caption text-sp-muted">•</span>
              <span className="sp-caption text-sp-muted">{activeBrief.estimatedHours} Hours Required</span>
              <span className="sp-caption text-sp-muted">•</span>
              <StatusChip
                status={activeBrief.difficulty === 'advanced' ? 'missing' : activeBrief.difficulty === 'intermediate' ? 'partial' : 'matched'}
                label={activeBrief.difficulty}
              />
            </div>

            <div className="space-y-2">
              <h4 className="sp-ui-label text-sp-ink font-bold uppercase tracking-wider">Problem Statement</h4>
              <p className="sp-body text-sp-body leading-relaxed">{activeBrief.problemStatement}</p>
            </div>

            <div className="space-y-2">
              <h4 className="sp-ui-label text-sp-ink font-bold uppercase tracking-wider">Production Architecture</h4>
              <p className="sp-body text-sp-body leading-relaxed">{activeBrief.architecture}</p>
            </div>

            <div className="space-y-2">
              <h4 className="sp-ui-label text-sp-ink font-bold uppercase tracking-wider">Scale &amp; Benchmark Targets</h4>
              <div className="p-4 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline sp-mono text-sp-ink text-sm">
                {activeBrief.scaleTargets}
              </div>
            </div>

            {/* Recruiter Talking Points in MintPanel */}
            <MintPanel className="p-5">
              <span className="sp-eyebrow text-sp-primary-text font-bold">Interview Talking Points</span>
              <p className="sp-body-sm text-sp-body mt-1.5 leading-relaxed">{activeBrief.recruiterSignal}</p>
            </MintPanel>

            <div className="flex items-center justify-between pt-4 border-t border-sp-hairline">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyBrief(activeBrief)}
                >
                  {copiedId === activeBrief.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sp-primary-text" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Brief</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadBrief(activeBrief)}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveBrief(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </SpruceShell>
  );
}
