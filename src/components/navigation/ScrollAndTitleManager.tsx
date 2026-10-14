// ============================================================
// HireFlow Navigation System — Scroll, Focus, and Title Manager
// Runs on every route change: resets scroll to 0, sets document title,
// and moves accessibility focus to the main content heading
// ============================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getEntryByPath } from '../../navigation/registry';

export function ScrollAndTitleManager() {
  const location = useLocation();

  useEffect(() => {
    // 1. Instant scroll-to-top on route transition
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Dynamic document title from navigation registry
    const entry = getEntryByPath(location.pathname);
    if (entry) {
      document.title = `${entry.label} • HireFlow`;
    } else {
      document.title = 'HireFlow — AI-Powered Hiring Platform';
    }

    // 3. Move keyboard focus to main content heading for WCAG 2.2 AA
    const timer = setTimeout(() => {
      const mainHeading = document.querySelector('h1') as HTMLElement | null;
      if (mainHeading) {
        mainHeading.setAttribute('tabIndex', '-1');
        mainHeading.focus({ preventScroll: true });
      } else {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus({ preventScroll: true });
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
