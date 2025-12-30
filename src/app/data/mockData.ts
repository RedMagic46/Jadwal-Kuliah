import { User, Room, Course, Schedule } from '../types/schedule';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin Sistem',
    email: 'admin@university.ac.id',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Dr. Budi Santoso',
    email: 'budi@university.ac.id',
    role: 'dosen',
  },
  {
    id: 'user-3',
    name: 'Ahmad Rizki',
    email: 'ahmad@university.ac.id',
    role: 'mahasiswa',
  },
];

// Mock Rooms
export const mockRooms: Room[] = [
  { id: 'room-1', name: 'A101', capacity: 40, building: 'Gedung A' },
  { id: 'room-2', name: 'A102', capacity: 40, building: 'Gedung A' },
  { id: 'room-3', name: 'B201', capacity: 50, building: 'Gedung B' },
  { id: 'room-4', name: 'B202', capacity: 50, building: 'Gedung B' },
  { id: 'room-5', name: 'C301', capacity: 30, building: 'Gedung C' },
  { id: 'room-6', name: 'Lab 1', capacity: 25, building: 'Gedung Lab' },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    code: 'CS101',
    name: 'Pemrograman Dasar',
    credits: 3,
    lecturer: 'Dr. Budi Santoso',
  },
  {
    id: 'course-2',
    code: 'CS102',
    name: 'Struktur Data',
    credits: 3,
    lecturer: 'Dr. Ani Widodo',
  },
  {
    id: 'course-3',
    code: 'CS201',
    name: 'Algoritma',
    credits: 3,
    lecturer: 'Dr. Citra Dewi',
  },
  {
    id: 'course-4',
    code: 'CS202',
    name: 'Basis Data',
    credits: 3,
    lecturer: 'Dr. Dedi Rahman',
  },
  {
    id: 'course-5',
    code: 'CS301',
    name: 'Sistem Operasi',
    credits: 3,
    lecturer: 'Dr. Eko Prasetyo',
  },
  {
    id: 'course-6',
    code: 'CS302',
    name: 'Jaringan Komputer',
    credits: 3,
    lecturer: 'Dr. Fitri Handayani',
  },
  {
    id: 'course-7',
    code: 'MTK101',
    name: 'Kalkulus I',
    credits: 3,
    lecturer: 'Dr. Gunawan',
  },
  {
    id: 'course-8',
    code: 'MTK102',
    name: 'Aljabar Linear',
    credits: 3,
    lecturer: 'Dr. Hani Sari',
  },
];

// Mock Schedules (dengan beberapa yang bentrok untuk demo)
// Menggunakan format waktu jam akademik UMM yang benar
export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    courseId: 'course-1',
    courseName: 'Pemrograman Dasar',
    courseCode: 'CS101',
    roomId: 'room-1',
    roomName: 'A101',
    day: 'Monday',
    startTime: '07:00', // Jam ke-1
    endTime: '09:30',   // Sampai jam ke-3 end (3 SKS = jam 1,2,3)
    lecturer: 'Dr. Budi Santoso',
    hasConflict: false,
  },
  {
    id: 'sch-2',
    courseId: 'course-2',
    courseName: 'Struktur Data',
    courseCode: 'CS102',
    roomId: 'room-2',
    roomName: 'A102',
    day: 'Monday',
    startTime: '07:00', // Jam ke-1
    endTime: '09:30',   // Sampai jam ke-3 end (3 SKS = jam 1,2,3)
    lecturer: 'Dr. Ani Widodo',
    hasConflict: true, // ❌ BENTROK: Waktu sama dengan sch-1
  },
  {
    id: 'sch-3',
    courseId: 'course-3',
    courseName: 'Algoritma',
    courseCode: 'CS201',
    roomId: 'room-2',
    roomName: 'A102',
    day: 'Monday',
    startTime: '09:30', // Jam ke-4
    endTime: '12:00',   // Sampai jam ke-6 end (3 SKS = jam 4,5,6)
    lecturer: 'Dr. Citra Dewi',
    hasConflict: false,
  },
  {
    id: 'sch-4',
    courseId: 'course-4',
    courseName: 'Basis Data',
    courseCode: 'CS202',
    roomId: 'room-3',
    roomName: 'B201',
    day: 'Tuesday',
    startTime: '07:00', // Jam ke-1
    endTime: '09:30',   // Sampai jam ke-3 end (3 SKS = jam 1,2,3)
    lecturer: 'Dr. Dedi Rahman',
    hasConflict: false,
  },
  {
    id: 'sch-5',
    courseId: 'course-5',
    courseName: 'Sistem Operasi',
    courseCode: 'CS301',
    roomId: 'room-4',
    roomName: 'B202',
    day: 'Tuesday',
    startTime: '07:50', // Jam ke-2
    endTime: '10:20',   // Sampai jam ke-4 end (3 SKS = jam 2,3,4)
    lecturer: 'Dr. Eko Prasetyo',
    hasConflict: true, // ❌ BENTROK: Waktu overlap dengan sch-4 (jam 2 dan 3)
  },
  {
    id: 'sch-6',
    courseId: 'course-6',
    courseName: 'Jaringan Komputer',
    courseCode: 'CS302',
    roomId: 'room-5',
    roomName: 'C301',
    day: 'Wednesday',
    startTime: '12:30', // Jam ke-7
    endTime: '15:00',   // Sampai jam ke-9 end (3 SKS = jam 7,8,9)
    lecturer: 'Dr. Fitri Handayani',
    hasConflict: false,
  },
];