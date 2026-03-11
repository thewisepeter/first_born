// src/services/drives.ts
const API_BASE = '/api';

export interface Drive {
  id: number;
  title: string;
  description: string;
  category: string;
  goal_amount: string | number;
  start_date: string;
  end_date: string;
  color_scheme: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_published: boolean;
  progress_percentage: number;
  days_remaining: number;
  contributions_count: number;
}

export interface DriveStats {
  total_drives: number;
  active_drives: number;
  total_goal: number;
  total_raised: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get all drives with pagination
export async function getDrives(
  page: number = 1,
  pageSize: number = 10,
  activeOnly: boolean = true
): Promise<PaginatedResponse<Drive>> {
  // Build URL with query params
  let url = `${API_BASE}/drives/?page=${page}&page_size=${pageSize}`;
  if (activeOnly) {
    url += '&is_published=true'; // or however you filter active drives
  }

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch drives');
  }

  const data = await response.json();
  console.log('📡 Drives API response:', data);

  // Convert string amounts to numbers and ensure numeric fields
  if (data.results) {
    data.results = data.results.map((item: any) => ({
      ...item,
      goal_amount: parseFloat(item.goal_amount),
      progress_percentage: parseFloat(item.progress_percentage),
      days_remaining: parseInt(item.days_remaining),
      contributions_count: parseInt(item.contributions_count),
    }));
  }

  return data;
}

// Get all drives (simplified, all pages)
export async function getAllDrives(activeOnly: boolean = true): Promise<Drive[]> {
  let page = 1;
  let allDrives: Drive[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await getDrives(page, 50, activeOnly);
    allDrives = [...allDrives, ...response.results];

    if (response.next) {
      page++;
    } else {
      hasMore = false;
    }
  }

  return allDrives;
}

// Get single drive by ID
export async function getDrive(id: number): Promise<Drive> {
  const response = await fetch(`${API_BASE}/drives/${id}/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch drive');
  }

  const data = await response.json();

  return {
    ...data,
    goal_amount: parseFloat(data.goal_amount),
    progress_percentage: parseFloat(data.progress_percentage),
    days_remaining: parseInt(data.days_remaining),
    contributions_count: parseInt(data.contributions_count),
  };
}

// Calculate stats from drives
export function calculateDriveStats(drives: Drive[]): DriveStats {
  const activeDrives = drives.filter((d) => d.days_remaining > 0 && d.is_published);

  const totalGoal = activeDrives.reduce(
    (sum, drive) =>
      sum +
      (typeof drive.goal_amount === 'string' ? parseFloat(drive.goal_amount) : drive.goal_amount),
    0
  );

  // Note: current_amount isn't in your API yet, so we'll use goal_amount * progress_percentage
  const totalRaised = activeDrives.reduce((sum, drive) => {
    const goal =
      typeof drive.goal_amount === 'string' ? parseFloat(drive.goal_amount) : drive.goal_amount;
    return sum + goal * (drive.progress_percentage / 100);
  }, 0);

  return {
    total_drives: drives.length,
    active_drives: activeDrives.length,
    total_goal: totalGoal, // ✅ This should be here
    total_raised: totalRaised,
  };
}
