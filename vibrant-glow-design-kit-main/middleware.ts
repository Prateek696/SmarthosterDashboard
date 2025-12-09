import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
const locales = ['en', 'pt', 'fr'];
const defaultLocale = 'pt'; // Portuguese is default

// Paths that should NOT have locale prefix
const publicPaths = [
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/lovable-uploads', // Static image assets
];

// Paths that should be excluded from locale routing
const excludedPaths = [
  '/admin',
  '/auth',
  '/portal',
  '/api',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug logging
  console.log('🔍 [MIDDLEWARE] Request:', {
    pathname,
    url: request.nextUrl.toString(),
    method: request.method,
  });

  // Handle /portal routes - redirect to Owner Portal app (keep existing logic)
  if (pathname.startsWith('/portal')) {
    const ownerPortalUrl = process.env.NEXT_PUBLIC_OWNER_PORTAL_URL || 'http://localhost:3000';
    
    // Extract the path after /portal
    let portalPath = pathname.replace(/^\/portal/, '');
    
    // Default to dashboard if no path specified
    if (!portalPath || portalPath === '/') {
      portalPath = '/dashboard/owner';
    }
    
    // Preserve query parameters if any
    const searchParams = request.nextUrl.searchParams.toString();
    const redirectUrl = new URL(portalPath, ownerPortalUrl);
    if (searchParams) {
      redirectUrl.search = searchParams;
    }
    
    // Redirect to Owner Portal
    return NextResponse.redirect(redirectUrl);
  }

  // Skip locale handling for excluded paths
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip locale handling for public assets
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  console.log('🔍 [MIDDLEWARE] Locale check:', {
    pathname,
    pathnameHasLocale,
    detectedLocale: pathnameHasLocale ? pathname.match(/^\/(en|pt|fr)/)?.[1] : null,
  });

  // If root path, redirect to default locale
  if (pathname === '/') {
    console.log('🔍 [MIDDLEWARE] Root path, redirecting to:', `/${defaultLocale}`);
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // If pathname doesn't have locale, add default locale
  if (!pathnameHasLocale) {
    // Extract locale from Accept-Language header or use default
    const locale = getLocale(request) || defaultLocale;
    console.log('🔍 [MIDDLEWARE] No locale in path, adding:', locale, '→', `/${locale}${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  console.log('🔍 [MIDDLEWARE] Path has locale, passing through:', pathname);
  return NextResponse.next();
}

// Get locale from request (browser language or default)
function getLocale(request: NextRequest): string | null {
  // Try to get from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,pt;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().split('-')[0]);
    
    // Find first matching locale
    for (const lang of languages) {
      if (locales.includes(lang)) {
        return lang;
      }
    }
  }
  
  return null; // Will use defaultLocale
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     * - lovable-uploads (static image assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|lovable-uploads).*)',
  ],
};
