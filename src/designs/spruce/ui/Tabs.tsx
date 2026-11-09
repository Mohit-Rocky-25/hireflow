import React, { useRef } from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  badge?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className = '' }: TabsProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % items.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextItem = items[nextIndex];
    if (nextItem) {
      onChange(nextItem.id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-2 border-b border-sp-hairline overflow-x-auto no-scrollbar ${className}`}
    >
      {items.map((item, idx) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`h-11 px-4 sp-ui-label border-b-2 transition-colors duration-150 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sp-primary-text ${
              isActive
                ? 'border-sp-primary text-sp-ink font-bold'
                : 'border-transparent text-sp-muted hover:text-sp-ink font-medium'
            }`}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={`sp-micro px-2 py-0.5 rounded-full tabular-nums ${
                  isActive ? 'bg-sp-mint-100 text-sp-primary-text font-bold' : 'bg-sp-canvas-soft text-sp-muted'
                }`}
              >
                {item.count}
              </span>
            )}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

export interface CategoryRailItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface CategoryRailProps {
  items: CategoryRailItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CategoryRail({ items, activeId, onChange, className = '' }: CategoryRailProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-6 overflow-x-auto no-scrollbar py-2 px-1 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-2 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sp-primary-text shrink-0 select-none"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-150 ${
                isActive
                  ? 'bg-sp-primary text-sp-on-primary shadow-sp-3'
                  : 'bg-sp-mint-50 text-sp-primary-text group-hover:bg-sp-mint-100'
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`sp-caption transition-colors duration-150 ${
                isActive ? 'text-sp-ink font-bold' : 'text-sp-muted group-hover:text-sp-ink'
              }`}
            >
              {item.label}
            </span>
            <div
              className={`h-0.5 w-full rounded-full transition-colors duration-150 ${
                isActive ? 'bg-sp-primary' : 'bg-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
