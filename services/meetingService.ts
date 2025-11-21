import { Meeting, Department } from '../types.ts';
import { find, insert, update, remove } from './db.ts';
import { getDepartments } from './departmentService.ts';

const TABLE = 'meetings';

export interface EnrichedMeeting extends Meeting {
    departmentName: string;
}

export const getMeetings = async (): Promise<EnrichedMeeting[]> => {
    const [meetings, departments] = await Promise.all([
        find<Meeting>(TABLE),
        getDepartments()
    ]);
    
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));

    return meetings.map(meeting => ({
        ...meeting,
        departmentName: departmentMap.get(meeting.departmentId) || 'Unknown Department'
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
};

export const addMeeting = (newMeetingData: Omit<Meeting, 'id'>): Promise<Meeting> => insert(TABLE, newMeetingData);

export const updateMeeting = (updatedMeeting: Meeting): Promise<Meeting> => update(TABLE, updatedMeeting);

export const deleteMeeting = (id: number): Promise<void> => remove(TABLE, id);
