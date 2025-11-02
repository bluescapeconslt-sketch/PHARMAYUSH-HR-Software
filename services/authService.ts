import { Permission } from '../types.ts';
import { supabase } from './supabaseClient.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser {
    id: string;
    email: string;
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
    permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (employeeError || !employee || employee.password !== password) {
      return false;
    }

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('permissions')
      .eq('id', employee.role_id)
      .maybeSingle();

    const authenticatedUser: AuthenticatedUser = {
      id: employee.id,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone,
      date_of_birth: employee.date_of_birth,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      postal_code: employee.postal_code,
      country: employee.country,
      department_id: employee.department_id,
      role_id: employee.role_id,
      job_title: employee.job_title,
      hire_date: employee.hire_date,
      employment_status: employee.employment_status,
      salary: employee.salary,
      bank_account: employee.bank_account,
      bank_name: employee.bank_name,
      permissions: role?.permissions || [],
    };

    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): AuthenticatedUser | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Failed to get current user from localStorage", error);
    return null;
  }
};

export const checkAuth = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasPermission = (permission: Permission): boolean => {
    const user = getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
};