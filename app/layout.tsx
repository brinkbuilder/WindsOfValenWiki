import type { Metadata } from 'next';
import { Cormorant_Garamond, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Winds of Valen Wiki',
    template: '%s — Winds of Valen Wiki',
  },
  description: 'The complete player guide to Winds of Valen: skills, items, quests, creatures, locations, recipes, and calculators.',
  openGraph: {
    title: 'Winds of Valen Wiki',
    description: 'Skills, items, quests, creatures, locations, recipes, and calculators in one player encyclopedia.',
    type: 'website',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'Winds of Valen Wiki',
    description: 'Skills, items, quests, creatures, locations, recipes, and calculators in one player encyclopedia.',
    images: [],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
        <div className="wiki-site-frame">
          <SiteHeader />
          <div className="wiki-page-column">
            {children}
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
