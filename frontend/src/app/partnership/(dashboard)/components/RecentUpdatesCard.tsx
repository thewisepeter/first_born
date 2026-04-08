// src/app/partnership/(dashboard)/components/RecentUpdatesCard.tsx
'use client';

import { useState, useEffect } from 'react';

// Define the RecentUpdate type
interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  publishDate: Date | string;
  type?: 'announcement' | 'update' | 'feature';
}

interface RecentUpdatesCardProps {
  maxItems?: number;
}

// Helper function to format relative time
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const updateDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - updateDate.getTime()) / 1000);
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
    return updateDate.toLocaleDateString();
  }
}

// Function to generate mock updates (replace with actual API call)
function generateRecentUpdates(): RecentUpdate[] {
  return [
    {
      id: '1',
      title: 'New Partnership Tier Available',
      description: "We've launched a new premium partnership tier with exclusive benefits.",
      publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      type: 'announcement',
    },
    {
      id: '2',
      title: 'Monthly Report Ready',
      description: 'Your partnership impact report for March is now available for download.',
      publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      type: 'update',
    },
    {
      id: '3',
      title: 'Upcoming Webinar',
      description: 'Join us for a special webinar on maximizing your partnership impact.',
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      type: 'feature',
    },
    {
      id: '4',
      title: 'System Maintenance',
      description:
        'Scheduled maintenance on April 15th. The dashboard may be temporarily unavailable.',
      publishDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      type: 'announcement',
    },
  ];
}

export function RecentUpdatesCard({ maxItems = 2 }: RecentUpdatesCardProps) {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpdates = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const allUpdates = generateRecentUpdates();
        const recentUpdates = allUpdates.slice(0, maxItems);
        setUpdates(recentUpdates);
        setLoading(false);
      }, 300);
    };

    loadUpdates();
  }, [maxItems]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h2>

      {loading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="border-l-2 border-gray-200 pl-3">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="border-l-2 border-gray-200 pl-3">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
            </div>
          </div>
        </div>
      ) : updates.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No updates available</p>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Announcement
              key={update.id}
              title={update.title}
              time={formatRelativeTime(update.publishDate)}
              description={update.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Announcement component
function Announcement({
  title,
  time,
  description,
}: {
  title: string;
  time: string;
  description: string;
}) {
  return (
    <div className="border-l-2 border-purple-500 pl-3">
      <div className="flex justify-between">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
}
