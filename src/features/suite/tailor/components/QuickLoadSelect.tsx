import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Building2, Check, Sparkles } from 'lucide-react';
import { COMPANIES } from '../../../../pages/demo/talentLensData';

interface QuickLoadSelectProps {
  selectedCompanyId: string;
  onSelect: (companyId: string) => void;
}

export function QuickLoadSelect({ selectedCompanyId, onSelect }: QuickLoadSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCompany = COMPANIES.find((c) => c.id === selectedCompanyId);

  const filtered = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.roles.some((r) => r.title.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-all min-w-[210px]"
      >
        <span className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">
            {selectedCompany ? `${selectedCompany.name} (${selectedCompany.roles[0]?.title})` : 'Quick Load Target Job...'}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-80 bg-surface border-2 border-border rounded-2xl shadow-xl overflow-hidden flex flex-col z-50 animate-fade-in">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-border bg-surface-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* List of roles */}
          <div className="overflow-y-auto max-h-60 p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="p-4 text-xs text-center text-text-muted">No companies found</div>
            ) : (
              filtered.map((c) => {
                const role = c.roles[0];
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
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
