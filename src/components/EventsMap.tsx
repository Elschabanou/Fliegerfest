'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';
import { MapPin, Maximize2, Minimize2, Filter, Calendar, Clock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  eventType?: string;
  onEventTypeChange?: (eventType: string) => void;
  focusedEventId?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  onTimeFromChange?: (time: string) => void;
  onTimeToChange?: (time: string) => void;
  onClearTimeFilters?: () => void;
  showFullscreen?: boolean;
  showTimeFilters?: boolean;
}

export default function EventsMap({ 
  events, 
  selectedEventType = '', 
  eventType = '', 
  onEventTypeChange, 
  focusedEventId,
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  onDateFromChange,
  onDateToChange,
  onTimeFromChange,
  onTimeToChange,
  onClearTimeFilters,
  showFullscreen = false,
  showTimeFilters = false
}: EventsMapProps) {
  const t = useTranslations('events');
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  const mapRef = useRef<unknown>(null);
  const leafletRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const eventMarkersMapRef = useRef<Map<string, unknown>>(new Map());
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
  const [showAirports, setShowAirports] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeFiltersDropdown, setShowTimeFiltersDropdown] = useState(false);
  const [airports, setAirports] = useState<Array<{icao: string, iata: string | null, name: string, lat: number, lon: number, type: string, municipality: string | null, country: string | null}>>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(false);
  const airportMarkersRef = useRef<unknown[]>([]);
  const lastBoundsRef = useRef<{minLat: number, maxLat: number, minLon: number, maxLon: number} | null>(null);
  const allAirportsRef = useRef<Array<{icao: string, iata: string | null, name: string, lat: number, lon: number, type: string, municipality: string | null, country: string | null}>>([]);

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
              const currentZoom = (mapRef.current as any).getZoom ? (mapRef.current as any).getZoom() : 7;
              // Verwende aktuellen Zoom oder mindestens 7 für besseren Überblick
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (mapRef.current as any).setView([newLocation.lat, newLocation.lon], Math.max(currentZoom || 7, 7));
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
    eventMarkersMapRef.current.clear();

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
        // Speichere Marker mit Event-ID für späteren Zugriff
        eventMarkersMapRef.current.set(event._id, marker);
      } catch (error) {
        console.warn('Fehler beim Hinzufügen eines Event-Markers:', error);
      }
    });

    isUpdatingMarkersRef.current = false;
  }, [userLocation, customLocation, locationMode, events, radiusKm, isMapInitialized, isSmallScreen, selectedEventType]);

  // Event fokussieren wenn focusedEventId vorhanden ist
  const focusEvent = useCallback((eventId: string) => {
    if (!mapRef.current || !leafletRef.current || !isMapInitialized) return;

    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const lat = parseFloat(event.lat || '');
    const lon = parseFloat(event.lon || '');
    
    if (isNaN(lat) || isNaN(lon)) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapRef.current as any;
      
      // Stelle sicher, dass die Karte die richtige Größe hat
      map.invalidateSize();
      
      // Warte kurz, damit invalidateSize wirksam wird
      setTimeout(() => {
        // Zentriere Karte auf Event mit Zoom-Level 15 für gute Sicht
        // Verwende panTo mit einem Padding, um sicherzustellen, dass das Event zentriert ist
        map.setView([lat, lon], 15, { animate: true, duration: 0.5 });
        
        // Warte bis die Animation abgeschlossen ist
        map.once('moveend', () => {
          // Öffne Popup nach kurzer Verzögerung
          setTimeout(() => {
            const marker = eventMarkersMapRef.current.get(eventId);
            if (marker) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (marker as any).openPopup();
              // Stelle sicher, dass die Karte das Popup richtig anzeigt und zentriert bleibt
              map.invalidateSize();
              // Zentriere nochmal nach Popup-Öffnung, falls nötig
              setTimeout(() => {
                map.setView([lat, lon], 15);
              }, 100);
            }
          }, 200);
        });
      }, 200);
    } catch (error) {
      console.warn('Fehler beim Fokussieren des Events:', error);
    }
  }, [events, isMapInitialized]);

  // Alle Flugplätze von Deutschland und umliegenden Ländern einmal laden
  const loadAllAirports = useCallback(() => {
    if (isLoadingAirports || allAirportsRef.current.length > 0) return;

    setIsLoadingAirports(true);
    
    fetch('/api/airports?loadAll=true')
      .then(res => res.json())
      .then(data => {
        if (data.airports) {
          allAirportsRef.current = data.airports;
          // Filtere Flughäfen für aktuellen sichtbaren Bereich
          filterAirportsForBounds();
        }
        setIsLoadingAirports(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Flughäfen:', error);
        setIsLoadingAirports(false);
      });
  }, [isLoadingAirports]);

  // Filtere Flughäfen für aktuellen sichtbaren Bereich (ohne neu zu laden)
  const filterAirportsForBounds = useCallback(() => {
    if (!mapRef.current || !showAirports || allAirportsRef.current.length === 0) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapRef.current as any;
      const bounds = map.getBounds();
      
      if (!bounds) return;

      const minLat = bounds.getSouth();
      const maxLat = bounds.getNorth();
      const minLon = bounds.getWest();
      const maxLon = bounds.getEast();

      // Erweitere Bounds leicht, um Flughäfen am Rand einzubeziehen
      const latPadding = (maxLat - minLat) * 0.1;
      const lonPadding = (maxLon - minLon) * 0.1;

      const paddedBounds = {
        minLat: minLat - latPadding,
        maxLat: maxLat + latPadding,
        minLon: minLon - lonPadding,
        maxLon: maxLon + lonPadding,
      };

      // Filtere Flughäfen aus bereits geladenen Daten
      const visibleAirports = allAirportsRef.current.filter(airport => 
        airport.lat >= paddedBounds.minLat && 
        airport.lat <= paddedBounds.maxLat && 
        airport.lon >= paddedBounds.minLon && 
        airport.lon <= paddedBounds.maxLon
      );

      setAirports(visibleAirports);
    } catch (error) {
      console.error('Fehler beim Filtern der Flughäfen:', error);
    }
  }, [showAirports]);

  // Flughäfen laden wenn Checkbox aktiviert wird
  useEffect(() => {
    if (showAirports && isMapInitialized) {
      if (allAirportsRef.current.length === 0) {
        // Erstes Mal: Lade alle Flugplätze der Region
        loadAllAirports();
      } else {
        // Bereits geladen: Filtere nur für aktuellen Bereich
        filterAirportsForBounds();
      }
    } else if (!showAirports) {
      // Flughäfen zurücksetzen wenn deaktiviert
      setAirports([]);
      lastBoundsRef.current = null;
    }
  }, [showAirports, isMapInitialized, loadAllAirports, filterAirportsForBounds]);

  // Airport-Marker aktualisieren
  const updateAirportMarkers = useCallback(() => {
    if (!mapRef.current || !leafletRef.current || !isMapInitialized || !showAirports) {
      // Entferne alle Airport-Marker wenn nicht angezeigt werden sollen
      if (!showAirports && airportMarkersRef.current.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (airportMarkersRef.current as any[]).forEach(marker => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (marker && mapRef.current && (mapRef.current as any).removeLayer && (marker as any)._map) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (mapRef.current as any).removeLayer(marker as any);
            }
          } catch (error) {
            console.warn('Fehler beim Entfernen eines Airport-Markers:', error);
          }
        });
        airportMarkersRef.current = [];
      }
      return;
    }

    // Alte Airport-Marker entfernen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (airportMarkersRef.current as any[]).forEach(marker => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (marker && mapRef.current && (mapRef.current as any).removeLayer && (marker as any)._map) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapRef.current as any).removeLayer(marker as any);
        }
      } catch (error) {
        console.warn('Fehler beim Entfernen eines Airport-Markers:', error);
      }
    });
    airportMarkersRef.current = [];

    // Neue Airport-Marker hinzufügen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = leafletRef.current as any;

    // Aktuellen Zoom-Level abfragen für dynamische Icon-Größe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentZoom = (mapRef.current as any)?.getZoom ? (mapRef.current as any).getZoom() : 6;
    
    // Icon-Größe basierend auf Zoom-Level (kleiner bei niedrigem Zoom, größer bei hohem Zoom)
    // Zoom 3-5: 12px, Zoom 6-8: 16px, Zoom 9-11: 20px, Zoom 12+: 24px
    const iconSize = currentZoom <= 5 ? 12 : currentZoom <= 8 ? 16 : currentZoom <= 11 ? 20 : 24;
    const iconAnchor = iconSize / 2;
    const popupAnchorY = -iconAnchor;

    airports.forEach((airport) => {
      try {
        // Bestimme Icon basierend auf Typ
        const isHeliport = airport.type && airport.type.toLowerCase().includes('heliport');
        const iconPath = isHeliport ? '/Heli.svg' : '/airport.svg';
        const iconAlt = isHeliport ? 'Heliport' : 'Flughafen';
        
        // Flughafen-Icon: Verwende airport.svg oder Heli.svg für Heliports
        const airportIcon = L.divIcon({
          className: 'airport-marker',
          html: `
            <div style="
              position: relative;
              width: ${iconSize}px;
              height: ${iconSize}px;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0.7;
            ">
              <img src="${iconPath}" alt="${iconAlt}" style="width: ${iconSize}px; height: ${iconSize}px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));" />
            </div>
          `,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconAnchor, iconAnchor],
          popupAnchor: [0, popupAnchorY]
        });

        const airportMarker = L.marker([airport.lat, airport.lon], { 
          icon: airportIcon,
          opacity: 0.6,
          zIndexOffset: -100 // Hinter den Event-Markern
        });
        
        airportMarker.addTo(mapRef.current);
        
        const popupContent = `
          <div style="padding: 8px; font-family: system-ui; max-width: 200px;">
            <strong style="font-size: 14px; color: #333;">${airport.name || airport.icao}</strong>
            ${airport.icao ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">ICAO: ${airport.icao}</p>` : ''}
            ${airport.iata ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">IATA: ${airport.iata}</p>` : ''}
            ${airport.municipality ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">📍 ${airport.municipality}</p>` : ''}
            ${airport.country ? `<p style="margin: 4px 0; font-size: 11px; color: #999;">${airport.country}</p>` : ''}
            ${airport.type ? `<p style="margin: 4px 0; font-size: 11px; color: #999;">Typ: ${airport.type}</p>` : ''}
          </div>
        `;
        
        airportMarker.bindPopup(popupContent, {
          className: 'airport-popup',
          maxWidth: 220,
          autoPan: false
        });

        airportMarkersRef.current.push(airportMarker);
      } catch (error) {
        console.warn('Fehler beim Hinzufügen eines Airport-Markers:', error);
      }
    });
  }, [airports, showAirports, isMapInitialized]);
  
  // State für Zoom-Level, um Marker bei Zoom-Änderung zu aktualisieren
  const [currentZoom, setCurrentZoom] = useState<number>(6);
  
  // Zoom-Level überwachen und Marker aktualisieren
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    
    const handleZoomChange = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      // Marker aktualisieren wenn sich Zoom ändert
      if (showAirports) {
        updateAirportMarkers();
      }
    };

    map.on('zoomend', handleZoomChange);
    
    // Initialen Zoom-Level setzen
    const initialZoom = map.getZoom();
    if (initialZoom) {
      setCurrentZoom(initialZoom);
    }

    return () => {
      map.off('zoomend', handleZoomChange);
    };
  }, [isMapInitialized, showAirports, updateAirportMarkers]);

  // Airport-Marker aktualisieren wenn sich showAirports oder airports ändern
  useEffect(() => {
    if (isMapInitialized) {
      updateAirportMarkers();
    }
  }, [isMapInitialized, showAirports, airports, updateAirportMarkers]);

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
            const currentZoom = (mapRef.current as any).getZoom ? (mapRef.current as any).getZoom() : 7;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mapRef.current as any).setView([loc.lat, loc.lon], Math.max(currentZoom || 7, 7));
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
            zoom = 6; // Etwas näher für besseren Überblick
          } else {
            // Standard-Zentrum (Deutschland) wenn keine Events vorhanden
            centerLat = 51.1657; // Deutschland-Mitte
            centerLon = 10.4515;
            zoom = 4; // Etwas näher für besseren Überblick
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
          
          // MapTiler Layer hinzufügen
          const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
          if (maptilerApiKey) {
            // Verfügbare MapTiler Styles: streets-v2, basic-v2, outdoor-v2, satellite, hybrid
            // Wechsle 'streets-v2' zu einem anderen Style, falls gewünscht
            const mapStyle = 'streets-v2';
            L.tileLayer(`https://api.maptiler.com/maps/${mapStyle}/{z}/{x}/{y}.png?key=${maptilerApiKey}`, {
              attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 22,
              tileSize: 256,
              zoomOffset: 0
            }).addTo(map).on('tileerror', (error) => {
              console.error('Fehler beim Laden der MapTiler-Kacheln:', error);
              console.warn('Bitte überprüfe deinen MapTiler API-Key in den Umgebungsvariablen.');
            });
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
        airportMarkersRef.current = [];
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

  // Event fokussieren wenn focusedEventId vorhanden ist
  useEffect(() => {
    if (focusedEventId && isMapInitialized) {
      // Warte länger, damit die Karte vollständig geladen und alle Marker hinzugefügt sind
      const timer = setTimeout(() => {
        // Prüfe ob Marker bereits vorhanden sind
        if (eventMarkersMapRef.current.has(focusedEventId) || markersRef.current.length > 0) {
          focusEvent(focusedEventId);
        } else {
          // Falls Marker noch nicht geladen sind, warte noch etwas
          const retryTimer = setTimeout(() => {
            focusEvent(focusedEventId);
          }, 1000);
          return () => clearTimeout(retryTimer);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [focusedEventId, isMapInitialized, focusEvent]);

  // Event-Listener für Kartenbewegung und Zoom (für Flughäfen)
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    let moveTimeout: NodeJS.Timeout | null = null;

    const handleMapMove = () => {
      // Debounce: Warte 300ms nach letzter Bewegung
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }
      moveTimeout = setTimeout(() => {
        if (showAirports && allAirportsRef.current.length > 0) {
          filterAirportsForBounds();
        }
      }, 300);
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
    };
  }, [isMapInitialized, showAirports, filterAirportsForBounds]);

  // Beim Umschalten den jeweils aktiven Standort in die Kartenmitte setzen
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;
    try {
      const baseLocation = (locationMode === 'custom' && customLocation) ? customLocation : userLocation;
      if (baseLocation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentZoom = (mapRef.current as any).getZoom ? (mapRef.current as any).getZoom() : 7;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).setView([baseLocation.lat, baseLocation.lon], Math.max(currentZoom || 7, 7));
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

  // Vollbild-Funktionalität
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    // Warte kurz, damit der DOM aktualisiert ist, dann invalidateSize
    setTimeout(() => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).invalidateSize();
      }
    }, 100);
  }, []);

  // Prüfe ob Zeitfilter aktiv sind
  const hasActiveTimeFilters = dateFrom || dateTo || timeFrom || timeTo;
  const timeFilterRef = useRef<HTMLDivElement>(null);

  // Schließe Zeitfilter-Dropdown beim Klicken außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target as Node)) {
        setShowTimeFiltersDropdown(false);
      }
    };

    if (showTimeFiltersDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeFiltersDropdown]);

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
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white' : ''}`}>
      {/* Mobile: Alle Bedienelemente in einer Karte */}
      <div className="block sm:hidden mb-3 mx-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md space-y-4">
          {/* Event-Typen-Auswahl */}
          {onEventTypeChange && (
            <div>
              <select
                value={eventType}
                onChange={(e) => onEventTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white placeholder:text-gray-400 dark:bg-white"
              >
                <option value="">{t('allEventTypes')}</option>
                <option value="Flugtag">{t('eventTypes.Flugtag')}</option>
                <option value="Messe">{t('eventTypes.Messe')}</option>
                <option value="Fly-In">{t('eventTypes.Fly-In')}</option>
                <option value="Workshop">{t('eventTypes.Workshop')}</option>
                <option value="Vereinsveranstaltung">{t('eventTypes.Vereinsveranstaltung')}</option>
                <option value="Sonstiges">{t('eventTypes.Sonstiges')}</option>
              </select>
            </div>
          )}

          {/* Mobile: Zeitfilter unter Event-Typen - nur wenn showTimeFilters=true */}
          {showTimeFilters && onDateFromChange && (
            <div>
              <button
                onClick={() => setShowTimeFiltersDropdown(!showTimeFiltersDropdown)}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  hasActiveTimeFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{t('timeFilter')}</span>
                {hasActiveTimeFilters && (
                  <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {[dateFrom, dateTo, timeFrom, timeTo].filter(Boolean).length}
                  </span>
                )}
              </button>

              {showTimeFiltersDropdown && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {t('fromDate')}
                      </label>
                      <input
                        type="date"
                        value={dateFrom || ''}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {t('toDate')}
                      </label>
                      <input
                        type="date"
                        value={dateTo || ''}
                        onChange={(e) => onDateToChange?.(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {t('fromTime')}
                      </label>
                      <input
                        type="time"
                        value={timeFrom || ''}
                        onChange={(e) => onTimeFromChange?.(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {t('toTime')}
                      </label>
                      <input
                        type="time"
                        value={timeTo || ''}
                        onChange={(e) => onTimeToChange?.(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {hasActiveTimeFilters && onClearTimeFilters && (
                    <button
                      onClick={onClearTimeFilters}
                      className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      <span>{t('clearAllFilters')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Standort-Modus */}
          <div>
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

          {/* Reichweiten-Regler */}
          <div>
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

          {/* Flughäfen anzeigen - vorübergehend ausgeblendet */}
          {/* <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showAirports"
              checked={showAirports}
              onChange={(e) => setShowAirports(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showAirports" className="text-sm font-medium text-gray-700 cursor-pointer">
              Flughäfen anzeigen
            </label>
            {isLoadingAirports && showAirports && (
              <span className="text-xs text-gray-500 ml-auto">Lädt...</span>
            )}
          </div> */}
        </div>

        {/* Fehlermeldung */}
        {locationError && (
          <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
            {locationError}
          </div>
        )}
      </div>

      {/* Desktop: Event-Typen und Zeitfilter - oben links */}
      {onEventTypeChange && (
        <div className="hidden sm:flex absolute top-4 left-4 z-[1000] gap-2">
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white/95 backdrop-blur shadow-md"
          >
            <option value="">{t('allEventTypes')}</option>
            <option value="Flugtag">{t('eventTypes.Flugtag')}</option>
            <option value="Messe">{t('eventTypes.Messe')}</option>
            <option value="Fly-In">{t('eventTypes.Fly-In')}</option>
            <option value="Workshop">{t('eventTypes.Workshop')}</option>
            <option value="Vereinsveranstaltung">{t('eventTypes.Vereinsveranstaltung')}</option>
            <option value="Sonstiges">{t('eventTypes.Sonstiges')}</option>
          </select>
          
          {/* Desktop: Zeitfilter-Button links neben Event-Typen - nur wenn showTimeFilters=true */}
          {showTimeFilters && onDateFromChange && (
            <div className="relative" ref={timeFilterRef}>
              <button
                onClick={() => setShowTimeFiltersDropdown(!showTimeFiltersDropdown)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border shadow-md transition-colors ${
                  hasActiveTimeFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white/95 backdrop-blur text-gray-700 border-gray-300 hover:bg-white'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{t('timeFilter')}</span>
                {hasActiveTimeFilters && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    hasActiveTimeFilters ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {[dateFrom, dateTo, timeFrom, timeTo].filter(Boolean).length}
                  </span>
                )}
              </button>

              {showTimeFiltersDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-lg p-4 z-[1001]">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {t('fromDate')}
                        </label>
                        <input
                          type="date"
                          value={dateFrom || ''}
                          onChange={(e) => onDateFromChange(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {t('toDate')}
                        </label>
                        <input
                          type="date"
                          value={dateTo || ''}
                          onChange={(e) => onDateToChange?.(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {t('fromTime')}
                        </label>
                        <input
                          type="time"
                          value={timeFrom || ''}
                          onChange={(e) => onTimeFromChange?.(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {t('toTime')}
                        </label>
                        <input
                          type="time"
                          value={timeTo || ''}
                          onChange={(e) => onTimeToChange?.(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    {hasActiveTimeFilters && onClearTimeFilters && (
                      <button
                        onClick={onClearTimeFilters}
                        className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        <span>{t('clearAllFilters')}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
      
      {/* Desktop: Reichweiten-Regler - absolut positioniert */}
      <div className="hidden sm:block absolute bottom-4 right-4 w-auto max-w-xs z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 p-3 shadow-md space-y-3">
        <div>
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
        
        {/* Flughäfen anzeigen - vorübergehend ausgeblendet */}
        {/* <div className="border-t pt-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showAirportsDesktop"
              checked={showAirports}
              onChange={(e) => setShowAirports(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showAirportsDesktop" className="text-sm font-medium text-gray-700 cursor-pointer">
              Flughäfen anzeigen
            </label>
            {isLoadingAirports && showAirports && (
              <span className="text-xs text-gray-500 ml-auto">Lädt...</span>
            )}
          </div>
        </div> */}
      </div>

      {/* Desktop: Vollbild-Button unten links */}
      {showFullscreen && !isSmallScreen && (
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex absolute bottom-4 left-4 z-[1000] items-center justify-center w-12 h-12 bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-md hover:bg-white transition-colors"
          title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-gray-700" />
          ) : (
            <Maximize2 className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )}

      {/* Karte */}
      <div className={`${isFullscreen ? 'h-screen' : 'h-[calc(100vh-16rem)] sm:h-[calc(100vh-12rem)]'} w-full rounded-none sm:rounded-lg overflow-hidden border border-gray-200 relative`}>
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