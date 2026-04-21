import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return NextResponse.json({ error: 'Authentication service not configured' }, { status: 500 });
    }

    // 🔥 Correct way to get cookies in Next.js
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const response = await fetch(`${apiUrl}/api/auth/me/`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader, // ✅ now properly forwarded
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Auth /me failed:', text);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: response.status }
      );
    }

    const djangoUser = await response.json();

    const transformedUser = {
      id: djangoUser.id,
      email: djangoUser.email,
      first_name: djangoUser.first_name,
      last_name: djangoUser.last_name,
      firstName: djangoUser.first_name,
      lastName: djangoUser.last_name,
      is_staff: djangoUser.is_staff,
      is_superuser: djangoUser.is_superuser,
      is_partner: djangoUser.is_partner || false,
      phone: djangoUser.phone,
      partner_profile: djangoUser.partner_profile,
      partnerType: djangoUser.partner_profile?.partner_type,
      community: djangoUser.partner_profile?.community,
      communityType:
        djangoUser.partner_profile?.community === 'business' ? 'business-class' : 'working-class',
      total_given: djangoUser.partner_profile?.total_given,
      months_active: djangoUser.partner_profile?.months_active,
    };

    return NextResponse.json({
      authenticated: true,
      user: transformedUser,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
