// src/app/partnership/(dashboard)/data/mockData.ts
export interface DashboardStats {
  totalGiven: number;
  impactScore: number;
  prayerCount: number;
  opportunitiesCount: number;
  weeklyCommitment: number;
  nextContributionDate: string;
  weeklyBudget: {
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    weekNumber: number;
    year: number;
    startDate: string;
    endDate: string;
  };
}

// Add to your existing interfaces in mockData.ts
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'drive' | 'statement' | 'announcement' | 'message' | 'giving';
  createdAt: string; // ISO string
  read: boolean;
  actionUrl?: string;
  metadata?: {
    opportunityId?: number;
    driveId?: string;
    statementId?: string;
    amount?: number;
    community?: string;
  };
}

export interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  publishDate: string; // ISO string for sorting
  type: 'announcement' | 'event' | 'broadcast' | 'testimony' | 'opportunity';
  readMoreUrl?: string;
  author?: string;
}

export interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
  link: string;
  community: string;
}

export interface Drive {
  id: string;
  title: string;
  description: string;
  type: 'broadcast' | 'fellowship' | 'bible' | 'outreach' | 'media';
  status: 'active' | 'completed' | 'upcoming';
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  deadline: string;
  isUrgent: boolean;
  location?: string;
  ministryArea: string;
}

export interface Activity {
  id: string;
  type: 'giving' | 'prayer' | 'view' | 'update' | 'share' | 'message';
  description: string;
  amount?: number;
  date: string;
  time: string;
  icon: string;
  color: string;
  metadata?: Record<string, any>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'opportunity' | 'prayer' | 'thanks' | 'urgent';
  publishDate: string;
  isRead: boolean;
  author: string;
}

export interface WeeklyBudget {
  weekNumber: number;
  year: number;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface GivingHistoryItem {
  id: number;
  amount: number;
  date: string;
  type: string;
  status: string;
}

export interface UpcomingPayment {
  id: number;
  amount: number;
  dueDate: string;
  type: string;
  frequency: string;
  startDate: string;
  paymentMethod: string;
  purpose: string;
  notes: string;
  title: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
}

export interface GivingMethod {
  id: number;
  name: string;
  type: string;
  lastUsed: string;
  default?: boolean;
}

export interface GivingData {
  totalGiven: number;
  monthlyGoal: number;
  givingHistory: GivingHistoryItem[];
  upcomingPayments: UpcomingPayment[];
  givingMethods: GivingMethod[];
}

export interface BaseResource {
  id: string | number;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article';
  category: ResourceCategory;
  duration: number; // in minutes
  views: number;
  likes: number;
  author: string;
  publishDate: string;
  isFeatured: boolean;
  isNew: boolean;
  fileSize?: string;
  url: string;
}

export interface Statement {
  id: string;
  period: 'annual' | 'quarterly' | 'monthly' | 'custom';
  label: string;
  year: number;
  quarter?: number; // 1-4 for quarterly statements
  startDate: string;
  endDate: string;
  generatedDate: string;
  fileSize: string; // e.g., "2.4 MB"
  downloadUrl: string;
  isAvailable: boolean;
}

export interface RecentDownload {
  id: string;
  statementId: string;
  statementName: string;
  downloadedAt: string; // ISO string
  fileSize: string;
}

export interface AvailableStatement {
  type: 'quarterly' | 'annual';
  year: number;
  quarter?: number;
  available: boolean;
  generatedDate: string;
}

// Add statement data to GivingData interface
export interface GivingData {
  totalGiven: number;
  monthlyGoal: number;
  givingHistory: GivingHistoryItem[];
  upcomingPayments: UpcomingPayment[];
  givingMethods: GivingMethod[];
  statements?: Statement[]; // Add optional statements array
  recentDownloads?: RecentDownload[]; // Add optional recent downloads
}

// Extended interfaces for specific types
export interface VideoResource extends BaseResource {
  type: 'video';
  embed_id?: string;
  source_url: string;
}

export interface AudioResource extends BaseResource {
  type: 'audio';
  speaker?: string;
  active?: boolean;
  driveUrl?: string;
}

export interface ArticleResource extends BaseResource {
  type: 'article';
  excerpt?: string;
  content?: string | string[];
  status?: string;
  readTime?: string;
  comments?: number;
  image?: string;
  tags?: string[];
}

// Union type for all resources
export type Resource = VideoResource | AudioResource | ArticleResource;

// Keep your original interfaces for other parts of the app
export interface VideoData {
  id: string;
  title: string;
  description: string;
  embed_id: string;
  source_url: string;
  date: string;
  category: string;
}

export interface AudioItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  active: boolean;
  description: string;
  driveUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string | string[];
  author: string;
  date: string;
  status: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
}

// Update the MarketplaceItem interface to include images
export interface MarketplaceItem {
  id: string;
  type: 'service' | 'product' | 'need';
  title: string;
  description: string;
  price: number;
  currency: 'UGX' | 'USD';
  category: string;
  postedBy: {
    id: string;
    name: string;
    avatarColor: string;
    community: 'working-class' | 'business-class';
    memberSince: string;
  };
  postedDate: string;
  location: string;
  status: 'available' | 'sold' | 'negotiating' | 'urgent';
  tags: string[];
  contactMethod: 'message' | 'phone' | 'email' | 'whatsapp';
  imageUrl: string; // Add this for a single image
  images?: string[]; // Optional array for multiple images
  views: number;
  likes: number;
  comments: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  type: 'service' | 'product' | 'need';
}

export type ResourceCategory =
  | 'teaching'
  | 'testimony'
  | 'prophetic'
  | 'video'
  | 'audio'
  | 'article'
  | 'annual-message'
  | 'leadership'
  | 'prayer';

// Mock data generators
export const generateMockStats = (): DashboardStats => ({
  totalGiven: 4250000,
  impactScore: 85,
  prayerCount: 12,
  opportunitiesCount: 3,
  weeklyCommitment: 100000,
  nextContributionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  weeklyBudget: {
    targetAmount: 5000000,
    currentAmount: 3450000,
    progressPercentage: 69,
    weekNumber: 45,
    year: 2024,
    startDate: new Date(2024, 10, 4).toISOString(), // Nov 4, 2024
    endDate: new Date(2024, 10, 10).toISOString(), // Nov 10, 2024
  },
});

