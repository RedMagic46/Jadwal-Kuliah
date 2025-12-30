// Type Definitions untuk Aplikasi Penjadwalan Kuliah

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'dosen' | 'mahasiswa';
}

export interface Ruangan {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  gedung: string;
}

export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  dosenId: string;
  dosenNama: string;
}

export interface JadwalKuliah {
  id: string;
  mataKuliahId: string;
  mataKuliahNama: string;
  mataKuliahKode: string;
  ruanganId: string;
  ruanganNama: string;
  dosenId: string;
  dosenNama: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamMulai: string; // Format: "08:00"
  jamSelesai: string; // Format: "10:00"
  semester: number;
  tahunAjaran: string;
  hasConflict?: boolean;
  conflictType?: 'ruangan' | 'dosen' | 'both';
}

export interface ConflictInfo {
  jadwalId: string;
  conflictsWith: string[];
  type: 'ruangan' | 'dosen' | 'both';
}

export interface DashboardStats {
  totalMataKuliah: number;
  totalJadwal: number;
  totalConflicts: number;
  totalRuangan: number;
}
