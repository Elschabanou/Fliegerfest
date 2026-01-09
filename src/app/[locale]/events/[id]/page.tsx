import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
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
    
    // Versuche zuerst mit Mongoose
    let event = await Event.findById(id).populate('createdBy', 'name email').lean();
    
    // Falls nicht gefunden, versuche mit direkter MongoDB Collection (wie in der API-Route)
    if (!event) {
      const mongoose = await import('mongoose');
      if (mongoose.connection.db) {
        try {
          const eventsCollection = mongoose.connection.db.collection('events');
          const directEvent = await eventsCollection.findOne({ 
            _id: new mongoose.Types.ObjectId(id) 
          });
          
          if (directEvent) {
            // Konvertiere das direkte MongoDB-Dokument zu einem Event-Format
            // Type assertion needed because directEvent is a raw MongoDB document
            // Runtime checks below ensure type safety
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event = directEvent as any;
            // Versuche createdBy zu populieren, falls vorhanden
            if (event && event.createdBy && typeof event.createdBy === 'object' && '_id' in event.createdBy) {
              try {
                const userId = (event.createdBy as { _id: unknown })._id;
                const user = await User.findById(userId).lean();
                if (user) {
                  (event as { createdBy: { _id: string; name: string; email: string } }).createdBy = {
                    _id: user._id.toString(),
                    name: (user as { name?: string }).name || '',
                    email: (user as { email?: string }).email || '',
                  };
                }
              } catch (userError) {
                console.error('Fehler beim Laden des Users:', userError);
                // Setze createdBy auf undefined, wenn User nicht geladen werden kann
                (event as { createdBy?: unknown }).createdBy = undefined;
              }
            }
          }
        } catch (mongoError) {
          console.error('Fehler beim direkten MongoDB-Zugriff:', mongoError);
        }
      }
  }

  if (!event) {
      console.error('Event nicht gefunden für ID:', id);
      notFound();
    }

    // Event-Daten in JSON-Format für Client-Komponente
    // Konvertiere Date-Objekte zu Strings für Client-Side
    const populatedCreatedBy = event.createdBy as PopulatedCreatedBy | null | undefined;
    
    // Konvertiere Date sicher
    const convertDate = (date: unknown): string => {
      if (!date) return '';
      try {
        if (date instanceof Date) {
          return date.toISOString();
        }
        if (typeof date === 'string') {
          return new Date(date).toISOString();
        }
        return '';
      } catch {
        return '';
      }
    };
    
    const eventData: EventData = {
      _id: event._id ? event._id.toString() : '',
      name: (event.name || event.title || '') as string,
      title: event.title as string | undefined,
      description: (event.description || '') as string,
      location: event.location as string | undefined,
      address: event.address as string | undefined,
      lat: (event.lat || '') as string,
      lon: (event.lon || '') as string,
      icao: (event.icao || '') as string,
      imageurl: (event.imageurl || '') as string,
      date: convertDate(event.date),
      endDate: event.endDate ? convertDate(event.endDate) : undefined,
      startTime: event.startTime as string | undefined,
      endTime: event.endTime as string | undefined,
      allDay: event.allDay as boolean | undefined,
      multiDay: event.multiDay as boolean | undefined,
      eventType: event.eventType as string | undefined,
      organizer: event.organizer as string | undefined,
      contactEmail: event.contactEmail as string | undefined,
      contactPhone: event.contactPhone as string | undefined,
      website: event.website as string | undefined,
      entryFee: event.entryFee as number | undefined,
      maxParticipants: event.maxParticipants as number | undefined,
      registrationRequired: event.registrationRequired as boolean | undefined,
      tags: event.tags as string[] | undefined,
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
    console.error('Event ID:', id);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    notFound();
  }
}