export const generateMockDrives = (): Drive[] => [
  {
    id: '1',
    title: 'Spirit World Radio Broadcast',
    description:
      "Support airtime and production for this week's broadcast that reaches thousands across Uganda. Help us spread the gospel through radio waves.",
    type: 'broadcast',
    status: 'active',
    targetAmount: 2500000,
    currentAmount: 1875000,
    startDate: '2024-11-01',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: false,
    location: 'Kampala & Nationwide',
    ministryArea: 'Media & Broadcast',
  },
  {
    id: '2',
    title: 'Saturday Fellowship Support',
    description:
      'Logistics and media support for First Born Fellowship. Includes sound system, venue, and refreshments for 500+ attendees.',
    type: 'fellowship',
    status: 'active',
    targetAmount: 1800000,
    currentAmount: 810000,
    startDate: '2024-11-01',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: false,
    location: 'First Born Ministry Center',
    ministryArea: 'Fellowship & Worship',
  },
  {
    id: '3',
    title: 'Bible Distribution Drive',
    description:
      'Providing Bibles to rural communities across Uganda. Each Bible costs UGX 15,000. Target: 200 Bibles this month.',
    type: 'bible',
    status: 'active',
    targetAmount: 800000,
    currentAmount: 720000,
    startDate: '2024-11-01',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: true,
    location: 'Rural Communities',
    ministryArea: 'Evangelism & Outreach',
  },
  {
    id: '4',
    title: 'Youth Camp December 2024',
    description:
      'Annual youth camp for 300+ young people. Covers accommodation, food, materials, and transportation subsidies.',
    type: 'outreach',
    status: 'upcoming',
    targetAmount: 3500000,
    currentAmount: 1050000,
    startDate: '2024-12-15',
    deadline: '2024-12-10',
    isUrgent: false,
    location: 'Munyonyo',
    ministryArea: 'Youth Ministry',
  },
];

export const generateMockActivities = (): Activity[] => [
  {
    id: '1',
    type: 'giving',
    description: 'Weekly partnership giving',
    amount: 500000,
    date: 'Today',
    time: '10:30 AM',
    icon: '💰',
    color: 'bg-green-100 text-green-700',
    metadata: { opportunityId: '1' },
  },
  {
    id: '2',
    type: 'prayer',
    description: 'Shared prayer request for healing',
    date: 'Yesterday',
    time: '3:15 PM',
    icon: '🙏',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: '3',
    type: 'view',
    description: 'Viewed Spirit World broadcast',
    date: '2 days ago',
    time: '8:45 PM',
    icon: '👁️',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    id: '4',
    type: 'share',
    description: 'Shared ministry update on social media',
    date: '3 days ago',
    time: '2:20 PM',
    icon: '📱',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    id: '5',
    type: 'message',
    description: 'Sent encouragement to ministry team',
    date: '4 days ago',
    time: '11:10 AM',
    icon: '💬',
    color: 'bg-yellow-100 text-yellow-700',
  },
];

export const generateMockOpportunities = (): Opportunity[] => [
  {
    id: 1,
    title: 'Backend Software Developer',
    company: 'MTN Uganda',
    location: 'Remote',
    deadline: '2026-05-30',
    description: 'Build and maintain backend services for our applications.',
    requirements: ['Writing skills', 'Ministry values', 'SEO knowledge'],
    link: 'https://opengatesinc.com',
    community: 'Working Class Community',
  },
  {
    id: 2,
    title: 'Backend Software Developer',
    company: 'MTN Uganda',
    location: 'Remote',
    deadline: '2026-03-21',
    description: 'Build and maintain backend services for our applications.',
    requirements: ['Writing skills', 'Ministry values', 'SEO knowledge'],
    link: 'https://opengatesinc.com',
    community: 'Working Class Community',
  },
  {
    id: 3,
    title: 'Backend Software Developer',
    company: 'MTN Uganda',
    location: 'Remote',
    deadline: '2026-01-30',
    description: 'Build and maintain backend services for our applications.',
    requirements: ['Writing skills', 'Ministry values', 'SEO knowledge'],
    link: 'https://opengatesinc.com',
    community: 'Working Class Community',
  },
  {
    id: 4,
    title: 'Backend Software Developer',
    company: 'Open Gates Inc',
    location: 'Remote',
    deadline: '2026-01-30',
    description: 'Build and maintain backend services for our applications.',
    requirements: ['Writing skills', 'Ministry values', 'SEO knowledge'],
    link: 'https://opengatesinc.com',
    community: 'Working Class Community',
  },
  {
    id: 201,
    title: 'Road Construction Tender',
    company: 'Governement of Uganda',
    location: 'Kampala, Uganda',
    deadline: '2026-02-20',
    description: 'Contract for construction of 10km road in Kampala.',
    requirements: ['Valid business license', 'Previous experience'],
    link: 'https://opengatesinc.com',
    community: 'Business Community',
  },
  {
    id: 301,
    title: 'Traffic Light Supply Contract',
    company: 'Kampala City Council',
    location: 'Kampala, Uganda',
    deadline: '2026-03-05',
    description: 'Supply and installation of traffic lights in Kampala.',
    requirements: ['Quality assurance', 'Warranty terms'],
    link: 'https://opengatesinc.com',
    community: 'Business Community',
  },
];

export const generateMockAnnouncements = (): Announcement[] => [
  {
    id: '1',
    title: 'New Spirit World Episode Released',
    content:
      'Prophet Namara shares fresh insights from the Spirit World broadcast about divine provision in challenging times.',
    type: 'general',
    publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    author: 'Prophet Namara',
  },
  {
    id: '2',
    title: 'Special Prayer Session This Friday',
    content:
      'Join us for a special prayer session dedicated to all ministry partners. We will be praying for breakthroughs in your lives.',
    type: 'prayer',
    publishDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    author: 'Prayer Team',
  },
  {
    id: '3',
    title: 'Thank You for Your Support!',
    content:
      'Because of your generosity, we distributed 150 Bibles last week to rural communities. Lives are being transformed!',
    type: 'thanks',
    publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: false,
    author: 'Outreach Department',
  },
];

export const generateWeeklyBudget = (): WeeklyBudget => ({
  weekNumber: 45,
  year: 2024,
  targetAmount: 5000000,
  currentAmount: 3450000,
  progressPercentage: 69,
  startDate: '2024-11-04',
  endDate: '2024-11-10',
  breakdown: [
    { category: 'Broadcast Airtime', amount: 1500000, percentage: 43 },
    { category: 'Fellowship Logistics', amount: 800000, percentage: 23 },
    { category: 'Bible Distribution', amount: 600000, percentage: 17 },
    { category: 'Staff Support', amount: 350000, percentage: 10 },
    { category: 'Administration', amount: 200000, percentage: 6 },
  ],
});

