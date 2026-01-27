// app/api/partner/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Signup request body:', body);

    // Required fields
    const requiredFields = [
      'token',
      'email',
      'password',
      'passwordConfirm',
      'firstName',
      'lastName',
      'phone',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Password validation
    if (body.password !== body.passwordConfirm) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Django backend URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const djangoUrl = `${apiUrl}/api/partners/signup/${body.token}/`;

    console.log('Calling Django URL:', djangoUrl);

    // Call Django signup endpoint
    const response = await fetch(djangoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone,
        password: body.password,
        password_confirm: body.passwordConfirm,
      }),
    });

    console.log('Django response status:', response.status);

    // Check content type before parsing JSON
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const rawText = await response.text();
      console.error('Django returned non-JSON:', rawText.substring(0, 500));

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from backend service',
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Partner account created successfully',
        data,
      });
    }

    // Handle Django validation / API errors
    return NextResponse.json(
      {
        success: false,
        error: data?.detail || data?.error || 'Failed to complete signup',
      },
      { status: response.status }
    );
  } catch (error: any) {
    console.error('Signup completion error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Service unavailable',
      },
      { status: 503 }
    );
  }
}
