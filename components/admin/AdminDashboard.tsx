'use client';

import Link from 'next/link';
import AdminLayoutWrapper from './AdminLayoutWrapper';
import {
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  stats: {
    totalAppointments: number;
    totalRevenue: number;
    totalUsers: number;
    totalPosts: number;
  };
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
    dashboard: {
      stats: {
        totalPosts: string;
        totalAppointments: string;
        totalRevenue: string;
        activeUsers: string;
      };
      quickActions: {
        title: string;
        newPost: string;
        newPostDesc: string;
        viewAppointments: string;
        viewAppointmentsDesc: string;
        settings: string;
        settingsDesc: string;
      };
      gettingStarted: {
        title: string;
        step1Title: string;
        step1Desc: string;
        step2Title: string;
        step2Desc: string;
        step3Title: string;
        step3Desc: string;
      };
    };
  };
}

export default function AdminDashboard({ user, stats, locale, translations }: AdminDashboardProps) {
  const statCards = [
    { 
      name: translations.dashboard.stats.totalPosts, 
      value: stats.totalPosts.toString(), 
      icon: FileText, 
      color: 'bg-blue-600' 
    },
    { 
      name: translations.dashboard.stats.totalAppointments, 
      value: stats.totalAppointments.toString(), 
      icon: Calendar, 
      color: 'bg-amber-600' 
    },
    { 
      name: translations.dashboard.stats.totalRevenue, 
      value: `${stats.totalRevenue.toFixed(2)} DT`, 
      icon: TrendingUp, 
      color: 'bg-blue-500'
    },
    { 
      name: translations.dashboard.stats.activeUsers, 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      color: 'bg-blue-500' 
    },
  ];

  return (
    <AdminLayoutWrapper user={user} title={translations.nav.dashboard} locale={locale} translations={translations}>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.dashboard.quickActions.title}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={`/${locale}/admin/blog/new`}
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg transition-all"
                style={{'--hover-border': '#233691', '--hover-bg': 'rgba(35, 54, 145, 0.05)'} as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#233691';
                  e.currentTarget.style.backgroundColor = 'rgba(35, 54, 145, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <FileText className="h-8 w-8" style={{color: '#233691'}} />
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.quickActions.newPost}</p>
                  <p className="text-sm text-gray-500">{translations.dashboard.quickActions.newPostDesc}</p>
                </div>
              </Link>

              <Link
                href={`/${locale}/admin/appointments`}
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F9AA04';
                  e.currentTarget.style.backgroundColor = 'rgba(249, 170, 4, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Calendar className="h-8 w-8" style={{color: '#F9AA04'}} />
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.quickActions.viewAppointments}</p>
                  <p className="text-sm text-gray-500">{translations.dashboard.quickActions.viewAppointmentsDesc}</p>
                </div>
              </Link>

              <Link
                href={`/${locale}/admin/settings`}
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#233691';
                  e.currentTarget.style.backgroundColor = 'rgba(35, 54, 145, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Settings className="h-8 w-8" style={{color: '#233691'}} />
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.quickActions.settings}</p>
                  <p className="text-sm text-gray-500">{translations.dashboard.quickActions.settingsDesc}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.dashboard.gettingStarted.title}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.gettingStarted.step1Title}</p>
                  <p className="text-sm text-gray-600">{translations.dashboard.gettingStarted.step1Desc}</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.gettingStarted.step2Title}</p>
                  <p className="text-sm text-gray-600">{translations.dashboard.gettingStarted.step2Desc}</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">{translations.dashboard.gettingStarted.step3Title}</p>
                  <p className="text-sm text-gray-600">{translations.dashboard.gettingStarted.step3Desc}</p>
                </div>
              </li>
            </ul>
          </div>
    </AdminLayoutWrapper>
  );
}
