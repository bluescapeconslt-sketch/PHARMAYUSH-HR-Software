import { CompanySettings } from '../types.ts';

const SETTINGS_KEY = 'pharmayush_hr_company_settings';

const DEFAULT_SETTINGS: CompanySettings = {
    companyName: 'PHARMAYUSH HR',
    companyAddress: '123 Cloud St, Suite 500, Web City, 10101',
    companyLogo: '',
};

export const getSettings = async (): Promise<CompanySettings> => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            return Promise.resolve(DEFAULT_SETTINGS);
        }
        return Promise.resolve(JSON.parse(data));
    } catch (e) {
        return Promise.resolve(DEFAULT_SETTINGS);
    }
};

export const saveSettings = async (settings: CompanySettings): Promise<CompanySettings> => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return Promise.resolve(settings);
    } catch (e) {
        console.error("Failed to save settings", e);
        return Promise.reject(e);
    }
};
