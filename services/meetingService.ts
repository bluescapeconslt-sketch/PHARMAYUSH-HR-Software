import { Meeting } from '../types.ts';
import { supabase } from './supabaseClient.ts';
import { getDepartments } from './departmentService.ts';

interface MeetingData {
  id: string;
  title: string;
  department_id: string;
  meeting_date: string;
  meeting_time: string;
  recurrence: string;
  created_at: string;
  updated_at: string;
}

export interface EnrichedMeeting extends Meeting {
    departmentName: string;
}

const transformToMeeting = (data: MeetingData, index: number, departmentId: number): Meeting => {
  return {
    id: index + 1,
    title: data.title,
    departmentId: departmentId,
    date: data.meeting_date,
    time: data.meeting_time,
    recurrence: data.recurrence as 'None' | 'Daily' | 'Weekly' | 'Monthly'
  };
};

export const getMeetings = async (): Promise<EnrichedMeeting[]> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: true })
      .order('meeting_time', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }

    const departments = await getDepartments();
    const { data: allDepts } = await supabase.from('departments').select('id, name');
    const deptMap = new Map(allDepts?.map(d => [d.id, d.name]) || []);

    return (data || []).map((meeting, index) => {
      const deptName = deptMap.get(meeting.department_id);
      const deptIndex = departments.findIndex(d => d.name === deptName);
      const departmentId = deptIndex >= 0 ? deptIndex + 1 : 1;
      const department = departments.find(d => d.id === departmentId);

      return {
        ...transformToMeeting(meeting, index, departmentId),
        departmentName: department ? department.name : 'Unknown Department'
      };
    });
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return [];
  }
};

export const addMeeting = async (newMeetingData: Omit<Meeting, 'id'>): Promise<boolean> => {
  try {
    const departments = await getDepartments();
    const department = departments.find(d => d.id === newMeetingData.departmentId);

    if (!department) {
      console.error('Department not found');
      return false;
    }

    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', department.name)
      .single();

    if (!deptData) {
      console.error('Department UUID not found');
      return false;
    }

    const { error } = await supabase
      .from('meetings')
      .insert([{
        title: newMeetingData.title,
        department_id: deptData.id,
        meeting_date: newMeetingData.date,
        meeting_time: newMeetingData.time,
        recurrence: newMeetingData.recurrence
      }]);

    if (error) {
      console.error('Error adding meeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to add meeting:', error);
    return false;
  }
};

export const updateMeeting = async (updatedMeeting: Meeting): Promise<boolean> => {
  try {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id')
      .order('meeting_date', { ascending: true })
      .order('meeting_time', { ascending: true });

    if (!meetings || meetings.length === 0) return false;

    const targetId = meetings[updatedMeeting.id - 1]?.id;
    if (!targetId) return false;

    const departments = await getDepartments();
    const department = departments.find(d => d.id === updatedMeeting.departmentId);

    if (!department) return false;

    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', department.name)
      .single();

    if (!deptData) return false;

    const { error } = await supabase
      .from('meetings')
      .update({
        title: updatedMeeting.title,
        department_id: deptData.id,
        meeting_date: updatedMeeting.date,
        meeting_time: updatedMeeting.time,
        recurrence: updatedMeeting.recurrence
      })
      .eq('id', targetId);

    if (error) {
      console.error('Error updating meeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update meeting:', error);
    return false;
  }
};

export const deleteMeeting = async (id: number): Promise<boolean> => {
  try {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id')
      .order('meeting_date', { ascending: true })
      .order('meeting_time', { ascending: true });

    if (!meetings || meetings.length === 0) return false;

    const targetId = meetings[id - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', targetId);

    if (error) {
      console.error('Error deleting meeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return false;
  }
};
