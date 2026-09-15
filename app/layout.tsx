import type {Metadata, Viewport} from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Plate Expectations',
  description: 'Weekly meal planner, recipe collection with dual star ratings for Aatish & Faeeza, optional breakfast & lunch planning, grocery list with store & expiry tracking, and Google Calendar export.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Plate Expectations',
    description: 'Weekly meal planner, recipe collection with dual star ratings for Aatish & Faeeza, optional breakfast & lunch planning, grocery list with store & expiry tracking, and Google Calendar export.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plate Expectations',
    description: 'Weekly meal planner, recipe collection with dual star ratings for Aatish & Faeeza, optional breakfast & lunch planning, grocery list with store & expiry tracking, and Google Calendar export.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F9F8F3',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plate Expectations" />
      </head>
      <body suppressHydrationWarning className="bg-[#F9F8F3] text-[#1C1C1E] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

