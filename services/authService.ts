
import { Employee, Permission, Role } from '../types.ts';
import { getEmployees } from './employeeService.ts';
import { getRoles } from './roleService.ts';

const USER_KEY = 'pharmayush_hr_user';

export interface AuthenticatedUser extends Omit<Employee, 'password'> {
    permissions: Permission[];
    token: string;
}

// In-memory fallback for environments where localStorage is not available
let sessionUser: AuthenticatedUser | null = null;

export const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const employees = await getEmployees();
        const roles = await getRoles();

        const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === password);
        
        if (!employee) {
            return false;
        }

        const role = roles.find(r => r.id === employee.roleId);
        const { password: _, ...userProfile } = employee;

        const user: AuthenticatedUser = {
            ...userProfile,
            permissions: role?.permissions || [],
            token: 'mock-token-for-local-dev',
        };
        
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
            console.warn("localStorage is not available. Session will not persist.", e);
            sessionUser = user;
        }
        window.dispatchEvent(new Event('session-updated'));
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
};

export const logout = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('Could not remove user from localStorage.', e);
  }
  sessionUser = null;
  window.dispatchEvent(new Event('session-updated'));
};

export const getCurrentUser = (): AuthenticatedUser | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
        // Clear in-memory user if localStorage becomes available
        if(sessionUser) sessionUser = null;
        return JSON.parse(userJson);
    }
    // Return in-memory user if localStorage is not available
    return sessionUser;
  } catch (error) {
    console.error("Failed to get current user.", error);
    return sessionUser;
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
        } catch (error) {
            sessionUser = updatedUser;
        }
        window.dispatchEvent(new Event('session-updated'));
    }
};

export const hasPermission = (permission: Permission): boolean => {
    const user = getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
};