import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getEmployees } from '../services/employeeService.ts';
import { getLeaveRequests } from '../services/leaveService.ts';
import { Employee, LeaveRequest } from '../types.ts';
import BirthdayNotification from './common/BirthdayNotification.tsx';
import DailyMotivation from './common/DailyMotivation.tsx';
import NoticeBoard from './common/NoticeBoard.tsx';

const Dashboard: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    useEffect(() => {
        setEmployees(getEmployees());
        setLeaveRequests(getLeaveRequests());
    }, []);

    const pendingRequests = useMemo(() => leaveRequests.filter(r => r.status === 'Pending'), [leaveRequests]);
    const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);
    const onLeaveEmployeesCount = useMemo(() => employees.filter(e => e.status === 'On Leave').length, [employees]);

    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        const inAWeek = new Date();
        inAWeek.setDate(today.getDate() + 7);

        return employees.filter(employee => {
            const birthDate = new Date(employee.birthday);
            
            // To handle year-end cases, we create two dates for the birthday: one for this year, one for next.
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

    return (
        <div>
            <Card className="mb-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <DailyMotivation />
            </Card>

            <div className="mb-6">
                <NoticeBoard />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card title="Total Employees">
                    <p className="text-4xl font-bold text-gray-800">{employees.length}</p>
                    <p className="text-sm text-gray-500">{activeEmployees.length} Active</p>
                </Card>
                <Card title="Pending Leave Requests">
                    <p className="text-4xl font-bold text-indigo-600">{pendingRequests.length}</p>
                    <p className="text-sm text-gray-500">Awaiting approval</p>
                </Card>
                <Card title="Employees on Leave">
                    <p className="text-4xl font-bold text-gray-800">{onLeaveEmployeesCount}</p>
                    <p className="text-sm text-gray-500">Currently on leave</p>
                </Card>
                <Card title="Upcoming Birthdays">
                    <p className="text-4xl font-bold text-gray-800">{upcomingBirthdays.length}</p>
                    <p className="text-sm text-gray-500">In the next 7 days</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Recent Pending Leave Requests" className="lg:col-span-2">
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

                <Card title="Birthdays This Week">
                    <BirthdayNotification employees={upcomingBirthdays} />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;