import { Department } from '../types.ts';
import { DEFAULT_DEPARTMENTS } from './mockData.ts';

const DEPARTMENTS_KEY = 'pharmayush_hr_departments';

const getFromStorage = (): Department[] => {
    try {
        const data = localStorage.getItem(DEPARTMENTS_KEY);
        if (!data) {
            localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
            return DEFAULT_DEPARTMENTS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_DEPARTMENTS;
    }
};

const saveToStorage = (departments: Department[]): void => {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
};

export const getDepartments = async (): Promise<Department[]> => {
    return Promise.resolve(getFromStorage());
};

export const addDepartment = async (newDepartmentData: Omit<Department, 'id'>): Promise<Department> => {
    const departments = getFromStorage();
    const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    const newDepartment = { ...newDepartmentData, id: newId };
    const updatedDepartments = [...departments, newDepartment];
    saveToStorage(updatedDepartments);
    return Promise.resolve(newDepartment);
};

export const updateDepartment = async (updatedDepartment: Department): Promise<Department> => {
    let departments = getFromStorage();
    departments = departments.map(d => d.id === updatedDepartment.id ? updatedDepartment : d);
    saveToStorage(departments);
    return Promise.resolve(updatedDepartment);
};

export const deleteDepartment = async (id: number): Promise<void> => {
    let departments = getFromStorage();
    departments = departments.filter(d => d.id !== id);
    saveToStorage(departments);
    return Promise.resolve();
};
