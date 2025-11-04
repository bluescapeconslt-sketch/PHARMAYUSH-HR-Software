import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getLeaveRequests, updateLeaveRequestStatus } from '../services/leaveService.ts';
import { LeaveRequest } from '../types.ts';
import LeaveRequestModal from './common/LeaveRequestModal.tsx';
import { hasPermission, getCurrentUser } from '../services/authService.ts';
import { ICONS } from '../constants.tsx';

type StatusFilter = 'Pending' | 'Approved' | 'Rejected' | 'All';

// Since jspdf is loaded from a script tag in index.html, we need to declare it on the window object
declare global {
    interface Window {
        jspdf: any;
    }
}

const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canManage = useMemo(() => hasPermission('manage:leaves'), []);
  
  const currentUser = getCurrentUser();
  const isLeaveDisabled = currentUser?.position === 'Intern' || currentUser?.status === 'Probation';

  const fetchRequests = async () => {
    const reqs = await getLeaveRequests();
    setRequests(reqs);
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    await updateLeaveRequestStatus(id, status);
    await fetchRequests();
  };

  const handleModalSubmit = () => {
    fetchRequests();
    setIsModalOpen(false);
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter(req => req.status === statusFilter);
  }, [requests, statusFilter]);

  const summaryStats = useMemo(() => {
    if (!canManage) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onLeaveToday = requests.filter(req => {
        if (req.status !== 'Approved') return false;
        const startDate = new Date(req.startDate);
        const endDate = new Date(req.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        return today >= startDate && today <= endDate;
    });

    const approvedThisMonth = requests.filter(req => {
        if (req.status !== 'Approved') return false;
        const reqDate = new Date(req.startDate);
        return reqDate.getMonth() === today.getMonth() && reqDate.getFullYear() === today.getFullYear();
    }).length;

    return {
        pending: requests.filter(req => req.status === 'Pending').length,
        approvedThisMonth,
        onLeaveToday
    };
  }, [requests, canManage]);

  const handleExportCSV = () => {
    const headers = ["Employee", "Leave Type", "Start Date", "End Date", "Time", "Status", "Reason"];
    const rows = filteredRequests.map(req => [
        `"${req.employeeName.replace(/"/g, '""')}"`,
        req.leaveType,
        req.startDate,
        req.endDate,
        req.startTime ? `${req.startTime} - ${req.endTime}` : "N/A",
        req.status,
        `"${req.reason.replace(/"/g, '""')}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leave_report_${statusFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new (window as any).jspdf.jsPDF();
    const tableTitle = `Leave Requests Report (${statusFilter})`;
    const tableHeaders = [['Employee', 'Leave Type', 'Dates', 'Status', 'Reason']];
    const tableBody = filteredRequests.map(req => [
        req.employeeName,
        req.leaveType,
        req.leaveType === 'Short Leave' && req.startTime ? `${req.startDate} (${req.startTime} - ${req.endTime})` : `${req.startDate} to ${req.endDate}`,
        req.status,
        req.reason
    ]);
    
    doc.text(tableTitle, 14, 15);
    (doc as any).autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 20,
        theme: 'striped',
        headStyles: { fillColor: [74, 85, 104] } // bg-gray-700
    });
    doc.save(`leave_report_${statusFilter}.pdf`);
  };

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
        {canManage && summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b pb-6">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-yellow-700">Pending Requests</p>
                    <p className="text-3xl font-bold text-yellow-800">{summaryStats.pending}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-700">Approved This Month</p>
                    <p className="text-3xl font-bold text-green-800">{summaryStats.approvedThisMonth}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 text-center mb-2">On Leave Today ({summaryStats.onLeaveToday.length})</p>
                    <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                        {summaryStats.onLeaveToday.length > 0 ? summaryStats.onLeaveToday.map(r => (
                            <div key={r.id} className="flex justify-between items-center bg-white p-1 rounded">
                                <span>{r.employeeName}</span>
                                <span className="font-semibold">{r.leaveType}</span>
                            </div>
                        )) : <p className="text-center text-gray-500 pt-3">None</p>}
                    </div>
                </div>
            </div>
        )}
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
            <div className="w-full sm:w-auto flex items-center justify-center gap-2">
                {canManage && (
                    <>
                        <button onClick={handleExportCSV} title="Export as Excel (CSV)" className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-green-100 hover:text-green-700">
                           {ICONS.download}
                        </button>
                        <button onClick={handleExportPDF} title="Export as PDF" className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-700">
                           {ICONS.download}
                        </button>
                    </>
                )}
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isLeaveDisabled}
                    title={isLeaveDisabled ? 'Interns and employees on probation cannot request leave.' : 'Request time off'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Request
                </button>
            </div>
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
                    {req.leaveType === 'Short Leave' && req.startTime && req.endTime
                        ? `${req.startDate} (${req.startTime} - ${req.endTime})`
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
                    {req.status === 'Pending' && canManage && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                        <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                      </div>
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