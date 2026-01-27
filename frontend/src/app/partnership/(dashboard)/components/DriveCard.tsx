// src/app/partnership/(dashboard)/components/DriveCard.tsx
'use client';

import { ArrowRight, Calendar, MapPin, Target } from 'lucide-react';
import { Drive } from '../data/mockData';
import { Button } from '../../../components/ui/button';

interface DriveCardProps {
  drive: Drive;
  onSupport?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export function DriveCard({ drive, onSupport, onDetails }: DriveCardProps) {
  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-US')}`;
  };

  const getDaysLeft = () => {
    const deadline = new Date(drive.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();
  const progressPercentage = (drive.currentAmount / drive.targetAmount) * 100;

  const typeColors = {
    broadcast: 'bg-blue-100 text-blue-700',
    fellowship: 'bg-green-100 text-green-700',
    bible: 'bg-purple-100 text-purple-700',
    outreach: 'bg-orange-100 text-orange-700',
    media: 'bg-pink-100 text-pink-700',
  };

  const statusLabels = {
    active: 'Active',
    completed: 'Completed',
    upcoming: 'Upcoming',
  };

  return (
    <div
      className={`border rounded-xl p-6 hover:shadow-md transition-all duration-300 ${drive.isUrgent ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{drive.title}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${typeColors[drive.type]}`}
              >
                {drive.type.toUpperCase()}
              </span>
              {drive.isUrgent && (
                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                  URGENT
                </span>
              )}
              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                {statusLabels[drive.status]}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{drive.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{drive.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-2" />
                <span>{drive.ministryArea}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
              </div>
              <div
                className={`text-sm font-medium ${daysLeft <= 2 ? 'text-red-600' : 'text-gray-700'}`}
              >
                {daysLeft === 0 ? 'Ends today' : `${daysLeft} days left`}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <div>
                <span>Raised: </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(drive.currentAmount)}
                </span>
              </div>
              <div>
                <span>Goal: </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(drive.targetAmount)}
                </span>
              </div>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${drive.isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-600 to-[#B28930]'}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progressPercentage.toFixed(1)}% funded</span>
              <span>{formatCurrency(drive.targetAmount - drive.currentAmount)} needed</span>
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
