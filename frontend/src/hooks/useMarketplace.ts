'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as marketplaceService from '../services/marketplace';

export function useMarketplace(initialPageSize: number = 12) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<marketplaceService.MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<marketplaceService.MarketplaceCategory[]>([]);
  const [stats, setStats] = useState<marketplaceService.MarketplaceStats | null>(null);
  const [paginatedData, setPaginatedData] =
    useState<marketplaceService.PaginatedResponse<marketplaceService.MarketplaceListing> | null>(
      null
    );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<{
    type?: string;
    category?: number;
    search?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    urgent?: boolean;
    mine?: boolean;
  }>({});

  const fetchListings = async (page: number = currentPage) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [listingsData, categoriesData, statsData] = await Promise.all([
        marketplaceService.getListings(page, pageSize, filters),
        marketplaceService.getCategories(),
        marketplaceService.getMarketplaceStats(),
      ]);

      setPaginatedData(listingsData);
      setListings(listingsData.results);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchListings(page);
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

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchListings(1);
  };

  const refresh = () => {
    fetchListings(currentPage);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [listingsData, categoriesData, statsData] = await Promise.all([
          marketplaceService.getListings(currentPage, pageSize, filters),
          marketplaceService.getCategories(),
          marketplaceService.getMarketplaceStats(),
        ]);

        if (isMounted) {
          setPaginatedData(listingsData);
          setListings(listingsData.results);
          setCategories(categoriesData);
          setStats(statsData);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching marketplace data:', err);
          setError('Failed to load marketplace');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, currentPage, filters, pageSize]); // Add proper dependencies

  return {
    loading,
    error,
    listings,
    categories,
    stats,
    paginatedData,
    currentPage,
    totalPages: paginatedData ? Math.ceil(paginatedData.count / pageSize) : 0,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    refresh,
  };
}
