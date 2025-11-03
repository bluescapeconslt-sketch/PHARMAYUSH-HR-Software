import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import MeetingModal from './common/MeetingModal.tsx';
import { getMeetings, deleteMeeting, EnrichedMeeting } from '../services/meetingService.ts';
import { Meeting } from '../types.ts';

const MeetingScheduler: React.FC = () => {
    const [meetings, setMeetings] = useState<EnrichedMeeting[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    const fetchMeetings = async () => {
        const data = await getMeetings();
        setMeetings(data);
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleOpenModal = (meeting: Meeting | null) => {
        setSelectedMeeting(meeting);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchMeetings();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to cancel this meeting?')) {
            await deleteMeeting(id);
            await fetchMeetings();
        }
    };
    
    const groupedMeetings = useMemo(() => {
        return meetings.reduce((acc, meeting) => {
            const date = meeting.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(meeting);
            return acc;
        }, {} as Record<string, EnrichedMeeting[]>);
    }, [meetings]);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Meeting Scheduler</h2>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Schedule Meeting
                    </button>
                </div>
                <div className="space-y-6">
                    {Object.keys(groupedMeetings).sort().map(date => (
                        <div key={date}>
                             <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">
                                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            <div className="space-y-3">
                                {groupedMeetings[date].map(meeting => (
                                    <div key={meeting.id} className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-bold text-indigo-600">{meeting.time}</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{meeting.title}</p>
                                                <p className="text-sm text-gray-500">{meeting.departmentName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                            {meeting.recurrence !== 'None' && (
                                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">{meeting.recurrence}</span>
                                            )}
                                            <button onClick={() => handleOpenModal(meeting)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDelete(meeting.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {meetings.length === 0 && <p className="text-center text-gray-500 py-8">No meetings scheduled yet.</p>}
                </div>
            </Card>
            <MeetingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                meeting={selectedMeeting}
            />
        </>
    );
};

export default MeetingScheduler;
