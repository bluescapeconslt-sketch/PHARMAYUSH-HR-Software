

import { find } from './db.ts';
import { Employee, Permission } from '../types.ts';
import { getRoles } from './roleService.ts';

export interface AuthenticatedUser extends Omit<Employee, 'password'> {
    permissions: Permission[];
}

const SESSION_KEY = 'pharmayush_hr_session';

// This module-level variable holds the user state, allowing synchronous access
let activeUser: AuthenticatedUser | null = null;
try {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (sessionData) {
        activeUser = JSON.parse(sessionData);
    }
} catch (e) {
    console.error("Could not parse session data", e);
    sessionStorage.removeItem(SESSION_KEY);
}

export const setActiveUser = (user: AuthenticatedUser | null) => {
    activeUser = user;
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        sessionStorage.removeItem(SESSION_KEY);
    }
    // Dispatch a custom event for App.tsx to react to changes.
    window.dispatchEvent(new Event('session-updated'));
};

export const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    const employees = await find<Employee>('employees');
    const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === password);

    if (!employee) {
        return { success: false, error: 'Invalid credentials' };
    }

    const fullUser = await buildAuthenticatedUser(employee);
    if (fullUser) {
        setActiveUser(fullUser);
        return { success: true };
    }
    return { success: false, error: 'Could not build user session.' };
};

export const logout = async (): Promise<void> => {
  setActiveUser(null);
};

export const getCurrentUser = (): AuthenticatedUser | null => {
  return activeUser;
};

export const updateCurrentUserSession = (updatedEmployeeData: Omit<Employee, 'password'>): void => {
    if (activeUser && activeUser.id === updatedEmployeeData.id) {
        const updatedUser: AuthenticatedUser = {
            ...activeUser,
            ...updatedEmployeeData,
        };
        setActiveUser(updatedUser);
    }
};

export const hasPermission = (permission: Permission): boolean => {
    const user = getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
};

export const buildAuthenticatedUser = async (employee: Employee): Promise<AuthenticatedUser | null> => {
    const roles = await getRoles();
    const role = roles.find(r => r.id === employee.roleId);
    if (!role) {
        console.error(`Role with ID ${employee.roleId} not found for employee ${employee.name}`);
        return null;
    }
    const { password, ...userProfile } = employee;
    return {
        ...userProfile,
        permissions: role.permissions,
    };
};
