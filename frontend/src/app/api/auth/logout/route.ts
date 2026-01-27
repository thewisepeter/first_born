// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cookies = request.headers.get('cookie') || '';

    // Call Django custom logout endpoint
    const response = await fetch(`${apiUrl}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Clear all auth cookies regardless of Django response
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear Django cookies
    nextResponse.cookies.delete('sessionid');
    nextResponse.cookies.delete('csrftoken');

    // Clear any custom cookies
    nextResponse.cookies.delete('access_token');
    nextResponse.cookies.delete('refresh_token');

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if network fails
    const response = NextResponse.json({
      success: true,
      message: 'Logged out locally',
    });
    response.cookies.delete('sessionid');
    response.cookies.delete('csrftoken');
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}
