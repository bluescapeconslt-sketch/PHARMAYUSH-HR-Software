// FIX: Removed self-imports of 'Employee' and 'Position' which caused declaration conflicts.

export type Permission =
  // Employee Permissions
  | 'view:employees'
  | 'manage:employees' // Add, Edit, Delete
  // Leave Management Permissions
  | 'view:leaves'
  | 'manage:leaves' // Approve, Reject
  // Onboarding Permissions
  | 'view:onboarding'
  | 'manage:onboarding'
  // Policy Permissions
  | 'view:policies'
  | 'manage:policies'
  // Notice Permissions
  | 'manage:notices'
  // Department Permissions
  | 'manage:departments'
  // Meeting Permissions
  | 'manage:meetings'
  // AI Tools Permissions
  | 'use:performance-review'
  | 'use:job-description'
  | 'use:generate-letter'
  | 'use:hr-assistant'
  // Settings & Management
  | 'manage:settings'
  | 'manage:users'
  | 'manage:roles';

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Department {
    id: number;
    name:string;
}

export type Position = 'Intern' | 'Employee' | 'Dept. Head' | 'Manager' | 'CEO';

export interface Employee {
  id: number;
  name: string;
  position: Position;
  jobTitle: string; // Renamed from 'role'
  department: string;
  email: string; // Used as login ID
  password: string;
  avatar: string;
  status: 'Active' | 'On Leave';
  birthday: string; // YYYY-MM-DD
  roleId: number; // Links to Role interface
}

export interface HierarchyNode extends Employee {
  children: HierarchyNode[];
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeAvatar: string;
  leaveType: 'Vacation' | 'Sick Leave' | 'Personal' | 'Unpaid' | 'Short Leave';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  startTime?: string; // HH:MM for short leaves
  endTime?: string;   // HH:MM for short leaves
}

export enum ReviewTone {
  CONSTRUCTIVE = 'Constructive',
  FORMAL = 'Formal',
  FRIENDLY = 'Friendly',
  DIRECT = 'Direct',
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface OnboardingTask {
    id: number;
    employeeId: number;
    task: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
}

export type LetterType = 'Offer' | 'Joining' | 'Termination' | 'Recommendation';

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyLogo: string;
}

export interface BuddySettings {
  avatarImage: string;
}

export interface Policy {
  id: number;
  title: string;
  category: string;
  content: string; // Markdown content
}

export interface Notice {
    id: number;
    title: string;
    content: string;
    authorName: string;
    date: string; // YYYY-MM-DD
    color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
}

export interface Meeting {
  id: number;
  title: string;
  departmentId: number;
  date: string; // YYYY-MM-DD (Start date for recurring meetings)
  time: string; // HH:MM
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Monthly';
}