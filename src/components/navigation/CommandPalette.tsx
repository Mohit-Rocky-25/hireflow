// ============================================================
// HireFlow Navigation System — Command Palette (Ctrl/Cmd + K)
// Instant keyboard-driven navigation across all sections & tools
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { searchNavigation, getRegistry, hasRoleAccess } from '../../navigation/registry';
import { getNavIcon } from '../../navigation/icons';
import { useStore } from '../../store/useStore';
import type { NavEntry, CommandSearchResult } from '../../navigation/types';

const RECENT_STORAGE_KEY = 'hireflow_recent_nav';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const userRole = currentUser?.role;

  // Retrieve 3 recently visited items
  const recentItems = useMemo<NavEntry[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (!stored) return [];
      const ids: string[] = JSON.parse(stored);
      const { entries } = getRegistry();
      return ids
        .map((id) => entries.find((e) => e.id === id))
        .filter((e): e is NavEntry => !!e && hasRoleAccess(e.roles, userRole))
        .slice(0, 3);
    } catch {
      return [];
    }
  }, [isOpen, userRole]);

  // Search results
  const searchResults = useMemo<CommandSearchResult[]>(() => {
    if (!query.trim()) {
      return recentItems.map((entry) => ({
        entry,
        sectionLabel: 'Recently Visited',
        matchType: 'recent' as const,
      }));
    }
    return searchNavigation(query, userRole);
  }, [query, userRole, recentItems]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelect(searchResults[selectedIndex].entry);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (entry: NavEntry) => {
    // Record into recent history
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      const prevIds: string[] = stored ? JSON.parse(stored) : [];
      const updated = [entry.id, ...prevIds.filter((id) => id !== entry.id)].slice(0, 5);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    onClose();
    navigate(entry.route);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Command Palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3 bg-surface">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a page, tool, or keyword... (Esc to close)"
            className="flex-1 bg-transparent text-foreground placeholder:text-text-muted text-[15px] font-medium outline-none"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-surface-2 text-text-muted border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-text-muted space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">No pages or tools found matching "{query}"</p>
              <p className="text-xs text-text-muted">Try searching for "resume", "levels", "roadmap", or "jobs"</p>
            </div>
          ) : (
            searchResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={result.entry.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(result.entry)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'text-text hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 p-2 rounded-lg ${isSelected ? 'bg-primary text-white shadow-xs' : 'bg-surface-2 text-text-secondary'}`}>
                      {getNavIcon(result.entry.icon, 'w-4 h-4')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold truncate text-foreground">
                          {result.entry.label}
                        </span>
                        {result.matchType === 'recent' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3" /> Recent
                          </span>
                        )}
                        {result.entry.status === 'new' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-text-muted truncate mt-0.5">
                        {result.sectionLabel} · {result.entry.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-primary text-white rounded">
                        <CornerDownLeft className="w-3 h-3" />
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-surface-2/60 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono font-semibold bg-surface px-1.5 py-0.5 rounded border border-border">↑</kbd>{' '}
              <kbd className="font-mono font-semibold bg-surface px-1.5 py-0.5 rounded border border-border">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="font-mono font-semibold bg-surface px-1.5 py-0.5 rounded border border-border">↵</kbd> Select
            </span>
          </div>
          <span className="font-medium">HireFlow Navigation</span>
        </div>
      </div>
    </div>
  );
}
