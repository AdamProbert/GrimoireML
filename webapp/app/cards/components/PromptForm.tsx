'use client';
import React from 'react';
import { TextInput } from '@mantine/core';
// icon removed per request

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
    <form
      onSubmit={onSubmit}
      className="flex gap-3 items-center justify-center w-full px-2 md:px-4"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
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
          className="flex-1 text-lg"
          variant="filled"
          radius="sm"
          size="xl"
          disabled={disabled}
          styles={{
            input: {
              background: 'linear-gradient(135deg,#1f1a17 0%, #241810 100%)',
              color: 'var(--color-text-primary)',
              border: '1px solid rgba(255,140,0,0.45)',
              boxShadow:
                '0 0 0 1px rgba(255,120,0,0.35), 0 0 14px -4px rgba(255,120,0,0.55) inset',
              transition:
                'border-color .18s ease, box-shadow .18s ease, background .25s ease',
              opacity: disabled ? 0.55 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
              userSelect: disabled ? 'none' : 'text',
              fontSize: '1.15rem',
              padding: '1.05rem 1.15rem',
              lineHeight: 1.35,
            },
            wrapper: { position: 'relative' },
          }}
          onFocus={(e) => {
            if (disabled) return;
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,170,0,0.65), 0 0 14px 2px rgba(255,120,0,0.65) inset';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,120,0,0.35), 0 0 14px -4px rgba(255,120,0,0.55) inset';
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
        className="btn btn-primary whitespace-nowrap h-14 flex items-center px-5"
        style={{ minHeight: '56px' }}
      >
        {disabled ? 'Consulting the grimoire…' : 'Search'}
      </button>
    </form>
  );
};

export default PromptForm;
