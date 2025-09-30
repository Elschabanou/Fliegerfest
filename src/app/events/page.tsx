'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Euro, Filter, Search, Map } from 'lucide-react';
import EventsMap from '@/components/EventsMap';
// import { useAuth } from '@/components/AuthProvider';

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (eventType) params.append('eventType', eventType);
      if (location) params.append('location', location);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    } finally {
      setLoading(false);
    }
  }, [eventType, location, searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = () => {
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString; // Fallback zur ursprünglichen Zeichenkette
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Events werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Fliegerevents</h1>
              <p className="text-gray-600">Entdecken Sie die besten Luftfahrt-Events und Flugtage</p>
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Map className="h-5 w-5" />
              <span>{showMap ? 'Listen-Ansicht' : 'Karten-Ansicht'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Suche nach Events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Alle Event-Typen</option>
              <option value="Flugtag">Flugtag</option>
              <option value="Luftfahrt-Event">Luftfahrt-Event</option>
              <option value="Workshop">Workshop</option>
              <option value="Vereinsveranstaltung">Vereinsveranstaltung</option>
              <option value="Sonstiges">Sonstiges</option>
            </select>

            <input
              type="text"
              placeholder="Ort..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />

            <button
              onClick={handleSearch}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filtern</span>
            </button>
          </div>
        </div>

        {/* Events Display */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Events gefunden</h3>
            <p className="text-gray-600">Versuchen Sie andere Suchkriterien oder erstellen Sie ein neues Event.</p>
          </div>
        ) : showMap ? (
          /* Karten-Ansicht */
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Events auf der Karte</h2>
            <EventsMap events={events} />
          </div>
        ) : (
          /* Listen-Ansicht */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {event.imageurl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={event.imageurl}
                      alt={event.title || event.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {event.eventType || 'Sonstiges'}
                    </span>
                    {event.entryFee && event.entryFee > 0 && (
                      <span className="flex items-center text-green-600 font-semibold">
                        <Euro className="h-4 w-4 mr-1" />
                        {event.entryFee}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title || event.name || event._id}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description || 'Keine Beschreibung verfügbar.'}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date || event.dateTime || '')}</span>
                    </div>
                    {event.startTime && event.endTime && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location || event.name || event._id}</span>
                    </div>
                    {event.icao && (
                      <div className="flex items-center text-gray-600">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">ICAO: {event.icao}</span>
                      </div>
                    )}
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{event.organizer ? `von ${event.organizer}` : 'Event'}</span>
                    <Link
                      href={`/events/${event._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Details ansehen →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
