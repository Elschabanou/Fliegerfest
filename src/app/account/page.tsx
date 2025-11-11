'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, MapPin, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Event {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  date?: string;
  dateTime?: string;
  eventType?: string;
  organizer?: string;
  imageurl?: string;
  createdAt?: string;
  createdBy?: any; // Can be ObjectId or populated user object
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountPage() {
  const { user, token, logout } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (token) {
    fetchUserData();
    fetchUserEvents();
    }
  }, [user, token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('User profile response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('User data loaded:', data);
        setUserData(data);
      } else {
        console.error('User profile API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fehler beim Laden der User-Daten:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Alle Events geladen:', data.events?.length || 0);
      console.log('User ID:', user?.id);

      // Filter events created by this user
      const filteredEvents = data.events.filter((event: Event) => {
        const eventCreatedBy = event.createdBy?.$oid || event.createdBy || '';
        const userId = user?.id || '';
        const matches = eventCreatedBy.toString() === userId.toString();
        console.log(`Event ${event._id}: createdBy=${eventCreatedBy}, userId=${userId}, matches=${matches}`);
        return matches;
      });

      console.log('Gefilterte Events:', filteredEvents.length);
      setUserEvents(filteredEvents);
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Event löschen möchten?')) {
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
        alert('Fehler beim Löschen des Events');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Events');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Nicht autorisiert</h1>
            <p className="text-gray-600">Bitte melden Sie sich an, um Ihr Konto zu sehen.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mein Konto</h1>
          <p className="text-gray-600">Verwalten Sie Ihre persönlichen Informationen und Ihre Events</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* User Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Persönliche Informationen</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{userData?.name || user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                  <p className="text-gray-900">{userData?.email || user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rolle</label>
                  <p className="text-gray-900">{userData?.role || user?.role || 'user'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Registriert seit</label>
                  <p className="text-gray-900">
                    {userData?.createdAt ? formatDate(userData.createdAt) : 'Unbekannt'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>

          {/* User Events */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Meine Events</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {userEvents.length} Event{userEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Events werden geladen...</p>
                </div>
              ) : userEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Events gefunden</h3>
                  <p className="text-gray-600 mb-4">Sie haben noch keine Events erstellt.</p>
                  <Link
                    href="/events/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Erstes Event erstellen
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                        <div className="flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.title || event.name || 'Unbenanntes Event'}
                            </h3>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              event.eventType === 'Flugtag' ? 'bg-blue-100 text-blue-800' :
                              event.eventType === 'Luftfahrt-Event' ? 'bg-green-100 text-green-800' :
                              event.eventType === 'Workshop' ? 'bg-purple-100 text-purple-800' :
                              event.eventType === 'Vereinsveranstaltung' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.eventType || 'Sonstiges'}
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
                            href={`/events/${event._id}`}
                            className="flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Ansehen
                          </Link>

                          <button
                            onClick={() => deleteEvent(event._id)}
                            disabled={deletingId === event._id}
                            className="flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingId === event._id ? 'Löschen...' : 'Löschen'}
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
