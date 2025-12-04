'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Download,
  Share2,
  Calendar,
  Clock,
  User,
  Headphones,
  Music,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import Link from 'next/link';

interface AudioItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  active: boolean;
  description: string;
  driveUrl: string;
}

export function Audio() {
  const [audioRecordings, setAudioRecordings] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAudios() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/mediafiles/audio/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AudioItem[] = await response.json();
        setAudioRecordings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch audio recordings');
      } finally {
        setLoading(false);
      }
    }

    fetchAudios();
  }, []);

  const toggleAudio = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
    }
  };

  const featuredAudio =
    audioRecordings.find((audio) => audio.active) ||
    (audioRecordings.length > 0 ? audioRecordings[0] : null);

  const otherAudios = audioRecordings
    .filter((audio) => featuredAudio && audio.id !== featuredAudio.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDownload = (fileId: string, fileName: string) => {
    if (!fileId) {
      console.error('Invalid file ID');
      return;
    }
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || 'audio-message.mp3');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIdFromUrl = (url: string) => {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <div className="text-center py-20">Loading audios...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">Error: {error}</div>;
  }

  if (!featuredAudio) {
    return <div className="text-center py-20">No audio recordings found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Audio Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Spirit World</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listen to weekly life giving broadcasts
            </p>
          </div>

          {/* Featured Audio */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-0 shadow-2xl overflow-hidden">
              {/* Large Audio Player Visual */}
              <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-[#B28930] p-12 text-white relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern
                        id="audio-pattern"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="30" cy="30" r="2" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#audio-pattern)" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                      {featuredAudio.date}
                    </Badge>
                    <Badge className="bg-[#B28930] text-white hover:bg-[#9A7328]">Latest</Badge>
                  </div>

                  <div className="text-center">
                    {/* Large Audio Icon */}
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                      <Music className="h-12 w-12 text-white" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                      {featuredAudio.title}
                    </h2>

                    <div className="flex items-center justify-center text-white/90 mb-6 flex-wrap gap-6">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        <span>{featuredAudio.speaker}</span>
                      </div>
                    </div>

                    {/* Audio Embed */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 mb-6 max-w-2xl mx-auto">
                      <iframe
                        src={featuredAudio.driveUrl}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay"
                        className="rounded-lg"
                      />
                    </div>

                    {/* Play Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white bg-white/20 backdrop-blur-sm"
                        onClick={() => {
                          const fileId = getFileIdFromUrl(featuredAudio.driveUrl);
                          if (fileId) {
                            handleDownload(fileId, `${featuredAudio.title}.mp3`);
                          } else {
                            console.error('Could not extract file ID from URL');
                          }
                        }}
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <CardContent className="p-8">
                <div className="text-center max-w-2xl mx-auto">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {featuredAudio.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Audio Messages Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">More Spirit World Audios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listen to more life giving broadcasts of the Spirit World.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full mx-auto mt-6" />
          </div>

          {/* Audio List - Skip the first one since it's featured */}
          <div className="space-y-6">
            {otherAudios.map((audio, index) => (
              <Card
                key={audio.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Audio Player Section */}
                    <div className="lg:w-2/5 bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm opacity-90">
                          #{String(index + 2).padStart(2, '0')}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 leading-tight">{audio.title}</h3>

                      <div className="flex items-center text-sm opacity-90 mb-4">
                        <User className="h-4 w-4 mr-2" />
                        <span className="mr-4">{audio.speaker}</span>
                        <Clock className="h-4 w-4 mr-2" />
                      </div>

                      {/* Audio Embed */}
                      <div className="bg-black/20 rounded-lg p-4 mb-4">
                        <iframe
                          src={audio.driveUrl}
                          width="100%"
                          height="60"
                          frameBorder="0"
                          allow="autoplay"
                          className="rounded"
                        />
                      </div>

                      {/* Play Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            onClick={() => {
                              const fileId = getFileIdFromUrl(audio.driveUrl);
                              if (fileId) {
                                handleDownload(fileId, `${audio.title}.mp3`);
                              } else {
                                console.error('Could not extract file ID from URL');
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-3/5 p-6">
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="mr-4">{audio.date}</span>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-6">{audio.description}</p>

                      <Separator className="mb-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8"
            >
              Load More Messages
            </Button>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Never Miss a Message</h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Click below and add Spirit World to your calendar to get weekly reminders for new audio
            messages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Spirit%20World&dates=20251208T220000/20251208T230000&recur=RRULE:FREQ=WEEKLY;BYDAY=MO"
              target="_blank"
            >
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8">
                Add to Calendar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
