import React, { useState } from 'react';
import Card from './common/Card.tsx';
import { getSettings, saveSettings } from '../services/settingsService.ts';
import { CompanySettings } from '../types.ts';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>(getSettings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide message after 3 seconds
  };

  return (
    <Card title="Company Settings">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Company Address</label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              rows={3}
              value={settings.companyAddress}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700">Company Logo</label>
            <input
              type="file"
              id="companyLogo"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleLogoChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {settings.companyLogo && (
            <div>
              <span className="block text-sm font-medium text-gray-500">Logo Preview</span>
                <div className="flex items-center gap-4 mt-2">
                    <img src={settings.companyLogo} alt="Company Logo Preview" className="h-16 w-auto bg-gray-100 p-2 rounded-md border" />
                    <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, companyLogo: '' }))}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                    >
                        Remove
                    </button>
                </div>
            </div>
          )}
          
          <div className="flex items-center justify-end gap-4">
             {showSuccess && (
              <span className="text-sm font-medium text-green-600">
                Settings saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default Settings;