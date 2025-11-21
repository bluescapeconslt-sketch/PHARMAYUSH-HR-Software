
import React, { useState, useEffect } from 'react';
import { CompanySettings, Role } from './types.ts';
import { getRoles } from './services/roleService.ts';
import { getSettings } from './services/settingsService.ts';
import { AuthenticatedUser } from './services/authService.ts';

interface HeaderProps {
    user: AuthenticatedUser;
    onLogout: () => void;
    onMenuClick: () => void;
    theme: string;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick, theme, toggleTheme }) => {
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
        <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
                 <button onClick={onMenuClick} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {settings?.companyLogo ? (
                    <img src={settings.companyLogo} alt={`${settings.companyName} Logo`} className="h-10 w-auto object-contain hidden sm:block" />
                ) : (
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse hidden sm:block"></div>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <button onClick={toggleTheme} title="Toggle Theme" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 focus:outline-none">
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                </button>
                <div title={`Logged in as ${user.name}`} className="bg-indigo-600 text-white rounded-lg shadow-md py-2 px-4 text-right cursor-default hidden sm:block">
                    <p className="font-bold text-lg sm:text-xl leading-tight">{user.jobTitle}</p>
                    <p className="text-xs opacity-80">{roleName}</p>
                </div>
                <div className="relative">
                    <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400">
                        <img src={user.avatar} alt="User Avatar" className="h-full w-full object-cover" />
                    </button>
                </div>
                <button onClick={onLogout} title="Logout" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
