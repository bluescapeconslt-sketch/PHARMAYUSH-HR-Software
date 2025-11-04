import { Role } from '../types.ts';
import { ROLES as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_roles';

export const getRoles = (): Role[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse roles from localStorage", error);
    return initialData;
  }
};

export const addRole = (newRoleData: Omit<Role, 'id'>): Role[] => {
    const roles = getRoles();
    const newRole: Role = {
        ...newRoleData,
        id: Date.now(),
    };
    const updatedRoles = [...roles, newRole];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoles));
    return updatedRoles;
};

export const updateRole = (updatedRole: Role): Role[] => {
    let roles = getRoles();
    roles = roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    return roles;
};

export const deleteRole = (id: number): Role[] => {
    let roles = getRoles();
    roles = roles.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    return roles;
};
