import { supabase } from './supabaseClient.ts';

export interface EmployeeData {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  department_id: string | null;
  role_id: string | null;
  job_title: string | null;
  hire_date: string | null;
  employment_status: string;
  salary: number | null;
  bank_account: string | null;
  bank_name: string | null;
  created_at: string;
  updated_at: string;
}

export const getEmployees = async (): Promise<EmployeeData[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

export const addEmployee = async (newEmployeeData: Omit<EmployeeData, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeData | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([newEmployeeData])
      .select()
      .single();

    if (error) {
      console.error('Error adding employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to add employee:', error);
    return null;
  }
};

export const updateEmployee = async (updatedEmployee: Partial<EmployeeData> & { id: string }): Promise<EmployeeData | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updatedEmployee)
      .eq('id', updatedEmployee.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update employee:', error);
    return null;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return false;
  }
};
