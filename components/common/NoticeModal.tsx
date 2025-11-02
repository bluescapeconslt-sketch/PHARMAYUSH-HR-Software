import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { Notice } from '../../types.ts';
import { addNotice, updateNotice } from '../../services/noticeService.ts';
import { getCurrentUser } from '../../services/authService.ts';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  notice: Notice | null;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, onSave, notice }) => {
  const [formData, setFormData] = useState<Omit<Notice, 'id'>>({ title: '', content: '', authorName: '', date: '', color: 'yellow' });
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    const today = new Date().toISOString().split('T')[0];

    if (isOpen) {
        if (notice) {
            setFormData(notice);
        } else {
            setFormData({
                title: '',
                content: '',
                authorName: user?.name || 'HR Department',
                date: today,
                color: 'yellow'
            });
        }
        setError('');
    }
  }, [isOpen, notice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and Content are required.');
      return;
    }

    if (notice && 'id' in notice) {
      updateNotice({ ...notice, ...formData });
    } else {
      addNotice(formData);
    }
    onSave();
  };
  
  const colors: Notice['color'][] = ['yellow', 'blue', 'green', 'pink', 'purple'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={notice ? 'Edit Notice' : 'Add New Notice'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            name="content"
            rows={4}
            value={formData.content}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
            <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
                {colors.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">Save Notice</button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeModal;
