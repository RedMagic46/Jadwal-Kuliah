import { supabase } from './supabase';
import { Room } from '../app/types/schedule';

const transformRoom = (room: any): Room => {
  return {
    id: room.id,
    name: room.name,
    building: room.building,
    capacity: room.capacity,
  };
};

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('building', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return data.map(transformRoom);
};

export const createRoom = async (roomData: {
  name: string;
  building: string;
  capacity: number;
  facilities?: string;
}): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: roomData.name,
      building: roomData.building,
      capacity: roomData.capacity,
      facilities: roomData.facilities,
    })
    .select()
    .single();

  if (error) throw error;

  return transformRoom(data);
};

export const updateRoom = async (
  id: string,
  updates: Partial<Room>
): Promise<Room> => {
  const updateData: any = {};

  if (updates.name) updateData.name = updates.name;
  if (updates.building) updateData.building = updates.building;
  if (updates.capacity !== undefined) updateData.capacity = updates.capacity;

  const { data, error } = await supabase
    .from('rooms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return transformRoom(data);
};

export const deleteRoom = async (id: string): Promise<void> => {
  const { error } = await supabase.from('rooms').delete().eq('id', id);

  if (error) throw error;
};

