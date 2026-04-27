// services/giving.ts

// Use empty string for relative URLs (nginx will proxy to Django)
const API_BASE = '';

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
  // ✅ FIX: Use /api/giving/givings/stats/
  const response = await fetch(`${API_BASE}/api/giving/givings/stats/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch giving stats');
  }

  return response.json();
}

// Get giving history with pagination - ✅ CORRECT
export async function getGivingHistory(
  page = 1,
  pageSize = 10
): Promise<{
  results: Giving[];
  count: number;
  next: string | null;
  previous: string | null;
}> {
  const response = await fetch(
    `${API_BASE}/api/giving/givings/?page=${page}&page_size=${pageSize}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch giving history');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
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
    ? `${API_BASE}/api/giving/givings/monthly_summary/?year=${year}`
    : `${API_BASE}/api/giving/givings/monthly_summary/`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    // Return empty array instead of throwing error
    console.warn('Monthly summary endpoint not available');
    return [];
  }

  return response.json();
}

// Get scheduled givings - ✅ CORRECT
export async function getScheduledGivings(): Promise<ScheduledGiving[]> {
  const response = await fetch(`${API_BASE}/api/giving/scheduled/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled givings');
  }

  const data = await response.json();
  console.log('📡 Scheduled givings response:', data);

  if (Array.isArray(data)) {
    return data;
  }
  return data.results || [];
}

// Create scheduled giving - ✅ CORRECT
export async function createScheduledGiving(data: {
  amount: number;
  giving_type: string;
  title: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  drive?: number | null;
}): Promise<ScheduledGiving> {
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/scheduled/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
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

// Update scheduled giving - ✅ CORRECT
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
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/scheduled/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
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

// Pause scheduled giving - ✅ CORRECT
export async function pauseScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/scheduled/${id}/pause/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to pause scheduled giving');
  }

  return response.json();
}

// Resume scheduled giving - ✅ CORRECT
export async function resumeScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/scheduled/${id}/resume/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to resume scheduled giving');
  }

  return response.json();
}

// Cancel scheduled giving - ✅ CORRECT
export async function cancelScheduledGiving(
  id: number
): Promise<{ message: string; status: string }> {
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/scheduled/${id}/cancel/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to cancel scheduled giving');
  }

  return response.json();
}

// Get giving statements - ✅ CORRECT
export async function getGivingStatements(): Promise<GivingStatement[]> {
  const response = await fetch(`${API_BASE}/api/giving/statements/`, {
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

// Download statement - ✅ CORRECT
export async function downloadStatement(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/giving/statements/${id}/download/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download statement');
  }

  const data = await response.json();

  if (data.file_url) {
    window.open(data.file_url, '_blank');
  } else {
    throw new Error('No file URL returned');
  }
}

// Generate a custom statement - ✅ CORRECT
export async function generateCustomStatement(
  startDate: string,
  endDate: string
): Promise<{ file_url: string; message: string }> {
  const response = await fetch(`${API_BASE}/api/giving/statements/generate/`, {
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

// Get upcoming payments - ⚠️ MIGHT NEED FIX
export async function getUpcomingPayments(): Promise<ScheduledGiving[]> {
  // This endpoint might not exist. Consider using:
  // /api/giving/scheduled/?upcoming=true
  const response = await fetch(`${API_BASE}/api/giving/upcoming-payments/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    // Fallback: get all scheduled and filter
    const allScheduled = await getScheduledGivings();
    const today = new Date().toISOString().split('T')[0];
    return allScheduled.filter((s) => s.next_payment_date >= today && s.status === 'active');
  }

  return response.json();
}

// Get recent giving (for dashboard)
export async function getRecentGiving(limit = 5): Promise<Giving[]> {
  const response = await fetch(`${API_BASE}/api/giving/givings/recent/?limit=${limit}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent giving');
  }

  return response.json();
}

// Create direct giving - ✅ CORRECT
export async function createDirectGiving(data: {
  amount: number;
  giving_type: string;
  date: string;
  payment_method: string;
  drive?: number | null;
}): Promise<Giving> {
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  const response = await fetch(`${API_BASE}/api/giving/givings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
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
