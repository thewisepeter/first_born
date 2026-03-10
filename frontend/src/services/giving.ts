// services/giving.ts

const API_BASE = '/api';

export interface Giving {
  id: number;
  transaction_id: string;
  amount: number;
  giving_type: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  date: string;
  recorded_at: string;
  is_scheduled: boolean;
  frequency: string;
  partner_name: string;
  is_verified: boolean;
  receipt_sent: boolean;
}

export interface GivingGoal {
  id: number;
  period: 'monthly' | 'quarterly' | 'annual';
  target_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current_amount: number;
  progress_percentage: number;
}

export interface ScheduledGiving {
  id: number;
  amount: string;
  giving_type: string;
  title: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  start_date: string;
  next_payment_date: string;
  end_date: string | null;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  days_until_next: number | null;
  drive?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface GivingStatement {
  id: number;
  statement_type: 'quarterly' | 'annual' | 'custom';
  period_start: string;
  period_end: string;
  period_display: string;
  file_url: string;
  total_amount: number;
  transaction_count: number;
  generated_at: string;
  downloaded_count?: number;
  last_downloaded_at?: string;
}

export interface GivingStats {
  total_given: number;
  monthly_goal: number;
  goal_progress: number;
  upcoming_payments: number;
  this_month_giving: number;
  last_month_giving: number;
  month_over_month_change: number;
  by_type: Record<string, number>;
  recent_transactions: Giving[];
  active_schedules: ScheduledGiving[];
}

// Get giving statistics for dashboard
export async function getGivingStats(): Promise<GivingStats> {
  const response = await fetch(`${API_BASE}/giving/stats/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch giving stats');
  }

  return response.json();
}

// Get giving history with pagination
// Get giving history with pagination
export async function getGivingHistory(
  page = 1,
  pageSize = 10
): Promise<{
  results: Giving[];
  count: number;
  next: string | null;
  previous: string | null;
}> {
  console.log('📡 Fetching giving history for page:', page);

  const response = await fetch(`${API_BASE}/giving/?page=${page}&page_size=${pageSize}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch giving history');
  }

  const data = await response.json();
  console.log('📡 History API response:', data);

  // 🔴 FIX: Handle both array response and paginated response
  if (Array.isArray(data)) {
    // If API returns array directly, wrap it in pagination format
    console.log('📡 API returned array, wrapping in pagination format');
    return {
      results: data.map((item: any) => ({
        ...item,
        amount: parseFloat(item.amount),
      })),
      count: data.length,
      next: null,
      previous: null,
    };
  } else {
    // If API returns paginated response
    console.log('📡 API returned paginated response');
    console.log('📡 History results count:', data.results?.length);

    // Convert amount strings to numbers
    if (data.results) {
      data.results = data.results.map((item: any) => ({
        ...item,
        amount: parseFloat(item.amount),
      }));
    }

    return data;
  }
}

// Get monthly summary for chart
export async function getMonthlySummary(year?: number): Promise<
  Array<{
    month: string;
    total: number;
    month_number: number;
  }>
> {
  const url = year
    ? `${API_BASE}/giving/monthly_summary/?year=${year}`
    : `${API_BASE}/giving/monthly_summary/`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch monthly summary');
  }

  return response.json();
}

// Get scheduled givings
export async function getScheduledGivings(): Promise<ScheduledGiving[]> {
  const response = await fetch(`${API_BASE}/giving/scheduled/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled givings');
  }

  return response.json();
}

// Create scheduled giving
export async function createScheduledGiving(data: {
  amount: number;
  giving_type: string;
  title: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  drive?: number | null;
}): Promise<ScheduledGiving> {
  const response = await fetch(`${API_BASE}/giving/scheduled/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create scheduled giving');
  }

  return response.json();
}

// Update scheduled giving
export async function updateScheduledGiving(
  id: number,
  data: Partial<{
    amount: number | string;
    giving_type: string;
    title: string;
    description: string;
    notes: string;
    frequency: string;
    payment_method: string;
    end_date: string | null;
    status: string;
  }>
): Promise<ScheduledGiving> {
  const response = await fetch(`${API_BASE}/giving/scheduled/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update scheduled giving');
  }

  return response.json();
}

// Pause scheduled giving
export async function pauseScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const response = await fetch(`${API_BASE}/giving/scheduled/${id}/pause/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to pause scheduled giving');
  }

  return response.json();
}

// Resume scheduled giving
export async function resumeScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const response = await fetch(`${API_BASE}/giving/scheduled/${id}/resume/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to resume scheduled giving');
  }

  return response.json();
}

// Cancel scheduled giving
export async function cancelScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const response = await fetch(`${API_BASE}/giving/scheduled/${id}/cancel/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to cancel scheduled giving');
  }

  return response.json();
}

// Get giving statements
export async function getGivingStatements(): Promise<GivingStatement[]> {
  const response = await fetch(`${API_BASE}/giving/statements/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch giving statements');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      ...item,
      total_amount: parseFloat(item.total_amount),
    }));
  }

  return data;
}

// Download statement (record download)
export async function downloadStatement(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/giving/statements/${id}/download/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download statement');
  }

  // Get the file URL from response
  const data = await response.json();

  if (data.file_url) {
    // Open the file in a new tab (will trigger download if PDF)
    window.open(data.file_url, '_blank');
  } else {
    throw new Error('No file URL returned');
  }
}

// Generate a custom statement
export async function generateCustomStatement(
  startDate: string,
  endDate: string
): Promise<{ file_url: string; message: string }> {
  const response = await fetch(`${API_BASE}/giving/statements/generate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      period_start: startDate,
      period_end: endDate,
      statement_type: 'custom',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate statement');
  }

  return response.json();
}

// Get upcoming payments
export async function getUpcomingPayments(): Promise<ScheduledGiving[]> {
  const response = await fetch(`${API_BASE}/giving/upcoming-payments/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch upcoming payments');
  }

  return response.json();
}

// Get recent giving (for dashboard)
export async function getRecentGiving(limit = 5): Promise<Giving[]> {
  const response = await fetch(`${API_BASE}/giving/recent/?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent giving');
  }

  return response.json();
}

export async function createDirectGiving(data: {
  amount: number;
  giving_type: string;
  date: string;
  payment_method: string;
  drive?: number | null;
}): Promise<Giving> {
  const response = await fetch(`${API_BASE}/giving/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create giving record');
  }

  const result = await response.json();
  return {
    ...result,
    amount: parseFloat(result.amount),
  };
}
