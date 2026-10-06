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
      <label className="text-xs font-black text-foreground block mb-1.5 flex items-center justify-between">
        <span>Degree & Branch</span>
        {selectedOption && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {selectedOption.familyLabel}
          </span>
        )}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="w-full min-h-[44px] bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-primary/40"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : value || 'Select Degree & Branch'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl p-2.5 space-y-2 max-h-[380px] overflow-hidden flex flex-col animate-fade-in"
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branch e.g. Mechanical, ECE, AI, MCA..."
              className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Grouped Options List */}
          <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
            {Object.entries(groupedFiltered).map(([groupTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-muted tracking-wider px-2 py-1 sticky top-0 bg-surface/90 backdrop-blur-xs">
                    {groupTitle} ({items.length})
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isSelected = selectedOption?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          className={`w-full min-h-[38px] text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-white font-bold'
                              : 'hover:bg-surface-2 text-foreground font-medium'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block truncate">{item.branchName}</span>
                            <span
                              className={`text-[10px] block truncate ${
                                isSelected ? 'text-white/80' : 'text-muted'
                              }`}
                            >
                              {item.familyLabel} • {item.programLength} Years
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
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
