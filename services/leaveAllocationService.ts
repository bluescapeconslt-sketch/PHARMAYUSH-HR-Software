import { LeaveAllocationSettings, Employee } from '../types.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';

const LEAVE_ALLOCATION_KEY = 'pharmayush_hr_leave_allocation_settings';

const DEFAULT_LEAVE_SETTINGS: LeaveAllocationSettings = {
    short: 3,
    sick: 1,
    personal: 1,
};

export const getLeaveAllocationSettings = async (): Promise<LeaveAllocationSettings> => {
    try {
        const data = localStorage.getItem(LEAVE_ALLOCATION_KEY);
        if (!data) {
            localStorage.setItem(LEAVE_ALLOCATION_KEY, JSON.stringify(DEFAULT_LEAVE_SETTINGS));
            return Promise.resolve(DEFAULT_LEAVE_SETTINGS);
        }
        return Promise.resolve(JSON.parse(data));
    } catch (e) {
        return Promise.resolve(DEFAULT_LEAVE_SETTINGS);
    }
};

export const saveLeaveAllocationSettings = async (settings: LeaveAllocationSettings): Promise<LeaveAllocationSettings> => {
    try {
        localStorage.setItem(LEAVE_ALLOCATION_KEY, JSON.stringify(settings));
        return Promise.resolve(settings);
    } catch (e) {
        console.error("Failed to save leave settings", e);
        return Promise.reject(e);
    }
};

/**
 * Processes monthly leave allocation for all employees.
 * This implements a "no carry-forward" policy by resetting balances each month.
 * - Eligible employees have their leave balances reset to the values in settings.
 * - Ineligible employees (Intern, Probation, Notice Period) have their balances reset to zero.
 * This process only runs if the current month is different from the last allocation month.
 */
export const processMonthlyLeaveAllocation = async (): Promise<void> => {
    console.log("Processing monthly leave allocation...");
    try {
        const employees = await getEmployees();
        const settings = await getLeaveAllocationSettings();
        const today = new Date();
        const currentMonthIdentifier = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // e.g., "2024-08"

        for (const employee of employees) {
            // Only process if the last allocation was in a previous month.
            if (employee.lastLeaveAllocation !== currentMonthIdentifier) {
                
                let updatedEmployee: Employee;

                // Ineligible employees get their balance zeroed out.
                if (employee.position === 'Intern' || employee.status === 'Probation' || employee.status === 'Notice Period') {
                    updatedEmployee = {
                        ...employee,
                        leaveBalance: { short: 0, sick: 0, personal: 0 },
                        lastLeaveAllocation: currentMonthIdentifier,
                    };
                } else {
                    // Eligible employees have their balance RESET to the settings.
                    updatedEmployee = {
                        ...employee,
                        leaveBalance: {
                            short: settings.short,
                            sick: settings.sick,
                            personal: settings.personal,
                        },
                        lastLeaveAllocation: currentMonthIdentifier,
                    };
                }
                
                // Persist the change for this employee
                await updateEmployee(updatedEmployee);
            }
        }
    } catch (error) {
        console.error("Error during monthly leave allocation processing:", error);
    }
    console.log("Finished monthly leave allocation processing.");
};
