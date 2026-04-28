// src/app/partnership/(dashboard)/layout.tsx
'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Loader2,
  LogOut,
  Bell,
  Settings,
  User,
  Home,
  Target,
  BookOpen,
  MessageSquare,
  CreditCard,
  CalendarDays,
  Users,
  Building2,
  Briefcase,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { WeeklyBudgetCard } from './components/WeeklyBudgetCard';
import { RecentUpdatesCard } from './components/RecentUpdatesCard';
import { NotificationsDropdown } from './components/NotificationDropdown';

// Community type definitions
type CommunityType = 'working-class' | 'business-class';

// Community information interface
interface CommunityInfo {
  type: CommunityType;
  label: string;
  shortLabel: string;
  badge: string;
  href: string;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
  avatarGradient: string;
  description: string;
}

// Community configuration map
const COMMUNITY_CONFIG: Record<CommunityType, CommunityInfo> = {
  'business-class': {
    type: 'business-class',
    label: 'Business Community',
    shortLabel: 'Business Class',
    badge: 'Business',
    href: '/partnership/business-community',
    icon: <Briefcase className="h-4 w-4" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    avatarGradient: 'bg-gradient-to-r from-blue-600 to-blue-400',
    description: 'Business Partner',
  },
  'working-class': {
    type: 'working-class',
    label: 'Working Class Community',
    shortLabel: 'Working Class',
    badge: 'Working',
    href: '/partnership/working-community',
    icon: <Building2 className="h-4 w-4" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    avatarGradient: 'bg-gradient-to-r from-green-600 to-green-400',
    description: 'Working Class Partner',
  },
};

/* =========================
   LAYOUT COMPONENT
========================= */

export default function PartnerLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  // Memoized community info to prevent recalculation on every render
  const communityInfo = useMemo(() => {
    // Default to working class if not specified
    const communityType: CommunityType = (user?.communityType as CommunityType) || 'working-class';
    return COMMUNITY_CONFIG[communityType];
  }, [user?.communityType]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/partnership/landing');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* =========================
          TOP NAVIGATION 
          Fixed at top-0. Height is 64px (h-16).
      ========================= */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button - only visible on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/partnership" className="text-xl font-bold text-purple-600">
              Partner Dashboard
            </Link>

            {/* Show community badge in header using consolidated community info */}
            <span
              className={`hidden sm:inline-block px-2 py-1 text-xs rounded-full ${communityInfo.bgColor} ${communityInfo.textColor}`}
            >
              {communityInfo.description}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown />

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-xs text-gray-500 truncate max-w-[160px] hover:text-red-600"
                >
                  Log Out
                </button>
              </div>

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${communityInfo.avatarGradient}`}
              >
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Dashboard Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar panel */}
          <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white shadow-xl z-40 md:hidden overflow-y-auto">
            <div className="p-6">
              {/* Mobile user info */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${communityInfo.avatarGradient}`}
                  >
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </button>
              </div>

              {/* Dashboard Navigation Menu - Same as left column */}
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Dashboard Menu
              </h2>
              <nav className="space-y-1">
                <MobileMenuLink href="/partnership" icon={<Home className="h-4 w-4" />}>
                  Dashboard
                </MobileMenuLink>
                <MobileMenuLink
                  href="/partnership/giving"
                  icon={<CreditCard className="h-4 w-4" />}
                >
                  Giving
                </MobileMenuLink>
                <MobileMenuLink
                  href="/partnership/drives"
                  icon={<CalendarDays className="h-4 w-4" />}
                >
                  Drives
                </MobileMenuLink>
                <MobileMenuLink
                  href="/partnership/opportunities"
                  icon={<Target className="h-4 w-4" />}
                >
                  Opportunities
                </MobileMenuLink>
                <MobileMenuLink
                  href="/partnership/marketplace"
                  icon={<Store className="h-4 w-4" />}
                >
                  Market Place
                </MobileMenuLink>
                <MobileMenuLink
                  href="/partnership/resources"
                  icon={<BookOpen className="h-4 w-4" />}
                >
                  Resources
                </MobileMenuLink>
                <MobileMenuLink href="/partnership/profile" icon={<User className="h-4 w-4" />}>
                  Profile
                </MobileMenuLink>
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* =========================
          MAIN PAGE CONTENT
      ========================= */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-12 gap-6 items-start pt-6 pb-12">
            {/* LEFT SIDEBAR - Hidden on mobile, visible on tablet+ */}
            <aside className="hidden md:block md:col-span-3 sticky top-[88px]">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Menu</h2>
                <nav className="space-y-2">
                  <MenuLink href="/partnership" icon={<Home className="h-4 w-4" />}>
                    Dashboard
                  </MenuLink>
                  <MenuLink href="/partnership/giving" icon={<CreditCard className="h-4 w-4" />}>
                    Giving
                  </MenuLink>
                  <MenuLink href="/partnership/drives" icon={<CalendarDays className="h-4 w-4" />}>
                    Drives
                  </MenuLink>
                  <MenuLink href="/partnership/opportunities" icon={<Target className="h-4 w-4" />}>
                    Opportunities
                  </MenuLink>
                  <MenuLink href="/partnership/marketplace" icon={<Store className="h-4 w-4" />}>
                    Market Place
                  </MenuLink>
                  <MenuLink href="/partnership/resources" icon={<BookOpen className="h-4 w-4" />}>
                    Resources
                  </MenuLink>
                  <MenuLink href="/partnership/profile" icon={<User className="h-4 w-4" />}>
                    Profile
                  </MenuLink>
                </nav>
              </div>
            </aside>

            {/* CENTRE COLUMN - Full width on mobile */}
            <main className="col-span-12 md:col-span-9 lg:col-span-6">
              {/* Mobile Budget Card - Only visible on mobile, placed above the main content */}
              <div className="mb-4 md:hidden">
                <WeeklyBudgetCard onSupportClick={() => {}} />
              </div>

              {/* Main content */}
              <div className="bg-white rounded-xl shadow-sm p-6">{children}</div>
            </main>

            {/* RIGHT SIDEBAR - Hidden on mobile/tablet, visible on desktop+ */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-[88px]">
              <div className="space-y-6">
                <WeeklyBudgetCard onSupportClick={() => {}} />
                {/* <RecentUpdatesCard maxItems={2} /> */}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2026 Partner Dashboard. All rights reserved.</p>
          <p className="text-sm mt-2">{communityInfo.description}</p>
        </div>
      </footer>
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
    >
      {icon && <span className="mr-3 text-gray-500">{icon}</span>}
      <span className="flex-1">{children}</span>
    </Link>
  );
}

// Mobile-specific menu link with larger touch target
function MobileMenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition active:bg-purple-100"
    >
      {icon && <span className="mr-3 text-gray-500">{icon}</span>}
      <span className="flex-1 font-medium">{children}</span>
    </Link>
  );
}
