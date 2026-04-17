import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get cookies from the incoming request
    const cookies = request.headers.get('cookie') || '';

    // Extract CSRF token from cookies
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    // Get the referer from the incoming request
    const referer = request.headers.get('referer') || '';

    console.log('🔑 CSRF Token present:', !!csrfToken);
    console.log('🔗 Referer:', referer);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/partners/requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRFToken': csrfToken,
        Cookie: cookies,
        Referer: referer, // 🔑 CRITICAL: Forward the referer header
        Origin: apiUrl, // 🔑 Also add Origin header
      },
      body: JSON.stringify({
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Partner request submitted successfully',
        data,
      });
    }

    return NextResponse.json(
      { success: false, error: data.detail || data.error || 'Submission failed' },
      { status: response.status }
    );
  } catch (error: any) {
    console.error('Partner request error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Service unavailable' },
      { status: 503 }
    );
  }
}
