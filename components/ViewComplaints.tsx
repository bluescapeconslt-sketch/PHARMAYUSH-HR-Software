import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import Modal from './common/Modal.tsx';
import { getComplaints, updateComplaintStatus, deleteComplaint } from '../services/complaintService.ts';
import { Complaint } from '../types.ts';

const ViewComplaints: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchComplaints = () => {
        const sortedComplaints = getComplaints().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setComplaints(sortedComplaints);
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleViewDetails = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setIsDetailModalOpen(true);
    };

    const handleUpdateStatus = (id: number, status: Complaint['status']) => {
        updateComplaintStatus(id, status);
        fetchComplaints(); // Refresh list
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('Are you sure you want to permanently delete this complaint?')) {
            deleteComplaint(id);
            fetchComplaints();
        }
    };

    const getStatusBadgeColor = (status: Complaint['status']) => {
        switch (status) {
            case 'Submitted': return 'bg-yellow-100 text-yellow-800';
            case 'In Review': return 'bg-blue-100 text-blue-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Card title="Complaint Management">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {complaints.map(complaint => (
                                <tr key={complaint.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.employeeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{complaint.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleViewDetails(complaint)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                            <button onClick={() => handleDelete(complaint.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No complaints have been submitted.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedComplaint && (
                <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Complaint Details">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700">Subject:</h4>
                            <p>{selectedComplaint.subject}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">Submitted By:</h4>
                            <p>{selectedComplaint.employeeName}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-700">Date:</h4>
                            <p>{selectedComplaint.date}</p>
                        </div>
                        <div className="pt-2 border-t">
                            <h4 className="font-semibold text-gray-700">Details:</h4>
                            <p className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-2 rounded-md mt-1">{selectedComplaint.details}</p>
                        </div>
                        <div>
                            <label htmlFor="status-update" className="font-semibold text-gray-700">Update Status:</label>
                            <select
                                id="status-update"
                                value={selectedComplaint.status}
                                onChange={(e) => {
                                    handleUpdateStatus(selectedComplaint.id, e.target.value as Complaint['status']);
                                    setSelectedComplaint(prev => prev ? {...prev, status: e.target.value as Complaint['status']} : null);
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option>Submitted</option>
                                <option>In Review</option>
                                <option>Resolved</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Close</button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ViewComplaints;
