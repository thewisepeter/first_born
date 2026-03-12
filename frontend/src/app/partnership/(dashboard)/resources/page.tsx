// src/app/partnership/(dashboard)/resources/page.tsx

'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import { Play, Headphones, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';
import { VideoResourceCard } from '../components/VideoResourceCard';
import { AudioResourceCard } from '../components/AudioResourceCard';
import { ArticleResourceCard } from '../components/ArticleResourceCard';
import { useResources } from '../../../../hooks/useResources';
import { Button } from '../../../components/ui/button';

export default function ResourcesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    videos,
    audios,
    articles,
    videosCount,
    audiosCount,
    articlesCount,
    refresh,
  } = useResources();

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Unable to Load Resources</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button
              onClick={refresh}
              variant="outline"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Partner Resources</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Access videos, audio messages, and articles to strengthen your partnership journey
            </p>
          </div>

          {/* Optional stats */}
          <div className="flex gap-4">
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center min-w-[80px]">
              <Play className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{videosCount}</div>
              <div className="text-xs text-gray-500">Videos</div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center min-w-[80px]">
              <Headphones className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{audiosCount}</div>
              <div className="text-xs text-gray-500">Audios</div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center min-w-[80px]">
              <FileText className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{articlesCount}</div>
              <div className="text-xs text-gray-500">Articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Separate Resource Cards */}
      <div className="space-y-8">
        {/* Video Resources Card */}
        {videos.length > 0 ? (
          <VideoResourceCard
            title="Video Teachings"
            description="Watch prophetic messages, teachings, and ministry updates from Prophet Namara"
            videos={videos}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Videos Available</h3>
            <p className="text-gray-500 mt-1">Check back later for new video content</p>
          </div>
        )}

        {/* Audio Resources Card */}
        {audios.length > 0 ? (
          <AudioResourceCard
            title="Audio Messages"
            description="Listen to prayers, prophetic words, and audio teachings on the go"
            audios={audios}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Audio Available</h3>
            <p className="text-gray-500 mt-1">Check back later for new audio messages</p>
          </div>
        )}

        {/* Article Resources Card */}
        {articles.length > 0 ? (
          <ArticleResourceCard
            title="Articles & Teachings"
            description="Read testimonies, teachings, and insights for deeper study and reflection"
            articles={articles}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Articles Available</h3>
            <p className="text-gray-500 mt-1">Check back later for new articles and teachings</p>
          </div>
        )}
      </div>

      {/* Spiritual Footer */}
      <footer className="text-center py-12 border-t border-gray-100">
        <blockquote className="text-xl italic text-gray-600 mb-4 max-w-2xl mx-auto font-medium">
          "Your word is a lamp for my feet, a light on my path."
        </blockquote>
        <p className="font-bold text-gray-900">— Psalm 119:105</p>
      </footer>
    </div>
  );
}
