// src/app/api/csrf/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const response = await fetch(`${apiUrl}/api/csrf/`, {
    method: 'GET',
    credentials: 'include',
  });

  const nextResponse = NextResponse.json({ success: true });

  // 🔑 CRITICAL: forward cookie EXACTLY as-is
  const setCookie = response.headers.get('set-cookie');

  if (setCookie) {
    nextResponse.headers.append('set-cookie', setCookie);
  }

  return nextResponse;
}
