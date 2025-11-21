
import { Notice } from '../types.ts';
import { find, insert, update, remove } from './db.ts';

const TABLE = 'notices';

export const getNotices = (): Promise<Notice[]> => find(TABLE);

export const addNotice = (newNoticeData: Omit<Notice, 'id'>): Promise<Notice> => insert(TABLE, newNoticeData);

export const updateNotice = (updatedNotice: Notice): Promise<Notice> => update(TABLE, updatedNotice);

export const deleteNotice = (id: number): Promise<void> => remove(TABLE, id);
