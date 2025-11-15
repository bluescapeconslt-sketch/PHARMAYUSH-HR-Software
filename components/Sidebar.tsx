import React from 'react';
import { ICONS } from '../constants.tsx';
import { Permission } from '../types.ts';
import { AuthenticatedUser } from '../services/authService.ts';

interface SidebarProps {
  user: AuthenticatedUser;
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, permission: null },
  { id: 'my-profile', label: 'My Profile', icon: ICONS.myProfile, permission: null },
  { id: 'raise-complaint', label: 'Raise Complaint', icon: ICONS.raiseComplaint, permission: null },
  { id: 'employees', label: 'Employees', icon: ICONS.employees, permission: 'view:employees' },
  { id: 'org-chart', label: 'Org Chart', icon: ICONS.orgChart, permission: 'view:employees' },
  { id: 'leaves', label: 'Leave', icon: ICONS.leaves, permission: 'view:leaves' },
  { id: 'onboarding', label: 'Onboarding', icon: ICONS.onboarding, permission: 'view:onboarding' },
  { id: 'policies', label: 'Policies', icon: ICONS.policies, permission: 'view:policies' },
  { id: 'recognition', label: 'Recognition', icon: ICONS.recognition, permission: 'view:recognition' },
  
  { id: 'ai-tools', label: 'AI Tools', isHeader: true, permission: null },
  { id: 'performance', label: 'Performance Review', icon: ICONS.performance, permission: 'use:performance-review' },
  { id: 'job-description', label: 'Job Description', icon: ICONS.jobDescription, permission: 'use:job-description' },
  { id: 'generate-letter', label: 'Generate Letter', icon: ICONS.jobDescription, permission: 'use:generate-letter' },
  { id: 'hr-assistant', label: 'HR Assistant', icon: ICONS.hrAssistant, permission: 'use:hr-assistant' },
  
  // The header's permission is removed and its visibility is now calculated dynamically
  { id: 'admin-tools', label: 'Management Tools', isHeader: true, permission: null }, 
  { id: 'view-complaints', label: 'View Complaints', icon: ICONS.viewComplaints, permission: 'view:complaints' },
  { id: 'manage-notices', label: 'Manage Notices', icon: ICONS.notices, permission: 'manage:notices' },
  { id: 'manage-departments', label: 'Manage Departments', icon: ICONS.departments, permission: 'manage:departments' },
  { id: 'manage-shifts', label: 'Manage Shifts', icon: ICONS.shifts, permission: 'manage:shifts' },
  { id: 'meetings', label: 'Schedule Meetings', icon: ICONS.meetings, permission: 'manage:meetings' },
  { id: 'attendance-report', label: 'Attendance Report', icon: ICONS.attendanceReport, permission: 'view:attendance-report' },
  { id: 'payroll', label: 'Payroll', icon: ICONS.payroll, permission: 'manage:payroll' },
  { id: 'user-management', label: 'User Management', icon: ICONS.userManagement, permission: 'manage:users' },
  { id: 'role-management', label: 'Role Management', icon: ICONS.roleManagement, permission: 'manage:roles' },
  { id: 'settings', label: 'Settings', icon: ICONS.settings, permission: 'manage:settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, isOpen, setIsOpen }) => {

  const hasPermission = (permission: Permission | null) => {
    if (!permission) return true; // Always show items without a specific permission
    return user.permissions.includes(permission as Permission);
  };
  
  // Build the final navigation list, showing headers only if their children are visible
  const finalNavItems = [];
  for (let i = 0; i < navItems.length; i++) {
    const item = navItems[i];
    if (item.isHeader) {
      // Look ahead to see if any children are visible
      let hasVisibleChild = false;
      for (let j = i + 1; j < navItems.length; j++) {
        const childItem = navItems[j];
        if (childItem.isHeader) {
          // Reached the next header, stop checking
          break;
        }
        if (hasPermission(childItem.permission as Permission | null)) {
          hasVisibleChild = true;
          break;
        }
      }
      if (hasVisibleChild) {
        finalNavItems.push(item);
      }
    } else {
      // It's a regular nav item, check its permission
      if (hasPermission(item.permission as Permission | null)) {
        finalNavItems.push(item);
      }
    }
  }

  const handleNavClick = (view: string) => {
      setActiveView(view);
      setIsOpen(false); // Close sidebar on navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden sidebar-overlay ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOpen(false)}
      ></div>
      <aside className={`w-64 bg-gray-800 text-white flex flex-col flex-shrink-0 fixed lg:relative inset-y-0 left-0 z-40 transform lg:transform-none sidebar-container ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-4 text-2xl font-bold border-b border-gray-700 flex-shrink-0">
          <span>PHARMAYUSH HR</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto sidebar-nav">
          {finalNavItems.map(item => (
            item.isHeader ? (
              <h3 key={item.id} className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</h3>
            ) : (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            )
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;