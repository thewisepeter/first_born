// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Get cookies from the incoming request
    const cookies = request.headers.get('cookie') || '';

    // Extract CSRF token from cookies
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    console.log('Cookies:', cookies);
    console.log('CSRF Token:', csrfToken);

    // Forward to Django auth endpoint with session support
    const response = await fetch(`${apiUrl}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: cookies, // Forward cookies
        'X-CSRFToken': csrfToken, // 🔑 CRITICAL: Forward CSRF token
        Referer: apiUrl, // Add referer header
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      // Create response
      const nextResponse = NextResponse.json({
        success: true,
        user: data.user,
      });

      // Forward any cookies from Django
      const responseCookies = response.headers.get('set-cookie');
      if (responseCookies) {
        const cookieArray = responseCookies.split(', ');
        cookieArray.forEach((cookie) => {
          const [cookieString] = cookie.split(';');
          const [name, value] = cookieString.split('=');

          if (name && value) {
            nextResponse.cookies.set({
              name,
              value,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: name === 'sessionid' ? 60 * 60 * 24 * 14 : undefined,
            });
          }
        });
      }

      return nextResponse;
    }

    return NextResponse.json({ error: data.detail || 'Login failed' }, { status: response.status });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
