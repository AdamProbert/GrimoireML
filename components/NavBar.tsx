'use client';
import Link from 'next/link';
import Heading from './Heading';
import { usePathname } from 'next/navigation';
import { Group, Button } from '@mantine/core';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/cards', label: 'Cards' },
  { href: '/decks', label: 'Builder' },
  { href: '/my-decks', label: 'My Decks' }
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-[color:var(--coloru-border)] bg-[color:var(--color-bg-elevated)]/80 backdrop-blur">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        <Link href="/" aria-label="GrimoireML Home">
          <Heading level={2} className="!m-0 text-lg font-bold tracking-wide">GrimoireML</Heading>
        </Link>
        <nav className="hidden md:block">
          <Group gap="sm">
            {links.map(l => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm px-3 py-1 rounded-md transition-colors ${active ? 'text-white bg-[color:var(--color-bg-sunken)] glow-teal' : 'text-[color:var(--color-text-muted)] hover:text-white hover:bg-[color:var(--color-bg-sunken)]/70'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </Group>
        </nav>
        <div className="md:hidden">
          <Button size="xs" variant="subtle" onClick={() => setOpen(o => !o)}>Menu</Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-3 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`block text-sm ${pathname === l.href ? 'text-white' : 'text-white/70'}`} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
