// src/app/partnership/(dashboard)/components/ActivityItem.tsx
'use client';

import { Activity } from '../data/mockData';
import { CheckCircle, DollarSign, Eye, MessageSquare, Share2, ThumbsUp } from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'giving':
        return <DollarSign className="h-4 w-4" />;
      case 'prayer':
        return <ThumbsUp className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'update':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4">📝</div>;
    }
  };

  const getTypeLabel = () => {
    switch (activity.type) {
      case 'giving':
        return 'Giving';
      case 'prayer':
        return 'Prayer';
      case 'view':
        return 'View';
      case 'share':
        return 'Share';
      case 'message':
        return 'Message';
      case 'update':
        return 'Update';
      default:
        return 'Activity';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return `UGX ${amount.toLocaleString('en-US')}`;
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className={`p-2 rounded-full ${activity.color} shrink-0`}>{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900">{activity.description}</span>
          <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {getTypeLabel()}
          </span>
          {activity.amount && (
            <span className="text-xs font-semibold text-green-700">
              {formatCurrency(activity.amount)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">{activity.date}</span>
          {activity.metadata?.opportunityId && (
            <span className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer">
              View related opportunity
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
