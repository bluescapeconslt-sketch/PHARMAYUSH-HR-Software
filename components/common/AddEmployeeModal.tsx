import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { addEmployee } from '../../services/employeeService.ts';
import { Employee, Position } from '../../types.ts';
import { POSITIONS } from '../../constants.tsx';
import { supabase } from '../../services/supabaseClient.ts';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

interface DBDepartment {
  id: string;
  name: string;
}

interface DBRole {
  id: string;
  name: string;
}

const initialFormState: Omit<Employee, 'id'> = {
  name: '',
  position: 'Employee',
  jobTitle: '',
  department: '',
  email: '',
  password: '',
  avatar: '',
  status: 'Active',
  birthday: '',
  leaveBalance: {
    vacation: 0,
    sick: 0,
    personal: 0,
  },
  roleId: 0,
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [roles, setRoles] = useState<DBRole[]>([]);
  const [departments, setDepartments] = useState<DBDepartment[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        const { data: rolesData } = await supabase.from('roles').select('id, name').order('name');
        const { data: deptsData } = await supabase.from('departments').select('id, name').order('name');

        if (rolesData) {
          setRoles(rolesData);
          const employeeRole = rolesData.find(r => r.name === 'Employee');
          if (employeeRole) {
            setSelectedRoleId(employeeRole.id);
          } else if (rolesData.length > 0) {
            setSelectedRoleId(rolesData[0].id);
          }
        }

        if (deptsData) {
          setDepartments(deptsData);
          if (deptsData.length > 0) {
            setSelectedDeptId(deptsData[0].id);
            setFormData(prev => ({ ...prev, department: deptsData[0].name }));
          }
        }
      }
    };
    fetchData();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'department') {
      setSelectedDeptId(value);
      const dept = departments.find(d => d.id === value);
      if (dept) {
        setFormData(prev => ({ ...prev, department: dept.name }));
      }
    } else if (name === 'roleId') {
      setSelectedRoleId(value);
      setFormData(prev => ({ ...prev, roleId: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.position || !formData.jobTitle || !formData.email || !formData.password || !formData.birthday || !selectedRoleId || !selectedDeptId) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');

    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    const payload = {
      email: formData.email,
      password: formData.password,
      first_name: firstName,
      last_name: lastName,
      phone: null,
      date_of_birth: formData.birthday,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
      department_id: selectedDeptId,
      role_id: selectedRoleId,
      job_title: formData.jobTitle,
      hire_date: new Date().toISOString().split('T')[0],
      employment_status: 'active',
      salary: null,
      bank_account: null,
      bank_name: null
    };

    const result = await addEmployee(payload);
    if (result) {
      onSubmitted();
      handleClose();
    } else {
      setError('Failed to add employee. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
                src={formData.avatar || 'https://i.pravatar.cc/96?u=placeholder'} 
                alt="Avatar Preview" 
                className="h-24 w-24 rounded-full object-cover border-2 border-white shadow" 
            />
            <div>
                <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-indigo-600 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Upload Picture
                </label>
                <input 
                    id="avatar-upload" 
                    name="avatar-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                />
                {formData.avatar && (
                    <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))} 
                        className="ml-2 text-xs text-red-500 hover:text-red-700"
                    >
                        Remove
                    </button>
                )}
                <p className="text-xs text-gray-500 mt-2">If no image is uploaded, a default avatar will be assigned.</p>
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
                <select id="department" name="department" value={selectedDeptId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="" disabled>Select a department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role</label>
                <select id="roleId" name="roleId" value={selectedRoleId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="" disabled>Select a role</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
                <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Add User</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;