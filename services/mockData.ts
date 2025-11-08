import { Role, Department, Shift, Policy, Employee, LeaveRequest, OnboardingTask, Meeting, Notice, Complaint, AttendanceRecord, PerformancePointRecord } from '../types.ts';

// Default Data to seed the mock database (localStorage)

export const DEFAULT_ROLES: Role[] = [
  { id: 1, name: 'Admin', permissions: [ 'view:employees', 'manage:employees', 'view:leaves', 'manage:leaves', 'view:onboarding', 'manage:onboarding', 'view:policies', 'manage:policies', 'manage:notices', 'manage:departments', 'manage:meetings', 'view:attendance-report', 'use:performance-review', 'use:job-description', 'use:generate-letter', 'use:hr-assistant', 'manage:settings', 'manage:users', 'manage:roles', 'manage:shifts', 'manage:payroll', 'view:complaints', 'view:recognition', 'manage:recognition' ] },
  { id: 2, name: 'Employee', permissions: [ 'view:leaves', 'use:hr-assistant', 'view:recognition' ] },
  { id: 3, name: 'HR Manager', permissions: [ 'view:employees', 'manage:employees', 'view:leaves', 'manage:leaves', 'view:onboarding', 'manage:onboarding', 'view:policies', 'manage:policies', 'manage:notices', 'use:performance-review', 'use:job-description', 'use:generate-letter', 'use:hr-assistant', 'manage:shifts', 'view:complaints', 'view:recognition', 'manage:recognition' ] }
];

export const DEFAULT_DEPARTMENTS: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Human Resources' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Sales' },
    { id: 5, name: 'Executive' },
];

export const DEFAULT_SHIFTS: Shift[] = [
    { id: 1, name: 'General Shift', startTime: '09:00', endTime: '17:00' },
    { id: 2, name: 'Morning Shift', startTime: '06:00', endTime: '14:00' },
    { id: 3, name: 'Night Shift', startTime: '22:00', endTime: '06:00' },
];

export const DEFAULT_POLICIES: Policy[] = [
    { id: 1, title: 'Remote Work Policy', category: 'Workplace', content: 'Employees are permitted to work remotely for up to two days per week, subject to manager approval. Remote work days should be scheduled in advance to ensure adequate office coverage. All employees working remotely are expected to be available during standard working hours and maintain their regular level of productivity.' },
    { id: 2, title: 'Code of Conduct', category: 'Ethics', content: 'All employees are expected to maintain a professional and respectful work environment. Harassment, discrimination, and bullying in any form will not be tolerated. We are committed to providing a safe and inclusive workplace for everyone.' },
    { id: 3, title: 'Paid Time Off (PTO)', category: 'Leave', content: 'Full-time employees accrue PTO at a rate of 1.25 days per month. Unused PTO can be rolled over to the next year, up to a maximum of 10 days. All PTO requests must be submitted through the HR portal at least two weeks in advance, unless in case of emergency.'},
];

export const DEFAULT_NOTICES: Notice[] = [
    { id: 1, title: 'Quarterly All-Hands Meeting', content: 'The Q3 All-Hands meeting will be held on Friday at 10:00 AM in the main conference room.', authorName: 'HR Department', date: new Date().toISOString().split('T')[0], color: 'blue' },
];

export const DEFAULT_EMPLOYEES: Employee[] = [
    { id: 4, name: 'Diana Prince', position: 'CEO', jobTitle: 'Chief Executive Officer', department: 'Executive', email: 'admin@example.com', password: 'admin', roleId: 1, avatar: 'https://i.pravatar.cc/150?u=4', status: 'Active', birthday: '1985-03-10', leaveBalance: { short: 20, sick: 10, personal: 5 }, baseSalary: 150000, lastLeaveAllocation: '2024-07', performancePoints: 250, badges: ['Rising Star', 'Team Player'] },
    { id: 1, name: 'John Doe', position: 'Manager', jobTitle: 'Engineering Manager', department: 'Engineering', email: 'john.doe@example.com', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Active', birthday: '1988-05-15', leaveBalance: { short: 24, sick: 12, personal: 10 }, roleId: 3, shiftId: 1, baseSalary: 90000, lastLeaveAllocation: '2024-07', reportsTo: 4, performancePoints: 65, badges: ['Rising Star'] },
    { id: 2, name: 'Jane Smith', position: 'Worker', jobTitle: 'Software Engineer', department: 'Engineering', email: 'jane.smith@example.com', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Active', birthday: '1992-09-20', leaveBalance: { short: 24, sick: 12, personal: 10 }, roleId: 2, shiftId: 1, baseSalary: 75000, lastLeaveAllocation: '2024-07', reportsTo: 1, performancePoints: 120, badges: ['Rising Star'] },
    { id: 3, name: 'Peter Jones', position: 'Intern', jobTitle: 'Marketing Intern', department: 'Marketing', email: 'peter.jones@example.com', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Probation', birthday: '2001-02-10', leaveBalance: { short: 0, sick: 0, personal: 0 }, roleId: 2, shiftId: 1, baseSalary: 25000, lastLeaveAllocation: '2024-07', reportsTo: 1, performancePoints: 15, badges: [] },
];

export const DEFAULT_PERFORMANCE_RECORDS: PerformancePointRecord[] = [
    { id: 1, employeeId: 4, points: 25, criteria: 'Leadership', reason: 'Successfully led the Q2 company-wide initiative.', date: '2024-06-28', awardedBy: 'Board' },
    { id: 2, employeeId: 1, points: 10, criteria: 'Teamwork', reason: 'Excellent collaboration on the new feature launch.', date: '2024-07-15', awardedBy: 'Diana Prince' },
    { id: 3, employeeId: 2, points: 15, criteria: 'Task Completion', reason: 'Delivered project ahead of schedule.', date: '2024-07-10', awardedBy: 'John Doe' },
];

export const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [];
export const DEFAULT_ONBOARDING_TASKS: OnboardingTask[] = [];
export const DEFAULT_MEETINGS: Meeting[] = [];
export const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [];
export const DEFAULT_COMPLAINTS: Complaint[] = [];