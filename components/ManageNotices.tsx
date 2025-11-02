import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import NoticeModal from './common/NoticeModal.tsx';
import { getNotices, deleteNotice } from '../services/noticeService.ts';
import { Notice } from '../types.ts';

const ManageNotices: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    const fetchNotices = async () => {
        const data = await getNotices();
        setNotices(data);
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleOpenModal = (notice: Notice | null) => {
        setSelectedNotice(notice);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchNotices();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            await deleteNotice(id);
            await fetchNotices();
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Manage Notices</h2>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Add New Notice
                    </button>
                </div>
                <div className="space-y-4">
                    {notices.map(notice => (
                        <div key={notice.id} className="bg-white p-4 rounded-lg border flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{notice.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                                <p className="text-xs text-gray-400 mt-2">{notice.authorName} on {notice.date}</p>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                <button onClick={() => handleOpenModal(notice)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(notice.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                     {notices.length === 0 && <p className="text-center text-gray-500 py-8">No notices have been created yet.</p>}
                </div>
            </Card>
            <NoticeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                notice={selectedNotice}
            />
        </>
    );
};

export default ManageNotices;