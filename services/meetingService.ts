import { Meeting, Department } from '../types.ts';
import { DEFAULT_MEETINGS } from './mockData.ts';
import { getDepartments } from './departmentService.ts';

const MEETINGS_KEY = 'pharmayush_hr_meetings';

export interface EnrichedMeeting extends Meeting {
    departmentName: string;
}

const getFromStorage = (): Meeting[] => {
    try {
        const data = localStorage.getItem(MEETINGS_KEY);
        if (!data) {
            localStorage.setItem(MEETINGS_KEY, JSON.stringify(DEFAULT_MEETINGS));
            return DEFAULT_MEETINGS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_MEETINGS;
    }
};

const saveToStorage = (meetings: Meeting[]): void => {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
};

export const getMeetings = async (): Promise<EnrichedMeeting[]> => {
    const meetings = getFromStorage();
    const departments = await getDepartments();
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));

    const enrichedMeetings = meetings.map(meeting => ({
        ...meeting,
        departmentName: departmentMap.get(meeting.departmentId) || 'Unknown Department'
    }));
    return Promise.resolve(enrichedMeetings);
};

export const addMeeting = async (newMeetingData: Omit<Meeting, 'id'>): Promise<EnrichedMeeting> => {
    const meetings = getFromStorage();
    const newId = meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1;
    const newMeeting = { ...newMeetingData, id: newId };
    saveToStorage([...meetings, newMeeting]);
    
    const departments = await getDepartments();
    const departmentName = departments.find(d => d.id === newMeeting.departmentId)?.name || 'Unknown';

    return Promise.resolve({ ...newMeeting, departmentName });
};

export const updateMeeting = async (updatedMeeting: Meeting): Promise<EnrichedMeeting> => {
    let meetings = getFromStorage();
    meetings = meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m);
    saveToStorage(meetings);

    const departments = await getDepartments();
    const departmentName = departments.find(d => d.id === updatedMeeting.departmentId)?.name || 'Unknown';

    return Promise.resolve({ ...updatedMeeting, departmentName });
};

export const deleteMeeting = async (id: number): Promise<void> => {
    let meetings = getFromStorage();
    meetings = meetings.filter(m => m.id !== id);
    saveToStorage(meetings);
    return Promise.resolve();
};
