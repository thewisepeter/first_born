'use client';

import { useState } from 'react';
import { Play, Heart, Users, MessageSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface VideoData {
  id: string;
  title: string;
  description: string;
  embedId: string;
  date: string;
  category: string;
  duration: string;
  views: string;
}

const videos: VideoData[] = [
  {
    id: '1',
    title: 'Finding Hope in Difficult Times',
    description: 'Pastor John shares powerful insights on maintaining faith during life\'s challenges and discovering God\'s purpose in our struggles.',
    embedId: 'dQw4w9WgXcQ',
    date: 'January 28, 2024',
    category: 'Sunday Sermon',
    duration: '45:23',
    views: '2.3K'
  },
  {
    id: '2',
    title: 'The Power of Community',
    description: 'A heartfelt message about the importance of fellowship and how our church family supports one another through life\'s journey.',
    embedId: 'dQw4w9WgXcQ',
    date: 'January 21, 2024',
    category: 'Special Message',
    duration: '32:15',
    views: '1.8K'
  },
  {
    id: '3',
    title: 'Testimonies of Grace',
    description: 'Members of our congregation share their personal stories of transformation and how God has worked in their lives.',
    embedId: 'dQw4w9WgXcQ',
    date: 'January 14, 2024',
    category: 'Testimonies',
    duration: '28:42',
    views: '3.1K'
  },
  {
    id: '4',
    title: 'Walking in Faith',
    description: 'Discover what it means to truly walk by faith and not by sight in your daily Christian journey.',
    embedId: 'dQw4w9WgXcQ',
    date: 'January 7, 2024',
    category: 'Sunday Sermon',
    duration: '41:18',
    views: '2.7K'
  },
  {
    id: '5',
    title: 'God\'s Love Never Fails',
    description: 'Experience the overwhelming love of God and how it transforms every aspect of our lives and relationships.',
    embedId: 'dQw4w9WgXcQ',
    date: 'December 31, 2023',
    category: 'New Year Message',
    duration: '38:55',
    views: '4.2K'
  },
  {
    id: '6',
    title: 'Purpose in the Storm',
    description: 'Understanding how God uses difficult seasons to shape our character and strengthen our faith.',
    embedId: 'dQw4w9WgXcQ',
    date: 'December 24, 2023',
    category: 'Christmas Message',
    duration: '35:30',
    views: '5.1K'
  }
];

export function Videos() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videosPerPage = 3;
  const totalPages = Math.ceil(videos.length / videosPerPage);
  
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sermons & Messages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch our latest sermons, testimonies, and special messages that will inspire and strengthen your faith journey.
            </p>
          </div>

          {/* Video Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {getCurrentVideos().map((video) => (
              <Card key={video.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden bg-white">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer group/thumbnail" onClick={() => openVideoModal(video)}>
                  {/* Video Thumbnail Image */}
                  <img
                    className="w-full h-full object-cover"
                    src={`https://img.youtube.com/vi/${video.embedId}/maxresdefault.jpg`}
                    alt={video.title}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                      <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Video Duration Overlay */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>

                {/* Video Content */}
                <CardContent className="p-6">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {video.category}
                    </span>
                    <span className="text-gray-500 text-xs">{video.views} views</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {video.description}
                  </p>

                  {/* Date */}
                  <p className="text-gray-400 text-xs mb-4">{video.date}</p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
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
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(i)}
                    className={
                      currentPage === i
                        ? "bg-[#B28930] hover:bg-[#9A7328] text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
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
              Showing {currentPage * videosPerPage + 1} - {Math.min((currentPage + 1) * videosPerPage, videos.length)} of {videos.length} videos
            </p>
          </div>
        </div>
      </section>

      {/* Testimony Importance Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Power of Testimony</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="prose prose-lg text-gray-700">
                  <p>
                    Testimonies are powerful declarations of God's faithfulness and love in our lives. 
                    When we share our stories of transformation, healing, and breakthrough, we not only 
                    glorify God but also encourage others who may be facing similar challenges.
                  </p>
                  
                  <p>
                    Each testimony is a reminder that no situation is too difficult for God, and no 
                    person is beyond His reach. Through sharing our experiences, we become living proof 
                    of God's goodness and create a legacy of faith for future generations.
                  </p>

                  <p>
                    At Grace Church, we believe that every story matters. Whether it's overcoming 
                    addiction, finding purpose after loss, experiencing healing, or discovering God's 
                    love for the first time, your testimony has the power to change lives.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#B28930]">
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    "They triumphed over him by the blood of the Lamb and by the word of their testimony; 
                    they did not love their lives so much as to shrink from death."
                  </blockquote>
                  <cite className="text-[#B28930] font-semibold">— Revelation 12:11</cite>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-purple-600">
                      <Heart className="h-6 w-6 mr-3" />
                      Encourages Others
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Your story of God's faithfulness gives hope to those who are struggling 
                      and shows them that breakthrough is possible.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-[#B28930]">
                      <Users className="h-6 w-6 mr-3" />
                      Builds Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sharing testimonies creates deeper connections within our church family 
                      and helps us support one another better.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-purple-600">
                      <MessageSquare className="h-6 w-6 mr-3" />
                      Glorifies God
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Every testimony points back to God's goodness, love, and power, 
                      bringing glory to His name and advancing His kingdom.
                    </p>
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
                  src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&rel=0&modestbranding=1`}
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedVideo.title}
                    </h2>
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
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedVideo.description}
                </p>
                
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