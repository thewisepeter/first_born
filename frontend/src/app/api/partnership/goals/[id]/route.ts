import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${apiUrl}/api/partners/goals/${params.id}/`, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch goal' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Partner goal fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    const response = await fetch(`${apiUrl}/api/partners/goals/${params.id}/`, {
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
        { error: data.error || 'Failed to update goal' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Partner goal update error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${apiUrl}/api/partners/goals/${params.id}/`, {
      method: 'DELETE',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Partner goal delete error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
