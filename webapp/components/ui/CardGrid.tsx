'use client';
import React, { useState, useMemo } from 'react';
import { Popover, Slider, Switch, NumberInput, Tooltip } from '@mantine/core';
import CardThumb, { CardThumbProps } from './CardThumb';

export interface CardGridProps {
  cards: CardThumbProps[];
  initialMinWidth?: number; // min width for each card column
  initialGap?: number; // gap in px
  className?: string;
  // Settings defaults
  defaultPreviewDelay?: number;
  defaultHoverEnabled?: boolean;
  enableSettings?: boolean; // allow hiding the settings control entirely
}

/*
  CardGrid renders a responsive CSS grid of CardThumb components with a small settings
  popover letting the user adjust:
   - Card min column width (affects how many columns fit)
   - Gap size
   - Hover previews enabled/disabled
   - Hover preview delay
*/
export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  initialMinWidth = 160,
  initialGap = 12,
  className = '',
  defaultPreviewDelay = 100,
  defaultHoverEnabled = true,
  enableSettings = true,
}) => {
  const [minWidth, setMinWidth] = useState(initialMinWidth);
  const [gap, setGap] = useState(initialGap);
  const [hoverEnabled, setHoverEnabled] = useState(defaultHoverEnabled);
  const [previewDelay, setPreviewDelay] = useState(defaultPreviewDelay);
  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gap: `${gap}px`,
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    }),
    [gap, minWidth]
  );

  return (
    <div className={`relative ${className}`}>
      {enableSettings && (
        <div className="flex justify-end mb-2">
          <Popover position="bottom-end" withArrow shadow="md">
            <Popover.Target>
              <Tooltip label="Grid settings" openDelay={300}>
                <button
                  type="button"
                  aria-label="Grid settings"
                  className="relative inline-flex items-center justify-center h-7 w-7 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]/70 text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent-primary)] focus:ring-offset-0 transition group shadow-sm hover:shadow-ember/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.26.11.54.17.82.17.69 0 1.31-.28 1.51-1V3a2 2 0 0 1 4 0v.09c0 .69.28 1.31 1 1.51.26.11.54.17.82.17.69 0 1.31-.28 1.51-1l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.4.4-.53.98-.33 1.82.11.26.17.54.17.82 0 .69-.28 1.31-1 1.51-.26.11-.54.17-.82.17-.69 0-1.31-.28-1.51-1l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V12c0 .69.28 1.31 1 1.51.26.11.54.17.82.17.69 0 1.31-.28 1.51-1l.06-.06a1.65 1.65 0 0 0 1.82-.33Z" />
                  </svg>
                </button>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown className="w-64 text-[11px] bg-[color:var(--color-bg-elevated)]/95 backdrop-blur border border-[color:var(--color-border)] rounded-md shadow-ember/30 p-4">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="font-medium tracking-wide text-[12px]">
                    Card Width
                  </label>
                  <Slider
                    value={minWidth}
                    min={120}
                    max={260}
                    step={10}
                    onChange={setMinWidth}
                    marks={[
                      { value: 140 },
                      { value: 180 },
                      { value: 220 },
                      { value: 260 },
                    ]}
                    size="sm"
                    color="orange"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium tracking-wide text-[12px]">Gap</label>
                  <Slider
                    value={gap}
                    min={4}
                    max={32}
                    step={2}
                    onChange={setGap}
                    marks={[{ value: 8 }, { value: 16 }, { value: 24 }, { value: 32 }]}
                    size="sm"
                    color="orange"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium tracking-wide text-[12px]">
                    Hover Preview
                  </label>
                  <Switch
                    size="xs"
                    label="Enabled"
                    checked={hoverEnabled}
                    onChange={(e) => setHoverEnabled(e.currentTarget.checked)}
                    color="orange"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium tracking-wide text-[12px]">
                    Preview Delay (ms)
                  </label>
                  <NumberInput
                    size="xs"
                    value={previewDelay}
                    min={0}
                    max={2000}
                    step={50}
                    onChange={(v) => typeof v === 'number' && setPreviewDelay(v)}
                    className="[&_input]:text-[11px]"
                  />
                </div>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      )}
      <div style={gridStyle}>
        {cards.map((c) => (
          <CardThumb
            key={c.name + (c.imageUrl || '')}
            {...c}
            previewOnHover={hoverEnabled && (c.previewOnHover ?? true)}
            previewDelay={previewDelay}
          />
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
