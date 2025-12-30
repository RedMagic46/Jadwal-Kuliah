import { Course } from '../app/types/schedule';
import { mockCourses } from '../app/data/mockData';

const STORAGE_KEY = 'app_courses';

// Helper functions untuk localStorage
const getStoredCourses = (): Course[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading courses from localStorage:', error);
  }
  
  // Initialize dengan mock data jika belum ada
  const initialCourses = [...mockCourses];
  saveCourses(initialCourses);
  return initialCourses;
};

const saveCourses = (courses: Course[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error('Error saving courses to localStorage:', error);
    throw new Error('Gagal menyimpan data mata kuliah');
  }
};

export const getCourses = async (): Promise<Course[]> => {
  const courses = getStoredCourses();
  // Sort by code
  return courses.sort((a, b) => a.code.localeCompare(b.code));
};

export const createCourse = async (courseData: {
  code: string;
  name: string;
  credits: number;
  lecturerId?: string;
  semester?: number;
  description?: string;
}): Promise<Course> => {
  const courses = getStoredCourses();
  const newCourse: Course = {
    id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    code: courseData.code,
    name: courseData.name,
    credits: courseData.credits,
    lecturer: courseData.lecturerId || '', // For now, store lecturer name directly
  };
  
  courses.push(newCourse);
  saveCourses(courses);
  return newCourse;
};

export const updateCourse = async (
  id: string,
  updates: Partial<Course>
): Promise<Course> => {
  const courses = getStoredCourses();
  const index = courses.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error('Mata kuliah tidak ditemukan');
  }
  
  courses[index] = { ...courses[index], ...updates };
  saveCourses(courses);
  return courses[index];
};

export const deleteCourse = async (id: string): Promise<void> => {
  const courses = getStoredCourses();
  const filtered = courses.filter(c => c.id !== id);
  
  if (filtered.length === courses.length) {
    throw new Error('Mata kuliah tidak ditemukan');
  }
  
  saveCourses(filtered);
};