// NEW GIVING MOCK DATA
export const generateGivingData = (): GivingData => ({
  totalGiven: 4250000,
  monthlyGoal: 5000000,
  givingHistory: [
    {
      id: 1,
      amount: 500000,
      date: 'Jan 15, 2024',
      type: 'Weekly Partnership',
      status: 'completed',
    },
    {
      id: 2,
      amount: 250000,
      date: 'Jan 8, 2024',
      type: 'Special Offering',
      status: 'completed',
    },
    {
      id: 3,
      amount: 500000,
      date: 'Jan 1, 2024',
      type: 'Weekly Partnership',
      status: 'completed',
    },
    {
      id: 4,
      amount: 1000000,
      date: 'Dec 25, 2023',
      type: 'Christmas Offering',
      status: 'completed',
    },
    {
      id: 5,
      amount: 500000,
      date: 'Dec 18, 2023',
      type: 'Weekly Partnership',
      status: 'completed',
    },
    {
      id: 6,
      amount: 300000,
      date: 'Dec 11, 2023',
      type: 'Radio Broadcast',
      status: 'completed',
    },
    {
      id: 7,
      amount: 750000,
      date: 'Dec 4, 2023',
      type: 'Thanksgiving Offering',
      status: 'completed',
    },
    {
      id: 8,
      amount: 500000,
      date: 'Nov 27, 2023',
      type: 'Weekly Partnership',
      status: 'completed',
    },
    {
      id: 9,
      amount: 200000,
      date: 'Nov 20, 2023',
      type: 'Bible Distribution',
      status: 'completed',
    },
    {
      id: 10,
      amount: 500000,
      date: 'Nov 13, 2023',
      type: 'Weekly Partnership',
      status: 'completed',
    },
  ],
  upcomingPayments: [
    {
      id: 1,
      amount: 500000,
      dueDate: 'Jan 22, 2024',
      type: 'Weekly Partnership',
      frequency: 'weekly',
      startDate: '2024-01-22',
      paymentMethod: 'mobile-money',
      purpose: 'weekly-partnership',
      notes: 'Auto-debit every Monday',
      title: 'Weekly Partnership',
      status: 'pending',
    },
    {
      id: 2,
      amount: 200000,
      dueDate: 'Jan 29, 2024',
      type: 'Radio Broadcast Support',
      frequency: 'monthly',
      startDate: '2024-01-29',
      paymentMethod: 'bank-transfer',
      purpose: 'radio-broadcast',
      notes: 'Support for Spirit World radio program',
      title: 'Radio Broadcast Support',
      status: 'pending',
    },
    {
      id: 3,
      amount: 300000,
      dueDate: 'Feb 5, 2024',
      type: 'Youth Camp Support',
      frequency: 'quarterly',
      startDate: '2024-02-05',
      paymentMethod: 'credit-card',
      purpose: 'youth-camp',
      notes: 'Quarterly support for youth ministry',
      title: 'Youth Camp Support',
      status: 'pending',
    },
  ],
  givingMethods: [
    {
      id: 1,
      name: 'Mobile Money',
      type: 'MTN',
      lastUsed: 'Today',
      default: true,
    },
    {
      id: 2,
      name: 'Bank Transfer',
      type: 'Stanbic Bank',
      lastUsed: 'Last week',
    },
    {
      id: 3,
      name: 'Credit Card',
      type: 'Visa',
      lastUsed: '2 weeks ago',
    },
  ],
});

