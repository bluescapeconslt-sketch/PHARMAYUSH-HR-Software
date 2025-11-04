import { Employee, Permission } from '../types.ts';
import { getEmployees } from './employeeService.ts';
import { getRoles } from './roleService.ts';

const USER_KEY = 'pharmayush_hr_user';

// FIX: Update AuthenticatedUser to omit the password for security. The user object stored in the session should not contain the password.
// FIX: Export the AuthenticatedUser interface to be used across the application.
export interface AuthenticatedUser extends Omit<Employee, 'password'> {
    permissions: Permission[];
}

export const login = async (email: string, password: string): Promise<boolean> => {
  const employees = await getEmployees();
  const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());

  if (user && user.password === password) {
    const roles = await getRoles();
    const userRole = roles.find(r => r.id === user.roleId);

    // Don't store password in session
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
    // Re-check for currentUser here as it might have been cleared
    if (currentUser && currentUser.id === updatedEmployeeData.id) {
        const updatedUser: AuthenticatedUser = {
            ...currentUser, // Persist existing permissions and other session data
            ...updatedEmployeeData, // Overwrite with fresh employee data
        };
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            // Dispatch a custom event to notify the application that session data has changed.
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