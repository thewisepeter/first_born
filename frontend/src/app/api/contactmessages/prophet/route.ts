import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const body = await request.json();
    const response = await fetch(`${apiUrl}/api/contactmessages/prophet/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('origin') ? { Origin: request.headers.get('origin')! } : {}),
        ...(request.headers.get('referer') ? { Referer: request.headers.get('referer')! } : {}),
        Cookie: request.headers.get('cookie') || '',
        'X-CSRFToken': request.headers.get('x-csrftoken') || '',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({
      detail: 'The contact service could not process your message. Please try again.',
    }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return NextResponse.json(
      { detail: 'Contact service unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
