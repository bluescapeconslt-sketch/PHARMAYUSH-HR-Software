import { Employee } from '../types.ts';
import { EMPLOYEES as initialData } from '../constants.tsx';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';
import { getCurrentUser, updateCurrentUserSession } from './authService.ts';

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
  employees = employees.map(emp =>
    emp.id === updatedEmployee.id ? updatedEmployee : emp
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === updatedEmployee.id) {
    const { password: _, ...userProfile } = updatedEmployee;
    updateCurrentUserSession(userProfile);
  }

  return employees;
};

export const deleteEmployee = (id: number): Employee[] => {
    let employees = getEmployees();
    employees = employees.filter(emp => emp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return employees;
};

export const checkAndAllocateMonthlyLeaves = (): void => {
    const allEmployees: Employee[] = getEmployees();
    if (allEmployees.length === 0) return;

    const allocationSettings = getLeaveAllocationSettings();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentUser = getCurrentUser();

    let wasUpdated = false;
    const updatedEmployees = allEmployees.map(employee => {
        const lastAllocation = employee.lastLeaveAllocation || '2000-01';

        if (lastAllocation !== currentMonth) {
            wasUpdated = true;
            console.log(`Resetting and allocating leaves for ${employee.name} for ${currentMonth}`);
            const updatedEmployee = {
                ...employee,
                leaveBalance: {
                    short: allocationSettings.short,
                    sick: allocationSettings.sick,
                    personal: allocationSettings.personal,
                },
                lastLeaveAllocation: currentMonth,
            };

            if (currentUser && currentUser.id === updatedEmployee.id) {
                const { password: _, ...userProfile } = updatedEmployee;
                updateCurrentUserSession(userProfile);
            }

            return updatedEmployee;
        }
        return employee;
    });

    if (wasUpdated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
    }
};

export const reapplyLeaveSettingsToAllEmployees = (): void => {
    const allocationSettings = getLeaveAllocationSettings();
    const allEmployees = getEmployees();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentUser = getCurrentUser();

    const updatedEmployees = allEmployees.map(employee => {
        if (employee.lastLeaveAllocation === currentMonth) {
            return {
                ...employee,
                leaveBalance: {
                    short: allocationSettings.short,
                    sick: allocationSettings.sick,
                    personal: allocationSettings.personal,
                }
            };
        }
        return employee;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));

    const updatedCurrentUser = updatedEmployees.find(e => currentUser && e.id === currentUser.id);
    if (updatedCurrentUser) {
        const { password: _, ...userProfile } = updatedCurrentUser;
        updateCurrentUserSession(userProfile);
    }
};
