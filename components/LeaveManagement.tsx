
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getLeaveRequests, updateLeaveRequestStatus } from '../services/leaveService.ts';
import { LeaveRequest } from '../types.ts';
import LeaveRequestModal from './common/LeaveRequestModal.tsx';
import { hasPermission } from '../services/authService.ts';

type StatusFilter = 'Pending' | 'Approved' | 'Rejected' | 'All';

const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canManageLeaves = hasPermission('manage:leaves');

  const fetchRequests = async () => {
    const data = await getLeaveRequests();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    const updatedRequests = await updateLeaveRequestStatus(id, status);
    setRequests(updatedRequests);
  };

  const handleModalSubmit = () => {
    fetchRequests();
    setIsModalOpen(false);
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter(req => req.status === statusFilter);
  }, [requests, statusFilter]);

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <>
      <Card title="Leave Request Management">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
                {(['Pending', 'Approved', 'Rejected', 'All'] as StatusFilter[]).map(status => (
                    <button 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            statusFilter === status
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Request
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={req.employeeAvatar} alt={req.employeeName} />
                          </div>
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{req.employeeName}</div>
                          </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {req.leaveType === 'Short Leave' && req.startTime
                      ? `${req.startDate} @ ${req.startTime}`
                      : `${req.startDate} to ${req.endDate}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.leaveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === 'Pending' && canManageLeaves && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                        <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                      </div>
                    )}
                    {req.status === 'Pending' && !canManageLeaves && (
                      <span className="text-gray-400 text-xs">Awaiting approval</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {filteredRequests.length === 0 && (
              <p className="text-center text-gray-500 py-8">No requests found for this status.</p>
          )}
        </div>
      </Card>
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={handleModalSubmit}
      />
    </>
  );
};

export default LeaveManagement;