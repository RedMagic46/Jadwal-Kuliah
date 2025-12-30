import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSchedules } from '../lib/scheduleService';
import { Schedule } from '../app/types/schedule';

export const useRealtimeSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isConfigured = !!(supabaseUrl && supabaseKey && 
      supabaseUrl !== 'your_supabase_url' && 
      supabaseKey !== 'your_anon_key');

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Initial load
    loadSchedules();

    // Subscribe to changes
    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
        },
        (payload) => {
          console.log('Schedule changed:', payload);
          loadSchedules(); // Reload schedules
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { schedules, loading, refresh: loadSchedules };
};

