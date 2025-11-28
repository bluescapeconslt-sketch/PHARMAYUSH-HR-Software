

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import EmployeeDirectory from './components/EmployeeDirectory.tsx';
import LeaveManagement from './components/LeaveManagement.tsx';
import Onboarding from './components/Onboarding.tsx';
import PerformanceReview from './components/PerformanceReview.tsx';
import JobDescriptionGenerator from './components/JobDescriptionGenerator.tsx';
import HrAssistant from './components/HrAssistant.tsx';
import Settings from './components/Settings.tsx';
import CompanyPolicies from './components/CompanyPolicies.tsx';
import GenerateLetter from './components/GenerateLetter.tsx';
import Login from './components/Login.tsx';
import UserManagement from './components/UserManagement.tsx';
import RoleManagement from './components/RoleManagement.tsx';
import ManageNotices from './components/ManageNotices.tsx';
import ManageDepartments from './components/ManageDepartments.tsx';
import ManageShifts from './components/ManageShifts.tsx';
import MeetingScheduler from './components/MeetingScheduler.tsx';
import OrganizationChart from './components/OrganizationChart.tsx';
import AttendanceReport from './components/AttendanceReport.tsx';
import EmployeeProfile from './components/EmployeeProfile.tsx';
import Payroll from './components/Payroll.tsx';
import RaiseComplaint from './components/RaiseComplaint.tsx';
import ViewComplaints from './components/ViewComplaints.tsx';
import Recognition from './components/Recognition.tsx';
import TeamChat from './components/TeamChat.tsx';
import { logout, AuthenticatedUser, getCurrentUser } from './services/authService.ts';
import { processMonthlyLeaveAllocation } from './services/leaveAllocationService.ts';
import { getLeaveRequestsForEmployee } from './services/leaveService.ts';
import { createNotification, getNotifications } from './services/notificationService.ts';


const App: React.FC = () => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const userFromSession = getCurrentUser();
        setUser(userFromSession);
        if (userFromSession) {
            processMonthlyLeaveAllocation();
            checkUpcomingLeave(userFromSession.id);
        }
        setIsAuthLoading(false);

        const handleSessionUpdate = () => {
            const updatedUser = getCurrentUser();
            setUser(updatedUser);
        };

        window.addEventListener('session-updated', handleSessionUpdate);

        return () => {
            window.removeEventListener('session-updated', handleSessionUpdate);
        };
    }, []);

    const checkUpcomingLeave = async (userId: number) => {
        // Check for approved leaves starting tomorrow
        const requests = await getLeaveRequestsForEmployee(userId);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const upcomingLeave = requests.find(req => req.startDate === tomorrowStr && req.status === 'Approved');
        
        if (upcomingLeave) {
            // Check if we already notified
            const existingNotes = await getNotifications(userId);
            const alreadyNotified = existingNotes.some(n => 
                n.type === 'upcoming_leave' && 
                n.message.includes(upcomingLeave.startDate)
            );

            if (!alreadyNotified) {
                await createNotification(
                    userId,
                    'upcoming_leave',
                    'Upcoming Leave Reminder',
                    `You have an approved leave starting tomorrow (${upcomingLeave.startDate}).`,
                    'leaves'
                );
            }
        }
    };

    const handleLogin = () => {
        // The auth service now handles setting the session and activeUser.
        // The 'session-updated' event will trigger the user state update in useEffect.
        setActiveView('dashboard');
        const currentUser = getCurrentUser();
        if (currentUser) {
            processMonthlyLeaveAllocation();
            checkUpcomingLeave(currentUser.id);
        }
    };

    const handleLogout = async () => {
        await logout(); // This will clear session and trigger 'session-updated' event
    };
    
    const renderContent = () => {
        if (!user) return null;

        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'my-profile':
                return <EmployeeProfile user={user} />;
            case 'team-chat':
                return <TeamChat />;
            case 'employees':
                return <EmployeeDirectory />;
            case 'org-chart':
                return <OrganizationChart />;
            case 'leaves':
                return <LeaveManagement />;
            case 'onboarding':
                return <Onboarding />;
            case 'policies':
                return <CompanyPolicies />;
            case 'recognition':
                return <Recognition />;
            case 'performance':
                return <PerformanceReview />;
            case 'job-description':
                return <JobDescriptionGenerator />;
            case 'generate-letter':
                return <GenerateLetter />;
            case 'hr-assistant':
                return <HrAssistant />;
            case 'settings':
                return <Settings />;
            case 'user-management':
                return <UserManagement />;
            case 'role-management':
                return <RoleManagement />;
            case 'manage-notices':
                return <ManageNotices />;
            case 'manage-departments':
                return <ManageDepartments />;
            case 'manage-shifts':
                return <ManageShifts />;
            case 'meetings':
                return <MeetingScheduler />;
            case 'attendance-report':
                return <AttendanceReport />;
            case 'payroll':
                return <Payroll />;
            case 'raise-complaint':
                return <RaiseComplaint />;
            case 'view-complaints':
                return <ViewComplaints />;
            default:
                return <Dashboard />;
        }
    };
    
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</div>
            </div>
        );
    }
    
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <Sidebar 
                user={user} 
                activeView={activeView} 
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    user={user} 
                    onLogout={handleLogout} 
                    onMenuClick={() => setIsSidebarOpen(true)}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;