import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    de: 'Fliegerevents - Events für Privatflieger',
    en: 'Fliegerevents - Events for Private Pilots',
    fr: 'Fliegerevents - Événements pour pilotes privés',
  };
  
  const descriptions = {
    de: 'Ihre Plattform für Luftfahrt-Events, Flugtage und Workshops. Entdecken Sie spannende Veranstaltungen in der Luftfahrtwelt.',
    en: 'Your platform for aviation events, air shows and workshops. Discover exciting events in the aviation world.',
    fr: 'Votre plateforme pour les événements aéronautiques, les meetings aériens et les ateliers. Découvrez des événements passionnants dans le monde de l\'aviation.',
  };
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fliegerevents.de';
  
  return {
    title: titles[locale as keyof typeof titles] || titles.de,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.de,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.de,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.de,
      url: `${siteUrl}/${locale}`,
      siteName: 'Fliegerevents',
      images: [
        {
          url: new URL('/og-image.png', siteUrl).toString(),
          width: 1200,
          height: 630,
          alt: titles[locale as keyof typeof titles] || titles.de,
        },
      ],
      locale: locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.de,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.de,
      images: [new URL('/og-image.png', siteUrl).toString()],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'de': `${siteUrl}/de`,
        'en': `${siteUrl}/en`,
        'fr': `${siteUrl}/fr`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <StructuredData />
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

