'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import { Calendar, MapPin, Clock, Euro, User, Mail, Phone, Globe, Edit, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface Event {
  _id: string;
  name: string;
  title?: string;
  description: string;
  location?: string;
  address?: string;
  lat: string;
  lon: string;
  icao: string;
  imageurl: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  multiDay?: boolean;
  eventType?: string;
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  entryFee?: number;
  maxParticipants?: number;
  registrationRequired?: boolean;
  tags?: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('eventDetails');
  const tEvents = useTranslations('events');
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id, fetchEvent]);

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]}`,
        },
      });

      if (response.ok) {
        router.push('/events');
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert(t('deleteError'));
    }
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };
    return new Date(dateString).toLocaleDateString(localeMap[locale] || 'de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canEdit = user && event && event.createdBy && (
    user.id === event.createdBy._id || user.role === 'admin'
  );

  const handleShare = async () => {
    const eventUrl = `${window.location.origin}/${locale}/events/${id}`;
    const eventTitle = event?.title || event?.name || 'Event';
    const shareData = {
      title: eventTitle,
      text: `${eventTitle} - ${event?.description?.substring(0, 100) || 'Fliegerevent'}`,
      url: eventUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        await navigator.clipboard.writeText(eventUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Fehler beim Teilen:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#021234] mb-4">{t('notFound')}</h1>
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-700"
          >
            {t('backToEvents')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('backToEvents')}</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block bg-white text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-3 shadow-md">
                  {event.eventType ? tEvents(`eventTypes.${event.eventType}`) : tEvents('eventTypes.Sonstiges')}
                </span>
                <h1 className="text-3xl font-bold mb-2">{event.title || event.name}</h1>
                <p className="text-blue-100">{event.organizer || 'Event'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="bg-white text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors relative shadow-md"
                  title={t('share')}
                >
                  <Share2 className="h-5 w-5" />
                  {shareSuccess && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {typeof navigator.share !== 'undefined' ? t('shared') : t('linkCopied')}
                    </span>
                  )}
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => router.push(`/events/${id}/edit`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {event.imageurl && (
              <div className="mb-8">
                <div className="h-64 w-full overflow-hidden rounded-lg cursor-pointer relative" onClick={() => setShowImageModal(true)}>
                  <Image
                    src={event.imageurl}
                    alt={event.title || event.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[#021234] mb-4">{t('description') || 'Beschreibung'}</h2>
                  <p className="text-gray-700 leading-relaxed">{event.description || tEvents('noDescription')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-[#021234] mb-3">{t('eventDetails') || 'Event-Details'}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                        <span>
                          {formatDate(event.date)}
                          {event.multiDay && event.endDate && (
                            <> - {formatDate(event.endDate)}</>
                          )}
                        </span>
                      </div>
                      {event.allDay ? (
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{t('allDay')}</span>
                        </div>
                      ) : event.multiDay ? (
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{t('multiDay')}</span>
                        </div>
                      ) : event.startTime && event.endTime && (
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                      )}
                      {event.entryFee && event.entryFee > 0 && (
                        <div className="flex items-center text-gray-700">
                          <Euro className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{event.entryFee} € {t('entryFee')}</span>
                        </div>
                      )}
                      {event.maxParticipants && (
                        <div className="flex items-center text-gray-700">
                          <User className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{t('maxParticipants')}: {event.maxParticipants}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-[#021234] mb-3">{t('location')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                        <span>{event.location || event.name}</span>
                      </div>
                      {event.address && (
                        <p className="text-gray-600 text-sm ml-8">{event.address}</p>
                      )}
                      {event.icao && (
                        <p className="text-gray-600 text-sm ml-8">{t('icao')}: {event.icao}</p>
                      )}
                    </div>
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-[#021234] mb-3">{t('tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-[#021234] mb-4">{t('contact')}</h3>
                  
                  <div className="space-y-4">
                    {event.organizer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('organizer')}</label>
                        <p className="text-[#021234]">{event.organizer}</p>
                      </div>
                    )}

                    {event.contactEmail && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                        <a 
                          href={`mailto:${event.contactEmail}`}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {event.contactEmail}
                        </a>
                      </div>
                    )}

                    {event.contactPhone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                        <a 
                          href={`tel:${event.contactPhone}`}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {event.contactPhone}
                        </a>
                      </div>
                    )}

                    {event.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('website')}</label>
                        <a 
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {t('visitWebsite') || 'Website besuchen'}
                        </a>
                      </div>
                    )}

                    {event.registrationRequired && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>{t('registrationRequired')}!</strong> {t('contactOrganizer') || 'Bitte kontaktieren Sie den Veranstalter.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showImageModal && event?.imageurl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl max-h-full w-full h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Image
                src={event.imageurl}
                alt={event.title || event.name}
                fill
                className="object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

