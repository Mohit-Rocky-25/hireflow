import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Building2, Check, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import { careers } from '../../../../careers-core';

interface QuickLoadSelectProps {
  selectedCompanyId: string;
  onSelect: (targetId: string) => void;
}

export function QuickLoadSelect({ selectedCompanyId, onSelect }: QuickLoadSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'campus' | 'experienced'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const allCompanies = useMemo(() => {
    return careers.companies.list().map((c) => ({
      ...c,
      firstRole: careers.roles.forCompany(c.id)[0] || null,
    }));
  }, []);

  const allPrograms = useMemo(() => {
    return careers.programs.query().map((p) => {
      const comp = careers.companies.get(p.companyId);
      return {
        ...p,
        companyName: comp?.name || p.companyId,
      };
    });
  }, []);

  const selectedCompany = allCompanies.find((c) => c.id === selectedCompanyId);
  const selectedProgram = allPrograms.find((p) => p.id === selectedCompanyId);

  // Filtered lists
  const filteredPrograms = useMemo(() => {
    if (tab === 'experienced') return [];
    const q = search.toLowerCase().trim();
    if (!q) return allPrograms;
    return allPrograms.filter(
      (p) =>
        p.programName.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.companyId.toLowerCase().includes(q)
    );
  }, [allPrograms, tab, search]);

  const filteredCompanies = useMemo(() => {
    if (tab === 'campus') return [];
    const q = search.toLowerCase().trim();
    if (!q) return allCompanies;
    return allCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.firstRole && c.firstRole.title.toLowerCase().includes(q))
    );
  }, [allCompanies, tab, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonLabel = useMemo(() => {
    if (selectedProgram) {
      return `${selectedProgram.companyName} — ${selectedProgram.programName}`;
    }
    if (selectedCompany) {
      return `${selectedCompany.name} (${selectedCompany.firstRole?.title || 'Engineering'})`;
    }
    return 'Quick Load Target Job...';
  }, [selectedProgram, selectedCompany]);

  return (
    <div ref={containerRef} className="relative z-20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-all min-w-[220px]"
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedProgram ? (
            <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
          <span className="truncate">{buttonLabel}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 bg-surface border-2 border-border rounded-2xl shadow-xl overflow-hidden flex flex-col z-50 animate-fade-in">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-border bg-surface-2 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campus program, company, role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTab('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  tab === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary hover:text-text'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTab('campus')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  tab === 'campus'
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface text-text-secondary hover:text-text'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                Campus '26-27 ({allPrograms.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('experienced')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  tab === 'experienced'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface text-text-secondary hover:text-text'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                Lateral Roles ({allCompanies.length})
              </button>
            </div>
          </div>

          {/* List of items */}
          <div className="overflow-y-auto max-h-72 p-1.5 space-y-1">
            {filteredPrograms.length === 0 && filteredCompanies.length === 0 ? (
              <div className="p-4 text-xs text-center text-text-muted">No targets found</div>
            ) : (
              <>
                {/* Campus Programs Section */}
                {filteredPrograms.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400">
                      Campus Programs (2026-27)
                    </div>
                    {filteredPrograms.map((p) => {
                      const isSelected = p.id === selectedCompanyId;
                      const ctc = p.compensation?.fixedMinLPA
                        ? `₹${p.compensation.fixedMinLPA} LPA`
                        : 'Competitive';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelect(p.id);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold'
                              : 'hover:bg-surface-2 text-text font-medium'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-text truncate">{p.companyName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-bold">
                                {ctc}
                              </span>
                            </div>
                            <div className="text-[11px] text-text-secondary truncate">
                              {p.programName} · {p.roleTitle}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Lateral Companies Section */}
                {filteredCompanies.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-text-secondary mt-1">
                      Lateral / Experienced Roles
                    </div>
                    {filteredCompanies.map((c) => {
                      const role = c.firstRole;
                      const isSelected = c.id === selectedCompanyId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            onSelect(c.id);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'hover:bg-surface-2 text-text font-medium'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold text-text truncate">{c.name}</div>
                            <div className="text-[11px] text-text-secondary truncate">{role?.title}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
