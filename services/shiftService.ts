import { Shift } from '../types.ts';
import { DEFAULT_SHIFTS } from './mockData.ts';

const SHIFTS_KEY = 'pharmayush_hr_shifts';

const getFromStorage = (): Shift[] => {
    try {
        const data = localStorage.getItem(SHIFTS_KEY);
        if (!data) {
            localStorage.setItem(SHIFTS_KEY, JSON.stringify(DEFAULT_SHIFTS));
            return DEFAULT_SHIFTS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_SHIFTS;
    }
};

const saveToStorage = (shifts: Shift[]): void => {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
};

export const getShifts = async (): Promise<Shift[]> => {
  return Promise.resolve(getFromStorage());
};

export const addShift = async (newShiftData: Omit<Shift, 'id'>): Promise<Shift> => {
    const shifts = getFromStorage();
    const newId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1;
    const newShift = { ...newShiftData, id: newId };
    saveToStorage([...shifts, newShift]);
    return Promise.resolve(newShift);
};

export const updateShift = async (updatedShift: Shift): Promise<Shift> => {
    let shifts = getFromStorage();
    shifts = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
    saveToStorage(shifts);
    return Promise.resolve(updatedShift);
};

export const deleteShift = async (id: number): Promise<void> => {
    let shifts = getFromStorage();
    shifts = shifts.filter(s => s.id !== id);
    saveToStorage(shifts);
    return Promise.resolve();
};
