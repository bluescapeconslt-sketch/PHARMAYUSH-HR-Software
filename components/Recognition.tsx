import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getCurrentUser, hasPermission } from '../services/authService.ts';
import { getEmployees } from '../services/employeeService.ts';
import { getPerformanceRecords } from '../services/recognitionService.ts';
import { Employee, PerformancePointRecord, Badge } from '../types.ts';
import { BADGES } from '../constants.tsx';
import ManagePointsModal from './common/ManagePointsModal.tsx';

type Tab = 'my-performance' | 'leaderboard' | 'manage';

const Recognition: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('my-performance');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [records, setRecords] = useState<PerformancePointRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUser = useMemo(() => getCurrentUser(), []);
    const canManage = useMemo(() => hasPermission('manage:recognition'), []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empData, recData] = await Promise.all([
                getEmployees(),
                getPerformanceRecords()
            ]);
            setEmployees(empData || []);
            setRecords(recData || []);
        } catch (error) {
            console.error("Failed to load recognition data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const userEmployeeData = employees.find(e => e.id === currentUser?.id);
    const userRecords = records.filter(r => r.employeeId === currentUser?.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const MyPerformance = () => {
        if (!userEmployeeData) return <p>Could not load your performance data.</p>;
        
        const pointsByCategory = userRecords.reduce((acc, record) => {
            acc[record.criteria] = (acc[record.criteria] || 0) + record.points;
            return acc;
        }, {} as Record<string, number>);

        const earnedBadges = BADGES.filter(b => userEmployeeData.badges.includes(b.name));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Total Points">
                        <p className="text-6xl font-bold text-center text-indigo-600">{userEmployeeData.performancePoints}</p>
                    </Card>
                    <Card title="My Badges">
                        {earnedBadges.length > 0 ? (
                            <div className="space-y-4">
                                {earnedBadges.map(badge => (
                                    <div key={badge.name} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                        <div className="text-yellow-500">{badge.icon}</div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{badge.name}</p>
                                            <p className="text-xs text-gray-500">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center text-gray-500">No badges earned yet. Keep up the great work!</p>}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card title="Points History">
                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {userRecords.map(rec => (
                                        <tr key={rec.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rec.date}</td>
                                            <td className="px-4 py-2 text-sm text-gray-800">{rec.reason}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-right ${rec.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {rec.points > 0 ? `+${rec.points}` : rec.points}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </Card>
                </div>
            </div>
        );
    };

    const Leaderboard = () => {
        const sortedEmployees = [...employees].sort((a,b) => b.performancePoints - a.performancePoints);
        
        return (
            <Card title="Company Leaderboard">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Badges</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Points</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {sortedEmployees.map((emp, index) => (
                               <tr key={emp.id} className={emp.id === currentUser?.id ? 'bg-indigo-50' : ''}>
                                   <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-700">{index + 1}</td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={emp.avatar} alt={emp.name} />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                                <p className="text-sm text-gray-500">{emp.department}</p>
                                            </div>
                                        </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center items-center gap-2 text-yellow-500">
                                            {BADGES.filter(b => emp.badges.includes(b.name)).map(b => (
                                                <div key={b.name} title={b.name}>{b.icon}</div>
                                            ))}
                                        </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-indigo-600">{emp.performancePoints}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        );
    };
    
    const ManagePoints = () => {
        const totalPointsAwarded = records.reduce((sum, rec) => sum + rec.points, 0);
        
        // FIX: Correctly type the accumulator for the reduce function to prevent type errors during the arithmetic operation.
        const topDept = employees.reduce<Record<string, number>>((acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + emp.performancePoints;
            return acc;
        }, {});
        
        const topDepartmentName = Object.entries(topDept).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
        
        return (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Award/Deduct Points
                    </button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title="Total Points Awarded (All Time)">
                        <p className="text-4xl font-bold text-center text-indigo-600">{totalPointsAwarded}</p>
                    </Card>
                     <Card title="Top Performing Department">
                        <p className="text-4xl font-bold text-center text-indigo-600">{topDepartmentName}</p>
                    </Card>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading) return <p className="text-center">Loading recognition data...</p>

        switch (activeTab) {
            case 'my-performance': return <MyPerformance />;
            case 'leaderboard': return <Leaderboard />;
            case 'manage': return canManage ? <ManagePoints /> : null;
            default: return null;
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-800">Performance & Recognition</h2>
                        <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50 mt-4 sm:mt-0">
                            <button onClick={() => setActiveTab('my-performance')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'my-performance' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                My Performance
                            </button>
                             <button onClick={() => setActiveTab('leaderboard')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                Leaderboard
                            </button>
                             {canManage && (
                                <button onClick={() => setActiveTab('manage')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'manage' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                    Manage Points
                                </button>
                             )}
                        </div>
                    </div>
                </Card>
                {renderContent()}
            </div>
            <ManagePointsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={fetchData}
            />
        </>
    );
};

export default Recognition;