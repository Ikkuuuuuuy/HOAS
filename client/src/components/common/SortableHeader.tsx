import React from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortField: string;
  currentSortDirection: SortDirection;
  onSort: (field: string, direction?: SortDirection) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  children?: React.ReactNode;
}

export default function SortableHeader({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  align = 'left',
  className = '',
  style = {},
  title,
  children,
}: SortableHeaderProps) {
  const isActive = currentSortField === field;
  const isAsc = isActive && currentSortDirection === 'asc';
  const isDesc = isActive && currentSortDirection === 'desc';

  const handleClick = (e: React.MouseEvent) => {
    // Tapping the th cell toggles direction
    onSort(field);
  };

  const handleAscClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSort(field, 'asc');
  };

  const handleDescClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSort(field, 'desc');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(field);
    }
  };

  const nextDirection = isActive
    ? currentSortDirection === 'asc'
      ? 'Descending (Down)'
      : 'Ascending (Up)'
    : 'Ascending (Up)';

  const tooltip =
    title ||
    `Click to sort by ${label} ${nextDirection}. Currently ${
      isActive ? (isAsc ? 'Sorted Up (Ascending)' : 'Sorted Down (Descending)') : 'Unsorted'
    }`;

  return (
    <th
      className={`sortable-th ${isActive ? 'sort-active' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="columnheader"
      aria-sort={isActive ? (isAsc ? 'ascending' : 'descending') : 'none'}
      title={tooltip}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        textAlign: align,
        transition: 'background var(--transition-fast, 0.15s ease), color var(--transition-fast, 0.15s ease)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          gap: '6px',
          width: '100%',
        }}
      >
        <span
          style={{
            fontWeight: isActive ? 700 : undefined,
            color: isActive ? 'var(--text-primary)' : undefined,
          }}
        >
          {children || label}
        </span>

        {/* Up / Down Sort Indicators */}
        <span
          className="sort-arrow-group"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px',
            verticalAlign: 'middle',
            lineHeight: 1,
            gap: '1px',
            flexShrink: 0,
          }}
        >
          {/* UP ARROW (▲) */}
          <button
            type="button"
            tabIndex={-1}
            onClick={handleAscClick}
            aria-label={`Sort ${label} Up (Ascending)`}
            title={`Sort ${label} Up (Ascending)`}
            style={{
              background: 'none',
              border: 'none',
              padding: '1px 2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAsc ? '#2563EB' : 'var(--text-muted)',
              opacity: isAsc ? 1 : 0.35,
              transform: isAsc ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
              <path d="M4 0L8 5H0L4 0Z" />
            </svg>
          </button>

          {/* DOWN ARROW (▼) */}
          <button
            type="button"
            tabIndex={-1}
            onClick={handleDescClick}
            aria-label={`Sort ${label} Down (Descending)`}
            title={`Sort ${label} Down (Descending)`}
            style={{
              background: 'none',
              border: 'none',
              padding: '1px 2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDesc ? '#2563EB' : 'var(--text-muted)',
              opacity: isDesc ? 1 : 0.35,
              transform: isDesc ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
              <path d="M4 5L0 0H8L4 5Z" />
            </svg>
          </button>
        </span>
      </div>
    </th>
  );
}
