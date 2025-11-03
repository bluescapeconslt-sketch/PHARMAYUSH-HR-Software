import { supabase } from './supabaseClient.ts';
import { Employee, Position } from '../types.ts';
import { getRoles, RoleWithUUID } from './roleService.ts';

export interface EmployeeData {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  department_id: string | null;
  role_id: string | null;
  job_title: string | null;
  hire_date: string | null;
  employment_status: string;
  salary: number | null;
  bank_account: string | null;
  bank_name: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeWithUUID extends Employee {
  uuid: string;
  roleUuid: string | null;
  departmentUuid: string | null;
}

const employeeCache = new Map<number, string>();

const transformToEmployee = (
  data: EmployeeData,
  departments: any[],
  roles: RoleWithUUID[],
  index: number
): EmployeeWithUUID => {
  const department = departments.find(d => d.id === data.department_id);
  const role = roles.find(r => r.uuid === data.role_id);
  const idNum = index + 1;

  return {
    id: idNum,
    uuid: data.id,
    name: `${data.first_name} ${data.last_name}`,
    position: 'Employee' as Position,
    jobTitle: data.job_title || 'Employee',
    department: department?.name || 'Unknown',
    departmentUuid: data.department_id,
    email: data.email,
    password: data.password,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.first_name)}+${encodeURIComponent(data.last_name)}&background=4f46e5&color=fff`,
    status: data.employment_status === 'active' ? 'Active' : 'On Leave',
    birthday: data.date_of_birth || '2000-01-01',
    leaveBalance: {
      vacation: 20,
      sick: 10,
      personal: 5
    },
    roleId: role?.id || 1,
    roleUuid: data.role_id
  };
};

export const getEmployees = async (): Promise<EmployeeWithUUID[]> => {
  try {
    const [employeesRes, departmentsRes, roles] = await Promise.all([
      supabase.from('employees').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*'),
      getRoles()
    ]);

    if (employeesRes.error) {
      console.error('Error fetching employees:', employeesRes.error);
      return [];
    }

    if (departmentsRes.error) {
      console.error('Error fetching departments:', departmentsRes.error);
    }

    const departments = departmentsRes.data || [];
    employeeCache.clear();
    const employees = (employeesRes.data || []).map((emp, index) => {
      const transformed = transformToEmployee(emp, departments, roles, index);
      employeeCache.set(transformed.id, transformed.uuid);
      return transformed;
    });

    return employees;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

export const addEmployee = async (newEmployeeData: Omit<EmployeeData, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeData | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([newEmployeeData])
      .select()
      .single();

    if (error) {
      console.error('Error adding employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to add employee:', error);
    return null;
  }
};

export const updateEmployee = async (updatedEmployee: any): Promise<EmployeeData | null> => {
  try {
    const employeeId = typeof updatedEmployee.id === 'number'
      ? employeeCache.get(updatedEmployee.id) || updatedEmployee.uuid
      : updatedEmployee.id;

    if (!employeeId) {
      console.error('Employee ID not found');
      return null;
    }

    const { id, uuid, roleId, departmentId, roleUuid, departmentUuid, ...updateData } = updatedEmployee;

    const dbUpdate: any = {};

    if (updateData.first_name !== undefined) dbUpdate.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) dbUpdate.last_name = updateData.last_name;
    if (updateData.email !== undefined) dbUpdate.email = updateData.email;
    if (updateData.password !== undefined) dbUpdate.password = updateData.password;
    if (updateData.phone !== undefined) dbUpdate.phone = updateData.phone;
    if (updateData.date_of_birth !== undefined) dbUpdate.date_of_birth = updateData.date_of_birth;
    if (updateData.address !== undefined) dbUpdate.address = updateData.address;
    if (updateData.city !== undefined) dbUpdate.city = updateData.city;
    if (updateData.state !== undefined) dbUpdate.state = updateData.state;
    if (updateData.postal_code !== undefined) dbUpdate.postal_code = updateData.postal_code;
    if (updateData.country !== undefined) dbUpdate.country = updateData.country;
    if (updateData.job_title !== undefined) dbUpdate.job_title = updateData.job_title;
    if (updateData.hire_date !== undefined) dbUpdate.hire_date = updateData.hire_date;
    if (updateData.employment_status !== undefined) dbUpdate.employment_status = updateData.employment_status;
    if (updateData.salary !== undefined) dbUpdate.salary = updateData.salary;
    if (updateData.bank_account !== undefined) dbUpdate.bank_account = updateData.bank_account;
    if (updateData.bank_name !== undefined) dbUpdate.bank_name = updateData.bank_name;

    if (roleUuid !== undefined) dbUpdate.role_id = roleUuid;
    if (departmentUuid !== undefined) dbUpdate.department_id = departmentUuid;

    const { data, error } = await supabase
      .from('employees')
      .update(dbUpdate)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update employee:', error);
    return null;
  }
};

export const deleteEmployee = async (id: number | string): Promise<boolean> => {
  try {
    const employeeId = typeof id === 'number' ? employeeCache.get(id) : id;

    if (!employeeId) {
      console.error('Employee ID not found');
      return false;
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return false;
  }
};

export type { EmployeeWithUUID };
