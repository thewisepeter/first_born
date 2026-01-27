// app/api/partner/validate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // Validate token format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ success: false, error: 'Invalid token format' }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Call Django to validate token
    const response = await fetch(`${apiUrl}/api/partners/validate-token/${token}/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, we got an HTML error page
      return NextResponse.json(
        {
          success: false,
          error: 'Server returned an error. Please check if Django endpoint exists.',
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data,
      });
    }

    // Handle Django errors
    const errorData = await response.json();
    return NextResponse.json(
      {
        success: false,
        error: errorData.detail || 'Invalid or expired token',
      },
      { status: response.status }
    );
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
