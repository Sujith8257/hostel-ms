import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * RouterLogger: Logs every navigation with from/to, state, and navigation type.
 * Mount this inside a Router.
 */
export function RouterLogger() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    const prev = prevLocationRef.current;
    const now = new Date().toISOString();
    const fromUrl = `${prev.pathname}${prev.search}${prev.hash}`;
    const toUrl = `${location.pathname}${location.search}${location.hash}`;

    // Grouped logs for readability
    console.groupCollapsed(`%c[Router] ${now} ${navType}: ${fromUrl} -> ${toUrl}`,
      'color:#7c3aed;font-weight:600');
    console.log('from', prev);
    console.log('to', location);
    console.log('state', location.state);
    console.log('navigationType', navType);
    console.groupEnd();

    prevLocationRef.current = location;
  }, [location, navType]);

  // Also log POP events from the History API (back/forward)
  useEffect(() => {
    const onPopState = (ev: PopStateEvent) => {
      console.info('[Router:popstate]', { state: ev.state, url: window.location.href });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Log pushState/replaceState usage
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    function logChange(kind: 'pushState' | 'replaceState', state: unknown, title: string, url?: string | URL | null) {
      const now = new Date().toISOString();
      const from = window.location.href;
      // Some routers pass relative paths; compute a readable target
      const resolvedTo = url ? new URL(String(url), window.location.href).toString() : '(no url)';
      console.groupCollapsed(`%c[History] ${now} ${kind}: ${from} -> ${resolvedTo}`, 'color:#2563eb;font-weight:600');
      console.log('state', state);
      console.log('title', title);
      console.groupEnd();
    }

    const wrappedPushState: typeof window.history.pushState = function (data, unused, url) {
      logChange('pushState', data, unused, url);
      return originalPushState.apply(window.history, [data, unused, url]);
    };
    window.history.pushState = wrappedPushState;

    const wrappedReplaceState: typeof window.history.replaceState = function (data, unused, url) {
      logChange('replaceState', data, unused, url);
      return originalReplaceState.apply(window.history, [data, unused, url]);
    };
    window.history.replaceState = wrappedReplaceState;

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
}

export default RouterLogger;
