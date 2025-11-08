import { Role } from '../types.ts';
import { DEFAULT_ROLES } from './mockData.ts';

const ROLES_KEY = 'pharmayush_hr_roles';

const getFromStorage = (): Role[] => {
    try {
        const data = localStorage.getItem(ROLES_KEY);
        if (!data) {
            localStorage.setItem(ROLES_KEY, JSON.stringify(DEFAULT_ROLES));
            return DEFAULT_ROLES;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_ROLES;
    }
};

const saveToStorage = (roles: Role[]): void => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};

export const getRoles = async (): Promise<Role[]> => {
  return Promise.resolve(getFromStorage());
};

export const addRole = async (newRoleData: Omit<Role, 'id'>): Promise<Role> => {
    const roles = getFromStorage();
    const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
    const newRole = { ...newRoleData, id: newId };
    saveToStorage([...roles, newRole]);
    return Promise.resolve(newRole);
};

export const updateRole = async (updatedRole: Role): Promise<Role> => {
    let roles = getFromStorage();
    roles = roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    saveToStorage(roles);
    return Promise.resolve(updatedRole);
};

export const deleteRole = async (id: number): Promise<void> => {
    let roles = getFromStorage();
    roles = roles.filter(r => r.id !== id);
    saveToStorage(roles);
    return Promise.resolve();
};
