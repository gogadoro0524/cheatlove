import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const description =
  'CheatLens scans dating platforms with AI to surface active profiles, last-seen times, and subscription status. Private, instant, 99% accurate.';

export const metadata: Metadata = {
  metadataBase: new URL('https://cheatlens.com'),
  title: 'CheatLens — Find any dating profile in seconds',
  description,
  openGraph: {
    type: 'website',
    url: 'https://cheatlens.com',
    siteName: 'CheatLens',
    title: 'CheatLens — Find any dating profile in seconds',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheatLens — Find any dating profile in seconds',
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Warm up the connection to the image CDN so above-the-fold portraits
            paint sooner on first load. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
