import { PerformancePointRecord, PerformancePointCriteria, Employee } from '../types.ts';
import { DEFAULT_PERFORMANCE_RECORDS } from './mockData.ts';
import { getEmployees, updateEmployee } from './employeeService.ts';
import { BADGES } from '../constants.tsx';
import { getCurrentUser } from './authService.ts';

const RECOGNITION_KEY = 'pharmayush_hr_performance_records';

const getFromStorage = (): PerformancePointRecord[] => {
    try {
        const data = localStorage.getItem(RECOGNITION_KEY);
        if (!data) {
            localStorage.setItem(RECOGNITION_KEY, JSON.stringify(DEFAULT_PERFORMANCE_RECORDS));
            return DEFAULT_PERFORMANCE_RECORDS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_PERFORMANCE_RECORDS;
    }
};

const saveToStorage = (records: PerformancePointRecord[]): void => {
    localStorage.setItem(RECOGNITION_KEY, JSON.stringify(records));
};

export const getPerformanceRecords = async (): Promise<PerformancePointRecord[]> => {
    return Promise.resolve(getFromStorage());
};

export const getRecordsForEmployee = async (employeeId: number): Promise<PerformancePointRecord[]> => {
    const records = getFromStorage();
    return Promise.resolve(records.filter(r => r.employeeId === employeeId));
};

export const awardPoints = async (
    employeeId: number, 
    points: number, 
    criteria: PerformancePointCriteria, 
    reason: string
): Promise<Employee> => {
    const records = getFromStorage();
    const employees = await getEmployees();
    const adminUser = getCurrentUser();
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
        throw new Error("Employee not found");
    }

    // 1. Create a new point record
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    const newRecord: PerformancePointRecord = {
        id: newId,
        employeeId,
        points,
        criteria,
        reason,
        date: new Date().toISOString().split('T')[0],
        awardedBy: adminUser?.name || 'System',
    };
    saveToStorage([...records, newRecord]);

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
    const updatedEmployee: Employee = {
        ...employee,
        performancePoints: updatedPoints,
        badges: updatedBadges,
    };
    await updateEmployee(updatedEmployee);

    return Promise.resolve(updatedEmployee);
};