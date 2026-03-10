// src/hooks/useGiving.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as givingService from '../services/giving';

export function useGiving() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<givingService.GivingStats | null>(null);
  const [history, setHistory] = useState<givingService.Giving[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [scheduledGivings, setScheduledGivings] = useState<givingService.ScheduledGiving[]>([]);
  const [statements, setStatements] = useState<givingService.GivingStatement[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<
    Array<{ month: string; total: number; month_number: number }>
  >([]);

  const fetchStatements = async () => {
    try {
      const data = await givingService.getGivingStatements();
      setStatements(data);
    } catch (err) {
      console.error('Failed to fetch statements:', err);
    }
  };

  const fetchAllGivingData = async () => {
    if (!isAuthenticated || !user?.isPartner) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Fetch both scheduled AND history in parallel
      const [scheduledResult, historyResult, statementsResult] = await Promise.all([
        givingService
          .getScheduledGivings()
          .then((data) => {
            setScheduledGivings(data);
            return data;
          })
          .catch((error) => {
            console.error('Failed to fetch scheduled:', error);
            return [];
          }),

        givingService
          .getGivingHistory(1, 10)
          .then((data) => {
            if (data.results && data.results.length > 0) {
              setHistory(data.results);
              setHistoryCount(data.count);
            } else {
              console.log('⚠️ No history data received');
              setHistory([]);
              setHistoryCount(0);
            }
            return data;
          })
          .catch((error) => {
            console.error('Failed to fetch history:', error);
            return { results: [], count: 0 };
          }),

        givingService
          .getGivingStatements()
          .then((data) => {
            console.log('✅ Statements loaded:', data);
            setStatements(data);
            return data;
          })
          .catch((error) => {
            console.error('Failed to fetch statements:', error);
            return [];
          }),
      ]);

      // Set default stats with the scheduled data
      setStats({
        total_given: 0,
        monthly_goal: 0,
        goal_progress: 0,
        upcoming_payments: scheduledResult.length,
        this_month_giving: calculateThisMonthGiving(historyResult.results || []),
        last_month_giving: 0,
        month_over_month_change: 0,
        by_type: {},
        recent_transactions: historyResult.results?.slice(0, 5) || [],
        active_schedules: scheduledResult,
      });

      // Set empty for other data
      // setHistory([]);
      setStatements([]);
      setMonthlySummary([]);
    } catch (err) {
      console.error('Error fetching giving data:', err);
      setError('Failed to load giving data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate this month's giving
  const calculateThisMonthGiving = (history: givingService.Giving[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return history
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  };

  // Schedule management functions
  const createSchedule = async (data: {
    amount: number;
    giving_type: string;
    title: string;
    frequency: string;
    start_date: string;
    end_date?: string | null;
    drive?: number | null;
  }) => {
    try {
      console.log('📝 Creating schedule with data:', data);
      const newSchedule = await givingService.createScheduledGiving(data);
      console.log('✅ Schedule created successfully:', newSchedule);

      console.log('🔍 Current scheduledGivings before update:', scheduledGivings);

      // Check current state before update
      setScheduledGivings((prev) => {
        console.log('📋 Current scheduledGivings before update:', prev);
        const updated = [...prev, newSchedule];
        console.log('📋 Updated scheduledGivings:', updated);
        console.log('📋 Updated length:', updated.length);
        return updated;
      });

      // Also update stats manually
      setStats((prev) => {
        console.log('📊 Current stats before update:', prev);
        const updated = prev
          ? {
              ...prev,
              upcoming_payments: (prev.upcoming_payments || 0) + 1,
              active_schedules: [...(prev.active_schedules || []), newSchedule],
            }
          : null;
        console.log('📊 Updated stats:', updated);
        return updated;
      });

      return { success: true, data: newSchedule };
    } catch (err) {
      console.error('❌ Create schedule error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create schedule',
      };
    }
  };

  const updateSchedule = async (id: number, data: Partial<givingService.ScheduledGiving>) => {
    try {
      const updated = await givingService.updateScheduledGiving(id, data);
      setScheduledGivings((prev) => prev.map((s) => (s.id === id ? updated : s)));

      // 🔴 UPDATE STATS MANUALLY
      setStats((prev) =>
        prev
          ? {
              ...prev,
              active_schedules: prev.active_schedules.map((s) => (s.id === id ? updated : s)),
            }
          : null
      );

      return { success: true, data: updated };
    } catch (err) {
      console.error('Update schedule error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update schedule',
      };
    }
  };

  const pauseSchedule = async (id: number) => {
    try {
      const result = await givingService.pauseScheduledGiving(id);
      setScheduledGivings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'paused' } : s))
      );

      // 🔴 UPDATE STATS MANUALLY
      setStats((prev) =>
        prev
          ? {
              ...prev,
              active_schedules: prev.active_schedules.map((s) =>
                s.id === id ? { ...s, status: 'paused' } : s
              ),
            }
          : null
      );

      return { success: true, message: result.message };
    } catch (err) {
      console.error('Pause schedule error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to pause schedule',
      };
    }
  };

  const resumeSchedule = async (id: number) => {
    try {
      const result = await givingService.resumeScheduledGiving(id);
      setScheduledGivings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'active' } : s))
      );

      // 🔴 UPDATE STATS MANUALLY
      setStats((prev) =>
        prev
          ? {
              ...prev,
              active_schedules: prev.active_schedules.map((s) =>
                s.id === id ? { ...s, status: 'active' } : s
              ),
            }
          : null
      );

      return { success: true, message: result.message };
    } catch (err) {
      console.error('Resume schedule error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to resume schedule',
      };
    }
  };

  const cancelSchedule = async (id: number) => {
    try {
      const result = await givingService.cancelScheduledGiving(id);
      setScheduledGivings((prev) => prev.filter((s) => s.id !== id));

      // 🔴 UPDATE STATS MANUALLY
      setStats((prev) =>
        prev
          ? {
              ...prev,
              upcoming_payments: Math.max(0, prev.upcoming_payments - 1),
              active_schedules: prev.active_schedules.filter((s) => s.id !== id),
            }
          : null
      );

      return { success: true, message: result.message };
    } catch (err) {
      console.error('Cancel schedule error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to cancel schedule',
      };
    }
  };

  const createDirectGiving = async (data: {
    amount: number;
    giving_type: string;
    date: string;
    payment_method: string;
  }) => {
    try {
      const newGiving = await givingService.createDirectGiving(data);

      // Update history with the new giving
      setHistory((prev) => {
        if (!prev) return [newGiving];
        return [newGiving, ...prev];
      });
      setHistoryCount((prev) => prev + 1);

      // Update stats
      setStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          total_given: (prev.total_given || 0) + newGiving.amount,
          this_month_giving: (prev.this_month_giving || 0) + newGiving.amount,
          recent_transactions: [newGiving, ...(prev.recent_transactions || [])].slice(0, 5),
        };
      });

      return { success: true, data: newGiving };
    } catch (err) {
      console.error('Create direct giving error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create giving record',
      };
    }
  };

  const payNow = async (id: number) => {
    try {
      // Find the scheduled payment
      const schedule = scheduledGivings.find((s) => s.id === id);
      if (!schedule) {
        throw new Error('Scheduled payment not found');
      }

      // First, create the giving record
      const newGiving = await givingService.createDirectGiving({
        amount: typeof schedule.amount === 'string' ? parseFloat(schedule.amount) : schedule.amount,
        giving_type: schedule.giving_type,
        date: new Date().toISOString().split('T')[0],
        payment_method: 'mobile-money',
      });

      // Then, cancel the scheduled giving
      await givingService.cancelScheduledGiving(id);

      // Update UI state with null/undefined checks
      setScheduledGivings((prev) => {
        if (!prev) return []; // ✅ Handle null/undefined
        return prev.filter((s) => s.id !== id);
      });

      setHistory((prev) => {
        if (!prev) return [newGiving]; // ✅ Handle null/undefined
        return [newGiving, ...prev];
      });

      // Update stats with null/undefined checks
      setStats((prev) => {
        if (!prev) return null; // ✅ Handle null/undefined
        return {
          ...prev,
          upcoming_payments: Math.max(0, prev.upcoming_payments - 1),
          active_schedules: prev.active_schedules?.filter((s) => s.id !== id) || [],
          total_given: (prev.total_given || 0) + newGiving.amount,
          this_month_giving: (prev.this_month_giving || 0) + newGiving.amount,
          recent_transactions: [newGiving, ...(prev.recent_transactions || [])].slice(0, 5),
        };
      });

      return { success: true, message: 'Payment processed successfully', data: newGiving };
    } catch (err) {
      console.error('Pay now error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to process payment',
      };
    }
  };

  // Download statement handler
  const downloadStatement = async (id: number) => {
    try {
      await givingService.downloadStatement(id);

      // Optionally update download count in UI
      setStatements((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                downloaded_count: (s.downloaded_count || 0) + 1,
                last_downloaded_at: new Date().toISOString(),
              }
            : s
        )
      );

      return { success: true, message: 'Statement downloaded successfully' };
    } catch (err) {
      console.error('Download statement error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to download statement',
      };
    }
  };

  // Generate custom statement
  const generateCustomStatement = async (startDate: Date, endDate: Date) => {
    try {
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const result = await givingService.generateCustomStatement(
        formatDate(startDate),
        formatDate(endDate)
      );

      if (result.file_url) {
        window.open(result.file_url, '_blank');
      }

      // Refresh statements list to include the new one
      await fetchStatements();

      return { success: true, message: result.message };
    } catch (err) {
      console.error('Generate statement error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to generate statement',
      };
    }
  };

  // Pagination for history
  const fetchHistoryPage = async (page: number) => {
    try {
      const data = await givingService.getGivingHistory(page, 10);
      setHistory(data.results);
      setHistoryCount(data.count);
      return { success: true, data };
    } catch (err) {
      console.error('Fetch history page error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch history',
      };
    }
  };

  // Refresh all data
  const refresh = () => {
    fetchAllGivingData();
  };

  useEffect(() => {
    fetchAllGivingData();
  }, [isAuthenticated, user?.isPartner]);

  return {
    loading,
    error,
    stats,
    history,
    historyCount,
    scheduledGivings,
    statements,
    monthlySummary,
    createSchedule,
    createDirectGiving,
    updateSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    payNow,
    downloadStatement,
    generateCustomStatement,
    fetchStatements,
    fetchHistoryPage,
    refresh,
  };
}
