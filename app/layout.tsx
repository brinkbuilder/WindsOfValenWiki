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
    default: 'The Valen Archives — Winds of Valen Player Wiki',
    template: '%s — The Valen Archives',
  },
  description: 'A player-made Winds of Valen encyclopedia of items, creatures, quests, recipes, locations, and practical guides.',
  openGraph: {
    title: 'The Valen Archives',
    description: 'A Winds of Valen player wiki for items, creatures, quests, skills, locations, and practical guides.',
    type: 'website',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'The Valen Archives',
    description: 'A Winds of Valen player wiki for items, creatures, quests, skills, locations, and practical guides.',
    images: [],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
