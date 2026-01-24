'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    
    // Parse pathname and replace locale
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'fr')) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPathname = '/' + segments.join('/');
    
    window.location.href = newPathname;
  };

  return (
    <nav className="fixed top-0 z-50 w-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(26, 40, 112, 0.95), rgba(35, 54, 145, 0.95))'}}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity group">
            <div className="relative h-24 w-24 rounded-full flex-shrink-0 ring-2 ring-[#F9AA04] ring-offset-2 ring-offset-transparent overflow-visible -mb-2 bg-gradient-to-r from-[#1a2870] to-[#233691]">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src="/becof-logo-transparent.png"
                  alt="BECOF Logo"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#F9AA04] bg-clip-text text-transparent group-hover:from-[#F9AA04] group-hover:to-white transition-all">
                {tBrand('name')}
              </span>
              <span className="text-xs font-light text-[#F9AA04] tracking-widest">BE FUTURE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center lg:space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            {/* CTA Button */}
            <Link
              href={`/${locale}/appointment`}
              className="hidden md:inline-flex items-center rounded-full px-6 py-2 text-sm font-semibold text-[#233691] bg-[#F9AA04] shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {t('bookAppointment')}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden rounded-md p-2 text-white/80 hover:bg-white/10"
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
        <div className="lg:hidden bg-gradient-to-b from-[#233691] to-[#1a2870] border-t border-white/10">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={`/${locale}/appointment`}
              className="block rounded-lg px-3 py-2 text-center text-base font-semibold text-[#233691] bg-[#F9AA04] transition-all mt-3"
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
