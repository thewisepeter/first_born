import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '5';

    const response = await fetch(`${apiUrl}/api/giving/recent/?limit=${limit}`, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch recent giving' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recent giving fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
