
import { getEmployees } from './employeeService.ts';
import { getAttendanceRecords } from './attendanceService.ts';
import { Employee } from '../types.ts';

export interface PayrollData {
  employeeId: number;
  employeeName: string;
  baseMonthlySalary: number;
  workingDays: number;
  attendedDays: number;
  payableSalary: number;
}

const getWorkingDaysInMonth = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek > 0 && dayOfWeek < 6) {
      workingDays++;
    }
  }
  return workingDays;
};

export const calculatePayrollForMonth = async (year: number, month: number): Promise<PayrollData[]> => {
  const [employees, attendanceRecords] = await Promise.all([
    getEmployees(),
    getAttendanceRecords()
  ]);
  
  const workingDays = getWorkingDaysInMonth(year, month);

  const payrollResults: PayrollData[] = [];

  for (const employee of employees) {
    if (!employee.baseSalary || employee.baseSalary <= 0) {
      payrollResults.push({
        employeeId: employee.id,
        employeeName: employee.name,
        baseMonthlySalary: 0,
        workingDays,
        attendedDays: 0,
        payableSalary: 0,
      });
      continue;
    }

    const baseMonthlySalary = employee.baseSalary;

    const employeeAttendance = attendanceRecords.filter(
      (record) =>
        record.employeeId === employee.id &&
        new Date(record.date).getFullYear() === year &&
        new Date(record.date).getMonth() === month
    );
    
    const attendedDaysSet = new Set(employeeAttendance.map(rec => rec.date));
    const attendedDays = attendedDaysSet.size;

    const dailyRate = workingDays > 0 ? baseMonthlySalary / workingDays : 0;
    const payableSalary = dailyRate * attendedDays;
    
    payrollResults.push({
      employeeId: employee.id,
      employeeName: employee.name,
      baseMonthlySalary: parseFloat(baseMonthlySalary.toFixed(2)),
      workingDays,
      attendedDays,
      payableSalary: parseFloat(payableSalary.toFixed(2)),
    });
  }
  
  return payrollResults;
};
