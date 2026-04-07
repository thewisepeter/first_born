'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface Budget {
  id: number;
  budget_id: string;
  title: string;
  start_date: string;
  end_date: string;
  target_amount: string;
  current_amount: string;
  balance: string;
  progress_percentage: string;
  status: string;
  is_published: boolean;
  is_current_week: boolean;
  days_remaining: number;
  breakdown_summary: any[];
  created_at: string;
  updated_at: string;
}

interface WeeklyBudgetCardProps {
  onSupportClick?: () => void;
}

export function WeeklyBudgetCard({ onSupportClick }: WeeklyBudgetCardProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch budgets with pagination and filter for current week
        const response = await fetch(
          '/api/weekly-budget/budgets/?is_published=true&page=1&page_size=10',
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch budget');
        }

        const data = await response.json();

        // Find the current week's budget (is_current_week = true)
        const currentBudget = data.results?.find((b: Budget) => b.is_current_week === true);

        if (currentBudget) {
          setBudget(currentBudget);
        } else if (data.results?.length > 0) {
          // If no current week, show the most recent active budget
          const mostRecent = data.results[0];
          setBudget(mostRecent);
        } else {
          setBudget(null);
        }
      } catch (err) {
        console.error('Error fetching budget:', err);
        setError('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Budget</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Budget</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Budget</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No active budget for this week</p>
        </div>
      </div>
    );
  }

  // Parse amounts from string to number
  const targetAmount = parseFloat(budget.target_amount);
  const currentAmount = parseFloat(budget.current_amount);
  const balance = parseFloat(budget.balance);
  const progressPercentage = parseFloat(budget.progress_percentage);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Weekly Budget
        <p className="ml-2 text-sm font-normal text-gray-500">
          ({formatDate(budget.start_date)} - {formatDate(budget.end_date)})
        </p>
      </h2>

      {/* Budget Rows */}
      <div className="space-y-3">
        <BudgetRow label="Target" value={formatCurrency(targetAmount)} />
        <BudgetRow label="Raised" value={formatCurrency(currentAmount)} highlight />
        <BudgetRow label="Balance" value={formatCurrency(balance)} warning={balance > 0} />
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-[#B28930] transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {/* Breakdown Stats */}
        {budget.breakdown_summary && budget.breakdown_summary.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Breakdown</span>
              <span className="text-xs text-gray-500">Current Week</span>
            </div>

            {budget.breakdown_summary.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-1">
                <span className="text-gray-600 truncate pr-2">{item.category_name}</span>
                <span className="font-medium whitespace-nowrap">
                  {formatCurrency(parseFloat(item.allocated_amount || 0))}
                </span>
              </div>
            ))}

            {budget.breakdown_summary.length > 3 && (
              <div className="text-xs text-gray-500 mt-2 text-center">
                +{budget.breakdown_summary.length - 3} more categories
              </div>
            )}
          </div>
        )}
      </div>

      {/* Days Remaining */}
      {budget.days_remaining > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {budget.days_remaining} day{budget.days_remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {/* Support Button (Optional) */}
      {onSupportClick && (
        <div className="mt-6">
          <a
            href="https://flutterwave.com/pay/prophetnamaraernesti69d"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
            >
              Give
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

interface BudgetRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
}

function BudgetRow({ label, value, highlight, warning }: BudgetRowProps) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? 'text-green-600' : warning ? 'text-orange-600' : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
