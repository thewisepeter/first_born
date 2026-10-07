import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/mediafiles/live/`, {
      cache: 'no-store',
      headers: { Cookie: request.headers.get('cookie') || '' },
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Live status unavailable' }, { status: response.status });
    }
    return NextResponse.json(await response.json(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Live status unavailable' }, { status: 503 });
  }
}
