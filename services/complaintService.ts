import { Complaint } from '../types.ts';
import { DEFAULT_COMPLAINTS } from './mockData.ts';

const COMPLAINTS_KEY = 'pharmayush_hr_complaints';

const getFromStorage = (): Complaint[] => {
    try {
        const data = localStorage.getItem(COMPLAINTS_KEY);
        if (!data) {
            localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(DEFAULT_COMPLAINTS));
            return DEFAULT_COMPLAINTS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_COMPLAINTS;
    }
};

const saveToStorage = (complaints: Complaint[]): void => {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
};

export const getComplaints = async (): Promise<Complaint[]> => {
  return Promise.resolve(getFromStorage());
};

export const addComplaint = async (newComplaintData: Omit<Complaint, 'id'>): Promise<Complaint> => {
    const complaints = getFromStorage();
    const newId = complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1;
    const newComplaint = { ...newComplaintData, id: newId };
    saveToStorage([...complaints, newComplaint]);
    return Promise.resolve(newComplaint);
};

export const updateComplaintStatus = async (id: number, status: Complaint['status']): Promise<Complaint> => {
    let complaints = getFromStorage();
    let updatedComplaint: Complaint | undefined;
    complaints = complaints.map(c => {
        if (c.id === id) {
            updatedComplaint = { ...c, status };
            return updatedComplaint;
        }
        return c;
    });
    if (!updatedComplaint) return Promise.reject(new Error("Complaint not found"));
    saveToStorage(complaints);
    return Promise.resolve(updatedComplaint);
};

export const deleteComplaint = async (id: number): Promise<void> => {
    let complaints = getFromStorage();
    complaints = complaints.filter(c => c.id !== id);
    saveToStorage(complaints);
    return Promise.resolve();
};
