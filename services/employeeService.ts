// FIX: Add file extension to import paths
import { Employee } from '../types.ts';
import { EMPLOYEES as initialData } from '../constants.tsx';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';
import { getCurrentUser, updateCurrentUserSession } from './authService.ts';

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

  // If the updated employee is the one currently logged in, update their session data.
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
    // This function acts as a pseudo-cron job that runs on app load.
    const allEmployees: Employee[] = getEmployees();
    if (allEmployees.length === 0) return;

    const allocationSettings = getLeaveAllocationSettings();
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const currentUser = getCurrentUser();

    let wasUpdated = false;
    const updatedEmployees = allEmployees.map(employee => {
        // Ensure lastLeaveAllocation property exists
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

            // If this employee is the current user, update their session too
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
        // Re-apply settings only if this month's leaves were already allocated.
        // This ensures we update balances that were set with old settings.
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

    // Save the entire updated employee list to storage.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));

    // After saving, check if the currently logged-in user was part of the update,
    // and if so, refresh their session data to reflect the change immediately.
    const updatedCurrentUser = updatedEmployees.find(e => currentUser && e.id === currentUser.id);
    if (updatedCurrentUser) {
        const { password: _, ...userProfile } = updatedCurrentUser;
        updateCurrentUserSession(userProfile); // This will dispatch the 'session-updated' event
    }
};