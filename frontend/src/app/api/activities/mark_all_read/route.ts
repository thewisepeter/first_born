import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${apiUrl}/api/activities/mark_all_read/`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
