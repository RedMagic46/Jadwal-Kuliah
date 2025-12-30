import { supabase } from './supabase';
import { Schedule } from '../app/types/schedule';

// Transform Supabase schedule to frontend format
const transformSchedule = (schedule: any): Schedule => {
  return {
    id: schedule.id,
    courseId: schedule.course_id,
    courseName: schedule.courses?.name || '',
    courseCode: schedule.courses?.code || '',
    roomId: schedule.room_id,
    roomName: schedule.rooms?.name || '',
    day: schedule.day,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    lecturer: schedule.courses?.lecturer?.name || schedule.courses?.lecturer_name || '',
    hasConflict: schedule.has_conflict || false,
  };
};

export const getSchedules = async (): Promise<Schedule[]> => {
  const { data, error } = await supabase
    .from('schedules')
    .select(
      `
      *,
      courses (
        code,
        name,
        lecturer:users!courses_lecturer_id_fkey(name)
      ),
      rooms (
        name,
        building
      )
    `
    )
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  return data.map(transformSchedule);
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
  const { data, error } = await supabase
    .from('schedules')
    .insert({
      course_id: scheduleData.courseId,
      room_id: scheduleData.roomId,
      day: scheduleData.day,
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      semester: scheduleData.semester,
      academic_year: scheduleData.academicYear,
    })
    .select(
      `
      *,
      courses (
        code,
        name,
        lecturer:users!courses_lecturer_id_fkey(name)
      ),
      rooms (
        name,
        building
      )
    `
    )
    .single();

  if (error) throw error;

  return transformSchedule(data);
};

export const updateSchedule = async (
  id: string,
  updates: Partial<Schedule>
): Promise<Schedule> => {
  const updateData: any = {};

  if (updates.day) updateData.day = updates.day;
  if (updates.startTime) updateData.start_time = updates.startTime;
  if (updates.endTime) updateData.end_time = updates.endTime;
  if (updates.roomId) updateData.room_id = updates.roomId;

  const { data, error } = await supabase
    .from('schedules')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      courses (
        code,
        name,
        lecturer:users!courses_lecturer_id_fkey(name)
      ),
      rooms (
        name,
        building
      )
    `
    )
    .single();

  if (error) throw error;

  return transformSchedule(data);
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const { error } = await supabase.from('schedules').delete().eq('id', id);

  if (error) throw error;
};

export const detectConflictsRPC = async () => {
  const { data, error } = await supabase.rpc('detect_schedule_conflicts');

  if (error) throw error;
  return data;
};


