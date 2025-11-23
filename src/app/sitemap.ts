import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { routing } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fliegerevents.de';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // Statische Seiten für alle Sprachen
  const staticPages = [
    '', // Home
    '/events',
    '/events/map',
    '/ueber-uns',
    '/datenschutz',
    '/impressum',
  ];

  // Erstelle URLs für alle statischen Seiten in allen Sprachen
  const staticUrls: MetadataRoute.Sitemap = [];
  
  for (const locale of routing.locales) {
    for (const page of staticPages) {
      staticUrls.push({
        url: `${siteUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/events' ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(loc => [
              loc,
              `${siteUrl}/${loc}${page}`
            ])
          ),
        },
      });
    }
  }

  // Hole alle Events aus der Datenbank
  const eventUrls: MetadataRoute.Sitemap = [];
  
  try {
    const events = await Event.find({ isActive: { $ne: false } })
      .select('_id updatedAt createdAt')
      .lean();

    for (const event of events) {
      const eventId = event._id.toString();
      const lastModified = event.updatedAt 
        ? new Date(event.updatedAt) 
        : event.createdAt 
        ? new Date(event.createdAt) 
        : new Date();

      // Erstelle URLs für alle Sprachen
      for (const locale of routing.locales) {
        eventUrls.push({
          url: `${siteUrl}/${locale}/events/${eventId}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map(loc => [
                loc,
                `${siteUrl}/${loc}/events/${eventId}`
              ])
            ),
          },
        });
      }
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Events für Sitemap:', error);
    // Falls Fehler, fahre ohne Events fort
  }

  // Kombiniere alle URLs
  return [...staticUrls, ...eventUrls];
}

