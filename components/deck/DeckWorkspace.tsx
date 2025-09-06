import React from 'react';
import Heading from '../Heading';

export default function DeckWorkspace() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="panel p-3 flex items-center justify-between">
  <Heading level={3} className="text-sm tracking-wide">Workspace</Heading>
        <div className="text-[10px] uppercase text-[color:var(--color-text-subtle)]">Skeleton</div>
      </div>
      <div className="panel flex-1 p-4 grid gap-3 auto-rows-min grid-cols-[repeat(auto-fill,minmax(140px,1fr))] overflow-y-auto scroll-y">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="relative group aspect-[2/3] rounded-md bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)] flex items-center justify-center text-xs text-[color:var(--color-text-subtle)] hover:glow-teal-hover">
            <span>Card Slot {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
