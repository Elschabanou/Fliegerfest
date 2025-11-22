'use client';

import { useAuth } from './AuthProvider';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, User, LogOut, Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const t = useTranslations('nav');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Fliegerevents Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-[#021234]">Fliegerevents</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/events' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('events')}
            </Link>
            <Link 
              href="/ueber-uns" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/ueber-uns' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('about')}
            </Link>

            
            {user && (
              <Link
                href="/events/create"
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t('createEvent')}</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/account" 
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    pathname === '/account' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <User className={`h-5 w-5 ${pathname === '/account' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>{user.name}</span>
                  </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/auth/signin' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/events"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/events' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('events')}
              </Link>
              
              {user && (
                <Link
                  href="/events/create"
                  className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('createEvent')}
                </Link>
              )}

              {user ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                      pathname === '/account' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <User className={`h-5 w-5 ${pathname === '/account' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="ml-3">
                      <div className={`text-base font-medium ${pathname === '/account' ? 'text-blue-600' : 'text-gray-800'}`}>{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </Link>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 w-full text-left px-3 py-2 rounded-md text-base font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link
                    href="/auth/signin"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === '/auth/signin' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
