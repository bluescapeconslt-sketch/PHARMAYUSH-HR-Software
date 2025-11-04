import { Employee } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';
import { getCurrentUser, updateCurrentUserSession } from './authService.ts';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        role:roles(id, name),
        shift:shifts(id, name, start_time, end_time)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((emp: any) => ({
      id: emp.id,
      email: emp.email,
      password: emp.password,
      name: `${emp.first_name} ${emp.last_name}`,
      firstName: emp.first_name,
      lastName: emp.last_name,
      phone: emp.phone || '',
      dateOfBirth: emp.date_of_birth || '',
      address: emp.address || '',
      city: emp.city || '',
      state: emp.state || '',
      postalCode: emp.postal_code || '',
      country: emp.country || '',
      departmentId: emp.department_id,
      department: emp.department?.name || '',
      roleId: emp.role_id,
      role: emp.role?.name || '',
      jobTitle: emp.job_title || '',
      position: emp.position || 'Employee',
      hireDate: emp.hire_date || '',
      employmentStatus: emp.employment_status || 'active',
      salary: emp.salary || 0,
      bankAccount: emp.bank_account || '',
      bankName: emp.bank_name || '',
      shiftId: emp.shift_id,
      shift: emp.shift?.name || '',
      shiftTime: emp.shift ? `${emp.shift.start_time} - ${emp.shift.end_time}` : '',
      avatar: emp.avatar || '',
      leaveBalance: emp.leave_balance || { sick: 0, short: 0, personal: 0 },
      lastLeaveAllocation: emp.last_leave_allocation || '',
    }));
  } catch (error) {
    console.error('Failed to fetch employees from database', error);
    return [];
  }
};

export const addEmployee = async (newEmployeeData: Omit<Employee, 'id'>): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .insert({
        email: newEmployeeData.email,
        password: newEmployeeData.password,
        first_name: newEmployeeData.firstName,
        last_name: newEmployeeData.lastName,
        phone: newEmployeeData.phone,
        date_of_birth: newEmployeeData.dateOfBirth,
        address: newEmployeeData.address,
        city: newEmployeeData.city,
        state: newEmployeeData.state,
        postal_code: newEmployeeData.postalCode,
        country: newEmployeeData.country,
        department_id: newEmployeeData.departmentId,
        role_id: newEmployeeData.roleId,
        job_title: newEmployeeData.jobTitle,
        position: newEmployeeData.position || 'Employee',
        hire_date: newEmployeeData.hireDate,
        employment_status: newEmployeeData.employmentStatus || 'active',
        salary: newEmployeeData.salary,
        bank_account: newEmployeeData.bankAccount,
        bank_name: newEmployeeData.bankName,
        shift_id: newEmployeeData.shiftId,
        avatar: newEmployeeData.avatar,
        leave_balance: newEmployeeData.leaveBalance || { sick: 0, short: 0, personal: 0 },
        last_leave_allocation: newEmployeeData.lastLeaveAllocation || '',
      });

    if (error) throw error;

    return await getEmployees();
  } catch (error) {
    console.error('Failed to add employee', error);
    return await getEmployees();
  }
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .update({
        email: updatedEmployee.email,
        password: updatedEmployee.password,
        first_name: updatedEmployee.firstName,
        last_name: updatedEmployee.lastName,
        phone: updatedEmployee.phone,
        date_of_birth: updatedEmployee.dateOfBirth,
        address: updatedEmployee.address,
        city: updatedEmployee.city,
        state: updatedEmployee.state,
        postal_code: updatedEmployee.postalCode,
        country: updatedEmployee.country,
        department_id: updatedEmployee.departmentId,
        role_id: updatedEmployee.roleId,
        job_title: updatedEmployee.jobTitle,
        position: updatedEmployee.position,
        hire_date: updatedEmployee.hireDate,
        employment_status: updatedEmployee.employmentStatus,
        salary: updatedEmployee.salary,
        bank_account: updatedEmployee.bankAccount,
        bank_name: updatedEmployee.bankName,
        shift_id: updatedEmployee.shiftId,
        avatar: updatedEmployee.avatar,
        leave_balance: updatedEmployee.leaveBalance,
        last_leave_allocation: updatedEmployee.lastLeaveAllocation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedEmployee.id);

    if (error) throw error;

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedEmployee.id) {
      const { password: _, ...userProfile } = updatedEmployee;
      updateCurrentUserSession(userProfile);
    }

    return await getEmployees();
  } catch (error) {
    console.error('Failed to update employee', error);
    return await getEmployees();
  }
};

export const deleteEmployee = async (id: string | number): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getEmployees();
  } catch (error) {
    console.error('Failed to delete employee', error);
    return await getEmployees();
  }
};

export const checkAndAllocateMonthlyLeaves = async (): Promise<void> => {
  const allEmployees = await getEmployees();
  if (allEmployees.length === 0) return;

  const allocationSettings = getLeaveAllocationSettings();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentUser = getCurrentUser();

  const employeesToUpdate = allEmployees.filter(employee => {
    const lastAllocation = employee.lastLeaveAllocation || '2000-01';
    return lastAllocation !== currentMonth;
  });

  if (employeesToUpdate.length === 0) return;

  try {
    for (const employee of employeesToUpdate) {
      await supabase
        .from('employees')
        .update({
          leave_balance: {
            short: allocationSettings.short,
            sick: allocationSettings.sick,
            personal: allocationSettings.personal,
          },
          last_leave_allocation: currentMonth,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);

      if (currentUser && currentUser.id === employee.id) {
        const updatedEmployee = {
          ...employee,
          leaveBalance: {
            short: allocationSettings.short,
            sick: allocationSettings.sick,
            personal: allocationSettings.personal,
          },
          lastLeaveAllocation: currentMonth,
        };
        const { password: _, ...userProfile } = updatedEmployee;
        updateCurrentUserSession(userProfile);
      }
    }
  } catch (error) {
    console.error('Failed to allocate monthly leaves', error);
  }
};

export const reapplyLeaveSettingsToAllEmployees = async (): Promise<void> => {
  const allocationSettings = getLeaveAllocationSettings();
  const allEmployees = await getEmployees();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentUser = getCurrentUser();

  const employeesToUpdate = allEmployees.filter(
    employee => employee.lastLeaveAllocation === currentMonth
  );

  if (employeesToUpdate.length === 0) return;

  try {
    for (const employee of employeesToUpdate) {
      await supabase
        .from('employees')
        .update({
          leave_balance: {
            short: allocationSettings.short,
            sick: allocationSettings.sick,
            personal: allocationSettings.personal,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);
    }

    const updatedCurrentUser = employeesToUpdate.find(
      e => currentUser && e.id === currentUser.id
    );
    if (updatedCurrentUser) {
      const updatedEmployee = {
        ...updatedCurrentUser,
        leaveBalance: {
          short: allocationSettings.short,
          sick: allocationSettings.sick,
          personal: allocationSettings.personal,
        },
      };
      const { password: _, ...userProfile } = updatedEmployee;
      updateCurrentUserSession(userProfile);
    }
  } catch (error) {
    console.error('Failed to reapply leave settings', error);
  }
};
