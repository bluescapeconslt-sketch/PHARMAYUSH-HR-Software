import { Shift } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

let shiftsCache: Shift[] | null = null;

export const getShifts = (): Shift[] => {
  if (shiftsCache) {
    return shiftsCache;
  }
  return [];
};

export const fetchShifts = async (): Promise<Shift[]> => {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('name');

    if (error) throw error;

    const shifts: Shift[] = (data || []).map((shift: any) => ({
      id: shift.id,
      name: shift.name,
      startTime: shift.start_time,
      endTime: shift.end_time,
    }));

    shiftsCache = shifts;
    return shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }
};

export const addShift = async (newShiftData: Omit<Shift, 'id'>): Promise<Shift[]> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .insert([{
        name: newShiftData.name,
        start_time: newShiftData.startTime,
        end_time: newShiftData.endTime,
      }]);

    if (error) throw error;

    return await fetchShifts();
  } catch (error) {
    console.error('Error adding shift:', error);
    return getShifts();
  }
};

export const updateShift = async (updatedShift: Shift): Promise<Shift[]> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .update({
        name: updatedShift.name,
        start_time: updatedShift.startTime,
        end_time: updatedShift.endTime,
      })
      .eq('id', updatedShift.id);

    if (error) throw error;

    return await fetchShifts();
  } catch (error) {
    console.error('Error updating shift:', error);
    return getShifts();
  }
};

export const deleteShift = async (id: number | string): Promise<Shift[]> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await fetchShifts();
  } catch (error) {
    console.error('Error deleting shift:', error);
    return getShifts();
  }
};
