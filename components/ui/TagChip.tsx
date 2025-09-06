import React from 'react';

export interface TagChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  size?: 'xs' | 'sm';
  variant?: 'outline' | 'solid';
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  size = 'xs',
  variant = 'outline',
  className = '',
  onClick,
  ...rest
}) => {
  const base = 'inline-flex items-center rounded transition-colors';
  const sizing = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  const style = variant === 'outline'
    ? `border border-[color:var(--color-border)] ${selected ? 'bg-[color:var(--color-accent-primary)]/25 text-[color:var(--color-text-primary)] shadow-ember' : 'bg-[color:var(--color-bg-elevated)]/60 text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-elevated)]/80'}`
    : `${selected ? 'bg-[color:var(--color-accent-primary)] text-[color:var(--color-bg-base)] font-medium shadow-ember' : 'bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-primary)]'}`;
  return (
    <button
      type="button"
      className={`${base} ${sizing} ${style} ${className}`}
      onClick={onClick}
      aria-pressed={selected}
      {...rest}
    >
      {label}
    </button>
  );
};

export default TagChip;
