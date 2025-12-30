import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  AlertTriangle,
  BookOpen,
  Clock,
  TrendingUp,
  LogOut,
  ArrowRight,
  RefreshCw,
  FileText,
  Users,
} from 'lucide-react';
import { detectConflicts, markConflicts } from '../utils/scheduleAlgorithm';
import { useNavigate } from 'react-router-dom';
import { useRealtimeSchedules } from '../../hooks/useRealtimeSchedules';
import { useRealtimeCourses } from '../../hooks/useRealtimeCourses';
import { useRealtimeRooms } from '../../hooks/useRealtimeRooms';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Load data dari localStorage
  const { schedules, loading: schedulesLoading } = useRealtimeSchedules();
  const { courses, loading: coursesLoading } = useRealtimeCourses();
  const { rooms, loading: roomsLoading } = useRealtimeRooms();

  // Mark conflicts dan hitung statistik
  const markedSchedules = useMemo(() => {
    if (schedules.length === 0) return [];
    return markConflicts(schedules);
  }, [schedules]);

  const conflicts = useMemo(() => {
    return detectConflicts(markedSchedules);
  }, [markedSchedules]);

  const stats = useMemo(() => {
    return {
      totalSchedules: markedSchedules.length,
      conflictSchedules: conflicts.length,
      totalCourses: courses.length,
      totalRooms: rooms.length,
    };
  }, [markedSchedules, conflicts, courses, rooms]);

  const loading = schedulesLoading || coursesLoading || roomsLoading;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden on mobile (uses Layout header), visible on desktop */}
      <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl text-gray-900">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Selamat datang, {user?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Title - Only on mobile */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <h2 className="text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Selamat datang, {user?.name}</p>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!loading && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Jadwal
                </p>
                <p className="text-2xl sm:text-3xl text-gray-900">
                  {stats.totalSchedules}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Jadwal Bentrok
                </p>
                <p className="text-2xl sm:text-3xl text-red-600">
                  {stats.conflictSchedules}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Mata Kuliah
                </p>
                <p className="text-2xl sm:text-3xl text-gray-900">
                  {stats.totalCourses}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Ruangan
                </p>
                <p className="text-2xl sm:text-3xl text-gray-900">
                  {stats.totalRooms}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Alert */}
        {stats.conflictSchedules > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base sm:text-lg text-red-900 mb-1">
                    Peringatan Bentrok Jadwal
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700">
                    Terdapat {stats.conflictSchedules} jadwal yang bentrok. Segera
                    lakukan perbaikan untuk menghindari konflik.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/schedule')}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                Lihat Jadwal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/schedule')}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
              Kelola Jadwal
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Lihat, edit, dan kelola semua jadwal kuliah
            </p>
          </button>

          <button
            onClick={() => navigate('/schedule')}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
              Generate Otomatis
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Buat jadwal otomatis tanpa bentrok
            </p>
          </button>

          <button className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
              Laporan
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Export dan lihat laporan jadwal
            </p>
          </button>
        </div>
        </>
        )}
      </main>
    </div>
  );
};