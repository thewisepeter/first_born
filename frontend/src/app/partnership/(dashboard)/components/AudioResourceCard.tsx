// src/app/partnership/(dashboard)/components/AudioResourceCard.tsx
'use client';

import {
  Headphones,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Heart,
  Users,
  Play,
  Pause,
} from 'lucide-react';
import { AudioResource } from '../../../../services/resources';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { useState, useRef } from 'react';

interface AudioResourceCardProps {
  title: string;
  description?: string;
  audios: AudioResource[];
}

export function AudioResourceCard({ title, description, audios }: AudioResourceCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState<AudioResource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audiosPerPage = 2;
  const totalPages = Math.ceil(audios.length / audiosPerPage);

  const getCurrentAudios = () => {
    const startIndex = currentPage * audiosPerPage;
    return audios.slice(startIndex, startIndex + audiosPerPage);
  };

  const nextPage = () => currentPage < totalPages - 1 && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage((prev) => prev - 1);
  const goToPage = (page: number) => setCurrentPage(page);

  // Format duration from API (might be in seconds or minutes)
  const formatDuration = (duration?: string) => {
    if (!duration) return '5 min';

    // If duration is in seconds, convert to minutes
    if (!isNaN(Number(duration))) {
      const minutes = Math.floor(Number(duration) / 60);
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }

    return duration;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openAudioModal = (audio: AudioResource) => {
    setSelectedAudio(audio);
    setIsDialogOpen(true);
    setIsPlaying(false);
  };

  const closeAudioModal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setSelectedAudio(null);
    setIsDialogOpen(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleListen = (audio: AudioResource) => {
    openAudioModal(audio);
  };

  return (
    <>
      <div className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Headphones className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        {/* Two Audios Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {getCurrentAudios().map((audio) => (
            <div
              key={`${audio.id}-${currentPage}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Audio Visual Representation */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col items-center justify-center aspect-[4/3]">
                <Headphones className="h-16 w-16 text-blue-500 mb-4" />
                <div className="w-full space-y-2">
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-2/3"></div>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-1/2"></div>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(audio.duration)}
                </div>
              </div>

              {/* Audio Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {audio.category?.replace('-', ' ') || 'Audio Message'}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatDate(audio.publishDate)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{audio.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{audio.description}</p>
                <div className="flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => handleListen(audio)}
                  >
                    <Headphones className="h-3 w-3 mr-1" /> Listen
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
                Showing {currentPage * audiosPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * audiosPerPage, audios.length)} of {audios.length}{' '}
                audio messages
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
                      className={`w-8 h-8 rounded text-sm ${currentPage === i ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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

      {/* Audio Modal */}
      <Dialog open={isDialogOpen} onOpenChange={closeAudioModal}>
        <DialogContent
          className="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 
                                 !w-[95vw] !max-w-2xl !h-auto !max-h-[90vh] !rounded-xl 
                                 !border !border-gray-200 !shadow-2xl !p-0 !overflow-hidden"
        >
          {selectedAudio && (
            <div className="flex flex-col">
              {/* Audio Player */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8">
                <div className="flex flex-col items-center text-white">
                  <Headphones className="h-20 w-20 mb-4 opacity-80" />
                  <h2 className="text-xl font-bold mb-2 text-center">{selectedAudio.title}</h2>
                  <p className="text-blue-100 text-sm mb-6">Now Playing</p>

                  {/* Audio Controls */}
                  <div className="w-full max-w-md">
                    {/* Play/Pause Button */}
                    <div className="flex justify-center mb-6">
                      <Button
                        onClick={togglePlay}
                        className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/30"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 text-white" />
                        ) : (
                          <Play className="h-8 w-8 text-white ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div className="bg-white h-2 rounded-full w-1/3"></div>
                    </div>

                    {/* Time Indicators */}
                    <div className="flex justify-between text-xs text-blue-100">
                      <span>0:00</span>
                      <span>{formatDuration(selectedAudio.duration)}</span>
                    </div>

                    {/* Hidden audio element */}
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden">
                      <source src={selectedAudio.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>

              {/* Audio Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {selectedAudio.category?.replace('-', ' ') || 'Audio Message'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedAudio.publishDate)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedAudio.title}</h3>
                <p className="text-gray-600 mb-6">{selectedAudio.description}</p>

                {/* Audio Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Speaker</div>
                      <div className="font-medium">{selectedAudio.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-medium">{formatDuration(selectedAudio.duration)}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Play
                      </>
                    )}
                  </Button>
                  {selectedAudio.driveUrl && (
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => window.open(selectedAudio.driveUrl, '_blank')}
                    >
                      <Headphones className="h-4 w-4 mr-2" /> Open in Drive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
