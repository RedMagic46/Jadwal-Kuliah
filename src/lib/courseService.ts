import { supabase } from './supabase';
import { Course } from '../app/types/schedule';

const transformCourse = (course: any): Course => {
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    credits: course.credits,
    lecturer: course.lecturer?.name || course.lecturer_name || '',
  };
};

export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      lecturer:users!courses_lecturer_id_fkey(name)
    `
    )
    .order('code', { ascending: true });

  if (error) throw error;

  return data.map(transformCourse);
};

export const createCourse = async (courseData: {
  code: string;
  name: string;
  credits: number;
  lecturerId?: string;
  semester?: number;
  description?: string;
}): Promise<Course> => {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      code: courseData.code,
      name: courseData.name,
      credits: courseData.credits,
      lecturer_id: courseData.lecturerId || null,
      semester: courseData.semester,
      description: courseData.description,
    })
    .select(
      `
      *,
      lecturer:users!courses_lecturer_id_fkey(name)
    `
    )
    .single();

  if (error) throw error;

  return transformCourse(data);
};

export const updateCourse = async (
  id: string,
  updates: Partial<Course>
): Promise<Course> => {
  const updateData: any = {};

  if (updates.code) updateData.code = updates.code;
  if (updates.name) updateData.name = updates.name;
  if (updates.credits !== undefined) updateData.credits = updates.credits;
  // Note: lecturer update would need lecturer_id, not lecturer name

  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      lecturer:users!courses_lecturer_id_fkey(name)
    `
    )
    .single();

  if (error) throw error;

  return transformCourse(data);
};

export const deleteCourse = async (id: string): Promise<void> => {
  const { error } = await supabase.from('courses').delete().eq('id', id);

  if (error) throw error;
};


