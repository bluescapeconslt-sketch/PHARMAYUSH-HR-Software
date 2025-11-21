import { Role } from '../types.ts';
import { find, insert, update, remove } from './db.ts';

const TABLE = 'roles';

export const getRoles = (): Promise<Role[]> => find(TABLE);

export const addRole = (newRoleData: Omit<Role, 'id'>): Promise<Role> => insert(TABLE, newRoleData);

export const updateRole = (updatedRole: Role): Promise<Role> => update(TABLE, updatedRole);

export const deleteRole = (id: number): Promise<void> => remove(TABLE, id);
