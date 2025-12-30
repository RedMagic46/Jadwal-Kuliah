import React, { useMemo } from 'react';
import { User, JadwalKuliah, MataKuliah, Ruangan, DashboardStats } from '../types';
import { 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  DoorOpen,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  user: User;
  jadwalList: JadwalKuliah[];
  mataKuliah: MataKuliah[];
  ruangan: Ruangan[];
}

export function Dashboard({ user, jadwalList, mataKuliah, ruangan }: DashboardProps) {
  // Hitung statistik
  const stats: DashboardStats = useMemo(() => {
    const totalConflicts = jadwalList.filter(j => j.hasConflict).length;
    
    return {
      totalMataKuliah: mataKuliah.length,
      totalJadwal: jadwalList.length,
      totalConflicts,
      totalRuangan: ruangan.length
    };
  }, [jadwalList, mataKuliah, ruangan]);

  // Jadwal dengan konflik
  const conflictedSchedules = useMemo(() => {
    return jadwalList.filter(j => j.hasConflict);
  }, [jadwalList]);

  // Jadwal hari ini (untuk demo, ambil jadwal Senin)
  const todaySchedules = useMemo(() => {
    return jadwalList.filter(j => j.hari === 'Senin').slice(0, 5);
  }, [jadwalList]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl mb-2">Selamat Datang, {user.name}!</h1>
        <p className="text-blue-100">
          Role: <span className="px-2 py-1 bg-white/20 rounded">{user.role.toUpperCase()}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Mata Kuliah</p>
              <p className="text-3xl text-gray-900">{stats.totalMataKuliah}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Jadwal</p>
              <p className="text-3xl text-gray-900">{stats.totalJadwal}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Jadwal Bentrok</p>
              <p className="text-3xl text-gray-900">{stats.totalConflicts}</p>
            </div>
            <div className={`p-3 rounded-lg ${stats.totalConflicts > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              {stats.totalConflicts > 0 ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Ruangan</p>
              <p className="text-3xl text-gray-900">{stats.totalRuangan}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DoorOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Konflik */}
      {stats.totalConflicts > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-red-800 mb-1">Peringatan: Jadwal Bentrok Terdeteksi!</h3>
              <p className="text-red-700 text-sm">
                Terdapat {stats.totalConflicts} jadwal yang bentrok. Segera perbaiki atau gunakan fitur 
                <span className="font-semibold"> "Generate Otomatis"</span> untuk menyusun ulang.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jadwal Bentrok */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl text-gray-900">Jadwal Bentrok</h2>
          </div>
          
          {conflictedSchedules.length > 0 ? (
            <div className="space-y-3">
              {conflictedSchedules.map((jadwal) => (
                <div key={jadwal.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">
                        {jadwal.mataKuliahKode} - {jadwal.mataKuliahNama}
                      </p>
                      <p className="text-sm text-gray-600">
                        {jadwal.hari}, {jadwal.jamMulai} - {jadwal.jamSelesai}
                      </p>
                      <p className="text-sm text-gray-600">{jadwal.ruanganNama}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                      {jadwal.conflictType === 'ruangan' ? 'Ruangan' : 
                       jadwal.conflictType === 'dosen' ? 'Dosen' : 'Keduanya'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>Tidak ada jadwal bentrok</p>
            </div>
          )}
        </div>

        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl text-gray-900">Jadwal Terkini</h2>
          </div>
          
          {todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((jadwal) => (
                <div 
                  key={jadwal.id} 
                  className={`rounded-lg p-3 border ${
                    jadwal.hasConflict 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">
                        {jadwal.mataKuliahKode} - {jadwal.mataKuliahNama}
                      </p>
                      <p className="text-sm text-gray-600">
                        {jadwal.hari}, {jadwal.jamMulai} - {jadwal.jamSelesai}
                      </p>
                      <p className="text-sm text-gray-600">
                        {jadwal.ruanganNama} • {jadwal.dosenNama}
                      </p>
                    </div>
                    {jadwal.hasConflict && (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p>Tidak ada jadwal</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h3 className="text-gray-900 mb-2">Tips Penggunaan</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Gunakan halaman <span className="font-semibold">Jadwal</span> untuk melihat detail lengkap</li>
              <li>• Klik tombol <span className="font-semibold">Edit</span> untuk mengubah waktu secara manual</li>
              <li>• Gunakan <span className="font-semibold">Generate Otomatis</span> untuk menyusun jadwal tanpa bentrok</li>
              <li>• Jadwal dengan indikator merah menandakan adanya konflik</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
