const APP_PREFIX = 'pharmayush_hr_';
const VERSION_KEY = `${APP_PREFIX}version`;
const CURRENT_VERSION = '1.1.0'; // Increment this version to force a clear on next deployment

/**
 * Checks the version of data in localStorage. If it's old, it clears all
 * application-specific data to prevent issues with outdated structures.
 * This should be run once when the application initializes.
 */
export const checkStorageVersion = (): void => {
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);

        if (storedVersion !== CURRENT_VERSION) {
            console.log(`Storage version mismatch. Found: ${storedVersion}, expected: ${CURRENT_VERSION}. Clearing app storage.`);
            
            // Use a copy of the keys to avoid issues while iterating and removing
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(APP_PREFIX)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Set the new version
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            console.log('App storage cleared and version updated.');
        }
    } catch (e) {
        console.warn('Could not check or update storage version. localStorage might be unavailable.', e);
    }
};
