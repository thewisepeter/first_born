// src/app/api/giving/scheduled/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

// PATCH method for updating
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const response = await fetch(`${apiUrl}/api/giving/scheduled/${params.id}/`, {
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
      return NextResponse.json(
        { error: data.error || 'Failed to update scheduled giving' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Scheduled giving update error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

// DELETE method
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const response = await fetch(`${apiUrl}/api/giving/scheduled/${params.id}/`, {
      method: 'DELETE',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to delete scheduled giving' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Scheduled giving delete error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

// POST method for actions (pause, resume, cancel)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get the action from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1]; // 'pause', 'resume', or 'cancel'

    const response = await fetch(`${apiUrl}/api/giving/scheduled/${params.id}/${action}/`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Failed to ${action} scheduled giving` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Scheduled giving action error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