export const generateResourcesData = (): Resource[] => [
  // ============ VIDEO RESOURCES (7-8 videos) ============
  {
    id: 'video-1',
    title: 'The Power of Consistent Partnership',
    description:
      'Prophet Namara shares deep insights on how consistent giving activates supernatural provision in your life and business.',
    type: 'video',
    category: 'teaching',
    duration: 45,
    views: 15432,
    likes: 1245,
    author: 'Prophet Namara',
    publishDate: '2024-01-15',
    isFeatured: true,
    isNew: false,
    fileSize: '1.2 GB',
    url: '/resources/videos/power-of-partnership',
    source_url: 'https://www.youtube.com/watch?v=abc123def',
    embed_id: 'abc123def',
  },
  {
    id: 'video-2',
    title: 'Prophetic Declarations for Financial Breakthrough',
    description: 'Powerful prophetic words for partners seeking financial miracles.',
    type: 'video',
    category: 'prophetic',
    duration: 38,
    views: 12890,
    likes: 987,
    author: 'Prophet Namara',
    publishDate: '2024-01-10',
    isFeatured: true,
    isNew: true,
    fileSize: '1.1 GB',
    url: '/resources/videos/prophetic-financial-breakthrough',
    source_url: 'https://www.youtube.com/watch?v=xyz456ghi',
    embed_id: 'xyz456ghi',
  },
  {
    id: 'video-3',
    title: 'Leadership in Kingdom Business',
    description: 'How to lead with excellence in both ministry and marketplace.',
    type: 'video',
    category: 'leadership',
    duration: 52,
    views: 8921,
    likes: 765,
    author: 'Prophet Namara',
    publishDate: '2024-01-05',
    isFeatured: false,
    isNew: true,
    fileSize: '1.5 GB',
    url: '/resources/videos/kingdom-business-leadership',
    source_url: 'https://www.youtube.com/watch?v=jkl789mno',
    embed_id: 'jkl789mno',
  },
  {
    id: 'video-4',
    title: 'Miracle Testimonies: Partners Share Their Stories',
    description: 'Real partners share powerful testimonies of healing and breakthrough.',
    type: 'video',
    category: 'testimony',
    duration: 68,
    views: 15678,
    likes: 1345,
    author: 'Testimony Team',
    publishDate: '2023-12-28',
    isFeatured: true,
    isNew: false,
    fileSize: '1.8 GB',
    url: '/resources/videos/miracle-testimonies',
    source_url: 'https://www.youtube.com/watch?v=pqr123stu',
    embed_id: 'pqr123stu',
  },
  {
    id: 'video-5',
    title: 'Morning Prayer for Partners and Families',
    description: 'Start your day with this powerful prayer session.',
    type: 'video',
    category: 'prayer',
    duration: 32,
    views: 23456,
    likes: 1987,
    author: 'Prayer Team',
    publishDate: '2023-12-20',
    isFeatured: false,
    isNew: false,
    fileSize: '950 MB',
    url: '/resources/videos/morning-prayer-partners',
    source_url: 'https://www.youtube.com/watch?v=vwx345yz',
    embed_id: 'vwx345yz',
  },
  {
    id: 'video-6',
    title: '2024 Annual Message: Positioning for Greater Impact',
    description: "Prophet Namara's annual message revealing God's strategy for the coming year.",
    type: 'video',
    category: 'annual-message',
    duration: 75,
    views: 18765,
    likes: 1567,
    author: 'Prophet Namara',
    publishDate: '2023-12-15',
    isFeatured: true,
    isNew: false,
    fileSize: '2.1 GB',
    url: '/resources/videos/2024-annual-message',
    source_url: 'https://www.youtube.com/watch?v=abc789xyz',
    embed_id: 'abc789xyz',
  },
  {
    id: 'video-7',
    title: 'Ministry Update: New Projects and Impact Report',
    description: 'Latest update on ministry projects and the impact of partner giving.',
    type: 'video',
    category: 'teaching',
    duration: 42,
    views: 10987,
    likes: 876,
    author: 'Ministry Updates',
    publishDate: '2023-12-10',
    isFeatured: false,
    isNew: false,
    fileSize: '1.3 GB',
    url: '/resources/videos/ministry-update-dec2023',
    source_url: 'https://www.youtube.com/watch?v=def456jkl',
    embed_id: 'def456jkl',
  },

  // ============ AUDIO RESOURCES (6-8 audios) ============
  {
    id: 'audio-1',
    title: 'Annual Partner Appreciation Message 2024',
    description:
      'A special message to all ministry partners for their unwavering support throughout the year.',
    type: 'audio',
    category: 'annual-message',
    duration: 38,
    views: 8921,
    likes: 876,
    author: 'Prophet Namara',
    publishDate: '2024-01-10',
    isFeatured: true,
    isNew: true,
    fileSize: '45 MB',
    url: '/resources/audio/annual-message-2024',
    driveUrl: 'https://drive.google.com/file/d/audio1',
  },
  {
    id: 'audio-2',
    title: 'Prayer of Thanksgiving for Partners',
    description: 'A special prayer session dedicated to all ministry partners and their families.',
    type: 'audio',
    category: 'prayer',
    duration: 18,
    views: 12345,
    likes: 1098,
    author: 'Prayer Team',
    publishDate: '2023-12-10',
    isFeatured: true,
    isNew: false,
    fileSize: '20 MB',
    url: '/resources/audio/thanksgiving-prayer',
    driveUrl: 'https://drive.google.com/file/d/audio2',
  },
  {
    id: 'audio-3',
    title: 'Prophetic Word for Business Owners',
    description:
      'Specific prophetic direction for partners who are business owners and entrepreneurs.',
    type: 'audio',
    category: 'prophetic',
    duration: 30,
    views: 8765,
    likes: 765,
    author: 'Prophet Namara',
    publishDate: '2023-11-05',
    isFeatured: false,
    isNew: false,
    fileSize: '35 MB',
    url: '/resources/audio/prophetic-business-owners',
    driveUrl: 'https://drive.google.com/file/d/audio3',
  },
  {
    id: 'audio-4',
    title: 'Morning Prayer for Financial Breakthrough',
    description: 'Start your day with this powerful prayer for supernatural financial provision.',
    type: 'audio',
    category: 'prayer',
    duration: 22,
    views: 15678,
    likes: 1345,
    author: 'Prophet Namara',
    publishDate: '2023-10-20',
    isFeatured: true,
    isNew: false,
    fileSize: '25 MB',
    url: '/resources/audio/morning-prayer-financial',
    driveUrl: 'https://drive.google.com/file/d/audio4',
  },
  {
    id: 'audio-5',
    title: 'Partner Worship Night Recording',
    description: 'Full recording of the special worship night dedicated to all ministry partners.',
    type: 'audio',
    category: 'audio',
    duration: 95,
    views: 5432,
    likes: 432,
    author: 'Worship Team',
    publishDate: '2023-11-25',
    isFeatured: false,
    isNew: false,
    fileSize: '110 MB',
    url: '/resources/audio/worship-night',
    driveUrl: 'https://drive.google.com/file/d/audio5',
  },
  {
    id: 'audio-6',
    title: 'Teaching on Seed Faith and Harvest',
    description: 'Understanding the biblical principles of sowing and reaping in kingdom finances.',
    type: 'audio',
    category: 'teaching',
    duration: 42,
    views: 9876,
    likes: 876,
    author: 'Prophet Namara',
    publishDate: '2023-10-15',
    isFeatured: true,
    isNew: false,
    fileSize: '48 MB',
    url: '/resources/audio/seed-faith-teaching',
    driveUrl: 'https://drive.google.com/file/d/audio6',
  },
  {
    id: 'audio-7',
    title: 'Evening Meditation for Peace',
    description: 'Guided meditation and prayer for peace, rest, and divine protection.',
    type: 'audio',
    category: 'prayer',
    duration: 25,
    views: 7654,
    likes: 654,
    author: 'Prayer Team',
    publishDate: '2023-09-30',
    isFeatured: false,
    isNew: false,
    fileSize: '28 MB',
    url: '/resources/audio/evening-meditation',
    driveUrl: 'https://drive.google.com/file/d/audio7',
  },
  {
    id: 'audio-8',
    title: 'Leadership Principles for Partners',
    description:
      'Audio teaching on leadership development for ministry partners in leadership roles.',
    type: 'audio',
    category: 'leadership',
    duration: 55,
    views: 6543,
    likes: 543,
    author: 'Prophet Namara',
    publishDate: '2023-09-20',
    isFeatured: false,
    isNew: true,
    fileSize: '62 MB',
    url: '/resources/audio/leadership-principles',
    driveUrl: 'https://drive.google.com/file/d/audio8',
  },

  // ============ ARTICLE RESOURCES (6-8 articles) ============
  {
    id: 'article-1',
    title: 'Financial Breakthrough Testimonies',
    description: 'Real stories from partners who experienced supernatural financial breakthroughs.',
    type: 'article',
    category: 'testimony',
    duration: 12,
    views: 7234,
    likes: 543,
    author: 'Testimony Team',
    publishDate: '2024-01-05',
    isFeatured: false,
    isNew: true,
    fileSize: '2 MB',
    url: '/resources/articles/financial-breakthroughs',
    excerpt:
      'Real stories from partners who experienced supernatural financial breakthroughs through consistent partnership.',
    readTime: '5 min',
    comments: 42,
    image: '/images/testimonies-blog.jpg',
    tags: ['testimony', 'finance', 'breakthrough'],
  },
  {
    id: 'article-2',
    title: 'Building a Legacy of Giving',
    description: 'How to establish a generational legacy through kingdom partnership.',
    type: 'article',
    category: 'teaching',
    duration: 15,
    views: 6543,
    likes: 432,
    author: 'Prophet Namara',
    publishDate: '2023-11-28',
    isFeatured: true,
    isNew: false,
    fileSize: '2.5 MB',
    url: '/resources/articles/legacy-giving',
    excerpt:
      "Legacy giving goes beyond monetary contributions. It's about establishing a generational impact.",
    readTime: '8 min',
    comments: 28,
    image: '/images/legacy-blog.jpg',
    tags: ['legacy', 'stewardship', 'generations'],
  },
  {
    id: 'article-3',
    title: 'The Impact of Your Giving',
    description:
      'See how partner contributions are transforming lives and communities across Uganda.',
    type: 'article',
    category: 'prayer',
    duration: 10,
    views: 8765,
    likes: 654,
    author: 'Impact Team',
    publishDate: '2023-12-05',
    isFeatured: false,
    isNew: false,
    fileSize: '1.8 MB',
    url: '/resources/articles/impact-report',
    excerpt:
      'Through your support, we have distributed Bibles, supported broadcasts, and transformed communities.',
    readTime: '6 min',
    comments: 38,
    image: '/images/impact-blog.jpg',
    tags: ['impact', 'giving', 'community'],
  },
  {
    id: 'article-4',
    title: 'Understanding Firstborn Principles',
    description: 'Deep teaching on the principles of firstborn blessing and responsibility.',
    type: 'article',
    category: 'teaching',
    duration: 20,
    views: 5432,
    likes: 432,
    author: 'Prophet Namara',
    publishDate: '2023-11-20',
    isFeatured: true,
    isNew: false,
    fileSize: '3 MB',
    url: '/resources/articles/firstborn-principles',
    excerpt:
      'The firstborn principle is a powerful kingdom concept that affects inheritance and blessing.',
    readTime: '12 min',
    comments: 35,
    image: '/images/firstborn-blog.jpg',
    tags: ['teaching', 'firstborn', 'kingdom'],
  },
  {
    id: 'article-5',
    title: 'Partner Spotlights: Stories of Impact',
    description: 'Featuring stories of partners who are making a difference in their communities.',
    type: 'article',
    category: 'prayer',
    duration: 8,
    views: 4321,
    likes: 321,
    author: 'Community Team',
    publishDate: '2023-11-15',
    isFeatured: false,
    isNew: false,
    fileSize: '1.5 MB',
    url: '/resources/articles/partner-spotlights',
    excerpt:
      'Meet the partners who are extending the ministry impact beyond financial contributions.',
    readTime: '5 min',
    comments: 25,
    image: '/images/spotlight-blog.jpg',
    tags: ['spotlight', 'community', 'impact'],
  },
  {
    id: 'article-6',
    title: 'Prayer Guide for Partners',
    description:
      'A comprehensive guide to praying effectively for your family, business, and ministry.',
    type: 'article',
    category: 'prayer',
    duration: 18,
    views: 5678,
    likes: 456,
    author: 'Prayer Team',
    publishDate: '2023-11-10',
    isFeatured: false,
    isNew: true,
    fileSize: '2.2 MB',
    url: '/resources/articles/prayer-guide',
    excerpt: 'Learn how to pray effectively for every area of your life as a kingdom partner.',
    readTime: '10 min',
    comments: 32,
    image: '/images/prayer-guide.jpg',
    tags: ['prayer', 'guide', 'spiritual'],
  },
  {
    id: 'article-7',
    title: 'Monthly Ministry Update - January 2024',
    description: 'Latest updates on ministry projects, new initiatives, and partner testimonies.',
    type: 'article',
    category: 'prayer',
    duration: 15,
    views: 3456,
    likes: 287,
    author: 'Ministry Updates',
    publishDate: '2024-01-01',
    isFeatured: true,
    isNew: true,
    fileSize: '2.8 MB',
    url: '/resources/articles/january-update',
    excerpt:
      "What's happening in the ministry this month: new projects, testimonies, and opportunities.",
    readTime: '8 min',
    comments: 19,
    image: '/images/update-january.jpg',
    tags: ['update', 'ministry', 'news'],
  },
  {
    id: 'article-8',
    title: 'Biblical Principles of Wealth Creation',
    description:
      "Exploring God's design for wealth creation and stewardship from a biblical perspective.",
    type: 'article',
    category: 'teaching',
    duration: 25,
    views: 7890,
    likes: 678,
    author: 'Prophet Namara',
    publishDate: '2023-10-25',
    isFeatured: false,
    isNew: false,
    fileSize: '3.5 MB',
    url: '/resources/articles/biblical-wealth',
    excerpt:
      "Understanding wealth from God's perspective: it's not just about accumulation, but purpose.",
    readTime: '15 min',
    comments: 45,
    image: '/images/biblical-wealth.jpg',
    tags: ['wealth', 'biblical', 'stewardship'],
  },
];

