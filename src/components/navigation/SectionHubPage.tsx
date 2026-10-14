// ============================================================
// HireFlow Navigation System — Auto-Generated Section Hub Page
// Generates bold, high-fidelity hub cards directly from registry entries
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { getRegistry, getEntriesForSection, hasRoleAccess } from '../../navigation/registry';
import { getNavIcon } from '../../navigation/icons';
import { useStore } from '../../store/useStore';
import type { NavSection, NavEntry } from '../../navigation/types';

export interface SectionHubPageProps {
  sectionId?: string;
  title?: string;
  description?: string;
}

export function SectionHubPage({ sectionId, title, description }: SectionHubPageProps) {
  const { currentUser } = useStore();
  const location = useLocation();
  const { sections, entries } = getRegistry();

  // Find target section
  const section = sections.find((s) => s.id === sectionId);
  const displayTitle = title || section?.label || 'Platform Tools & Resources';
  const displayDesc =
    description ||
    section?.description ||
    'Explore verified tools, intelligence engines, and guided roadmaps designed to help you win your next tech role.';

  // Retrieve entries belonging to this section visible to user role
  const sectionEntries = sectionId
    ? getEntriesForSection(sectionId, currentUser?.role)
    : entries.filter((e) => !e.hideFromSidebar && hasRoleAccess(e.roles, currentUser?.role));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HireFlow Decision Suite · Section Hub</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
          {displayTitle}
        </h1>

        <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-medium">
          {displayDesc}
        </p>
      </div>

      {/* Grid of Large, Bold Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionEntries.map((entry) => {
          const badgeConfig = entry.badge;
          const badge = typeof badgeConfig === 'function' ? badgeConfig() : badgeConfig;

          return (
            <Link
              key={entry.id}
              to={entry.route}
              className="group p-6 sm:p-7 rounded-3xl bg-surface border-2 border-border/80 hover:border-primary/50 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
                    {getNavIcon(entry.icon, 'w-6 h-6 stroke-[2px]')}
                  </div>

                  {badge && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-surface-2 text-foreground border border-border">
                      {badge.text || (badge.dynamicCount ? badge.dynamicCount() : badge.count)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {entry.label}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-normal">
                    {entry.description}
                  </p>
                </div>

                {/* Keyword Pills */}
                {entry.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {entry.keywords.slice(0, 3).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border/60 capitalize"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
