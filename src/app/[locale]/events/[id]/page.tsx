import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import EventDetailClient from './EventDetailClient';

interface PopulatedCreatedBy {
  _id: string | { toString(): string };
  name?: string;
  email?: string;
}

interface EventData {
  _id: string;
  name: string;
  title?: string;
  description: string;
  location?: string;
  address?: string;
  lat: string;
  lon: string;
  icao: string;
  imageurl: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  multiDay?: boolean;
  eventType?: string;
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  entryFee?: number;
  maxParticipants?: number;
  registrationRequired?: boolean;
  tags?: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

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
    const populatedCreatedBy = event.createdBy as PopulatedCreatedBy | null | undefined;
    const eventData: EventData = {
      _id: event._id.toString(),
      name: event.name || event.title || '',
      title: event.title,
      description: event.description || '',
      location: event.location,
      address: event.address,
      lat: event.lat || '',
      lon: event.lon || '',
      icao: event.icao || '',
      imageurl: event.imageurl || '',
      date: event.date ? new Date(event.date).toISOString() : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      multiDay: event.multiDay,
      eventType: event.eventType,
      organizer: event.organizer,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
      website: event.website,
      entryFee: event.entryFee,
      maxParticipants: event.maxParticipants,
      registrationRequired: event.registrationRequired,
      tags: event.tags,
      createdBy: populatedCreatedBy && typeof populatedCreatedBy === 'object' && '_id' in populatedCreatedBy
        ? {
            _id: typeof populatedCreatedBy._id === 'string' 
              ? populatedCreatedBy._id 
              : populatedCreatedBy._id.toString(),
            name: populatedCreatedBy.name || '',
            email: populatedCreatedBy.email || '',
          }
        : undefined,
    };
    
    return <EventDetailClient eventData={eventData} />;
  } catch (error) {
    console.error('Fehler beim Laden des Events:', error);
    notFound();
  }
}

