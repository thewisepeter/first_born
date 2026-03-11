// src/app/partnership/(dashboard)/drives/page.tsx

'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { DashboardSkeleton } from './../components/Skeletons';
import { DriveCard } from './../components/DriveCard';
import { StatsCard } from './../components/StatsCard';
import { useDrives } from '../../../../hooks/useDrives';
import { Button } from '../../../components/ui/button';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DrivesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    drives,
    paginatedData,
    stats,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  } = useDrives();

  // Remove the old getCurrentDrives function - it's not needed anymore
  // The drives are already the current page from the hook

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Unable to Load Drives</h3>
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
              <h1 className="text-xl md:text-xl font-bold text-gray-900">Drives</h1>
            </div>
            <p className="text-gray-600 mt-1">Support ongoing ministry projects and campaigns</p>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Active Drives</div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats?.active_drives || drives.length}
              </div>
              {stats && (
                <div className="text-xs text-gray-500">
                  Total Goal: {formatCurrency(stats.total_goal)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Drives"
            value={stats.total_drives.toString()}
            description="All time drives"
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="Total Goal"
            value={formatCurrency(stats.total_goal)}
            description="Combined target amount"
            icon={ArrowRight}
            color="purple"
          />
          <StatsCard
            title="Total Raised"
            value={formatCurrency(stats.total_raised)}
            description={`${stats.total_drives > 0 ? Math.round((stats.total_raised / stats.total_goal) * 100) : 0}% of goal`}
            icon={ArrowRight}
            color="green"
          />
        </div>
      )}

      {/* Drives Section with Pagination */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Drives</h2>
            <p className="text-gray-600 mt-1">Support ongoing ministry projects and campaigns</p>
          </div>
        </div>

        {/* Drives List */}
        {drives.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6">
              {drives.map((drive) => (
                <DriveCard key={drive.id} drive={drive} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * (paginatedData?.results.length || 0) + 1} -{' '}
                    {Math.min(
                      currentPage * (paginatedData?.results.length || 0),
                      paginatedData?.count || 0
                    )}{' '}
                    of {paginatedData?.count} drives
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={prevPage}
                    disabled={!paginatedData?.previous}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={!paginatedData?.next}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Drives</h3>
            <p className="text-gray-500 mt-1">There are no active drives at the moment</p>
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
