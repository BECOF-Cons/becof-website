'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = currentLocale === 'en' ? 'fr' : 'en';
    // Replace the locale in the pathname
    const newPath = pathname.replace(`/${currentLocale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{currentLocale === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}
