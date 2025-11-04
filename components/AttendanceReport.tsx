import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getAttendanceRecords } from '../services/attendanceService.ts';
import { getEmployees } from '../services/employeeService.ts';
import { getCurrentUser, hasPermission, AuthenticatedUser } from '../services/authService.ts';
import { AttendanceRecord, Employee } from '../types.ts';

interface ReportFilters {
    employeeId: string;
    startDate: string;
    endDate: string;
}

interface EnrichedAttendanceRecord extends AttendanceRecord {
    employeeName: string;
    duration: string;
}

const AttendanceReport: React.FC = () => {
    const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [filters, setFilters] = useState<ReportFilters>({
        employeeId: 'all',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const canViewAll = useMemo(() => hasPermission('manage:employees'), []);

    useEffect(() => {
        const loadData = async () => {
            const user = getCurrentUser();
            setCurrentUser(user);
            setAllRecords(await getAttendanceRecords());
            setEmployees(await getEmployees());

            if (user && !hasPermission('manage:employees')) {
                setFilters(prev => ({ ...prev, employeeId: user.id.toString() }));
            }
        };
        loadData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const calculateDuration = (punchIn: string, punchOut: string | null): string => {
        if (!punchOut) return 'In Progress';
        const start = new Date(punchIn);
        const end = new Date(punchOut);
        const diffMs = end.getTime() - start.getTime();
        
        if (diffMs < 0) return 'Invalid';
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    const filteredAndEnrichedRecords = useMemo<EnrichedAttendanceRecord[]>(() => {
        const employeeMap = new Map(employees.map(e => [e.id, e.name]));

        return allRecords
            .filter(record => {
                const recordDate = new Date(record.date);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                
                const isEmployeeMatch = filters.employeeId === 'all' || record.employeeId.toString() === filters.employeeId;
                const isDateMatch = recordDate >= startDate && recordDate <= endDate;
                
                return isEmployeeMatch && isDateMatch;
            })
            .map(record => ({
                ...record,
                employeeName: employeeMap.get(record.employeeId) || 'Unknown',
                duration: calculateDuration(record.punchInTime, record.punchOutTime),
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime());
    }, [allRecords, employees, filters]);
    
    const reportSummary = useMemo(() => {
        let totalMillis = 0;
        const workedDays = new Set<string>();

        filteredAndEnrichedRecords.forEach(record => {
            if (record.punchOutTime) {
                totalMillis += new Date(record.punchOutTime).getTime() - new Date(record.punchInTime).getTime();
                workedDays.add(`${record.employeeId}-${record.date}`);
            }
        });
        
        const totalHours = Math.floor(totalMillis / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalMillis % (1000 * 60 * 60)) / (1000 * 60));

        return {
            days: workedDays.size,
            hours: `${totalHours}h ${totalMinutes}m`,
        };
    }, [filteredAndEnrichedRecords]);

    const handleExportCSV = () => {
        const headers = ["Employee", "Date", "Punch In", "Punch Out", "Total Hours"];
        const rows = filteredAndEnrichedRecords.map(r => [
            r.employeeName,
            r.date,
            new Date(r.punchInTime).toLocaleTimeString(),
            r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString() : 'N/A',
            r.duration
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Attendance Report</h2>
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredAndEnrichedRecords.length === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export to CSV
                    </button>
                </div>
            </Card>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border bg-gray-50 rounded-lg mb-6">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee</label>
                        <select
                            id="employeeId"
                            name="employeeId"
                            value={filters.employeeId}
                            onChange={handleFilterChange}
                            disabled={!canViewAll}
                            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200"
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punch In</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punch Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndEnrichedRecords.map(rec => (
                                <tr key={rec.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.employeeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rec.punchInTime).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.punchOutTime ? new Date(rec.punchOutTime).toLocaleTimeString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{rec.duration}</td>
                                </tr>
                            ))}
                            {filteredAndEnrichedRecords.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No records found for the selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Report Summary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-600">Total Days Worked</p>
                        <p className="text-3xl font-bold text-blue-800">{reportSummary.days}</p>
                    </div>
                     <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-600">Total Hours Worked</p>
                        <p className="text-3xl font-bold text-green-800">{reportSummary.hours}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceReport;