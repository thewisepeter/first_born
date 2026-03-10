'use client';

import { useEffect } from 'react';

export function CsrfInitializer() {
  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        // Use environment variable or fallback to localhost for development
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // First, hit Django directly to set the cookie
        await fetch(`${apiUrl}/api/csrf/`, {
          credentials: 'include',
          mode: 'cors',
        });

        // Then hit your Next.js proxy to ensure it's in the browser context
        await fetch('/api/csrf/', {
          credentials: 'include',
        });

        console.log('✅ CSRF token initialized for:', apiUrl);
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };

    initializeCsrf();
  }, []);

  return null;
}
