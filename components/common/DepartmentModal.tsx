import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { Department } from '../../types.ts';
import { addDepartment, updateDepartment } from '../../services/departmentService.ts';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  department: Department | null;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, department }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setName(department ? department.name : '');
        setError('');
    }
  }, [isOpen, department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department name cannot be empty.');
      return;
    }

    if (department) {
      updateDepartment({ ...department, name });
    } else {
      addDepartment({ name });
    }
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={department ? 'Edit Department' : 'Add New Department'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Department Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentModal;
