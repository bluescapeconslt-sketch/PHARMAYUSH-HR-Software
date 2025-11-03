
import { Employee, Permission } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser extends Omit<Employee, 'password'> {
    permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        role:roles(id, name, description, permissions)
      `)
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !employee) {
      console.error('Login error:', error);
      return false;
    }

    if (employee.password !== password) {
      return false;
    }

    const { password: _, role_id, department_id, shift_id, ...userProfile } = employee;

    const authenticatedUser: AuthenticatedUser = {
      ...userProfile,
      roleId: employee.role_id,
      departmentId: employee.department_id,
      shiftId: employee.shift_id,
      name: `${employee.first_name} ${employee.last_name}`,
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