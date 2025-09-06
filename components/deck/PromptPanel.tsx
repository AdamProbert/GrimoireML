"use client";
import { useState } from 'react';
import Heading from '../Heading';
import { Textarea, Group } from '@mantine/core';
import TagChip from '../ui/TagChip';

const quickFilters = [
  { label: 'Aggro', value: 'aggro' },
  { label: 'Control', value: 'control' },
  { label: 'Ramp', value: 'ramp' },
  { label: 'Draw', value: 'card draw' }
];

export default function PromptPanel() {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="panel h-full flex flex-col p-4 gap-4">
      <div>
  <Heading level={3} className="text-sm tracking-wide mb-2">AI Prompt</Heading>
        <Textarea
          minRows={4}
          placeholder="e.g. Build a mono-red burn deck focusing on efficient spells"
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
        />
        <Group gap={6} mt={8} wrap="wrap">
          {quickFilters.map(f => (
            <TagChip
              key={f.value}
              label={f.label}
              onClick={() => setPrompt(p => p ? p + ' ' + f.label : f.label)}
            />
          ))}
        </Group>
      </div>
      <div className="mt-auto flex gap-2">
  <button className="btn btn-primary btn-sm w-full disabled:opacity-50" disabled={!prompt.trim()}>Run Prompt</button>
  <button className="btn btn-outline btn-sm w-full" disabled>History</button>
      </div>
    </div>
  );
}
