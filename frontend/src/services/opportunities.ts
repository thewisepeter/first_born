// src/services/opportunities.ts

const API_BASE = '/api';

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  company: string;
  opportunity_type: 'job' | 'tender' | 'contract' | 'volunteer' | 'other';
  community: 'working' | 'business';
  location: string;
  is_remote: boolean;
  is_hybrid: boolean;
  deadline: string;
  days_remaining: number;
  is_active: boolean;
  is_featured: boolean;
  is_urgent: boolean;
  posted_date: string;
  requirements: string[];
  application_link: string;
}

export interface OpportunityStats {
  total_opportunities: number;
  active_opportunities: number;
  urgent_opportunities: number;
  featured_opportunities: number;
  working_community: number;
  business_community: number;
  by_type: {
    job: number;
    tender: number;
    contract: number;
    volunteer: number;
    other: number;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get all opportunities with pagination
export async function getOpportunities(
  page: number = 1,
  pageSize: number = 10,
  activeOnly: boolean = true
): Promise<PaginatedResponse<Opportunity>> {
  // Build URL with query params
  let url = `${API_BASE}/opportunities/?page=${page}&page_size=${pageSize}`;
  if (activeOnly) {
    url += '&is_active=true'; // Note: using is_active, not is_published
  }

  console.log('📡 Fetching from Next.js API:', url);

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }

  const data = await response.json();
  console.log('📡 Raw API response:', data); // 👈 See exactly what comes back

  // Log the structure
  console.log('📡 Response keys:', Object.keys(data));
  console.log('📡 Has results array:', Array.isArray(data.results));
  console.log('📡 Count value:', data.count);

  // Ensure numeric fields are properly typed
  if (data.results) {
    data.results = data.results.map((item: any) => ({
      ...item,
      days_remaining: parseInt(item.days_remaining || 0),
    }));
  }

  return data;
}

// Get all opportunities (all pages)
export async function getAllOpportunities(activeOnly: boolean = true): Promise<Opportunity[]> {
  let page = 1;
  let allOpportunities: Opportunity[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await getOpportunities(page, 50, activeOnly);
    console.log(`📊 Page ${page} response:`, response); // 👈 Debug each page

    if (response.results && response.results.length > 0) {
      allOpportunities = [...allOpportunities, ...response.results];
    }

    if (response.next) {
      page++;
    } else {
      hasMore = false;
    }
  }

  return allOpportunities;
}

// Get single opportunity by ID
export async function getOpportunity(id: number): Promise<Opportunity> {
  const response = await fetch(`${API_BASE}/opportunities/${id}/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch opportunity');
  }

  const data = await response.json();

  return {
    ...data,
    days_remaining: parseInt(data.days_remaining || 0),
  };
}

// Calculate stats from opportunities
export function calculateOpportunityStats(opportunities: Opportunity[]): OpportunityStats {
  const activeOpportunities = opportunities.filter((o) => o.is_active);

  // Count by type
  const byType = {
    job: 0,
    tender: 0,
    contract: 0,
    volunteer: 0,
    other: 0,
  };

  opportunities.forEach((opp) => {
    if (opp.opportunity_type in byType) {
      byType[opp.opportunity_type as keyof typeof byType]++;
    } else {
      byType.other++;
    }
  });

  return {
    total_opportunities: opportunities.length,
    active_opportunities: activeOpportunities.length,
    urgent_opportunities: opportunities.filter((o) => o.is_urgent && o.is_active).length,
    featured_opportunities: opportunities.filter((o) => o.is_featured && o.is_active).length,
    working_community: opportunities.filter((o) => o.community === 'working' && o.is_active).length,
    business_community: opportunities.filter((o) => o.community === 'business' && o.is_active)
      .length,
    by_type: byType,
  };
}
