export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

let pendingToken: Promise<string> | null = null;

export async function ensureCsrfToken(): Promise<string> {
  const existingToken = getCsrfToken();
  if (existingToken) return existingToken;

  if (!pendingToken) {
    pendingToken = (async () => {
      const response = await fetch('/api/csrf/', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Unable to initialize the contact form. Please try again.');
      }

      const token = getCsrfToken();
      if (!token) {
        throw new Error('Unable to set the CSRF cookie. Please allow cookies and try again.');
      }
      return token;
    })().finally(() => {
      pendingToken = null;
    });
  }

  return pendingToken;
}
