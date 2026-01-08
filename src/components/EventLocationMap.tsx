'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface EventLocationMapProps {
  lat: string;
  lon: string;
  locationName?: string;
  className?: string;
  eventId?: string;
}

export default function EventLocationMap({ lat, lon, locationName, className = '', eventId }: EventLocationMapProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<unknown>(null);
  const leafletRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const handleMapClick = () => {
    const url = eventId ? `/events/map?eventId=${eventId}` : '/events/map';
    router.push(url);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitializedRef.current || mapRef.current) return;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setMapError('Ungültige Koordinaten');
      return;
    }

    const initializeMap = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mapContainerRef.current) {
          console.warn('Map container nicht verfügbar');
          return;
        }

        const L = await import('leaflet');
        leafletRef.current = L;

        // Marker-Icons korrigieren
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const mapContainer = mapContainerRef.current;
        if (mapContainer && mapContainer.offsetParent !== null) {
          const map = L.map(mapContainer, {
            center: [latNum, lonNum],
            zoom: 13,
            zoomControl: false, // Deaktiviert, da Karte klickbar ist
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            dragging: false, // Deaktiviert, da Karte klickbar ist
            touchZoom: false, // Deaktiviert, da Karte klickbar ist
          });

          mapRef.current = map;

          // MapTiler Layer hinzufügen
          const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
          if (maptilerApiKey) {
            L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`, {
              attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 22,
              tileSize: 256,
              zoomOffset: 0
            }).addTo(map);
          } else {
            // Fallback zu OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19
            }).addTo(map);
          }

          // Event-Marker hinzufügen
          const eventIcon = L.divIcon({
            className: 'event-location-marker',
            html: `
              <div style="
                position: relative;
                width: 40px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              ">
                <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C12.268 0 6 6.268 6 14c0 10.5 14 34 14 34s14-23.5 14-34C34 6.268 27.732 0 20 0z" fill="#ef4444" stroke="white" stroke-width="2"/>
                  <circle cx="20" cy="14" r="6" fill="white"/>
                  <circle cx="20" cy="14" r="3" fill="#ef4444"/>
                </svg>
              </div>
            `,
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -48]
          });

          const marker = L.marker([latNum, lonNum], { icon: eventIcon });
          marker.addTo(map);
          
          if (locationName) {
            marker.bindPopup(`<div style="padding: 8px;"><strong>${locationName}</strong></div>`);
          }

          markerRef.current = marker;

          map.whenReady(() => {
            isInitializedRef.current = true;
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Karte:', error);
        setMapError('Fehler beim Laden der Karte');
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (markerRef.current && (mapRef.current as any).removeLayer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mapRef.current as any).removeLayer(markerRef.current as any);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapRef.current as any).off();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((mapRef.current as any).remove) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mapRef.current as any).remove();
          }
        } catch (error) {
          console.warn('Fehler beim Cleanup:', error);
        } finally {
          mapRef.current = null;
          markerRef.current = null;
          isInitializedRef.current = false;
        }
      }
    };
  }, [isClient, lat, lon]);

  // Marker-Popup aktualisieren wenn sich locationName ändert
  useEffect(() => {
    if (markerRef.current && locationName) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (markerRef.current as any).setPopupContent(`<div style="padding: 8px;"><strong>${locationName}</strong></div>`);
      } catch (error) {
        console.warn('Fehler beim Aktualisieren des Popups:', error);
      }
    }
  }, [locationName]);

  if (!isClient) {
    return (
      <div className={`h-64 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`h-64 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return null;
  }

  return (
    <div 
      className={`h-64 w-full rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors relative group ${className}`}
      onClick={handleMapClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMapClick();
        }
      }}
      aria-label="Karte in voller Größe öffnen"
    >
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', pointerEvents: 'none' }}></div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
          Karte in voller Größe öffnen →
        </div>
      </div>
    </div>
  );
}

