import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './nightfall.css';
import './theme-control.css';
import { AskZhiznFloatingChat } from './components/AskZhiznFloatingChat';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://valen-wiki-pi.vercel.app'),
  title: {
    default: 'Winds of Valen Wiki',
    template: '%s — Winds of Valen Wiki',
  },
  description: 'The complete player guide to Winds of Valen: skills, items, quests, creatures, locations, recipes, and calculators.',
  openGraph: {
    title: 'Winds of Valen Wiki',
    description: 'Skills, items, quests, creatures, locations, recipes, and calculators in one player encyclopedia.',
    type: 'website',
    images: [{
      url: 'https://valen-wiki-pi.vercel.app/og.png',
      width: 1200,
      height: 630,
      alt: 'Winds of Valen Wiki — The complete player guide',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Winds of Valen Wiki',
    description: 'Skills, items, quests, creatures, locations, recipes, and calculators in one player encyclopedia.',
    images: ['https://valen-wiki-pi.vercel.app/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('valen-wiki-theme');t=t==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();` }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="wiki-site-frame">
          <SiteHeader />
          <div className="wiki-page-column">
            {children}
            <SiteFooter />
          </div>
        </div>
        <AskZhiznFloatingChat />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
