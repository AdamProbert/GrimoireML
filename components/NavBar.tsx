'use client';
import Link from 'next/link';
import Heading from './Heading';
import { usePathname } from 'next/navigation';
import { Group } from '@mantine/core';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/cards', label: 'Cards' },
  { href: '/my-decks', label: 'My Decks' }
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[color:var(--color-bg-base)]/90 backdrop-blur border-b border-[color:var(--color-border)] shadow-[0_2px_0_0_rgba(255,111,0,0.05)] relative">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        <Link href="/" aria-label="GrimoireML Home" className="group">
          <Heading level={2} className="!m-0 text-lg font-bold tracking-wide text-gradient-brand">GrimoireML</Heading>
        </Link>
        <nav className="hidden md:block">
          <Group gap="xs">
            {links.map(l => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-sm px-3 py-1 rounded-md transition-colors/150 duration-200 ${active ? 'text-[color:var(--color-text-primary)]' : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'} hover:bg-[color:var(--color-bg-elevated)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-primary)]/60`}>
                  <span className="relative z-10">{l.label}</span>
                  {active && <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] w-3/4 rounded bg-gradient-to-r from-ember via-gold to-ember" />}
                </Link>
              );
            })}
          </Group>
        </nav>
        <div className="md:hidden">
          <button className="btn btn-outline btn-sm" onClick={() => setOpen(o => !o)}>Menu</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-3 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`block text-sm ${pathname === l.href ? 'text-[color:var(--color-text-primary)] font-medium' : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'} py-1`} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
