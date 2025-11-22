'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, MapPin, Clock, Euro, Filter, Search, X, LayoutGrid, Info, Share2 } from 'lucide-react';

// Lazy load EventsMap - nur wenn benötigt
const EventsMap = lazy(() => import('@/components/EventsMap').then(mod => ({ default: mod.default })));

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
  allDay?: boolean;
  eventType?: string;
  entryFee?: number;
  organizer?: string;
  tags?: string[];
}

export default function EventsPage() {
  const t = useTranslations('events');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState(searchParams.get('eventType') || '');
  const [showMap, setShowMap] = useState(searchParams.get('view') === 'map');
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
    
    const eventUrl = `${window.location.origin}/${locale}/events/${event._id}`;
    const eventTitle = event.title || event.name || 'Event';
    const shareData = {
      title: eventTitle,
      text: `${eventTitle} - ${event.description?.substring(0, 100) || 'Fliegerevent'}`,
      url: eventUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareSuccessId(event._id);
        setTimeout(() => setShareSuccessId(null), 3000);
      } else {
        await navigator.clipboard.writeText(eventUrl);
        setShareSuccessId(event._id);
        setTimeout(() => setShareSuccessId(null), 3000);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Fehler beim Teilen:', error);
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 500);
    
    setSearchTimeout(timeout);
  };

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
      const localeMap: Record<string, string> = {
        'de': 'de-DE',
        'en': 'en-US',
        'fr': 'fr-FR'
      };
      return new Date(dateString).toLocaleDateString(localeMap[locale] || 'de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isPastEvent = (e: Event) => {
    const base = e.dateTime || e.date;
    if (!base) return false;
    const eventDate = new Date(base);
    if (isNaN(eventDate.getTime())) return false;
    const hasExplicitTime = (e.dateTime && /T\d{2}:\d{2}/.test(e.dateTime)) || !!e.startTime || !!e.endTime;
    if (!hasExplicitTime) {
      eventDate.setHours(23, 59, 59, 999);
    }
    return eventDate.getTime() < Date.now();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-0">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex w-full sm:w-auto rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    !showMap ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>{t('list')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    showMap ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>{t('map')}</span>
                </button>
              </div>
            </div>
        </div>

        {!showMap && (
          <div 
            id="filter-section" 
            className="sticky top-0 z-50 bg-white rounded-lg shadow-md p-6 mb-8 mt-2"
          >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white text-lg"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button
                  type="button"
                  aria-label={t('searchTips')}
                  onClick={() => setShowSearchTips((prev) => !prev)}
                  onMouseEnter={() => setShowSearchTips(true)}
                  onMouseLeave={() => setShowSearchTips(false)}
                  className="flex items-center justify-center"
                >
                  <Info className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                </button>
                {showSearchTips && (
                  <div className="absolute top-8 right-0 w-64 rounded-md bg-white shadow-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-opacity duration-150 z-10">
                    <strong className="text-gray-800 block mb-1">{t('searchTips')}</strong>
                    {t('searchTipsText')}
                  </div>
                )}
              </div>
            </div>

            <>
                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white placeholder:text-gray-400 dark:bg-white"
                  >
                    <option value="">{t('allEventTypes')}</option>
                    <option value="Flugtag">{t('eventTypes.Flugtag')}</option>
                    <option value="Messe">{t('eventTypes.Messe')}</option>
                    <option value="Fly-In">{t('eventTypes.Fly-In')}</option>
                    <option value="Workshop">{t('eventTypes.Workshop')}</option>
                    <option value="Vereinsveranstaltung">{t('eventTypes.Vereinsveranstaltung')}</option>
                    <option value="Sonstiges">{t('eventTypes.Sonstiges')}</option>
                  </select>
                  <div className="flex space-x-2 md:justify-end">
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Filter className="h-5 w-5" />
                      <span>{t('timeFilter')}</span>
                    </button>
                    <button
                      onClick={handleSearch}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Search className="h-5 w-5" />
                      <span>{t('search')}</span>
                    </button>
                  </div>
                </div>

                {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={setDateFilterToday}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {t('today')}
                  </button>
                  <button
                    onClick={setDateFilterThisWeek}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {t('thisWeek')}
                  </button>
                  <button
                    onClick={setDateFilterThisMonth}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {t('thisMonth')}
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
                    >
                      <X className="h-3 w-3" />
                      <span>{t('clearAllFilters')}</span>
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {t('fromDate')}
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {t('toDate')}
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {t('fromTime')}
                    </label>
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {t('toTime')}
                    </label>
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">{t('activeFilters')}</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {eventType && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('type')}: {eventType}</span>}
                      {searchTerm && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('searchTerm')}: {searchTerm}</span>}
                      {dateFrom && dateFrom !== today && (
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('from')}: {dateFrom}</span>
                      )}
                      {dateTo && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('to')}: {dateTo}</span>}
                      {timeFrom && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('from')}: {timeFrom}</span>}
                      {timeTo && <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">{t('to')}: {timeTo}</span>}
                    </div>
                  </div>
                )}
              </div>
                )}
              </>
          </div>
        </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {showMap ? (
              <div className="mb-8 -mx-4 sm:mx-0">
                <h2 className="px-4 sm:px-0 text-2xl font-semibold text-[#021234] mb-4 mt-4">{t('eventsOnMap')}</h2>
                <div className="h-[32rem] bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('loadingEvents')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 w-full bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : showMap ? (
          <div className="mb-8 md:mb-8 -mx-4 sm:mx-0">
            <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-4 gap-4">
              <h2 className="text-2xl font-semibold text-[#021234]">{t('eventsOnMap')}</h2>
              <div className="w-full sm:w-auto sm:max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('allEventTypes')}</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white text-sm"
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
            </div>
            <div className="-mx-4 sm:mx-0 md:mx-0 px-4 sm:px-0">
              <Suspense fallback={
                <div className="h-[24rem] md:h-[32rem] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">{t('loadingMap')}</p>
                  </div>
                </div>
              }>
                <EventsMap events={events} selectedEventType={eventType} />
              </Suspense>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#021234] mb-2">{t('noEventsFound')}</h3>
            <p className="text-gray-600">{t('noEventsText')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col relative group ${isPastEvent(event) ? 'opacity-60 grayscale' : ''}`}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare(event, e);
                  }}
                  className="absolute top-3 right-3 bg-white text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-colors shadow-lg z-[1]"
                  title={t('share')}
                >
                  <Share2 className="h-5 w-5" />
                  {shareSuccessId === event._id && (
                    <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap shadow-lg z-[2]">
                      {typeof navigator.share !== 'undefined' ? t('shared') : t('linkCopied')}
                    </span>
                  )}
                </button>
                
                {event.imageurl && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <Image
                      src={event.imageurl}
                      alt={event.title || event.name || 'Event Bild'}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
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
                      {event.eventType || t('eventTypes.Sonstiges')}
                    </span>
                    {event.entryFee && event.entryFee > 0 && (
                      <span className="flex items-center text-green-600 font-semibold">
                        <Euro className="h-4 w-4 mr-1" />
                        {event.entryFee}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-[#021234] mb-2">{event.title || event.name || event._id}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description || t('noDescription')}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date || event.dateTime || '')}</span>
                    </div>
                    {event.allDay ? (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{t('allDay')}</span>
                      </div>
                    ) : event.startTime && event.endTime && (
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
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t('icao', { icao: event.icao })}</span>
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
                    <span className="text-sm text-gray-500">{event.organizer ? `${t('by')} ${event.organizer}` : 'Event'}</span>
                    <span className="text-blue-600 font-medium whitespace-nowrap group-hover:underline">
                      {t('viewDetails')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

