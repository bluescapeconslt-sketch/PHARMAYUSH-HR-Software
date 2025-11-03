// FIX: Add file extension to import paths
import { Employee } from '../types.ts';
import { EMPLOYEES as initialData } from '../constants.tsx';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';

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

export const checkAndAllocateMonthlyLeaves = (): void => {
    // This function acts as a pseudo-cron job that runs on app load.
    const allEmployees: Employee[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (allEmployees.length === 0) return;

    const allocationSettings = getLeaveAllocationSettings();
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    let wasUpdated = false;
    const updatedEmployees = allEmployees.map(employee => {
        // Ensure lastLeaveAllocation property exists
        const lastAllocation = employee.lastLeaveAllocation || '2000-01'; 
        
        if (lastAllocation !== currentMonth) {
            wasUpdated = true;
            console.log(`Allocating leaves for ${employee.name} for ${currentMonth}`);
            return {
                ...employee,
                leaveBalance: {
                    short: (employee.leaveBalance.short || 0) + allocationSettings.short,
                    sick: (employee.leaveBalance.sick || 0) + allocationSettings.sick,
                    personal: (employee.leaveBalance.personal || 0) + allocationSettings.personal,
                },
                lastLeaveAllocation: currentMonth,
            };
        }
        return employee;
    });

    if (wasUpdated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
    }
};