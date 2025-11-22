'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';
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
  selectedEventType?: string;
}

export default function EventsMap({ events, selectedEventType = '' }: EventsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  const mapRef = useRef<unknown>(null);
  const leafletRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isUpdatingMarkersRef = useRef<boolean>(false);
  const circleRef = useRef<unknown>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [locationMode, setLocationMode] = useState<'device' | 'custom'>('device');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [showLocationFound, setShowLocationFound] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updateScreen = () => {
      if (typeof window !== 'undefined') {
        setIsSmallScreen(window.innerWidth < 640);
      }
    };
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);


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

  // Funktion zum Abrufen des Benutzerstandorts
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserLocation(newLocation);
          setIsLoadingLocation(false);
          setShowLocationFound(true);
          
          // Karte zum Benutzerstandort bewegen
          if (mapRef.current && leafletRef.current && isMapInitialized) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (mapRef.current as any).setView([newLocation.lat, newLocation.lon], 12);
              updateMarkers();
            } catch (error) {
              console.warn('Fehler beim Bewegen der Karte zum Standort:', error);
            }
          }
        } catch (error) {
          console.error('Fehler beim Setzen des Benutzerstandorts:', error);
          setLocationError('Fehler beim Verarbeiten des Standorts');
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht abgerufen werden';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Standortzugriff wurde verweigert';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Standortinformationen sind nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'Zeitüberschreitung beim Abrufen des Standorts';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0 // keine Caches, genauere Position
      }
    );
  };

  // Marker aktualisieren (ohne Dependencies um Re-Renders zu vermeiden)
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !leafletRef.current || isUpdatingMarkersRef.current || !isMapInitialized) return;

    // Prüfe ob Karte noch existiert und bereit ist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(mapRef.current as any)._loaded || !(mapRef.current as any)._container) {
      console.warn('Karte ist nicht bereit für Marker-Updates');
      return;
    }
    
    isUpdatingMarkersRef.current = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = leafletRef.current as any;

    // Alte Marker sicher entfernen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (markersRef.current as any[]).forEach(marker => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (marker && mapRef.current && (mapRef.current as any).removeLayer && marker._map) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapRef.current as any).removeLayer(marker as any);
        }
      } catch (error) {
        console.warn('Fehler beim Entfernen eines Markers:', error);
      }
    });
    
    markersRef.current = [];

    // Radius-Kreis aktualisieren
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (circleRef.current && (mapRef.current as any) && (mapRef.current as any).removeLayer) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).removeLayer(circleRef.current as any);
        circleRef.current = null;
      }
      const baseLocation = (locationMode === 'custom' && customLocation) ? customLocation : userLocation;
      if (baseLocation && radiusKm > 0) {
        const radiusMeters = radiusKm * 1000;
        circleRef.current = L.circle([baseLocation.lat, baseLocation.lon], {
          radius: radiusMeters,
          color: '#3b82f6',
          weight: 1,
          fillColor: '#3b82f6',
          fillOpacity: 0.1
        }).addTo(mapRef.current);
      }
    } catch (error) {
      console.warn('Fehler beim Aktualisieren des Radius-Kreises:', error);
    }

    // Benutzerstandort-Marker hinzufügen
    if (userLocation) {
      try {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 4px rgba(59, 130, 246, 0.2);
                animation: pulse 2s infinite;
              "></div>
              <style>
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.1); opacity: 0.8; }
                }
              </style>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        
        const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon });
        userMarker.addTo(mapRef.current);
        userMarker.bindPopup('<div style="padding: 8px;"><strong>📍 Ihr Standort</strong></div>');
        markersRef.current.push(userMarker);
      } catch (error) {
        console.warn('Fehler beim Hinzufügen des Benutzerstandort-Markers:', error);
      }
    }

    // Gewählter Ort Marker hinzufügen (zusätzlicher Punkt)
    if (customLocation) {
      try {
        const customIcon = L.divIcon({
          className: 'custom-location-marker',
          html: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(139, 92, 246, 0.2);
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        const customMarker = L.marker([customLocation.lat, customLocation.lon], { icon: customIcon });
        customMarker.addTo(mapRef.current);
        customMarker.bindPopup('<div style="padding: 8px;"><strong>📍 Gewählter Ort</strong></div>');
        markersRef.current.push(customMarker);
      } catch (error) {
        console.warn('Fehler beim Hinzufügen des gewählten Ortes:', error);
      }
    }

    // Filter events by selected event type
    const filteredEvents = selectedEventType 
      ? events.filter(event => event.eventType === selectedEventType)
      : events;

    // Event-Marker hinzufügen - verwende gefilterte events
    const currentEventsWithCoords = filteredEvents.filter(event => {
      const lat = parseFloat(event.lat || '');
      const lon = parseFloat(event.lon || '');
      return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    });

    currentEventsWithCoords.forEach((event) => {
      try {
        const lat = parseFloat(event.lat!);
        const lon = parseFloat(event.lon!);
        
        if (isNaN(lat) || isNaN(lon)) return;
        
        // Moderner Event-Marker mit SVG Pin-Icon
        const eventIcon = L.divIcon({
          className: 'event-marker',
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
        
        const marker = L.marker([lat, lon], { icon: eventIcon });
        marker.addTo(mapRef.current);
        const popupMaxWidth = isSmallScreen ? 220 : 320;
        const titleFontSize = isSmallScreen ? 14 : 16;
        const textFontSize = isSmallScreen ? 12 : 14;
        const badgeFontSize = isSmallScreen ? 10 : 12;
        const imageHeight = isSmallScreen ? 60 : 80;
        
        // Beschreibung kürzen für Popup
        const description = event.description ? 
          (event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description) 
          : '';
        
        const popupContent = `
          <a href="/events/${event._id}" style="text-decoration: none; color: inherit; display: block; cursor: pointer;" onclick="window.location.href='/events/${event._id}'; return false;">
            <div style="padding: 10px; max-width: ${popupMaxWidth}px; font-family: system-ui; transition: background-color 0.2s;" onmouseover="this.parentElement.style.backgroundColor='#f3f4f6'" onmouseout="this.parentElement.style.backgroundColor='transparent'">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333; font-size: ${titleFontSize}px;">
                ${event.title || event.name || event._id}
              </h3>
              ${description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: ${textFontSize}px; line-height: 1.4;">${description}</p>` : ''}
              ${event.date ? `<p style="margin: 0 0 4px 0; color: #333; font-size: ${textFontSize - 1}px;">📅 ${formatDate(event.date)}</p>` : ''}
              ${event.icao ? `<p style="margin: 0 0 4px 0; color: #333; font-size: ${textFontSize - 1}px;">🛩️ ICAO: ${event.icao}</p>` : ''}
              ${event.location ? `<p style="margin: 0 0 8px 0; color: #666; font-size: ${textFontSize - 1}px;">📍 ${event.location}</p>` : ''}
              ${event.eventType ? `<span style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: ${badgeFontSize}px; margin-top: 8px;">${event.eventType}</span>` : ''}
              ${event.imageurl ? `<img src="${event.imageurl}" alt="${event.title || event.name}" style="width: 100%; height: ${imageHeight}px; object-fit: cover; border-radius: 4px; margin-top: 8px;" onerror="this.style.display='none'">` : ''}
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; text-align: center;">
                <span style="color: #3b82f6; font-size: ${textFontSize}px; font-weight: 600;">Details ansehen →</span>
              </div>
            </div>
          </a>
        `;
        
        marker.bindPopup(popupContent, {
          className: 'event-popup',
          maxWidth: popupMaxWidth,
          autoPan: true,
          autoPanPaddingTopLeft: [16, isSmallScreen ? 200 : 100],
          autoPanPaddingBottomRight: [16, 40]
        });
        
        // Event-Listener für Klick auf Popup hinzufügen
        marker.on('popupopen', () => {
          const popupElement = marker.getPopup()?.getElement();
          if (popupElement) {
            const linkElement = popupElement.querySelector('a');
            if (linkElement) {
              linkElement.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/events/${event._id}`;
              });
            }
          }
        });

        // Marker-Deckkraft basierend auf Radius setzen
        try {
          const baseLocation = (locationMode === 'custom' && customLocation) ? customLocation : userLocation;
          if (baseLocation && radiusKm > 0) {
            const distance = L.latLng(baseLocation.lat, baseLocation.lon).distanceTo([lat, lon]);
            const radiusMeters = radiusKm * 1000;
            marker.setOpacity(distance > radiusMeters ? 0.4 : 1.0);
          } else {
            marker.setOpacity(1.0);
          }
        } catch (error) {
          console.warn('Fehler beim Setzen der Marker-Deckkraft:', error);
        }

        markersRef.current.push(marker);
      } catch (error) {
        console.warn('Fehler beim Hinzufügen eines Event-Markers:', error);
      }
    });

    isUpdatingMarkersRef.current = false;
  }, [userLocation, customLocation, locationMode, events, radiusKm, isMapInitialized, isSmallScreen, selectedEventType]);

  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQuery.trim()) {
      setGeocodingError('Bitte einen Ort eingeben');
      // Input hervorheben und fokussieren
      setTimeout(() => searchInputRef.current?.focus(), 0);
      return;
    }
    setIsGeocoding(true);
    setGeocodingError(null);
    try {
      const result = await geocodeLocation(customQuery, 'de');
      if (isGeocodingSuccess(result)) {
        const loc = { lat: parseFloat(result.lat), lon: parseFloat(result.lon) };
        setCustomLocation(loc);
        setLocationMode('custom');
        if (mapRef.current) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentZoom = (mapRef.current as any).getZoom ? (mapRef.current as any).getZoom() : 8;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mapRef.current as any).setView([loc.lat, loc.lon], Math.max(currentZoom || 8, 10));
          } catch {}
        }
        updateMarkers();
      } else {
        setGeocodingError(result.error || 'Ort nicht gefunden');
      }
    } catch {
      setGeocodingError('Fehler bei der Ortssuche');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Geocoding-Fehler nach einigen Sekunden automatisch zurücksetzen
  useEffect(() => {
    if (!geocodingError) return;
    const t = setTimeout(() => setGeocodingError(null), 3000);
    return () => clearTimeout(t);
  }, [geocodingError]);

  // Karteninitialisierung
  useEffect(() => {
    if (!isClient || isMapInitialized || mapRef.current) return;

    const initializeMap = async () => {
      try {
        // Warten bis DOM-Element verfügbar ist
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mapContainerRef.current) {
          console.warn('Map container nicht verfügbar');
          return;
        }

        // Dynamisch Leaflet importieren
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

        // Karte erstellen
        const mapContainer = mapContainerRef.current;
        if (mapContainer && mapContainer.offsetParent !== null) {
          // Bestimme Kartenzentrum - verwende gefilterte Events
          const filteredEventsForCenter = selectedEventType 
            ? events.filter(event => event.eventType === selectedEventType)
            : events;
          const eventsWithCoords = filteredEventsForCenter.filter(event => {
            const lat = parseFloat(event.lat || '');
            const lon = parseFloat(event.lon || '');
            return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
          });
          
          let centerLat: number, centerLon: number, zoom: number;
          
          if (eventsWithCoords.length > 0) {
            centerLat = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lat!), 0) / eventsWithCoords.length;
            centerLon = eventsWithCoords.reduce((sum, event) => sum + parseFloat(event.lon!), 0) / eventsWithCoords.length;
            zoom = 8;
          } else {
            // Standard-Zentrum (Deutschland) wenn keine Events vorhanden
            centerLat = 51.1657; // Deutschland-Mitte
            centerLon = 10.4515;
            zoom = 6;
          }

          const map = L.map(mapContainer, {
            center: [centerLat, centerLon],
            zoom: zoom,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true,
            preferCanvas: true // Verbessert Performance und reduziert DOM-Probleme
          });

          mapRef.current = map;
          
          // MapTiler OMT Layer hinzufügen
          const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
          if (maptilerApiKey) {
            L.tileLayer(`https://api.maptiler.com/maps/openmaptiles/{z}/{x}/{y}.png?key=${maptilerApiKey}`, {
              attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 20,
              tileSize: 512,
              zoomOffset: -1
            }).addTo(map);
          } else {
            // Fallback zu OpenStreetMap wenn kein API-Key vorhanden
            console.warn('MapTiler API-Key nicht gefunden. Verwende OpenStreetMap als Fallback.');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19
            }).addTo(map);
          }

          // Warten bis Karte vollständig geladen ist
          map.whenReady(() => {
            setIsMapInitialized(true);
            
            // Automatische Standortanfrage nach 1 Sekunde
            setTimeout(() => {
              getUserLocation();
            }, 1000);
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Karte:', error);
        setMapError('Fehler beim Laden der Karte');
      }
    };

    initializeMap();

    // Cleanup-Funktion
    return () => {
      // Nur cleanup wenn Karte existiert
      if (!mapRef.current) return;
      
      try {
        // Marker sicher entfernen
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (markersRef.current as any[]).forEach(marker => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (marker && marker._map && mapRef.current && (mapRef.current as any).removeLayer) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (mapRef.current as any).removeLayer(marker);
            }
          } catch (error) {
            console.warn('Fehler beim Entfernen eines Markers im Cleanup:', error);
          }
        });
        
        // Karte sicher entfernen
        try {
          // Alle Event-Listener entfernen
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapRef.current as any).off();

          // Karte entfernen
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((mapRef.current as any).remove) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mapRef.current as any).remove();
          }
        } catch (error) {
          console.warn('Fehler beim Entfernen der Karte:', error);
        }
      } catch (error) {
        console.warn('Fehler beim Cleanup:', error);
      } finally {
        mapRef.current = null;
        markersRef.current = [];
        setIsMapInitialized(false);
        isUpdatingMarkersRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Marker-Update wenn sich Events oder Standort ändern
  useEffect(() => {
    if (isMapInitialized && !isUpdatingMarkersRef.current) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapInitialized, userLocation, customLocation, locationMode, events, radiusKm, selectedEventType]);

  // Beim Umschalten den jeweils aktiven Standort in die Kartenmitte setzen
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;
    try {
      const baseLocation = (locationMode === 'custom' && customLocation) ? customLocation : userLocation;
      if (baseLocation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentZoom = (mapRef.current as any).getZoom ? (mapRef.current as any).getZoom() : 8;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).setView([baseLocation.lat, baseLocation.lon], Math.max(currentZoom || 8, 10));
      }
    } catch (error) {
      console.warn('Fehler beim Zentrieren der Karte nach Umschalten:', error);
    }
  }, [locationMode, customLocation, userLocation, isMapInitialized]);

  // Bei Wechsel auf "device" Modus Standort ggf. nachladen
  useEffect(() => {
    if (locationMode === 'device' && !userLocation && !isLoadingLocation) {
      getUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationMode]);

  // Erfolgsmeldung auto-ausblenden
  useEffect(() => {
    if (!showLocationFound) return;
    const t = setTimeout(() => setShowLocationFound(false), 3000);
    return () => clearTimeout(t);
  }, [showLocationFound]);

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

  return (
    <div className="relative">
      {/* Mobile: Suchbox über der Karte */}
      <div className="block sm:hidden mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => { setLocationMode('device'); }}
              className={`flex-1 px-2 py-1 text-xs rounded border ${locationMode === 'device' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
            >Eigener Standort</button>
            <button
              onClick={() => {
                if (!customLocation && !customQuery.trim()) {
                  setGeocodingError('Bitte einen eigenen Ort eingeben');
                  setLocationMode('custom');
                  // Input fokussieren
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                } else {
                  setLocationMode('custom');
                }
              }}
              className={`flex-1 px-2 py-1 text-xs rounded border ${locationMode === 'custom' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
            >Eigener Ort</button>
          </div>
          {locationMode === 'custom' && (
            <form onSubmit={handleSearchLocation} className="flex items-center gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Ort suchen (z.B. Tübingen)"
                ref={searchInputRef}
                className={`flex-1 border rounded px-2 py-1 text-sm bg-white text-[#021234] placeholder:text-gray-400 ${geocodingError ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
              />
              <button type="submit" disabled={isGeocoding} className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50">Suche</button>
            </form>
          )}
          {locationMode === 'custom' && geocodingError && <div className="mt-2 text-xs text-red-600">{geocodingError}</div>}
        </div>

        {/* Fehlermeldung */}
        {locationError && (
          <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
            {locationError}
          </div>
        )}
      </div>

      {/* Desktop: Standort / Suche - absolut positioniert */}
      <div className="hidden sm:block absolute top-4 right-4 w-full max-w-sm md:max-w-xs z-[1000] flex flex-col gap-3">
        <div className="bg-white/95 backdrop-blur rounded-lg border border-gray-200 p-3 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => { setLocationMode('device'); }}
              className={`flex-1 px-2 py-1 text-xs rounded border ${locationMode === 'device' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
            >Eigener Standort</button>
            <button
              onClick={() => {
                if (!customLocation && !customQuery.trim()) {
                  setGeocodingError('Bitte einen eigenen Ort eingeben');
                  setLocationMode('custom');
                  // Input fokussieren
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                } else {
                  setLocationMode('custom');
                }
              }}
              className={`flex-1 px-2 py-1 text-xs rounded border ${locationMode === 'custom' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
            >Eigener Ort</button>
          </div>
          {locationMode === 'custom' && (
            <form onSubmit={handleSearchLocation} className="flex items-center gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Ort suchen (z.B. Tübingen)"
                ref={searchInputRef}
                className={`flex-1 border rounded px-2 py-1 text-sm bg-white text-[#021234] placeholder:text-gray-400 ${geocodingError ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
              />
              <button type="submit" disabled={isGeocoding} className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50">Suche</button>
            </form>
          )}
          {locationMode === 'custom' && geocodingError && <div className="mt-2 text-xs text-red-600">{geocodingError}</div>}
        </div>

        {/* Fehlermeldung */}
        {locationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm max-w-xs">
            {locationError}
          </div>
        )}
      </div>

      {/* Mobile: Reichweiten-Regler über der Karte, unter den Event-Typen */}
      <div className="block sm:hidden mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Reichweite</span>
            <span className="text-sm text-gray-600">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Desktop: Reichweiten-Regler - absolut positioniert */}
      <div className="hidden sm:block absolute bottom-4 right-4 w-auto max-w-xs z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Reichweite</span>
          <span className="text-sm text-gray-600">{radiusKm} km</span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={10}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 text-xs text-gray-500">Events außerhalb des Radius werden ausgegraut.</div>
      </div>

      {/* Karte */}
      <div className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-12rem)] w-full rounded-none sm:rounded-lg overflow-hidden border border-gray-200 relative">
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
        
        {/* Erfolgsmeldung in der Karte */}
        {userLocation && !locationError && showLocationFound && (
          <div className="absolute top-4 left-6 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm z-[1000] shadow-md">
            Standort gefunden!
          </div>
        )}
      </div>
    </div>
  );
}