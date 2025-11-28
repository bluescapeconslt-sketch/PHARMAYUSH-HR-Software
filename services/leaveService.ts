import { LeaveRequest } from '../types.ts';
import { find, insert, update, findById } from './db.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';
import { getCurrentUser } from './authService.ts';
import { notifyAdmins, createNotification } from './notificationService.ts';

const TABLE = 'leave_requests';

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const currentUser = getCurrentUser();
    const canManage = currentUser?.permissions.includes('manage:leaves');
    
    const allRequests = await find<LeaveRequest>(TABLE);

    if (!canManage && currentUser) {
        return allRequests.filter(req => req.employeeId === currentUser.id);
    }
    return allRequests;
};

export const getLeaveRequestsForEmployee = async (employeeId: number): Promise<LeaveRequest[]> => {
    const allRequests = await find<LeaveRequest>(TABLE);
    return allRequests.filter(req => req.employeeId === employeeId);
};

export const addLeaveRequest = async (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> => {
    const newRequest = { ...newRequestData, status: 'Pending' as const };
    const request = await insert<LeaveRequest>(TABLE, newRequest);

    // Notify Admins/Managers
    await notifyAdmins(
        'leave_request',
        'New Leave Request',
        `${newRequestData.employeeName} has requested ${newRequestData.leaveType}.`,
        'leaves'
    );

    return request;
};

export const updateLeaveRequestStatus = async (id: number, status: 'Approved' | 'Rejected'): Promise<LeaveRequest> => {
    
    const requestToUpdate = await findById<LeaveRequest>(TABLE, id);
    if(!requestToUpdate) throw new Error("Request not found");

    const updatedRequestData = await update<LeaveRequest>(TABLE, { ...requestToUpdate, status } as LeaveRequest);
    
    // Notify the employee
    await createNotification(
        updatedRequestData.employeeId,
        'leave_status',
        `Leave Request ${status}`,
        `Your ${updatedRequestData.leaveType} request for ${updatedRequestData.startDate} has been ${status}.`,
        'leaves'
    );

    // Deduct from leave balance if approved
    if (status === 'Approved') {
        const employees = await getEmployees();
        const employee = employees.find(e => e.id === updatedRequestData!.employeeId);
        if(employee) {
            const startDate = new Date(updatedRequestData.startDate);
            const endDate = new Date(updatedRequestData.endDate);
            let daysToDeduct = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
            
            const newBalance = { ...employee.leaveBalance };
            if(updatedRequestData.leaveType === 'Short Leave') {
                 // no deduction for short leave, assuming it's handled differently or unpaid.
            } else if (updatedRequestData.leaveType === 'Sick Leave') {
                newBalance.sick -= daysToDeduct;
            } else if (updatedRequestData.leaveType === 'Personal') {
                newBalance.personal -= daysToDeduct;
            }
            
            await updateEmployee({ ...employee, leaveBalance: newBalance });
        }
    }
    
    return updatedRequestData;
};