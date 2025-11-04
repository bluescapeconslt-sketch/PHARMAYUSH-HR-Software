import { Shift } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

export const getShifts = async (): Promise<Shift[]> => {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((shift: any) => ({
      id: shift.id,
      name: shift.name,
      startTime: shift.start_time,
      endTime: shift.end_time,
      description: shift.description || '',
    }));
  } catch (error) {
    console.error('Failed to fetch shifts from database', error);
    return [];
  }
};

export const addShift = async (newShiftData: Omit<Shift, 'id'>): Promise<Shift[]> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .insert({
        name: newShiftData.name,
        start_time: newShiftData.startTime,
        end_time: newShiftData.endTime,
        description: newShiftData.description,
      });

    if (error) throw error;

    return await getShifts();
  } catch (error) {
    console.error('Failed to add shift', error);
    return await getShifts();
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
        description: updatedShift.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedShift.id);

    if (error) throw error;

    return await getShifts();
  } catch (error) {
    console.error('Failed to update shift', error);
    return await getShifts();
  }
};

export const deleteShift = async (id: string | number): Promise<Shift[]> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getShifts();
  } catch (error) {
    console.error('Failed to delete shift', error);
    return await getShifts();
  }
};
