import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') || '';

    const url = year
      ? `${apiUrl}/api/giving/monthly_summary/?year=${year}`
      : `${apiUrl}/api/giving/monthly_summary/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch monthly summary' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Monthly summary fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
