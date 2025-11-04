import React from 'react';
import { Employee, LeaveRequest, OnboardingTask, Policy, Role, Permission, Notice, Department, Meeting, Position, Shift } from './types.ts';

export const PERMISSIONS: Permission[] = [
  'view:employees',
  'manage:employees',
  'view:leaves',
  'manage:leaves',
  'view:onboarding',
  'manage:onboarding',
  'view:policies',
  'manage:policies',
  'manage:notices',
  'manage:departments',
  'manage:meetings',
  'view:attendance-report',
  'use:performance-review',
  'use:job-description',
  'use:generate-letter',
  'use:hr-assistant',
  'manage:settings',
  'manage:users',
  'manage:roles',
  'manage:shifts',
  'manage:payroll',
  'view:complaints',
];

export const ROLES: Role[] = [
    {
        id: 1,
        name: 'Admin',
        permissions: PERMISSIONS, // Admin gets all permissions
    },
    {
        id: 2,
        name: 'Employee',
        permissions: [
            'view:leaves',
            'view:policies',
            'use:hr-assistant',
            'view:attendance-report',
        ],
    },
    {
        id: 3,
        name: 'HR Manager',
        permissions: [
            'view:employees',
            'manage:employees',
            'view:leaves',
            'manage:leaves',
            'view:onboarding',
            'manage:onboarding',
            'view:policies',
            'manage:policies',
            'manage:notices',
            'manage:departments',
            'manage:meetings',
            'view:attendance-report',
            'use:performance-review',
            'use:job-description',
            'use:generate-letter',
            'use:hr-assistant',
            'manage:settings',
            'manage:shifts',
            'manage:payroll',
        ]
    }
];

export const DEPARTMENTS: Department[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Product' },
    { id: 3, name: 'Design' },
    { id: 4, name: 'Human Resources' },
    { id: 5, name: 'Marketing' },
    { id: 6, name: 'Finance' },
];

export const SHIFTS: Shift[] = [
    { id: 1, name: 'General Shift', startTime: '09:00', endTime: '17:00' },
    { id: 2, name: 'Morning Shift', startTime: '06:00', endTime: '14:00' },
    { id: 3, name: 'Night Shift', startTime: '22:00', endTime: '06:00' },
];

export const POSITIONS: Position[] = ['CEO', 'Manager', 'TL', 'Worker', 'Intern'];

const pastMonth = '2024-01'; // A date guaranteed to be in the past to trigger initial leave allocation

