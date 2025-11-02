import { BUDDY_AVATAR as defaultAvatar } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_buddy_settings';

export interface BuddySettings {
  avatarImage: string;
}

const DEFAULT_SETTINGS: BuddySettings = {
  avatarImage: defaultAvatar,
};

export const getBuddySettings = (): BuddySettings => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse buddy settings from localStorage", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveBuddySettings = (settings: BuddySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save buddy settings to localStorage", error);
  }
};
