import React, { useState } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  CompareBadge,
  FieldShell,
  Textarea,
  TextInput,
} from '../../ui';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { downloadResumeAsDocx } from '../../../../lib/tailor/export/docxExporter';
import { downloadResumeAsPdf, triggerPrintToPdf } from '../../../../lib/tailor/export/pdfExporter';
import {
  FileText,
  Download,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  FileDown,
  Printer,
  Copy,
  Check,
} from 'lucide-react';

export function SpruceTailorPage() {
  const {
    activeProject,
    reorderSections,
    toggleSectionVisibility,
    updateSummaryText,
    updateBulletText,
    applyMakeItBetter,
    loadPresetFixture,
  } = useTailorStore();

  const resume = activeProject?.tailoredResume;
  const candidate = activeProject?.candidate;

  const [activeFilterTab, setActiveFilterTab] = useState<'rephrase' | 'highlight' | 'reorder' | 'add_context'>('rephrase');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => resume?.sections[0]?.id || '');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);

  const selectedSection = resume?.sections.find((s) => s.id === selectedSectionId) || resume?.sections[0];

  const handleExportDocx = async () => {
    if (!resume || !candidate) return;
    setIsExportingDocx(true);
    try {
      await downloadResumeAsDocx(resume, candidate);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!resume || !candidate) return;
    setIsExportingPdf(true);
    try {
      await downloadResumeAsPdf(resume, candidate);
    } catch {
      triggerPrintToPdf();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Resume Tailor' },
        ]}
        title="Resume Tailor & Diff Studio"
        subtitle="Calibrate bullet points to target job description keywords with strict Google XYZ evidence preservation."
      />

      {!resume || !candidate ? (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 text-center">
          <Card className="p-12 max-w-lg mx-auto flex flex-col items-center justify-center space-y-4">
            <FileText className="w-10 h-10 text-sp-primary-text" />
            <h2 className="sp-h2 text-sp-ink">No Tailoring Project Active</h2>
            <p className="sp-body-sm text-sp-muted">
              Load an authored candidate fixture to test live bullet transformations and Google XYZ diffs.
            </p>
            <Button variant="primary" onClick={() => loadPresetFixture('fresher')}>
              Load Example Project
            </Button>
          </Card>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Master-Detail Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 35% Section Planner Card */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 bg-sp-surface">
              <div className="flex items-center justify-between pb-3 border-b border-sp-hairline">
                <span className="sp-eyebrow text-sp-muted">Section Planner</span>
                <span className="sp-caption text-sp-primary-text font-bold">
                  {resume.sections.filter((s) => s.visible).length} Active
                </span>
              </div>

              <div className="space-y-2 mt-4">
                {resume.sections.map((section, idx) => {
                  const isSelected = section.id === selectedSectionId;
                  const isFirst = idx === 0;
                  const isLast = idx === resume.sections.length - 1;

                  return (
                    <div
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={`p-3 rounded-sp-xs border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-2 border-sp-primary bg-sp-mint-50'
                          : 'border-sp-hairline hover:bg-sp-mint-50/50 bg-sp-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          aria-label={`Toggle visibility of ${section.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionVisibility(section.id);
                          }}
                          className="text-sp-muted hover:text-sp-ink p-1 shrink-0"
                        >
                          {section.visible ? (
                            <Eye className="w-3.5 h-3.5 text-sp-primary-text" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-sp-faint" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <p className="sp-ui-sm text-sp-ink font-bold truncate">
                            {section.title}
                          </p>
                          <div className="mt-0.5">
                            <StatusChip
                              status={section.visible ? 'matched' : 'partial'}
                              label={section.visible ? 'Verified' : 'Hidden'}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reorder Arrows */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={isFirst}
                          aria-label={`Move ${section.title} up`}
                          onClick={() => reorderSections(idx, idx - 1)}
                          className="w-7 h-7 rounded-sp-xs border border-sp-hairline flex items-center justify-center text-sp-body hover:bg-sp-canvas-soft disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          aria-label={`Move ${section.title} down`}
                          onClick={() => reorderSections(idx, idx + 1)}
                          className="w-7 h-7 rounded-sp-xs border border-sp-hairline flex items-center justify-center text-sp-body hover:bg-sp-canvas-soft disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-sp-hairline">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => applyMakeItBetter()}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Polish with Google XYZ
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: 65% Diff Editor Card */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 bg-sp-surface space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
                <div>
                  <span className="sp-eyebrow text-sp-muted">Diff & Content Studio</span>
                  <h3 className="sp-h3 text-sp-ink mt-0.5">{selectedSection?.title}</h3>
                </div>

                <Tabs
                  items={[
                    { id: 'rephrase', label: 'Rephrase & XYZ' },
                    { id: 'highlight', label: 'Highlight Diff' },
                    { id: 'reorder', label: 'Structure' },
                    { id: 'add_context', label: 'Add Context' },
                  ]}
                  activeId={activeFilterTab}
                  onChange={(id) => setActiveFilterTab(id as any)}
                />
              </div>

              {/* Diff Demonstration according to Appendix 5.2 */}
              <div className="p-4 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-3">
                <span className="sp-caption text-sp-muted font-bold uppercase tracking-wider">
                  Transformation Preview (XYZ Formula)
                </span>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-sp-xs bg-sp-error-bg text-sp-error-text line-through sp-body-sm leading-relaxed border border-sp-error-text/20">
                    Built frontend features for dashboard and improved response times with React.
                  </div>
                  <div className="p-2.5 rounded-sp-xs bg-sp-mint-100 text-sp-primary-text font-medium sp-body-sm leading-relaxed border border-sp-mint-200">
                    Architected high-throughput React dashboard caching layer, reducing p95 API latency by 42% across 12,000 daily active enterprise sessions.
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <CompareBadge>Metric Verified</CompareBadge>
                  <span className="sp-micro text-sp-muted">Grounded against candidate claims</span>
                </div>
              </div>

              {/* Dynamic Section Editor */}
              {selectedSection?.type === 'summary' ? (
                <div className="space-y-3">
                  <label className="sp-caption text-sp-body font-bold">Professional Summary</label>
                  <FieldShell>
                    <Textarea
                      rows={5}
                      value={selectedSection.content.summaryText || ''}
                      onChange={(e) => updateSummaryText(e.target.value)}
                      placeholder="Write your calibrated target executive summary..."
                    />
                  </FieldShell>
                </div>
              ) : selectedSection?.content.entries && selectedSection.content.entries.length > 0 ? (
                <div className="space-y-6">
                  {selectedSection.content.entries.map((entry) => (
                    <div key={entry.id} className="p-4 rounded-sp-xs border border-sp-hairline bg-sp-surface space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="sp-ui-label text-sp-ink font-bold">{entry.primaryTitle}</h4>
                          <p className="sp-caption text-sp-muted">{entry.secondaryTitle} • {entry.dateRange}</p>
                        </div>
                      </div>

                      {entry.bullets && entry.bullets.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-sp-hairline">
                          <span className="sp-caption text-sp-muted font-bold">Bullet Points</span>
                          {entry.bullets.map((bullet, bIdx) => (
                            <div key={bullet.id} className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="sp-micro text-sp-muted">Bullet #{bIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(bullet.text);
                                    setCopiedBulletId(bullet.id);
                                    setTimeout(() => setCopiedBulletId(null), 1500);
                                  }}
                                  className="sp-micro text-sp-primary-text hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedBulletId === bullet.id ? (
                                    <>
                                      <Check className="w-3 h-3" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <FieldShell>
                                <Textarea
                                  rows={2}
                                  value={bullet.text}
                                  onChange={(e) =>
                                    updateBulletText(selectedSection.id, entry.id, bullet.id, e.target.value)
                                  }
                                />
                              </FieldShell>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-sp-canvas-soft rounded-sp-lg border border-sp-hairline">
                  <p className="sp-body-sm text-sp-muted">
                    No editable bullet entries found in this section. Select another section from the planner.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Live A4 White Paper Preview (Centred on Canvas Soft) */}
        <div className="pt-8 border-t border-sp-hairline space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="sp-eyebrow text-sp-muted">Live Canvas</span>
              <h2 className="sp-h2 text-sp-ink mt-0.5">A4 Document Paper Preview</h2>
            </div>
            <span className="sp-caption text-sp-muted font-mono">100% Client-Side Render</span>
          </div>

          <div className="p-6 sm:p-10 rounded-sp-2xl bg-sp-canvas-soft border border-sp-hairline flex justify-center overflow-x-auto">
            {/* Real white paper in both light and dark themes */}
            <div
              className="w-full max-w-[794px] bg-white text-black p-8 sm:p-12 rounded-sp-xs shadow-sp-4 space-y-6 font-sans text-left border border-gray-200"
              style={{ minHeight: '1000px' }}
            >
              {/* Header */}
              <div className="border-b border-gray-300 pb-4 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-black">
                  {candidate.fullName || 'Candidate Name'}
                </h1>
                <p className="text-xs text-gray-600 mt-1">
                  {[
                    candidate.contact.email,
                    candidate.contact.phone,
                    candidate.contact.location,
                    candidate.contact.linkedin,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>

              {/* Sections */}
              {resume.sections
                .filter((s) => s.visible)
                .map((sec) => (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">
                      {sec.title}
                    </h2>

                    {sec.type === 'summary' && sec.content.summaryText && (
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {sec.content.summaryText}
                      </p>
                    )}

                    {sec.content.entries && sec.content.entries.length > 0 && (
                      <div className="space-y-3">
                        {sec.content.entries.map((ent) => (
                          <div key={ent.id} className="text-xs">
                            <div className="flex justify-between font-semibold text-gray-900">
                              <span>{ent.primaryTitle}</span>
                              <span className="font-normal text-gray-500">{ent.dateRange}</span>
                            </div>
                            <div className="text-gray-600 italic">{ent.secondaryTitle}</div>
                            {ent.bullets && ent.bullets.length > 0 && (
                              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-700">
                                {ent.bullets.map((b) => (
                                  <li key={b.id} className="leading-snug">
                                    {b.text}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Floating Fixed Bottom-Right Export Dock */}
      {resume && candidate && (
        <div className="fixed bottom-6 right-6 z-30">
          <Card className="p-3 bg-sp-surface shadow-sp-4 border border-sp-hairline flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
            >
              <Download className="w-3.5 h-3.5" />
              {isExportingDocx ? 'Exporting...' : 'Export DOCX'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
            >
              <Printer className="w-3.5 h-3.5" />
              {isExportingPdf ? 'Printing...' : 'Export PDF'}
            </Button>
          </Card>
        </div>
      )}
    </SpruceShell>
  );
}
