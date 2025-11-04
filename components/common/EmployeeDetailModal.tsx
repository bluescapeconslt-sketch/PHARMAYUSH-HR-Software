import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Modal from './Modal.tsx';
import { Employee, Position, LeaveRequest, Shift } from '../../types.ts';
import { getLeaveRequestsForEmployee } from '../../services/leaveService.ts';
import { getShifts } from '../../services/shiftService.ts';
import { hasPermission } from '../../services/authService.ts';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

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

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ isOpen, onClose, employee }) => {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const canManagePayroll = useMemo(() => hasPermission('manage:payroll'), []);

  useEffect(() => {
    if (employee) {
        // Fetch all leave requests for this specific employee and sort by most recent
        const history = getLeaveRequestsForEmployee(employee.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setLeaveHistory(history);
        setShifts(getShifts());
    }
  }, [employee, isOpen]); // Re-fetch if the employee prop changes or modal re-opens

  if (!employee) return null;

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
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

  const assignedShift = shifts.find(s => s.id === employee.shiftId);
  
  const formatInr = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayLeaveBalance = employee.status === 'Probation'
    ? { short: 0, sick: 0, personal: 0 }
    : employee.leaveBalance;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img src={employee.avatar} alt={employee.name} className="h-24 w-24 rounded-full object-cover" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
          <div className="mt-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPositionBadgeColor(employee.position)}`}>
                {employee.position}
            </span>
          </div>
          {/* FIX: The 'role' property on the Employee type was renamed to 'jobTitle'. */}
          <p className="text-md text-gray-600 mt-2">{employee.jobTitle}</p>
          <p className="text-sm text-gray-500">{employee.department}</p>
        </div>
      </div>
      <div className="mt-6 border-t pt-6 space-y-3">
        <div className="flex justify-between">
          <span className="font-medium text-gray-500">Email</span>
          <span className="text-gray-800">{employee.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-500">Status</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEmployeeStatusBadgeColor(employee.status)}`}>
            {employee.status}
          </span>
        </div>
         <div className="flex justify-between">
          <span className="font-medium text-gray-500">Assigned Shift</span>
          <span className="text-gray-800">{assignedShift ? `${assignedShift.name} (${assignedShift.startTime} - ${assignedShift.endTime})` : 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-500">Birthday</span>
          <span className="text-gray-800">{new Date(employee.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
         {canManagePayroll && (
             <div className="flex justify-between">
                <span className="font-medium text-gray-500">Monthly Salary</span>
                <span className="text-gray-800 font-semibold">{employee.baseSalary ? formatInr(employee.baseSalary) : 'Not Set'}</span>
            </div>
         )}
      </div>
      {/* --- New Leave Balance & History Section --- */}
      <div className="mt-6 border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Monthly Leave Balance &amp; History</h4>
        
        {/* Balance Section */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 font-semibold">Short Leave</p>
                <p className="text-2xl font-bold text-blue-800">{displayLeaveBalance.short}</p>
                <p className="text-xs text-blue-600">hours left</p>
            </div>
             <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700 font-semibold">Sick Leave</p>
                <p className="text-2xl font-bold text-green-800">{displayLeaveBalance.sick}</p>
                <p className="text-xs text-green-600">days left</p>
            </div>
             <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-700 font-semibold">Personal</p>
                <p className="text-2xl font-bold text-purple-800">{displayLeaveBalance.personal}</p>
                <p className="text-xs text-purple-600">days left</p>
            </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leaveHistory.length > 0 ? leaveHistory.map(req => (
                        <tr key={req.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{req.leaveType}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {req.leaveType === 'Short Leave' && req.startTime && req.endTime
                                    ? `${req.startDate} (${req.startTime} - ${req.endTime})`
                                    : `${req.startDate} to ${req.endDate}`
                                }
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                    {req.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="text-center text-gray-500 py-4">No leave history found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeDetailModal;