'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface CoordinateMapPickerProps {
  lat: string;
  lon: string;
  onCoordinateChange: (lat: number, lon: number) => void;
}

export default function CoordinateMapPicker({ lat, lon, onCoordinateChange }: CoordinateMapPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<unknown>(null);
  const leafletRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const onCoordinateChangeRef = useRef(onCoordinateChange);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  // Aktualisiere die Ref, wenn sich onCoordinateChange ändert
  useEffect(() => {
    onCoordinateChangeRef.current = onCoordinateChange;
  }, [onCoordinateChange]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitializedRef.current || mapRef.current) return;

    const initializeMap = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mapContainerRef.current) {
          console.warn('Map container nicht verfügbar');
          setMapError('Karten-Container nicht gefunden');
          return;
        }

        if (mapContainerRef.current.offsetParent === null) {
          console.warn('Map container ist nicht sichtbar');
          // Versuche es später nochmal
          setTimeout(() => {
            if (mapContainerRef.current && mapContainerRef.current.offsetParent !== null) {
              initializeMap();
            }
          }, 500);
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
          // Bestimme Startposition: vorhandene Koordinaten oder Mitte von Europa
          let startLat = 50.5;
          let startLon = 10.5;
          
          if (lat && lon) {
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            if (!isNaN(latNum) && !isNaN(lonNum)) {
              startLat = latNum;
              startLon = lonNum;
            }
          }

          const map = L.map(mapContainer, {
            center: [startLat, startLon],
            zoom: 6,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true,
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

          // Funktion zum Aktualisieren der Koordinaten basierend auf Kartenmitte (mit Debouncing)
          const updateCoordinatesFromCenter = () => {
            if (isUpdatingRef.current) return; // Verhindere rekursive Updates
            if (!map || !map.getCenter) return; // Sicherheitsprüfung
            
            // Clear previous timeout
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }

            // Debounce: Warte 300ms bevor Update
            updateTimeoutRef.current = setTimeout(() => {
              try {
                if (!map || !map.getCenter) return;
                
                const center = map.getCenter();
                if (!center || isNaN(center.lat) || isNaN(center.lng)) {
                  console.warn('Ungültige Kartenmitte');
                  return;
                }
                
                isUpdatingRef.current = true;
                onCoordinateChangeRef.current(center.lat, center.lng);
                // Reset nach kurzer Verzögerung
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 200);
              } catch (error) {
                console.error('Fehler beim Aktualisieren der Koordinaten:', error);
                setMapError('Fehler beim Aktualisieren der Koordinaten');
                isUpdatingRef.current = false;
              }
            }, 300);
          };

          // Initiale Koordinaten setzen, falls vorhanden
          if (lat && lon) {
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            if (!isNaN(latNum) && !isNaN(lonNum)) {
              map.setView([latNum, lonNum], map.getZoom());
              // Setze initiale Koordinaten ohne Debounce
              try {
                isUpdatingRef.current = true;
                onCoordinateChangeRef.current(latNum, lonNum);
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 100);
              } catch (error) {
                console.error('Fehler beim Setzen der initialen Koordinaten:', error);
                isUpdatingRef.current = false;
              }
            } else {
              // Initiale Koordinaten basierend auf Kartenmitte
              updateCoordinatesFromCenter();
            }
          } else {
            // Initiale Koordinaten basierend auf Kartenmitte
            updateCoordinatesFromCenter();
          }

          // Event-Listener: Beim Verschieben oder Zoomen der Karte
          map.on('moveend', updateCoordinatesFromCenter);
          map.on('zoomend', updateCoordinatesFromCenter);

          isInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Fehler beim Initialisieren der Karte:', error);
        setMapError('Fehler beim Laden der Karte');
      }
    };

    initializeMap();

    return () => {
      // Clear timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      if (mapRef.current && leafletRef.current) {
        try {
          // Entferne Event-Listener
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map = mapRef.current as any;
          map.off('moveend');
          map.off('zoomend');
          map.remove();
        } catch (error) {
          console.error('Fehler beim Entfernen der Karte:', error);
        }
        mapRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [isClient]); // Nur isClient als Dependency - Karte wird nur einmal initialisiert

  // Separater useEffect: Aktualisiere Kartenposition wenn sich lat/lon Props ändern (z.B. manuelle Eingabe)
  useEffect(() => {
    if (!isClient || !isInitializedRef.current || !mapRef.current) return;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = mapRef.current as any;
        const currentCenter = map.getCenter();
        
        // Nur aktualisieren, wenn sich die Koordinaten signifikant unterscheiden (mehr als 0.0001 Grad)
        const latDiff = Math.abs(currentCenter.lat - latNum);
        const lonDiff = Math.abs(currentCenter.lng - lonNum);
        
        if (latDiff > 0.0001 || lonDiff > 0.0001) {
          isUpdatingRef.current = true; // Verhindere, dass moveend Event getriggert wird
          map.setView([latNum, lonNum], map.getZoom(), { animate: false });
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 500);
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Kartenposition:', error);
      }
    }
  }, [isClient, lat, lon]);

  if (!isClient) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600 text-sm">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        Verschieben Sie die Karte, um den Standort zu setzen. Der rote Pin in der Mitte zeigt die ausgewählten Koordinaten.
      </p>
      <div className="relative">
        <div 
          ref={mapContainerRef} 
          className="h-64 w-full rounded-lg overflow-hidden border-2 border-blue-300"
          style={{ zIndex: 0 }}
        />
        {/* Roter Pin in der Mitte (CSS Overlay) */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ marginTop: '-15px' }}
        >
          <div style={{
            backgroundColor: '#dc2626',
            width: '30px',
            height: '30px',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              transform: 'rotate(45deg)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loader-Komponente (falls nicht importiert)
const Loader = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

