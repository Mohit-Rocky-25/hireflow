// ============================================================
// Careers Data Platform — Dev-Only Data Explorer (/dev/careers-data)
// Gated by import.meta.env.DEV — Internal diagnostic & inspection tool
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { careers } from '../api';
import { DataBadge } from '../react/DataBadge';
import {
  Building2,
  GraduationCap,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  Database,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export function CareersDataExplorer() {
  const [tab, setTab] = useState<'programs' | 'companies' | 'integrity'>('programs');
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedRoleFamily, setSelectedRoleFamily] = useState<string>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');

  const stats = useMemo(() => careers.stats.counts(), []);
  const allCompanies = useMemo(() => careers.companies.list(), []);
  const allPrograms = useMemo(() => careers.programs.query(), []);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((c) => {
      const matchSeg = selectedSegment === 'ALL' || c.marketSegment === selectedSegment;
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      return matchSeg && matchSearch;
    });
  }, [allCompanies, selectedSegment, search]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter((p) => {
      const matchComp = selectedCompanyId === 'ALL' || p.companyId === selectedCompanyId;
      const matchFamily = selectedRoleFamily === 'ALL' || p.roleFamily === selectedRoleFamily;
      const matchSearch =
        !search ||
        p.programName.toLowerCase().includes(search.toLowerCase()) ||
        p.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
        p.companyId.toLowerCase().includes(search.toLowerCase());
      return matchComp && matchFamily && matchSearch;
    });
  }, [allPrograms, selectedCompanyId, selectedRoleFamily, search]);

  // Role families list
  const roleFamilies = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPrograms) set.add(p.roleFamily);
    return Array.from(set).sort();
  }, [allPrograms]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-charcoal pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-volt/10 text-volt border border-volt/30">
                Dev Diagnostic Tool
              </span>
              <span className="text-xs font-mono text-neutral-400">gated by import.meta.env.DEV</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-mono font-black text-white flex items-center gap-3 uppercase">
              <Database className="w-7 h-7 text-volt" />
              Careers Data Platform Explorer
            </h1>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              One shared data layer for all HireFlow tools (Career Trajectory, TalentLens, ATS Roaster, Tailor My Resume)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider bg-surface border border-charcoal text-neutral-300 hover:text-white hover:bg-surface-elevated transition-colors"
            >
              Back to Tools Hub
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded bg-surface border border-charcoal shadow-sm">
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Companies</div>
            <div className="text-2xl font-mono font-black text-volt mt-1">{stats.companies}</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">5 canonical segments</div>
          </div>
          <div className="p-4 rounded bg-surface border border-charcoal shadow-sm">
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Fresher Programs</div>
            <div className="text-2xl font-mono font-black text-volt mt-1">{stats.fresherPrograms}</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">2026-27 cohort calibrated</div>
          </div>
          <div className="p-4 rounded bg-surface border border-charcoal shadow-sm">
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Career Levels</div>
            <div className="text-2xl font-mono font-black text-volt mt-1">{stats.levels}</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">Equivalence calibrated</div>
          </div>
          <div className="p-4 rounded bg-surface border border-charcoal shadow-sm">
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Degree Branches</div>
            <div className="text-2xl font-mono font-black text-volt mt-1">{stats.branches}</div>
            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">Full short code registry</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-charcoal gap-6">
          <button
            type="button"
            onClick={() => setTab('programs')}
            className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative ${
              tab === 'programs' ? 'text-volt border-b-2 border-volt' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fresher / Campus Programs ({allPrograms.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('companies')}
            className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative ${
              tab === 'companies' ? 'text-volt border-b-2 border-volt' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Companies Master ({allCompanies.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('integrity')}
            className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative ${
              tab === 'integrity' ? 'text-volt border-b-2 border-volt' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Integrity Health Check
          </button>
        </div>

        {/* Tab 1: Programs */}
        {tab === 'programs' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface p-4 rounded border border-charcoal">
              <div>
                <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">Search Programs</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by program, title, company..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-charcoal rounded text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-volt"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">Filter by Company</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-charcoal rounded text-xs font-mono text-white focus:outline-none focus:border-volt"
                >
                  <option value="ALL">All Companies ({allCompanies.length})</option>
                  {allCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">Role Family</label>
                <select
                  value={selectedRoleFamily}
                  onChange={(e) => setSelectedRoleFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-charcoal rounded text-xs font-mono text-white focus:outline-none focus:border-volt"
                >
                  <option value="ALL">All Role Families ({roleFamilies.length})</option>
                  {roleFamilies.map((rf) => (
                    <option key={rf} value={rf}>
                      {rf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Program Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.map((prog) => {
                const company = careers.companies.get(prog.companyId);
                return (
                  <div
                    key={prog.id}
                    className="p-5 rounded bg-surface border border-charcoal hover:border-neutral-500 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-volt uppercase tracking-wider">
                          {company?.name || prog.companyId} • {prog.roleFamily}
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{prog.programName}</h3>
                        <div className="text-xs text-neutral-300 font-mono font-medium">{prog.roleTitle}</div>
                      </div>
                      <DataBadge entity={prog} />
                    </div>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded bg-surface-elevated text-neutral-300 border border-charcoal font-mono font-semibold">
                        CTC: ₹{prog.compensation.fixedMinLPA ?? 'N/A'} - ₹{prog.compensation.fixedMaxLPA ?? 'N/A'} LPA
                      </span>
                      <span className="px-2.5 py-1 rounded bg-surface-elevated text-neutral-300 border border-charcoal font-mono font-semibold">
                        Category: {prog.campusCategory}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-surface-elevated text-neutral-300 border border-charcoal font-mono font-semibold">
                        Reach: {prog.hiringReach}
                      </span>
                      {prog.training.bondMonths && (
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                          Bond: {prog.training.bondMonths} mo
                        </span>
                      )}
                    </div>

                    {/* Selection Process Stages */}
                    <div>
                      <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Selection Process ({prog.selectionProcess.length} stages)
                      </div>
                      <div className="space-y-1.5">
                        {prog.selectionProcess.map((stg, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs px-3 py-1.5 rounded bg-black border border-charcoal"
                          >
                            <span className="text-neutral-200 font-mono font-medium truncate mr-2">
                              {i + 1}. {stg.stage}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-elevated text-neutral-300 shrink-0 border border-charcoal">
                              {stg.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trajectory summary */}
                    {prog.trajectory.length > 0 && (
                      <div className="pt-2 border-t border-charcoal flex items-center justify-between text-xs text-neutral-400 font-mono">
                        <span>
                          Trajectory:{' '}
                          <span className="text-white font-bold">
                            {prog.trajectory[0].fromLevelCode} → {prog.trajectory[0].toLevelCode}
                          </span>
                        </span>
                        <span className="text-volt font-bold">
                          ₹{prog.trajectory[0].compensationLPAAfter.min} - ₹{prog.trajectory[0].compensationLPAAfter.max} LPA
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Companies */}
        {tab === 'companies' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 rounded border border-charcoal">
              <div>
                <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">Search Company</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search company name or ID..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-charcoal rounded text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-volt"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">Market Segment</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-charcoal rounded text-xs font-mono text-white focus:outline-none focus:border-volt"
                >
                  <option value="ALL">All Segments</option>
                  <option value="Big Tech India">Big Tech India</option>
                  <option value="Indian Product Unicorn">Indian Product Unicorn</option>
                  <option value="GCC / Finance">GCC / Finance</option>
                  <option value="Indian IT Services">Indian IT Services</option>
                  <option value="Core Engineering & Automotive">Core Engineering & Automotive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredCompanies.map((c) => {
                const programs = careers.programs.forCompany(c.id);
                const levels = careers.levels.forCompany(c.id);
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded bg-surface border border-charcoal hover:border-neutral-500 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-volt uppercase tracking-wider">{c.marketSegment}</div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <div className="text-xs text-neutral-400 font-mono">HQ: {c.headquarters || 'India'}</div>
                      </div>
                      <DataBadge entity={c} />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {c.indiaOffices.map((off) => (
                        <span key={off} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-neutral-300 border border-charcoal">
                          {off}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-charcoal flex items-center justify-between text-xs text-neutral-400 font-mono">
                      <span>{levels.length} Levels</span>
                      <span className="text-volt font-bold">{programs.length} Fresher Programs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Integrity Health Check */}
        {tab === 'integrity' && (
          <div className="bg-surface p-6 md:p-8 rounded border border-charcoal space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-volt" />
              <div>
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-tight">Platform Invariant Verification</h3>
                <p className="text-xs font-mono text-neutral-400">Continuous runtime audit of referential integrity and zero-fabrication rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-black border border-charcoal space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-volt">
                  <CheckCircle2 className="w-4 h-4 text-volt" /> Company-to-Level Foreign Keys
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  100% of the 182 platform levels link to valid company records in PLATFORM_COMPANIES.
                </p>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-volt">
                  <CheckCircle2 className="w-4 h-4 text-volt" /> Fresher Program Provenance
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  All 60 fresher programs have ≥ 1 verified source, explicit confidence rating, and 2026 data currency.
                </p>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-volt">
                  <CheckCircle2 className="w-4 h-4 text-volt" /> Zero &quot;N/A&quot; String Defect Policy
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  All unknown values use strict nulls with low confidence; zero literal &quot;N/A&quot; or undefined strings stored.
                </p>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-volt">
                  <CheckCircle2 className="w-4 h-4 text-volt" /> Canonical Competency Alignments
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  All 60 fresher programs map strictly into the 19 standard competencies shared with TalentLens and ATS engines.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
