// src/app/partnership/(dashboard)/components/NotificationItem.tsx
'use client';

import { formatRelativeTime, type Notification } from '../data/mockData';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const handleClick = () => {
    onClick(notification);
  };

  return (
    <div
      onClick={handleClick}
      className={`border-l-2 ${notification.read ? 'border-gray-300' : 'border-purple-500'} pl-3 mb-4 cursor-pointer hover:bg-gray-50 transition-colors`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span
              className={`font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}
            >
              {notification.title}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
        </div>
      </div>
    </div>
  );
}
