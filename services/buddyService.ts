
import { getKV, saveKV } from './db.ts';

const BUDDY_SETTINGS_KEY = 'buddy_settings';

export interface BuddySettings {
  avatarImage: string;
}

export const getBuddySettings = async (): Promise<BuddySettings> => {
    return getKV<BuddySettings>(BUDDY_SETTINGS_KEY);
};

export const saveBuddySettings = async (settings: BuddySettings): Promise<BuddySettings> => {
    await saveKV(BUDDY_SETTINGS_KEY, settings);
    return settings;
};
