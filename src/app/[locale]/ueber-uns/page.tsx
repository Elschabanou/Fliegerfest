'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Calendar, MapPin, Users, Clock, Plane, Search, Globe, Heart, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function UeberUnsPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t('title')}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                {t('subtitle')}
              </p>
              <p className="text-lg text-blue-50 mb-8">
                {t('description')}
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                {t('discoverEvents')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/dcd84d3a-ebb6-4fbb-936c-0f6adf63ebc1.png"
                alt="Luftfahrt Community"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#021234] mb-4">
              {t('mission.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('mission.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">{t('mission.passion.title')}</h3>
              <p className="text-gray-700">
                {t('mission.passion.description')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">{t('mission.community.title')}</h3>
              <p className="text-gray-700">
                {t('mission.community.description')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">{t('mission.accessibility.title')}</h3>
              <p className="text-gray-700">
                {t('mission.accessibility.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#021234] mb-4">
              {t('why.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('why.findEvents.title')}</h3>
              <p className="text-gray-600">
                {t('why.findEvents.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('why.locationBased.title')}</h3>
              <p className="text-gray-600">
                {t('why.locationBased.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('why.community.title')}</h3>
              <p className="text-gray-600">
                {t('why.community.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('why.upToDate.title')}</h3>
              <p className="text-gray-600">
                {t('why.upToDate.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#021234] mb-4">
              {t('whatWeOffer.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('whatWeOffer.eventList.title')}</h3>
                <p className="text-gray-600">
                  {t('whatWeOffer.eventList.description')}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Plane className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('whatWeOffer.createEvents.title')}</h3>
                <p className="text-gray-600">
                  {t('whatWeOffer.createEvents.description')}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('whatWeOffer.interactiveMap.title')}</h3>
                <p className="text-gray-600">
                  {t('whatWeOffer.interactiveMap.description')}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#021234] mb-2">{t('whatWeOffer.communityNetwork.title')}</h3>
                <p className="text-gray-600">
                  {t('whatWeOffer.communityNetwork.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t('cta.discoverEvents')}
            </Link>
            <Link
              href="/events/create"
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors shadow-lg border-2 border-white"
            >
              {t('cta.createEvent')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

