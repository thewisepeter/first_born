'use client';

import { useEffect } from 'react';

export function CsrfInitializer() {
  useEffect(() => {
    fetch('https://prophetnamara.org/api/csrf//api/csrf/', {
      credentials: 'include',
    }).catch((error) => {
      console.error('Failed to initialize CSRF token:', error);
    });
  }, []);

  return null; // nothing to render
}
