import { BUDDY_AVATAR as defaultAvatar } from '../constants.tsx';
import { supabase } from './supabaseClient.ts';

const STORAGE_KEY = 'pharmayush_hr_buddy_settings';
const DB_KEY = 'buddy_settings';

export interface BuddySettings {
  avatarImage: string;
}

const DEFAULT_SETTINGS: BuddySettings = {
  avatarImage: defaultAvatar,
};

export const getBuddySettings = async (): Promise<BuddySettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', DB_KEY)
      .maybeSingle();

    if (error) {
      console.error('Error fetching buddy settings from database:', error);
      return DEFAULT_SETTINGS;
    }

    if (data && data.value) {
      const settings = data.value as BuddySettings;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return settings;
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to fetch buddy settings from database", error);
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : DEFAULT_SETTINGS;
  }
};

export const saveBuddySettings = async (settings: BuddySettings): Promise<boolean> => {
  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', DB_KEY)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('settings')
        .update({ value: settings })
        .eq('key', DB_KEY);

      if (error) {
        console.error("Failed to update buddy settings in database", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('settings')
        .insert([{ key: DB_KEY, value: settings }]);

      if (error) {
        console.error("Failed to insert buddy settings in database", error);
        return false;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Failed to save buddy settings", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return false;
  }
};
