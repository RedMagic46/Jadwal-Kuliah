import { supabase } from './supabase';
import { User } from '../app/types';

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'dosen' | 'mahasiswa'
) => {
  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (authError) throw authError;

  // 2. Insert into public.users table
  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      role,
    });

    if (profileError) throw profileError;
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return { user: data.user, profile };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<{
  user: any;
  profile: User | null;
} | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return { user, profile };
};



