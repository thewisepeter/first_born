'use client';

import { useEffect, useState } from 'react';
import {
  Play,
  Heart,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Swords,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface VideoData {
  id: string;
  title: string;
  description: string;
  embed_id: string;
  source_url: string;
  date: string;
  category: string;
}

export function Videos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videosPerPage = 3;
  const totalPages = Math.ceil(videos.length / videosPerPage);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          'https://prophetnamara.org/api/mediafiles/video/?category=Prophecy'
        );
        if (!response.ok) throw new Error('Failed to fetch videos');

        const data = await response.json();
        console.log(data);
        setVideos(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getCurrentVideos = () => {
    const startIndex = currentPage * videosPerPage;
    return videos.slice(startIndex, startIndex + videosPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const openVideoModal = (video: VideoData) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Videos Grid Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Prophetic Updates</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prophecy and it's fulfilment is a powerful demonstration that God is still involved in
              the affairs of men; that God still speaks and that He is interested in changing the
              experience of our lives. As you watch these videos, may your faith be strengthened and
              your walk with God be empowered, for what He said, He will surely do.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-purple-600">
                    <Swords className="h-6 w-6 mr-3" />
                    Prophecy Equips for Warfare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 ">
                    Prophecy to you as a child of God is ammunition that you need to wage a good
                    warfare and obtain victory.
                  </p>

                  <div className="border-l-4 border-[#B28930] pl-4">
                    <p className="text-[#B28930] font-semibold italic">
                      "This charge I commit to you, son Timothy, according to the prophecies
                      previously made concerning you, that by them you may wage the good warfare"
                    </p>
                    <p className="text-sm text-gray-600 mt-2">— 2 Timothy 1:28</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-[#B28930]">
                    <Users className="h-6 w-6 mr-3" />
                    Builds the Body of Christ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Prophecy energizes and charges up the body of Christ.
                  </p>
                  <div className="border-l-4 border-[#B28930] pl-4">
                    <p className="text-[#B28930] font-semibold italic">
                      "But one who prophesies strengthens others, encourages them, and comforts
                      them."
                    </p>
                    <p className="text-sm text-gray-600 mt-2">— 1 Corinthians 14:3</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Video Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {getCurrentVideos().map((video) => (
              <Card
                key={video.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden bg-white"
              >
                {/* Video Thumbnail */}
                <div
                  className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer group/thumbnail"
                  onClick={() => openVideoModal(video)}
                >
                  {/* Video Thumbnail Image */}
                  <img
                    className="w-full h-full object-cover"
                    src={`https://img.youtube.com/vi/${video.embed_id}/maxresdefault.jpg`}
                    alt={video.title}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                      <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Video Duration Overlay */}
                </div>

                {/* Video Content */}
                <CardContent className="p-6">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {video.category}
                    </span>
                    <span className="text-gray-500 text-xs">{video.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2"></div>
                    <Button
                      size="sm"
                      className="bg-[#B28930] hover:bg-[#9A7328] text-white text-xs"
                      onClick={() => openVideoModal(video)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              {/* Previous Button */}
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

              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(i)}
                    className={
                      currentPage === i
                        ? 'border-purple-600  hover:bg-purple-600 text-white'
                        : 'border-gray-300 text-purple-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50'
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              {/* Next Button */}
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
          )}

          {/* Page Info */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Showing {currentPage * videosPerPage + 1} -{' '}
              {Math.min((currentPage + 1) * videosPerPage, videos.length)} of {videos.length} videos
            </p>
          </div>
        </div>
      </section>

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
                  <iframe
                    key={selectedVideo.id}
                    src={`${selectedVideo.source_url}?autoplay=1&rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    className="w-full h-full max-w-full max-h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Title Overlay (Desktop only) */}
                <div className="absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-black/70 to-transparent p-6 hidden lg:block">
                  <h2 className="text-xl font-bold text-white mb-1 truncate">
                    {selectedVideo.title}
                  </h2>
                  <div className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-500/30 text-purple-200 backdrop-blur-sm">
                      {selectedVideo.category}
                    </span>
                    <span>{selectedVideo.date}</span>
                  </div>
                </div>
              </div>

              {/* Info Panel - Desktop */}
              <div className="hidden lg:flex lg:w-1/4 bg-white flex-col">
                <div className="p-6 flex-1 overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About this video</h3>
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium mb-2">
                      {selectedVideo.category}
                    </span>
                    <p className="text-gray-500 text-sm mb-2">Posted on {selectedVideo.date}</p>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{selectedVideo.description}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Info Panel */}
              <div className="lg:hidden bg-white p-4 border-t border-gray-200 max-h-[40vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedVideo.title}</h3>
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    {selectedVideo.category}
                  </span>
                  <span>{selectedVideo.date}</span>
                </div>
                <p className="text-gray-700 text-sm mb-4">{selectedVideo.description}</p>

                {/* <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
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
    </div>
  );
}
