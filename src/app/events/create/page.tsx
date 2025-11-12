'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader } from 'lucide-react';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';
import Lottie from 'lottie-react';

export default function CreateEventPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    startTime: '',
    endTime: '',
    allDay: false,
    eventType: '',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    maxParticipants: '',
    registrationRequired: false,
    entryFee: '',
    website: '',
    tags: '',
    lat: '',
    lon: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingSuccess, setGeocodingSuccess] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Lade Animation-Daten
  useEffect(() => {
    fetch('/Message Sent Successfully _ Plane.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Fehler beim Laden der Animation:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleGeocode = async () => {
    const locationQuery = formData.location || formData.address;
    if (!locationQuery.trim()) {
      setError('Bitte geben Sie einen Ort oder eine Adresse ein');
      return;
    }

    setGeocoding(true);
    setError('');
    setGeocodingSuccess(null);

    try {
      const result = await geocodeLocation(locationQuery);
      
      if (isGeocodingSuccess(result)) {
        setFormData(prev => ({
          ...prev,
          lat: result.lat,
          lon: result.lon
        }));
        setGeocodingSuccess(`Koordinaten gefunden: ${result.display_name}`);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Fehler beim Abrufen der Koordinaten');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('location', formData.location);
      form.append('address', formData.address);
      form.append('date', formData.date);
      if (!formData.allDay) {
        form.append('startTime', formData.startTime);
        form.append('endTime', formData.endTime);
      }
      form.append('allDay', String(formData.allDay));
      form.append('eventType', formData.eventType);
      form.append('organizer', formData.organizer);
      form.append('contactEmail', formData.contactEmail || (user?.email ?? ''));
      if (formData.contactPhone) form.append('contactPhone', formData.contactPhone);
      if (formData.maxParticipants) form.append('maxParticipants', String(formData.maxParticipants));
      form.append('registrationRequired', String(formData.registrationRequired));
      if (formData.entryFee) form.append('entryFee', String(formData.entryFee));
      if (formData.website) form.append('website', formData.website);
      if (tagsArray.length) form.append('tags', tagsArray.join(','));
      if (formData.lat) form.append('lat', formData.lat);
      if (formData.lon) form.append('lon', formData.lon);
      if (imageFile) form.append('image', imageFile);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]}`,
        },
        body: form,
      });

      if (response.ok) {
        const event = await response.json();
        console.log('Event erstellt, ID:', event._id);
        // Animation anzeigen
        setShowAnimation(true);
        setLoading(false);
        // Nach der Animation (ca. 2.5 Sekunden) zur Event-Seite weiterleiten
        setTimeout(() => {
          router.push('/events');
        }, 2500);
      } else {
        const errorData = await response.json();
        console.log('Fehler beim Erstellen:', errorData);
        setError(errorData.error || 'Ein Fehler ist aufgetreten');
      }
    } catch {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  // Animation Overlay
  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 flex flex-col items-center">
          {animationData && (
            <div className="w-64 h-64">
              <Lottie 
                animationData={animationData as object} 
                loop={false}
                autoplay={true}
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-[#021234] mt-4">Event erfolgreich erstellt!</h2>
          <p className="text-gray-600 mt-2">Sie werden zur Event-Seite weitergeleitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/events')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zurück zu den Events</span>
          </button>
          <h1 className="text-3xl font-bold text-[#021234]">Neues Event erstellen</h1>
          <p className="text-gray-600 mt-2">Teilen Sie Ihr Fliegerevent mit der Community</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Titelbild (optional)
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event-Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="z.B. Flugtag am Flugplatz XYZ"
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                  Event-Typ *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="Flugtag">Flugtag</option>
                  <option value="Luftfahrt-Event">Luftfahrt-Event</option>
                  <option value="Fly-In">Fly-In</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Vereinsveranstaltung">Vereinsveranstaltung</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Eintrittspreis (€) *
                </label>
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  min="0"
                  step="0.01"
                  required
                  value={formData.entryFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  Veranstalter *
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="Ihr Name oder Verein"
                />
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Teilnehmer (optional)
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="z.B. 50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder="Beschreiben Sie Ihr Event..."
              />
            </div>

            {/* Location Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Ort/Flugplatz *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="z.B. Flugplatz Mainz-Finthen"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Vollständige Adresse *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="Straße, PLZ Ort"
                />
              </div>
            </div>

            {/* Geocoding Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">Koordinaten für Karte</h3>
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding || (!formData.location && !formData.address)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {geocoding ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span>{geocoding ? 'Wird gesucht...' : 'Koordinaten finden'}</span>
                </button>
              </div>
              
              {geocodingSuccess && (
                <div className="mb-3 p-2 bg-green-100 text-green-800 rounded text-sm">
                  ✅ {geocodingSuccess}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-xs font-medium text-gray-600 mb-1">
                    Breitengrad (Latitude)
                  </label>
                  <input
                    type="text"
                    id="lat"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    placeholder="z.B. 47.6500279"
                  />
                </div>
                <div>
                  <label htmlFor="lon" className="block text-xs font-medium text-gray-600 mb-1">
                    Längengrad (Longitude)
                  </label>
                  <input
                    type="text"
                    id="lon"
                    name="lon"
                    value={formData.lon}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    placeholder="z.B. 9.4800858"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Klicken Sie auf &quot;Koordinaten finden&quot; um automatisch die Koordinaten für Ihren Ort zu ermitteln. 
                Diese werden benötigt, damit Ihr Event auf der Karte angezeigt wird.
              </p>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Datum *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allDay" className="ml-2 block text-sm font-medium text-gray-700">
                  Ganztägige Veranstaltung
                </label>
              </div>

              {!formData.allDay && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Startzeit *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      required={!formData.allDay}
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Endzeit *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      required={!formData.allDay}
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Kontakt-E-Mail *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="kontakt@example.de"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Kontakt-Telefon (optional)
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website (optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder="https://www.example.de"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder="Segelflug, Ultraleicht, Oldtimer (durch Komma getrennt)"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="registrationRequired"
                name="registrationRequired"
                checked={formData.registrationRequired}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="registrationRequired" className="ml-2 block text-sm text-gray-700">
                Anmeldung erforderlich
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Wird erstellt...' : 'Event erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
