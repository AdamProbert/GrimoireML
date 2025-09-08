'use client';
import React from 'react';
import { TextInput } from '@mantine/core';

interface PromptFormProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  disabled?: boolean;
}

/**
 * PromptForm: small focused component for the natural language prompt input + submit button.
 * Styling kept identical to original inline version for zero visual/behavioral change.
 */
export const PromptForm: React.FC<PromptFormProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-start">
      <TextInput
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder="e.g. cheap blue or green human creatures under 3 mana sorted by cost"
        className="flex-1"
        variant="filled"
        radius="sm"
        size="md"
        styles={{
          input: {
            background: 'linear-gradient(135deg,#1f1a17 0%, #241810 100%)',
            color: 'var(--color-text-primary)',
            border: '1px solid rgba(255,140,0,0.35)',
            boxShadow:
              '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset',
            transition:
              'border-color .18s ease, box-shadow .18s ease, background .25s ease',
          },
          wrapper: { position: 'relative' },
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow =
            '0 0 0 1px rgba(255,160,0,0.55), 0 0 10px 0 rgba(255,90,0,0.6) inset';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow =
            '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset';
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="btn btn-primary whitespace-nowrap"
      >
        {disabled ? 'Parsing…' : 'Parse & Search'}
      </button>
    </form>
  );
};

export default PromptForm;
