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
  duration: string;
  views: string;
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
        const response = await fetch('http://127.0.0.1:8000/api/mediafiles/video/');
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
              Watch these awe inspiring and faith building prophetic fulfilments
            </p>
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
                        ? 'bg-[#B28930] hover:bg-[#9A7328] text-white'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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

      {/* Testimony Importance Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Power of Prophecy</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    The Lord Jesus instructed Prophet Namara Ernest the vision bearer of Firstborn
                    Fellowship Ministries to demonstrate The Assembly of the Firstborn (Hebrews
                    12:22-23).
                  </p>

                  <p>
                    His ongoing track record of remarkable prophetic revelations and predictions,
                    all confirmed and fulfilled over time, stands as a testament to the divine
                    position he holds and carries out.
                  </p>

                  <p>
                    Each prophecy fulfilment is a powerful demonstartion that God still directs the
                    affairs of men,that God still speaks and that He is interested in changing the
                    experience of our lives.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#B28930]">
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    "Above all, you must realize that no prophecy in Scripture ever came from the
                    prophet’s own understanding, or from human initiative. No, those prophets were
                    moved by the Holy Spirit, and they spoke from God."
                  </blockquote>
                  <cite className="text-[#B28930] font-semibold">— 2 Peter 1:20 - 21</cite>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-purple-600">
                      <Swords className="h-6 w-6 mr-3" />
                      Equips for Warfare
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
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-[95%] h-[90%] p-0 bg-black border-0">
          <DialogHeader className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeVideoModal}
              className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>

          {selectedVideo && (
            <div className="w-full h-full flex flex-col">
              {/* Video Player */}
              <div className="flex-1 relative">
                <iframe
                  className="w-full h-full"
                  src={selectedVideo.source_url}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info Panel */}
              <div className="bg-white p-6 max-h-48 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                    <div className="flex items-center text-gray-600 text-sm mb-3 flex-wrap gap-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {selectedVideo.category}
                      </span>
                      <span>{selectedVideo.date}</span>
                      <span>{selectedVideo.views} views</span>
                      <span>{selectedVideo.duration}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{selectedVideo.description}</p>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
