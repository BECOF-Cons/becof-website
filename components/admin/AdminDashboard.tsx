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
}

export default function AdminDashboard({ user, stats }: AdminDashboardProps) {
  const statCards = [
    { 
      name: 'Total Posts', 
      value: stats.totalPosts.toString(), 
      icon: FileText, 
      color: 'bg-indigo-500' 
    },
    { 
      name: 'Appointments', 
      value: stats.totalAppointments.toString(), 
      icon: Calendar, 
      color: 'bg-purple-500' 
    },
    { 
      name: 'Total Revenue', 
      value: `${stats.totalRevenue.toLocaleString()} TND`, 
      icon: TrendingUp, 
      color: 'bg-pink-500' 
    },
    { 
      name: 'Active Users', 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      color: 'bg-blue-500' 
    },
  ];

  return (
    <AdminLayoutWrapper user={user} title="Dashboard">
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
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <FileText className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">New Blog Post</p>
                  <p className="text-sm text-gray-500">Create content</p>
                </div>
              </Link>

              <Link
                href="/admin/appointments"
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">View Appointments</p>
                  <p className="text-sm text-gray-500">Manage bookings</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all"
              >
                <Settings className="h-8 w-8 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-sm text-gray-500">Configure site</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Create your first blog post</p>
                  <p className="text-sm text-gray-600">Share orientation tips with students</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-600 text-white text-sm font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Configure payment settings</p>
                  <p className="text-sm text-gray-600">Setup Konnect, Flouci, or D17 accounts</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-pink-600 text-white text-sm font-semibold">
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
