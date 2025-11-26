import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { getSettings, saveSettings } from '../services/settingsService.ts';
import { getBuddySettings, saveBuddySettings } from '../services/buddyService.ts';
import { getLeaveAllocationSettings, saveLeaveAllocationSettings } from '../services/leaveAllocationService.ts';
import { CompanySettings, BuddySettings, LeaveAllocationSettings } from '../types.ts';
import { GEM_AVATAR as defaultGemAvatar } from '../constants.tsx';
import { uploadFile } from '../services/gcsService.ts';


const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>({ companyName: '', companyAddress: '', companyLogo: '' });
  const [buddySettings, setBuddySettings] = useState<BuddySettings>({ avatarImage: '' });
  const [leaveSettings, setLeaveSettings] = useState<LeaveAllocationSettings>({ short: 0, sick: 0, personal: 0 });
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setSettings(await getSettings());
        setBuddySettings(await getBuddySettings());
        setLeaveSettings(await getLeaveAllocationSettings());
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLeaveSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeaveSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the logo.');
        return;
      }
      setIsUploadingLogo(true);
      setError('');
      try {
          const uploadedUrl = await uploadFile(file);
          setSettings(prev => ({ ...prev, companyLogo: uploadedUrl }));
      } catch (uploadError: any) {
          setError(uploadError.message || 'Logo upload failed.');
      } finally {
          setIsUploadingLogo(false);
      }
    }
  };

  const handleBuddyAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the avatar.');
        return;
      }
      setIsUploadingAvatar(true);
      setError('');
      try {
          const uploadedUrl = await uploadFile(file);
          setBuddySettings(prev => ({ ...prev, avatarImage: uploadedUrl }));
      } catch (uploadError: any) {
          setError(uploadError.message || 'Avatar upload failed.');
      } finally {
          setIsUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await saveSettings(settings);
    await saveBuddySettings(buddySettings);
    await saveLeaveAllocationSettings(leaveSettings);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide message after 3 seconds
  };

  return (
    <Card title="Company Settings">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 divide-y divide-gray-200">
            {/* --- Company Details Section --- */}
            <div className="py-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h3>
                 <div className="space-y-6">
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
                         {isUploadingLogo && <span className="text-xs text-indigo-600 animate-pulse">Uploading...</span>}
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
                 </div>
            </div>

             {/* --- Monthly Leave Allocation Section --- */}
            <div className="py-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Monthly Leave Allocation</h3>
                <p className="text-sm text-gray-500 mb-4">Set the number of leaves to be automatically credited to each employee at the start of every month.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="short" className="block text-sm font-medium text-gray-700">Short Leaves (in hours)</label>
                        <input
                        type="number"
                        id="short"
                        name="short"
                        min="0"
                        value={leaveSettings.short}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="sick" className="block text-sm font-medium text-gray-700">Sick Leaves</label>
                        <input
                        type="number"
                        id="sick"
                        name="sick"
                        min="0"
                        value={leaveSettings.sick}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="personal" className="block text-sm font-medium text-gray-700">Personal Leaves</label>
                        <input
                        type="number"
                        id="personal"
                        name="personal"
                        min="0"
                        value={leaveSettings.personal}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* --- HR Assistant Avatar Section --- */}
            <div className="py-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">HR Assistant 'Gem' Avatar</h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="buddyAvatar" className="block text-sm font-medium text-gray-700">Upload new avatar</label>
                         <input
                            type="file"
                            id="buddyAvatar"
                            accept="image/jpeg, image/png, image/gif, image/svg+xml"
                            onChange={handleBuddyAvatarChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {isUploadingAvatar && <span className="text-xs text-indigo-600 animate-pulse">Uploading...</span>}
                    </div>
                     {buddySettings.avatarImage && (
                        <div>
                        <span className="block text-sm font-medium text-gray-500">Avatar Preview</span>
                            <div className="flex items-center gap-4 mt-2">
                                <img src={buddySettings.avatarImage} alt="Gem Avatar Preview" className="h-20 w-20 object-contain bg-gray-100 p-2 rounded-md border" />
                                <button
                                    type="button"
                                    onClick={() => setBuddySettings({ avatarImage: defaultGemAvatar })}
                                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          
          <div className="pt-6">
            {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
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
                Save All Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default Settings;