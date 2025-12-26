import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect /admin to /en/admin (admin routes now use locale)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    return NextResponse.redirect(new URL(pathname.replace('/admin', `/${locale}/admin`), request.url));
  }

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/images/')
  ) {
    return NextResponse.next();
  }

  // Add custom header to identify admin routes
  const response = intlMiddleware(request);
  const isAdminRoute = pathname.includes('/admin');
  
  if (isAdminRoute) {
    response.headers.set('x-is-admin', 'true');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
