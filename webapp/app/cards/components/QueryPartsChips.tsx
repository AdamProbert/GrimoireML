'use client';
import React from 'react';
import { Chip, Text } from '@mantine/core';

interface QueryPartsChipsProps {
  allParts: string[];
  activeParts: string[];
  onChange: (parts: string[]) => void;
}

/**
 * Renders the toggleable chip list of parsed query parts.
 */
export const QueryPartsChips: React.FC<QueryPartsChipsProps> = ({
  allParts,
  activeParts,
  onChange,
}) => {
  if (allParts.length === 0) return null;
  return (
    <div className="space-y-2">
      <Text size="sm" c="dimmed">
        Query parts (toggle to refine):
      </Text>
      <Chip.Group
        multiple
        value={activeParts}
        onChange={(vals) => onChange(vals as string[])}
      >
        <div className="flex flex-wrap gap-2">
          {allParts.map((p) => {
            const active = activeParts.includes(p);
            return (
              <Chip
                key={p}
                value={p}
                variant="filled"
                radius="sm"
                color={active ? 'orange' : 'gray'}
                styles={{
                  root: {
                    background: active
                      ? 'linear-gradient(135deg,#ff7a18 0%,#ff521b 40%,#ff2d55 100%)'
                      : 'rgba(120,120,120,0.15)',
                    color: active ? '#fff' : '#ddd',
                    border: active
                      ? '1px solid rgba(255,140,0,0.65)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 0 6px -1px rgba(255,100,0,0.7)' : 'none',
                    cursor: 'pointer',
                    transition: 'all .18s ease',
                  },
                  checkIcon: { color: '#fff' },
                }}
              >
                {p}
              </Chip>
            );
          })}
        </div>
      </Chip.Group>
    </div>
  );
};

export default QueryPartsChips;