export const generateAvailableStatements = (): AvailableStatement[] => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate statements for the past 3 years
  const statements: AvailableStatement[] = [];

  for (let year = currentYear - 2; year <= currentYear; year++) {
    // Annual statements (available if year is complete)
    if (year < currentYear || (year === currentYear && currentMonth === 0)) {
      statements.push({
        type: 'annual',
        year,
        available: true,
        generatedDate: `${year + 1}-01-15`,
      });
    }

    // Quarterly statements (Q1-Q4)
    for (let quarter = 1; quarter <= 4; quarter++) {
      // Statement is available if the quarter is complete
      // Q1 ends March 31, Q2 ends June 30, Q3 ends Sep 30, Q4 ends Dec 31
      const quarterEndMonth = quarter * 3 - 1; // 0-indexed: Feb, May, Aug, Nov
      const isComplete =
        year < currentYear || (year === currentYear && currentMonth > quarterEndMonth);

      if (isComplete) {
        statements.push({
          type: 'quarterly',
          year,
          quarter,
          available: true,
          generatedDate: `${year}-${String(quarter * 3).padStart(2, '0')}-01`,
        });
      }
    }
  }

  return statements.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.type === 'annual' && b.type === 'quarterly') return -1;
    if (a.type === 'quarterly' && b.type === 'annual') return 1;
    return (b.quarter || 0) - (a.quarter || 0);
  });
};

