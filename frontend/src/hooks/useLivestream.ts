'use client';

import { useEffect, useState } from 'react';

export interface LivestreamStatus {
  title: string;
  is_live: boolean;
  embed_url: string | null;
  next_broadcast_at: string | null;
  offline_message: string;
}

export function useLivestream() {
  const [status, setStatus] = useState<LivestreamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch('/api/mediafiles/live/', { cache: 'no-store' });
        if (!response.ok) throw new Error('Live status unavailable');
        const data: LivestreamStatus = await response.json();
        if (active) {
          setStatus(data);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { status, loading, error };
}
