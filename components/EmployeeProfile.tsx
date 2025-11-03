import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { getCurrentUser, AuthenticatedUser } from '../services/authService.ts';
import { getLeaveRequestsForEmployee } from '../services/leaveService.ts';
import { getOnboardingTasks } from '../services/onboardingService.ts';
import { getShifts } from '../services/shiftService.ts';
import { LeaveRequest, OnboardingTask, Position, Employee, Shift } from '../types.ts';

const getPositionBadgeColor = (position: Position) => {
    switch (position) {
        case 'CEO': return 'bg-yellow-100 text-yellow-800';
        case 'Manager': return 'bg-green-100 text-green-800';
        case 'Dept. Head': return 'bg-purple-100 text-purple-800';
        case 'Employee': return 'bg-blue-100 text-blue-800';
        case 'Intern': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getEmployeeStatusBadgeColor = (status: Employee['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'On Leave': return 'bg-yellow-100 text-yellow-800';
        case 'Probation': return 'bg-orange-100 text-orange-800';
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

const EmployeeProfile: React.FC = () => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
    const [onboardingTasks, setOnboardingTasks] = useState<(OnboardingTask & { employeeName: string })[]>([]);
    const [assignedShift, setAssignedShift] = useState<Shift | null>(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            // Fetch recent 5 leave requests
            const history = getLeaveRequestsForEmployee(currentUser.id)
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 5);
            setLeaveHistory(history);

            // Fetch pending onboarding tasks
            const tasks = getOnboardingTasks().filter(task => task.employeeId === currentUser.id && !task.completed);
            setOnboardingTasks(tasks);
            
            // Fetch shift info
            if(currentUser.shiftId){
                const shifts = getShifts();
                const shift = shifts.find(s => s.id === currentUser.shiftId);
                setAssignedShift(shift || null);
            }
        }
    }, []);

    if (!user) {
        return <Card title="My Profile"><p>Loading profile...</p></Card>;
    }

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <Card>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src={user.avatar} alt={user.name} className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-white shadow-lg" />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-md md:text-lg text-indigo-600 font-medium mt-1">{user.jobTitle}</p>
                        <p className="text-md text-gray-500">{user.department}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact & Personal Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Contact & Personal Info">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="text-gray-700">{user.email}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Born on {new Date(user.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">Shift: {assignedShift ? `${assignedShift.name} (${assignedShift.startTime} - ${assignedShift.endTime})` : 'N/A'}</span>
                            </div>
                        </div>
                    </Card>
                    <Card title="Leave Balance">
                         <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700 font-semibold">Short</p>
                                <p className="text-2xl font-bold text-blue-800">{user.leaveBalance.short}</p>
                            </div>
                             <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-700 font-semibold">Sick</p>
                                <p className="text-2xl font-bold text-green-800">{user.leaveBalance.sick}</p>
                            </div>
                             <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-sm text-purple-700 font-semibold">Personal</p>
                                <p className="text-2xl font-bold text-purple-800">{user.leaveBalance.personal}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                
                {/* Recent Activity Card */}
                <div className="lg:col-span-2">
                    <Card title="Recent Activity">
                        <div className="space-y-6">
                            {/* Onboarding Tasks */}
                            {onboardingTasks.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 mb-2">Pending Onboarding Tasks</h4>
                                    <ul className="space-y-2">
                                        {onboardingTasks.map(task => (
                                            <li key={task.id} className="p-3 bg-gray-50 rounded-md text-sm text-gray-800">
                                                {task.task} - <span className="text-gray-500">Due: {task.dueDate}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {/* Leave History */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Recent Leave Requests</h4>
                                {leaveHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {leaveHistory.map(req => (
                                                    <tr key={req.id}>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{req.leaveType}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
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
                                    <p className="text-center text-gray-500 py-4">No recent leave requests found.</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;