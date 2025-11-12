'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Euro, Filter, Search, X, LayoutGrid, Info, Share2 } from 'lucide-react';
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
  const [showMap, setShowMap] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSearchTips, setShowSearchTips] = useState(false);
  
  // Date and time filters
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (eventType) params.append('eventType', eventType);
      if (searchTerm) params.append('search', searchTerm);
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
  }, [eventType, searchTerm, dateFrom, dateTo, timeFrom, timeTo]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = () => {
    fetchEvents();
  };

  const handleShare = async (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const eventUrl = `${window.location.origin}/events/${event._id}`;
    const eventTitle = event.title || event.name || 'Event';
    const shareData = {
      title: eventTitle,
      text: `${eventTitle} - ${event.description?.substring(0, 100) || 'Fliegerevent'}`,
      url: eventUrl,
    };

    try {
      // Versuche native Web Share API (funktioniert auf mobilen Geräten und einigen Browsern)
      if (navigator.share) {
        await navigator.share(shareData);
        setShareSuccessId(event._id);
        setTimeout(() => setShareSuccessId(null), 3000);
      } else {
        // Fallback: Link in Zwischenablage kopieren
        await navigator.clipboard.writeText(eventUrl);
        setShareSuccessId(event._id);
        setTimeout(() => setShareSuccessId(null), 3000);
      }
    } catch (error) {
      // Fehler beim Teilen (z.B. Benutzer hat abgebrochen) - ignorieren
      if ((error as Error).name !== 'AbortError') {
        console.error('Fehler beim Teilen:', error);
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  // Preset date filter functions
  const setDateFilterToday = () => {
    const todayValue = new Date().toISOString().split('T')[0];
    setDateFrom(todayValue);
    setDateTo(todayValue);
  };

  const setDateFilterThisWeek = () => {
    const todayDate = new Date();
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());
    const endOfWeek = new Date(todayDate);
    endOfWeek.setDate(todayDate.getDate() - todayDate.getDay() + 6);
    
    setDateFrom(startOfWeek.toISOString().split('T')[0]);
    setDateTo(endOfWeek.toISOString().split('T')[0]);
  };

  const setDateFilterThisMonth = () => {
    const todayDate = new Date();
    const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const endOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
    
    setDateFrom(startOfMonth.toISOString().split('T')[0]);
    setDateTo(endOfMonth.toISOString().split('T')[0]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setEventType('');
    setDateFrom(today);
    setDateTo('');
    setTimeFrom('');
    setTimeTo('');
  };

  const hasActiveFilters = searchTerm || eventType || dateFrom !== today || dateTo || timeFrom || timeTo;

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

  const isPastEvent = (e: Event) => {
    const base = e.dateTime || e.date;
    if (!base) return false;
    const eventDate = new Date(base);
    if (isNaN(eventDate.getTime())) return false;
    // Wenn keine Uhrzeit mitgegeben ist, vergleiche bis zum Ende des Tages
    const hasExplicitTime = (e.dateTime && /T\d{2}:\d{2}/.test(e.dateTime)) || !!e.startTime || !!e.endTime;
    if (!hasExplicitTime) {
      eventDate.setHours(23, 59, 59, 999);
    }
    return eventDate.getTime() < Date.now();
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Fliegerevents</h1>
                <p className="text-gray-600">Entdecken Sie die besten Luftfahrt-Events und Flugtage</p>
              </div>
              <div className="flex w-full sm:w-auto rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    !showMap ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    showMap ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Karte</span>
                </button>
              </div>
            </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Hauptsuchfeld */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Suche nach allem: Name, Beschreibung, Ort, ICAO, Organisator, E-Mail..."
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-lg"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button
                  type="button"
                  aria-label="Suchtipps anzeigen"
                  onClick={() => setShowSearchTips((prev) => !prev)}
                  onMouseEnter={() => setShowSearchTips(true)}
                  onMouseLeave={() => setShowSearchTips(false)}
                  className="flex items-center justify-center"
                >
                  <Info className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                </button>
                {showSearchTips && (
                  <div className="absolute top-8 right-0 w-64 rounded-md bg-white shadow-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-opacity duration-150 z-10">
                    <strong className="text-gray-800 block mb-1">Suchtipps:</strong>
                    Sie können nach Namen, Beschreibungen, Orten, ICAO-Codes, Organisatoren, E-Mail-Adressen, Telefonnummern, Websites und Tags suchen.
                  </div>
                )}
              </div>
            </div>

            {/* Basic Filters */}
            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400 dark:bg-white"
              >
                <option value="">Alle Event-Typen</option>
                <option value="Flugtag">Flugtag</option>
                <option value="Luftfahrt-Event">Luftfahrt-Event</option>
                <option value="Workshop">Workshop</option>
                <option value="Vereinsveranstaltung">Vereinsveranstaltung</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
              <div className="flex space-x-2 md:justify-end">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Filter className="h-5 w-5" />
                  <span>Zeit-Filter</span>
                </button>
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Suchen</span>
                </button>
              </div>
            </div>

            {/* Advanced Time Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                {/* Preset Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={setDateFilterToday}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Heute
                  </button>
                  <button
                    onClick={setDateFilterThisWeek}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Diese Woche
                  </button>
                  <button
                    onClick={setDateFilterThisMonth}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Dieser Monat
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
                    >
                      <X className="h-3 w-3" />
                      <span>Alle Filter löschen</span>
                    </button>
                  )}
                </div>

                {/* Date Range Filters */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Von Datum
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Bis Datum
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Von Zeit
                    </label>
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Bis Zeit
                    </label>
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Aktive Filter:</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {eventType && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Typ: {eventType}</span>}
                      {searchTerm && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Suche: {searchTerm}</span>}
                      {dateFrom && dateFrom !== today && (
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Ab: {dateFrom}</span>
                      )}
                      {dateTo && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Bis: {dateTo}</span>}
                      {timeFrom && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Von: {timeFrom}</span>}
                      {timeTo && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Bis: {timeTo}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          <div className="mb-8 -mx-4 sm:mx-0">
            <h2 className="px-4 sm:px-0 text-2xl font-semibold text-gray-900 mb-4">Events auf der Karte</h2>
            <EventsMap events={events} />
          </div>
        ) : (
          /* Listen-Ansicht */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col relative ${isPastEvent(event) ? 'opacity-60 grayscale' : ''}`}>
                {/* Share Button - Positioniert über der gesamten Karte */}
                <button
                  onClick={(e) => handleShare(event, e)}
                  className="absolute top-3 right-3 bg-white text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-colors shadow-lg z-50"
                  title="Event teilen"
                  style={{ zIndex: 50 }}
                >
                  <Share2 className="h-5 w-5" />
                  {shareSuccessId === event._id && (
                    <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap shadow-lg z-50">
                      {typeof navigator.share !== 'undefined' ? 'Geteilt!' : 'Link kopiert!'}
                    </span>
                  )}
                </button>
                
                {event.imageurl && (
                  <div className="h-48 w-full overflow-hidden relative">
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
                {!event.imageurl && (
                  <div className="h-48 w-full bg-gray-100 relative">
                  </div>
                )}
                <div className="flex flex-col flex-1 p-6">
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

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{event.organizer ? `von ${event.organizer}` : 'Event'}</span>
                    <Link
                      href={`/events/${event._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
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
