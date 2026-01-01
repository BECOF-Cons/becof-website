'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Users,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
  title?: string;
  locale: string;
  translations: {
    nav: {
      dashboard: string;
      blogPosts: string;
      appointments: string;
      payments: string;
      servicePricing: string;
      adminManagement: string;
      settings: string;
    };
    welcome: string;
    signOut: string;
    title: string;
  };
}

export default function AdminLayoutWrapper({ children, user, title, locale, translations }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: translations.nav.dashboard, href: `/${locale}/admin`, icon: LayoutDashboard },
    { name: translations.nav.blogPosts, href: `/${locale}/admin/blog`, icon: FileText },
    { name: locale === 'fr' ? 'Équipe' : 'Team', href: `/${locale}/admin/team`, icon: Users },
    { name: translations.nav.appointments, href: `/${locale}/admin/appointments`, icon: Calendar },
    { name: translations.nav.payments, href: `/${locale}/admin/payments`, icon: CreditCard },
    { name: translations.nav.servicePricing, href: `/${locale}/admin/pricing`, icon: DollarSign },
    { name: translations.nav.settings, href: `/${locale}/admin/settings`, icon: Settings },
  ];

  // Add admin management for super admins
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  if (isSuperAdmin) {
    navigation.splice(6, 0, { name: translations.nav.adminManagement, href: `/${locale}/admin/users`, icon: Users });
  }

  // Get page title from pathname if not provided
  const pageTitle = title || navigation.find(item => item.href === pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link href={`/${locale}/admin`} className="text-2xl font-bold" style={{color: '#233691'}}>
              BECOF {translations.title}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive ? {backgroundColor: 'rgba(35, 54, 145, 0.1)', color: '#233691'} : {}}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{backgroundColor: '#233691'}}>
                {user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{translations.signOut}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex flex-1 justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{pageTitle}</h2>
            <div className="flex items-center gap-x-4">
              <LanguageSwitcher currentLocale={locale} />
              <span className="text-sm text-gray-500 hidden sm:block">
                {translations.welcome}, {user?.name || 'Admin'}!
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
