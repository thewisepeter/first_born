import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔵 GET /api/mediafiles/video/ called');

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'Partners';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '10';

    // Extract CSRF token
    const cookieArray = cookies.split('; ');
    let csrfToken = '';
    for (const cookie of cookieArray) {
      if (cookie.startsWith('csrftoken=')) {
        csrfToken = cookie.substring('csrftoken='.length);
        break;
      }
    }

    const djangoUrl = `${apiUrl}/api/mediafiles/video/?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`;
    console.log('📤 Fetching from Django:', djangoUrl);

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
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Videos fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
