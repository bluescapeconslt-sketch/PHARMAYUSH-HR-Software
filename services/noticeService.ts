import { Notice } from '../types.ts';
import { supabase } from './supabaseClient.ts';

interface NoticeData {
  id: string;
  title: string;
  content: string;
  author_name: string;
  notice_date: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const transformToNotice = (data: NoticeData, index: number): Notice => {
  return {
    id: index + 1,
    title: data.title,
    content: data.content,
    authorName: data.author_name,
    date: data.notice_date,
    color: data.color as 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
  };
};

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('notice_date', { ascending: false });

    if (error) {
      console.error('Error fetching notices:', error);
      return [];
    }

    return (data || []).map((notice, index) => transformToNotice(notice, index));
  } catch (error) {
    console.error('Failed to fetch notices:', error);
    return [];
  }
};

export const addNotice = async (newNoticeData: Omit<Notice, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notices')
      .insert([{
        title: newNoticeData.title,
        content: newNoticeData.content,
        author_name: newNoticeData.authorName,
        notice_date: newNoticeData.date,
        color: newNoticeData.color
      }]);

    if (error) {
      console.error('Error adding notice:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to add notice:', error);
    return false;
  }
};

export const updateNotice = async (updatedNotice: Notice): Promise<boolean> => {
  try {
    const { data: notices } = await supabase
      .from('notices')
      .select('id')
      .order('notice_date', { ascending: false });

    if (!notices || notices.length === 0) return false;

    const targetId = notices[updatedNotice.id - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('notices')
      .update({
        title: updatedNotice.title,
        content: updatedNotice.content,
        author_name: updatedNotice.authorName,
        notice_date: updatedNotice.date,
        color: updatedNotice.color
      })
      .eq('id', targetId);

    if (error) {
      console.error('Error updating notice:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update notice:', error);
    return false;
  }
};

export const deleteNotice = async (id: number): Promise<boolean> => {
  try {
    const { data: notices } = await supabase
      .from('notices')
      .select('id')
      .order('notice_date', { ascending: false });

    if (!notices || notices.length === 0) return false;

    const targetId = notices[id - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', targetId);

    if (error) {
      console.error('Error deleting notice:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete notice:', error);
    return false;
  }
};
