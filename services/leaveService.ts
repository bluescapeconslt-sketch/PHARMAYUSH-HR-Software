import { LeaveRequest } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { getCurrentUser, hasPermission } from './authService.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(id, first_name, last_name, avatar)
      `)
      .order('created_at', { ascending: false});

    if (error) throw error;

    const allRequests = (data || []).map((req: any) => ({
      id: req.id,
      employeeId: req.employee_id,
      employeeName: `${req.employee.first_name} ${req.employee.last_name}`,
      employeeAvatar: req.employee.avatar || '',
      leaveType: req.leave_type,
      startDate: req.start_date,
      endDate: req.end_date,
      startTime: req.start_time,
      endTime: req.end_time,
      reason: req.reason,
      status: req.status,
    }));

    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    if (hasPermission('manage:leaves')) {
      return allRequests;
    }

    return allRequests.filter(req => req.employeeId === currentUser.id);
  } catch (error) {
    console.error('Failed to fetch leave requests from database', error);
    return [];
  }
};

export const getLeaveRequestsForEmployee = async (employeeId: string | number): Promise<LeaveRequest[]> => {
  try {
    const { data, error} = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(id, first_name, last_name, avatar)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((req: any) => ({
      id: req.id,
      employeeId: req.employee_id,
      employeeName: `${req.employee.first_name} ${req.employee.last_name}`,
      employeeAvatar: req.employee.avatar || '',
      leaveType: req.leave_type,
      startDate: req.start_date,
      endDate: req.end_date,
      startTime: req.start_time,
      endTime: req.end_time,
      reason: req.reason,
      status: req.status,
    }));
  } catch (error) {
    console.error('Failed to fetch leave requests for employee from database', error);
    return [];
  }
};

export const addLeaveRequest = async (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: newRequestData.employeeId,
        leave_type: newRequestData.leaveType,
        start_date: newRequestData.startDate,
        end_date: newRequestData.endDate,
        start_time: newRequestData.startTime,
        end_time: newRequestData.endTime,
        reason: newRequestData.reason,
        status: 'Pending',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to add leave request', error);
  }
};

export const updateLeaveRequestStatus = async (id: string | number, status: 'Approved' | 'Rejected'): Promise<LeaveRequest[]> => {
  try {
    const { data: requestData, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const requestToUpdate = requestData;

    if (requestToUpdate && status === 'Approved') {
      const employees = await getEmployees();
      const employee = employees.find(e => e.id === requestToUpdate.employee_id);

      if (employee) {
        const newBalance = { ...employee.leaveBalance };
        let balanceUpdated = false;

        if (requestToUpdate.leave_type === 'Short Leave') {
          if (newBalance.short >= 1) {
            newBalance.short -= 1;
            balanceUpdated = true;
          }
        } else {
          const startDate = new Date(requestToUpdate.start_date);
          const endDate = new Date(requestToUpdate.end_date);
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          switch (requestToUpdate.leave_type) {
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
            default:
              balanceUpdated = true;
              break;
          }
        }

        if (balanceUpdated) {
          await updateEmployee({ ...employee, leaveBalance: newBalance });
        } else {
          console.warn(`Insufficient leave balance for employee ${employee.name} to approve request ${id}.`);
        }
      }
    }

    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    return await getLeaveRequests();
  } catch (error) {
    console.error('Failed to update leave request status', error);
    return await getLeaveRequests();
  }
};
