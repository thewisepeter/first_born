// src/app/partnership/(dashboard)/components/VideoResourceCard.tsx
'use client';

import {
  Play,
  Headphones,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Heart,
  Users,
} from 'lucide-react';
import { VideoResource } from '../../../../services/resources';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { useState } from 'react';

interface VideoResourceCardProps {
  title: string;
  description?: string;
  videos: VideoResource[];
}

export function VideoResourceCard({ title, description, videos }: VideoResourceCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videosPerPage = 2;
  const totalPages = Math.ceil(videos.length / videosPerPage);

  const getCurrentVideos = () => {
    const startIndex = currentPage * videosPerPage;
    return videos.slice(startIndex, startIndex + videosPerPage);
  };

  const nextPage = () => currentPage < totalPages - 1 && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage((prev) => prev - 1);
  const goToPage = (page: number) => setCurrentPage(page);

  // For duration display:
  const formatDuration = (duration?: string) => {
    if (!duration) return '5 min';
    // Parse duration string from API if needed
    return duration;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getThumbnailUrl = (video: VideoResource) => {
    if (video.embed_id) {
      return `https://img.youtube.com/vi/${video.embed_id}/maxresdefault.jpg`;
    }
    return video.thumbnail_url || '';
  };

  const openVideoModal = (video: VideoResource) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-100">
              <Play className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        {/* Two Videos Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {getCurrentVideos().map((video) => (
            <div
              key={`${video.id}-${currentPage}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Video Thumbnail */}
              <div
                className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden group/thumbnail"
                onClick={() => openVideoModal(video)}
              >
                <img
                  className="w-full h-full object-cover group-hover/thumbnail:scale-105 transition-transform duration-300"
                  src={getThumbnailUrl(video)}
                  alt={video.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-red-100 text-red-800 border-red-200"
                  >
                    {video.category.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatDate(video.publishDate)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>
                <div className="flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                    onClick={() => openVideoModal(video)}
                  >
                    <Play className="h-3 w-3 mr-1" /> Watch
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing {currentPage * videosPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * videosPerPage, videos.length)} of {videos.length}{' '}
                videos
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`w-8 h-8 rounded text-sm ${currentPage === i ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={isDialogOpen} onOpenChange={closeVideoModal}>
        <DialogContent
          className="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 
                       !w-[95vw] !h-[80vh] !max-w-none !bg-black !border-0 !p-0 
                       !grid-rows-none !rounded-none !shadow-none
                       sm:!w-[90vw] sm:!h-[70vh]
                       lg:!w-[1200px] lg:!h-[675px]
                       xl:!w-[1400px] xl:!h-[788px]"
        >
          {selectedVideo && (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeVideoModal}
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Video Player - 16:9 Aspect Ratio */}
              <div className="flex-1 lg:w-3/4 bg-black relative">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {selectedVideo.embed_id ? (
                    <iframe
                      key={selectedVideo.id}
                      src={`https://www.youtube.com/embed/${selectedVideo.embed_id}?autoplay=1&rel=0&modestbranding=1`}
                      title={selectedVideo.title}
                      className="w-full h-full max-w-full max-h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : selectedVideo.source_url ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Button
                        onClick={() => window.open(selectedVideo.source_url, '_blank')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch on YouTube
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Video player unavailable
                    </div>
                  )}
                </div>

                {/* Title Overlay (Desktop only) */}
                <div className="absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-black/70 to-transparent p-6 hidden lg:block">
                  <h2 className="text-xl font-bold text-white mb-1 truncate">
                    {selectedVideo.title}
                  </h2>
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-500/30 text-red-200 backdrop-blur-sm">
                      {selectedVideo.category.replace('-', ' ')}
                    </span>
                    <span>{formatDate(selectedVideo.publishDate)}</span>
                  </div>
                </div>
              </div>

              {/* Info Panel - Desktop */}
              <div className="hidden lg:flex lg:w-1/4 bg-white flex-col">
                <div className="p-6 flex-1 overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About this video</h3>
                  <div className="mb-4">
                    <Badge className="bg-red-100 text-red-800 border-red-200 mb-2">
                      {selectedVideo.category.replace('-', ' ')}
                    </Badge>
                    <p className="text-gray-500 text-sm mb-2">
                      Posted on {formatDate(selectedVideo.publishDate)}
                    </p>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 mb-4">{selectedVideo.description}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Info Panel */}
              <div className="lg:hidden bg-white p-4 border-t border-gray-200 max-h-[40vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedVideo.title}</h3>
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {selectedVideo.category.replace('-', ' ')}
                  </Badge>
                  <span>{formatDate(selectedVideo.publishDate)}</span>
                </div>
                <p className="text-gray-700 text-sm mb-4">{selectedVideo.description}</p>

                {/* Mobile Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>{selectedVideo.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    <span>{selectedVideo.likes.toLocaleString()} likes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{selectedVideo.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDuration(selectedVideo.duration)}</span>
                  </div>
                </div>

                {/* <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
