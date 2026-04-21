import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data);

    // Forward the CSRF cookie - FIXED
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Handle multiple cookies properly
      const cookies = setCookieHeader.split(',').map((c) => c.trim());
      cookies.forEach((cookie) => {
        // Extract the cookie name and value
        const match = cookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          const name = match[1];
          const value = match[2];

          nextResponse.cookies.set({
            name,
            value,
            httpOnly: false, // CSRF token needs to be readable by JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        }
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch CSRF token' }, { status: 503 });
  }
}
