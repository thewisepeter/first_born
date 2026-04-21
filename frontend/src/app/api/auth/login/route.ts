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

    const response = await fetch(`${apiUrl}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: cookies,
        'X-CSRFToken': csrfToken,
        Referer: apiUrl,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Create the response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // 🔑 CRITICAL: Forward the Set-Cookie header from Django
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Add the cookie to the response
      nextResponse.headers.append('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
