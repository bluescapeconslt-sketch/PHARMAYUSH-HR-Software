import { Employee, Permission } from '../types.ts';
import { getEmployees } from './employeeService.ts';
import { getRoles } from './roleService.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser extends Omit<Employee, 'password'> {
    permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  const employees = await getEmployees();
  const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());

  if (user && user.password === password) {
    const roles = await getRoles();
    const userRole = roles.find(r => r.id === user.roleId);

    const { password: _, ...userProfile } = user;

    const authenticatedUser: AuthenticatedUser = {
        ...userProfile,
        permissions: userRole ? userRole.permissions : [],
    };

    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    return true;
  }

  return false;
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

export const updateCurrentUserSession = (updatedEmployeeData: Omit<Employee, 'password'>): void => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedEmployeeData.id) {
        const updatedUser: AuthenticatedUser = {
            ...currentUser,
            ...updatedEmployeeData,
        };
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('session-updated'));
        } catch (error) {
            console.error("Failed to update current user in localStorage", error);
        }
    }
};

export const checkAuth = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasPermission = (permission: Permission): boolean => {
    const user = getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
};
