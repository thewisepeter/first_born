'use client';

import { Briefcase, MapPin, Calendar, Building, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Opportunity } from '../../../../services/opportunities';
import { Badge } from '../../../components/ui/badge';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'tender':
        return <Building className="h-4 w-4" />;
      case 'contract':
        return <Clock className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-700';
      case 'tender':
        return 'bg-purple-100 text-purple-700';
      case 'contract':
        return 'bg-green-100 text-green-700';
      case 'volunteer':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCommunityColor = (community: string) => {
    return community === 'working' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`border rounded-xl p-6 hover:shadow-md transition-all duration-300 ${
        opportunity.is_urgent ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getTypeColor(opportunity.opportunity_type)} border-0`}>
                <span className="flex items-center gap-1">
                  {getTypeIcon(opportunity.opportunity_type)}
                  {opportunity.opportunity_type.charAt(0).toUpperCase() +
                    opportunity.opportunity_type.slice(1)}
                </span>
              </Badge>

              <Badge className={`${getCommunityColor(opportunity.community)} border-0`}>
                {opportunity.community === 'working' ? 'Working Class' : 'Business'}
              </Badge>

              {opportunity.is_urgent && (
                <Badge className="bg-red-100 text-red-700 border-0">URGENT</Badge>
              )}

              {opportunity.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-700 border-0">Featured</Badge>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-4">{opportunity.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Building className="h-4 w-4 mr-2" />
                <span className="font-medium">{opportunity.company}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{opportunity.location}</span>
                {opportunity.is_remote && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">Remote</span>
                )}
                {opportunity.is_hybrid && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">Hybrid</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Posted: {formatDate(opportunity.posted_date)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span
                  className={
                    opportunity.days_remaining <= 7 ? 'text-red-600 font-medium' : 'text-gray-500'
                  }
                >
                  Deadline: {formatDate(opportunity.deadline)}
                  {opportunity.days_remaining > 0 && (
                    <span className="ml-1">({opportunity.days_remaining} days left)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {opportunity.requirements.slice(0, 3).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
                {opportunity.requirements.length > 3 && (
                  <li className="text-purple-600">+{opportunity.requirements.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6"
          >
            Apply Now
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
