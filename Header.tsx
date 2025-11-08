import React, { useState, useEffect } from 'react';
// FIX: Use the more specific AuthenticatedUser type which omits the password property.
import { CompanySettings, Role } from '../types.ts';
import { getRoles } from '../services/roleService.ts';
import { getSettings } from '../services/settingsService.ts';
import { AuthenticatedUser } from '../services/authService.ts';

interface HeaderProps {
    // FIX: Update the user prop to AuthenticatedUser to align with the state in App.tsx and improve security by not expecting a password.
    user: AuthenticatedUser;
    onLogout: () => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
    const [roleName, setRoleName] = useState('Employee');
    const [settings, setSettings] = useState<CompanySettings | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rolesData, settingsData] = await Promise.all([
                    getRoles(),
                    getSettings()
                ]);

                const role = rolesData.find(r => r.id === user.roleId);
                if (role) {
                    setRoleName(role.name);
                }
                setSettings(settingsData);
            } catch (error) {
                console.error("Failed to load header data", error);
            }
        };
        fetchData();
    }, [user.roleId]);

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
                 <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {settings?.companyLogo ? (
                    <img src={settings.companyLogo} alt={`${settings.companyName} Logo`} className="h-10 w-auto object-contain hidden sm:block" />
                ) : (
                    <div className="h-10 w-40 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div title={`Logged in as ${user.name}`} className="bg-indigo-600 text-white rounded-lg shadow-md py-2 px-4 text-right cursor-default hidden sm:block">
                    <p className="font-bold text-lg sm:text-xl leading-tight">{user.jobTitle}</p>
                    <p className="text-xs opacity-80">{roleName}</p>
                </div>
                <div className="relative">
                    <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400">
                        <img src={user.avatar} alt="User Avatar" className="h-full w-full object-cover" />
                    </button>
                </div>
                <button onClick={onLogout} title="Logout" className="text-gray-500 hover:text-indigo-600 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;