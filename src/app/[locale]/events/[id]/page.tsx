import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import EventDetailClient from './EventDetailClient';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}): Promise<Metadata> {
  const { locale, id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fliegerevents.de';
  
  try {
    await connectDB();
    const event = await Event.findById(id).lean();
    
    if (!event) {
      return {
        title: 'Event nicht gefunden | Fliegerevents',
      };
    }

    const title = (event.title || event.name || 'Event') as string;
    const description = event.description 
      ? (event.description as string).substring(0, 160).replace(/\s+/g, ' ').trim()
      : 'Fliegerevent auf Fliegerevents.de';
    
    // Canonical URL immer auf die deutsche Version (Default-Locale)
    // Dies verhindert, dass Google die verschiedenen Sprachversionen als Duplikate erkennt
    const canonicalUrl = `${siteUrl}/de/events/${id}`;
    
    // hreflang für alle Sprachversionen
    const languages = {
      'de': `${siteUrl}/de/events/${id}`,
      'en': `${siteUrl}/en/events/${id}`,
      'fr': `${siteUrl}/fr/events/${id}`,
    };

    return {
      title: `${title} | Fliegerevents`,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/${locale}/events/${id}`,
        siteName: 'Fliegerevents',
        images: event.imageurl ? [
          {
            url: event.imageurl as string,
            width: 1200,
            height: 630,
            alt: title,
          },
        ] : [
          {
            url: new URL('/og-image.png', siteUrl).toString(),
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'fr_FR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: event.imageurl ? [event.imageurl as string] : [new URL('/og-image.png', siteUrl).toString()],
      },
      alternates: {
        canonical: canonicalUrl, // Immer auf Deutsch als kanonisch setzen
        languages, // hreflang für alle Sprachen
      },
    };
  } catch (error) {
    console.error('Fehler beim Generieren der Metadata:', error);
    return {
      title: 'Event | Fliegerevents',
    };
  }
}

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { id } = await params;
  
  try {
    await connectDB();
    const event = await Event.findById(id).populate('createdBy', 'name email').lean();
    
    if (!event) {
      notFound();
    }

    // Event-Daten in JSON-Format für Client-Komponente
    // Konvertiere Date-Objekte zu Strings für Client-Side
    const eventData = {
      ...event,
      _id: event._id.toString(),
      date: event.date ? new Date(event.date).toISOString() : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : undefined,
      createdBy: event.createdBy && typeof event.createdBy === 'object' && '_id' in event.createdBy
        ? {
            _id: event.createdBy._id.toString(),
            name: (event.createdBy as any).name || '',
            email: (event.createdBy as any).email || '',
          }
        : undefined,
    };
    
    return <EventDetailClient eventData={eventData as any} />;
  } catch (error) {
    console.error('Fehler beim Laden des Events:', error);
    notFound();
  }
}

