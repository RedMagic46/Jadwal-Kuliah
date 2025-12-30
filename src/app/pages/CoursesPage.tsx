import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
} from 'lucide-react';
import { Course } from '../types/schedule';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../lib/courseService';
import { toast } from 'sonner';
import { CourseModal } from '../components/CourseModal';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Gagal memuat data mata kuliah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
      return;
    }

    try {
      await deleteCourse(id);
      await loadCourses();
      toast.success('Mata kuliah berhasil dihapus');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Gagal menghapus mata kuliah');
    }
  };

  const handleSave = async (courseData: {
    code: string;
    name: string;
    credits: number;
    lecturer?: string;
  }) => {
    try {
      if (selectedCourse) {
        // Update
        await updateCourse(selectedCourse.id, courseData);
        toast.success('Mata kuliah berhasil diperbarui');
      } else {
        // Create
        await createCourse({
          code: courseData.code,
          name: courseData.name,
          credits: courseData.credits,
        });
        toast.success('Mata kuliah berhasil ditambahkan');
      }
      await loadCourses();
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(
        selectedCourse
          ? 'Gagal memperbarui mata kuliah'
          : 'Gagal menambahkan mata kuliah'
      );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.code.toLowerCase().includes(query) ||
      course.name.toLowerCase().includes(query) ||
      course.lecturer.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Mobile Title Section */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg text-gray-900">Mata Kuliah</h1>
        </div>
      </div>

      {/* Desktop/Tablet Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">
                Manajemen Mata Kuliah
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Kelola data mata kuliah
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Mata Kuliah
            </button>
          </div>
        </div>

        {/* Search and Add Button (Mobile) */}
        <div className="lg:hidden space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Mata Kuliah
          </button>
        </div>

        {/* Search (Desktop) */}
        <div className="hidden lg:block">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Courses List */}
        {!loading && (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery
                      ? 'Tidak ada mata kuliah yang ditemukan'
                      : 'Belum ada mata kuliah'}
                  </p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-blue-600">
                            {course.code}
                          </span>
                          <span className="text-xs text-gray-500">
                            {course.credits} SKS
                          </span>
                        </div>
                        <h3 className="text-base text-gray-900 mb-1">
                          {course.name}
                        </h3>
                        {course.lecturer && (
                          <p className="text-sm text-gray-600">
                            Dosen: {course.lecturer}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="flex-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery
                      ? 'Tidak ada mata kuliah yang ditemukan'
                      : 'Belum ada mata kuliah'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Kode
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Nama Mata Kuliah
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          SKS
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Dosen
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">
                            {course.code}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {course.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {course.credits}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {course.lecturer || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(course)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(course.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
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
              )}
            </div>
          </>
        )}

        {/* Course Modal */}
        {isModalOpen && (
          <CourseModal
            course={selectedCourse}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCourse(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

