'use client';
import Link from 'next/link';
import Logo from './Logo';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/cards', label: 'Cards' },
  { href: '/my-decks', label: 'My Decks' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[color:var(--color-bg-base)]/90 backdrop-blur border-b border-[color:var(--color-border)] shadow-[0_2px_0_0_rgba(255,111,0,0.05)] relative">
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <Link
            href="/"
            aria-label="GrimoireML Home"
            className="group shrink-0 flex items-center focus:outline-none"
            tabIndex={0}
          >
            <Logo
              size={48}
              priority
              className="transition-transform group-hover:scale-[1.04]"
            />
            <span className="sr-only">GrimoireML</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    'group relative inline-flex items-center text-sm font-medium px-2 py-1 transition-colors duration-200',
                    active
                      ? 'text-[color:var(--color-text-primary)]'
                      : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]',
                  ].join(' ')}
                >
                  <span className="relative z-10">{l.label}</span>
                  <span
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-[2px] w-0 rounded bg-gradient-to-r from-ember via-gold to-ember transition-all duration-300 ${
                      active ? 'w-3/4' : 'group-hover:w-3/4'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Right: mobile menu trigger (placeholder for future user controls) */}
        <div className="md:hidden">
          <button
            className="relative inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)]/60 bg-[color:var(--color-bg-elevated)]/40 px-4 py-1.5 text-xs font-medium text-[color:var(--color-text-muted)] shadow-sm backdrop-blur-sm transition hover:text-[color:var(--color-text-primary)] hover:border-gradient-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-primary)]/60"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-3 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block text-sm ${
                pathname === l.href
                  ? 'text-[color:var(--color-text-primary)] font-medium'
                  : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
              } py-1`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
