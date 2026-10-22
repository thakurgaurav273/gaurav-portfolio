import { scrollToElement } from '@/lib/scroll';

export const navLinks = [
  { label: 'Work', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

export const sectionIds = ['home', ...navLinks.map((l) => l.id)];

// Path for a homepage section, e.g. /projects. Home is just /.
export const sectionPath = (id: string) => (id === 'home' ? '/' : `/${id}`);

export const sectionFromPath = (pathname: string) => {
  const id = pathname === '/' ? 'home' : pathname.slice(1);
  return sectionIds.includes(id) ? id : undefined;
};

// Smooth-scrolls within the homepage. The URL is replaced (not pushed) and keeps the
// router's history state, so Back leaves the page instead of stepping through sections.
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return false;
  window.history.replaceState(window.history.state, '', sectionPath(id));
  scrollToElement(el);
  return true;
};

// Opens the ⌘K palette (rendered once in App) from any button.
export const openCommandMenu = () => window.dispatchEvent(new Event('open-command-menu'));
