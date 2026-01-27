// src/app/partnership/(dashboard)/resources/page.tsx
'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Play, Headphones, FileText } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';
import { VideoResourceCard } from '../components/VideoResourceCard';
import { AudioResourceCard } from '../components/AudioResourceCard';
import { ArticleResourceCard } from '../components/ArticleResourceCard';
import {
  generateResourcesData,
  type Resource,
  type VideoResource,
  type AudioResource,
  type ArticleResource,
} from '../data/mockData';

export default function ResourcesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [audios, setAudios] = useState<AudioResource[]>([]);
  const [articles, setArticles] = useState<ArticleResource[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        const data = generateResourcesData();
        setAllResources(data);

        // Filter by type
        const videoResources = data.filter(
          (resource) => resource.type === 'video'
        ) as VideoResource[];
        const audioResources = data.filter(
          (resource) => resource.type === 'audio'
        ) as AudioResource[];
        const articleResources = data.filter(
          (resource) => resource.type === 'article'
        ) as ArticleResource[];

        setVideos(videoResources);
        setAudios(audioResources);
        setArticles(articleResources);
        setLoading(false);
      }, 800);
    };

    loadData();
  }, [user]);

  if (authLoading || loading) return <DashboardSkeleton />;
  if (!user) return null;

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
        </div>
      </div>

      {/* Main Content - Three Separate Resource Cards */}
      <div className="space-y-8">
        {/* Video Resources Card */}
        {videos.length > 0 && (
          <VideoResourceCard
            title="Video Teachings"
            description="Watch prophetic messages, teachings, and ministry updates from Prophet Namara"
            videos={videos}
          />
        )}

        {/* Audio Resources Card */}
        {audios.length > 0 && (
          <AudioResourceCard
            title="Audio Messages"
            description="Listen to prayers, prophetic words, and audio teachings on the go"
            audios={audios}
          />
        )}

        {/* Article Resources Card */}
        {articles.length > 0 && (
          <ArticleResourceCard
            title="Articles & Teachings"
            description="Read testimonies, teachings, and insights for deeper study and reflection"
            articles={articles}
          />
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
