// ============================================================
// HireFlow v2 — App Shell Layout (§13)
// Sidebar: 260px expanded / 72px collapsed
// Content max-width: 1280px, 32px gutters desktop, 16px mobile
// ============================================================
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      {/* Desktop Sidebar — 260px / 72px per §5.4 */}
      <div className={`hidden lg:flex transition-all duration-200 ease-out ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Mobile Sidebar Overlay — 200ms panel enter per §5.6 */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] animate-slide-in">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content — spacious with generous padding */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={!sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-[16px] sm:p-[24px] lg:p-[32px]">
          <div className="max-w-[1280px] mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
