import { Notice } from '../types.ts';
import { DEFAULT_NOTICES } from './mockData.ts';

const NOTICES_KEY = 'pharmayush_hr_notices';

const getFromStorage = (): Notice[] => {
    try {
        const data = localStorage.getItem(NOTICES_KEY);
        if (!data) {
            localStorage.setItem(NOTICES_KEY, JSON.stringify(DEFAULT_NOTICES));
            return DEFAULT_NOTICES;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_NOTICES;
    }
};

const saveToStorage = (notices: Notice[]): void => {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(notices));
};

export const getNotices = async (): Promise<Notice[]> => {
  return Promise.resolve(getFromStorage());
};

export const addNotice = async (newNoticeData: Omit<Notice, 'id'>): Promise<Notice> => {
    const notices = getFromStorage();
    const newId = notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1;
    const newNotice = { ...newNoticeData, id: newId };
    saveToStorage([...notices, newNotice]);
    return Promise.resolve(newNotice);
};

export const updateNotice = async (updatedNotice: Notice): Promise<Notice> => {
    let notices = getFromStorage();
    notices = notices.map(n => n.id === updatedNotice.id ? updatedNotice : n);
    saveToStorage(notices);
    return Promise.resolve(updatedNotice);
};

export const deleteNotice = async (id: number): Promise<void> => {
    let notices = getFromStorage();
    notices = notices.filter(n => n.id !== id);
    saveToStorage(notices);
    return Promise.resolve();
};
