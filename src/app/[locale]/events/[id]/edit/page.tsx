'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ArrowLeft, MapPin, Loader, Upload, X } from 'lucide-react';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';
import { useTranslations } from 'next-intl';
import Lottie from 'lottie-react';

export default function EditEventPage() {
  const { id } = useParams();
  const t = useTranslations('create');
  const tCommon = useTranslations('common');
  const tEvents = useTranslations('events');
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: false,
    multiDay: false,
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingSuccess, setGeocodingSuccess] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/signin?redirect=/events/${id}/edit`);
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    fetch('/Message Sent Successfully _ Plane.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Fehler beim Laden der Animation:', err));
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!token || !id) return;
      
      try {
        const response = await fetch(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const event = await response.json();
          
          // Prüfe ob der Benutzer berechtigt ist
          const eventCreatedBy = typeof event.createdBy === 'object' && event.createdBy !== null && '$oid' in event.createdBy
            ? event.createdBy.$oid
            : event.createdBy ?? '';
          const userId = user?.id ?? '';
          
          if (eventCreatedBy.toString() !== userId.toString() && user?.role !== 'admin') {
            setError('Keine Berechtigung zum Bearbeiten dieses Events');
            setLoadingEvent(false);
            return;
          }

          // Formular mit Event-Daten vorausfüllen
          const formatDateForInput = (dateString?: string) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            } catch {
              return '';
            }
          };

          const formatTimeForInput = (timeString?: string) => {
            if (!timeString) return '';
            if (timeString.match(/^\d{2}:\d{2}$/)) {
              return timeString;
            }
            try {
              const date = new Date(`2000-01-01T${timeString}`);
              return date.toTimeString().slice(0, 5);
            } catch {
              return '';
            }
          };

          setFormData({
            title: event.title || event.name || '',
            description: event.description || '',
            location: event.location || '',
            address: event.address || '',
            date: formatDateForInput(event.date || event.dateTime),
            endDate: formatDateForInput(event.endDate),
            startTime: formatTimeForInput(event.startTime),
            endTime: formatTimeForInput(event.endTime),
            allDay: event.allDay || false,
            multiDay: event.multiDay || false,
            eventType: event.eventType || '',
            organizer: event.organizer || '',
            contactEmail: event.contactEmail || '',
            contactPhone: event.contactPhone || '',
            maxParticipants: event.maxParticipants ? String(event.maxParticipants) : '',
            registrationRequired: event.registrationRequired || false,
            entryFee: event.entryFee ? String(event.entryFee) : '',
            website: event.website || '',
            tags: Array.isArray(event.tags) ? event.tags.join(', ') : (event.tags || ''),
            lat: event.lat || '',
            lon: event.lon || ''
          });

          if (event.imageurl) {
            setCurrentImageUrl(event.imageurl);
          }
        } else {
          setError('Event nicht gefunden');
        }
      } catch (err) {
        console.error('Fehler beim Laden des Events:', err);
        setError('Fehler beim Laden des Events');
      } finally {
        setLoadingEvent(false);
      }
    };

    if (user && token && id) {
      loadEvent();
    }
  }, [user, token, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Wenn multiDay deaktiviert wird, Enddatum zurücksetzen
    if (name === 'multiDay' && !(e.target as HTMLInputElement).checked) {
      setFormData(prev => ({
        ...prev,
        multiDay: false,
        endDate: ''
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      // Erstelle Vorschau-URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCurrentImageUrl(null); // Entferne aktuelles Bild wenn neues hochgeladen wird
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageButtonClick = () => {
    document.getElementById('image')?.click();
  };

  const handleGeocode = async () => {
    const locationQuery = formData.location || formData.address;
    if (!locationQuery.trim()) {
      setError(t('locationRequired'));
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
        setGeocodingSuccess(t('geocodeSuccess', { name: result.display_name }));
      } else {
        setError(result.error);
      }
    } catch {
      setError(t('geocodeError'));
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

      // Wenn ein neues Bild hochgeladen wurde, verwende FormData
      if (imageFile) {
        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('location', formData.location);
        form.append('address', formData.address);
        form.append('date', formData.date);
        if (formData.endDate) {
          form.append('endDate', formData.endDate);
        }
        if (!formData.allDay && !formData.multiDay) {
          form.append('startTime', formData.startTime);
          form.append('endTime', formData.endTime);
        }
        form.append('allDay', String(formData.allDay));
        form.append('multiDay', String(formData.multiDay));
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
        form.append('image', imageFile);

        // Für Bild-Upload müsste die API erweitert werden, für jetzt verwenden wir JSON
        // Fallback zu JSON
      }

      // Verwende JSON für Update (Bild-Upload würde separate API benötigen)
      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        date: formData.date ? new Date(formData.date) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        allDay: formData.allDay,
        multiDay: formData.multiDay,
        eventType: formData.eventType,
        organizer: formData.organizer,
        contactEmail: formData.contactEmail || user?.email,
        contactPhone: formData.contactPhone || undefined,
        maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
        registrationRequired: formData.registrationRequired,
        entryFee: formData.entryFee ? Number(formData.entryFee) : undefined,
        website: formData.website || undefined,
        tags: tagsArray.length > 0 ? tagsArray.join(',') : undefined,
        lat: formData.lat || undefined,
        lon: formData.lon || undefined,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setShowAnimation(true);
        setLoading(false);
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => {
          router.push(`/events/${id}`);
        }, 2500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || tCommon('error'));
      }
    } catch {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 flex flex-col items-center">
          {animationData ? (
            <div className="w-64 h-64">
              <Lottie 
                animationData={animationData} 
                loop={false}
                autoplay={true}
              />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-[#021234] mt-4">{t('updateSuccess') || 'Event erfolgreich aktualisiert!'}</h2>
          <p className="text-gray-600 mt-2">{t('updateSuccessMessage') || 'Sie werden zur Event-Detail-Seite weitergeleitet...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/events/${id}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('backToEvents')}</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#021234]">Event bearbeiten</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('image')}
              </label>
              {(imagePreview || currentImageUrl) ? (
                <div className="relative inline-block">
                  <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={imagePreview || currentImageUrl || ''}
                      alt="Vorschau"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                      title="Bild entfernen"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleImageButtonClick}
                    className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">
                      {t('image') || 'Bild hochladen'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Klicken Sie hier, um ein Bild auszuwählen
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('titleLabel')} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('titlePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('eventType')} *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                >
                  <option value="">{t('eventTypeSelect')}</option>
                  <option value="Flugtag">{tEvents('eventTypes.Flugtag')}</option>
                  <option value="Messe">{tEvents('eventTypes.Messe')}</option>
                  <option value="Fly-In">{tEvents('eventTypes.Fly-In')}</option>
                  <option value="Workshop">{tEvents('eventTypes.Workshop')}</option>
                  <option value="Vereinsveranstaltung">{tEvents('eventTypes.Vereinsveranstaltung')}</option>
                  <option value="Sonstiges">{tEvents('eventTypes.Sonstiges')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('entryFee')} *
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
                  placeholder={t('entryFeePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('organizer')} *
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('organizerPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxParticipants')}
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('maxParticipantsPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')} *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('location')} *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('locationPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('address')} *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('addressPlaceholder')}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">{t('geocodeTitle')}</h3>
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
                  <span>{geocoding ? t('geocoding') : t('geocode')}</span>
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
                    {t('latitude')}
                  </label>
                  <input
                    type="text"
                    id="lat"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    placeholder={t('latitudePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="lon" className="block text-xs font-medium text-gray-600 mb-1">
                    {t('longitude')}
                  </label>
                  <input
                    type="text"
                    id="lon"
                    name="lon"
                    value={formData.lon}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    placeholder={t('longitudePlaceholder')}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {t('geocodeHint')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('date')} *
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

              <div className="space-y-3">
                <div className="flex items-center gap-6">
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
                      {t('allDay')}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="multiDay"
                      name="multiDay"
                      checked={formData.multiDay}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="multiDay" className="ml-2 block text-sm font-medium text-gray-700">
                      {t('multiDay')}
                    </label>
                  </div>
                </div>

                {formData.multiDay && (
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('endDate')} *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      required={formData.multiDay}
                      min={formData.date}
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                )}
              </div>

              {!formData.allDay && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('startTime')}
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('endTime')}
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactEmail')} *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('contactEmailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactPhone')}
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                  placeholder={t('contactPhonePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                {t('website')}
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder={t('websitePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                {t('tags')}
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                placeholder={t('tagsPlaceholder')}
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
                {t('registrationRequired')}
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push(`/events/${id}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('submitting') : (t('save') || 'Speichern')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

