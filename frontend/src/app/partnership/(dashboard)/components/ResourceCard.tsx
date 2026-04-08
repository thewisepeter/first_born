// src/app/partnership/(dashboard)/components/ResourceCard.tsx
'use client';

import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useState } from 'react';
import { VideoResource } from '../../../../services/resources';

interface ResourceCardProps {
  title: string;
  description?: string;
  videos: VideoResource[];
}

export function ResourceCard({ title, description, videos }: ResourceCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 2;
  const totalPages = Math.ceil(videos.length / videosPerPage);

  const getCurrentVideos = () => {
    const startIndex = currentPage * videosPerPage;
    const currentVideos = videos.slice(startIndex, startIndex + videosPerPage);

    if (currentVideos.length < 2) {
      return [...currentVideos];
    }

    return currentVideos;
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // FIXED: Handle both string and number types for duration
  const formatDuration = (minutes: string | number) => {
    // Convert to number if it's a string
    const mins = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;

    // Handle invalid numbers
    if (isNaN(mins)) return '0 min';

    if (mins < 60) {
      return `${mins} min`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`.trim();
    }
  };

  const getThumbnailUrl = (video: VideoResource) => {
    if (video.embed_id) {
      return `https://img.youtube.com/vi/${video.embed_id}/maxresdefault.jpg`;
    }
    return '';
  };

  const handlePlay = (video: VideoResource) => {
    if (video.source_url) {
      window.open(video.source_url, '_blank');
    }
  };

  const currentVideos = getCurrentVideos();

  return (
    <div className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {currentVideos.map((video, index) => (
          <div
            key={`${video.id}-${currentPage}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
          >
            <div
              className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => handlePlay(video)}
            >
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                src={getThumbnailUrl(video)}
                alt={video.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)} {/* Now works with string or number */}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-100 text-purple-800 border-purple-200"
                >
                  {video.category.replace('-', ' ')}
                </Badge>
                <span className="text-xs text-gray-500">{formatDate(video.publishDate)}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                {video.title}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">By {video.author}</span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828] text-white text-xs"
                  onClick={() => handlePlay(video)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Watch
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {currentPage * videosPerPage + 1} -{' '}
              {Math.min((currentPage + 1) * videosPerPage, videos.length)} of {videos.length} videos
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                      currentPage === i
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
