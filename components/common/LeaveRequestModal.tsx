import React, { useState, useEffect, useMemo } from 'react';
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
  leaveType: 'Short Leave',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  reason: '',
};

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser();
  const canManage = hasPermission('manage:leaves');

  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === Number(formData.employeeId));
  }, [employees, formData.employeeId]);
  
  const isEligibleForLeave = !selectedEmployee || (selectedEmployee.position !== 'Intern' && selectedEmployee.status !== 'Probation');
  const isShortLeave = formData.leaveType === 'Short Leave';
  const formDisabled = !isEligibleForLeave;

  useEffect(() => {
      if (isOpen) {
          const fetchedEmployees = getEmployees();
          setEmployees(fetchedEmployees);

          if (currentUser && !canManage) {
              setFormData(prev => ({ ...prev, employeeId: currentUser.id }));
          } else if (fetchedEmployees.length > 0) {
              setFormData(prev => ({ ...prev, employeeId: fetchedEmployees[0].id }));
          }
      }
  }, [isOpen, currentUser, canManage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     if (name === 'leaveType') {
        // Reset date/time fields when type changes to avoid state conflicts
        setFormData(prev => ({
            ...initialFormState,
            employeeId: prev.employeeId,
            leaveType: value as LeaveRequest['leaveType'],
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
        setFormData(prev => ({ ...prev, startTime: '', endTime: ''}));
        return;
    }
    const [startTime, endTime] = value.split('-');
    setFormData(prev => ({ ...prev, startTime, endTime }));
  };
  
  const handleClose = () => {
    setFormData(initialFormState);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligibleForLeave) {
        setError('This employee is not eligible for leave requests.');
        return;
    }
    
    if (isShortLeave) {
        if (!formData.employeeId || !formData.startDate || !formData.reason || !formData.startTime) {
            setError('Please fill out all required fields for a short leave.');
            return;
        }
    } else {
        if (!formData.employeeId || !formData.startDate || !formData.reason || !formData.endDate) {
            setError('Please fill out all required fields.');
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }
    }
    setError('');

    if (!selectedEmployee) {
        setError('Selected employee not found.');
        return;
    }

    const payload: Omit<LeaveRequest, 'id' | 'status'> = {
      ...formData,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeAvatar: selectedEmployee.avatar,
    };
    
    if (isShortLeave) {
        payload.endDate = payload.startDate; // For 1-hour leave, start and end date are the same
    } else {
        delete payload.startTime;
        delete payload.endTime;
    }

    addLeaveRequest(payload);
    onSubmitted();
    handleClose();
  };

  const timeSlots = Array.from({ length: 8 }, (_, i) => {
      const hour = i + 9;
      const start = `${String(hour).padStart(2, '0')}:00`;
      const end = `${String(hour + 1).padStart(2, '0')}:00`;
      return { value: `${start}-${end}`, label: `${start} - ${end}` };
  });

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
        {!isEligibleForLeave && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-sm text-red-700">Interns and employees on probation are not eligible for leave requests.</p>
            </div>
        )}
        <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={formDisabled}>
                <option>Short Leave</option>
                <option>Sick Leave</option>
                <option>Personal</option>
                <option>Unpaid</option>
            </select>
        </div>

        {isShortLeave ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={formDisabled} />
                </div>
                 <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">Time</label>
                    <select
                        id="timeSlot"
                        name="timeSlot"
                        value={formData.startTime && formData.endTime ? `${formData.startTime}-${formData.endTime}` : ''}
                        onChange={handleTimeChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        disabled={formDisabled}
                    >
                        <option value="">Select a time slot</option>
                        {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={formDisabled} />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={formDisabled} />
                </div>
            </div>
        )}
        
        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea id="reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" placeholder="Please provide a brief reason for your leave." disabled={formDisabled} />
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md disabled:bg-indigo-300" disabled={formDisabled}>Submit Request</button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveRequestModal;