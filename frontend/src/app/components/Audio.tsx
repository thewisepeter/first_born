'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, Download, Share2, Calendar, Clock, User, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface AudioItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  description: string;
  driveUrl: string;
  series?: string;
  downloads: number;
}

const audioRecordings: AudioItem[] = [
  {
    id: '1',
    title: 'Walking by Faith, Not by Sight',
    speaker: 'Pastor John Smith',
    date: 'February 11, 2024',
    duration: '42:15',
    description: 'An inspiring message about trusting God\'s plan even when we cannot see the full picture. Discover how faith can transform your perspective and lead to breakthrough.',
    driveUrl: 'https://drive.google.com/file/d/1abc123def456/preview',
    series: 'Faith Series',
    downloads: 287
  },
  {
    id: '2',
    title: 'The Power of Community',
    speaker: 'Pastor John Smith',
    date: 'February 4, 2024',
    duration: '38:22',
    description: 'Exploring how meaningful relationships within the church can strengthen our faith and provide support during life\'s challenges.',
    driveUrl: 'https://drive.google.com/file/d/2def456ghi789/preview',
    series: 'Community Life',
    downloads: 201
  },
  {
    id: '3',
    title: 'Finding Hope in Difficult Times',
    speaker: 'Pastor John Smith',
    date: 'January 28, 2024',
    duration: '45:08',
    description: 'When life feels overwhelming, discover how God\'s promises can provide hope and strength for the journey ahead.',
    driveUrl: 'https://drive.google.com/file/d/3ghi789jkl012/preview',
    series: 'Hope & Encouragement',
    downloads: 324
  },
  {
    id: '4',
    title: 'The Joy of Serving Others',
    speaker: 'Guest Speaker: Sarah Johnson',
    date: 'January 21, 2024',
    duration: '35:45',
    description: 'Learn how serving others can transform your life and help you discover God\'s unique calling on your life.',
    driveUrl: 'https://drive.google.com/file/d/4jkl012mno345/preview',
    series: 'Ministry & Service',
    downloads: 156
  },
  {
    id: '5',
    title: 'Prayer That Changes Everything',
    speaker: 'Pastor John Smith',
    date: 'January 14, 2024',
    duration: '40:30',
    description: 'Unlock the power of prayer and learn how to develop a deeper, more meaningful prayer life that brings real transformation.',
    driveUrl: 'https://drive.google.com/file/d/5mno345pqr678/preview',
    series: 'Prayer & Worship',
    downloads: 278
  },
  {
    id: '6',
    title: 'Christmas Message: God\'s Greatest Gift',
    speaker: 'Pastor John Smith',
    date: 'December 24, 2023',
    duration: '32:18',
    description: 'Reflect on the true meaning of Christmas and how God\'s incredible gift of love continues to transform lives today.',
    driveUrl: 'https://drive.google.com/file/d/6pqr678stu901/preview',
    series: 'Christmas Special',
    downloads: 445
  }
];

export function Audio() {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const toggleAudio = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Video Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Recent Messages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch our latest sermon and listen to recent audio messages from our church services.
            </p>
          </div>

          {/* Featured Video */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="aspect-video bg-gray-900 relative">
                {/* YouTube Embed - Most Recent Video */}
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Latest Sermon - Walking by Faith"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Walking by Faith, Not by Sight
                    </h2>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <User className="h-4 w-4 mr-2" />
                      <span className="mr-4">Pastor John Smith</span>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>February 11, 2024</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      An inspiring message about trusting God's plan even when we cannot see the full picture. 
                      Discover how faith can transform your perspective and lead to breakthrough in your life.
                    </p>
                  </div>
                  <Badge className="ml-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
                    Latest
                  </Badge>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Audio Messages</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listen to our recent sermons and teachings. Perfect for your commute, workout, or quiet time.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full mx-auto mt-6" />
          </div>

          {/* Audio List */}
          <div className="space-y-6">
            {audioRecordings.map((audio, index) => (
              <Card key={audio.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Audio Player Section */}
                    <div className="lg:w-2/5 bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                          {audio.series}
                        </Badge>
                        <div className="text-sm opacity-90">#{String(index + 1).padStart(2, '0')}</div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 leading-tight">{audio.title}</h3>
                      
                      <div className="flex items-center text-sm opacity-90 mb-4">
                        <User className="h-4 w-4 mr-2" />
                        <span className="mr-4">{audio.speaker}</span>
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{audio.duration}</span>
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
                        <Button
                          onClick={() => toggleAudio(audio.id)}
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          variant="outline"
                        >
                          {playingAudio === audio.id ? (
                            <Pause className="h-4 w-4 mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {playingAudio === audio.id ? 'Pause' : 'Play'}
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-3/5 p-6">
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="mr-4">{audio.date}</span>
                        <Headphones className="h-4 w-4 mr-2" />
                        <span>{audio.downloads} listens</span>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-6">
                        {audio.description}
                      </p>

                      <Separator className="mb-4" />

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Listen Now
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
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
            Subscribe to our podcast or follow us on your favorite platform to get the latest sermons and teachings delivered directly to you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8"
            >
              Subscribe to Podcast
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8"
            >
              Follow on Spotify
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8"
            >
              Follow on Apple Podcasts
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}