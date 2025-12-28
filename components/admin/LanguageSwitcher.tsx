'use client';

import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = currentLocale === 'en' ? 'fr' : 'en';
    // Replace the locale at the start of the pathname
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'fr')) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = '/' + segments.join('/');
    window.location.href = newPath;
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-[#233691] transition-colors cursor-pointer"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{currentLocale === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}
