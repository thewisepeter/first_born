import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Forward to Django registration endpoint
    const response = await fetch(`${apiUrl}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
      });
    }

    return NextResponse.json(
      { error: data.detail || data.error || 'Registration failed' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Registration service unavailable' }, { status: 503 });
  }
}
