import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { sectionFromPath } from '@/lib/nav';
import { scrollToElement, scrollToY, startSmoothScroll } from '@/lib/scroll';

// Where each history entry was left, so Back/Forward return to the same spot.
const positions = new Map<string, number>();

/*
  Owns scroll position across route changes. A new page always opens at its top
  (or at the section its URL names) instantly, never animating there from wherever
  the previous page was scrolled to. Back/Forward restore the previous position.
*/
const ScrollManager = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onScroll = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => (isAdmin ? undefined : startSmoothScroll()), [isAdmin]);

  useLayoutEffect(() => {
    keyRef.current = location.key;
    const saved = navType === 'POP' ? positions.get(location.key) : undefined;
    const section = sectionFromPath(window.location.pathname);

    const apply = () => {
      if (saved !== undefined) return scrollToY(saved, false);
      const el = section && section !== 'home' ? document.getElementById(section) : null;
      if (el) scrollToElement(el, false);
      else scrollToY(0, false);
    };

    apply();
    // Content above the target (e.g. projects from the API) can still be loading; settle once it lands.
    if (saved !== undefined || (section && section !== 'home')) {
      const t = window.setTimeout(apply, 350);
      const cancel = () => window.clearTimeout(t);
      window.addEventListener('wheel', cancel, { once: true, passive: true });
      window.addEventListener('touchstart', cancel, { once: true, passive: true });
      return () => {
        cancel();
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchstart', cancel);
      };
    }
  }, [location.key, navType]);

  return null;
};

export default ScrollManager;
