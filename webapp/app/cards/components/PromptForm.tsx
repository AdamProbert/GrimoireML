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
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <div className="relative flex-1">
        <TextInput
          value={value}
          aria-busy={disabled}
          aria-disabled={disabled}
          onChange={(e) => {
            if (disabled) return; // guard if disabled
            onChange(e.currentTarget.value);
          }}
          placeholder="e.g. cheap blue or green human creatures under 3 mana sorted by cost"
          className="flex-1"
          variant="filled"
          radius="sm"
          size="md"
          disabled={disabled}
          styles={{
            input: {
              background: 'linear-gradient(135deg,#1f1a17 0%, #241810 100%)',
              color: 'var(--color-text-primary)',
              border: '1px solid rgba(255,140,0,0.35)',
              boxShadow:
                '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset',
              transition:
                'border-color .18s ease, box-shadow .18s ease, background .25s ease',
              opacity: disabled ? 0.55 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
              userSelect: disabled ? 'none' : 'text',
            },
            wrapper: { position: 'relative' },
          }}
          onFocus={(e) => {
            if (disabled) return;
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,160,0,0.55), 0 0 10px 0 rgba(255,90,0,0.6) inset';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset';
          }}
        />
        {disabled && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-md bg-black/45 backdrop-blur-[2px] flex items-center justify-center text-[11px] tracking-wide font-medium text-amber-300/90 shadow-inner border border-amber-400/20"
          >
            Consulting the grimoire…
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="btn btn-primary whitespace-nowrap"
      >
        {disabled ? 'Consulting the grimoire…' : 'Search'}
      </button>
    </form>
  );
};

export default PromptForm;
