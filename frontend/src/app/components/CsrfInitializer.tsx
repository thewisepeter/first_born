'use client';

import { useEffect } from 'react';
import { ensureCsrfToken } from '../lib/csrf';

export function CsrfInitializer() {
  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        await ensureCsrfToken();
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };

    initializeCsrf();
  }, []);

  return null;
}
