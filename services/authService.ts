
import { Permission } from '../types.ts';
import { supabase } from './supabaseClient.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    position: string;
    jobTitle: string;
    department: string;
    roleId: string;
    avatar?: string;
    status: string;
    birthday?: string;
    permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        id,
        email,
        first_name,
        last_name,
        job_title,
        employment_status,
        date_of_birth,
        role_id,
        department:departments(name),
        role:roles(permissions)
      `)
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .maybeSingle();

    if (error || !employee) {
      return false;
    }

    const authenticatedUser: AuthenticatedUser = {
      id: employee.id,
      email: employee.email,
      name: `${employee.first_name} ${employee.last_name}`,
      position: 'Employee',
      jobTitle: employee.job_title || '',
      department: employee.department?.name || '',
      roleId: employee.role_id,
      status: employee.employment_status || 'active',
      birthday: employee.date_of_birth,
      permissions: employee.role?.permissions || [],
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