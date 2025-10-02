import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    await connectDB();

    // Finde Events ohne Koordinaten
    const eventsWithoutCoords = await Event.find({
      $or: [
        { lat: { $exists: false } },
        { lon: { $exists: false } },
        { lat: '' },
        { lon: '' },
        { lat: null },
        { lon: null }
      ]
    });

    console.log(`Gefunden ${eventsWithoutCoords.length} Events ohne Koordinaten`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const event of eventsWithoutCoords) {
      const locationQuery = event.location || event.address || event.name;
      
      if (!locationQuery) {
        results.push({
          eventId: event._id,
          title: event.title || event.name,
          error: 'Kein Ort verfügbar'
        });
        errorCount++;
        continue;
      }

      try {
        const result = await geocodeLocation(locationQuery);
        
        if (isGeocodingSuccess(result)) {
          await Event.findByIdAndUpdate(event._id, {
            lat: result.lat,
            lon: result.lon
          });

          results.push({
            eventId: event._id,
            title: event.title || event.name,
            location: locationQuery,
            lat: result.lat,
            lon: result.lon,
            display_name: result.display_name
          });
          successCount++;
        } else {
          results.push({
            eventId: event._id,
            title: event.title || event.name,
            location: locationQuery,
            error: result.error
          });
          errorCount++;
        }

        // Rate limiting: 1 request per second
        if (eventsWithoutCoords.indexOf(event) < eventsWithoutCoords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          eventId: event._id,
          title: event.title || event.name,
          location: locationQuery,
          error: 'Fehler beim Geocoding'
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      message: `Geocoding abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`,
      totalEvents: eventsWithoutCoords.length,
      successCount,
      errorCount,
      results
    });

  } catch (error) {
    console.error('Fehler beim Geocoding der Events:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
