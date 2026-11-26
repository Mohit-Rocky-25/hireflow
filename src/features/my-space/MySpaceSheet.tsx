import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from './useMySpaceStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { OverviewSection } from './OverviewSection';
import { ScansSection } from './ScansSection';
import { TargetsSection } from './TargetsSection';
import { PlanSection } from './PlanSection';
import { OutreachSection } from './OutreachSection';
import { ResumesSection } from './ResumesSection';
import { ProfileSection } from './ProfileSection';
import {
  LayoutDashboard,
  FileSearch,
  Target,
  ListTodo,
  Send,
  Layers,
  User,
  X,
} from 'lucide-react';

export type MySpaceSection =
  | 'overview'
  | 'scans'
  | 'targets'
  | 'plan'
  | 'outreach'
  | 'resumes'
  | 'profile';

export const MySpaceSheet: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const myParam = searchParams.get('my');
  const auditId = searchParams.get('audit');

  const { status } = useAuthStore();
  const entries = useAuditStore((s) => s.entries);
  const watchlist = useMySpaceStore((s) => s.watchlist);
  const planItems = useMySpaceStore((s) => s.planItems);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const workspaces = useResumeStore((s) => s.workspaces);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const isOpen = Boolean(myParam);
  const activeSection: MySpaceSection = (
    myParam && ['overview', 'scans', 'targets', 'plan', 'outreach', 'resumes', 'profile'].includes(myParam)
      ? myParam
      : 'overview'
  ) as MySpaceSection;

  // Rail collapses to icons only when viewing an audit inspector
  const isInspectorCollapsed = activeSection === 'scans' && Boolean(auditId);

  // Lock scroll, capture and restore focus, trap keys
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus sheet heading on open
    headingRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const closeSheet = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('my');
    next.delete('audit');
    setSearchParams(next);
  };

  const setSection = (section: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('my', section);
    next.delete('audit');
    setSearchParams(next);
  };

  const handleSelectAudit = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    next.set('my', 'scans');
    if (id) {
      next.set('audit', id);
    } else {
      next.delete('audit');
    }
    setSearchParams(next);
  };

  const scansCount = Object.keys(entries).length;
  const targetsCount = Object.values(watchlist).filter((t) => !t.archivedAt).length;
  const planCount = Object.keys(planItems).length;
  const outreachCount = Object.keys(outreachDrafts).length;
  const resumesCount = Object.values(workspaces).filter((w) => !w.archivedAt).length;

  const navItems: Array<{
    id: MySpaceSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'scans', label: 'Scans', icon: FileSearch, count: scansCount },
    { id: 'targets', label: 'Targets', icon: Target, count: targetsCount },
    { id: 'plan', label: 'Plan', icon: ListTodo, count: planCount },
    { id: 'outreach', label: 'Outreach', icon: Send, count: outreachCount },
    { id: 'resumes', label: 'Resumes', icon: Layers, count: resumesCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const syncFooterText =
    status === 'authenticated'
      ? 'Synced to your Supabase Cloud account across devices.'
      : 'Running in transient Guest memory — sign in with Google to save privately to the cloud.';

  return (
    <>
      {/* Scrim backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#050504]/65 backdrop-blur-[3px] animate-in fade-in duration-150"
        onClick={closeSheet}
        aria-hidden="true"
      />

      {/* Main Sheet Container */}
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="My Space"
        className={`fixed z-50 left-1/2 -translate-x-1/2 top-[88px] max-md:top-0 max-md:left-0 max-md:translate-x-0 w-[min(1240px,94vw)] max-md:w-screen h-[calc(100dvh-104px)] max-md:h-[100dvh] rounded-2xl max-md:rounded-none border border-[#24241c] bg-[#090907] shadow-2xl overflow-hidden grid transition-all duration-200 ${
          isInspectorCollapsed
            ? 'grid-cols-[76px_minmax(0,1fr)] max-md:grid-cols-1 max-md:grid-rows-[1fr_auto]'
            : 'grid-cols-[232px_minmax(0,1fr)] max-md:grid-cols-1 max-md:grid-rows-[1fr_auto]'
        }`}
      >
        {/* ── Left Rail (Desktop) / Bottom Nav (Mobile) ── */}
        <aside
          className={`border-r border-[#1b1b15] bg-[#10100d] flex flex-col max-md:order-2 max-md:flex-row max-md:border-r-0 max-md:border-t max-md:border-[#24241c] max-md:overflow-x-auto max-md:px-2 max-md:py-1 ${
            isInspectorCollapsed
              ? 'p-6 px-3 items-center'
              : 'p-6 px-3.5'
          }`}
        >
          {/* Header */}
          {!isInspectorCollapsed && (
            <h6
              ref={headingRef}
              tabIndex={-1}
              className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase px-3 pb-3.5 outline-none max-md:hidden"
            >
              My Space
            </h6>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col max-md:flex-row gap-1 max-md:gap-1.5 flex-1 w-full">
            {navItems.map((item) => {
              const isCurrent = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  aria-current={isCurrent ? 'page' : undefined}
                  title={item.label}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer max-md:flex-1 max-md:justify-center max-md:min-h-[48px] max-md:px-2 ${
                    isCurrent
                      ? 'bg-[#16160f] text-[#f1f1e8]'
                      : 'text-[#9b9b8c] hover:text-[#f1f1e8] hover:bg-[#16160f]/60'
                  } ${isInspectorCollapsed ? 'justify-center p-2.5' : 'justify-between'}`}
                >
                  {/* Left volt indicator bar for active item */}
                  {isCurrent && (
                    <span
                      className={`absolute rounded-r bg-[#faff69] max-md:hidden ${
                        isInspectorCollapsed
                          ? 'left-[-12px] top-2 bottom-2 w-1'
                          : 'left-[-14px] top-2 bottom-2 w-1'
                      }`}
                    />
                  )}

                  {/* Icon & Label */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-[#faff69]" />
                    {!isInspectorCollapsed && (
                      <span className="truncate max-md:hidden">{item.label}</span>
                    )}
                  </div>

                  {/* Badge count */}
                  {!isInspectorCollapsed && item.count !== undefined && (
                    <small className="font-mono tabular-nums text-xs text-[#6d6d61] max-md:hidden">
                      {item.count}
                    </small>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Synced status footer */}
          {!isInspectorCollapsed && (
            <div className="mt-auto pt-3 border-t border-[#1b1b15] text-[#6d6d61] text-[12px] leading-relaxed px-3 max-md:hidden">
              <div className="font-semibold text-[#9b9b8c] flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#faff69]" />
                <span>Synced</span>
              </div>
              <p className="line-clamp-2">{syncFooterText}</p>
            </div>
          )}
        </aside>

        {/* ── Main Content Area ── */}
        <div className="relative overflow-y-auto p-8 sm:p-11 lg:p-14 max-md:p-5 max-md:pt-16">
          {/* Close button */}
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close My Space"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full border border-[#24241c] text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#faff69]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Render Active Section */}
          {activeSection === 'overview' && (
            <OverviewSection
              onNavigateSection={setSection}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {activeSection === 'scans' && (
            <ScansSection
              selectedAuditId={auditId}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {activeSection === 'targets' && (
            <TargetsSection onSelectAudit={handleSelectAudit} />
          )}

          {activeSection === 'plan' && <PlanSection />}

          {activeSection === 'outreach' && <OutreachSection />}

          {activeSection === 'resumes' && <ResumesSection />}

          {activeSection === 'profile' && <ProfileSection />}
        </div>
      </section>
    </>
  );
};

