// src/app/partnership/(dashboard)/components/OpportunityCard.tsx
'use client';

import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Opportunity } from '../data/mockData';
import { Button } from '../../../components/ui/button';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const getDaysLeft = () => {
    const deadline = new Date(opportunity.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
              {opportunity.company}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{opportunity.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{opportunity.location}</span>
              </div>
              <div className="text-sm text-gray-500">Community: {opportunity.community}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
              </div>
              <div
                className={`text-sm font-medium ${daysLeft <= 2 ? 'text-red-600' : 'text-gray-700'}`}
              >
                {daysLeft === 0 ? 'Ends today' : `${daysLeft} days left`}
              </div>
            </div>
          </div>

          {/* Requirements */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-center">
        <a href={opportunity.link} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            className="px-6 py-3 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
