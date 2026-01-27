// src/app/partnership/(dashboard)/opportunities/page.tsx
'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';
import { OpportunityCard } from '../components/OpportunityCard';
import { generateMockOpportunities, type Opportunity } from '../data/mockData';
import { Button } from '../../../components/ui/button';

export default function OpportunityPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const opportunitiesPerPage = 5;
  const totalPages = Math.ceil(opportunities.length / opportunitiesPerPage);

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        setOpportunities(generateMockOpportunities());
        setLoading(false);
      }, 800);
    };

    loadData();
  }, [user]);

  // Get current page opportunities
  const getCurrentOpportunities = () => {
    const startIndex = currentPage * opportunitiesPerPage;
    return opportunities.slice(startIndex, startIndex + opportunitiesPerPage);
  };

  // Pagination handlers
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

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
              Browse through various job openings, tenders,and contracts
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Active Opportunities</div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{opportunities.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="space-y-6">
        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 gap-6">
          {getCurrentOpportunities().map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-200">
            {/* Page Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing {currentPage * opportunitiesPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * opportunitiesPerPage, opportunities.length)} of{' '}
                {opportunities.length} opportunities
              </p>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(i)}
                    className={
                      currentPage === i
                        ? 'border-purple-600 hover:bg-purple-600 text-white'
                        : 'border-gray-300 text-purple-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50'
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
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
