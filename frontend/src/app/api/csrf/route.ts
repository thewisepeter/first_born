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

    // Forward the CSRF cookie
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      const cookieArray = cookies.split(', ');
      cookieArray.forEach((cookie) => {
        const [cookieString] = cookie.split(';');
        const [name, value] = cookieString.split('=');
        if (name && value) {
          nextResponse.cookies.set(name, value, {
            httpOnly: false,
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
