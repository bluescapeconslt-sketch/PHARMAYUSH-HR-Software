
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
// FIX: Import AuthenticatedUser to correctly type the user state.
import { getCurrentUser, logout, AuthenticatedUser } from './services/authService.ts';

const App: React.FC = () => {
    // FIX: Explicitly type the user state with AuthenticatedUser for better type safety.
    const [user, setUser] = useState<AuthenticatedUser | null>(getCurrentUser());
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        // Redirect to dashboard if trying to access a restricted page after logout
        if (!user) {
            setActiveView('dashboard');
        }
    }, [user]);

    const handleLogin = () => {
        setUser(getCurrentUser());
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
            case 'employees':
                return <EmployeeDirectory />;
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
            default:
                return <Dashboard />;
        }
    };
    
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar user={user} activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={handleLogout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;