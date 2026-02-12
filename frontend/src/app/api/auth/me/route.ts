// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      return NextResponse.json({ error: 'Authentication service not configured' }, { status: 500 });
    }

    // Forward cookies to Django exactly as received
    const response = await fetch(`${apiUrl}/api/auth/me/`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('Auth /me failed:', text);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: response.status }
      );
    }

    const user = await response.json();

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
