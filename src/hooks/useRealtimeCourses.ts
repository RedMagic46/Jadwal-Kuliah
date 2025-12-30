import { useEffect, useState } from 'react';
import { getCourses } from '../lib/courseService';
import { Course } from '../app/types/schedule';

export const useRealtimeCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadCourses();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_courses') {
        loadCourses();
      }
    };

    // Listen for custom events in the same tab
    const handleLocalStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'app_courses') {
        loadCourses();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleLocalStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleLocalStorageChange as EventListener);
    };
  }, []);

  return { courses, loading, refresh: loadCourses };
};

