// src/app/partnership/(dashboard)/opportunities/page.tsx

'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Clock, Calendar, AlertCircle } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';
import { OpportunityCard } from '../components/OpportunityCard';
import { StatsCard } from '../components/StatsCard';
import { useOpportunities } from '../../../../hooks/useOpportunities';
import { Button } from '../../../components/ui/button';

export default function OpportunityPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    opportunities,
    paginatedData,
    stats,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  } = useOpportunities(5);

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Unable to Load Opportunities</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button
              onClick={refresh}
              variant="outline"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl md:text-xl font-bold text-gray-900">Partner Opportunities</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Browse through various job openings, tenders, and contracts
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Active Opportunities</div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats?.active_opportunities || opportunities.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Opportunities"
            value={stats.total_opportunities.toString()}
            description="All time opportunities"
            icon={Briefcase}
            color="blue"
          />
          <StatsCard
            title="Working Class"
            value={stats.working_community.toString()}
            description="For working community"
            icon={Clock}
            color="green"
          />
          <StatsCard
            title="Business Class"
            value={stats.business_community.toString()}
            description="For business community"
            icon={Calendar}
            color="purple"
          />
        </div>
      )}

      {/* Type Stats (Optional row) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-600 font-medium">Jobs</div>
            <div className="text-xl font-bold text-blue-700">{stats.by_type.job}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xs text-purple-600 font-medium">Tenders</div>
            <div className="text-xl font-bold text-purple-700">{stats.by_type.tender}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs text-green-600 font-medium">Contracts</div>
            <div className="text-xl font-bold text-green-700">{stats.by_type.contract}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-xs text-orange-600 font-medium">Volunteer</div>
            <div className="text-xl font-bold text-orange-700">{stats.by_type.volunteer}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="space-y-6">
        {/* Opportunities Grid */}
        {opportunities && opportunities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-gray-200">
                {/* Page Info */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * (paginatedData?.results.length || 0) + 1} -{' '}
                    {Math.min(
                      currentPage * (paginatedData?.results.length || 0),
                      paginatedData?.count || 0
                    )}{' '}
                    of {paginatedData?.count} opportunities
                  </p>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center justify-between">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={!paginatedData?.previous}
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={
                          currentPage === page
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'border-gray-300 text-purple-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50'
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!paginatedData?.next}
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Opportunities</h3>
            <p className="text-gray-500 mt-1">There are no active opportunities at the moment</p>
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
