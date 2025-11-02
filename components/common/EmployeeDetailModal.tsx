
import React from 'react';
// FIX: Add file extension to import paths
import Modal from './Modal.tsx';
import { Employee } from '../../types.ts';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img src={employee.avatar} alt={employee.name} className="h-24 w-24 rounded-full object-cover" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
          {/* FIX: The 'role' property on the Employee type was renamed to 'jobTitle'. */}
          <p className="text-md text-gray-600">{employee.jobTitle}</p>
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
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {employee.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-500">Birthday</span>
          <span className="text-gray-800">{new Date(employee.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeDetailModal;