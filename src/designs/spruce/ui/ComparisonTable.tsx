import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  isNumeric?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface ComparisonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  selectedId?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function ComparisonTable<T>({
  columns,
  data,
  keyExtractor,
  selectedId,
  onRowClick,
  className = '',
}: ComparisonTableProps<T>) {
  return (
    <div className={`w-full overflow-hidden border border-sp-hairline rounded-sp-lg bg-sp-surface ${className}`}>
      {/* Desktop / Tablet Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-sp-canvas-soft border-b border-sp-hairline">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 sp-eyebrow text-sp-muted font-bold ${
                    col.align === 'right' || col.isNumeric ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const id = keyExtractor(row, index);
              const isSelected = id === selectedId;

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-sp-hairline transition-colors duration-150 ${
                    isSelected ? 'bg-sp-mint-100 font-medium' : 'bg-sp-surface hover:bg-sp-mint-50'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => {
                    const value = col.render ? col.render(row, index) : (row as any)[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 sp-body-sm text-sp-ink ${
                          col.align === 'right' || col.isNumeric ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (< 768px) */}
      <div className="block md:hidden divide-y divide-sp-hairline" data-testid="stacked-mobile-cards">
        {data.map((row, index) => {
          const id = keyExtractor(row, index);
          const isSelected = id === selectedId;

          return (
            <div
              key={id}
              onClick={() => onRowClick?.(row)}
              className={`p-4 space-y-3 ${
                isSelected ? 'bg-sp-mint-100' : 'bg-sp-surface hover:bg-sp-mint-50'
              } ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => {
                const value = col.render ? col.render(row, index) : (row as any)[col.key];
                return (
                  <div key={col.key} className="flex items-center justify-between gap-4">
                    <span className="sp-caption text-sp-muted font-medium">{col.header}</span>
                    <span className={`sp-body-sm text-sp-ink font-medium ${col.isNumeric ? 'tabular-nums' : ''}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
