'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, Plane, Search, Globe, Heart, ArrowRight } from 'lucide-react';

export default function UeberUnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Über Fliegerevents
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Ihre zentrale Anlaufstelle für alle Luftfahrt-Events und Flugtage in Deutschland
              </p>
              <p className="text-lg text-blue-50 mb-8">
                Wir verbinden die Luftfahrt-Community und machen es einfach, spannende Events zu entdecken, zu organisieren und zu teilen. Ob Flugtag, Fly-In, Workshop oder Vereinsveranstaltung – bei uns finden Sie alles, was die Luftfahrt zu bieten hat.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Events entdecken
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
              Unsere Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Die Luftfahrt-Community zu stärken und den Zugang zu spannenden Events zu erleichtern
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">Leidenschaft</h3>
              <p className="text-gray-700">
                Wir teilen die Leidenschaft für die Luftfahrt und möchten diese mit anderen teilen
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">Community</h3>
              <p className="text-gray-700">
                Wir bringen Privatflieger zusammen und fördern den Austausch in der Community
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#021234] mb-3">Zugänglichkeit</h3>
              <p className="text-gray-700">
                Wir machen es einfach, Events zu finden, zu organisieren und zu besuchen
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
              Warum Fliegerevents?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie die Vorteile unserer Plattform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">Events finden</h3>
              <p className="text-gray-600">
                Entdecken Sie Flugtage, Workshops und Luftfahrt-Events in Ihrer Nähe mit unserer intelligenten Suchfunktion
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">Standort-basiert</h3>
              <p className="text-gray-600">
                Finden Sie Events in Ihrer Region oder an Ihrem bevorzugten Flugplatz mit unserer interaktiven Karte
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">Community</h3>
              <p className="text-gray-600">
                Treffen Sie andere Privatflieger, tauschen Sie sich aus und teilen Sie Ihre Leidenschaft für die Luftfahrt
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#021234] mb-2">Immer aktuell</h3>
              <p className="text-gray-600">
                Bleiben Sie über die neuesten Events und Termine informiert – unsere Plattform wird täglich aktualisiert
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
              Was wir bieten
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
                <h3 className="text-xl font-semibold text-[#021234] mb-2">Umfassende Event-Liste</h3>
                <p className="text-gray-600">
                  Durchsuchen Sie Hunderte von Events nach Typ, Datum, Ort oder anderen Kriterien. Von Flugtagen über Fly-Ins bis hin zu Workshops – wir haben alles.
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
                <h3 className="text-xl font-semibold text-[#021234] mb-2">Eigene Events erstellen</h3>
                <p className="text-gray-600">
                  Organisieren Sie Ihr eigenes Event und teilen Sie es mit der Community. Einfach, schnell und kostenlos.
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
                <h3 className="text-xl font-semibold text-[#021234] mb-2">Interaktive Karte</h3>
                <p className="text-gray-600">
                  Visualisieren Sie Events auf einer interaktiven Karte und finden Sie Veranstaltungen in Ihrer Nähe auf einen Blick.
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
                <h3 className="text-xl font-semibold text-[#021234] mb-2">Community-Netzwerk</h3>
                <p className="text-gray-600">
                  Vernetzen Sie sich mit anderen Piloten, Vereinen und Organisationen. Teilen Sie Ihre Erfahrungen und lernen Sie voneinander.
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
            Bereit, loszulegen?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Entdecken Sie spannende Events oder erstellen Sie Ihr eigenes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Events entdecken
            </Link>
            <Link
              href="/events/create"
              className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors shadow-lg border-2 border-white"
            >
              Event erstellen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

