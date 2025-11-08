import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getEmployees } from '../services/employeeService.ts';
import { getLeaveRequests } from '../services/leaveService.ts';
import { getHealthTip } from '../services/geminiService.ts';
import { getBuddySettings } from '../services/buddyService.ts';
import { Employee, LeaveRequest, AttendanceRecord } from '../types.ts';
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
    const buttonBaseClasses = "w-full font-bold py-4 px-6 rounded-lg text-white shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
    
    return (
        <Card title="Time Clock">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-wider">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-500">
                    {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="min-h-[72px] mt-4 flex flex-col justify-center items-center">
                    {isLoading ? (
                        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
                    ) : status === 'out' ? (
                        <p className="text-lg text-gray-600">You are <span className="font-bold text-red-600">Punched Out</span>.</p>
                    ) : (
                         <div className="text-center">
                            <p className="text-lg text-gray-600">You are <span className="font-bold text-green-600">Punched In</span>.</p>
                            <p className="text-2xl font-mono font-bold text-gray-800 mt-2">{workDuration || '00:00:00'}</p>
                            <p className="text-xs text-gray-500">Current Session Duration</p>
                            {showUndo && (
                                <div className="mt-2">
                                    <p className="text-sm text-green-600">Punched in successfully!</p>
                                    <button onClick={handleUndoPunchIn} className="text-sm text-blue-600 hover:underline">
                                        Accidental punch? Undo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 mt-2 px-2">{error}</p>}
                </div>
                 <div className="w-full mt-6">
                    {status === 'out' ? (
                        <button onClick={handlePunchIn} disabled={buttonDisabled} className={`${buttonBaseClasses} bg-green-500 hover:bg-green-600`}>
                            {isLocating ? 'Getting Location...' : 'Punch In'}
                        </button>
                    ) : (
                        <button onClick={handlePunchOut} disabled={buttonDisabled} className={`${buttonBaseClasses} bg-red-500 hover:bg-red-600`}>
                            Punch Out
                        </button>
                    )}
                </div>
            </div>
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
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Pharmayush Buddy's Wellness Tip</h3>
            <div className="flex flex-col items-center gap-4 text-center">
                <img 
                    src={buddyImage} 
                    alt="Pharmayush Buddy" 
                    className="h-32 w-32 object-contain buddy-avatar"
                    onClick={() => fetchTip(true)}
                    title="Click me for a new tip!"
                />
                <div className="flex-grow min-h-[60px]">
                    {isLoading ? (
                        <div className="space-y-2 pt-2">
                           <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                           <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse mx-auto"></div>
                       </div>
                    ) : (
                        <p className="text-gray-700 text-base italic">"{tip}"</p>
                    )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    {isLoading ? 'Thinking of a good tip...' : 'Click the buddy for another wellness tip!'}
                </p>
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
                const todayDay = today.getDay(); // 0 for Sunday, 1 for Monday, etc.

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

    if (isLoading) {
        return <Card title="Today's Meetings"><div className="text-center p-4">Loading meetings...</div></Card>;
    }

    if (meetings.length === 0) {
        return (
            <Card title="Today's Meetings">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-gray-500 text-sm">No meetings scheduled. Enjoy the focus time!</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Today's Meetings">
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {meetings.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                        <div className="font-semibold text-indigo-600">{m.time}</div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{m.title}</p>
                            <p className="text-xs text-gray-500">{m.departmentName}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

const Dashboard: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const canViewAllEmployees = useMemo(() => hasPermission('view:employees'), []);

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

    const requestsCardTitle = canViewAllEmployees ? 'Pending Leave Requests' : 'My Pending Requests';
    const recentRequestsCardTitle = canViewAllEmployees ? 'Recent Pending Leave Requests' : 'My Recent Pending Requests';

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                    <DailyMotivation />
                </Card>
                <PharmayushBuddy />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <TimeClock />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <NoticeBoard />
                </div>
                 <div className="lg:col-span-1">
                    <TodaysMeetings />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {canViewAllEmployees && (
                    <>
                        <Card title="Total Employees">
                            {isLoading ? <div className="h-10 bg-slate-200 rounded w-1/2 animate-pulse"></div> : <p className="text-4xl font-bold text-gray-800">{employees.length}</p>}
                            <p className="text-sm text-gray-500">{activeEmployees.length} Active</p>
                        </Card>
                    </>
                )}
                <Card title={requestsCardTitle}>
                    {isLoading ? <div className="h-10 bg-slate-200 rounded w-1/2 animate-pulse"></div> : <p className="text-4xl font-bold text-indigo-600">{pendingRequests.length}</p>}
                    <p className="text-sm text-gray-500">Awaiting approval</p>
                </Card>
                {canViewAllEmployees && (
                    <>
                        <Card title="Employees on Leave">
                             {isLoading ? <div className="h-10 bg-slate-200 rounded w-1/2 animate-pulse"></div> : <p className="text-4xl font-bold text-gray-800">{onLeaveEmployeesCount}</p>}
                            <p className="text-sm text-gray-500">Currently on leave</p>
                        </Card>
                        <Card title="Upcoming Birthdays">
                            {isLoading ? <div className="h-10 bg-slate-200 rounded w-1/2 animate-pulse"></div> : <p className="text-4xl font-bold text-gray-800">{upcomingBirthdays.length}</p>}
                            <p className="text-sm text-gray-500">In the next 7 days</p>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title={recentRequestsCardTitle} className={canViewAllEmployees ? "lg:col-span-2" : "lg:col-span-3"}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingRequests.slice(0, 5).map(req => (
                                    <tr key={req.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-8 w-8 rounded-full" src={req.employeeAvatar} alt={req.employeeName} />
                                                <span className="ml-2 text-sm font-medium text-gray-900">{req.employeeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{req.startDate} to {req.endDate}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{req.leaveType}</td>
                                    </tr>
                                ))}
                                {pendingRequests.length === 0 && (
                                  <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-4">No pending requests.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {canViewAllEmployees && (
                    <Card title="Birthdays This Week">
                        <BirthdayNotification employees={upcomingBirthdays} />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;