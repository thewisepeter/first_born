// src/app/api/giving/scheduled/route.ts

import { NextRequest, NextResponse } from 'next/server';

// ✅ GET method - for fetching scheduled givings
export async function GET(request: NextRequest) {
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

    const response = await fetch(`${apiUrl}/api/giving/scheduled/`, {
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
        { error: 'Failed to fetch scheduled givings' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert amount strings to numbers for consistency
    const formattedData = data.map((item: any) => ({
      ...item,
      amount: parseFloat(item.amount),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('🔴 Scheduled givings fetch error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

// ✅ POST method - for creating scheduled givings
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

    // Format the data for Django
    const djangoBody = {
      amount: body.amount,
      giving_type: body.giving_type,
      title: body.title,
      frequency: body.frequency,
      start_date: body.start_date,
      end_date: body.end_date,
    };

    const response = await fetch(`${apiUrl}/api/giving/scheduled/`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(djangoBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Failed to create scheduled giving' },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: responseText || 'Failed to create scheduled giving' },
          { status: response.status }
        );
      }
    }

    const data = JSON.parse(responseText);
    // Convert amount to number
    data.amount = parseFloat(data.amount);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
