import { Shift } from '../types.ts';
import { SHIFTS as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_shifts';

export const getShifts = (): Shift[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse shifts from localStorage", error);
    return initialData;
  }
};

export const addShift = (newShiftData: Omit<Shift, 'id'>): Shift[] => {
    const shifts = getShifts();
    const newShift: Shift = {
        ...newShiftData,
        id: Date.now(),
    };
    const updatedShifts = [...shifts, newShift];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShifts));
    return updatedShifts;
};

export const updateShift = (updatedShift: Shift): Shift[] => {
    let shifts = getShifts();
    shifts = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
    return shifts;
};

export const deleteShift = (id: number): Shift[] => {
    let shifts = getShifts();
    shifts = shifts.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
    return shifts;
};
