// src/services/resources.ts

const API_BASE = '/api';

export interface VideoResource {
  id: number;
  title: string;
  description: string;
  embed_id: string;
  source_url: string;
  category: string;
  date: string; // From API: "March 11, 2026"
  // Optional fields for component compatibility
  thumbnail_url?: string;
  duration?: string;
  speaker?: string;
  view_count?: number;
  likes?: number;
  author?: string;
  publishDate?: string;
  views?: number;
}

export interface AudioResource {
  id: string | number; // Can be string or number
  title: string;
  speaker: string;
  date: string; // From API: "March 11, 2026"
  active: boolean;
  description: string;
  category: string;
  driveUrl: string; // From API: driveUrl
  // Optional fields for component compatibility
  duration?: string;
  audio_url?: string;
  listen_count?: number;
  publishDate?: string;
  author?: string;
}

export interface ArticleResource {
  id: number;
  title: string;
  excerpt: string;
  content: string[]; // Array of paragraphs
  author: string;
  date: string; // From API: "March 11, 2026"
  status: string;
  category: string;
  readTime: string; // From API: "1 min read"
  likes: number;
  comments: number;
  image: string; // From API: image URL
  tags: string[];
  // Optional fields for component compatibility
  publishDate?: string;
  featured_image?: string;
  read_count?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get videos with category filter
export async function getVideos(
  category: string = 'Partners',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<VideoResource>> {
  const url = `${API_BASE}/mediafiles/video/?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }

  const data = await response.json();

  // Now it's paginated with count, next, previous, results
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      publishDate: item.date,
      views: 0,
      likes: 0,
      author: 'Prophet Namara Ernest',
      duration: '15 min',
    })),
  };
}

// Get audio with category filter
export async function getAudios(
  category: string = 'Partners',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<AudioResource>> {
  const url = `${API_BASE}/mediafiles/audio/?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audio');
  }

  const data = await response.json();

  // 🔴 FIX: Return the transformed data
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      publishDate: item.date,
      author: item.speaker,
      audio_url: item.driveUrl,
      duration: '10 min',
      listen_count: 0,
    })),
  };
}

// Get articles with category filter
export async function getArticles(
  category: string = 'Partners',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<ArticleResource>> {
  const url = `${API_BASE}/blog/blogposts/?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  const data = await response.json();

  // 🔴 FIX: Return the transformed data
  return {
    ...data,
    results: data.results.map((item: any) => ({
      ...item,
      publishDate: item.date,
      featured_image: item.image,
      read_count: item.likes || 0,
    })),
  };
}

// Helper function to extract YouTube ID from URL (keeping for future use)
function extractYouTubeId(url: string): string | undefined {
  if (!url) return undefined;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}
