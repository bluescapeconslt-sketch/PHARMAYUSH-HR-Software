
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
        role:roles(id, name, description, permissions),
        department:departments(id, name),
        shift:shifts(id, name, start_time, end_time)
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

    const authenticatedUser: AuthenticatedUser = {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
      avatar: employee.avatar || 'https://i.pravatar.cc/200',
      position: employee.position,
      jobTitle: employee.job_title,
      department: employee.department?.name || '',
      departmentId: employee.department_id,
      status: 'Active',
      birthday: employee.date_of_birth,
      leaveBalance: employee.leave_balance || { short: 0, sick: 0, personal: 0 },
      roleId: employee.role_id,
      shiftId: employee.shift_id,
      baseSalary: parseFloat(employee.salary) || 0,
      workLocation: undefined,
      lastLeaveAllocation: employee.last_leave_allocation,
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