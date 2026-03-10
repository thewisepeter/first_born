// src/app/partnership/(dashboard)/components/DriveCard.tsx
'use client';

import { ArrowRight, Calendar, MapPin, Target } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Drive } from '../../../../services/drives'; // Import the real Drive interface

interface DriveCardProps {
  drive: Drive;
  onSupport?: (id: number) => void;
  onDetails?: (id: number) => void;
}

export function DriveCard({ drive, onSupport, onDetails }: DriveCardProps) {
  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-US')}`;
  };

  // Calculate current amount from goal and progress
  const goalAmount =
    typeof drive.goal_amount === 'string' ? parseFloat(drive.goal_amount) : drive.goal_amount;

  const currentAmount = goalAmount * (drive.progress_percentage / 100);
  const neededAmount = goalAmount - currentAmount;

  // Map category to display type
  const getDisplayType = (category: string): string => {
    const typeMap: Record<string, string> = {
      spirit_world: 'Broadcast',
      office_rent: 'Outreach',
      bible_distribution: 'Bible',
      youth_camp: 'Fellowship',
      media: 'Media',
    };
    return typeMap[category] || category.replace('_', ' ');
  };

  // Get color scheme based on category or color_scheme field
  const getTypeColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      spirit_world: 'bg-blue-100 text-blue-700',
      office_rent: 'bg-orange-100 text-orange-700',
      bible_distribution: 'bg-purple-100 text-purple-700',
      youth_camp: 'bg-green-100 text-green-700',
      media: 'bg-pink-100 text-pink-700',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  // Determine status
  const getStatus = (): 'active' | 'completed' | 'upcoming' => {
    if (drive.days_remaining <= 0) return 'completed';
    if (!drive.is_published) return 'upcoming';
    return 'active';
  };

  const status = getStatus();
  const displayType = getDisplayType(drive.category);
  const typeColorClass = getTypeColor(drive.category);

  const statusLabels = {
    active: 'Active',
    completed: 'Completed',
    upcoming: 'Upcoming',
  };

  return (
    <div
      className={`border rounded-xl p-6 hover:shadow-md transition-all duration-300 ${
        drive.is_urgent ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{drive.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${typeColorClass}`}>
                {displayType}
              </span>
              {drive.is_urgent && (
                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                  URGENT
                </span>
              )}
              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                {statusLabels[status]}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{drive.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Uganda</span> {/* Default location */}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-2" />
                <span>{displayType}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Deadline: {new Date(drive.end_date).toLocaleDateString()}</span>
              </div>
              <div
                className={`text-sm font-medium ${drive.days_remaining <= 2 ? 'text-red-600' : 'text-gray-700'}`}
              >
                {drive.days_remaining === 0 ? 'Ends today' : `${drive.days_remaining} days left`}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <div>
                <span>Raised: </span>
                <span className="font-semibold text-gray-900">{formatCurrency(currentAmount)}</span>
              </div>
              <div>
                <span>Goal: </span>
                <span className="font-semibold text-gray-900">{formatCurrency(goalAmount)}</span>
              </div>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  drive.is_urgent
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-purple-600 to-[#B28930]'
                }`}
                style={{ width: `${Math.min(drive.progress_percentage, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{drive.progress_percentage.toFixed(1)}% funded</span>
              <span>{formatCurrency(neededAmount)} needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-center">
        <a
          href="https://flutterwave.com/pay/prophetnamaraernesti69d"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
          >
            Give
          </Button>
        </a>
      </div>
    </div>
  );
}
