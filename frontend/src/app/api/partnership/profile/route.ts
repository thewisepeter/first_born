// src/app/api/partnership/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${apiUrl}/api/partners/partners/profile/`, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 404) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch partner profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Partner profile fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${apiUrl}/api/partners/profile/`, {
      method: 'PATCH',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to update profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Partner profile update error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
