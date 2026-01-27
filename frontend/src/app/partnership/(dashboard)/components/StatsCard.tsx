// src/app/partnership/(dashboard)/components/StatsCard.tsx
'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowRight, Calendar } from 'lucide-react';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'blue' | 'orange' | 'red';
  trend?: number;
  trendLabel?: string;
  date?: string; // Add date prop
  onClick?: () => void;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend,
  trendLabel,
  date, // Add date to destructuring
  onClick,
  className = '',
}: StatsCardProps) {
  const colorConfig = {
    purple: {
      border: 'border-purple-100',
      iconBg: 'bg-purple-50 text-purple-600',
      btn: 'text-purple-600 hover:text-purple-700',
      dateBg: 'bg-purple-50',
      dateText: 'text-purple-700',
    },
    green: {
      border: 'border-green-100',
      iconBg: 'bg-green-50 text-green-600',
      btn: 'text-green-600 hover:text-green-700',
      dateBg: 'bg-green-50',
      dateText: 'text-green-700',
    },
    blue: {
      border: 'border-blue-100',
      iconBg: 'bg-blue-50 text-blue-600',
      btn: 'text-blue-600 hover:text-blue-700',
      dateBg: 'bg-blue-50',
      dateText: 'text-blue-700',
    },
    orange: {
      border: 'border-orange-100',
      iconBg: 'bg-orange-50 text-orange-600',
      btn: 'text-orange-600 hover:text-orange-700',
      dateBg: 'bg-orange-50',
      dateText: 'text-orange-700',
    },
    red: {
      border: 'border-red-100',
      iconBg: 'bg-red-50 text-red-600',
      btn: 'text-red-600 hover:text-red-700',
      dateBg: 'bg-red-50',
      dateText: 'text-red-700',
    },
  };

  const colors = colorConfig[color];

  // Format date if provided
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If within 7 days, show relative time
      if (diffDays <= 7) {
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
      }

      // Otherwise show formatted date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-300
        ${colors.border}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400 truncate mb-1">
              {title}
            </p>
            <h3
              className="text-[12px] md:text-[10px] font-black text-gray-900 truncate leading-tight"
              title={String(value)}
            >
              {value}
            </h3>
          </div>

          {/* Icon with date indicator */}
          <div className="flex flex-col items-end space-y-2">
            <div className={`p-2 rounded-lg ${colors.iconBg}`}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Date display */}
            {date && (
              <div
                className={`px-2 py-1 rounded-full text-[8px] font-bold ${colors.dateBg} ${colors.dateText} flex items-center`}
              >
                <Calendar className="h-2 w-2 mr-1" />
                {formatDate(date)}
              </div>
            )}
          </div>
        </div>

        {/* Middle Row: Trend or Description */}
        <div className="flex-1 min-w-0">
          {trend !== undefined ? (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ring-inset ${
                  trend > 0
                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                    : trend < 0
                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                      : 'bg-gray-50 text-gray-600 ring-gray-600/20'
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <Minus className="h-3 w-3 mr-1" />
                )}
                {Math.abs(trend)}%
              </div>
              {trendLabel && (
                <span className="text-[11px] text-gray-400 font-medium truncate italic">
                  {trendLabel}
                </span>
              )}
            </div>
          ) : (
            description && (
              <p className="text-xs text-gray-500 line-clamp-2 italic">{description}</p>
            )
          )}
        </div>

        {/* Footer: View Details (Only if clickable) */}
        {onClick && (
          <div
            className={`pt-3 border-t border-gray-50 flex items-center text-xs font-bold ${colors.btn}`}
          >
            View details
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  );
}
