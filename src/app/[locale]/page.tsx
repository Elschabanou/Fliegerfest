'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Calendar, MapPin, Plane, Plus, ArrowRight, Building2, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useLocale } from 'next-intl';

interface Event {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  icao?: string;
  imageurl?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  multiDay?: boolean;
  endDate?: string;
  eventType?: string;
  entryFee?: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const params = new URLSearchParams();
        params.append('dateFrom', today);
        
        const response = await fetch(`/api/events?${params}`);
        const data = await response.json();
        const events = data.events || [];
        
        // Wähle 3-4 zufällige Events aus
        const shuffled = [...events].sort(() => 0.5 - Math.random());
        setFeaturedEvents(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <Image
          src="/dcd84d3a-ebb6-4fbb-936c-0f6adf63ebc1.png"
          alt="Ultraleichtflugzeug über Landschaft"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/30 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Fly-In Card */}
            <Link
              href="/events?eventType=Fly-In"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Plane className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.flyIn.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.flyIn.description')}</p>
            </Link>
            
            {/* Karte Card */}
            <Link
              href="/events?view=map"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <MapPin className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.map.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.map.description')}</p>
            </Link>

            {/* Messe Card */}
            <Link
              href="/events?eventType=Messe"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                <Building2 className="h-6 w-6 text-gray-600 group-hover:text-red-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.fair.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.fair.description')}</p>
            </Link>

            {/* Workshops Card */}
            <Link
              href="/events?eventType=Workshop"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-yellow-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-100 transition-colors">
                <GraduationCap className="h-6 w-6 text-gray-600 group-hover:text-yellow-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.workshop.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.workshop.description')}</p>
            </Link>

            {/* Sonstiges Card */}
            <Link
              href="/events?eventType=Sonstiges"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                <Briefcase className="h-6 w-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.other.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.other.description')}</p>
            </Link>

            {/* Event erstellen Card */}
            <Link
              href="/events/create"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
            >
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                <Plus className="h-6 w-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[#021234] mb-1">{t('home.quickActions.create.title')}</h3>
              <p className="text-xs text-gray-600">{t('home.quickActions.create.description')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#021234]">
              {t('home.featuredEvents.title')}
            </h2>
            {!loadingEvents && (
              <Link
                href="/events"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {t('home.featuredEvents.seeAll')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
          {loadingEvents ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse flex flex-col">
                  {/* Image Placeholder */}
                  <div className="h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  
                  {/* Content Placeholder */}
                  <div className="p-6 flex flex-col flex-1 min-w-0 space-y-3">
                    {/* Event Type Tag Placeholder */}
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    
                    {/* Title Placeholder */}
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    
                    {/* Description Placeholder */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    
                    {/* Details Placeholder */}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col group"
                >
                  {/* Event Image */}
                  {event.imageurl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={event.imageurl}
                        alt={event.title || event.name || 'Event'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!event.imageurl && (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Fliegerevents Logo"
                        width={80}
                        height={80}
                        className="opacity-30 object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Event Content */}
                  <div className="p-6 flex flex-col flex-1 min-w-0">
                    {/* Event Type Tag */}
                    {event.eventType && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full mb-2 w-fit">
                        {event.eventType}
                      </span>
                    )}
                    
                    {/* Event Title */}
                    <h3 className="text-lg font-semibold text-[#021234] mb-2 line-clamp-2 min-w-0">
                      {event.title || event.name || 'Unbenanntes Event'}
                    </h3>
                    
                    {/* Event Description */}
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-w-0">
                        {event.description}
                      </p>
                    )}
                    
                    {/* Event Details */}
                    <div className="mt-auto space-y-2">
                      {event.date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {formatDate(event.date)}
                            {event.multiDay && event.endDate && (
                              <> - {formatDate(event.endDate)}</>
                            )}
                          </span>
                          {event.startTime && !event.allDay && !event.multiDay && (
                            <span className="ml-2">{event.startTime}</span>
                          )}
                          {event.allDay && (
                            <span className="ml-2">{t('home.featuredEvents.allDay')}</span>
                          )}
                          {event.multiDay && (
                            <span className="ml-2">{t('eventDetails.multiDay')}</span>
                          )}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600 min-w-0">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="line-clamp-1 min-w-0">{event.location}</span>
                        </div>
                      )}
                      
                      {event.icao && (
                        <div className="text-sm text-gray-500">
                          {t('home.featuredEvents.icao', { icao: event.icao })}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-24 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

