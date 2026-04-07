const API_BASE = '/api';

export interface Activity {
  id: number;
  action_type: string;
  action_display: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  actor_name: string | null;
  is_read: boolean;
  is_public: boolean;
  created_at: string;
  time_ago: string;
}

// Get recent public updates (for the bell icon)
// ✅ Now fetches from /api/activities/recent_updates/
export async function getNotifications(limit: number = 20): Promise<Activity[]> {
  const response = await fetch(`${API_BASE}/activities/recent_updates/?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

// Mark a single notification as read (for bell icon - if you want to track read status)
export async function markNotificationAsRead(id: number): Promise<void> {
  // Note: The recent_updates endpoint might not support marking as read
  // since these are public updates. You might want to remove this functionality
  // or implement it differently.
  const response = await fetch(`${API_BASE}/activities/${id}/mark_read/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch(`${API_BASE}/activities/mark_all_read/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
}
