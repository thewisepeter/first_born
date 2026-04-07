import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';
    const body = await request.json();

    // Extract CSRF token
    const cookieArray = cookies.split('; ');
    let csrfToken = '';
    for (const cookie of cookieArray) {
      if (cookie.startsWith('csrftoken=')) {
        csrfToken = cookie.substring('csrftoken='.length);
        break;
      }
    }

    const response = await fetch(`${apiUrl}/api/partners/partners/${params.id}/`, {
      method: 'PATCH',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('🔴 Django error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to update partner profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Partner update error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
