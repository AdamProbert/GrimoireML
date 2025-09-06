import React from 'react';

export interface StatRowProps {
  label: string;
  value: React.ReactNode;
  subtle?: boolean;
}

export const StatRow: React.FC<StatRowProps> = ({ label, value, subtle = false }) => (
  <div className="flex items-center justify-between gap-4 text-[11px]">
    <span
      className={`uppercase tracking-wide ${subtle ? 'text-[color:var(--color-text-muted)]' : 'text-[color:var(--color-text-subtle)]'}`}
    >
      {label}
    </span>
    <span className="text-[color:var(--color-text-primary)]">{value}</span>
  </div>
);

export default StatRow;
