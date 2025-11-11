import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <Image
          src="/a31e2738-6b01-4bfa-a56e-e638bddd31a4.jpg"
          alt="Ultraleichtflugzeug über Landschaft"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/30 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="Fliegerevents Logo"
                  width={120}
                  height={120}
                  className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-lg"
                />
                <h1 className="text-4xl md:text-6xl font-bold">
                  Fliegerevents
                </h1>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Entdecken Sie die besten Flugtage, Luftfahrt-Events und Workshops für Privatflieger in Deutschland
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-500 transition-colors shadow-lg"
              >
                Events entdecken
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Kostenlos registrieren
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum Fliegerevents?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ihre zentrale Anlaufstelle für alle Luftfahrt-Events und Flugtage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Events finden</h3>
              <p className="text-gray-600">
                Entdecken Sie Flugtage, Workshops und Luftfahrt-Events in Ihrer Nähe
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Standort-basiert</h3>
              <p className="text-gray-600">
                Finden Sie Events in Ihrer Region oder an Ihrem bevorzugten Flugplatz
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                Treffen Sie andere Privatflieger und teilen Sie Ihre Leidenschaft
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Immer aktuell</h3>
              <p className="text-gray-600">
                Bleiben Sie über die neuesten Events und Termine informiert
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bereit für Ihren ersten Event?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Registrieren Sie sich kostenlos und entdecken Sie die vielfältige Welt der Luftfahrt-Events
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Jetzt registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}