// Reworked employee data to match the visual org chart structure
export const EMPLOYEES: Employee[] = [
  // Level 0: CEO
  { id: 4, name: 'Diana Prince', position: 'CEO', jobTitle: 'Chief Executive Officer', department: 'Executive', email: 'admin@example.com', password: 'admin', roleId: 1, avatar: 'https://i.pravatar.cc/150?u=4', status: 'Active', birthday: '1985-03-10', leaveBalance: { short: 20, sick: 10, personal: 5 }, baseSalary: 150000, lastLeaveAllocation: pastMonth },
  
  // Level 1: Managers reporting to CEO
  { id: 2, name: 'Bob Smith', position: 'Manager', jobTitle: 'Engineering Manager', department: 'Technology', email: 'bob.s@example.com', password: 'password', roleId: 3, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=2', status: 'Active', birthday: '1988-08-22', leaveBalance: { short: 15, sick: 7, personal: 3 }, baseSalary: 75000, lastLeaveAllocation: pastMonth, reportsTo: 4 },
  { id: 1, name: 'Alice Johnson', position: 'Manager', jobTitle: 'Product Manager', department: 'Product', email: 'alice.j@example.com', password: 'password', roleId: 3, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=1', status: 'Active', birthday: '1990-05-15', leaveBalance: { short: 12, sick: 5, personal: 2 }, baseSalary: 72000, lastLeaveAllocation: pastMonth, reportsTo: 4 },
  
  // Level 2: TLs reporting to Managers
  { id: 3, name: 'Charlie Brown', position: 'TL', jobTitle: 'Frontend Team Lead', department: 'Technology', email: 'charlie.b@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=3', status: 'Probation', birthday: '1992-11-30', leaveBalance: { short: 5, sick: 6, personal: 1 }, baseSalary: 50000, lastLeaveAllocation: pastMonth, reportsTo: 2 },
  { id: 5, name: 'Ethan Hunt', position: 'TL', jobTitle: 'Backend Team Lead', department: 'Technology', email: 'ethan.h@example.com', password: 'password', roleId: 2, shiftId: 2, avatar: 'https://i.pravatar.cc/150?u=5', status: 'Active', birthday: '1995-07-01', leaveBalance: { short: 8, sick: 4, personal: 0 }, baseSalary: 52000, lastLeaveAllocation: pastMonth, reportsTo: 2 },
  { id: 6, name: 'Frank Moses', position: 'TL', jobTitle: 'Design Team Lead', department: 'Product', email: 'frank.m@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=6', status: 'Active', birthday: '1991-01-15', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 51000, lastLeaveAllocation: pastMonth, reportsTo: 1 },
  { id: 7, name: 'Grace Hart', position: 'TL', jobTitle: 'Marketing Team Lead', department: 'Product', email: 'grace.h@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=7', status: 'Active', birthday: '1993-06-20', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 49000, lastLeaveAllocation: pastMonth, reportsTo: 1 },

  // Level 3: Workers reporting to TLs
  { id: 8, name: 'Heidi Turner', position: 'Worker', jobTitle: 'Software Engineer', department: 'Technology', email: 'heidi.t@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=8', status: 'Active', birthday: '1996-02-10', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 40000, lastLeaveAllocation: pastMonth, reportsTo: 3 },
  { id: 9, name: 'Ivy Walker', position: 'Worker', jobTitle: 'Software Engineer', department: 'Technology', email: 'ivy.w@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=9', status: 'Active', birthday: '1997-03-12', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 40000, lastLeaveAllocation: pastMonth, reportsTo: 3 },
  { id: 10, name: 'Jack Ryan', position: 'Worker', jobTitle: 'Database Admin', department: 'Technology', email: 'jack.r@example.com', password: 'password', roleId: 2, shiftId: 2, avatar: 'https://i.pravatar.cc/150?u=10', status: 'Active', birthday: '1995-09-09', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 42000, lastLeaveAllocation: pastMonth, reportsTo: 5 },
  { id: 11, name: 'Kate Austen', position: 'Worker', jobTitle: 'UX Designer', department: 'Product', email: 'kate.a@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=11', status: 'Active', birthday: '1996-08-14', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 38000, lastLeaveAllocation: pastMonth, reportsTo: 6 },
  { id: 12, name: 'Leo Fitz', position: 'Worker', jobTitle: 'UI Designer', department: 'Product', email: 'leo.f@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=12', status: 'Active', birthday: '1998-04-25', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 37000, lastLeaveAllocation: pastMonth, reportsTo: 6 },
  { id: 13, name: 'Mia Smoak', position: 'Worker', jobTitle: 'Saler', department: 'Product', email: 'mia.s@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=13', status: 'Active', birthday: '1999-11-30', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 35000, lastLeaveAllocation: pastMonth, reportsTo: 7 },
  { id: 14, name: 'Nate Heywood', position: 'Worker', jobTitle: 'Saler', department: 'Product', email: 'nate.h@example.com', password: 'password', roleId: 2, shiftId: 1, avatar: 'https://i.pravatar.cc/150?u=14', status: 'Active', birthday: '1997-12-01', leaveBalance: { short: 10, sick: 5, personal: 2 }, baseSalary: 36000, lastLeaveAllocation: pastMonth, reportsTo: 7 },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 1, employeeId: 3, employeeName: 'Charlie Brown', employeeAvatar: 'https://i.pravatar.cc/150?u=3', leaveType: 'Short Leave', startDate: '2024-08-01', endDate: '2024-08-01', startTime: '10:00', endTime: '11:00', reason: 'Doctor appointment.', status: 'Approved' },
  { id: 2, employeeId: 1, employeeName: 'Alice Johnson', employeeAvatar: 'https://i.pravatar.cc/150?u=1', leaveType: 'Sick Leave', startDate: '2024-07-20', endDate: '2024-07-21', reason: 'Fever and cold.', status: 'Approved' },
  { id: 3, employeeId: 5, employeeName: 'Ethan Hunt', employeeAvatar: 'https://i.pravatar.cc/150?u=5', leaveType: 'Personal', startDate: '2024-09-05', endDate: '2024-09-07', reason: 'Personal matters.', status: 'Pending' },
  { id: 4, employeeId: 2, employeeName: 'Bob Smith', employeeAvatar: 'https://i.pravatar.cc/150?u=2', leaveType: 'Short Leave', startDate: '2024-10-10', endDate: '2024-10-10', startTime: '14:00', endTime: '15:00', reason: 'Bank appointment.', status: 'Pending' },
];

export const ONBOARDING_TASKS: OnboardingTask[] = [
    { id: 1, employeeId: 5, task: 'Complete HR paperwork', dueDate: '2024-08-01', completed: true },
    { id: 2, employeeId: 5, task: 'Set up development environment', dueDate: '2024-08-03', completed: false },
    { id: 3, employeeId: 5, task: 'Attend company orientation', dueDate: '2024-08-05', completed: false },
    { id: 4, employeeId: 1, task: 'Complete security training', dueDate: '2024-08-10', completed: true },
];

export const POLICIES: Policy[] = [
    { id: 1, title: 'Work From Home Policy', category: 'Workplace', content: 'Our Work From Home (WFH) policy outlines the guidelines for employees who work remotely. This includes expectations for work hours, communication, and equipment. All remote employees must maintain a secure and productive home office environment.' },
    { id: 2, title: 'Paid Time Off (PTO)', category: 'Leave', content: 'This policy covers vacation, sick leave, and personal days for all full-time employees. Employees accrue PTO based on their years of service. All leave must be requested and approved through the HR portal.' },
    { id: 3, title: 'Code of Conduct', category: 'Ethics', content: 'This Code of Conduct applies to all employees and affiliates. It outlines our commitment to a respectful, inclusive, and ethical workplace. Violations may result in disciplinary action, up to and including termination.' },
    { id: 4, title: 'Expense Reimbursement', category: 'Finance', content: 'Employees can get reimbursed for pre-approved, work-related expenses. All reimbursement requests must be submitted with original receipts within 30 days of the expense being incurred. See the full policy for a list of eligible expenses.' },
];

export const NOTICES: Notice[] = [
    { id: 1, title: 'System Maintenance', content: 'Please be advised that all company servers will be down for scheduled maintenance this Friday from 10 PM to 11 PM.', authorName: 'IT Department', date: '2024-07-28', color: 'blue' },
    { id: 2, title: 'Welcome, New Hires!', content: 'A big welcome to our newest team members, Sarah and Tom! We are thrilled to have you join our company.', authorName: 'HR Department', date: '2024-07-27', color: 'green' },
    { id: 3, title: 'Upcoming Holiday', content: 'Just a reminder that the office will be closed next Monday for the public holiday. Enjoy your long weekend!', authorName: 'HR Department', date: '2024-07-26', color: 'pink' },
];

export const MEETINGS: Meeting[] = [
    { id: 1, title: 'Daily Standup', departmentId: 1, date: '2024-01-01', time: '10:00', recurrence: 'Daily' },
    { id: 2, title: 'Weekly Sync', departmentId: 2, date: '2024-07-29', time: '14:30', recurrence: 'Weekly' },
    { id: 3, title: 'Product Demo', departmentId: 2, date: '2024-08-15', time: '11:00', recurrence: 'None' },
];

// FIX: Added and exported the 'ICONS' object containing SVG icons, which was missing and caused import errors in multiple components.
export const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    myProfile: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    employees: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    orgChart: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v4c0 1.105.895 2 2 2h2v2c0 1.105.895 2 2 2h4c1.105 0 2-.895 2-2v-2h2c1.105 0 2-.895 2-2v-4c0-1.105-.895-2-2-2h-2V6c0-1.105-.895-2-2-2H9C7.895 4 7 4.895 7 6v2H5c-1.105 0-2 .895-2 2zm4 0h6M7 14h6" /></svg>,
    leaves: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    onboarding: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    policies: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    performance: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    jobDescription: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    hrAssistant: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    notices: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    departments: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V21h-4.414z" /></svg>,
    shifts: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 14v-2m0 0V8m0 4h.01" /></svg>,
    meetings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    attendanceReport: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    payroll: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    userManagement: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    roleManagement: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-2h2v-2h2v-2h2v-2h2l1.5-1.5M15 7h2a2 2 0 012 2v2a2 2 0 01-2 2h-2M15 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    send: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.172 15V4.828a1 1 0 00-1.172-.994l-5 1.428L9.106 2.553z" /></svg>,
    download: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    raiseComplaint: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L12 5.343 4.268 16.01c-.77 1.333.192 3 1.732 3z" /></svg>,
    viewComplaints: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

// FIX: Corrected a malformed base64 string.
export const GEM_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnZW1HcmFkaWVudCIgeDE9IjEwMCIgeTE9IjIwIiB4Mj0iMTAwIiB5Mj0iMTgwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzgxOENGOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzRGNDZFNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik0xMDAgMjAgTDIwIDgwIEwxMDAgMTgwIEwxODAgODAgTDEwMCAyMFoiIGZpbGw9InVybCgjZ2VtR3JhZGllbnQpIi8+PHBhdGggZD0iTTEwMCAyMCBMMTAwIDE4MCBMMjAgODAiIGZpbGw9IiNBNzhCRkEiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PHBhdGggZD0iTTEwMCAyMCBMMTAwIDE4MCBMMTgwIDgwIiBmaWxsPSIjNjM2NkYxIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==';