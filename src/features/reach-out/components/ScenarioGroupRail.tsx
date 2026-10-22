// ============================================================
// Reach Out v2 - Scenario Group Rail (Master Rail)
// Collapsible scenario groups, search box, channel & recipient filters
// Compact list view with WCAG AA muted channel badges
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ReachOutTemplate,
  ScenarioGroupMeta,
  ChannelId,
  RecipientTypeId,
  ScenarioGroupId,
} from '../types';
import { SCENARIO_GROUPS, CHANNEL_LABELS } from '../data';
import { MUTED_CHANNEL_PALETTES } from '../engine/config';

interface ScenarioGroupRailProps {
  templates: ReachOutTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  activeChannelFilter: ChannelId | 'all';
  onChangeChannelFilter: (channel: ChannelId | 'all') => void;
  activeRecipientFilter: RecipientTypeId | 'all';
  onChangeRecipientFilter: (recipient: RecipientTypeId | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CHANNELS: { id: ChannelId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Channels' },
  { id: 'linkedin_connect', label: 'Connect' },
  { id: 'linkedin_inmail', label: 'InMail' },
  { id: 'cold_email', label: 'Cold Email' },
  { id: 'direct_message', label: 'Direct Message' },
  { id: 'reply', label: 'Reply' },
];

const RECIPIENTS: { id: RecipientTypeId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Recipients' },
  { id: 'Recruiter', label: 'Recruiter' },
  { id: 'Hiring Manager', label: 'Hiring Manager' },
  { id: 'Peer Engineer', label: 'Peer Engineer' },
  { id: 'Alumnus', label: 'Alumnus' },
  { id: 'Founder/CTO', label: 'Founder/CTO' },
  { id: 'Referrer', label: 'Referrer' },
  { id: 'Campus Recruiter', label: 'Campus Recruiter' },
];

export function ScenarioGroupRail({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  activeChannelFilter,
  onChangeChannelFilter,
  activeRecipientFilter,
  onChangeRecipientFilter,
  searchQuery,
  onSearchChange,
}: ScenarioGroupRailProps) {
  // State for expanded scenario group accordions (keyed by group id)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Toggle group accordion collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Filter templates based on channel, recipient, and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Channel filter
      if (activeChannelFilter !== 'all' && template.channel !== activeChannelFilter) {
        return false;
      }

      // Recipient filter
      if (
        activeRecipientFilter !== 'all' &&
        !template.recipientTypes.includes(activeRecipientFilter)
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesIntent = template.intent.toLowerCase().includes(query);
        const matchesSlots = template.requiredSlots.some((s) => s.toLowerCase().includes(query));
        const matchesGroup = template.group.toLowerCase().includes(query);
        const matchesChannel = template.channel.toLowerCase().includes(query);
        if (!matchesName && !matchesIntent && !matchesSlots && !matchesGroup && !matchesChannel) {
          return false;
        }
      }

      return true;
    });
  }, [templates, activeChannelFilter, activeRecipientFilter, searchQuery]);

  // Group filtered templates by scenario group
  const groupedTemplates = useMemo(() => {
    const map: Record<ScenarioGroupId, ReachOutTemplate[]> = {
      'first-touch-recruiters': [],
      'first-touch-engineers': [],
      'alumni-mutual-warm': [],
      'follow-ups': [],
      'startup-founder-direct': [],
      'campus-fresher-programs': [],
      'open-source-portfolio': [],
      'events-community': [],
      'referral-engine': [],
      'interview-lifecycle': [],
      'informational-chats': [],
      're-engagement-replies': [],
    };

    filteredTemplates.forEach((t) => {
      if (map[t.group]) {
        map[t.group].push(t);
      }
    });

    return map;
  }, [filteredTemplates]);

  const hasActiveFilters =
    activeChannelFilter !== 'all' ||
    activeRecipientFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    onChangeChannelFilter('all');
    onChangeRecipientFilter('all');
    onSearchChange('');
  };

  return (
    <aside
      className="w-full h-full flex flex-col bg-neutral-900 border-r border-neutral-800 text-neutral-100 select-none overflow-hidden"
      aria-label="Outreach Scenarios and Templates Navigation"
    >
      {/* Top Search & Filter Section */}
      <div className="p-3.5 border-b border-neutral-800 space-y-3 shrink-0">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates, slots, scenarios..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            aria-label="Search outreach templates"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Channel Filter Chips */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
            <span>Channel</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-blue-400 hover:text-blue-300 normal-case font-normal cursor-pointer text-[11px]"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {CHANNELS.map((ch) => {
              const isSelected = activeChannelFilter === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onChangeChannelFilter(ch.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-neutral-800 text-white border-neutral-600 font-semibold shadow-xs'
                      : 'bg-neutral-950/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient Filter Chips */}
        <div>
          <div className="text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
            Recipient
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {RECIPIENTS.map((rec) => {
              const isSelected = activeRecipientFilter === rec.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onChangeRecipientFilter(rec.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                      : 'bg-neutral-950/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  {rec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Count Bar */}
      <div className="px-3.5 py-2 bg-neutral-950/50 border-b border-neutral-800/70 flex items-center justify-between text-xs text-neutral-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span>Showing <strong className="text-neutral-100">{filteredTemplates.length}</strong> of 50</span>
        </div>
        <span className="text-[11px] text-neutral-500">12 Scenarios</span>
      </div>

      {/* Collapsible Scenario Groups and Compact Template List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60" role="list">
        {SCENARIO_GROUPS.map((group) => {
          const groupTemplates = groupedTemplates[group.id] || [];
          const isCollapsed = collapsedGroups[group.id] ?? false;
          const hasSelected = groupTemplates.some((t) => t.id === selectedTemplateId);

          if (groupTemplates.length === 0 && hasActiveFilters) {
            return null; // Hide groups with 0 matches when filtering
          }

          return (
            <div key={group.id} className="text-xs">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors cursor-pointer group ${
                  hasSelected ? 'bg-neutral-800/30' : ''
                }`}
                aria-expanded={!isCollapsed}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] flex items-center justify-center font-bold text-neutral-300 shrink-0">
                    {group.number}
                  </span>
                  <span className="font-semibold text-neutral-200 group-hover:text-white truncate">
                    {group.shortLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                    {groupTemplates.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Template Items inside Group */}
              {!isCollapsed && (
                <div className="bg-neutral-950/40 divide-y divide-neutral-800/30">
                  {groupTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplateId;
                    const palette = MUTED_CHANNEL_PALETTES[template.channel];

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelectTemplate(template.id)}
                        className={`w-full px-3.5 py-2.5 text-left transition-all cursor-pointer flex flex-col gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                          isSelected
                            ? 'bg-neutral-800/90 border-l-3 border-blue-500 pl-3'
                            : 'hover:bg-neutral-800/40 text-neutral-300 hover:text-white border-l-3 border-transparent'
                        }`}
                        aria-selected={isSelected}
                      >
                        {/* Name */}
                        <div className="flex items-baseline justify-between gap-1">
                          <span className={`text-xs font-medium truncate ${isSelected ? 'text-white font-semibold' : 'text-neutral-200'}`}>
                            {template.name}
                          </span>
                        </div>

                        {/* Badges: Channel tag + Recipient tag + Limits */}
                        <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                          {/* Channel Tag with WCAG AA Muted Tone and Explicit Label */}
                          <span
                            className="px-1.5 py-0.5 rounded font-medium border inline-flex items-center gap-1"
                            style={{
                              color: palette.text,
                              backgroundColor: palette.bg,
                              borderColor: palette.border,
                            }}
                          >
                            {palette.label}
                          </span>

                          {/* Recipient tag */}
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60 truncate max-w-[120px]">
                            {template.recipientTypes[0]}
                            {template.recipientTypes.length > 1 ? ` +${template.recipientTypes.length - 1}` : ''}
                          </span>

                          {/* Word/Char limit indication */}
                          <span className="text-neutral-500 font-mono ml-auto">
                            {template.limits?.maxChars
                              ? `max ${template.limits.maxChars}c`
                              : `~${template.limits?.maxWords || 90}w`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
