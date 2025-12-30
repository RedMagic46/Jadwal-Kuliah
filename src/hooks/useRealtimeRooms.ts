import { useEffect, useState } from 'react';
import { getRooms } from '../lib/roomService';
import { Room } from '../app/types/schedule';

export const useRealtimeRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadRooms();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_rooms') {
        loadRooms();
      }
    };

    // Listen for custom events in the same tab
    const handleLocalStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'app_rooms') {
        loadRooms();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleLocalStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleLocalStorageChange as EventListener);
    };
  }, []);

  return { rooms, loading, refresh: loadRooms };
};

