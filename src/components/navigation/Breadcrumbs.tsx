// ============================================================
// HireFlow Navigation System — Breadcrumbs Component
// Accessible semantic breadcrumbs generated automatically from registry
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbs } from '../../navigation/registry';

export function Breadcrumbs() {
  const location = useLocation();
  const items = getBreadcrumbs(location.pathname);

  // If on home/dashboard root or single item, don't show redundant single breadcrumb
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto py-1 scrollbar-none">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 shrink-0" aria-hidden="true" />
            )}

            {isLast || !item.path ? (
              <span
                className={`font-semibold truncate max-w-[220px] ${
                  isLast ? 'text-foreground' : 'text-text-secondary'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {idx === 0 && <Home className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-primary transition-colors truncate max-w-[180px] font-medium"
              >
                {idx === 0 && <Home className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
