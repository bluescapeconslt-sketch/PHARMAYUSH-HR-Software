import { Employee } from '../types.ts';
import { EMPLOYEES as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_employees';

export const getEmployees = (): Employee[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse employees from localStorage", error);
    return initialData;
  }
};

export const getEmployee = (id: number): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(e => e.id === id);
};

export const addEmployee = (newEmployeeData: Omit<Employee, 'id'>): Employee[] => {
  const employees = getEmployees();
  const newEmployee: Employee = {
    ...newEmployeeData,
    id: Date.now(),
  };
  const updatedEmployees = [...employees, newEmployee];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
  return updatedEmployees;
};

export const updateEmployee = (updatedEmployee: Employee): Employee[] => {
  let employees = getEmployees();
  employees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employees;
};

export const deleteEmployee = (id: number): Employee[] => {
  let employees = getEmployees();
  employees = employees.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employees;
};

export const reapplyLeaveSettingsToAllEmployees = (newLeaveSettings: { short: number; sick: number; personal: number }): void => {
  const employees = getEmployees();
  const updatedEmployees = employees.map(emp => ({
    ...emp,
    leaveBalance: { ...newLeaveSettings }
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
};

export const checkAndAllocateMonthlyLeaves = (): void => {
  const employees = getEmployees();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { short, sick, personal } = JSON.parse(localStorage.getItem('pharmayush_hr_leave_settings') || '{"short": 4, "sick": 10, "personal": 10}');

  const updatedEmployees = employees.map(emp => {
    if (emp.lastLeaveAllocation !== currentMonth) {
      return {
        ...emp,
        leaveBalance: { short, sick, personal },
        lastLeaveAllocation: currentMonth
      };
    }
    return emp;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
};