// Generate mock statements with proper dates
export const generateMockStatements = (): Statement[] => {
  const currentYear = new Date().getFullYear();

  return [
    // Annual statements
    {
      id: `annual-${currentYear - 1}`,
      period: 'annual',
      label: `${currentYear - 1} Annual Statement`,
      year: currentYear - 1,
      startDate: `${currentYear - 1}-01-01`,
      endDate: `${currentYear - 1}-12-31`,
      generatedDate: `${currentYear}-01-15T10:30:00Z`,
      fileSize: '2.4 MB',
      downloadUrl: `/api/statements/annual/${currentYear - 1}`,
      isAvailable: true,
    },
    {
      id: `annual-${currentYear - 2}`,
      period: 'annual',
      label: `${currentYear - 2} Annual Statement`,
      year: currentYear - 2,
      startDate: `${currentYear - 2}-01-01`,
      endDate: `${currentYear - 2}-12-31`,
      generatedDate: `${currentYear - 1}-01-20T14:45:00Z`,
      fileSize: '2.1 MB',
      downloadUrl: `/api/statements/annual/${currentYear - 2}`,
      isAvailable: true,
    },

    // Quarterly statements for previous year
    ...Array.from({ length: 4 }, (_, i) => {
      const quarter = 4 - i; // Q4, Q3, Q2, Q1
      return {
        id: `q${quarter}-${currentYear - 1}`,
        period: 'quarterly',
        label: `Q${quarter} ${currentYear - 1} Statement`,
        year: currentYear - 1,
        quarter,
        startDate: `${currentYear - 1}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`,
        endDate: `${currentYear - 1}-${String(quarter * 3).padStart(2, '0')}-${quarter === 1 ? '31' : quarter === 2 ? '30' : quarter === 3 ? '30' : '31'}`,
        generatedDate: `${currentYear - 1}-${String(quarter * 3 + 1).padStart(2, '0')}-05T09:15:00Z`,
        fileSize: `${0.9 + Math.random() * 0.3} MB`,
        downloadUrl: `/api/statements/quarterly/${currentYear - 1}/${quarter}`,
        isAvailable: true,
      };
    }),

    // Current year quarterly statements (only available quarters)
    ...(() => {
      const currentMonth = new Date().getMonth();
      const availableQuarters = [];

      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterEndMonth = quarter * 3 - 1; // 0-indexed
        if (currentMonth > quarterEndMonth) {
          availableQuarters.push({
            id: `q${quarter}-${currentYear}`,
            period: 'quarterly',
            label: `Q${quarter} ${currentYear} Statement`,
            year: currentYear,
            quarter,
            startDate: `${currentYear}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`,
            endDate: `${currentYear}-${String(quarter * 3).padStart(2, '0')}-${quarter === 1 ? '31' : quarter === 2 ? '30' : quarter === 3 ? '30' : '31'}`,
            generatedDate: `${currentYear}-${String(quarter * 3 + 1).padStart(2, '0')}-05T09:15:00Z`,
            fileSize: `${0.9 + Math.random() * 0.3} MB`,
            downloadUrl: `/api/statements/quarterly/${currentYear}/${quarter}`,
            isAvailable: true,
          });
        }
      }
      return availableQuarters;
    })(),
  ].sort((a, b) => {
    // Sort by year descending, then by type (annual first), then by quarter descending
    if (a.year !== b.year) return b.year - a.year;
    if (a.period === 'annual' && b.period === 'quarterly') return -1;
    if (a.period === 'quarterly' && b.period === 'annual') return 1;
    return (b.quarter || 0) - (a.quarter || 0);
  });
};

// Generate recent downloads mock data
export const generateRecentDownloads = (): RecentDownload[] => {
  const now = new Date();
  return [
    {
      id: 'download-1',
      statementId: 'q3-2023',
      statementName: 'Q3 2023 Statement',
      downloadedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      fileSize: '1.1 MB',
    },
    {
      id: 'download-2',
      statementId: 'annual-2022',
      statementName: '2022 Annual Statement',
      downloadedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      fileSize: '2.1 MB',
    },
    {
      id: 'download-3',
      statementId: 'q2-2023',
      statementName: 'Q2 2023 Statement',
      downloadedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      fileSize: '1.0 MB',
    },
  ];
};

// Helper function to get latest statements (quarterly and annual)
export const getLatestStatements = (): {
  quarterly?: Statement;
  annual?: Statement;
} => {
  const statements = generateMockStatements();

  // Find latest quarterly statement
  const quarterly = statements
    .filter((s) => s.period === 'quarterly')
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (b.quarter || 0) - (a.quarter || 0);
    })[0];

  // Find latest annual statement
  const annual = statements.filter((s) => s.period === 'annual').sort((a, b) => b.year - a.year)[0];

  return { quarterly, annual };
};

// Or keep the object version and add a helper:
export const getLatestStatementsArray = (): Statement[] => {
  const { quarterly, annual } = getLatestStatements();
  const result = [];
  if (quarterly) result.push(quarterly);
  if (annual) result.push(annual);
  return result;
};

// Helper function to download statement (simulated)
export const downloadStatement = async (
  statementId: string,
  statementType: 'quarterly' | 'annual' | 'custom',
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; message: string; url?: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const statements = generateMockStatements();
  const statement = statements.find((s) => s.id === statementId);

  if (statement) {
    // In a real app, this would trigger a file download
    return {
      success: true,
      message: `Download started for ${statement.label}`,
      url: statement.downloadUrl,
    };
  } else if (statementType === 'custom' && startDate && endDate) {
    // Generate custom statement
    const customId = `custom-${startDate}-${endDate}`;
    return {
      success: true,
      message: `Custom statement generated for ${startDate} to ${endDate}`,
      url: `/api/statements/custom?start=${startDate}&end=${endDate}`,
    };
  }

  return {
    success: false,
    message: 'Statement not found',
  };
};

// Helper function to record a download
export const recordDownload = (
  statementId: string,
  statementName: string,
  fileSize: string
): RecentDownload => {
  const newDownload: RecentDownload = {
    id: `download-${Date.now()}`,
    statementId,
    statementName,
    downloadedAt: new Date().toISOString(),
    fileSize,
  };

  // In a real app, you would save this to your backend
  console.log('Recording download:', newDownload);

  return newDownload;
};

// Helper to format date for display (e.g., "2 days ago")
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Helper function to filter by type
export const filterResourcesByType = (
  resources: Resource[],
  type: 'all' | 'video' | 'audio' | 'blog'
): Resource[] => {
  if (type === 'all') return resources;
  return resources.filter((resource) => resource.type === type);
};

// Helper function to filter by category
export const filterResourcesByCategory = (resources: Resource[], category: string): Resource[] => {
  if (category === 'all') return resources;
  return resources.filter((resource) => {
    if (resource.type === 'video') return resource.category === category;
    if (resource.type === 'audio') return true; // Audio doesn't have category in your interface
    if (resource.type === 'article') return resource.category === category;
    return false;
  });
};

