import { CompanySettings } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'PHARMAYUSH HR',
  companyAddress: '',
  companyLogo: '',
};

const SETTINGS_KEY = 'company_settings';

export const getSettings = async (): Promise<CompanySettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error) throw error;

    if (data && data.value) {
      return {
        companyName: data.value.companyName || DEFAULT_SETTINGS.companyName,
        companyAddress: data.value.companyAddress || DEFAULT_SETTINGS.companyAddress,
        companyLogo: data.value.companyLogo || DEFAULT_SETTINGS.companyLogo,
      };
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch settings from database', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: CompanySettings): Promise<void> => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: SETTINGS_KEY,
        value: settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};
