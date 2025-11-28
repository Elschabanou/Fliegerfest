'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { User as UserIcon, Calendar, MapPin, Trash2, Edit } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

type EventCreator = string | { $oid: string };

interface Event {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  address?: string;
  date?: string;
  dateTime?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  multiDay?: boolean;
  eventType?: string;
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  maxParticipants?: number;
  registrationRequired?: boolean;
  entryFee?: number;
  website?: string;
  tags?: string;
  lat?: string;
  lon?: string;
  imageurl?: string;
  createdAt?: string;
  createdBy?: EventCreator;
}

interface AccountUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountPage() {
  const t = useTranslations('account');
  const tEvents = useTranslations('events');
  const locale = useLocale();
  const { user, token, logout } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: AccountUser = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der User-Daten:', error);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const fetchUserEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const filteredEvents = (data.events as Event[]).filter((event) => {
        const createdBy = event.createdBy;
        const eventCreatedBy =
          typeof createdBy === 'object' && createdBy !== null && '$oid' in createdBy
            ? createdBy.$oid
            : createdBy ?? '';
        const userId = user?.id ?? '';
        return eventCreatedBy.toString() === userId.toString();
      });
      setUserEvents(filteredEvents);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void fetchUserData();
    void fetchUserEvents();
  }, [token, fetchUserData, fetchUserEvents]);

  const deleteEvent = async (eventId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    setDeletingId(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUserEvents(userEvents.filter(event => event._id !== eventId));
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert(t('deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const localeMap: Record<string, string> = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };
      return new Date(dateString).toLocaleDateString(localeMap[locale] || 'de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#021234] mb-4">{t('unauthorized') || 'Nicht autorisiert'}</h1>
            <p className="text-gray-600">{t('pleaseSignIn') || 'Bitte melden Sie sich an, um Ihr Konto zu sehen.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#021234] mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle') || 'Verwalten Sie Ihre persönlichen Informationen und Ihre Events'}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-[#021234]">{t('userInfo')}</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                  <p className="text-[#021234]">{userData?.name || user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                  <p className="text-[#021234]">{userData?.email || user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('role')}</label>
                  <p className="text-[#021234]">{userData?.role || user?.role || 'user'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('memberSince')}</label>
                  <p className="text-[#021234]">
                    {userData?.createdAt ? formatDate(userData.createdAt) : 'Unbekannt'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-[#021234]">{t('myEvents')}</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {userEvents.length} {userEvents.length !== 1 ? 'Events' : 'Event'}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('loading')}</p>
                </div>
              ) : userEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#021234] mb-2">{t('noEventsTitle') || 'Keine Events gefunden'}</h3>
                  <p className="text-gray-600 mb-4">{t('noEvents')}</p>
                  <Link
                    href="/events/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('createEvent')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                        <div className="flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                            <h3 className="text-lg font-semibold text-[#021234]">
                              {event.title || event.name || 'Unbenanntes Event'}
                            </h3>
                            <span className={`inline-block w-fit px-2 py-1 text-xs rounded-full ${
                              event.eventType === 'Flugtag' ? 'bg-blue-100 text-blue-800' :
                              event.eventType === 'Messe' ? 'bg-green-100 text-green-800' :
                              event.eventType === 'Workshop' ? 'bg-purple-100 text-purple-800' :
                              event.eventType === 'Vereinsveranstaltung' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.eventType ? tEvents(`eventTypes.${event.eventType}`) : tEvents('eventTypes.Sonstiges')}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(event.date || event.dateTime || '')}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 md:ml-4 w-full md:w-auto">
                          <Link
                            href={`/events/${event._id}/edit`}
                            className="flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('edit') || 'Bearbeiten'}
                          </Link>

                          <button
                            onClick={() => deleteEvent(event._id)}
                            disabled={deletingId === event._id}
                            className="flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingId === event._id ? t('deleting') || 'Löschen...' : t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

