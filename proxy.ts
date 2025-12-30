import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always' // Changed from 'as-needed' to 'always' to prevent redirect loops
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/images/')
  ) {
    return NextResponse.next();
  }

  // Handle locale routing via next-intl
  const response = intlMiddleware(request);
  
  // Add header to identify admin routes
  if (pathname.includes('/admin')) {
    response.headers.set('x-is-admin', 'true');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
