"use client";
import { useState } from 'react';
import Heading from '../Heading';
import { Textarea, Button, Badge, Group } from '@mantine/core';

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
            <Badge key={f.value} variant="outline" color="cyan" className="cursor-pointer hover:glow-teal" onClick={() => setPrompt(p => p ? p + ' ' + f.label : f.label)}>{f.label}</Badge>
          ))}
        </Group>
      </div>
      <div className="mt-auto flex gap-2">
        <Button fullWidth size="xs" color="cyan" variant="light" disabled={!prompt.trim()}>Run Prompt</Button>
        <Button fullWidth size="xs" variant="default" disabled>History</Button>
      </div>
    </div>
  );
}
