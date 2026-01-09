'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ArrowLeft, MapPin, Loader, Upload, X, Image as ImageIcon } from 'lucide-react';
import { geocodeLocation, isGeocodingSuccess } from '@/lib/geocoding';
import { useTranslations, useLocale } from 'next-intl';
import Lottie from 'lottie-react';
import CoordinateMapPicker from '@/components/CoordinateMapPicker';

export default function CreateEventPage() {
  const t = useTranslations('create');
  const tCommon = useTranslations('common');
  const tEvents = useTranslations('events');
  const locale = useLocale();
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
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: false,
    multiDay: false,
    differentTimesPerDay: false,
    dailyTimes: [] as Array<{ date: string; startTime: string; endTime: string }>,
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
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingSuccess, setGeocodingSuccess] = useState<string | null>(null);
  const [geocodingFailed, setGeocodingFailed] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/signin?redirect=/events/create');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch('/Message Sent Successfully _ Plane.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Fehler beim Laden der Animation:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Wenn multiDay deaktiviert wird, Enddatum und differentTimesPerDay zurücksetzen
    if (name === 'multiDay' && !(e.target as HTMLInputElement).checked) {
      setFormData(prev => ({
        ...prev,
        multiDay: false,
        endDate: '',
        differentTimesPerDay: false,
        dailyTimes: []
      }));
      return;
    }

    // Wenn differentTimesPerDay aktiviert wird, generiere dailyTimes Array
    if (name === 'differentTimesPerDay' && (e.target as HTMLInputElement).checked) {
      if (formData.date) {
        const startDate = new Date(formData.date);
        const endDate = formData.endDate ? new Date(formData.endDate) : new Date(formData.date);
        const days: Array<{ date: string; startTime: string; endTime: string }> = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          days.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: formData.startTime || '',
            endTime: formData.endTime || ''
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setFormData(prev => ({
          ...prev,
          differentTimesPerDay: true,
          dailyTimes: days
        }));
        return;
      }
    }

    // Wenn differentTimesPerDay deaktiviert wird, dailyTimes leeren
    if (name === 'differentTimesPerDay' && !(e.target as HTMLInputElement).checked) {
      setFormData(prev => ({
        ...prev,
        differentTimesPerDay: false,
        dailyTimes: []
      }));
      return;
    }

    // Wenn date oder endDate geändert wird und differentTimesPerDay aktiv ist, aktualisiere dailyTimes
    if ((name === 'date' || name === 'endDate') && formData.differentTimesPerDay) {
      const newDate = name === 'date' ? value : formData.date;
      const newEndDate = name === 'endDate' ? value : (formData.endDate || formData.date);
      
      if (newDate) {
        const startDate = new Date(newDate);
        const endDate = newEndDate ? new Date(newEndDate) : new Date(newDate);
        const days: Array<{ date: string; startTime: string; endTime: string }> = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const existingDay = formData.dailyTimes.find(d => d.date === dateStr);
          days.push({
            date: dateStr,
            startTime: existingDay?.startTime || formData.startTime || '',
            endTime: existingDay?.endTime || formData.endTime || ''
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          dailyTimes: days
        }));
        return;
      }
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
      
      // Wenn lat oder lon manuell eingegeben werden und beide vorhanden sind, verstecke die Karte
      if ((name === 'lat' || name === 'lon') && value.trim()) {
        const latValue = name === 'lat' ? value : newData.lat;
        const lonValue = name === 'lon' ? value : newData.lon;
        if (latValue.trim() && lonValue.trim()) {
          setGeocodingFailed(false);
          setShowMapPicker(false);
        }
      }
      
      return newData;
    });
  };

  const handleDailyTimeChange = (date: string, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      dailyTimes: prev.dailyTimes.map(day => 
        day.date === date ? { ...day, [field]: value } : day
      )
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageButtonClick = () => {
    document.getElementById('image')?.click();
  };

  const performGeocode = useCallback(async (locationQuery: string) => {
    if (!locationQuery.trim()) {
      setGeocodingFailed(false);
      setShowMapPicker(false);
      return;
    }

    setGeocoding(true);
    setError('');
    setGeocodingSuccess(null);
    setGeocodingFailed(false);
    setShowMapPicker(false);

    try {
      const result = await geocodeLocation(locationQuery);
      
      if (isGeocodingSuccess(result)) {
        setFormData(prev => ({
          ...prev,
          lat: result.lat,
          lon: result.lon
        }));
        setGeocodingSuccess(t('geocodeSuccess', { name: result.display_name }));
        setGeocodingFailed(false);
        setShowMapPicker(false);
      } else {
        setGeocodingFailed(true);
        setShowMapPicker(true);
        setError(result.error);
      }
    } catch {
      setGeocodingFailed(true);
      setShowMapPicker(true);
      setError(t('geocodeError'));
    } finally {
      setGeocoding(false);
    }
  }, [t]);

  // Automatisches Geocoding beim Eingeben von Adresse/Location (mit Debouncing)
  useEffect(() => {
    // Clear previous timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    const locationQuery = formData.location || formData.address;
    
    // Nur geocoden, wenn etwas eingegeben wurde und noch keine Koordinaten vorhanden sind
    if (locationQuery.trim() && (!formData.lat || !formData.lon)) {
      geocodeTimeoutRef.current = setTimeout(() => {
        performGeocode(locationQuery);
      }, 1000); // 1 Sekunde Debounce
    } else if (!locationQuery.trim()) {
      // Wenn Feld geleert wird, Koordinaten und Status zurücksetzen
      setGeocodingFailed(false);
      setShowMapPicker(false);
      setGeocodingSuccess(null);
    }

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [formData.location, formData.address, formData.lat, formData.lon, performGeocode]);

  const handleGeocode = async () => {
    const locationQuery = formData.location || formData.address;
    if (!locationQuery.trim()) {
      setError(t('locationRequired'));
      return;
    }
    await performGeocode(locationQuery);
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
      if (formData.endDate) {
        form.append('endDate', formData.endDate);
      }
      if (formData.differentTimesPerDay && formData.dailyTimes.length > 0) {
        form.append('dailyTimes', JSON.stringify(formData.dailyTimes));
      } else {
        if (formData.startTime) {
          form.append('startTime', formData.startTime);
        }
        if (formData.endTime) {
          form.append('endTime', formData.endTime);
        }
      }
      form.append('allDay', String(formData.allDay));
      form.append('multiDay', String(formData.multiDay));
      form.append('differentTimesPerDay', String(formData.differentTimesPerDay));
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
        await response.json();
        setShowAnimation(true);
        setLoading(false);
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => {
          router.push('/events');
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
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
          <h2 className="text-2xl font-bold text-[#021234] mt-4">{t('success')}</h2>
          <p className="text-gray-600 mt-2">{t('successMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/events"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('backToEvents')}</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#021234]">{t('title')}</h1>
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
              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={imagePreview}
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

            {(geocodingSuccess || geocodingFailed) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-blue-900">{t('geocodeTitle')}</h3>
                </div>
                
                {geocoding && (
                  <div className="mb-3 p-2 bg-blue-100 text-blue-800 rounded text-sm">
                    <Loader className="h-4 w-4 animate-spin inline mr-2" />
                    {t('geocoding')}...
                  </div>
                )}
                
                {geocodingSuccess && (
                  <div className="mb-3 p-2 bg-green-100 text-green-800 rounded text-sm">
                    ✅ {geocodingSuccess}
                  </div>
                )}
                
                {geocodingFailed && showMapPicker && (
                  <div className="mb-4">
                    <CoordinateMapPicker
                      lat={formData.lat}
                      lon={formData.lon}
                      onCoordinateChange={(lat, lon) => {
                        setFormData(prev => ({
                          ...prev,
                          lat: lat.toString(),
                          lon: lon.toString()
                        }));
                      }}
                    />
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
            )}

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
                <>
                  {formData.multiDay && (
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="differentTimesPerDay"
                        name="differentTimesPerDay"
                        checked={formData.differentTimesPerDay}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="differentTimesPerDay" className="ml-2 block text-sm font-medium text-gray-700">
                        {t('differentTimesPerDay') || 'Unterschiedliche Zeiten pro Tag'}
                      </label>
                    </div>
                  )}

                  {formData.multiDay && formData.differentTimesPerDay && formData.dailyTimes.length > 0 ? (
                    <div className="space-y-4">
                      {formData.dailyTimes.map((day, index) => {
                        const dayDate = new Date(day.date);
                        const dayName = dayDate.toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'en-US', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        });
                        return (
                          <div key={day.date} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">{dayName}</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {t('startTime')}
                                </label>
                                <input
                                  type="time"
                                  value={day.startTime}
                                  onChange={(e) => handleDailyTimeChange(day.date, 'startTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {t('endTime')}
                                </label>
                                <input
                                  type="time"
                                  value={day.endTime}
                                  onChange={(e) => handleDailyTimeChange(day.date, 'endTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#021234] bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
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
                </>
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
                onClick={() => router.push('/events')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

