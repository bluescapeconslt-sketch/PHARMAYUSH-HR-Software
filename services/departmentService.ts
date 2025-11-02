
import { Department } from '../types.ts';
import { DEPARTMENTS as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_departments';

export const getDepartments = (): Department[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse departments from localStorage", error);
    return initialData;
  }
};

export const addDepartment = (newDepartmentData: Omit<Department, 'id'>): Department[] => {
    const departments = getDepartments();
    const newDepartment: Department = {
        ...newDepartmentData,
        id: Date.now(),
    };
    const updatedDepartments = [...departments, newDepartment];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDepartments));
    return updatedDepartments;
};

export const updateDepartment = (updatedDepartment: Department): Department[] => {
    let departments = getDepartments();
    departments = departments.map(d => d.id === updatedDepartment.id ? updatedDepartment : d);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    return departments;
};

export const deleteDepartment = (id: number): Department[] => {
    let departments = getDepartments();
    departments = departments.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    return departments;
};