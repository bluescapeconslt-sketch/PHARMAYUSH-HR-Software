
import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getEmployees } from '../services/employeeService.ts';
import { getLeaveRequests } from '../services/leaveService.ts';
import { getHealthTip } from '../services/geminiService.ts';
import { getBuddySettings } from '../services/buddyService.ts';
import { Employee, LeaveRequest } from '../types.ts';
import BirthdayNotification from './common/BirthdayNotification.tsx';
import DailyMotivation from './common/DailyMotivation.tsx';
import NoticeBoard from './common/NoticeBoard.tsx';
import { getCurrentUser, hasPermission } from '../services/authService.ts';
import { getMeetings, EnrichedMeeting } from '../services/meetingService.ts';
import { punchIn, punchOut, getEmployeeStatus, undoPunchIn } from '../services/attendanceService.ts';


const HEALTH_TIP_KEY = 'pharmayush_hr_health_tip';
interface StoredTip {
    tip: string;
    date: string;
}

const StatCard = ({ title, value, subtext, icon, colorClass }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, colorClass: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</h3>
            <p className={`text-xs font-medium mt-1 ${colorClass}`}>{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')} text-opacity-100`}>
            {/* Clone icon to apply specific classes if needed, or just render */}
            <div className={colorClass}>{icon}</div>
        </div>
    </div>
);

const TimeClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [status, setStatus] = useState<'in' | 'out'>('out');
    const [lastPunchIn, setLastPunchIn] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    const currentUser = useMemo(() => getCurrentUser(), []);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            if (currentUser) {
                try {
                    const currentStatus = await getEmployeeStatus(currentUser.id);
                    setStatus(currentStatus.status);
                    if (currentStatus.record) {
                        setLastPunchIn(new Date(currentStatus.record.punchInTime));
                    } else {
                        setLastPunchIn(null);
                    }
                } catch (e) {
                    console.error("Failed to fetch employee status", e);
                    setError("Could not retrieve current punch-in status.");
                }
            }
            setIsLoading(false);
        }
        fetchStatus();
    }, [currentUser]);
    
    const formatDuration = (milliseconds: number): string => {
        if (milliseconds < 0) return '00:00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    
    const workDuration = useMemo(() => {
        if (status === 'in' && lastPunchIn) {
            const diff = currentTime.getTime() - lastPunchIn.getTime();
            return formatDuration(diff);
        }
        return '';
    }, [status, lastPunchIn, currentTime]);

    const handlePunchIn = async () => {
        if (!currentUser) return;
        setIsLocating(true);
        setError(null);
        try {
            const record = await punchIn(currentUser.id);
            setStatus('in');
            setLastPunchIn(new Date(record.punchInTime));
            setShowUndo(true);
            setTimeout(() => setShowUndo(false), 15000); // Undo available for 15 seconds
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while trying to punch in.');
        } finally {
            setIsLocating(false);
        }
    };

    const handlePunchOut = async () => {
        if (!currentUser) return;
        try {
            await punchOut(currentUser.id);
            setStatus('out');
            setLastPunchIn(null);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while trying to punch out.');
        }
    };
    
    const handleUndoPunchIn = async () => {
        if (!currentUser) return;
        try {
            await undoPunchIn(currentUser.id);
            setStatus('out');
            setLastPunchIn(null);
            setShowUndo(false);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while undoing punch in.');
        }
    };
    
    const buttonDisabled = isLoading || !currentUser || isLocating;
    
    return (
        <Card className="border-l-4 border-l-indigo-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Time Clock</h3>
                    <p className="text-gray-500 text-sm">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="mt-2">
                         {isLoading ? (
                            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        ) : status === 'out' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                                Currently Out
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                Punched In
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-widest">
                        {status === 'in' ? workDuration : currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                        {status === 'in' ? 'Session Duration' : 'Current Time'}
                    </span>
                </div>

                <div className="w-full sm:w-auto">
                    {status === 'out' ? (
                        <button 
                            onClick={handlePunchIn} 
                            disabled={buttonDisabled} 
                            className="w-full sm:w-32 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {isLocating ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Punch In'}
                        </button>
                    ) : (
                        <button 
                            onClick={handlePunchOut} 
                            disabled={buttonDisabled} 
                            className="w-full sm:w-32 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                        >
                            Punch Out
                        </button>
                    )}
                </div>
            </div>
            {showUndo && (
                <div className="mt-3 text-center sm:text-right">
                    <button onClick={handleUndoPunchIn} className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                        Mistake? Undo Punch In
                    </button>
                </div>
            )}
            {error && <p className="text-sm text-red-600 mt-3 text-center bg-red-50 p-2 rounded">{error}</p>}
        </Card>
    );
};

const PharmayushBuddy: React.FC = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [buddyImage, setBuddyImage] = useState('');

    const fetchTip = async (forceNew = false) => {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        if (!forceNew) {
            try {
                const storedData = localStorage.getItem(HEALTH_TIP_KEY);
                if (storedData) {
                    const { tip: storedTip, date: storedDate }: StoredTip = JSON.parse(storedData);
                    if (storedDate === today) {
                        setTip(storedTip);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to parse stored health tip", error);
            }
        }

        try {
            const newTip = await getHealthTip();
            setTip(newTip);
            localStorage.setItem(HEALTH_TIP_KEY, JSON.stringify({ tip: newTip, date: today }));
        } catch (error) {
            console.error("Failed to fetch health tip", error);
            setTip("Remember to stay hydrated throughout the day!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadBuddy = async () => {
            fetchTip(false);
            const settings = await getBuddySettings();
            setBuddyImage(settings.avatarImage);
        };
        loadBuddy();
    }, []);

    return (
        <Card>
            <div className="flex items-start gap-4">
                <div className="relative">
                     <img 
                        src={buddyImage} 
                        alt="Pharmayush Buddy" 
                        className="h-16 w-16 object-contain buddy-avatar cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => fetchTip(true)}
                        title="Click me for a new tip!"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Pharmayush Buddy</h3>
                    <div className="bg-indigo-50 dark:bg-gray-700 rounded-lg p-3 rounded-tl-none text-sm text-gray-700 dark:text-gray-300 italic relative">
                         {isLoading ? (
                            <div className="space-y-1">
                               <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                               <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                           </div>
                        ) : (
                           <>
                            "{tip}"
                            <button onClick={() => fetchTip(true)} className="absolute top-1 right-1 text-indigo-400 hover:text-indigo-600" title="New Tip">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.292a1 1 0 11-2 0V12.898a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                            </button>
                           </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const TodaysMeetings: React.FC = () => {
    const [meetings, setMeetings] = useState<EnrichedMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            setIsLoading(true);
            try {
                const allMeetings = await getMeetings();
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todayDay = today.getDay(); 

                const todaysMeetings = (allMeetings || []).filter(m => {
                    const meetingDate = new Date(m.date + "T00:00:00");
                    if (m.recurrence === 'None') return m.date === todayStr;
                    if (meetingDate > today) return false;
                    if (m.recurrence === 'Daily') return true;
                    if (m.recurrence === 'Weekly') return meetingDate.getDay() === todayDay;
                    if (m.recurrence === 'Monthly') return meetingDate.getDate() === today.getDate();
                    return false;
                }).sort((a,b) => a.time.localeCompare(b.time));

                setMeetings(todaysMeetings);
            } catch (error) {
                console.error("Failed to fetch meetings", error);
                setMeetings([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    return (
        <Card title="Today's Schedule">
             {isLoading ? (
                 <div className="space-y-3">
                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                 </div>
             ) : meetings.length === 0 ? (
                <div className="text-center py-6">
                    <div className="bg-green-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">No meetings today. Clear sailing!</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6 my-2">
                    {meetings.map(m => (
                        <div key={m.id} className="mb-8 ml-6 relative">
                             <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-indigo-50 dark:ring-gray-800 dark:bg-gray-700">
                                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{m.time} &bull; {m.departmentName}</p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}

const Dashboard: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const canViewAllEmployees = useMemo(() => hasPermission('view:employees'), []);
    const currentUser = useMemo(() => getCurrentUser(), []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [employeeData, leaveData] = await Promise.all([
                    canViewAllEmployees ? getEmployees() : Promise.resolve([]),
                    getLeaveRequests()
                ]);
                setEmployees(employeeData || []);
                setLeaveRequests(leaveData || []);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setEmployees([]);
                setLeaveRequests([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [canViewAllEmployees]);

    const pendingRequests = useMemo(() => (leaveRequests || []).filter(r => r.status === 'Pending'), [leaveRequests]);
    
    const activeEmployees = useMemo(() => (employees || []).filter(e => e.status === 'Active'), [employees]);
    const onLeaveEmployeesCount = useMemo(() => (employees || []).filter(e => e.status === 'On Leave').length, [employees]);
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        const inAWeek = new Date();
        inAWeek.setDate(today.getDate() + 7);

        return (employees || []).filter(employee => {
            const birthDate = new Date(employee.birthday);
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());

            return (thisYearBirthday >= today && thisYearBirthday <= inAWeek) ||
                   (nextYearBirthday >= today && nextYearBirthday <= inAWeek);
        }).sort((a,b) => {
             const aDate = new Date(a.birthday);
             const bDate = new Date(b.birthday);
             return (aDate.getMonth() - bDate.getMonth()) || (aDate.getDate() - bDate.getDate());
        });
    }, [employees]);

    const recentRequestsCardTitle = canViewAllEmployees ? 'Recent Leave Requests' : 'My Recent Requests';
    
    const WelcomeSection = () => (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500 opacity-10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Good Morning, {currentUser?.name.split(' ')[0]}! 👋</h1>
                <p className="text-indigo-100 text-sm mb-6 opacity-90">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 inline-block max-w-3xl">
                    <DailyMotivation className="text-white" authorClassName="text-indigo-200" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <WelcomeSection />
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {canViewAllEmployees && (
                    <>
                        <StatCard 
                            title="Total Employees" 
                            value={isLoading ? '-' : employees.length} 
                            subtext={`${activeEmployees.length} Active`}
                            colorClass="text-indigo-600"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <StatCard 
                            title="On Leave" 
                            value={isLoading ? '-' : onLeaveEmployeesCount} 
                            subtext="Currently Away"
                            colorClass="text-orange-500"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </>
                )}
                <StatCard 
                    title="Pending Requests" 
                    value={isLoading ? '-' : pendingRequests.length} 
                    subtext="Requires Action"
                    colorClass="text-yellow-500"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                />
                 {canViewAllEmployees && (
                    <StatCard 
                        title="Birthdays" 
                        value={isLoading ? '-' : upcomingBirthdays.length} 
                        subtext="This Week"
                        colorClass="text-pink-500"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>}
                    />
                 )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Primary Workflow */}
                <div className="lg:col-span-2 space-y-8">
                    <TimeClock />
                    
                    <div className="grid grid-cols-1 gap-8">
                         <NoticeBoard />
                    </div>

                    <Card title={recentRequestsCardTitle}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {pendingRequests.slice(0, 5).map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-full object-cover border border-gray-200" src={req.employeeAvatar} alt={req.employeeName} />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">{req.employeeName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col">
                                                    <span>{req.startDate}</span>
                                                    {req.startDate !== req.endDate && <span className="text-xs text-gray-400">to {req.endDate}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                 <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">{req.leaveType}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    Pending
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
                                            No pending requests. All caught up!
                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Assistant & Schedule */}
                <div className="lg:col-span-1 space-y-8">
                    <PharmayushBuddy />
                    <TodaysMeetings />
                    {canViewAllEmployees && (
                        <Card title="Celebrations">
                             <BirthdayNotification employees={upcomingBirthdays} />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
