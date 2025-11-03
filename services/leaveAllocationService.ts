import { LeaveAllocationSettings } from '../types.ts';

const STORAGE_KEY = 'pharmayush_hr_leave_allocation_settings';

const DEFAULT_SETTINGS: LeaveAllocationSettings = {
  short: 8, // Default to a standard 8-hour workday's worth of short leaves per month
  sick: 1,
  personal: 0,
};

export const getLeaveAllocationSettings = (): LeaveAllocationSettings => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse leave allocation settings from localStorage", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveLeaveAllocationSettings = (settings: LeaveAllocationSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error)
  {
    console.error("Failed to save leave allocation settings to localStorage", error);
  }
};