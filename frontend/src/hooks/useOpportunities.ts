// src/hooks/useOpportunities.ts

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as opportunitiesService from '../services/opportunities';

export function useOpportunities(initialPageSize: number = 10) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<opportunitiesService.Opportunity[]>([]);
  const [paginatedData, setPaginatedData] =
    useState<opportunitiesService.PaginatedResponse<opportunitiesService.Opportunity> | null>(null);
  const [stats, setStats] = useState<opportunitiesService.OpportunityStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  const fetchOpportunities = async (page: number = currentPage) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching opportunities page:', page);
      const data = await opportunitiesService.getOpportunities(page, pageSize, true);
      console.log('✅ Opportunities loaded:', data);

      setPaginatedData(data);
      setOpportunities(data.results || []); // Always ensure it's an array

      // Calculate stats from all opportunities
      const allOpportunities = await opportunitiesService.getAllOpportunities(true);
      const calculatedStats = opportunitiesService.calculateOpportunityStats(allOpportunities);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchOpportunities(page);
  };

  const nextPage = () => {
    if (paginatedData?.next) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (paginatedData?.previous) {
      goToPage(currentPage - 1);
    }
  };

  const refresh = () => {
    fetchOpportunities(currentPage);
  };

  useEffect(() => {
    fetchOpportunities();
  }, [isAuthenticated]);

  return {
    loading,
    error,
    opportunities,
    paginatedData,
    stats,
    currentPage,
    totalPages: paginatedData ? Math.ceil(paginatedData.count / pageSize) : 0,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
}
