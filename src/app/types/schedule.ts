// Types untuk aplikasi penjadwalan kuliah

export type UserRole = 'admin' | 'dosen' | 'mahasiswa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  building: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  lecturer: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  roomId: string;
  roomName: string;
  day: string; // Monday, Tuesday, etc
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  lecturer: string;
  hasConflict: boolean;
}

export interface ConflictInfo {
  scheduleId: string;
  conflictsWith: string[];
  reason: string;
}
