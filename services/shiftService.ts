
import { Shift } from '../types.ts';
import { find, insert, update, remove } from './db.ts';

const TABLE = 'shifts';

export const getShifts = (): Promise<Shift[]> => find(TABLE);

export const addShift = (newShiftData: Omit<Shift, 'id'>): Promise<Shift> => insert(TABLE, newShiftData);

export const updateShift = (updatedShift: Shift): Promise<Shift> => update(TABLE, updatedShift);

export const deleteShift = (id: number): Promise<void> => remove(TABLE, id);
