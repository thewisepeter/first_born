// src/app/partnership/(dashboard)/page.tsx
'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Sparkles, Heart } from 'lucide-react';
import { DashboardSkeleton } from './components/Skeletons';
import { DriveCard } from './components/DriveCard';
import { StatsCard } from './components/StatsCard';
import {
  generateMockStats,
  generateMockDrives,
  generateMockActivities,
  generateMockAnnouncements,
  generateWeeklyBudget,
  type DashboardStats,
  type Drive,
  type Activity,
  type Announcement,
} from './data/mockData';

export default function PartnershipDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [weeklyBudget, setWeeklyBudget] = useState<any>(null);

  // Pagination state for drives
  const [currentDrivePage, setCurrentDrivePage] = useState(0);
  const drivesPerPage = 2;
  const totalDrivePages = Math.ceil(drives.length / drivesPerPage);

  // Mock data for StatsCards
  const statsCarouselData = [
    {
      title: 'Total Given',
      value: 'UGX 4,250,000',
      icon: ArrowRight,
      color: 'purple' as const,
      date: '2024-01-15', // Last update date
      description: 'Cumulative giving since January 2024',
      trend: 12.5,
      trendLabel: 'vs last month',
    },
    {
      title: 'This Week',
      value: 'UGX 1,250,000',
      icon: ArrowRight,
      color: 'blue' as const,
      date: new Date().toISOString().split('T')[0], // Today's date
      description: 'Weekly giving progress',
      trend: 8.2,
      trendLabel: 'vs last week',
    },
    {
      title: 'Pledge Commitment',
      value: 'UGX 1,000,000',
      icon: ArrowRight,
      color: 'green' as const,
      date: '2024-12-31', // Pledge due date
      description: 'Monthly pledge target',
      trend: -3.5,
      trendLabel: 'vs target',
    },
  ];

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        setStats(generateMockStats());
        setDrives(generateMockDrives());
        setActivities(generateMockActivities());
        setAnnouncements(generateMockAnnouncements());
        setWeeklyBudget(generateWeeklyBudget());
        setLoading(false);
      }, 800);
    };

    loadData();
  }, [user]);

  // Pagination handlers for drives
  const nextDrivePage = () => {
    setCurrentDrivePage((prev) => (prev + 1) % totalDrivePages);
  };

  const prevDrivePage = () => {
    setCurrentDrivePage((prev) => (prev - 1 + totalDrivePages) % totalDrivePages);
  };

  const goToDrivePage = (page: number) => {
    setCurrentDrivePage(page);
  };

  // Get current page drives
  const getCurrentDrives = () => {
    const startIndex = currentDrivePage * drivesPerPage;
    return drives.slice(startIndex, startIndex + drivesPerPage);
  };

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              Thank you for being a valued partner with Prophet Ernest Namara.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {/* <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span>Partner since {new Date().getFullYear()}</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Drives Section with Pagination */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Drives</h2>
            <p className="text-gray-600 mt-1">Support ongoing ministry projects and campaigns</p>
          </div>
          <a href="http://localhost:3000/partnership/drives">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </a>
        </div>

        {/* Drives List */}
        <div className="grid grid-cols-1 gap-6">
          {getCurrentDrives().map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>

        {/* Pagination Controls for Drives */}
        {totalDrivePages > 1 && (
          <div className="pt-6 border-t border-gray-200">
            {/* Page Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing {currentDrivePage * drivesPerPage + 1} -{' '}
                {Math.min((currentDrivePage + 1) * drivesPerPage, drives.length)} of {drives.length}{' '}
                drives
              </p>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={prevDrivePage}
                disabled={currentDrivePage === 0}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalDrivePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToDrivePage(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentDrivePage === i
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextDrivePage}
                disabled={currentDrivePage === totalDrivePages - 1}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Spiritual Footer */}
      <footer className="text-center py-12 border-t border-gray-100">
        <blockquote className="text-xl italic text-gray-600 mb-4 max-w-2xl mx-auto font-medium">
          "Now he who supplies seed to the sower and bread for food will also supply and increase
          your store of seed..."
        </blockquote>
        <p className="font-bold text-gray-900">— 2 Corinthians 9:10</p>
      </footer>
    </div>
  );
}
