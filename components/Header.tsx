import React, { useState, useEffect } from 'react';
// FIX: Use the more specific AuthenticatedUser type which omits the password property.
import { CompanySettings } from '../types.ts';
import { getRoles } from '../services/roleService.ts';
import { getSettings } from '../services/settingsService.ts';
import { AuthenticatedUser } from '../services/authService.ts';

interface HeaderProps {
    // FIX: Update the user prop to AuthenticatedUser to align with the state in App.tsx and improve security by not expecting a password.
    user: AuthenticatedUser;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    const [roleName, setRoleName] = useState('Employee');
    const [settings, setSettings] = useState<CompanySettings | null>(null);

    useEffect(() => {
        const roles = getRoles();
        const role = roles.find(r => r.id === user.roleId);
        if (role) {
            setRoleName(role.name);
        }
        setSettings(getSettings());
    }, [user.roleId]);

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
            <div>
                {settings?.companyLogo && (
                    <img src={settings.companyLogo} alt={`${settings.companyName} Logo`} className="h-10 w-auto object-contain" />
                )}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{roleName}</p>
                </div>
                <div className="relative">
                    <button className="h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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