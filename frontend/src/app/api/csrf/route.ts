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

    // Create response
    const nextResponse = NextResponse.json(data);

    // 🔑 CRITICAL: Forward the Set-Cookie header exactly as received
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Add the cookie to the response
      nextResponse.headers.append('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch CSRF token' }, { status: 503 });
  }
}
