
import { Notice } from '../types.ts';
import { NOTICES as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_notices';

export const getNotices = (): Notice[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse notices from localStorage", error);
    return initialData;
  }
};

export const addNotice = (newNoticeData: Omit<Notice, 'id'>): Notice[] => {
    const notices = getNotices();
    const newNotice: Notice = {
        ...newNoticeData,
        id: Date.now(),
    };
    const updatedNotices = [...notices, newNotice];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotices));
    return updatedNotices;
};

export const updateNotice = (updatedNotice: Notice): Notice[] => {
    let notices = getNotices();
    notices = notices.map(n => n.id === updatedNotice.id ? updatedNotice : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    return notices;
};

export const deleteNotice = (id: number): Notice[] => {
    let notices = getNotices();
    notices = notices.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    return notices;
};