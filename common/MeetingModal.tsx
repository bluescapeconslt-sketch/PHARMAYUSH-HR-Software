import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { Meeting, Department } from '../../types.ts';
import { addMeeting, updateMeeting } from '../../services/meetingService.ts';
import { getDepartments } from '../../services/departmentService.ts';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  meeting: Meeting | null;
}

const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, onSave, meeting }) => {
  const [formData, setFormData] = useState<Omit<Meeting, 'id'>>({ title: '', departmentId: 0, date: '', time: '', recurrence: 'None' });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
        if (isOpen) {
            setIsLoading(true);
            try {
                const fetchedDepts = await getDepartments();
                setDepartments(fetchedDepts);

                if (meeting) {
                    setFormData(meeting);
                } else {
                    setFormData({
                        title: '',
                        departmentId: fetchedDepts.length > 0 ? fetchedDepts[0].id : 0,
                        date: new Date().toISOString().split('T')[0],
                        time: '',
                        recurrence: 'None'
                    });
                }
                setError('');
            } catch (err) {
                console.error("Failed to load departments", err);
                setError("Could not load departments list.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    loadData();
  }, [isOpen, meeting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'departmentId' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.departmentId) {
      setError('Title, Department, Date, and Time are required.');
      return;
    }

    try {
        if (meeting) {
          await updateMeeting({ ...meeting, ...formData });
        } else {
          await addMeeting(formData);
        }
        onSave();
    } catch (error) {
        console.error("Failed to save meeting", error);
        setError("An error occurred while saving the meeting.");
    }
  };

  const recurrenceOptions: Meeting['recurrence'][] = ['None', 'Daily', 'Weekly', 'Monthly'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meeting ? 'Edit Meeting' : 'Schedule New Meeting'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading ? <div>Loading...</div> : (
        <>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Meeting Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                    <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">Recurrence</label>
                <select id="recurrence" name="recurrence" value={formData.recurrence} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    {recurrenceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">For recurring meetings, the date field acts as the start date.</p>
            </div>
        </>
        )}
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md disabled:bg-indigo-300">Save Meeting</button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingModal;