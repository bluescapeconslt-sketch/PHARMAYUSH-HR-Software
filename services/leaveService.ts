
// FIX: Add file extension to import paths
import { LeaveRequest } from '../types.ts';
import { LEAVE_REQUESTS as initialData } from '../constants.tsx';
import { getCurrentUser, hasPermission } from './authService.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';

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

export const getLeaveRequestsForEmployee = (employeeId: number): LeaveRequest[] => {
  let allRequests: LeaveRequest[] = [];
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    // Use initialData as fallback if nothing is in storage
    allRequests = storedData ? JSON.parse(storedData) : initialData;
  } catch (error) {
    console.error("Failed to parse leave requests from localStorage", error);
    allRequests = [];
  }
  return allRequests.filter(req => req.employeeId === employeeId);
};

export const addLeaveRequest = (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): void => {
  const allRequests: LeaveRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const newRequest: LeaveRequest = {
    ...newRequestData,
    id: Date.now(), // Simple unique ID generation
    status: 'Pending',
  };
  const updatedRequests = [...allRequests, newRequest];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
};

export const updateLeaveRequestStatus = (id: number, status: 'Approved' | 'Rejected'): LeaveRequest[] => {
  const allRequests: LeaveRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const requestToUpdate = allRequests.find(req => req.id === id);

  if (requestToUpdate && status === 'Approved') {
    const employees = getEmployees();
    const employee = employees.find(e => e.id === requestToUpdate.employeeId);

    if (employee) {
        // Calculate leave duration in days (inclusive)
        const startDate = new Date(requestToUpdate.startDate);
        const endDate = new Date(requestToUpdate.endDate);
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 24)) + 1;

        const newBalance = { ...employee.leaveBalance };
        let balanceUpdated = false;

        switch (requestToUpdate.leaveType) {
            case 'Vacation':
                if (newBalance.vacation >= duration) {
                    newBalance.vacation -= duration;
                    balanceUpdated = true;
                }
                break;
            case 'Sick Leave':
                if (newBalance.sick >= duration) {
                    newBalance.sick -= duration;
                    balanceUpdated = true;
                }
                break;
            case 'Personal':
                if (newBalance.personal >= duration) {
                    newBalance.personal -= duration;
                    balanceUpdated = true;
                }
                break;
            // 'Unpaid' and 'Short Leave' do not affect balances
            default:
                balanceUpdated = true; // Still allow approval without balance change
                break;
        }
        
        if (balanceUpdated) {
            updateEmployee({ ...employee, leaveBalance: newBalance });
        } else {
            console.warn(`Insufficient leave balance for employee ${employee.name} to approve request ${id}.`);
        }
    }
  }

  const updatedRequests = allRequests.map(req =>
    req.id === id ? { ...req, status } : req
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
  
  // Re-filter and return the list for the current user to update the UI
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  if (hasPermission('manage:leaves')) {
    return updatedRequests;
  }
  
  return updatedRequests.filter(req => req.employeeId === currentUser.id);
};