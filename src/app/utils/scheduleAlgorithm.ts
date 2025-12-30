import { Schedule, ConflictInfo } from '../types/schedule';

/**
 * ALGORITMA DETEKSI BENTROK JADWAL
 * 
 * Pseudocode:
 * 1. Untuk setiap jadwal yang akan dicek:
 *    a. Ambil hari, waktu mulai, waktu selesai
 *    b. Loop semua jadwal lain
 *    c. Jika hari sama DAN waktu overlap:
 *       - BENTROK! (tidak peduli ruangan berbeda)
 *       - Karena mahasiswa/dosen tidak bisa di 2 tempat bersamaan
 * 2. Return daftar bentrok
 */

export const detectConflicts = (schedules: Schedule[]): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];

  schedules.forEach((schedule, index) => {
    const conflictsWith: string[] = [];

    // Cek dengan jadwal lainnya
    schedules.forEach((otherSchedule, otherIndex) => {
      if (index === otherIndex) return;

      // Harus hari yang sama
      if (schedule.day !== otherSchedule.day) return;

      // Cek overlap waktu
      const start1 = timeToMinutes(schedule.startTime);
      const end1 = timeToMinutes(schedule.endTime);
      const start2 = timeToMinutes(otherSchedule.startTime);
      const end2 = timeToMinutes(otherSchedule.endTime);

      const hasTimeOverlap = start1 < end2 && end1 > start2;

      // BENTROK jika waktu overlap (tidak peduli ruangan berbeda!)
      // Karena mahasiswa/dosen tidak bisa berada di 2 tempat sekaligus
      if (hasTimeOverlap) {
        conflictsWith.push(otherSchedule.id);
      }
    });

    if (conflictsWith.length > 0) {
      conflicts.push({
        scheduleId: schedule.id,
        conflictsWith: Array.from(new Set(conflictsWith)), // Remove duplicates
        reason: `Bentrok waktu dengan ${conflictsWith.length} jadwal lain`,
      });
    }
  });

  return conflicts;
};

/**
 * AUTO-GENERATE JADWAL
 * 
 * Pseudocode:
 * 1. Ambil semua mata kuliah yang perlu dijadwalkan
 * 2. Tentukan slot waktu yang tersedia (misal: 07:00-17:00)
 * 3. Bagi slot waktu menjadi interval (misal: 2 jam per sesi)
 * 4. Untuk setiap mata kuliah:
 *    a. Loop setiap hari kerja (Senin-Jumat)
 *    b. Loop setiap slot waktu
 *    c. Loop setiap ruangan
 *    d. Cek apakah slot tersebut kosong (tidak bentrok)
 *    e. Jika kosong, assign jadwal ke slot tersebut
 *    f. Break loop dan lanjut ke mata kuliah berikutnya
 * 5. Return jadwal yang sudah di-generate
 */

interface GenerateScheduleParams {
  courses: { id: string; name: string; code: string; lecturer: string }[];
  rooms: { id: string; name: string }[];
  existingSchedules?: Schedule[];
}

export const generateSchedule = ({
  courses,
  rooms,
  existingSchedules = [],
}: GenerateScheduleParams): Schedule[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '07:00', end: '07:50' },  // Jam 1
    { start: '07:50', end: '08:40' },  // Jam 2
    { start: '08:40', end: '09:30' },  // Jam 3
    { start: '09:30', end: '10:20' },  // Jam 4
    { start: '10:20', end: '11:10' },  // Jam 5
    { start: '11:10', end: '12:00' },  // Jam 6
    { start: '12:30', end: '13:20' },  // Jam 7 (setelah istirahat)
    { start: '13:20', end: '14:10' },  // Jam 8
    { start: '14:10', end: '15:00' },  // Jam 9
    { start: '15:30', end: '16:20' },  // Jam 10 (setelah istirahat)
    { start: '16:20', end: '17:10' },  // Jam 11
    { start: '18:15', end: '19:05' },  // Jam 12 (kelas malam)
    { start: '19:05', end: '19:55' },  // Jam 13
    { start: '19:55', end: '20:45' },  // Jam 14
  ];

  const generatedSchedules: Schedule[] = [...existingSchedules];

  courses.forEach((course) => {
    let assigned = false;

    // Loop hari
    for (const day of days) {
      if (assigned) break;

      // Loop slot waktu
      for (const slot of timeSlots) {
        if (assigned) break;

        // Loop ruangan
        for (const room of rooms) {
          // Cek apakah slot waktu ini sudah terpakai
          // BENTROK jika ada jadwal lain di hari dan waktu yang sama
          // (tidak peduli ruangan berbeda)
          const hasConflict = generatedSchedules.some((schedule) => {
            // Harus di hari yang sama
            if (schedule.day !== day) return false;

            // Cek overlap waktu - BENTROK jika waktu overlap!
            return timeOverlap(
              schedule.startTime,
              schedule.endTime,
              slot.start,
              slot.end
            );
          });

          if (!hasConflict) {
            // Assign jadwal
            generatedSchedules.push({
              id: `schedule-${Date.now()}-${Math.random()}`,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              roomId: room.id,
              roomName: room.name,
              day,
              startTime: slot.start,
              endTime: slot.end,
              lecturer: course.lecturer,
              hasConflict: false,
            });
            assigned = true;
            break;
          }
        }
      }
    }

    // Log jika ada course yang tidak bisa di-assign
    if (!assigned) {
      console.warn(`Warning: Could not assign ${course.name} (${course.code})`);
    }
  });

  return generatedSchedules;
};

// Helper functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const timeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
};

// Mark schedules dengan conflict
export const markConflicts = (schedules: Schedule[]): Schedule[] => {
  const conflicts = detectConflicts(schedules);
  const conflictIds = new Set(conflicts.map((c) => c.scheduleId));

  return schedules.map((schedule) => ({
    ...schedule,
    hasConflict: conflictIds.has(schedule.id),
  }));
};