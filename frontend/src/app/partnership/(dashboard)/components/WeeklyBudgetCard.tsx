// First, let's create a WeeklyBudgetCard component
'use client';

import { useState, useEffect } from 'react';
import { generateWeeklyBudget, type WeeklyBudget } from '../data/mockData';

interface WeeklyBudgetCardProps {
  onSupportClick?: () => void;
}

export function WeeklyBudgetCard({ onSupportClick }: WeeklyBudgetCardProps) {
  const [budget, setBudget] = useState<WeeklyBudget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadBudget = () => {
      setLoading(true);
      setTimeout(() => {
        const weeklyBudget = generateWeeklyBudget();
        setBudget(weeklyBudget);
        setLoading(false);
      }, 500);
    };

    loadBudget();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Budget</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!budget) return null;

  // Calculate balance
  const balance = budget.targetAmount - budget.currentAmount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (budget.currentAmount / budget.targetAmount) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Weekly Budget
        <span className="ml-2 text-sm font-normal text-gray-500">
          (Week {budget.weekNumber}, {budget.year})
        </span>
      </h2>

      {/* Budget Rows */}
      <div className="space-y-3">
        <BudgetRow label="Target" value={formatCurrency(budget.targetAmount)} />
        <BudgetRow label="Raised" value={formatCurrency(budget.currentAmount)} highlight />
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
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Breakdown Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Breakdown</span>
            <span className="text-xs text-gray-500">Current Week</span>
          </div>

          {budget.breakdown.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-600 truncate pr-2">{item.category}</span>
              <span className="font-medium whitespace-nowrap">{formatCurrency(item.amount)}</span>
            </div>
          ))}

          {budget.breakdown.length > 3 && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              +{budget.breakdown.length - 3} more categories
            </div>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Week {budget.weekNumber}:{' '}
          {new Date(budget.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(budget.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
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
