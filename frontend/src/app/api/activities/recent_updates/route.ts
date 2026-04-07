import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';

    // Extract CSRF token (optional for GET, but good practice)
    const cookieArray = cookies.split('; ');
    let csrfToken = '';
    for (const cookie of cookieArray) {
      if (cookie.startsWith('csrftoken=')) {
        csrfToken = cookie.substring('csrftoken='.length);
        break;
      }
    }

    const djangoUrl = `${apiUrl}/api/activities/recent_updates/?limit=${limit}`;

    const response = await fetch(djangoUrl, {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 Django error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch recent updates' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Recent updates fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
