import { Complaint } from '../types.ts';
import { find, findById, insert, update, remove } from './db.ts';

const TABLE = 'complaints';

export const getComplaints = (): Promise<Complaint[]> => find(TABLE);

export const addComplaint = (newComplaintData: Omit<Complaint, 'id'>): Promise<Complaint> => insert(TABLE, newComplaintData);

export const updateComplaintStatus = async (id: number, status: Complaint['status']): Promise<Complaint> => {
    const complaint = await findById<Complaint>(TABLE, id);
    if (!complaint) throw new Error('Complaint not found');
    const updatedComplaint = { ...complaint, status };
    return update<Complaint>(TABLE, updatedComplaint);
};

export const deleteComplaint = (id: number): Promise<void> => remove(TABLE, id);
