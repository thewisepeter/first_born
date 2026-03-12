'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as resourcesService from '../services/resources';

export function useResources() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [videos, setVideos] = useState<resourcesService.VideoResource[]>([]);
  const [audios, setAudios] = useState<resourcesService.AudioResource[]>([]);
  const [articles, setArticles] = useState<resourcesService.ArticleResource[]>([]);

  const [videosCount, setVideosCount] = useState(0);
  const [audiosCount, setAudiosCount] = useState(0);
  const [articlesCount, setArticlesCount] = useState(0);

  // In useResources.ts
  const fetchResources = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all resource types in parallel
      const [videosData, audiosData, articlesData] = await Promise.allSettled([
        resourcesService.getVideos('Partners', 1, 20),
        resourcesService.getAudios('Partners', 1, 20),
        resourcesService.getArticles('Partners', 1, 20),
      ]);

      // Handle videos
      if (videosData.status === 'fulfilled') {
        setVideos(videosData.value.results);
        setVideosCount(videosData.value.count);
      } else {
        console.error('Failed to fetch videos:', videosData.reason);
      }

      // Handle audios
      if (audiosData.status === 'fulfilled') {
        setAudios(audiosData.value.results);
        setAudiosCount(audiosData.value.count);
      } else {
        console.error('Failed to fetch audios:', audiosData.reason);
      }

      // Handle articles
      if (articlesData.status === 'fulfilled') {
        setArticles(articlesData.value.results);
        setArticlesCount(articlesData.value.count);
      } else {
        console.error('Failed to fetch articles:', articlesData.reason);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchResources();
  };

  useEffect(() => {
    fetchResources();
  }, [isAuthenticated]);

  return {
    loading,
    error,
    videos,
    audios,
    articles,
    videosCount,
    audiosCount,
    articlesCount,
    refresh,
  };
}
