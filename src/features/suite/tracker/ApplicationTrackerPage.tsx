// ============================================================
// Suite UI — Application Tracker (/tools/tracker)
// Decision Group: "What should I apply to?"
// Track applications, kanban board, pipeline insights, gone-quiet badges
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Download,
  Upload,
  Calendar,
  Building2,
  Clock,
  Layers,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  Trash2,
  Edit2,
  Kanban,
  List,
  ChevronDown,
  Info,
} from 'lucide-react';
import { SuiteStorage } from '../profile/storage';
import { ApplicationEntry, ApplicationStatus, ApplicationSource } from '../profile/types';
import {
  computeTrackerInsights,
  isGoneQuiet,
  exportTrackerToCSV,
  importTrackerFromCSV,
} from './insights';
import { COMPANIES } from '../../../pages/demo/talentLensData';

const ALL_STATUSES: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'Online Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
  'No response',
];

const ALL_SOURCES: ApplicationSource[] = [
  'Campus',
  'Off-campus portal',
  'Referral',
  'Other',
];

const TIERS = ['Tier S', 'Tier A', 'Tier B', 'Tier C'] as const;

export function ApplicationTrackerPage() {
  const [entries, setEntries] = useState<ApplicationEntry[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'insights'>('list');
  const [quietDaysThreshold, setQuietDaysThreshold] = useState<number>(14);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Form Drawer / Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ApplicationEntry | null>(null);

  // Form State
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSource, setFormSource] = useState<ApplicationSource>('Campus');
  const [formStatus, setFormStatus] = useState<ApplicationStatus>('Applied');
  const [formAppliedDate, setFormAppliedDate] = useState('');
  const [formScanScore, setFormScanScore] = useState<string>('');
  const [formTier, setFormTier] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');

  // Autocomplete Suggestions
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const loaded = SuiteStorage.loadTracker();
    if (loaded.ok && loaded.data) {
      setEntries(loaded.data);
    }
  }, []);

  const saveEntries = (updated: ApplicationEntry[]) => {
    setEntries(updated);
    SuiteStorage.saveTracker(updated);
  };

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingEntry(null);
    setFormCompany('');
    setFormRole('');
    setFormSource('Campus');
    setFormStatus('Applied');
    setFormAppliedDate(today);
    setFormScanScore('');
    setFormTier('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: ApplicationEntry) => {
    setEditingEntry(entry);
    setFormCompany(entry.company);
    setFormRole(entry.role);
    setFormSource(entry.source);
    setFormStatus(entry.status);
    setFormAppliedDate(entry.appliedDate);
    setFormScanScore(entry.scanScore !== undefined ? String(entry.scanScore) : '');
    setFormTier(entry.tier || '');
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveEntries(updated);
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = entries.map((e) =>
      e.id === id ? { ...e, status: newStatus, lastUpdateDate: today } : e
    );
    saveEntries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const scoreVal = formScanScore.trim() ? parseInt(formScanScore, 10) : undefined;

    if (editingEntry) {
      const updated = entries.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              company: formCompany.trim(),
              role: formRole.trim(),
              source: formSource,
              status: formStatus,
              appliedDate: formAppliedDate || entry.appliedDate,
              lastUpdateDate: today,
              scanScore: isNaN(scoreVal as any) ? undefined : scoreVal,
              tier: (formTier as any) || undefined,
              notes: formNotes.trim() || undefined,
            }
          : entry
      );
      saveEntries(updated);
    } else {
      const newEntry: ApplicationEntry = {
        id: `app-${Date.now()}`,
        company: formCompany.trim(),
        role: formRole.trim(),
        source: formSource,
        status: formStatus,
        appliedDate: formAppliedDate || today,
        lastUpdateDate: today,
        scanScore: isNaN(scoreVal as any) ? undefined : scoreVal,
        tier: (formTier as any) || undefined,
        notes: formNotes.trim() || undefined,
      };
      saveEntries([newEntry, ...entries]);
    }

    setIsModalOpen(false);
  };

  const handleCompanyChange = (val: string) => {
    setFormCompany(val);
    if (!val.trim()) {
      setCompanySuggestions([]);
      return;
    }
    const filtered = COMPANIES.filter((c) =>
      c.name.toLowerCase().includes(val.toLowerCase())
    )
      .slice(0, 5)
      .map((c) => c.name);
    setCompanySuggestions(filtered);
  };

  const handleExportCSV = () => {
    const csv = exportTrackerToCSV(entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-applications-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const res = importTrackerFromCSV(text);
      if (res.valid.length > 0) {
        saveEntries([...res.valid, ...entries]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
      if (tierFilter !== 'all' && e.tier !== tierFilter) return false;
      return true;
    });
  }, [entries, statusFilter, sourceFilter, tierFilter]);

  const insights = useMemo(() => computeTrackerInsights(entries), [entries]);

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-4 sm:px-6 md:px-8 relative">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> What should I apply to?
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Application Tracker
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            One unified place to manage your application funnel, detect stagnant roles, and discover empirical response patterns across your job search.
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-xs">
          {/* View Mode Toggle (max 3 tabs) */}
          <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-text text-bg shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <List className="w-3.5 h-3.5 inline mr-1.5" /> List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-text text-bg shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 inline mr-1.5" /> Pipeline Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('insights')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'insights'
                  ? 'bg-text text-bg shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" /> Insights ({entries.length})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Log Application
            </button>
            <label className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-text-tertiary" /> Import CSV
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters (List & Board View) */}
        {viewMode !== 'insights' && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface border border-border/80 text-xs">
            <div className="flex items-center gap-1.5 text-text-tertiary font-bold">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Sources</option>
              {ALL_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Tiers</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="ml-auto text-text-muted text-[11px]">
              Showing {filteredEntries.length} of {entries.length} applications
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">No applications tracked yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                Log campus drives, portal submissions, and referral applications to track your progress and detect response patterns.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Log Your First Application
            </button>
          </div>
        )}

        {/* VIEW 1: List View */}
        {entries.length > 0 && viewMode === 'list' && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-surface-2/60 text-text-muted">
                    <th className="py-3 px-4 font-semibold">Company &amp; Role</th>
                    <th className="py-3 px-4 font-semibold">Source</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold">Applied</th>
                    <th className="py-3 px-4 font-semibold">Activity</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {filteredEntries.map((app) => {
                    const quiet = isGoneQuiet(app, quietDaysThreshold);

                    return (
                      <tr key={app.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-text">{app.company}</div>
                          <div className="text-text-secondary text-[11px]">{app.role}</div>
                        </td>
                        <td className="py-3 px-4 font-sans text-text-secondary">
                          {app.source}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                              app.status === 'Offer'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : app.status === 'Interview'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                : app.status === 'Online Assessment'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : app.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-surface-2 text-text border-border'
                            }`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-text">
                          {app.scanScore !== undefined ? `${app.scanScore}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-text-muted">{app.appliedDate}</td>
                        <td className="py-3 px-4 font-sans">
                          {quiet ? (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              title={`No update for >${quietDaysThreshold} days`}
                            >
                              Gone quiet ({quietDaysThreshold}+d)
                            </span>
                          ) : (
                            <span className="text-text-muted text-[11px]">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 font-sans">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(app)}
                              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: Pipeline Board */}
        {entries.length > 0 && viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {['Saved', 'Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'].map(
              (colStatus) => {
                const columnEntries = filteredEntries.filter((e) => e.status === colStatus);

                return (
                  <div
                    key={colStatus}
                    className="bg-surface border border-border rounded-2xl p-4 space-y-3 min-w-[240px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                        {colStatus}
                      </h4>
                      <span className="text-xs font-mono font-bold text-text-muted px-2 py-0.5 bg-surface-2 rounded-full">
                        {columnEntries.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                      {columnEntries.map((app) => (
                        <div
                          key={app.id}
                          className="bg-surface-2 border border-border/80 rounded-xl p-3 space-y-2 hover:border-border-accent transition-all"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="text-xs font-bold text-text">{app.company}</div>
                              <div className="text-[11px] text-text-secondary">{app.role}</div>
                            </div>
                            {app.scanScore !== undefined && (
                              <span className="text-[10px] font-bold font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {app.scanScore}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border/40">
                            <span>{app.source}</span>
                            <span>{app.appliedDate}</span>
                          </div>
                        </div>
                      ))}

                      {columnEntries.length === 0 && (
                        <div className="p-4 text-center text-xs text-text-muted italic">
                          No applications
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* VIEW 3: Insights View */}
        {viewMode === 'insights' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-text">Pipeline Insights</h3>
                <p className="text-xs text-text-secondary mt-0.5">{insights.sampleNotice}</p>
              </div>
            </div>

            {insights.hasEnoughData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Funnel Distribution */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-text">Funnel Stage Distribution</h4>
                  <div className="space-y-2">
                    {insights.funnel.map((f) => (
                      <div key={f.status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">{f.status}</span>
                          <span className="font-mono text-text font-bold">
                            {f.count} ({f.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${f.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion by Source */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-text">Outcomes by Application Source</h4>
                  <div className="space-y-3">
                    {insights.bySource.map((s) => (
                      <div
                        key={s.label}
                        className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-text">{s.label}</div>
                          <div className="text-[11px] text-text-muted">
                            {s.total} applications · {s.interviewOrOfferCount} interviews/offers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black font-mono text-emerald-400">
                            {s.conversionRate}%
                          </div>
                          <div className="text-[10px] text-text-muted uppercase">Interview Rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion by Score Band */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-text">Outcomes by Match Score Band</h4>
                  <div className="space-y-3">
                    {insights.byScoreBand.map((sb) => (
                      <div
                        key={sb.label}
                        className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-text">{sb.label}</div>
                          <div className="text-[11px] text-text-muted">
                            {sb.total} applications · {sb.interviewOrOfferCount} positive outcomes
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black font-mono text-primary">
                            {sb.conversionRate}%
                          </div>
                          <div className="text-[10px] text-text-muted uppercase">Conversion</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion by Company Tier */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-text">Outcomes by Company Tier</h4>
                  <div className="space-y-3">
                    {insights.byCompanyTier.map((t) => (
                      <div
                        key={t.label}
                        className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-text">{t.label}</div>
                          <div className="text-[11px] text-text-muted">
                            {t.total} applications tracked
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black font-mono text-text">
                            {t.conversionRate}%
                          </div>
                          <div className="text-[10px] text-text-muted uppercase">Rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center text-xs text-text-muted">
                Track at least 5 applications to compute aggregate pipeline breakdowns.
              </div>
            )}
          </div>
        )}

        {/* Modal / Drawer for Add / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="text-base font-bold text-text">
                {editingEntry ? 'Edit Application' : 'Log New Application'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Swiggy"
                    className="w-full bg-surface-2 border border-border rounded-xl p-2.5 text-text focus:outline-none focus:border-primary"
                  />
                  {companySuggestions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {companySuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setFormCompany(sug);
                            setCompanySuggestions([]);
                          }}
                          className="px-2 py-0.5 rounded bg-surface-3 hover:bg-surface-2 border border-border text-[10px] text-text cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Full Stack Engineer, SDE II"
                    className="w-full bg-surface-2 border border-border rounded-xl p-2.5 text-text focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Source</label>
                    <select
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value as ApplicationSource)}
                      className="w-full bg-surface-2 border border-border rounded-xl p-2.5 text-text focus:outline-none focus:border-primary"
                    >
                      {ALL_SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                      className="w-full bg-surface-2 border border-border rounded-xl p-2.5 text-text focus:outline-none focus:border-primary"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Applied Date</label>
                    <input
                      type="date"
                      value={formAppliedDate}
                      onChange={(e) => setFormAppliedDate(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl p-2 text-text focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Scan Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formScanScore}
                      onChange={(e) => setFormScanScore(e.target.value)}
                      placeholder="e.g. 78"
                      className="w-full bg-surface-2 border border-border rounded-xl p-2 text-text focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Tier</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl p-2 text-text focus:outline-none focus:border-primary"
                    >
                      <option value="">None</option>
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Referral name, round details, recruiter contact..."
                    className="w-full h-20 bg-surface-2 border border-border rounded-xl p-2.5 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border font-semibold text-text cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                  >
                    {editingEntry ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
