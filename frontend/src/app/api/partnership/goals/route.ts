import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${apiUrl}/api/partners/goals/`, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Partner goals fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${apiUrl}/api/partners/goals/`, {
      method: 'POST',
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
        { error: data.error || 'Failed to create goal' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Partner goal create error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
