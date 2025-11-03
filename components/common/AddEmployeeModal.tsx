import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { addEmployee } from '../../services/employeeService.ts';
import { getRoles } from '../../services/roleService.ts';
import { getDepartments } from '../../services/departmentService.ts';
import { getShifts } from '../../services/shiftService.ts';
import { Employee, Role, Department, Position, Shift } from '../../types.ts';
import { POSITIONS } from '../../constants.tsx';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const initialFormState: Omit<Employee, 'id' | 'workLocation' | 'lastLeaveAllocation'> = {
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
    short: 12,
    sick: 8,
    personal: 4,
  },
  roleId: 0,
  shiftId: undefined,
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locationData, setLocationData] = useState({ latitude: '', longitude: '', radius: '50' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        const fetchedRoles = getRoles();
        const fetchedDepts = getDepartments();
        const fetchedShifts = getShifts();
        setRoles(fetchedRoles);
        setDepartments(fetchedDepts);
        setShifts(fetchedShifts);

        if (fetchedRoles.length > 0) {
            const employeeRole = fetchedRoles.find(r => r.name === 'Employee');
            setFormData(prev => ({ ...prev, roleId: employeeRole ? employeeRole.id : fetchedRoles[0].id }));
        }
        if (fetchedDepts.length > 0) {
            setFormData(prev => ({ ...prev, department: fetchedDepts[0].name }));
        }
        if (fetchedShifts.length > 0) {
            setFormData(prev => ({ ...prev, shiftId: fetchedShifts[0].id }));
        }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'roleId' || name === 'shiftId' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
            setError("Could not get current location. Please check your browser permissions.");
        });
    } else {
        setError("Geolocation is not supported by this browser.");
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setLocationData({ latitude: '', longitude: '', radius: '50' });
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    } else if (latitude || longitude || radius) {
        // If some but not all fields are filled
        if (latitude || longitude || (radius && radius !== '50')) {
             setError('To set a work location, all three fields (Latitude, Longitude, Radius) are required.');
             return;
        }
    }

    const payload = {
      ...formData,
      shiftId: formData.shiftId ? Number(formData.shiftId) : undefined,
      avatar: formData.avatar || `https://picsum.photos/seed/${formData.name.replace(/\s/g, '')}/200/200`,
      workLocation,
      lastLeaveAllocation: new Date().toISOString().slice(0, 7), // Set to current month
    };

    addEmployee(payload);
    onSubmitted();
    handleClose();
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
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Login ID)</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
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
                <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
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
        <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
            <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
        </div>
        
        <div className="pt-4 border-t">
            <h4 className="text-md font-semibold text-gray-700">Work Location (for Geo-fenced Punch-In)</h4>
            <p className="text-xs text-gray-500 mb-2">Leave all location fields blank to disable this feature for the user.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input type="text" id="latitude" name="latitude" value={locationData.latitude} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., 34.052235" />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input type="text" id="longitude" name="longitude" value={locationData.longitude} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., -118.243683" />
                </div>
                <div className="md:col-span-2">
                    <button type="button" onClick={handleGetCurrentLocation} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Use My Current Location</button>
                </div>
                <div>
                    <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                    <input type="number" id="radius" name="radius" min="0" value={locationData.radius} onChange={handleLocationChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
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