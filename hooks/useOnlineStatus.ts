import { useState, useEffect } from 'react';

/**
 * A custom React hook that tracks the browser's online/offline status.
 * @returns {boolean} `true` if the browser is online, `false` otherwise.
 */
export const useOnlineStatus = (): boolean => {
    // Initialize state with the current online status
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        // Define handlers to update the state
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Add event listeners for online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function to remove event listeners
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
