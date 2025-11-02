import { supabase } from './supabaseClient.ts';
import { Employee, Position } from '../types.ts';

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

const transformToEmployee = (data: EmployeeData, departments: any[], index: number): Employee => {
  const department = departments.find(d => d.id === data.department_id);
  const idNum = index + 1;

  return {
    id: idNum,
    name: `${data.first_name} ${data.last_name}`,
    position: 'Employee' as Position,
    jobTitle: data.job_title || 'Employee',
    department: department?.name || 'Unknown',
    email: data.email,
    password: data.password,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.first_name)}+${encodeURIComponent(data.last_name)}&background=4f46e5&color=fff`,
    status: data.employment_status === 'active' ? 'Active' : 'On Leave',
    birthday: data.date_of_birth || '2000-01-01',
    leaveBalance: {
      vacation: 20,
      sick: 10,
      personal: 5
    },
    roleId: data.role_id ? parseInt(data.role_id.replace(/-/g, '').substring(0, 8), 16) : 1
  };
};

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const [employeesRes, departmentsRes] = await Promise.all([
      supabase.from('employees').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*')
    ]);

    if (employeesRes.error) {
      console.error('Error fetching employees:', employeesRes.error);
      return [];
    }

    if (departmentsRes.error) {
      console.error('Error fetching departments:', departmentsRes.error);
    }

    const departments = departmentsRes.data || [];
    return (employeesRes.data || []).map((emp, index) => transformToEmployee(emp, departments, index));
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
