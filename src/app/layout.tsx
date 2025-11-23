import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Fliegerevents - Events für Privatflieger',
  description: 'Entdecken Sie Flugtage, Luftfahrt-Events und Workshops für Privatflieger',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Open Graph für Social Media
  openGraph: {
    title: 'Fliegerevents - Events für Privatflieger',
    description: 'Ihre Plattform für Luftfahrt-Events, Flugtage und Workshops. Entdecken Sie spannende Veranstaltungen in der Luftfahrtwelt.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fliegerevents.de',
    siteName: 'Fliegerevents',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fliegerevents - Events für Privatflieger',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Fliegerevents - Events für Privatflieger',
    description: 'Ihre Plattform für Luftfahrt-Events, Flugtage und Workshops. Entdecken Sie spannende Veranstaltungen in der Luftfahrtwelt.',
    images: ['/og-image.png'],
  },
  // Weitere SEO-Meta-Tags
  keywords: ['Flugtage', 'Luftfahrt-Events', 'Privatflieger', 'Fly-In', 'Flugzeug', 'Aviation', 'Flugtag', 'Luftfahrt', 'Workshop', 'Flugplatz'],
  authors: [{ name: 'Fliegerevents' }],
  creator: 'Fliegerevents',
  publisher: 'Fliegerevents',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fliegerevents.de'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The middleware handles locale redirection
  // This layout provides the root html/body structure
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const path = window.location.pathname;
                const locales = ['de', 'en', 'fr'];
                const locale = locales.find(loc => path.startsWith('/' + loc + '/') || path === '/' + loc) || 'de';
                document.documentElement.lang = locale;
              })();
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
