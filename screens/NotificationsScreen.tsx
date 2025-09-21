import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';
import Header from '../components/common/Header';
import { BellIcon, TrashIcon } from '../components/icons/Icons';

interface NotificationsScreenProps {
    notifications: AppNotification[];
    onSelectNotification: (notification: AppNotification) => void;
    onMarkAllRead: () => void;
    onDeleteNotification: (notificationId: string) => void;
    onBack: () => void;
}

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const NotificationItem: React.FC<{
    notification: AppNotification;
    onSelect: (notification: AppNotification) => void;
    onDelete: (notificationId: string) => void;
    isSwiped: boolean;
    setSwipedId: (id: string | null) => void;
}> = ({ notification, onSelect, onDelete, isSwiped, setSwipedId }) => {
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);
    const itemRef = useRef<HTMLDivElement>(null);
    const SWIPE_WIDTH = 80;

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchCurrentX.current = touchStartX.current;
        if (itemRef.current) {
            itemRef.current.style.transition = 'transform 0s';
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchCurrentX.current = e.targetTouches[0].clientX;
        const diff = touchCurrentX.current - touchStartX.current;
        if (diff < 0) { // Only allow swiping left
            if (itemRef.current) {
                itemRef.current.style.transform = `translateX(${Math.max(-SWIPE_WIDTH, diff)}px)`;
            }
        }
    };

    const onTouchEnd = () => {
        if (!itemRef.current) return;
        itemRef.current.style.transition = 'transform 0.3s ease';
        const diff = touchCurrentX.current - touchStartX.current;

        if (diff < -SWIPE_WIDTH / 2) { // Swiped far enough
            itemRef.current.style.transform = `translateX(-${SWIPE_WIDTH}px)`;
            setSwipedId(notification.id);
        } else { // Didn't swipe far enough, snap back
            itemRef.current.style.transform = 'translateX(0)';
            if (isSwiped) {
                setSwipedId(null);
            }
        }
    };

    useEffect(() => {
        if (!isSwiped && itemRef.current) {
            itemRef.current.style.transform = 'translateX(0)';
        } else if (isSwiped && itemRef.current) {
             itemRef.current.style.transform = `translateX(-${SWIPE_WIDTH}px)`;
        }
    }, [isSwiped, SWIPE_WIDTH]);
    
    return (
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-20 bg-red-600 flex items-center justify-center">
                <button
                    onClick={() => onDelete(notification.id)}
                    className="text-white p-2 h-full w-full flex flex-col items-center justify-center"
                    aria-label={`Delete notification: ${notification.message}`}
                >
                    <TrashIcon className="h-6 w-6"/>
                    <span className="text-xs mt-1">Delete</span>
                </button>
            </div>
            <div
                ref={itemRef}
                className="relative w-full transition-transform duration-300 ease"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: 'pan-y' }}
            >
                <div
                    onClick={() => {
                        if (isSwiped) {
                            setSwipedId(null); // Clicking a swiped item closes it
                        } else {
                            onSelect(notification);
                        }
                    }}
                    className="w-full text-left bg-white dark:bg-slate-800 p-4 flex items-start space-x-4 cursor-pointer"
                >
                    <div className="flex-shrink-0 relative">
                        <BellIcon className="h-6 w-6 text-slate-500 dark:text-slate-400 mt-1" />
                        {!notification.isRead && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-800" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className={`text-slate-800 dark:text-slate-200 ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.message}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {timeSince(new Date(notification.timestamp))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ notifications, onSelectNotification, onMarkAllRead, onDeleteNotification, onBack }) => {
    const hasUnread = notifications.some(n => !n.isRead);
    const [swipedNotificationId, setSwipedNotificationId] = useState<string | null>(null);

    const handleSetSwiped = (id: string | null) => {
        setSwipedNotificationId(id);
    };

    return (
        <div>
            <Header
                title="Notifications"
                actions={
                    hasUnread ? (
                        <button
                            onClick={onMarkAllRead}
                            className="text-sm font-semibold text-blue-500 dark:text-blue-400 hover:underline"
                        >
                            Mark all as read
                        </button>
                    ) : null
                }
            />
            <div className="p-4">
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(notification => (
                           <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onSelect={onSelectNotification}
                                onDelete={onDeleteNotification}
                                isSwiped={swipedNotificationId === notification.id}
                                setSwipedId={handleSetSwiped}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-20">
                        <BellIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Notifications Yet</h3>
                        <p className="text-sm">Updates about your reports will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsScreen;