import { supabase } from './supabaseClient.ts';
import { Department } from '../types.ts';

export interface DepartmentData {
  id: string;
  name: string;
  description: string | null;
  head_id: string | null;
  created_at: string;
  updated_at: string;
}

const transformToDepartment = (data: DepartmentData, index: number): Department => {
  return {
    id: index + 1,
    name: data.name
  };
};

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    return (data || []).map((dept, index) => transformToDepartment(dept, index));
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return [];
  }
};

export const addDepartment = async (newDepartmentData: Omit<DepartmentData, 'id' | 'created_at' | 'updated_at'>): Promise<DepartmentData | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([newDepartmentData])
      .select()
      .single();

    if (error) {
      console.error('Error adding department:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to add department:', error);
    return null;
  }
};

export const updateDepartment = async (updatedDepartment: Partial<DepartmentData> & { id: string }): Promise<DepartmentData | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(updatedDepartment)
      .eq('id', updatedDepartment.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update department:', error);
    return null;
  }
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete department:', error);
    return false;
  }
};
