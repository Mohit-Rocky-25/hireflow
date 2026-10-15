import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
  category?: string;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  disabled = false,
  className = '',
  id,
  name,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const generatedId = useId();
  const dropdownId = id || generatedId;
  const listboxId = `${dropdownId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Check for mobile viewport (<640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Selected option
  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.sublabel?.toLowerCase().includes(q) ?? false;
      const matchBadge = opt.badge?.toLowerCase().includes(q) ?? false;
      const matchCat = opt.category?.toLowerCase().includes(q) ?? false;
      const matchVal = String(opt.value).toLowerCase().includes(q);
      return matchLabel || matchSub || matchBadge || matchCat || matchVal;
    });
  }, [options, searchQuery]);

  // Compute position for desktop portal
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || isMobile) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Panel height expectation: up to min(60vh, 420px)
    const expectedHeight = Math.min(viewportHeight * 0.6, 420);
    const shouldFlipUp = spaceBelow < 280 && spaceAbove > spaceBelow;

    const width = Math.max(rect.width, 280);
    let left = rect.left;
    if (left + width > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - 16 - width);
    }

    const availableSpace = shouldFlipUp ? spaceAbove - 16 : spaceBelow - 16;
    const maxHeight = Math.max(180, Math.min(availableSpace, expectedHeight));

    if (shouldFlipUp) {
      setPanelStyle({
        position: 'fixed',
        left: `${left}px`,
        bottom: `${viewportHeight - rect.top + 6}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: 99999,
      });
    } else {
      setPanelStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${rect.bottom + 6}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: 99999,
      });
    }
  }, [isMobile]);

  // Update position on scroll, resize or when opened
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScroll = (e: Event) => {
      // Don't close or jitter if scrolling inside the options list itself
      if (panelRef.current && panelRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      // Find initial active index matching current value
      const initialIdx = filteredOptions.findIndex(
        (opt) => String(opt.value) === String(value)
      );
      setActiveIndex(initialIdx >= 0 ? initialIdx : 0);

      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 60);
      }
    } else {
      setSearchQuery('');
      setActiveIndex(-1);
    }
  }, [isOpen, searchable, filteredOptions, value]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsListRef.current) {
      const activeEl = optionsListRef.current.querySelector(
        `[data-option-index="${activeIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  // Selection handler
  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    // Return focus to trigger
    triggerRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp'
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      }
      case 'Home': {
        e.preventDefault();
        setActiveIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        setActiveIndex(filteredOptions.length - 1);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      }
      default:
        break;
    }
  };

  // Group options by category if present
  const hasCategories = useMemo(
    () => options.some((opt) => Boolean(opt.category)),
    [options]
  );

  const groupedOptions = useMemo(() => {
    if (!hasCategories) return null;
    const groups: Record<string, DropdownOption[]> = {};
    filteredOptions.forEach((opt) => {
      const cat = opt.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(opt);
    });
    return groups;
  }, [hasCategories, filteredOptions]);

  // Render option item
  const renderOptionItem = (option: DropdownOption, index: number) => {
    const isSelected = String(option.value) === String(value);
    const isActive = activeIndex === index;

    return (
      <button
        key={String(option.value)}
        type="button"
        role="option"
        id={`${dropdownId}-option-${index}`}
        data-option-index={index}
        aria-selected={isSelected}
        onClick={() => handleSelect(option)}
        onMouseEnter={() => setActiveIndex(index)}
        className={`w-full min-h-[48px] sm:min-h-[48px] text-left px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all border-l-[3px] ${
          isActive
            ? 'bg-sky-500/15 border-sky-400 text-white'
            : isSelected
            ? 'bg-blue-600/20 border-blue-500 text-white'
            : 'border-transparent text-slate-100 hover:bg-sky-500/15 hover:border-sky-400 hover:text-white'
        }`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[16px] leading-snug truncate ${
                isSelected ? 'font-bold text-white' : 'font-medium text-slate-100'
              }`}
            >
              {option.label}
            </span>
            {option.badge && (
              <span className="shrink-0 px-2 py-0.5 text-xs font-bold rounded-md bg-neutral-800 text-blue-400 border border-neutral-700">
                {option.badge}
              </span>
            )}
          </div>
          {option.sublabel && (
            <p className="text-[13px] sm:text-[14px] text-slate-300 font-normal mt-0.5 truncate leading-tight">
              {option.sublabel}
            </p>
          )}
        </div>
        {isSelected && (
          <Check className="w-5 h-5 text-blue-400 shrink-0 stroke-[2.5]" />
        )}
      </button>
    );
  };

  // Panel Content (rendered either in Portal on Desktop, or Bottom Sheet on Mobile)
  const panelContent = (
    <div
      ref={panelRef}
      id={listboxId}
      role="listbox"
      aria-label={label || placeholder}
      aria-activedescendant={
        activeIndex >= 0 ? `${dropdownId}-option-${activeIndex}` : undefined
      }
      onKeyDown={handleKeyDown}
      className={
        isMobile
          ? 'fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl z-[99999] bg-[#0F172A] border-t border-neutral-700 shadow-2xl flex flex-col overflow-hidden animate-slide-up'
          : 'bg-[#0F172A] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col divide-y divide-neutral-800 animate-fade-in'
      }
      style={isMobile ? undefined : panelStyle}
    >
      {/* Mobile Handle & Header */}
      {isMobile && (
        <div className="pt-3 pb-2 px-4 border-b border-neutral-800 shrink-0">
          <div className="w-12 h-1.5 bg-neutral-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">
              {label || placeholder}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Search Input when searchable */}
      {searchable && (
        <div className="p-3 bg-[#0F172A] sticky top-0 z-20 border-b border-neutral-800 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-9 py-2.5 text-[16px] font-medium text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options List Container */}
      <div
        ref={optionsListRef}
        className="overflow-y-auto flex-1 divide-y divide-neutral-850 scrollbar-thin scrollbar-thumb-neutral-700"
      >
        {filteredOptions.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-[15px] font-medium text-slate-300">
              No matches found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : groupedOptions ? (
          Object.entries(groupedOptions).map(([catName, catOptions]) => (
            <div key={catName} className="divide-y divide-neutral-850">
              <div className="sticky top-0 z-10 px-4 py-2 bg-neutral-900/95 backdrop-blur-xs border-y border-neutral-800 text-xs font-black uppercase tracking-wider text-slate-400">
                {catName} ({catOptions.length})
              </div>
              {catOptions.map((opt) => {
                const globalIndex = filteredOptions.indexOf(opt);
                return renderOptionItem(opt, globalIndex);
              })}
            </div>
          ))
        ) : (
          filteredOptions.map((opt, idx) => renderOptionItem(opt, idx))
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Optional Label */}
      {label && (
        <div className="h-6 flex items-center justify-between mb-2">
          <label htmlFor={dropdownId} className="text-sm font-bold text-white">
            {label}
          </label>
        </div>
      )}

      {/* Hidden Native Input for form compatibility / devtools */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value !== undefined ? String(value) : ''}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={dropdownId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[52px] h-[52px] bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-2.5 text-left font-semibold text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-neutral-600 shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="text-[16px] font-semibold text-white truncate flex-1 leading-normal">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Render Panel via Portal */}
      {isOpen &&
        createPortal(
          <>
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/70 z-[99998] backdrop-blur-xs animate-fade-in"
                onClick={() => setIsOpen(false)}
              />
            )}
            {panelContent}
          </>,
          document.body
        )}
    </div>
  );
}
