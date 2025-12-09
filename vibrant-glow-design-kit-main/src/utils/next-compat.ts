/**
 * Compatibility layer for Next.js hooks in Vite builds
 * Provides React Router equivalents for Next.js navigation hooks
 */

import { useLocation, useNavigate, useSearchParams as useRouterSearchParams, Link as RouterLink } from 'react-router-dom';
import { useMemo } from 'react';

// Replace Next.js usePathname with React Router equivalent
export function usePathname() {
  try {
    const location = useLocation();
    return location.pathname;
  } catch (error) {
    console.error('usePathname error:', error);
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  }
}

// Replace Next.js useRouter with React Router equivalent
export function useRouter() {
  try {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Memoize the router object to prevent unnecessary re-renders
    return useMemo(() => ({
      push: (path: string) => {
        try {
          navigate(path);
        } catch (error) {
          console.error('Router push error:', error);
          window.location.href = path;
        }
      },
      replace: (path: string) => {
        try {
          navigate(path, { replace: true });
        } catch (error) {
          console.error('Router replace error:', error);
          window.location.replace(path);
        }
      },
      back: () => {
        try {
          navigate(-1);
        } catch (error) {
          console.error('Router back error:', error);
          window.history.back();
        }
      },
      forward: () => {
        try {
          navigate(1);
        } catch (error) {
          console.error('Router forward error:', error);
          window.history.forward();
        }
      },
      refresh: () => window.location.reload(),
      pathname: location.pathname,
    }), [navigate, location.pathname]);
  } catch (error) {
    console.error('useRouter error:', error);
    // Fallback router object
    return {
      push: (path: string) => { window.location.href = path; },
      replace: (path: string) => { window.location.replace(path); },
      back: () => { window.history.back(); },
      forward: () => { window.history.forward(); },
      refresh: () => window.location.reload(),
      pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    };
  }
}

// Replace Next.js useSearchParams with React Router equivalent
export function useSearchParams() {
  try {
    const [searchParams, setSearchParams] = useRouterSearchParams();
    
    return [
      searchParams,
      (updater: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => {
        if (typeof updater === 'function') {
          setSearchParams(updater(searchParams));
        } else {
          setSearchParams(updater);
        }
      }
    ] as const;
  } catch (error) {
    console.error('useSearchParams error:', error);
    // Fallback
    const params = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    return [
      params,
      () => {} // No-op setter
    ] as const;
  }
}

// Replace Next.js Link component with React Router Link
export const Link = RouterLink;

