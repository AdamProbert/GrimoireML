import React from 'react';
import { Button, Badge } from '@mantine/core';

export default function StatusBar() {
  return (
    <div className="h-12 mt-4 flex items-center justify-between px-4 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
      <div className="flex items-center gap-3 text-[11px] text-[color:var(--color-text-subtle)]">
        <Badge variant="outline" color="cyan" size="xs">Idle</Badge>
        <span>Ready for prompt.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="xs" variant="default" disabled>Save Deck</Button>
        <Button size="xs" color="cyan" variant="light" disabled>Export</Button>
      </div>
    </div>
  );
}
