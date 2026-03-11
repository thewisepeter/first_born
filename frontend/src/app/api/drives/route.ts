import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔵 GET /api/drives/ called');

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Get query params from the request
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '10';
    const isPublished = searchParams.get('is_published') || 'true';

    // Extract CSRF token from cookies
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
      `${apiUrl}/api/drives/drives/?page=${page}&page_size=${pageSize}&is_published=${isPublished}`
    );
    console.log('🍪 Cookies present:', !!cookies);
    console.log('🔑 CSRF token present:', !!csrfToken);

    const response = await fetch(
      `${apiUrl}/api/drives/drives/?page=${page}&page_size=${pageSize}&is_published=${isPublished}`,
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
      return NextResponse.json({ error: 'Failed to fetch drives' }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Successfully fetched drives. Count:', data.count);

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Drives fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
