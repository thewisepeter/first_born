// src/app/partnership/(dashboard)/components/NotificationItem.tsx
'use client';

// Define the Notification type
interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date | string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

// Helper function to format relative time
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return notificationDate.toLocaleDateString();
  }
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const handleClick = () => {
    onClick(notification);
  };

  return (
    <div
      onClick={handleClick}
      className={`border-l-2 ${notification.read ? 'border-gray-300' : 'border-purple-500'} pl-3 mb-4 cursor-pointer hover:bg-gray-50 transition-colors`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={`Notification: ${notification.title}`}
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
