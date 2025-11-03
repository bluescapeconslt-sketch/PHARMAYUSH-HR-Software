import { Permission } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  department: string;
  departmentId: string;
  position: string;
  jobTitle: string;
  roleId: string;
  shiftId: string | null;
  avatar: string | null;
  status: string;
  birthday: string | null;
  leaveBalance: { short: number; sick: number; personal: number };
  lastLeaveAllocation: string | null;
  permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        email,
        password,
        first_name,
        last_name,
        department_id,
        role_id,
        position,
        job_title,
        shift_id,
        avatar,
        employment_status,
        date_of_birth,
        leave_balance,
        last_leave_allocation,
        departments:department_id(id, name),
        roles:role_id(id, name, permissions)
      `)
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (empError) {
      console.error('Error fetching employee:', empError);
      return false;
    }

    if (!employee || employee.password !== password) {
      return false;
    }

    const authenticatedUser: AuthenticatedUser = {
      id: employee.id,
      email: employee.email,
      firstName: employee.first_name,
      lastName: employee.last_name,
      name: `${employee.first_name} ${employee.last_name}`,
      department: employee.departments?.name || '',
      departmentId: employee.department_id,
      position: employee.position || 'Employee',
      jobTitle: employee.job_title || '',
      roleId: employee.role_id,
      shiftId: employee.shift_id,
      avatar: employee.avatar,
      status: employee.employment_status || 'active',
      birthday: employee.date_of_birth,
      leaveBalance: employee.leave_balance || { short: 0, sick: 0, personal: 0 },
      lastLeaveAllocation: employee.last_leave_allocation,
      permissions: employee.roles?.permissions || [],
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
    console.error('Failed to get current user from localStorage', error);
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
