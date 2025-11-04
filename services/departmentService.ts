import { Department } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || '',
      headId: dept.head_id,
    }));
  } catch (error) {
    console.error('Failed to fetch departments from database', error);
    return [];
  }
};

export const addDepartment = async (newDepartmentData: Omit<Department, 'id'>): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .insert({
        name: newDepartmentData.name,
        description: newDepartmentData.description,
        head_id: newDepartmentData.headId,
      });

    if (error) throw error;

    return await getDepartments();
  } catch (error) {
    console.error('Failed to add department', error);
    return await getDepartments();
  }
};

export const updateDepartment = async (updatedDepartment: Department): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .update({
        name: updatedDepartment.name,
        description: updatedDepartment.description,
        head_id: updatedDepartment.headId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedDepartment.id);

    if (error) throw error;

    return await getDepartments();
  } catch (error) {
    console.error('Failed to update department', error);
    return await getDepartments();
  }
};

export const deleteDepartment = async (id: string | number): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getDepartments();
  } catch (error) {
    console.error('Failed to delete department', error);
    return await getDepartments();
  }
};
