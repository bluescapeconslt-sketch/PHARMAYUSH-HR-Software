import { Employee } from '../types.ts';
import { DEFAULT_EMPLOYEES } from './mockData.ts';
import { getCurrentUser, updateCurrentUserSession } from './authService.ts';

const EMPLOYEES_KEY = 'pharmayush_hr_employees';

const getFromStorage = (): Employee[] => {
    try {
        const data = localStorage.getItem(EMPLOYEES_KEY);
        if (!data) {
            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
            return DEFAULT_EMPLOYEES;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_EMPLOYEES;
    }
};

const saveToStorage = (employees: Employee[]): void => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const getEmployees = async (): Promise<Employee[]> => {
    return Promise.resolve(getFromStorage());
};

export const addEmployee = async (newEmployeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const employees = getFromStorage();
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee = { ...newEmployeeData, id: newId, performancePoints: 0, badges: [] };
    saveToStorage([...employees, newEmployee]);
    return Promise.resolve(newEmployee);
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    let employees = getFromStorage();
    employees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    saveToStorage(employees);
    
    // If the updated employee is the one currently logged in, update their session data.
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedEmployee.id) {
        const { password: _, ...userProfile } = updatedEmployee;
        updateCurrentUserSession(userProfile);
    }
    return Promise.resolve(updatedEmployee);
};

export const deleteEmployee = async (id: number): Promise<void> => {
    let employees = getFromStorage();
    employees = employees.filter(e => e.id !== id);
    saveToStorage(employees);
    return Promise.resolve();
};