// Get unique categories from resources
export const getUniqueCategories = (resources: Resource[]): string[] => {
  const categories = new Set<string>();

  resources.forEach((resource) => {
    if (resource.type === 'video' || resource.type === 'article') {
      categories.add(resource.category);
    }
  });

  return Array.from(categories).sort();
};

export const generateRecentUpdates = (): RecentUpdate[] => {
  const now = new Date();

  return [
    {
      id: 'update-1',
      title: 'New Spirit World Episode',
      description:
        'Fresh insights from the Spirit World broadcast about divine provision in challenging times.',
      publishDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      type: 'broadcast',
      readMoreUrl: '/resources/broadcasts/spirit-world-latest',
      author: 'Prophet Namara',
    },
    {
      id: 'update-2',
      title: 'Saturday Fellowship Update',
      description: "This week's fellowship focuses on divine provision and financial breakthrough.",
      publishDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      type: 'event',
      readMoreUrl: '/events/saturday-fellowship',
      author: 'Fellowship Team',
    },
    {
      id: 'update-3',
      title: 'Bible Distribution Success',
      description:
        'Thanks to partner support, we distributed 200 Bibles to rural communities this week.',
      publishDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      type: 'testimony',
      readMoreUrl: '/testimonies/bible-distribution',
    },
    {
      id: 'update-4',
      title: 'New Partnership Opportunity',
      description: 'Join our new mentorship program for business owners in the partner community.',
      publishDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      type: 'opportunity',
      readMoreUrl: '/opportunities/mentorship-program',
    },
    {
      id: 'update-5',
      title: 'Ministry App Update',
      description:
        'New features added to the partner dashboard for better tracking and engagement.',
      publishDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      type: 'announcement',
      readMoreUrl: '/updates/app-v2',
    },
    {
      id: 'update-6',
      title: 'Youth Camp Registration Open',
      description: 'Registration is now open for the December Youth Camp. Limited slots available.',
      publishDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      type: 'event',
      readMoreUrl: '/events/youth-camp-2024',
    },
  ].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()); // Sort by latest first
};

// Helper function to format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

// Helper function to get icon for update type
export const getUpdateIcon = (type: RecentUpdate['type']): string => {
  const icons: Record<RecentUpdate['type'], string> = {
    announcement: '📢',
    event: '📅',
    broadcast: '🎙️',
    testimony: '🙏',
    opportunity: '💼',
  };
  return icons[type] || '📢';
};

// Helper function to get color for update type
export const getUpdateColor = (
  type: RecentUpdate['type']
): { bg: string; border: string; text: string } => {
  const colors: Record<RecentUpdate['type'], { bg: string; border: string; text: string }> = {
    announcement: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
    event: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
    broadcast: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
    testimony: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
    opportunity: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
  };
  return colors[type] || colors.announcement;
};

