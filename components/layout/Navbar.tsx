'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('blog'), href: `/${locale}/blog` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  const switchLocale = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    
    // Handle both with and without locale prefix in pathname
    let newPathname;
    if (pathname.startsWith(`/${locale}`)) {
      // Replace existing locale
      newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    } else if (pathname === '/' || pathname === '') {
      // Root path - add locale
      newPathname = `/${newLocale}`;
    } else {
      // Path without locale - prepend new locale
      newPathname = `/${newLocale}${pathname}`;
    }
    
    window.location.href = newPathname;
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="text-3xl font-bold" style={{color: '#233691'}}>
              {tBrand('name')}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-[#233691] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-[#233691] transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            {/* CTA Button */}
            <Link
              href={`/${locale}/appointment`}
              className="hidden md:inline-flex items-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
            >
              {t('bookAppointment')}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#233691]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={`/${locale}/appointment`}
              className="block rounded-md px-3 py-2 text-center text-base font-semibold text-white transition-colors"
              style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('bookAppointment')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
