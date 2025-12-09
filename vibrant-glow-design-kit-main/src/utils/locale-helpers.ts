/**
 * Helper utilities for locale-aware routing
 */

// Supported locales
export const locales = ['en', 'pt', 'fr'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'pt';

/**
 * Extract locale from pathname
 * @param pathname - Current pathname (e.g., '/pt/about', '/en/pricing')
 * @returns Locale code or default locale
 */
export function getLocaleFromPathname(pathname: string): Locale {
  if (!pathname || pathname === '/') {
    return defaultLocale;
  }
  
  // Check if pathname starts with a locale
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  
  return defaultLocale;
}

/**
 * Add locale prefix to a path
 * @param path - Path without locale (e.g., '/about', '/pricing')
 * @param locale - Locale code (defaults to 'pt')
 * @returns Path with locale prefix (e.g., '/pt/about', '/en/pricing')
 */
export function addLocalePrefix(path: string, locale: Locale = defaultLocale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Don't add locale to excluded paths
  const excludedPaths = ['admin', 'auth', 'portal', 'api', '_next', 'static'];
  if (excludedPaths.some(excluded => cleanPath.startsWith(excluded))) {
    return path;
  }
  
  // If path is root, return locale root
  if (cleanPath === '' || cleanPath === '/') {
    return `/${locale}`;
  }
  
  // Add locale prefix
  return `/${locale}/${cleanPath}`;
}

/**
 * Remove locale prefix from pathname
 * @param pathname - Pathname with locale (e.g., '/pt/about')
 * @returns Pathname without locale (e.g., '/about')
 */
export function removeLocalePrefix(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.replace(`/${locale}`, '');
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  
  return pathname;
}

/**
 * Check if a path should have locale prefix
 * @param path - Path to check
 * @returns true if path should have locale prefix
 */
export function shouldAddLocalePrefix(path: string): boolean {
  const excludedPaths = ['/admin', '/auth', '/portal', '/api', '/_next', '/static'];
  return !excludedPaths.some(excluded => path.startsWith(excluded));
}



