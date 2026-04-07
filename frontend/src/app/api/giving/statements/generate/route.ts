import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    // Forward to Django
    const response = await fetch(`${apiUrl}/api/giving/statements/generate/`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Failed to generate statement' },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: responseText || 'Failed to generate statement' },
          { status: response.status }
        );
      }
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('🔴 Statement generation error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
