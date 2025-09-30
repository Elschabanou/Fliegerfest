'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

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
  const [mapError, setMapError] = useState<string | null>(null);

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

  // Dynamischer Import der Leaflet-Komponenten
  useEffect(() => {
    if (!isClient) return;

    const loadMap = async () => {
      try {
        // Dynamisch Leaflet und React-Leaflet importieren
        const L = await import('leaflet');
        // Import wird nicht direkt verwendet, da wir die Karte manuell erstellen
        await import('react-leaflet');

        // Leaflet CSS wird über CDN geladen, kein Import nötig

        // Marker-Icons korrigieren
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Karte rendern
        const mapContainer = document.getElementById('map-container');
        if (mapContainer && eventsWithCoords.length > 0) {
          const centerLat = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lat!), 0) / eventsWithCoords.length;
          const centerLon = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lon!), 0) / eventsWithCoords.length;

          const map = L.map('map-container').setView([centerLat, centerLon], 8);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Marker hinzufügen
          eventsWithCoords.forEach((event) => {
            const lat = parseFloat(event.lat!);
            const lon = parseFloat(event.lon!);
            
            const marker = L.marker([lat, lon]).addTo(map);
            
            const popupContent = `
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">
                  ${event.title || event.name || event._id}
                </h3>
                ${event.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${event.description}</p>` : ''}
                ${event.date ? `<p style="margin: 0 0 4px 0; color: #333; font-size: 13px;">📅 ${formatDate(event.date)}</p>` : ''}
                ${event.icao ? `<p style="margin: 0 0 4px 0; color: #333; font-size: 13px;">🛩️ ICAO: ${event.icao}</p>` : ''}
                ${event.eventType ? `<span style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-top: 8px;">${event.eventType}</span>` : ''}
                ${event.imageurl ? `<img src="${event.imageurl}" alt="${event.title || event.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-top: 8px;" onerror="this.style.display='none'">` : ''}
              </div>
            `;
            
            marker.bindPopup(popupContent);
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Karte:', error);
        setMapError('Fehler beim Laden der Karte');
      }
    };

    loadMap();
  }, [isClient, eventsWithCoords]);

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

  if (mapError) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{mapError}</p>
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

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <div id="map-container" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}