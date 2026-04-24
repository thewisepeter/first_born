// Use empty string for relative URLs (nginx will proxy to Django)
const API_BASE = '';

export interface MarketplaceListing {
  id: number;
  slug: string;
  title: string;
  description: string;
  listing_type: 'product' | 'service' | 'need';
  category: number;
  category_name: string;
  status: 'available' | 'pending' | 'sold' | 'expired';
  price: string;
  currency: string;
  is_price_negotiable: boolean;
  is_free: boolean;
  location: string;
  is_location_flexible: boolean;
  image: string | null;
  image_url: string;
  contact_method: 'phone' | 'email' | 'whatsapp' | 'in_app';
  contact_info: string;
  contact_visible: boolean;
  partner_name: string;
  partner_community: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  saves_count: number;
  inquiries_count: number;
  is_featured: boolean;
  is_urgent: boolean;
  is_verified: boolean;
  is_active: boolean;
  posted_date: string;
  updated_at: string;
  expiry_date: string;
  days_remaining: number;
  is_liked: boolean;
  is_saved: boolean;
}

export interface MarketplaceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  listing_type: 'product' | 'service' | 'need' | 'all';
  is_active: boolean;
  order: number;
}

export interface MarketplaceStats {
  total_listings: number;
  active_listings: number;
  total_products: number;
  total_services: number;
  total_needs: number;
  by_category: Record<string, number>;
  recent_listings: MarketplaceListing[];
  featured_listings: MarketplaceListing[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get all listings with pagination and filters
export async function getListings(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    type?: string;
    category?: number;
    search?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    urgent?: boolean;
    mine?: boolean;
  }
): Promise<PaginatedResponse<MarketplaceListing>> {
  let url = `${API_BASE}/api/marketplace/listings/?page=${page}&page_size=${pageSize}`;

  if (filters) {
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.category) url += `&category=${filters.category}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;
    if (filters.featured) url += `&featured=true`;
    if (filters.urgent) url += `&urgent=true`;
    if (filters.mine) url += `&mine=true`;
  }

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch marketplace listings');
  }

  const data = await response.json();

  // Convert string numbers to actual numbers
  if (data.results) {
    data.results = data.results.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
      views_count: parseInt(item.views_count),
      likes_count: parseInt(item.likes_count),
      saves_count: parseInt(item.saves_count),
      inquiries_count: parseInt(item.inquiries_count),
      days_remaining: parseInt(item.days_remaining),
    }));
  }

  return data;
}

// Get single listing by ID
export async function getListing(id: number): Promise<MarketplaceListing> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/${id}/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch listing');
  }

  const data = await response.json();
  return {
    ...data,
    price: parseFloat(data.price),
    views_count: parseInt(data.views_count),
    likes_count: parseInt(data.likes_count),
    saves_count: parseInt(data.saves_count),
    inquiries_count: parseInt(data.inquiries_count),
    days_remaining: parseInt(data.days_remaining),
  };
}

// Get marketplace categories
export async function getCategories(): Promise<MarketplaceCategory[]> {
  const response = await fetch(`${API_BASE}/api/marketplace/categories/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// Get marketplace stats
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/stats/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch marketplace stats');
  }

  const data = await response.json();

  // Convert string numbers to numbers
  if (data.recent_listings) {
    data.recent_listings = data.recent_listings.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
    }));
  }

  if (data.featured_listings) {
    data.featured_listings = data.featured_listings.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
    }));
  }

  return data;
}

// Create a new listing
export async function createListing(data: any): Promise<MarketplaceListing> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create listing');
  }

  const result = await response.json();
  return {
    ...result,
    price: parseFloat(result.price),
  };
}

// Update a listing
export async function updateListing(id: number, data: any): Promise<MarketplaceListing> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update listing');
  }

  const result = await response.json();
  return {
    ...result,
    price: parseFloat(result.price),
  };
}

// Delete a listing
export async function deleteListing(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete listing');
  }
}

// Like/unlike a listing
export async function toggleLike(id: number): Promise<{ likes_count: number; is_liked: boolean }> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/${id}/like/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }

  return response.json();
}

// Save/unsave a listing
export async function toggleSave(id: number): Promise<{ saves_count: number; is_saved: boolean }> {
  const response = await fetch(`${API_BASE}/api/marketplace/listings/${id}/save/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to toggle save');
  }

  return response.json();
}
