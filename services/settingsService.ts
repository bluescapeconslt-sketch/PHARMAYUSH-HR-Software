
import { CompanySettings } from '../types.ts';
import { getKV, saveKV } from './db.ts';

const SETTINGS_KEY = 'company_settings';

const DEFAULT_SETTINGS: CompanySettings = {
    companyName: 'PHARMAYUSH HR',
    companyAddress: '123 Cloud St, Suite 500, Web City, 10101',
    companyLogo: '',
};

export const getSettings = (): Promise<CompanySettings> => {
    return getKV<CompanySettings>(SETTINGS_KEY);
};

export const saveSettings = async (settings: CompanySettings): Promise<CompanySettings> => {
    await saveKV(SETTINGS_KEY, settings);
    return settings;
};
