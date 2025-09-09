import '@mantine/core/styles.css';
// Import globals AFTER Mantine so custom overrides win without !important
import './globals.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import React from 'react';
import { Exo_2, Inter, Uncial_Antiqua } from 'next/font/google';
import InteractiveHeader from '../components/InteractiveHeader';

const headingFont = Exo_2({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const incantationFont = Uncial_Antiqua({ subsets: ['latin'], variable: '--font-incantation', display: 'swap', weight: ['400'] });

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
  <body className={`${headingFont.variable} ${bodyFont.variable} ${incantationFont.variable}`}>
        <MantineProvider defaultColorScheme="dark">
          <div className="flex flex-col min-h-screen" id="__app-shell">
            <InteractiveHeader />
            <main className="flex-1 flex flex-col min-h-0 px-4 md:px-8 py-4 md:py-8">
              {children}
            </main>
            <div id="modal-root" />
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
