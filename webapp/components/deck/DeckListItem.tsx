import React from 'react';

export interface DeckListItemProps {
  name: string;
  count: number;
  status?: 'pending' | 'ok' | 'error';
  active?: boolean;
  onClick?: () => void;
}

const statusSymbol = (status?: 'pending' | 'ok' | 'error') => {
  if (status === 'ok') return '✓';
  if (status === 'error') return '!';
  return '…';
};

export const DeckListItem: React.FC<DeckListItemProps> = ({
  name,
  count,
  status,
  active = false,
  onClick,
}) => {
  return (
    <li
      className={`relative flex items-center justify-between gap-2 text-xs px-1 py-0.5 rounded transition-colors ${active ? 'bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-primary)]' : 'hover:bg-[color:var(--color-bg-elevated)]/60'} cursor-default`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`${count} ${name}`}
    >
      <span className="truncate">
        <span className="text-[color:var(--color-accent-warm)] font-medium">
          {count}×
        </span>{' '}
        {name}
      </span>
      <span className="text-[10px] text-[color:var(--color-text-subtle)]">
        {statusSymbol(status)}
      </span>
      {active && (
        <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[linear-gradient(90deg,#FF6F00,#FFB300,#FF6F00)]" />
      )}
    </li>
  );
};

export default DeckListItem;
