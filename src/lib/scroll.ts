import Lenis from 'lenis';

// Single smooth-scroll instance for the public site; admin pages keep native scrolling.
let lenis: Lenis | null = null;

// Room left above a section so the floating nav doesn't cover its heading.
const NAV_OFFSET = 88;

export const startSmoothScroll = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  let frame = requestAnimationFrame(function raf(time) {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  });
  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
};

// Pauses wheel scrolling while an overlay (menu, command palette) is open.
export const lockScroll = (locked: boolean) => (locked ? lenis?.stop() : lenis?.start());

export const scrollToY = (top: number, smooth = true) => {
  if (lenis) lenis.scrollTo(top, { immediate: !smooth, force: true, duration: 1.1 });
  else window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
};

export const scrollToElement = (el: HTMLElement, smooth = true) => {
  const top = el.id === 'home' ? 0 : el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  scrollToY(Math.max(0, top), smooth);
};
