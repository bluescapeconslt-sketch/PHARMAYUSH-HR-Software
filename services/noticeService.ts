import { Notice } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('notice_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((notice: any) => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      authorId: notice.author_id,
      authorName: notice.author_name,
      date: notice.notice_date,
      expiryDate: notice.expiry_date,
      color: notice.color || 'blue',
    }));
  } catch (error) {
    console.error('Failed to fetch notices from database', error);
    return [];
  }
};

export const addNotice = async (newNoticeData: Omit<Notice, 'id'>): Promise<Notice[]> => {
  try {
    const { error } = await supabase
      .from('notices')
      .insert({
        title: newNoticeData.title,
        content: newNoticeData.content,
        author_id: newNoticeData.authorId,
        author_name: newNoticeData.authorName,
        notice_date: newNoticeData.date,
        expiry_date: newNoticeData.expiryDate,
        color: newNoticeData.color || 'blue',
      });

    if (error) throw error;

    return await getNotices();
  } catch (error) {
    console.error('Failed to add notice', error);
    return await getNotices();
  }
};

export const updateNotice = async (updatedNotice: Notice): Promise<Notice[]> => {
  try {
    const { error } = await supabase
      .from('notices')
      .update({
        title: updatedNotice.title,
        content: updatedNotice.content,
        author_id: updatedNotice.authorId,
        author_name: updatedNotice.authorName,
        notice_date: updatedNotice.date,
        expiry_date: updatedNotice.expiryDate,
        color: updatedNotice.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedNotice.id);

    if (error) throw error;

    return await getNotices();
  } catch (error) {
    console.error('Failed to update notice', error);
    return await getNotices();
  }
};

export const deleteNotice = async (id: string | number): Promise<Notice[]> => {
  try {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await getNotices();
  } catch (error) {
    console.error('Failed to delete notice', error);
    return await getNotices();
  }
};
