'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, Clock, User, Music } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import Link from 'next/link';

interface AudioItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  active: boolean;
  description: string;
  category: string;
  driveUrl: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AudioItem[];
}

export default function Audio() {
  const [audioRecordings, setAudioRecordings] = useState<AudioItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchAudios() {
      try {
        setLoading(true);
        const response = await fetch('https://prophetnamara.org/api/mediafiles/audio/');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // Extract the results array from the API response
        const audioArray = data.results || [];

        setAudioRecordings(audioArray);
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch audio recordings');
        setAudioRecordings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAudios();
  }, []);

  // Find featured audio (active = true)
  const featuredAudio = Array.isArray(audioRecordings)
    ? audioRecordings.find((audio) => audio.active === true) ||
      (audioRecordings.length > 0 ? audioRecordings[0] : null)
    : null;

  // Filter out featured audio from the list
  const otherAudios =
    Array.isArray(audioRecordings) && featuredAudio
      ? audioRecordings.filter((audio) => featuredAudio && audio.id !== featuredAudio.id)
      : [];

  // Sort by date (newest first)
  const sortedOtherAudios = [...otherAudios].sort((a, b) => {
    // Since all dates are the same in the example, this will keep original order
    // You can modify this if dates are different
    return parseInt(b.id) - parseInt(a.id);
  });

  const totalPages = Math.ceil(sortedOtherAudios.length / itemsPerPage);

  const paginatedAudios = sortedOtherAudios.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

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

  const getFileIdFromUrl = (url: string) => {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const handleDownload = (fileId: string, fileName: string) => {
    if (!fileId) return;

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || 'audio-message.mp3');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audio recordings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load audio</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No featured audio state
  if (!featuredAudio) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No audio recordings available at this time.</p>
          <p className="text-gray-400 mt-2">Please check back later for Spirit World broadcasts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Audio Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Spirit World</h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              In 2016, Prophet Namara Ernest began broadcasting the Spirit World on Uganda's 96.6
              Spirit FM. Officially launched on December 9, 2019, the program continues to impact
              lives today. These broadcasts now have a new home on our website—click to listen or
              download.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-[#B28930] p-12 text-white relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-white/20 text-white">{featuredAudio.date}</Badge>
                    <Badge className="bg-[#B28930] text-white">Latest</Badge>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Music className="h-12 w-12 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold mb-4">{featuredAudio.title}</h2>

                    <div className="flex items-center justify-center text-white/90 mb-6">
                      <User className="h-5 w-5 mr-2" /> {featuredAudio.speaker}
                    </div>

                    {/* Featured audio player */}
                    <div className="bg-black/20 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
                      <iframe
                        src={featuredAudio.driveUrl}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay"
                        className="rounded-lg"
                        title={featuredAudio.title}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white bg-white/20 hover:bg-white/30"
                      onClick={() => {
                        const fileId = getFileIdFromUrl(featuredAudio.driveUrl);
                        if (fileId) handleDownload(fileId, `${featuredAudio.title}.mp3`);
                      }}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <p className="text-center text-gray-600 text-lg">{featuredAudio.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Other Audio Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">More Spirit World Audios</h2>
            <p className="text-xl text-gray-600">
              Listen to more life-giving broadcasts of the Spirit World.
            </p>
          </div>

          {sortedOtherAudios.length > 0 ? (
            <>
              <div className="space-y-6">
                {paginatedAudios.map((audio) => (
                  <Card
                    key={audio.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Player part */}
                        <div className="lg:w-2/5 bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
                          <h3 className="text-xl font-bold mb-2">{audio.title}</h3>

                          <div className="flex items-center text-sm opacity-90 mb-4">
                            <User className="h-4 w-4 mr-2" /> {audio.speaker}
                            <Clock className="h-4 w-4 ml-4 mr-2" /> {audio.date}
                          </div>

                          <div className="bg-black/20 rounded-lg p-4 mb-4">
                            <iframe
                              src={audio.driveUrl}
                              width="100%"
                              height="60"
                              frameBorder="0"
                              allow="autoplay"
                              className="rounded"
                              title={audio.title}
                            />
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => {
                              const fileId = getFileIdFromUrl(audio.driveUrl);
                              if (fileId) handleDownload(fileId, `${audio.title}.mp3`);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>

                        {/* Description part */}
                        <div className="lg:w-3/5 p-6 bg-white rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none">
                          <p className="text-gray-600 leading-relaxed">{audio.description}</p>
                          <Separator className="mt-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <div className="flex items-center justify-center space-x-4 mt-8">
                    <Button
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(i)}
                        className={
                          currentPage === i
                            ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
                            : 'border-gray-300 text-purple-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50'
                        }
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-gray-500 text-sm">
                      Showing {currentPage * itemsPerPage + 1} -{' '}
                      {Math.min((currentPage + 1) * itemsPerPage, sortedOtherAudios.length)} of{' '}
                      {sortedOtherAudios.length} audios
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No additional audio recordings available</p>
              <p className="text-gray-400 mt-2">
                Check back later for more Spirit World broadcasts
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-[#F5F0E1] rounded-2xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Never Miss a Message</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Click below to add Spirit World to your calendar.
            </p>

            <Link
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Spirit%20World&dates=20251208T220000/20251208T230000&recur=RRULE:FREQ=WEEKLY;BYDAY=MO"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                variant="outline"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Add to Calendar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
