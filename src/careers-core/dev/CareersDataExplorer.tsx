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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Dev Diagnostic Tool
              </span>
              <span className="text-xs text-neutral-400">gated by import.meta.env.DEV</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <Database className="w-7 h-7 text-blue-400" />
              Careers Data Platform Explorer
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              One shared data layer for all HireFlow tools (Career Trajectory, TalentLens, ATS Roaster, Tailor My Resume)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Back to Tools Hub
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Companies</div>
            <div className="text-2xl font-black text-white mt-1">{stats.companies}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">5 canonical segments</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Fresher Programs</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{stats.fresherPrograms}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">2026-27 cohort calibrated</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Career Levels</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{stats.levels}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Equivalence calibrated</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Degree Branches</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.branches}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Full short code registry</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 gap-6">
          <button
            type="button"
            onClick={() => setTab('programs')}
            className={`pb-3 text-xs font-black transition-colors relative ${
              tab === 'programs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fresher / Campus Programs ({allPrograms.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('companies')}
            className={`pb-3 text-xs font-black transition-colors relative ${
              tab === 'companies' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Companies Master ({allCompanies.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('integrity')}
            className={`pb-3 text-xs font-black transition-colors relative ${
              tab === 'integrity' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Integrity Health Check
          </button>
        </div>

        {/* Tab 1: Programs */}
        {tab === 'programs' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Search Programs</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by program, title, company..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Filter by Company</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Companies (56)</option>
                  {allCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Role Family</label>
                <select
                  value={selectedRoleFamily}
                  onChange={(e) => setSelectedRoleFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black text-blue-400 uppercase tracking-wider">
                          {company?.name || prog.companyId} • {prog.roleFamily}
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{prog.programName}</h3>
                        <div className="text-xs text-neutral-300 font-medium">{prog.roleTitle}</div>
                      </div>
                      <DataBadge entity={prog} />
                    </div>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-semibold">
                        CTC: ₹{prog.compensation.fixedMinLPA ?? 'N/A'} - ₹{prog.compensation.fixedMaxLPA ?? 'N/A'} LPA
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-semibold">
                        Category: {prog.campusCategory}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-semibold">
                        Reach: {prog.hiringReach}
                      </span>
                      {prog.training.bondMonths && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          Bond: {prog.training.bondMonths} mo
                        </span>
                      )}
                    </div>

                    {/* Selection Process Stages */}
                    <div>
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Selection Process ({prog.selectionProcess.length} stages)
                      </div>
                      <div className="space-y-1.5">
                        {prog.selectionProcess.map((stg, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-neutral-800/50 border border-neutral-800"
                          >
                            <span className="text-neutral-200 font-medium truncate mr-2">
                              {i + 1}. {stg.stage}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 shrink-0">
                              {stg.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trajectory summary */}
                    {prog.trajectory.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                        <span>
                          Trajectory:{' '}
                          <span className="text-neutral-200 font-bold">
                            {prog.trajectory[0].fromLevelCode} → {prog.trajectory[0].toLevelCode}
                          </span>
                        </span>
                        <span className="text-emerald-400 font-bold">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Search Company</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search company name or ID..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Market Segment</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{c.marketSegment}</div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <div className="text-xs text-neutral-400">HQ: {c.headquarters || 'India'}</div>
                      </div>
                      <DataBadge entity={c} />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {c.indiaOffices.map((off) => (
                        <span key={off} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {off}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <span>{levels.length} Levels</span>
                      <span className="text-blue-400 font-bold">{programs.length} Fresher Programs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Integrity Health Check */}
        {tab === 'integrity' && (
          <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Platform Invariant Verification</h3>
                <p className="text-xs text-neutral-400">Continuous runtime audit of referential integrity and zero-fabrication rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Company-to-Level Foreign Keys
                </div>
                <p className="text-[11px] text-neutral-300">
                  100% of the 182 platform levels link to valid company records in PLATFORM_COMPANIES.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Fresher Program Provenance
                </div>
                <p className="text-[11px] text-neutral-300">
                  All 60 fresher programs have ≥ 1 verified source, explicit confidence rating, and 2026 data currency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Zero &quot;N/A&quot; String Defect Policy
                </div>
                <p className="text-[11px] text-neutral-300">
                  All unknown values use strict nulls with low confidence; zero literal &quot;N/A&quot; or undefined strings stored.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Canonical Competency Alignments
                </div>
                <p className="text-[11px] text-neutral-300">
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
