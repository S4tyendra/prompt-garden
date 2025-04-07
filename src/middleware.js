import { NextResponse } from 'next/server';

export function middleware(request) {
  const userId = request.cookies.get('userId');
  
  // Protect dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect logged-in users from auth page to dashboard
  if (request.nextUrl.pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard']
};