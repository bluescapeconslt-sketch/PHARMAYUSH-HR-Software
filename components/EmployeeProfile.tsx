import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { AuthenticatedUser } from '../services/authService.ts';
import { getLeaveRequestsForEmployee } from '../services/leaveService.ts';
import { getOnboardingTasks } from '../services/onboardingService.ts';
import { getShifts } from '../services/shiftService.ts';
import { LeaveRequest, OnboardingTask, Position, Employee, Shift, Badge } from '../types.ts';
import { BADGES } from '../constants.tsx';

const getPositionBadgeColor = (position: Position) => {
    switch (position) {
        case 'CEO': return 'bg-yellow-100 text-yellow-800';
        case 'Manager': return 'bg-green-100 text-green-800';
        case 'TL': return 'bg-purple-100 text-purple-800';
        case 'Worker': return 'bg-blue-100 text-blue-800';
        case 'Intern': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getEmployeeStatusBadgeColor = (status: Employee['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'On Leave': return 'bg-yellow-100 text-yellow-800';
        case 'Probation': return 'bg-orange-100 text-orange-800';
        case 'Notice Period': return 'bg-pink-100 text-pink-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getLeaveStatusBadgeColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
    }
};

interface EmployeeProfileProps {
    user: AuthenticatedUser;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
    const [onboardingTasks, setOnboardingTasks] = useState<(OnboardingTask & { employeeName: string })[]>([]);
    const [assignedShift, setAssignedShift] = useState<Shift | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const history = (await getLeaveRequestsForEmployee(user.id))
                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                setLeaveHistory(history);
    
                const tasks = (await getOnboardingTasks()).filter(task => task.employeeId === user.id && !task.completed);
                setOnboardingTasks(tasks);
                
                if(user.shiftId){
                    const shifts = await getShifts();
                    const shift = shifts.find(s => s.id === user.shiftId);
                    setAssignedShift(shift || null);
                } else {
                    setAssignedShift(null);
                }
            }
        };
        fetchData();
    }, [user]);

    if (!user) {
        return <Card title="My Profile"><p>Loading profile...</p></Card>;
    }

    const displayLeaveBalance = user.status === 'Probation'
        ? { short: 0, sick: 0, personal: 0 }
        : user.leaveBalance;
        
    const earnedBadges: Badge[] = BADGES.filter(b => user.badges.includes(b.name));

    const OverviewTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Contact & Personal Info">
                     <div className="space-y-4 text-sm">
                         <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            <span className="text-gray-700 dark:text-gray-300">Born on {new Date(user.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                            <span className="text-gray-700 dark:text-gray-300">Shift: {assignedShift ? `${assignedShift.name} (${assignedShift.startTime} - ${assignedShift.endTime})` : 'N/A'}</span>
                        </div>
                     </div>
                </Card>
                <Card title="Performance">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
                        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{user.performancePoints}</p>
                    </div>
                    {earnedBadges.length > 0 && (
                        <div>
                             <h4 className="text-sm font-semibold text-center text-gray-600 dark:text-gray-300 mb-2">Badges Earned</h4>
                             <div className="flex justify-center items-center gap-4 text-yellow-500">
                                {earnedBadges.map(badge => (
                                    <div key={badge.name} title={badge.description} className="flex flex-col items-center">
                                        {badge.icon}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card title="Leave Balance">
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Short</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{displayLeaveBalance.short}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">hours left</p>
                        </div>
                         <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Sick</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">{displayLeaveBalance.sick}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">days left</p>
                        </div>
                         <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">Personal</p>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{displayLeaveBalance.personal}</p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">days left</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
    
    const ActivityTab = () => (
         <Card title="Activity">
            <div className="space-y-6">
                {onboardingTasks.length > 0 && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Pending Onboarding Tasks</h4>
                        <ul className="space-y-2">
                            {onboardingTasks.map(task => (
                                <li key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm text-gray-800 dark:text-gray-300">
                                    {task.task} - <span className="text-gray-500 dark:text-gray-400">Due: {task.dueDate}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Leave Request History</h4>
                    {leaveHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dates</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {leaveHistory.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{req.leaveType}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {req.leaveType === 'Short Leave' && req.startTime && req.endTime
                                                    ? `${req.startDate} (${req.startTime} - ${req.endTime})`
                                                    : `${req.startDate} to ${req.endDate}`
                                                }
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveStatusBadgeColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No leave requests found.</p>
                    )}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src={user.avatar} alt={user.name} className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
                        <p className="text-md md:text-lg text-indigo-600 dark:text-indigo-400 font-medium mt-1">{user.jobTitle}</p>
                        <p className="text-md text-gray-500 dark:text-gray-400">{user.department}</p>
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPositionBadgeColor(user.position)}`}>
                                {user.position}
                            </span>
                             <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getEmployeeStatusBadgeColor(user.status)}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}
                    >
                        Activity
                    </button>
                </nav>
            </div>
            
            {activeTab === 'overview' ? <OverviewTab /> : <ActivityTab />}
        </div>
    );
};

export default EmployeeProfile;
