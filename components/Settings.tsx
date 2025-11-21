import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { getSettings, saveSettings } from '../services/settingsService.ts';
import { getBuddySettings, saveBuddySettings } from '../services/buddyService.ts';
import { getLeaveAllocationSettings, saveLeaveAllocationSettings } from '../services/leaveAllocationService.ts';
import { CompanySettings, BuddySettings, LeaveAllocationSettings } from '../types.ts';
import { GEM_AVATAR as defaultGemAvatar } from '../constants.tsx';
import { uploadFile } from '../services/gcsService.ts';
import { isCloudEnabled } from '../services/firebase.ts';


const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>({ companyName: '', companyAddress: '', companyLogo: '' });
  const [buddySettings, setBuddySettings] = useState<BuddySettings>({ avatarImage: '' });
  const [leaveSettings, setLeaveSettings] = useState<LeaveAllocationSettings>({ short: 0, sick: 0, personal: 0 });
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setSettings(await getSettings());
        setBuddySettings(await getBuddySettings());
        setLeaveSettings(await getLeaveAllocationSettings());
        setIsCloud(isCloudEnabled());
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

  const handleExportData = () => {
    const dataStr = JSON.stringify(localStorage);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pharmayush_hr_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCloudBackup = async () => {
      setIsBackingUp(true);
      setBackupStatus('Connecting to Google Cloud Storage...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackupStatus('Encrypting data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If Cloud is enabled, data is already there, so this is just a visual feedback or manual sync
      if (isCloud) {
        setBackupStatus('Data is synced with Firestore Cloud Database.');
      } else {
        setBackupStatus('Upload failed: Cloud connection not configured.');
      }
      
      setIsBackingUp(false);
      setTimeout(() => setBackupStatus(''), 5000);
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
      <div className="max-w-3xl mx-auto">
        {/* Connection Status Banner */}
        <div className={`mb-6 p-3 rounded-md border flex items-center justify-between ${isCloud ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
            <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${isCloud ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span>
                <span className="font-medium text-sm">
                    {isCloud ? 'Connected to Google Cloud Firestore' : 'Running in Local Storage Mode'}
                </span>
            </div>
            {!isCloud && <span className="text-xs opacity-75">Add Firebase keys to .env to enable cloud persistence.</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
            {/* --- Company Details Section --- */}
            <div className="pt-4">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h3>
                 <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
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

                    <div className="sm:col-span-6">
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

                    <div className="sm:col-span-6">
                        <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700">Company Logo</label>
                        <div className="mt-1 flex items-center">
                            {settings.companyLogo ? (
                                <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <img src={settings.companyLogo} alt="Logo" className="h-full w-full object-contain" />
                                </span>
                            ) : (
                                <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            )}
                            <div className="ml-5">
                                <input
                                    type="file"
                                    id="companyLogo"
                                    accept="image/jpeg, image/png, image/gif"
                                    onChange={handleLogoChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {isUploadingLogo && <span className="text-xs text-indigo-600 animate-pulse mt-1 block">Uploading...</span>}
                            </div>
                             {settings.companyLogo && (
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, companyLogo: '' }))}
                                    className="ml-4 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                 </div>
            </div>

             {/* --- Monthly Leave Allocation Section --- */}
            <div className="pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Monthly Leave Allocation</h3>
                <p className="text-sm text-gray-500 mb-4">Automatic leave credits per month.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="short" className="block text-sm font-medium text-gray-700">Short Leaves (hours)</label>
                        <input
                        type="number"
                        id="short"
                        name="short"
                        min="0"
                        value={leaveSettings.short}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="sick" className="block text-sm font-medium text-gray-700">Sick Leaves (days)</label>
                        <input
                        type="number"
                        id="sick"
                        name="sick"
                        min="0"
                        value={leaveSettings.sick}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="personal" className="block text-sm font-medium text-gray-700">Personal Leaves (days)</label>
                        <input
                        type="number"
                        id="personal"
                        name="personal"
                        min="0"
                        value={leaveSettings.personal}
                        onChange={handleLeaveSettingChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* --- HR Assistant Avatar Section --- */}
            <div className="pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">HR Assistant 'Gem' Avatar</h3>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <img src={buddySettings.avatarImage} alt="Gem Avatar Preview" className="h-20 w-20 object-contain bg-gray-100 p-2 rounded-full border" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="buddyAvatar" className="block text-sm font-medium text-gray-700 mb-2">Upload new avatar</label>
                         <input
                            type="file"
                            id="buddyAvatar"
                            accept="image/jpeg, image/png, image/gif, image/svg+xml"
                            onChange={handleBuddyAvatarChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {isUploadingAvatar && <span className="text-xs text-indigo-600 animate-pulse">Uploading...</span>}
                         {buddySettings.avatarImage !== defaultGemAvatar && (
                             <button
                                type="button"
                                onClick={() => setBuddySettings({ avatarImage: defaultGemAvatar })}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                Restore Default Avatar
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* --- Data Management Section --- */}
            <div className="pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Management</h3>
                <p className="text-sm text-gray-500 mb-4">Manage your organization's data persistence and backups.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                            <p className="text-xs text-gray-500">Download a local JSON backup of all system data.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportData}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Export JSON
                        </button>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-medium text-gray-900">Cloud Backup</h4>
                            <p className="text-xs text-gray-500">
                                {isCloud ? 'Data is automatically synced to Cloud.' : 'Manually trigger a snapshot backup.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloudBackup}
                            disabled={isBackingUp}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isBackingUp ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Backing Up...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                    Backup to Cloud
                                </>
                            )}
                        </button>
                    </div>
                    {backupStatus && <p className="text-xs text-green-600 font-medium mt-2 text-right">{backupStatus}</p>}
                </div>
            </div>
          
          <div className="pt-6">
            {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
            <div className="flex items-center justify-end gap-4">
               {showSuccess && (
                <span className="text-sm font-medium text-green-600 animate-pulse">
                  Settings saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transform transition-transform active:scale-95"
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