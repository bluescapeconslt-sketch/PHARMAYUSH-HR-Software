import { LeaveRequest } from '../types.ts';
import { supabase } from './supabaseClient.ts';
import { getCurrentUser, hasPermission } from './authService.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';

interface LeaveRequestData {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

const transformToLeaveRequest = (data: LeaveRequestData, index: number, employeeId: number, employeeName: string, employeeAvatar: string): LeaveRequest => {
  return {
    id: index + 1,
    employeeId: employeeId,
    employeeName: employeeName,
    employeeAvatar: employeeAvatar,
    leaveType: data.leave_type as 'Vacation' | 'Sick Leave' | 'Personal' | 'Unpaid' | 'Short Leave',
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    status: data.status as 'Pending' | 'Approved' | 'Rejected',
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined
  };
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const employees = await getEmployees();
    const { data: allEmployees } = await supabase.from('employees').select('id, name, avatar');
    const empMap = new Map(allEmployees?.map(e => [e.id, { name: e.name, avatar: e.avatar }]) || []);

    let allRequests = (data || []).map((request, index) => {
      const empInfo = empMap.get(request.employee_id);
      const empIndex = employees.findIndex(e => e.name === empInfo?.name);
      const employeeId = empIndex >= 0 ? empIndex + 1 : 1;

      return transformToLeaveRequest(
        request,
        index,
        employeeId,
        empInfo?.name || 'Unknown',
        empInfo?.avatar || ''
      );
    });

    if (hasPermission('manage:leaves')) {
      return allRequests;
    }

    return allRequests.filter(req => req.employeeId === currentUser.id);
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    return [];
  }
};

export const getLeaveRequestsForEmployee = async (employeeId: number): Promise<LeaveRequest[]> => {
  try {
    const allRequests = await getLeaveRequests();
    return allRequests.filter(req => req.employeeId === employeeId);
  } catch (error) {
    console.error('Failed to fetch leave requests for employee:', error);
    return [];
  }
};

export const addLeaveRequest = async (newRequestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<boolean> => {
  try {
    const employees = await getEmployees();
    const employee = employees.find(e => e.id === newRequestData.employeeId);

    if (!employee) {
      console.error('Employee not found');
      return false;
    }

    const { data: empData } = await supabase
      .from('employees')
      .select('id')
      .eq('name', employee.name)
      .single();

    if (!empData) {
      console.error('Employee UUID not found');
      return false;
    }

    const { error } = await supabase
      .from('leave_requests')
      .insert([{
        employee_id: empData.id,
        leave_type: newRequestData.leaveType,
        start_date: newRequestData.startDate,
        end_date: newRequestData.endDate,
        reason: newRequestData.reason,
        status: 'Pending',
        start_time: newRequestData.startTime || null,
        end_time: newRequestData.endTime || null
      }]);

    if (error) {
      console.error('Error adding leave request:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to add leave request:', error);
    return false;
  }
};

export const updateLeaveRequestStatus = async (id: number, status: 'Approved' | 'Rejected'): Promise<LeaveRequest[]> => {
  try {
    const { data: requests } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!requests || requests.length === 0) return [];

    const targetRequest = requests[id - 1];
    if (!targetRequest) return [];

    if (status === 'Approved') {
      const employees = await getEmployees();
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id', targetRequest.employee_id)
        .single();

      if (empData) {
        const employee = employees.find(e => e.name === empData.name);
        if (employee) {
          const startDate = new Date(targetRequest.start_date);
          const endDate = new Date(targetRequest.end_date);
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const newBalance = { ...employee.leaveBalance };
          let balanceUpdated = false;

          switch (targetRequest.leave_type) {
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
            default:
              balanceUpdated = true;
              break;
          }

          if (balanceUpdated) {
            await updateEmployee({ ...employee, leaveBalance: newBalance });
          }
        }
      }
    }

    const { error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', targetRequest.id);

    if (error) {
      console.error('Error updating leave request:', error);
      return [];
    }

    return await getLeaveRequests();
  } catch (error) {
    console.error('Failed to update leave request status:', error);
    return [];
  }
};
