'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { routing } from '@/i18n/routing';

interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
  buttonClassName?: string;
}

export default function LanguageSwitcher({ direction = 'down', buttonClassName }: LanguageSwitcherProps) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Get the actual browser pathname
      const browserPath = window.location.pathname;
      
      // Remove any locale prefix from the path
      let pathWithoutLocale = browserPath;
      
      // Check each locale and remove it if it's at the start
      for (const loc of routing.locales) {
        // Match /locale or /locale/...
        if (pathWithoutLocale === `/${loc}` || pathWithoutLocale.startsWith(`/${loc}/`)) {
          pathWithoutLocale = pathWithoutLocale.slice(`/${loc}`.length) || '/';
          break; // Only remove the first match
        }
      }
      
      // Normalize: if path is just '/', use empty string
      const normalizedPath = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
      
      // Build the new path
      const targetPath = `/${newLocale}${normalizedPath}`;
      
      // Use window.location for direct navigation to avoid any routing issues
      window.location.href = targetPath;
    });
  };

  const dropdownClasses = direction === 'up' 
    ? 'absolute right-0 bottom-full mb-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'
    : 'absolute right-0 top-full mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50';

  const defaultButtonClass = direction === 'up'
    ? 'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors'
    : 'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors';

  return (
    <div className="relative group">
      <button
        className={buttonClassName || defaultButtonClass}
        disabled={isPending}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>
      <div className={dropdownClasses}>
        <div className="py-1">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === loc ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              {loc === 'de' ? 'Deutsch' : loc === 'en' ? 'English' : 'Français'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

