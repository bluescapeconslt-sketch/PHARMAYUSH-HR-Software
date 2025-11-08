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
// FIX: Import AuthenticatedUser to correctly type the user state.
import { getCurrentUser, logout, AuthenticatedUser } from './services/authService.ts';
import { processMonthlyLeaveAllocation } from './services/leaveAllocationService.ts';

const App: React.FC = () => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // This effect runs once on mount to check for an existing session
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsAuthLoading(false);

        if (currentUser) {
            processMonthlyLeaveAllocation();
        }

        const handleSessionUpdate = () => {
            setUser(getCurrentUser());
        };

        window.addEventListener('session-updated', handleSessionUpdate);

        return () => {
            window.removeEventListener('session-updated', handleSessionUpdate);
        };
    }, []);

    const handleLogin = () => {
        // The login component now handles the async login.
        // After it calls onLogin, we just need to get the user from the service.
        const currentUser = getCurrentUser();
        if(currentUser){
            setUser(currentUser);
            processMonthlyLeaveAllocation();
        }
        setActiveView('dashboard');
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };
    
    const renderContent = () => {
        if (!user) return null;

        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'my-profile':
                return <EmployeeProfile user={user} />;
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
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading...</div>
            </div>
        );
    }
    
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
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
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;