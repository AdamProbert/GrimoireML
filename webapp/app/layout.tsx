import '@mantine/core/styles.css';
// Import globals AFTER Mantine so custom overrides win without !important
import './globals.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import React from 'react';
import NavBar from '../components/NavBar';
import { Exo_2, Inter } from 'next/font/google';

const headingFont = Exo_2({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata = {
  title: 'GrimoireML',
  description: 'AI-assisted Magic: The Gathering deckbuilding & discovery',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

// Next.js now expects themeColor in a separate viewport export
export const viewport = {
  themeColor: '#111418',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        {/* Favicon / PWA assets */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <MantineProvider defaultColorScheme="dark">
          <div className="flex flex-col min-h-screen" id="__app-shell">
            <NavBar />
            <main className="flex-1 px-6 py-6">{children}</main>
            <div id="modal-root" />
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
