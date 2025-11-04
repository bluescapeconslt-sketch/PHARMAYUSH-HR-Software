
// FIX: Add file extension to import paths
import { CompanySettings } from '../types.ts';

const STORAGE_KEY = 'pharmayush_hr_settings';

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'PHARMAYUSH HR',
  companyAddress: '',
  companyLogo: '',
};

export const getSettings = (): CompanySettings => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: CompanySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage", error);
  }
};