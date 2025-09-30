'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

// Dynamisch importieren um SSR-Probleme zu vermeiden
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

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

interface EventsMapProps {
  events: Event[];
}

export default function EventsMap({ events }: EventsMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filtere Events mit gültigen Koordinaten
  const eventsWithCoords = events.filter(event => {
    const lat = parseFloat(event.lat || '');
    const lon = parseFloat(event.lon || '');
    return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  if (eventsWithCoords.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Keine Events mit Standortdaten gefunden</p>
          <p className="text-sm text-gray-500 mt-2">
            Events benötigen gültige Koordinaten (lat/lon) um auf der Karte angezeigt zu werden
          </p>
        </div>
      </div>
    );
  }

  // Berechne den Mittelpunkt der Karte
  const centerLat = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lat!), 0) / eventsWithCoords.length;
  const centerLon = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lon!), 0) / eventsWithCoords.length;

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {eventsWithCoords.map((event) => {
          const lat = parseFloat(event.lat!);
          const lon = parseFloat(event.lon!);
          
          return (
            <Marker key={event._id} position={[lat, lon]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {event.title || event.name || event._id}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {event.description}
                    </p>
                  )}
                  
                  {event.date && (
                    <p className="text-gray-700 text-sm mb-1">
                      📅 {formatDate(event.date)}
                    </p>
                  )}
                  
                  {event.icao && (
                    <p className="text-gray-700 text-sm mb-1">
                      🛩️ ICAO: {event.icao}
                    </p>
                  )}
                  
                  {event.eventType && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {event.eventType}
                    </span>
                  )}
                  
                  {event.imageurl && (
                    <div className="mt-2">
                      <img
                        src={event.imageurl}
                        alt={event.title || event.name || event._id}
                        className="w-full h-20 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
