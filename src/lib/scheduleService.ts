import { Schedule } from '../app/types/schedule';
import { mockSchedules } from '../app/data/mockData';
import { getCourses } from './courseService';
import { getRooms } from './roomService';
import { triggerStorageEvent } from './storageEvents';

const STORAGE_KEY = 'app_schedules';

// Helper functions untuk localStorage
const getStoredSchedules = (): Schedule[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading schedules from localStorage:', error);
  }
  
  // Initialize dengan mock data jika belum ada
  const initialSchedules = [...mockSchedules];
  saveSchedules(initialSchedules);
  return initialSchedules;
};

const saveSchedules = (schedules: Schedule[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    triggerStorageEvent(STORAGE_KEY);
  } catch (error) {
    console.error('Error saving schedules to localStorage:', error);
    throw new Error('Gagal menyimpan data jadwal');
  }
};

// Helper untuk mendapatkan course dan room info
const enrichSchedule = async (schedule: Schedule): Promise<Schedule> => {
  const courses = await getCourses();
  const rooms = await getRooms();
  
  const course = courses.find(c => c.id === schedule.courseId);
  const room = rooms.find(r => r.id === schedule.roomId);
  
  return {
    ...schedule,
    courseName: course?.name || schedule.courseName,
    courseCode: course?.code || schedule.courseCode,
    roomName: room?.name || schedule.roomName,
    lecturer: course?.lecturer || schedule.lecturer,
  };
};

export const getSchedules = async (): Promise<Schedule[]> => {
  const schedules = getStoredSchedules();
  
  // Enrich dengan course dan room info
  const enrichedSchedules = await Promise.all(
    schedules.map(s => enrichSchedule(s))
  );
  
  // Sort by day, then by start time
  return enrichedSchedules.sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayCompare = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    if (dayCompare !== 0) return dayCompare;
    return a.startTime.localeCompare(b.startTime);
  });
};

export const createSchedule = async (scheduleData: {
  courseId: string;
  roomId: string;
  day: string;
  startTime: string;
  endTime: string;
  semester?: string;
  academicYear?: string;
}): Promise<Schedule> => {
  const schedules = getStoredSchedules();
  const courses = await getCourses();
  const rooms = await getRooms();
  
  const course = courses.find(c => c.id === scheduleData.courseId);
  const room = rooms.find(r => r.id === scheduleData.roomId);
  
  if (!course) {
    throw new Error('Mata kuliah tidak ditemukan');
  }
  if (!room) {
    throw new Error('Ruangan tidak ditemukan');
  }
  
  const newSchedule: Schedule = {
    id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courseId: scheduleData.courseId,
    courseName: course.name,
    courseCode: course.code,
    roomId: scheduleData.roomId,
    roomName: room.name,
    day: scheduleData.day,
    startTime: scheduleData.startTime,
    endTime: scheduleData.endTime,
    lecturer: course.lecturer,
    hasConflict: false, // Will be detected later
  };
  
  schedules.push(newSchedule);
  saveSchedules(schedules);
  return newSchedule;
};

export const updateSchedule = async (
  id: string,
  updates: Partial<Schedule>
): Promise<Schedule> => {
  const schedules = getStoredSchedules();
  const index = schedules.findIndex(s => s.id === id);
  
  if (index === -1) {
    throw new Error('Jadwal tidak ditemukan');
  }
  
  // Jika roomId atau courseId diubah, perlu update nama juga
  let updatedSchedule = { ...schedules[index], ...updates };
  
  if (updates.roomId) {
    const rooms = await getRooms();
    const room = rooms.find(r => r.id === updates.roomId);
    if (room) {
      updatedSchedule.roomName = room.name;
    }
  }
  
  if (updates.courseId) {
    const courses = await getCourses();
    const course = courses.find(c => c.id === updates.courseId);
    if (course) {
      updatedSchedule.courseName = course.name;
      updatedSchedule.courseCode = course.code;
      updatedSchedule.lecturer = course.lecturer;
    }
  }
  
  schedules[index] = updatedSchedule;
  saveSchedules(schedules);
  return updatedSchedule;
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const schedules = getStoredSchedules();
  const filtered = schedules.filter(s => s.id !== id);
  
  if (filtered.length === schedules.length) {
    throw new Error('Jadwal tidak ditemukan');
  }
  
  saveSchedules(filtered);
};

export const detectConflictsRPC = async () => {
  // This function is not needed for localStorage implementation
  // Conflicts are detected in the frontend using detectConflicts function
  return [];
};


