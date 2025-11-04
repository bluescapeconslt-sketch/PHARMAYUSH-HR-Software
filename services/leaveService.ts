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

  if (hasPermission('manage:leaves')) {
    return allRequests;
  }

  return allRequests.filter(req => req.employeeId === currentUser.id);
};

export const getLeaveRequestsForEmployee = (employeeId: number): LeaveRequest[] => {
  let allRequests: LeaveRequest[] = [];
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
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
    id: Date.now(),
    status: 'Pending',
  };
  const updatedRequests = [...allRequests, newRequest];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
};

export const updateLeaveRequestStatus = (id: number, status: 'Approved' | 'Rejected'): LeaveRequest[] => {
  let allRequests: LeaveRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const request = allRequests.find(r => r.id === id);
  if (!request) return allRequests;

  allRequests = allRequests.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allRequests));

  if (status === 'Approved' && request) {
    const employees = getEmployees();
    const employee = employees.find(e => e.id === request.employeeId);
    if (employee) {
      const leaveBalance = { ...employee.leaveBalance };
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (request.leaveType === 'Short Leave' && leaveBalance.short > 0) {
        leaveBalance.short = Math.max(0, leaveBalance.short - 1);
      } else if (request.leaveType === 'Sick Leave' && leaveBalance.sick >= diffDays) {
        leaveBalance.sick -= diffDays;
      } else if (request.leaveType === 'Personal' && leaveBalance.personal >= diffDays) {
        leaveBalance.personal -= diffDays;
      }

      updateEmployee({ ...employee, leaveBalance });
    }
  }

  return allRequests;
};
