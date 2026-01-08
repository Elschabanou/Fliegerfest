'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft, MapPin } from 'lucide-react';
import EventsMap from '@/components/EventsMap';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';

interface Event {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  location?: string;
  lat?: string;
  lon?: string;
  icao?: string;
  imageurl?: string;
  date?: string;
  dateTime?: string;
  startTime?: string;
  endTime?: string;
  eventType?: string;
  entryFee?: number;
  organizer?: string;
  tags?: string[];
}

export default function EventsMapPage() {
  const t = useTranslations('events');
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Zeitfilter
  const today = new Date().toISOString().split('T')[0];
  const [eventType, setEventType] = useState(searchParams.get('eventType') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || today);
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [timeFrom, setTimeFrom] = useState(searchParams.get('timeFrom') || '');
  const [timeTo, setTimeTo] = useState(searchParams.get('timeTo') || '');

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (eventType) params.append('eventType', eventType);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (timeFrom) params.append('timeFrom', timeFrom);
      if (timeTo) params.append('timeTo', timeTo);
      
      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    } finally {
      setLoading(false);
    }
  }, [eventType, dateFrom, dateTo, timeFrom, timeTo]);
  
  const clearTimeFilters = useCallback(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    setDateFrom(todayDate);
    setDateTo('');
    setTimeFrom('');
    setTimeTo('');
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingMap')}</p>
        </div>
      </div>
    );
  }

  const eventsWithCoords = events.filter(event => {
    const lat = parseFloat(event.lat || '');
    const lon = parseFloat(event.lon || '');
    return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/events"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('backToEvents') || 'Zurück zu den Events'}</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-[#021234] pt-[5px]">{t('eventsOnMap')}</h1>
              <p className="text-gray-600">
                {eventsWithCoords.length} {t('of') || 'von'} {events.length} {t('eventsWithLocation') || 'Events mit Standortdaten'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <EventsMap 
            events={events} 
            focusedEventId={eventId || undefined}
            eventType={eventType}
            onEventTypeChange={setEventType}
            dateFrom={dateFrom}
            dateTo={dateTo}
            timeFrom={timeFrom}
            timeTo={timeTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onTimeFromChange={setTimeFrom}
            onTimeToChange={setTimeTo}
            onClearTimeFilters={clearTimeFilters}
            showFullscreen={true}
            showTimeFilters={true}
          />
          
          {eventsWithCoords.length === 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                {t('noEventsWithLocation') || 'Keine Events mit Standortdaten gefunden. Fügen Sie Koordinaten (lat/lon) zu Ihren Events hinzu, um sie auf der Karte anzuzeigen.'}
              </p>
              <Link
                href="/events/create"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{t('createEvent') || 'Event erstellen'}</span>
              </Link>
            </div>
          )}
        </div>

        {events.length > eventsWithCoords.length && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#021234] mb-4">
              {t('eventsWithoutLocation') || 'Events ohne Standortdaten'} ({events.length - eventsWithCoords.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter(event => {
                  const lat = parseFloat(event.lat || '');
                  const lon = parseFloat(event.lon || '');
                  return isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0;
                })
                .map((event) => (
                  <div key={event._id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-[#021234] mb-2">
                      {event.title || event.name || event._id}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.description || t('noDescription')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('coordinatesRequired') || 'Koordinaten erforderlich für Kartenanzeige'}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

