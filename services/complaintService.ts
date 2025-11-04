import { Complaint } from '../types.ts';

const STORAGE_KEY = 'pharmayush_hr_complaints';

const initialData: Complaint[] = [];

export const getComplaints = (): Complaint[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse complaints from localStorage", error);
    return initialData;
  }
};

export const addComplaint = (newComplaintData: Omit<Complaint, 'id'>): void => {
    const complaints = getComplaints();
    const newComplaint: Complaint = {
        ...newComplaintData,
        id: Date.now(),
    };
    const updatedComplaints = [...complaints, newComplaint];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComplaints));
};

export const updateComplaintStatus = (id: number, status: Complaint['status']): Complaint[] => {
    let complaints = getComplaints();
    complaints = complaints.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    return complaints;
};

export const deleteComplaint = (id: number): Complaint[] => {
    let complaints = getComplaints();
    complaints = complaints.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    return complaints;
};
