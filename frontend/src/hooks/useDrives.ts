'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as drivesService from '../services/drives';

export function useDrives(initialPageSize: number = 10) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drives, setDrives] = useState<drivesService.Drive[]>([]);
  const [paginatedData, setPaginatedData] =
    useState<drivesService.PaginatedResponse<drivesService.Drive> | null>(null);
  const [stats, setStats] = useState<drivesService.DriveStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  const fetchDrives = async (page: number = currentPage) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching drives page:', page);
      const data = await drivesService.getDrives(page, pageSize, true);
      console.log('✅ Drives loaded:', data);

      setPaginatedData(data);
      setDrives(data.results);

      // Calculate stats from all drives (you might want to fetch all pages for accurate stats)
      const allDrives = await drivesService.getAllDrives(true);
      const calculatedStats = drivesService.calculateDriveStats(allDrives);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching drives:', err);
      setError('Failed to load drives');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchDrives(page);
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
    fetchDrives(currentPage);
  };

  useEffect(() => {
    fetchDrives();
  }, [isAuthenticated]);

  return {
    loading,
    error,
    drives,
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
