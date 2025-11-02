
// FIX: Add file extension to import paths
import { LeaveRequest } from '../types.ts';
import { LEAVE_REQUESTS as initialData } from '../constants.tsx';
import { getCurrentUser, hasPermission } from './authService.ts';

const STORAGE_KEY = 'pharmayush_hr_leave_requests';

export const getLeaveRequests = (): LeaveRequest[] => {
  let allRequests: LeaveRequest[] = [];
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      // Seed initial data if nothing is in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      allRequests = initialData;
    } else {
        allRequests = JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to parse leave requests from localStorage", error);
    allRequests = [];
  }

  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  // Users with 'manage:leaves' permission (e.g., HR Manager, Admin) see all requests.
  if (hasPermission('manage:leaves')) {
    return allRequests;
  }
  
  // Regular employees only see their own requests.
  return allRequests.filter(req => req.employeeId === currentUser.id);
};

export const addLeaveRequest = (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): LeaveRequest[] => {
  const requests = getLeaveRequests();
  const newRequest: LeaveRequest = {
    ...newRequestData,
    id: Date.now(), // Simple unique ID generation
    status: 'Pending',
  };
  const updatedRequests = [...requests, newRequest];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
  return updatedRequests;
};

export const updateLeaveRequestStatus = (id: number, status: 'Approved' | 'Rejected'): LeaveRequest[] => {
  let requests = getLeaveRequests();
  requests = requests.map(req =>
    req.id === id ? { ...req, status } : req
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  return requests;
};
