import React from 'react';
import { ICONS } from '../constants.tsx';
// FIX: Use the more specific AuthenticatedUser type which omits the password property.
import { Permission } from '../types.ts';
import { AuthenticatedUser } from '../services/authService.ts';

interface SidebarProps {
  // FIX: Update the user prop to AuthenticatedUser to align with the state in App.tsx and improve security by not expecting a password.
  user: AuthenticatedUser;
  activeView: string;
  setActiveView: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, permission: null },
  { id: 'my-profile', label: 'My Profile', icon: ICONS.myProfile, permission: null },
  { id: 'employees', label: 'Employees', icon: ICONS.employees, permission: 'view:employees' },
  { id: 'org-chart', label: 'Org Chart', icon: ICONS.orgChart, permission: 'view:employees' },
  { id: 'leaves', label: 'Leave', icon: ICONS.leaves, permission: 'view:leaves' },
  { id: 'onboarding', label: 'Onboarding', icon: ICONS.onboarding, permission: 'view:onboarding' },
  { id: 'policies', label: 'Policies', icon: ICONS.policies, permission: 'view:policies' },
  
  { id: 'ai-tools', label: 'AI Tools', isHeader: true, permission: null },
  { id: 'performance', label: 'Performance Review', icon: ICONS.performance, permission: 'use:performance-review' },
  { id: 'job-description', label: 'Job Description', icon: ICONS.jobDescription, permission: 'use:job-description' },
  { id: 'generate-letter', label: 'Generate Letter', icon: ICONS.jobDescription, permission: 'use:generate-letter' },
  { id: 'hr-assistant', label: 'HR Assistant', icon: ICONS.hrAssistant, permission: 'use:hr-assistant' },
  
  { id: 'admin-tools', label: 'Administration', isHeader: true, permission: 'manage:users' }, // Header for admin section
  { id: 'manage-notices', label: 'Manage Notices', icon: ICONS.notices, permission: 'manage:notices' },
  { id: 'manage-departments', label: 'Manage Departments', icon: ICONS.departments, permission: 'manage:departments' },
  { id: 'meetings', label: 'Schedule Meetings', icon: ICONS.meetings, permission: 'manage:meetings' },
  { id: 'attendance-report', label: 'Attendance Report', icon: ICONS.attendanceReport, permission: 'view:attendance-report' },
  { id: 'user-management', label: 'User Management', icon: ICONS.userManagement, permission: 'manage:users' },
  { id: 'role-management', label: 'Role Management', icon: ICONS.roleManagement, permission: 'manage:roles' },
  { id: 'settings', label: 'Settings', icon: ICONS.settings, permission: 'manage:settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView }) => {

  const hasPermission = (permission: Permission | null) => {
    if (!permission) return true; // Always show items without a specific permission
    // FIX: The user-provided line number for the error was likely incorrect. The type error occurs here where a generic 'string' was passed to a function expecting the specific 'Permission' type. Casting the argument resolves the error.
    return user.permissions.includes(permission as Permission);
  };

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission as Permission | null));

  // A little hacky, but prevents showing the "Administration" header if the user has no admin permissions
  const cleanedNavItems = filteredNavItems.filter((item, index, arr) => {
    if (item.isHeader && arr[index + 1]?.isHeader) return false;
    if (item.isHeader && !arr[index + 1]) return false; // Don't show header if it's the last item
    return true;
  });

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700 flex-shrink-0">
        PHARMAYUSH HR
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto sidebar-nav">
        {cleanedNavItems.map(item => (
          item.isHeader ? (
            <h3 key={item.id} className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</h3>
          ) : (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveView(item.id);
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
  );
};

export default Sidebar;