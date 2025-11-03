import { CompanySettings } from '../types.ts';
import { supabase } from './supabaseClient.ts';

const STORAGE_KEY = 'pharmayush_hr_settings';
const DB_KEY = 'company_settings';

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'PHARMAYUSH HR',
  companyAddress: '',
  companyLogo: '',
};

export const getSettings = async (): Promise<CompanySettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', DB_KEY)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings from database:', error);
      return DEFAULT_SETTINGS;
    }

    if (data && data.value) {
      const settings = data.value as CompanySettings;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return settings;
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to fetch settings from database", error);
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: CompanySettings): Promise<boolean> => {
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
        console.error("Failed to update settings in database", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('settings')
        .insert([{ key: DB_KEY, value: settings }]);

      if (error) {
        console.error("Failed to insert settings in database", error);
        return false;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Failed to save settings", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return false;
  }
};