import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be accessible without authentication
const publicPaths = ['/', '/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the path starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if no token is present
      const url = new URL('/', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 