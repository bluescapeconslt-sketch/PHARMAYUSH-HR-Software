import { LeaveRequest, Employee } from '../types.ts';
import { DEFAULT_LEAVE_REQUESTS } from './mockData.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';
import { getCurrentUser } from './authService.ts';

const LEAVE_REQUESTS_KEY = 'pharmayush_hr_leave_requests';

const getFromStorage = (): LeaveRequest[] => {
    try {
        const data = localStorage.getItem(LEAVE_REQUESTS_KEY);
        if (!data) {
            localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
            return DEFAULT_LEAVE_REQUESTS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_LEAVE_REQUESTS;
    }
};

const saveToStorage = (requests: LeaveRequest[]): void => {
    localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(requests));
};


export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const allRequests = getFromStorage();
    const currentUser = getCurrentUser();
    const canManage = currentUser?.permissions.includes('manage:leaves');
    if (canManage || !currentUser) {
        return Promise.resolve(allRequests);
    }
    // If not a manager, only return their own requests
    return Promise.resolve(allRequests.filter(r => r.employeeId === currentUser.id));
};

export const getLeaveRequestsForEmployee = async (employeeId: number): Promise<LeaveRequest[]> => {
    const allRequests = getFromStorage();
    return Promise.resolve(allRequests.filter(r => r.employeeId === employeeId));
};

export const addLeaveRequest = async (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> => {
    const requests = getFromStorage();
    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    const newRequest = { ...newRequestData, id: newId, status: 'Pending' as const };
    saveToStorage([...requests, newRequest]);
    return Promise.resolve(newRequest);
};

export const updateLeaveRequestStatus = async (id: number, status: 'Approved' | 'Rejected'): Promise<LeaveRequest> => {
    let requests = getFromStorage();
    let updatedRequest: LeaveRequest | undefined;
    
    requests = requests.map(r => {
        if (r.id === id) {
            updatedRequest = { ...r, status };
            return updatedRequest;
        }
        return r;
    });

    if (!updatedRequest) {
        return Promise.reject(new Error("Request not found"));
    }
    
    // Deduct from leave balance if approved
    if (status === 'Approved') {
        const employees = await getEmployees();
        const employee = employees.find(e => e.id === updatedRequest!.employeeId);
        if(employee) {
            const startDate = new Date(updatedRequest.startDate);
            const endDate = new Date(updatedRequest.endDate);
            let daysToDeduct = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
            
            const newBalance = { ...employee.leaveBalance };
            if(updatedRequest.leaveType === 'Short Leave') {
                 // no deduction for short leave, assuming it's handled differently or unpaid.
            } else if (updatedRequest.leaveType === 'Sick Leave') {
                newBalance.sick -= daysToDeduct;
            } else if (updatedRequest.leaveType === 'Personal') {
                newBalance.personal -= daysToDeduct;
            }
            
            await updateEmployee({ ...employee, leaveBalance: newBalance });
        }
    }
    
    saveToStorage(requests);
    return Promise.resolve(updatedRequest);
};
