import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔵 GET /api/opportunities/ called');

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '10';
    const isPublished = searchParams.get('is_published') || 'true';

    // Extract CSRF token
    const cookieArray = cookies.split('; ');
    let csrfToken = '';
    for (const cookie of cookieArray) {
      if (cookie.startsWith('csrftoken=')) {
        csrfToken = cookie.substring('csrftoken='.length);
        break;
      }
    }

    console.log(
      '📤 Fetching from Django:',
      `${apiUrl}/api/opportunities/opportunities/?page=${page}&page_size=${pageSize}&is_published=${isPublished}`
    );

    const response = await fetch(
      `${apiUrl}/api/opportunities/opportunities/?page=${page}&page_size=${pageSize}&is_published=${isPublished}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      }
    );

    console.log('📥 Django response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 Django error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched opportunities. Count:', data.count);

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Opportunities fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
