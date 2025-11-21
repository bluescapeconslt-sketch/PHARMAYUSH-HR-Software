
import { Department } from '../types.ts';
import { find, insert, update, remove } from './db.ts';

const TABLE = 'departments';

export const getDepartments = (): Promise<Department[]> => find(TABLE);

export const addDepartment = (newDepartmentData: Omit<Department, 'id'>): Promise<Department> => insert(TABLE, newDepartmentData);

export const updateDepartment = (updatedDepartment: Department): Promise<Department> => update(TABLE, updatedDepartment);

export const deleteDepartment = (id: number): Promise<void> => remove(TABLE, id);
