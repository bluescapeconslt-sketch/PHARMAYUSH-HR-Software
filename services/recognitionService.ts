import { PerformancePointRecord, PerformancePointCriteria, Employee } from '../types.ts';
import { find, insert } from './db.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';
import { BADGES } from '../constants.tsx';
import { getCurrentUser } from './authService.ts';

const TABLE = 'performance_records';

export const getPerformanceRecords = (): Promise<PerformancePointRecord[]> => find(TABLE);

export const getRecordsForEmployee = async (employeeId: number): Promise<PerformancePointRecord[]> => {
    const allRecords = await find<PerformancePointRecord>(TABLE);
    return allRecords.filter(r => r.employeeId === employeeId);
};

export const awardPoints = async (
    employeeId: number, 
    points: number, 
    criteria: PerformancePointCriteria, 
    reason: string
): Promise<Employee> => {
    const employees = await getEmployees();
    const adminUser = getCurrentUser();
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
        throw new Error("Employee not found");
    }

    // 1. Create a new point record
    const newRecord: Omit<PerformancePointRecord, 'id'> = {
        employeeId,
        points,
        criteria,
        reason,
        date: new Date().toISOString().split('T')[0],
        awardedBy: adminUser?.name || 'System',
    };
    await insert(TABLE, newRecord);

    // 2. Update employee's total points
    const updatedPoints = employee.performancePoints + points;
    
    // 3. Check for new badges
    const updatedBadges = [...employee.badges];
    for (const badge of BADGES) {
        if (updatedPoints >= badge.requiredPoints && !employee.badges.includes(badge.name)) {
            updatedBadges.push(badge.name);
        }
    }

    // 4. Save updated employee
    const updatedEmployeeData: Employee = {
        ...employee,
        performancePoints: updatedPoints,
        badges: updatedBadges,
    };
    const updatedEmployee = await updateEmployee(updatedEmployeeData);

    return updatedEmployee;
};
