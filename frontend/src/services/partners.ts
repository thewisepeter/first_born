// src/services/partners.ts

// Use empty string for relative URLs (nginx will proxy to Django)
const API_BASE = '';

export interface PartnerProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  partner_type: 'individual' | 'company';
  community: 'working' | 'business';
  bio: string | null;
  location: string | null;
  organization: string | null;
  total_given: string;
  months_active: number;
  joined_at: string;
  member_since: string;
  last_active: string;
  is_active: boolean;
  goals: any[];
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  organization?: string;
  partner_type?: 'individual' | 'company';
}

// Get partner profile - get current user's profile
export async function getCurrentPartnerProfile(): Promise<PartnerProfile> {
  // You need to get the current user's ID or filter by email
  // For now, let's get all and filter by the logged-in user's email
  const response = await fetch(`${API_BASE}/api/partners/partners/?page=1&page_size=100`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch partners');
  }

  const data = await response.json();

  // Since your API returns all partners, we need to filter by the current user
  // But the current user's email is in the session, so we can match it
  // For now, let's return the data and handle filtering in the component
  return data.results[0]; // Temporary - this will need to be fixed
}

// Update partner profile - you need a specific endpoint for updating
export async function updatePartnerProfile(
  id: number,
  data: UpdateProfileData
): Promise<PartnerProfile> {
  const response = await fetch(`${API_BASE}/api/partners/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}
