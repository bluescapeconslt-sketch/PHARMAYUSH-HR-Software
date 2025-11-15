

import React, { useState, useEffect } from 'react';
import { getNotices } from '../../services/noticeService.ts';
import { Notice } from '../../types.ts';
import Card from './Card.tsx';

const NoticeBoard: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);

    useEffect(() => {
        const fetchAndSetNotices = async () => {
            const allNotices = (await getNotices()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotices(allNotices.slice(0, 3));
        };
        fetchAndSetNotices();
    }, []);

    const colorClasses = {
        yellow: 'bg-yellow-100 border-yellow-300',
        blue: 'bg-blue-100 border-blue-300',
        green: 'bg-green-100 border-green-300',
        pink: 'bg-pink-100 border-pink-300',
        purple: 'bg-purple-100 border-purple-300',
    };

    return (
        <Card title="Company Notice Board">
            {notices.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent notices.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {notices.map((notice, index) => (
                        <div 
                            key={notice.id} 
                            className={`p-4 rounded-lg border-l-4 shadow-sm transform rotate-${index % 2 === 0 ? '1' : '-1'} hover:rotate-0 hover:scale-105 transition-transform duration-200 ${colorClasses[notice.color]}`}
                        >
                            <h4 className="font-bold text-gray-800">{notice.title}</h4>
                            <p className="text-sm text-gray-700 mt-2 mb-3">{notice.content}</p>
                            <div className="text-xs text-gray-500 text-right">
                                <p>{notice.authorName}</p>
                                <p>{notice.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default NoticeBoard;
