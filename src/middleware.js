import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get('userId')?.value;

  // Protected routes that require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Public routes - allow access to home page and individual prompt pages
  if (pathname === '/' || pathname.startsWith('/prompt/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/prompts/:path*',
    '/',
    '/prompt/:path*'
  ],
};