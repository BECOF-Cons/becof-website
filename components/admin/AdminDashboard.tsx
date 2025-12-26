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
  };
}

export default function AdminDashboard({ user, stats, locale, translations }: AdminDashboardProps) {
  const statCards = [
    { 
      name: 'Total Posts', 
      value: stats.totalPosts.toString(), 
      icon: FileText, 
      color: 'bg-blue-600' 
    },
    { 
      name: 'Total Appointments', 
      value: stats.totalAppointments.toString(), 
      icon: Calendar, 
      color: 'bg-amber-600' 
    },
    { 
      name: 'Total Revenue', 
      value: `${stats.totalRevenue.toFixed(2)} DT`, 
      icon: TrendingUp, 
      color: 'bg-blue-500'
    },
    { 
      name: 'Active Users', 
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/blog/new"
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
              >
                <FileText className="h-8 w-8 text-blue-700" />
                <div>
                  <p className="font-medium text-gray-900">New Blog Post</p>
                  <p className="text-sm text-gray-500">Create content</p>
                </div>
              </Link>

              <Link
                href="/admin/appointments"
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-amber-600 hover:bg-amber-50 transition-all"
              >
                <Calendar className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">View Appointments</p>
                  <p className="text-sm text-gray-500">Manage bookings</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-500">Configure site</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Create your first blog post</p>
                  <p className="text-sm text-gray-600">Share orientation tips with students</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Configure payment settings</p>
                  <p className="text-sm text-gray-600">Setup Konnect, Flouci, or D17 accounts</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">Connect Google Calendar</p>
                  <p className="text-sm text-gray-600">Enable automatic appointment scheduling</p>
                </div>
              </li>
            </ul>
          </div>
    </AdminLayoutWrapper>
  );
}
