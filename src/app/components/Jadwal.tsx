import React, { useState, useMemo } from 'react';
import { JadwalKuliah, MataKuliah, Ruangan, User } from '../types';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Plus, 
  Wand2, 
  AlertTriangle,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { 
  autoGenerateSchedule, 
  markConflicts,
  detectConflicts 
} from '../utils/scheduleAlgorithm';

interface JadwalProps {
  user: User;
  jadwalList: JadwalKuliah[];
  mataKuliah: MataKuliah[];
  ruangan: Ruangan[];
  onUpdateJadwal: (jadwalList: JadwalKuliah[]) => void;
}

type ViewMode = 'table' | 'calendar';

const DAYS: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'> = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function Jadwal({ user, jadwalList, mataKuliah, ruangan, onUpdateJadwal }: JadwalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JadwalKuliah>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Hitung konflik
  const conflictCount = useMemo(() => {
    return jadwalList.filter(j => j.hasConflict).length;
  }, [jadwalList]);

  // Handle Edit
  const handleEdit = (jadwal: JadwalKuliah) => {
    setEditingId(jadwal.id);
    setEditForm(jadwal);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm) return;

    const updatedList = jadwalList.map(j => 
      j.id === editingId ? { ...j, ...editForm } as JadwalKuliah : j
    );

    // Re-check conflicts
    const markedList = markConflicts(updatedList);
    onUpdateJadwal(markedList);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      const updatedList = jadwalList.filter(j => j.id !== id);
      const markedList = markConflicts(updatedList);
      onUpdateJadwal(markedList);
    }
  };

  // Handle Add New Schedule
  const handleAddNew = () => {
    setShowAddForm(true);
    setEditForm({
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      semester: 1,
      tahunAjaran: '2024/2025'
    });
  };

  const handleSaveNew = () => {
    if (!editForm.mataKuliahId || !editForm.ruanganId) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const selectedMatkul = mataKuliah.find(m => m.id === editForm.mataKuliahId);
    const selectedRuangan = ruangan.find(r => r.id === editForm.ruanganId);

    if (!selectedMatkul || !selectedRuangan) return;

    const newJadwal: JadwalKuliah = {
      id: `jadwal-${Date.now()}`,
      mataKuliahId: selectedMatkul.id,
      mataKuliahNama: selectedMatkul.nama,
      mataKuliahKode: selectedMatkul.kode,
      ruanganId: selectedRuangan.id,
      ruanganNama: selectedRuangan.nama,
      dosenId: selectedMatkul.dosenId,
      dosenNama: selectedMatkul.dosenNama,
      hari: editForm.hari as any,
      jamMulai: editForm.jamMulai!,
      jamSelesai: editForm.jamSelesai!,
      semester: editForm.semester!,
      tahunAjaran: editForm.tahunAjaran!,
      hasConflict: false
    };

    const updatedList = [...jadwalList, newJadwal];
    const markedList = markConflicts(updatedList);
    onUpdateJadwal(markedList);
    setShowAddForm(false);
    setEditForm({});
  };

  // Handle Auto Generate
  const handleAutoGenerate = () => {
    if (!confirm('Ini akan mengganti semua jadwal dengan jadwal otomatis. Lanjutkan?')) {
      return;
    }

    setIsGenerating(true);
    
    // Simulasi delay untuk UX
    setTimeout(() => {
      const newSchedule = autoGenerateSchedule(mataKuliah, ruangan, '2024/2025');
      const markedList = markConflicts(newSchedule);
      onUpdateJadwal(markedList);
      setIsGenerating(false);
      
      const conflicts = detectConflicts(markedList);
      if (conflicts.length === 0) {
        alert('✓ Jadwal berhasil di-generate tanpa konflik!');
      } else {
        alert(`⚠ Jadwal di-generate dengan ${conflicts.length} konflik. Mungkin perlu penyesuaian manual.`);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Manajemen Jadwal Kuliah</h1>
          <p className="text-gray-600">Kelola dan atur jadwal perkuliahan</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </button>
          
          <button
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Generate Otomatis
          </button>
        </div>
      </div>

      {/* Conflict Alert */}
      {conflictCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">
              <span className="font-semibold">{conflictCount} jadwal bentrok</span> terdeteksi. 
              Gunakan tombol "Generate Otomatis" atau edit manual.
            </p>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-md transition ${
            viewMode === 'table' 
              ? 'bg-white text-gray-900 shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tabel
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-md transition ${
            viewMode === 'calendar' 
              ? 'bg-white text-gray-900 shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Kalender
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-gray-900">
                {showAddForm ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setEditForm({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Mata Kuliah</label>
                <select
                  value={editForm.mataKuliahId || ''}
                  onChange={(e) => {
                    const matkul = mataKuliah.find(m => m.id === e.target.value);
                    if (matkul) {
                      setEditForm({
                        ...editForm,
                        mataKuliahId: matkul.id,
                        mataKuliahNama: matkul.nama,
                        mataKuliahKode: matkul.kode,
                        dosenId: matkul.dosenId,
                        dosenNama: matkul.dosenNama
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Pilih Mata Kuliah</option>
                  {mataKuliah.map(mk => (
                    <option key={mk.id} value={mk.id}>
                      {mk.kode} - {mk.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">Ruangan</label>
                <select
                  value={editForm.ruanganId || ''}
                  onChange={(e) => {
                    const room = ruangan.find(r => r.id === e.target.value);
                    if (room) {
                      setEditForm({
                        ...editForm,
                        ruanganId: room.id,
                        ruanganNama: room.nama
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Pilih Ruangan</option>
                  {ruangan.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.kode} - {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Hari</label>
                  <select
                    value={editForm.hari || 'Senin'}
                    onChange={(e) => setEditForm({ ...editForm, hari: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editForm.semester || 1}
                    onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Jam Mulai</label>
                  <input
                    type="time"
                    value={editForm.jamMulai || '08:00'}
                    onChange={(e) => setEditForm({ ...editForm, jamMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700">Jam Selesai</label>
                  <input
                    type="time"
                    value={editForm.jamSelesai || '10:00'}
                    onChange={(e) => setEditForm({ ...editForm, jamSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={showAddForm ? handleSaveNew : handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    handleCancelEdit();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <TableView 
          jadwalList={jadwalList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <CalendarView jadwalList={jadwalList} />
      )}
    </div>
  );
}

// Table View Component
function TableView({ 
  jadwalList, 
  onEdit, 
  onDelete 
}: { 
  jadwalList: JadwalKuliah[];
  onEdit: (jadwal: JadwalKuliah) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Kode</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Mata Kuliah</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Dosen</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Hari</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Waktu</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Ruangan</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jadwalList.map((jadwal) => (
              <tr 
                key={jadwal.id}
                className={`hover:bg-gray-50 transition ${
                  jadwal.hasConflict ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{jadwal.mataKuliahKode}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{jadwal.mataKuliahNama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{jadwal.dosenNama}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{jadwal.hari}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{jadwal.ruanganNama}</td>
                <td className="px-4 py-3">
                  {jadwal.hasConflict ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      Bentrok
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      OK
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(jadwal)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(jadwal.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {jadwalList.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-2" />
          <p>Belum ada jadwal. Tambahkan jadwal baru atau gunakan Generate Otomatis.</p>
        </div>
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ jadwalList }: { jadwalList: JadwalKuliah[] }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-sm text-gray-600 w-24">
              Waktu
            </th>
            {DAYS.map(day => (
              <th key={day} className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((time) => (
            <tr key={time}>
              <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600 bg-gray-50">
                {time}
              </td>
              {DAYS.map(day => {
                const schedules = jadwalList.filter(j => 
                  j.hari === day && j.jamMulai === time
                );
                
                return (
                  <td key={day} className="border border-gray-200 px-2 py-2 align-top">
                    {schedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className={`p-2 rounded mb-1 text-xs ${
                          schedule.hasConflict
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-blue-100 border border-blue-300'
                        }`}
                      >
                        <p className="text-gray-900 mb-1">
                          {schedule.mataKuliahKode}
                        </p>
                        <p className="text-gray-600">{schedule.ruanganNama}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {schedule.jamMulai}-{schedule.jamSelesai}
                        </p>
                        {schedule.hasConflict && (
                          <div className="flex items-center gap-1 mt-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Bentrok</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