// Add this mock data generator function
export const generateNotifications = (userId?: string): Notification[] => {
  const now = new Date();

  return [
    {
      id: 'notif-1',
      title: 'New Opportunity: Road Construction Tender',
      description:
        'Government of Uganda has published a new tender for road construction worth UGX 2.5B',
      type: 'opportunity',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      read: false,
      actionUrl: '/partnership/opportunities',
      metadata: {
        opportunityId: 201,
        community: 'Business Community',
      },
    },
    {
      id: 'notif-2',
      title: 'New Drive: Youth Camp December 2024',
      description: 'Support for annual youth camp for 300+ young people. Target: UGX 3.5M',
      type: 'drive',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false,
      actionUrl: '/partnership/drives',
      metadata: {
        driveId: '4',
        amount: 3500000,
      },
    },
    {
      id: 'notif-3',
      title: 'Q3 2024 Giving Statement Available',
      description:
        'Your quarterly giving statement for July-September 2024 is now ready to download',
      type: 'statement',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      read: true,
      actionUrl: '/partnership/giving',
      metadata: {
        statementId: 'q3-2024',
      },
    },
    {
      id: 'notif-4',
      title: 'Successful Giving Transaction',
      description: 'Your weekly partnership giving of UGX 500,000 has been processed successfully',
      type: 'giving',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: true,
      actionUrl: '/partnership/giving',
      metadata: {
        amount: 500000,
      },
    },
    {
      id: 'notif-5',
      title: 'New Message from Group Leader',
      description: 'David Kato sent a message about the upcoming group meeting this Saturday',
      type: 'message',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      read: true,
      actionUrl: '/partnership/group',
    },
    {
      id: 'notif-6',
      title: 'New Spirit World Episode Available',
      description: 'Fresh insights from the latest Spirit World broadcast about divine provision',
      type: 'announcement',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      read: true,
      actionUrl: '/resources',
    },
    {
      id: 'notif-7',
      title: 'Urgent: Bible Distribution Drive',
      description: 'Last day to support Bible distribution to rural communities. Target: UGX 800K',
      type: 'drive',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      read: false,
      actionUrl: '/partnership/drives',
      metadata: {
        driveId: '3',
        amount: 800000,
      },
    },
    {
      id: 'notif-8',
      title: 'New Opportunity: Software Developer',
      description: 'MTN Uganda is hiring backend software developers. Remote position available',
      type: 'opportunity',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      read: false,
      actionUrl: '/partnership/opportunities',
      metadata: {
        opportunityId: 1,
        community: 'Working Class Community',
      },
    },
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get notification icon
export const getNotificationIcon = (type: Notification['type']): React.ReactNode => {
  const icons = {
    opportunity: '💼',
    drive: '🎯',
    statement: '📄',
    announcement: '📢',
    message: '💬',
    giving: '💰',
  };
  return icons[type] || '📢';
};

// Helper function to get notification color
export const getNotificationColor = (type: Notification['type']): string => {
  const colors = {
    opportunity: 'border-blue-500',
    drive: 'border-purple-500',
    statement: 'border-green-500',
    announcement: 'border-orange-500',
    message: 'border-indigo-500',
    giving: 'border-emerald-500',
  };
  return colors[type] || 'border-gray-500';
};

// Marketplace mock data generator
export const generateMarketplaceItems = (): MarketplaceItem[] => {
  const now = new Date();

  return [
    // Products for Sale
    // Update some items in generateMarketplaceItems function:
    {
      id: 'product-1',
      type: 'product',
      title: 'Brand New iPhone 14 Pro Max 256GB',
      description:
        'Brand new sealed iPhone 14 Pro Max, 256GB, Deep Purple. Original receipt available.',
      price: 4500000,
      currency: 'UGX',
      category: 'Electronics',
      postedBy: {
        id: 'user-1',
        name: 'David Kato',
        avatarColor: 'from-blue-600 to-blue-400',
        community: 'working-class',
        memberSince: '2023-01-15',
      },
      postedDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      location: 'Kampala Central',
      status: 'available',
      tags: ['iphone', 'smartphone', 'apple', 'new', 'sealed'],
      contactMethod: 'whatsapp',
      imageUrl:
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop&crop=center', // iPhone
      views: 124,
      likes: 15,
      comments: 8,
    },
    {
      id: 'product-2',
      type: 'product',
      title: 'Toyota Harrier 2007 Model',
      description: 'Well maintained Toyota Harrier, 2007 model, automatic transmission, new tires.',
      price: 28000000,
      currency: 'UGX',
      category: 'Vehicles',
      postedBy: {
        id: 'user-2',
        name: 'James Mwangi',
        avatarColor: 'from-green-600 to-green-400',
        community: 'business-class',
        memberSince: '2023-02-15',
      },
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Entebbe',
      status: 'negotiating',
      tags: ['toyota', 'harrier', 'car', 'vehicle', 'automatic'],
      contactMethod: 'phone',
      imageUrl:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop&crop=center', // Car
      views: 289,
      likes: 42,
      comments: 21,
    },
    {
      id: 'product-3',
      type: 'product',
      title: 'Toyota Harrier 2007 Model',
      description: 'Well maintained Toyota Harrier, 2007 model, automatic transmission, new tires.',
      price: 28000000,
      currency: 'UGX',
      category: 'Vehicles',
      postedBy: {
        id: 'user-2',
        name: 'James Mwangi',
        avatarColor: 'from-green-600 to-green-400',
        community: 'business-class',
        memberSince: '2023-02-15',
      },
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Entebbe',
      status: 'negotiating',
      tags: ['toyota', 'harrier', 'car', 'vehicle', 'automatic'],
      contactMethod: 'phone',
      imageUrl:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop&crop=center', // Car
      views: 289,
      likes: 42,
      comments: 21,
    },
    {
      id: 'product-4',
      type: 'product',
      title: 'Toyota Harrier 2007 Model',
      description: 'Well maintained Toyota Harrier, 2007 model, automatic transmission, new tires.',
      price: 28000000,
      currency: 'UGX',
      category: 'Vehicles',
      postedBy: {
        id: 'user-2',
        name: 'James Mwangi',
        avatarColor: 'from-green-600 to-green-400',
        community: 'business-class',
        memberSince: '2023-02-15',
      },
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Entebbe',
      status: 'negotiating',
      tags: ['toyota', 'harrier', 'car', 'vehicle', 'automatic'],
      contactMethod: 'phone',
      imageUrl:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop&crop=center', // Car
      views: 289,
      likes: 42,
      comments: 21,
    },
    {
      id: 'product-5',
      type: 'product',
      title: 'Toyota Harrier 2007 Model',
      description: 'Well maintained Toyota Harrier, 2007 model, automatic transmission, new tires.',
      price: 28000000,
      currency: 'UGX',
      category: 'Vehicles',
      postedBy: {
        id: 'user-2',
        name: 'James Mwangi',
        avatarColor: 'from-green-600 to-green-400',
        community: 'business-class',
        memberSince: '2023-02-15',
      },
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Entebbe',
      status: 'negotiating',
      tags: ['toyota', 'harrier', 'car', 'vehicle', 'automatic'],
      contactMethod: 'phone',
      imageUrl:
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop&crop=center', // Car
      views: 289,
      likes: 42,
      comments: 21,
    },
    {
      id: 'service-1',
      type: 'service',
      title: 'Professional Web Development Services',
      description: 'Full-stack web development services. React, Next.js, Node.js, MongoDB.',
      price: 1500000,
      currency: 'UGX',
      category: 'IT & Development',
      postedBy: {
        id: 'user-3',
        name: 'Sarah Nalwoga',
        avatarColor: 'from-purple-600 to-pink-400',
        community: 'working-class',
        memberSince: '2023-03-20',
      },
      postedDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      location: 'Remote',
      status: 'available',
      tags: ['web development', 'react', 'programming', 'freelance'],
      contactMethod: 'email',
      imageUrl:
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center', // Code
      views: 156,
      likes: 28,
      comments: 12,
    },
    {
      id: 'need-1',
      type: 'need',
      title: 'Looking for Office Space in Kampala',
      description:
        'Need 3-room office space in Kampala CBD or nearby areas. Budget: UGX 3-5M per year.',
      price: 4000000,
      currency: 'UGX',
      category: 'Real Estate',
      postedBy: {
        id: 'user-5',
        name: 'Peter Okello',
        avatarColor: 'from-red-600 to-orange-400',
        community: 'business-class',
        memberSince: '2023-05-12',
      },
      postedDate: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      location: 'Kampala',
      status: 'urgent',
      tags: ['office', 'real estate', 'rental', 'commercial'],
      contactMethod: 'phone',
      imageUrl:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&crop=center', // Office
      views: 203,
      likes: 32,
      comments: 19,
    },
    // Add images to the rest of your items...
  ];
};

// Marketplace categories
export const marketplaceCategories: MarketplaceCategory[] = [
  { id: 'all', name: 'All Items', icon: '📦', count: 8, type: 'product' },
  { id: 'products', name: 'Products', icon: '🛒', count: 3, type: 'product' },
  { id: 'services', name: 'Services', icon: '💼', count: 3, type: 'service' },
  { id: 'needs', name: 'Needs', icon: '🔍', count: 2, type: 'need' },
  { id: 'electronics', name: 'Electronics', icon: '💻', count: 2, type: 'product' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗', count: 1, type: 'product' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏢', count: 1, type: 'need' },
  { id: 'it-dev', name: 'IT & Dev', icon: '👨‍💻', count: 1, type: 'service' },
  { id: 'finance', name: 'Finance', icon: '💰', count: 1, type: 'service' },
  { id: 'design', name: 'Design', icon: '🎨', count: 1, type: 'need' },
  { id: 'photography', name: 'Photography', icon: '📸', count: 1, type: 'service' },
];

// Helper function to get type badge color
export const getMarketplaceTypeColor = (type: MarketplaceItem['type']) => {
  switch (type) {
    case 'product':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    case 'service':
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    case 'need':
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

// Helper function to get status color
export const getMarketplaceStatusColor = (status: MarketplaceItem['status']) => {
  switch (status) {
    case 'available':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Available' };
    case 'sold':
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Sold' };
    case 'negotiating':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Negotiating' };
    case 'urgent':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Available' };
  }
};
