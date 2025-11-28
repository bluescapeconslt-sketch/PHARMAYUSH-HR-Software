
import React, { useState, useEffect, useRef } from 'react';
import { CompanySettings, Role, Notification } from './types.ts';
import { getRoles } from './services/roleService.ts';
import { getSettings } from './services/settingsService.ts';
import { AuthenticatedUser } from './services/authService.ts';
import { getNotifications, markAsRead, markAllAsRead } from './services/notificationService.ts';

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
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

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

    // Fetch notifications polling
    useEffect(() => {
        const fetchNotes = async () => {
            if (user) {
                const notes = await getNotifications(user.id);
                setNotifications(notes);
            }
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    // Click outside handler for notification dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        }
        // Could implement navigation logic here based on notification.link
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 relative z-20">
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

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white focus:outline-none relative p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.map(note => (
                                        <div 
                                            key={note.id} 
                                            onClick={() => handleNotificationClick(note)}
                                            className={`p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!note.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-medium ${!note.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {note.title}
                                                </p>
                                                {!note.isRead && <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{note.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
