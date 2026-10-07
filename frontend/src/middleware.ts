import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const dashboardRoutes = new Set([
  '/partnership',
  '/partnership/giving',
  '/partnership/drives',
  '/partnership/opportunities',
  '/partnership/marketplace',
  '/partnership/resources',
  '/partnership/profile',
  '/partnership/live',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Unknown routes must reach Next.js and return 404, rather than redirect to login.
  if (!dashboardRoutes.has(pathname)) return NextResponse.next();

  // This is only an early routing check; the backend still validates the session.
  if (!request.cookies.get('sessionid')?.value) {
    const destination = new URL('/partnership/landing', request.url);
    destination.searchParams.set('redirect', pathname);
    return NextResponse.redirect(destination);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/partnership/:path*'] };
