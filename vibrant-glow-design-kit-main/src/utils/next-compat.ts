/**
 * Compatibility layer for Next.js hooks in Vite builds
 * Provides React Router equivalents for Next.js navigation hooks
 */

import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';

// Replace Next.js usePathname with React Router equivalent
export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

// Replace Next.js useRouter with React Router equivalent
export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    pathname: location.pathname,
  };
}

// Replace Next.js useSearchParams with React Router equivalent
export function useSearchParams() {
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
}

// Replace Next.js Link component with React Router Link
export { Link } from 'react-router-dom';

