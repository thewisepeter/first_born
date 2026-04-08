// src/app/api/giving/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams;
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

    // ✅ Use the correct endpoint: /api/giving/givings/
    const response = await fetch(
      `${apiUrl}/api/giving/givings/?page=${page}&page_size=${pageSize}`,
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
      return NextResponse.json(
        { error: 'Failed to fetch giving history' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert amount strings to numbers
    if (data.results) {
      data.results = data.results.map((item: any) => ({
        ...item,
        amount: parseFloat(item.amount),
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔴 Giving history fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookies = request.headers.get('cookie') || '';

    // Extract CSRF token
    const cookieArray = cookies.split('; ');
    let csrfToken = '';
    for (const cookie of cookieArray) {
      if (cookie.startsWith('csrftoken=')) {
        csrfToken = cookie.substring('csrftoken='.length);
        break;
      }
    }

    const body = await request.json();

    // Don't send partner ID - let Django derive it from the session
    const response = await fetch(`${apiUrl}/api/giving/givings/`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: body.amount,
        giving_type: body.giving_type,
        title: body.title,
        date: body.date,
        payment_method: body.payment_method,
        notes: body.notes,
        is_scheduled: false,
        status: 'completed',
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Failed to create giving record' },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: responseText || 'Failed to create giving record' },
          { status: response.status }
        );
      }
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('🔴 Giving create error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
