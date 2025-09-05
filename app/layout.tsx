import './globals.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import React from 'react';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'GrimoireML',
  description: 'AI-assisted Magic: The Gathering deckbuilding & discovery'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <NavBar />
          <main className="mx-auto max-w-7xl px-4 py-6">
            {children}
          </main>
        </MantineProvider>
      </body>
    </html>
  );
}
