
// FIX: Add file extension to import paths
import { Employee } from '../types.ts';
import { EMPLOYEES as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_employees';

export const getEmployees = (): Employee[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      // Seed initial data if nothing is in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse employees from localStorage", error);
    return initialData;
  }
};

export const addEmployee = (newEmployeeData: Omit<Employee, 'id'>): Employee[] => {
  const employees = getEmployees();
  const newEmployee: Employee = {
    ...newEmployeeData,
    id: Date.now(), // Simple unique ID generation
  };
  const updatedEmployees = [...employees, newEmployee];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
  return updatedEmployees;
};

export const updateEmployee = (updatedEmployee: Employee): Employee[] => {
  let employees = getEmployees();
  employees = employees.map(emp =>
    emp.id === updatedEmployee.id ? updatedEmployee : emp
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employees;
};

export const deleteEmployee = (id: number): Employee[] => {
    let employees = getEmployees();
    employees = employees.filter(emp => emp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return employees;
};