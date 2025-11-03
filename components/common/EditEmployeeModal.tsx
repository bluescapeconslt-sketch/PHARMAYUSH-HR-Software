import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { updateEmployee, EmployeeWithUUID } from '../../services/employeeService.ts';
import { getRoles, RoleWithUUID } from '../../services/roleService.ts';
import { getDepartments, DepartmentWithUUID } from '../../services/departmentService.ts';
import { Position } from '../../types.ts';
import { POSITIONS } from '../../constants.tsx';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeWithUUID | null;
  onSubmitted: () => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, employee, onSubmitted }) => {
  const [formData, setFormData] = useState<EmployeeWithUUID | null>(null);
  const [roles, setRoles] = useState<RoleWithUUID[]>([]);
  const [departments, setDepartments] = useState<DepartmentWithUUID[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        if (employee) {
          setFormData(employee);
        }
        const fetchedRoles = await getRoles();
        const fetchedDepts = await getDepartments();
        setRoles(fetchedRoles);
        setDepartments(fetchedDepts);
      }
    };
    fetchData();
  }, [isOpen, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name === 'roleId') {
      const roleId = Number(value);
      const selectedRole = roles.find(r => r.id === roleId);
      setFormData(prev => prev ? {
        ...prev,
        roleId: roleId,
        roleUuid: selectedRole?.uuid || null
      } : null);
    } else if (name === 'department') {
      const selectedDept = departments.find(d => d.name === value);
      setFormData(prev => prev ? {
        ...prev,
        department: value,
        departmentUuid: selectedDept?.uuid || null
      } : null);
    } else {
      setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => prev ? { ...prev, avatar: reader.result as string } : null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setFormData(null);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) {
      setError('No employee data to submit.');
      return;
    }

    if (!formData.name || !formData.position || !formData.jobTitle || !formData.email || !formData.password || !formData.birthday || !formData.roleId || !formData.department) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');

    try {
      await updateEmployee(formData);
      onSubmitted();
      handleClose();
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Failed to update employee. Please try again.');
    }
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Employee Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
                src={formData.avatar || 'https://i.pravatar.cc/96?u=placeholder'} 
                alt="Avatar Preview" 
                className="h-24 w-24 rounded-full object-cover border-2 border-white shadow" 
            />
            <div>
                <label htmlFor="avatar-upload-edit" className="cursor-pointer text-sm font-medium text-indigo-600 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Change Picture
                </label>
                <input 
                    id="avatar-upload-edit" 
                    name="avatar-upload-edit" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                />
            </div>
        </div>
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
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                <select id="position" name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
                <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="" disabled>Select a department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role</label>
                <select id="roleId" name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value={0} disabled>Select a role</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Active</option>
                    <option>On Leave</option>
                </select>
            </div>
            <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
                <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
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