import { Meeting } from '../types.ts';
import { MEETINGS as initialData } from '../constants.tsx';
import { getDepartments } from './departmentService.ts';

const STORAGE_KEY = 'pharmayush_hr_meetings';

export interface EnrichedMeeting extends Meeting {
    departmentName: string;
}

export const getMeetings = (): EnrichedMeeting[] => {
  let meetings: Meeting[] = [];
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      meetings = initialData;
    } else {
        meetings = JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to parse meetings from localStorage", error);
    meetings = [];
  }
  
  const departments = getDepartments();
  return meetings.map(meeting => {
      const department = departments.find(d => d.id === meeting.departmentId);
      return {
          ...meeting,
          departmentName: department ? department.name : 'Unknown Department',
      };
  }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
};

export const addMeeting = (newMeetingData: Omit<Meeting, 'id'>): EnrichedMeeting[] => {
  const meetings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Meeting[];
  const newMeeting: Meeting = {
    ...newMeetingData,
    id: Date.now(),
  };
  const updatedMeetings = [...meetings, newMeeting];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeetings));
  return getMeetings(); // Return enriched data
};

export const updateMeeting = (updatedMeeting: Meeting): EnrichedMeeting[] => {
  let meetings: Meeting[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  meetings = meetings.map(m =>
    m.id === updatedMeeting.id ? updatedMeeting : m
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  return getMeetings();
};

export const deleteMeeting = (id: number): EnrichedMeeting[] => {
    let meetings: Meeting[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    meetings = meetings.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    return getMeetings();
};