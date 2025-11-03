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
import { getCurrentUser, logout, AuthenticatedUser } from './services/authService.ts';
import { checkAndAllocateMonthlyLeaves, fetchEmployees } from './services/employeeService.ts';
import { fetchRoles } from './services/roleService.ts';
import { fetchDepartments } from './services/departmentService.ts';
import { fetchShifts } from './services/shiftService.ts';

const App: React.FC = () => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await Promise.all([
                    fetchEmployees(),
                    fetchRoles(),
                    fetchDepartments(),
                    fetchShifts(),
                ]);

                await checkAndAllocateMonthlyLeaves();

                const currentUser = getCurrentUser();
                setUser(currentUser);
                if (!currentUser) {
                    setActiveView('dashboard');
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    const handleLogin = async () => {
        const currentUser = getCurrentUser();
        if(currentUser){
            await checkAndAllocateMonthlyLeaves();
            setUser(getCurrentUser());
        }
        setActiveView('dashboard');
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };
    
    const renderContent = () => {
        if (!user) return null; // Should not happen due to the main check

        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'my-profile':
                return <EmployeeProfile />;
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
            default:
                return <Dashboard />;
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
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
