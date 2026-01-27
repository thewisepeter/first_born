// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all non-partnership routes
  if (!pathname.startsWith('/partnership')) {
    return NextResponse.next();
  }

  // Public partnership routes
  const isPublicRoute =
    pathname === '/partnership' ||
    pathname === '/partnership/landing' ||
    pathname.startsWith('/partnership/signup/');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  /**
   * Protect dashboard routes ONLY
   * Everything under (dashboard) is authenticated
   */
  const isDashboardRoute = pathname.startsWith('/partnership/') && !pathname.includes('/landing');

  if (isDashboardRoute) {
    // Lightweight auth check: presence of ANY auth cookie
    const hasAuthCookie = request.cookies.size > 0;

    if (!hasAuthCookie) {
      const redirectUrl = new URL('/partnership/landing', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/partnership/:path*'],
};
