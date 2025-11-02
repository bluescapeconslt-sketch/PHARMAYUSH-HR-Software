import React from 'react';
import { Employee, LeaveRequest, OnboardingTask, Policy, Role, Permission, Notice, Department } from './types.ts';

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
  'use:performance-review',
  'use:job-description',
  'use:generate-letter',
  'use:hr-assistant',
  'manage:settings',
  'manage:users',
  'manage:roles',
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
            'use:performance-review',
            'use:job-description',
            'use:generate-letter',
            'use:hr-assistant',
            'manage:settings',
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

export const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alice Johnson', jobTitle: 'Software Engineer', department: 'Technology', email: 'alice.j@example.com', password: 'password', roleId: 2, avatar: 'https://picsum.photos/id/1027/200/200', status: 'Active', birthday: '1990-05-15' },
  { id: 2, name: 'Bob Smith', jobTitle: 'Product Manager', department: 'Product', email: 'bob.s@example.com', password: 'password', roleId: 2, avatar: 'https://picsum.photos/id/1005/200/200', status: 'Active', birthday: '1988-08-22' },
  { id: 3, name: 'Charlie Brown', jobTitle: 'UX Designer', department: 'Design', email: 'charlie.b@example.com', password: 'password', roleId: 2, avatar: 'https://picsum.photos/id/1011/200/200', status: 'On Leave', birthday: '1992-11-30' },
  { id: 4, name: 'Diana Prince', jobTitle: 'System Administrator', department: 'Human Resources', email: 'admin@example.com', password: 'admin', roleId: 1, avatar: 'https://picsum.photos/id/1012/200/200', status: 'Active', birthday: '1985-03-10' },
  { id: 5, name: 'Ethan Hunt', jobTitle: 'QA Engineer', department: 'Technology', email: 'ethan.h@example.com', password: 'password', roleId: 2, avatar: 'https://picsum.photos/id/1013/200/200', status: 'Active', birthday: '1995-07-01' },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 1, employeeId: 3, employeeName: 'Charlie Brown', employeeAvatar: 'https://picsum.photos/id/1011/200/200', leaveType: 'Vacation', startDate: '2024-08-01', endDate: '2024-08-10', reason: 'Family vacation.', status: 'Approved' },
  { id: 2, employeeId: 1, employeeName: 'Alice Johnson', employeeAvatar: 'https://picsum.photos/id/1027/200/200', leaveType: 'Sick Leave', startDate: '2024-07-20', endDate: '2024-07-21', reason: 'Fever and cold.', status: 'Approved' },
  { id: 3, employeeId: 5, employeeName: 'Ethan Hunt', employeeAvatar: 'https://picsum.photos/id/1013/200/200', leaveType: 'Personal', startDate: '2024-09-05', endDate: '2024-09-07', reason: 'Personal matters.', status: 'Pending' },
  { id: 4, employeeId: 2, employeeName: 'Bob Smith', employeeAvatar: 'https://picsum.photos/id/1005/200/200', leaveType: 'Vacation', startDate: '2024-10-10', endDate: '2024-10-20', reason: 'Annual leave.', status: 'Pending' },
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

export const BUDDY_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAAUACAYAAABh9TJeAAAgAElEQVR4nOzde1hU5b4/8PcX2JFVUVAQEYyIuAc3jbhHzbVqLqppa2pZ6v400+zNtdScNvfYy9Sm29TcvzS3WlPz3D810UxRTNwoiIigIoqKqIiAyA6y/f5h55hJEAQ2IPh+v65fPBh2dtln77P2eax9n3UqAAAAAAAAAACYiYc+dAEAAAAAAAAAAMwCAgAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAgAAAAAAAAAAASCAg-';

export const ICONS = {
    send: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
    ),
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    employees: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    leaves: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    onboarding: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    policies: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    performance: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    jobDescription: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
    hrAssistant: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    userManagement: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    roleManagement: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    notices: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    departments: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1m-1 4h1" /></svg>,
};