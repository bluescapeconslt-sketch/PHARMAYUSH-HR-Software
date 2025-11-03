import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { Shift } from '../../types.ts';
import { addShift, updateShift } from '../../services/shiftService.ts';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  shift: Shift | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, shift }) => {
  const [formData, setFormData] = useState({ name: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setFormData(shift || { name: '', startTime: '', endTime: '' });
        setError('');
    }
  }, [isOpen, shift]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startTime || !formData.endTime) {
      setError('All fields are required.');
      return;
    }

    if (shift) {
      updateShift({ ...shift, ...formData });
    } else {
      addShift(formData);
    }
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={shift ? 'Edit Shift' : 'Add New Shift'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Shift Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., General Shift"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
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

export default ShiftModal;
