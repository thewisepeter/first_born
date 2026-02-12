// src/app/api/partnership/request/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation - ONLY fields that Django expects
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Forward to Django partner-requests endpoint
    // IMPORTANT: Only send fields that Django serializer expects
    const response = await fetch(`${apiUrl}/api/partners/requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        email: body.email.trim().toLowerCase(), // Django validates lowercase
        phone: body.phone.trim(),
        // NO commitment/message field - Django doesn't expect it
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

    // If Django returns validation errors
    if (data.detail || data.error) {
      return NextResponse.json(
        { success: false, error: data.detail || data.error || 'Validation failed' },
        { status: response.status }
      );
    }

    // If Django returns serializer errors
    if (typeof data === 'object') {
      const errors = Object.values(data).flat();
      if (errors.length > 0) {
        return NextResponse.json(
          { success: false, error: errors[0] || 'Validation error' },
          { status: response.status }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: response.status }
    );
  } catch (error: any) {
    console.error('Partner request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Service unavailable. Please try again later.',
      },
      { status: 503 }
    );
  }
}
