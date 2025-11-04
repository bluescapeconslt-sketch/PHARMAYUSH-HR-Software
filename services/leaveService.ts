import { LeaveRequest } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { getCurrentUser, hasPermission } from './authService.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(id, first_name, last_name, avatar)
      `)
      .order('created_at', { ascending: false });

    // Users with 'manage:leaves' permission see all requests
    if (!hasPermission('manage:leaves')) {
      // Regular employees only see their own requests
      query = query.eq('employee_id', currentUser.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }

    return (data || []).map((req: any) => ({
      id: req.id,
      employeeId: req.employee_id,
      employeeName: `${req.employee?.first_name || ''} ${req.employee?.last_name || ''}`.trim(),
      employeeAvatar: req.employee?.avatar || '',
      leaveType: req.leave_type,
      startDate: req.start_date,
      endDate: req.end_date,
      startTime: req.start_time || '',
      endTime: req.end_time || '',
      reason: req.reason,
      status: req.status,
    }));
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    return [];
  }
};

export const getLeaveRequestsForEmployee = async (employeeId: number): Promise<LeaveRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(id, first_name, last_name, avatar)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employee leave requests:', error);
      return [];
    }

    return (data || []).map((req: any) => ({
      id: req.id,
      employeeId: req.employee_id,
      employeeName: `${req.employee?.first_name || ''} ${req.employee?.last_name || ''}`.trim(),
      employeeAvatar: req.employee?.avatar || '',
      leaveType: req.leave_type,
      startDate: req.start_date,
      endDate: req.end_date,
      startTime: req.start_time || '',
      endTime: req.end_time || '',
      reason: req.reason,
      status: req.status,
    }));
  } catch (error) {
    console.error('Failed to fetch employee leave requests:', error);
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
        start_time: newRequestData.startTime || null,
        end_time: newRequestData.endTime || null,
        reason: newRequestData.reason,
        status: 'Pending',
      });

    if (error) {
      console.error('Error adding leave request:', error);
    }
  } catch (error) {
    console.error('Failed to add leave request:', error);
  }
};

export const updateLeaveRequestStatus = async (id: number, status: 'Approved' | 'Rejected'): Promise<void> => {
  try {
    // First get the leave request to know the employee and leave type
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('employee_id, leave_type, start_date, end_date')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !leaveRequest) {
      console.error('Error fetching leave request:', fetchError);
      return;
    }

    // Update the leave request status
    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating leave request status:', updateError);
      return;
    }

    // If approved, deduct from employee's leave balance
    if (status === 'Approved') {
      const employees = await getEmployees();
      const employee = employees.find(e => e.id === leaveRequest.employee_id);

      if (employee) {
        const leaveBalance = { ...employee.leaveBalance };
        const leaveType = leaveRequest.leave_type;

        // Calculate days
        const start = new Date(leaveRequest.start_date);
        const end = new Date(leaveRequest.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (leaveType === 'Short Leave' && leaveBalance.short > 0) {
          leaveBalance.short = Math.max(0, leaveBalance.short - 1);
        } else if (leaveType === 'Sick Leave' && leaveBalance.sick >= diffDays) {
          leaveBalance.sick -= diffDays;
        } else if (leaveType === 'Personal' && leaveBalance.personal >= diffDays) {
          leaveBalance.personal -= diffDays;
        }

        await updateEmployee({ ...employee, leaveBalance });
      }
    }
  } catch (error) {
    console.error('Failed to update leave request status:', error);
  }
};
