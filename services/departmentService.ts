import { Department } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

let departmentsCache: Department[] | null = null;

export const getDepartments = (): Department[] => {
  if (departmentsCache) {
    return departmentsCache;
  }
  return [];
};

export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;

    const departments: Department[] = (data || []).map((dept: any) => ({
      id: dept.id,
      name: dept.name,
    }));

    departmentsCache = departments;
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const addDepartment = async (newDepartmentData: Omit<Department, 'id'>): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .insert([{ name: newDepartmentData.name }]);

    if (error) throw error;

    return await fetchDepartments();
  } catch (error) {
    console.error('Error adding department:', error);
    return getDepartments();
  }
};

export const updateDepartment = async (updatedDepartment: Department): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .update({ name: updatedDepartment.name })
      .eq('id', updatedDepartment.id);

    if (error) throw error;

    return await fetchDepartments();
  } catch (error) {
    console.error('Error updating department:', error);
    return getDepartments();
  }
};

export const deleteDepartment = async (id: number | string): Promise<Department[]> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await fetchDepartments();
  } catch (error) {
    console.error('Error deleting department:', error);
    return getDepartments();
  }
};
