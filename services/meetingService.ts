import { Meeting } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { getDepartments } from './departmentService.ts';

export interface EnrichedMeeting extends Meeting {
    departmentName: string;
}

export const getMeetings = async (): Promise<EnrichedMeeting[]> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        department:departments(id, name)
      `)
      .order('meeting_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      departmentId: meeting.department_id,
      departmentName: meeting.department?.name || 'All Departments',
      date: meeting.meeting_date,
      time: meeting.meeting_time,
      recurrence: meeting.recurrence || 'None',
    }));
  } catch (error) {
    console.error('Failed to fetch meetings from database', error);
    return [];
  }
};

export const addMeeting = async (newMeetingData: Omit<Meeting, 'id'>): Promise<EnrichedMeeting[]> => {
  try {
    const { error } = await supabase
      .from('meetings')
      .insert({
        title: newMeetingData.title,
        department_id: newMeetingData.departmentId,
        meeting_date: newMeetingData.date,
        meeting_time: newMeetingData.time,
        recurrence: newMeetingData.recurrence || 'None',
      });

    if (error) throw error;

    return await getMeetings();
  } catch (error) {
    console.error('Failed to add meeting', error);
    return await getMeetings();
  }
};

export const updateMeeting = async (updatedMeeting: Meeting): Promise<EnrichedMeeting[]> => {
  try {
    const { error } = await supabase
      .from('meetings')
      .update({
        title: updatedMeeting.title,
        department_id: updatedMeeting.departmentId,
        meeting_date: updatedMeeting.date,
        meeting_time: updatedMeeting.time,
        recurrence: updatedMeeting.recurrence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedMeeting.id);

    if (error) throw error;

    return await getMeetings();
  } catch (error) {
    console.error('Failed to update meeting', error);
    return await getMeetings();
  }
};

export const deleteMeeting = async (id: string | number): Promise<EnrichedMeeting[]> => {
  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getMeetings();
  } catch (error) {
    console.error('Failed to delete meeting', error);
    return await getMeetings();
  }
};
