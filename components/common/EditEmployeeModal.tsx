
import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { updateEmployee } from '../../services/employeeService.ts';
import { getRoles } from '../../services/roleService.ts';
import { getDepartments } from '../../services/departmentService.ts';
import { getShifts } from '../../services/shiftService.ts';
import { Employee, Role, Department, Position, Shift } from '../../types.ts';
import { POSITIONS } from '../../constants.tsx';

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
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locationData, setLocationData] = useState({ latitude: '', longitude: '', radius: '50' });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
        if (isOpen) {
            if (employee) {
                setFormData(employee);
                setLocationData({
                    latitude: employee.workLocation?.latitude.toString() || '',
                    longitude: employee.workLocation?.longitude.toString() || '',
                    radius: employee.workLocation?.radius.toString() || '50'
                });
            }
            setRoles(await getRoles());
            setDepartments(await getDepartments());
            setShifts(await getShifts());
        }
    };
    loadData();
  }, [isOpen, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    let finalValue: string | number = value;

    if (name === 'roleId' || name === 'shiftId' || name === 'baseSalary') {
        finalValue = Number(value);
    }
    
    setFormData(prev => prev ? { ...prev, [name]: finalValue } : null);
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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            setLocationData(prev => ({
                ...prev,
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6),
            }));
        }, () => {
            setError("Could not get current location. Please check browser permissions.");
        });
    } else {
        setError("Geolocation is not supported by this browser.");
    }
  };

  const handleClose = () => {
    setFormData(null);
    setLocationData({ latitude: '', longitude: '', radius: '50' });
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

    let workLocation: Employee['workLocation'] = undefined;
    const { latitude, longitude, radius } = locationData;

    if (latitude && longitude && radius) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const rad = parseInt(radius, 10);
        if (isNaN(lat) || isNaN(lon) || isNaN(rad) || rad < 0) {
            setError('Latitude, Longitude, and Radius must be valid numbers if provided. Radius must be positive.');
            return;
        }
        workLocation = { latitude: lat, longitude: lon, radius: rad };
    } else if (latitude || longitude || (radius && radius !== '50')) {
        setError('To set a work location, all three fields (Latitude, Longitude, Radius) are required.');
        return;
    }

    await updateEmployee({
        ...formData,
        shiftId: formData.shiftId ? Number(formData.shiftId) : undefined,
        baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
        workLocation
    });
    onSubmitted();
    handleClose();
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
                <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700">Shift</label>
                <select id="shiftId" name="shiftId" value={formData.shiftId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">No Shift Assigned</option>
                    {shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Probation</option>
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
                <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
             <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                <input type="number" id="baseSalary" name="baseSalary" min="0" value={formData.baseSalary || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., 5000" />
            </div>
        </div>
        
        <div className="pt-4 border-t">
            <h4 className="text-md font-semibold text-gray-700">Work Location (for Geo-fenced Punch-In)</h4>
            <p className="text-xs text-gray-500 mb-2">Leave all location fields blank to disable this feature for the user.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="latitude-edit" className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input type="text" id="latitude-edit" name="latitude" value={locationData.latitude} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., 34.052235" />
                </div>
                <div>
                    <label htmlFor="longitude-edit" className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input type="text" id="longitude-edit" name="longitude" value={locationData.longitude} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., -118.243683" />
                </div>
                <div className="md:col-span-2">
                    <button type="button" onClick={handleGetCurrentLocation} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Use My Current Location</button>
                </div>
                <div>
                    <label htmlFor="radius-edit" className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                    <input type="number" id="radius-edit" name="radius" min="0" value={locationData.radius} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
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