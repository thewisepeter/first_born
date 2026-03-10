// src/app/partnership/(dashboard)/page.tsx
'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Sparkles, Heart } from 'lucide-react';
import { DashboardSkeleton } from './components/Skeletons';
import { DriveCard } from './components/DriveCard';
import { StatsCard } from './components/StatsCard';

const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

export default function PartnershipDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <DashboardSkeleton />;
  if (!user) return null;
  if (!user.isPartner) return <div>Partner access required</div>;

  // ✅ Get ALL partner data from user.partner_profile
  const profile = user.partner_profile;
  const totalGiven = profile?.total_given || '0';
  const monthsActive = profile?.months_active || 0;
  const community = profile?.community || 'working';
  const partnerType = profile?.partner_type || 'individual';
  const memberSince = profile?.member_since
    ? new Date(profile.member_since).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* Welcome Section - Using REAL data from user.partner_profile */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              Thank you for being a valued partner with Prophet Ernest Namara. Your generosity is
              making a real difference. Because of your faithfulness, lives are being impacted,
              communities are being strengthened, and the mission continues to move forward. Here
              you can track your giving, manage scheduled contributions, and view your statements
              anytime. Thank you for being a vital part of the vision.
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
              {monthsActive > 0 && (
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  <span>Partner since {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
