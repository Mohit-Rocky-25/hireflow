// ============================================================
// Searchable Grouped Degree & Branch Combobox Component
// Supports 36+ disciplines, instant search, grouped display,
// and "Other (type your own)" with live branch family detection.
// ============================================================

import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, Check, Sparkles, GraduationCap } from 'lucide-react';
import {
  DEGREE_BRANCH_CATALOG,
  getGroupedDegreeOptions,
  detectBranchFamily,
  BRANCH_FAMILY_LABELS,
  type DegreeBranchOption,
  type BranchFamily,
} from '../../data/careerLadders/degreesAndBranches';

export interface BranchComboboxProps {
  value: string; // branch id or label
  onChange: (option: DegreeBranchOption) => void;
  className?: string;
}

export function BranchCombobox({ value, onChange, className = '' }: BranchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customBranchText, setCustomBranchText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Selected item
  const selectedOption = DEGREE_BRANCH_CATALOG.find(
    (item) => item.id === value || item.branchName === value || item.label === value
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter catalog
  const filteredCatalog = DEGREE_BRANCH_CATALOG.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.branchName.toLowerCase().includes(q) ||
      item.degreeName.toLowerCase().includes(q) ||
      item.familyLabel.toLowerCase().includes(q) ||
      item.degreeGroup.toLowerCase().includes(q)
    );
  });

  // Group filtered results
  const groupedFiltered: Record<string, DegreeBranchOption[]> = {
    'B.Tech / B.E': [],
    'Integrated / Dual Degree': [],
    'UG Others': [],
    'PG (Postgraduate)': [],
  };

  filteredCatalog.forEach((item) => {
    if (groupedFiltered[item.degreeGroup]) {
      groupedFiltered[item.degreeGroup].push(item);
    }
  });

  // Handle Selection
  const handleSelect = (option: DegreeBranchOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
    setIsCustomMode(false);
  };

  // Live branch family detection for custom text
  const detectedFamily: BranchFamily = detectBranchFamily(customBranchText || searchQuery);

  const handleApplyCustom = () => {
    const text = customBranchText.trim() || searchQuery.trim() || 'Custom Engineering Discipline';
    const fam = detectBranchFamily(text);
    const customOpt: DegreeBranchOption = {
      id: `custom-${Date.now()}`,
      degreeGroup: 'B.Tech / B.E',
      degreeName: 'B.Tech / Degree',
      branchName: text,
      family: fam,
      familyLabel: BRANCH_FAMILY_LABELS[fam],
      programLength: 4,
      label: text,
    };
    onChange(customOpt);
    setIsOpen(false);
    setSearchQuery('');
    setIsCustomMode(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="h-6 flex items-center mb-2">
        <label className="text-sm font-bold text-white">Degree &amp; Branch</label>
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="w-full min-h-[52px] h-[52px] bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-blue-500/60 shadow-sm"
      >
        <span
          className="line-clamp-1 leading-normal text-sm font-bold text-white flex-1"
          title={selectedOption ? selectedOption.label : value || 'Select Degree & Branch'}
        >
          {selectedOption ? selectedOption.label : value || 'Select Degree & Branch'}
        </span>
        <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Helper chip below field */}
      <div className="h-7 flex items-center gap-2 mt-2">
        {selectedOption && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 truncate max-w-[200px]">
            {selectedOption.familyLabel}
          </span>
        )}
        <span className="text-xs text-neutral-300 font-medium truncate">Specialization</span>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-3 space-y-2.5 max-h-[420px] overflow-hidden flex flex-col animate-fade-in"
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branch e.g. Computer Science, Mechanical, ECE, AI, MCA..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Grouped Options List */}
          <div className="overflow-y-auto flex-1 space-y-3.5 pr-1 text-sm">
            {Object.entries(groupedFiltered).map(([groupTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1.5">
                  <div className="text-xs font-black uppercase text-neutral-400 tracking-wider px-2 py-1 sticky top-0 bg-neutral-900/95 backdrop-blur-xs">
                    {groupTitle} ({items.length})
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isSelected = selectedOption?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold'
                              : 'hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block truncate text-sm font-bold">{item.branchName}</span>
                            <span
                              className={`text-xs block truncate mt-0.5 ${
                                isSelected ? 'text-white/80' : 'text-neutral-400'
                              }`}
                            >
                              {item.familyLabel} • {item.programLength} Years
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredCatalog.length === 0 && (
              <div className="p-3 text-center text-xs text-muted">
                No predefined branch found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}

            {/* "Other (type your own)" Section */}
            <div className="border-t border-border pt-2.5 mt-2">
              {!isCustomMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(true);
                    setCustomBranchText(searchQuery);
                  }}
                  className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Other (type your own discipline)
                  </span>
                  <span className="text-[10px] font-black uppercase">Custom</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">Type Custom Branch</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Mapped to: {BRANCH_FAMILY_LABELS[detectedFamily]}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customBranchText}
                    onChange={(e) => setCustomBranchText(e.target.value)}
                    placeholder="e.g. Ceramic Engineering, Marine Engineering..."
                    className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-muted hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCustom}
                      className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Apply Discipline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
