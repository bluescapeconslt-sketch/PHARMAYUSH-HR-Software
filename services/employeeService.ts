import { Employee } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { getLeaveAllocationSettings } from './leaveAllocationService.ts';

let employeesCache: Employee[] | null = null;

export const getEmployees = (): Employee[] => {
  if (employeesCache) {
    return employeesCache;
  }
  return [];
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments(name),
        roles(name),
        shifts(name, start_time, end_time)
      `);

    if (error) throw error;

    const employees: Employee[] = (data || []).map((emp: any) => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      password: emp.password,
      phone: emp.phone || '',
      dateOfBirth: emp.date_of_birth || '',
      address: emp.address || '',
      city: emp.city || '',
      state: emp.state || '',
      postalCode: emp.postal_code || '',
      country: emp.country || '',
      departmentId: emp.department_id,
      department: emp.departments?.name || '',
      roleId: emp.role_id,
      role: emp.roles?.name || '',
      position: emp.position || 'Employee',
      jobTitle: emp.job_title || '',
      hireDate: emp.hire_date || '',
      employmentStatus: emp.employment_status || 'active',
      salary: emp.salary || 0,
      baseSalary: emp.salary || 0,
      bankAccount: emp.bank_account || '',
      bankName: emp.bank_name || '',
      shiftId: emp.shift_id,
      shift: emp.shifts?.name || '',
      avatar: emp.avatar || '',
      leaveBalance: emp.leave_balance || { sick: 0, short: 0, personal: 0 },
      lastLeaveAllocation: emp.last_leave_allocation || '',
      status: 'Active',
      birthday: emp.date_of_birth || '',
    }));

    employeesCache = employees;
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const addEmployee = async (newEmployeeData: Omit<Employee, 'id'>): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .insert([{
        first_name: newEmployeeData.name.split(' ')[0],
        last_name: newEmployeeData.name.split(' ').slice(1).join(' '),
        email: newEmployeeData.email,
        password: newEmployeeData.password,
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
        position: newEmployeeData.position,
        hire_date: newEmployeeData.hireDate,
        employment_status: newEmployeeData.employmentStatus,
        salary: newEmployeeData.salary,
        bank_account: newEmployeeData.bankAccount,
        bank_name: newEmployeeData.bankName,
        shift_id: newEmployeeData.shiftId,
        avatar: newEmployeeData.avatar,
        leave_balance: newEmployeeData.leaveBalance,
        last_leave_allocation: newEmployeeData.lastLeaveAllocation,
      }]);

    if (error) throw error;

    return await fetchEmployees();
  } catch (error) {
    console.error('Error adding employee:', error);
    return getEmployees();
  }
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .update({
        first_name: updatedEmployee.name.split(' ')[0],
        last_name: updatedEmployee.name.split(' ').slice(1).join(' '),
        email: updatedEmployee.email,
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
      })
      .eq('id', updatedEmployee.id);

    if (error) throw error;

    return await fetchEmployees();
  } catch (error) {
    console.error('Error updating employee:', error);
    return getEmployees();
  }
};

export const deleteEmployee = async (id: number | string): Promise<Employee[]> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await fetchEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
    return getEmployees();
  }
};

export const checkAndAllocateMonthlyLeaves = async (): Promise<void> => {
  const allEmployees = await fetchEmployees();
  if (allEmployees.length === 0) return;

  const allocationSettings = getLeaveAllocationSettings();
  const currentMonth = new Date().toISOString().slice(0, 7);

  for (const employee of allEmployees) {
    const lastAllocation = employee.lastLeaveAllocation || '2000-01';

    if (lastAllocation !== currentMonth) {
      console.log(`Allocating leaves for ${employee.name} for ${currentMonth}`);

      const updatedEmployee = {
        ...employee,
        leaveBalance: {
          short: (employee.leaveBalance.short || 0) + allocationSettings.short,
          sick: (employee.leaveBalance.sick || 0) + allocationSettings.sick,
          personal: (employee.leaveBalance.personal || 0) + allocationSettings.personal,
        },
        lastLeaveAllocation: currentMonth,
      };

      await updateEmployee(updatedEmployee);
    }
  }
};
