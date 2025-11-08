import { GEM_AVATAR as defaultAvatar } from '../constants.tsx';

const BUDDY_SETTINGS_KEY = 'pharmayush_hr_buddy_settings';

export interface BuddySettings {
  avatarImage: string;
}

const DEFAULT_BUDDY_SETTINGS: BuddySettings = {
    avatarImage: defaultAvatar,
};

export const getBuddySettings = async (): Promise<BuddySettings> => {
    try {
        const data = localStorage.getItem(BUDDY_SETTINGS_KEY);
        if (!data) {
            localStorage.setItem(BUDDY_SETTINGS_KEY, JSON.stringify(DEFAULT_BUDDY_SETTINGS));
            return Promise.resolve(DEFAULT_BUDDY_SETTINGS);
        }
        return Promise.resolve(JSON.parse(data));
    } catch (e) {
        return Promise.resolve(DEFAULT_BUDDY_SETTINGS);
    }
};

export const saveBuddySettings = async (settings: BuddySettings): Promise<BuddySettings> => {
    try {
        localStorage.setItem(BUDDY_SETTINGS_KEY, JSON.stringify(settings));
        return Promise.resolve(settings);
    } catch (e) {
        console.error("Failed to save buddy settings", e);
        return Promise.reject(e);
    }
};
