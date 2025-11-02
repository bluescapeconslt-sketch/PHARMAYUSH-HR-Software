import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { addLeaveRequest } from '../../services/leaveService.ts';
import { getEmployees } from '../../services/employeeService.ts';
import { Employee, LeaveRequest } from '../../types.ts';
import { getCurrentUser, hasPermission } from '../../services/authService.ts';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const initialFormState: Omit<LeaveRequest, 'id' | 'status'> = {
  employeeId: 0,
  employeeName: '',
  employeeAvatar: '',
  leaveType: 'Vacation',
  startDate: '',
  endDate: '',
  reason: '',
};

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser();
  const canManage = hasPermission('manage:leaves');

  useEffect(() => {
    if (isOpen) {
        const fetchedEmployees = getEmployees();
        setEmployees(fetchedEmployees);

        if (currentUser && !canManage) {
            // If user is not a manager, auto-select them and disable the dropdown
            setFormData(prev => ({ ...prev, employeeId: currentUser.id }));
        } else if (fetchedEmployees.length > 0) {
            // Default for managers
            setFormData(prev => ({ ...prev, employeeId: fetchedEmployees[0].id }));
        }
    }
  }, [isOpen, currentUser, canManage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleClose = () => {
    setFormData(initialFormState);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill out all required fields.');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('Start date cannot be after end date.');
        return;
    }
    setError('');

    const selectedEmployee = employees.find(e => e.id === Number(formData.employeeId));
    if (!selectedEmployee) {
        setError('Selected employee not found.');
        return;
    }

    const payload = {
      ...formData,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeAvatar: selectedEmployee.avatar,
    };

    addLeaveRequest(payload);
    onSubmitted();
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Time Off">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee</label>
            <select 
                id="employeeId" 
                name="employeeId" 
                value={formData.employeeId} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                disabled={!canManage}
            >
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
        </div>
        <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                <option>Vacation</option>
                <option>Sick Leave</option>
                <option>Personal</option>
                <option>Unpaid</option>
            </select>
        </div>
        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea id="reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Please provide a brief reason for your leave."/>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Submit Request</button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveRequestModal;