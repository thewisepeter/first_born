import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 Django error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch drives' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Drives fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
