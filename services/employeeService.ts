import { Employee } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';
import { getCurrentUser, updateCurrentUserSession } from './authService.ts';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(name),
        role:roles(id, name),
        shift:shifts(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return (data || []).map((emp: any) => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      position: emp.position || 'Employee',
      jobTitle: emp.job_title || '',
      department: emp.department?.name || '',
      email: emp.email,
      password: emp.password,
      avatar: emp.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + emp.email,
      status: emp.employment_status || 'Active',
      birthday: emp.date_of_birth || '',
      leaveBalance: emp.leave_balance || { short: 0, sick: 0, personal: 0 },
      roleId: emp.role_id || 0,
      shiftId: emp.shift_id,
      baseSalary: emp.salary,
      lastLeaveAllocation: emp.last_leave_allocation || '',
      reportsTo: emp.reports_to,
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

export const addEmployee = async (newEmployeeData: Omit<Employee, 'id'>): Promise<Employee[]> => {
  try {
    const [firstName, ...lastNameParts] = newEmployeeData.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const { error } = await supabase
      .from('employees')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: newEmployeeData.email,
        password: newEmployeeData.password,
        phone: '',
        date_of_birth: newEmployeeData.birthday,
        job_title: newEmployeeData.jobTitle,
        position: newEmployeeData.position,
        employment_status: newEmployeeData.status,
        salary: newEmployeeData.baseSalary,
        role_id: newEmployeeData.roleId,
        shift_id: newEmployeeData.shiftId,
        avatar: newEmployeeData.avatar,
        leave_balance: newEmployeeData.leaveBalance,
        last_leave_allocation: newEmployeeData.lastLeaveAllocation,
      });

    if (error) {
      console.error('Error adding employee:', error);
    }

    return await getEmployees();
  } catch (error) {
    console.error('Failed to add employee:', error);
    return await getEmployees();
  }
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee[]> => {
  try {
    const [firstName, ...lastNameParts] = updatedEmployee.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const { error } = await supabase
      .from('employees')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: updatedEmployee.email,
        password: updatedEmployee.password,
        date_of_birth: updatedEmployee.birthday,
        job_title: updatedEmployee.jobTitle,
        position: updatedEmployee.position,
        employment_status: updatedEmployee.status,
        salary: updatedEmployee.baseSalary,
        role_id: updatedEmployee.roleId,
        shift_id: updatedEmployee.shiftId,
        avatar: updatedEmployee.avatar,
        leave_balance: updatedEmployee.leaveBalance,
        last_leave_allocation: updatedEmployee.lastLeaveAllocation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedEmployee.id);

    if (error) {
      console.error('Error updating employee:', error);
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedEmployee.id) {
      const { password: _, ...userProfile } = updatedEmployee;
      updateCurrentUserSession(userProfile);
    }

    return await getEmployees();
  } catch (error) {
    console.error('Failed to update employee:', error);
    return await getEmployees();
  }
};

export const deleteEmployee = async (id: number): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
    }

    return await getEmployees();
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return await getEmployees();
  }
};

export const checkAndAllocateMonthlyLeaves = async (): Promise<void> => {
  try {
    const allEmployees = await getEmployees();
    if (allEmployees.length === 0) return;

    const allocationSettings = getLeaveAllocationSettings();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentUser = getCurrentUser();

    for (const employee of allEmployees) {
      const lastAllocation = employee.lastLeaveAllocation || '2000-01';

      if (lastAllocation !== currentMonth) {
        console.log(`Resetting and allocating leaves for ${employee.name} for ${currentMonth}`);

        const updatedEmployee = {
          ...employee,
          leaveBalance: {
            short: allocationSettings.short,
            sick: allocationSettings.sick,
            personal: allocationSettings.personal,
          },
          lastLeaveAllocation: currentMonth,
        };

        await updateEmployee(updatedEmployee);

        if (currentUser && currentUser.id === updatedEmployee.id) {
          const { password: _, ...userProfile } = updatedEmployee;
          updateCurrentUserSession(userProfile);
        }
      }
    }
  } catch (error) {
    console.error('Failed to allocate monthly leaves:', error);
  }
};

export const reapplyLeaveSettingsToAllEmployees = async (): Promise<void> => {
  try {
    const allEmployees = await getEmployees();
    const allocationSettings = getLeaveAllocationSettings();
    const currentUser = getCurrentUser();

    for (const employee of allEmployees) {
      const updatedEmployee = {
        ...employee,
        leaveBalance: {
          short: allocationSettings.short,
          sick: allocationSettings.sick,
          personal: allocationSettings.personal,
        },
      };

      await updateEmployee(updatedEmployee);

      if (currentUser && currentUser.id === updatedEmployee.id) {
        const { password: _, ...userProfile } = updatedEmployee;
        updateCurrentUserSession(userProfile);
      }
    }
  } catch (error) {
    console.error('Failed to reapply leave settings:', error);
  }
};
