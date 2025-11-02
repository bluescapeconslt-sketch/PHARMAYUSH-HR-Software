import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { updateEmployee } from '../../services/employeeService.ts';
import { getRoles } from '../../services/roleService.ts';
import { getDepartments } from '../../services/departmentService.ts';
import { Employee, Role, Department } from '../../types.ts';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmitted: () => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, employee, onSubmitted }) => {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (employee) {
            setFormData(employee);
        }
        setRoles(getRoles());
        setDepartments(getDepartments());
    }
  }, [isOpen, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    // Ensure roleId is a number
    const finalValue = name === 'roleId' ? Number(value) : value;
    setFormData(prev => prev ? { ...prev, [name]: finalValue } : null);
  };
  
  const handleClose = () => {
    setFormData(null);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) {
      setError('No employee data to submit.');
      return;
    }

    if (!formData.name || !formData.jobTitle || !formData.email || !formData.password || !formData.birthday || !formData.roleId || !formData.department) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');

    updateEmployee(formData);
    onSubmitted();
    handleClose();
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Employee Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Login ID)</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
                <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="" disabled>Select a department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role</label>
                <select id="roleId" name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value={0} disabled>Select a role</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Active</option>
                    <option>On Leave</option>
                </select>
            </div>
        </div>
        <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
            <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input type="text" id="avatar" name="avatar" value={formData.avatar} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;