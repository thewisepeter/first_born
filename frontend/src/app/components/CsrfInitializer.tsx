'use client';

import { useEffect } from 'react';

export function CsrfInitializer() {
  useEffect(() => {
    fetch('https://prophetnamara.org/api/csrf/', {
      credentials: 'include',
    });
  }, []);

  return null; // nothing to render
}
