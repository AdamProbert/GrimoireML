'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Group, Button } from '@mantine/core';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/cards', label: 'Cards' },
  { href: '/decks', label: 'Decks' }
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-white/10 backdrop-blur bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-wide text-gradient-brand text-lg">GrimoireML</Link>
        <nav className="hidden md:block">
          <Group gap="sm">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`text-sm ${pathname === l.href ? 'text-white' : 'text-white/70 hover:text-white'}`}>{l.label}</Link>
            ))}
          </Group>
        </nav>
        <div className="md:hidden">
          <Button size="xs" variant="subtle" onClick={() => setOpen(o => !o)}>Menu</Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`block text-sm ${pathname === l.href ? 'text-white' : 'text-white/70'}`} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
