import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Command, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHero } from '@/lib/content';
import { cn } from '@/lib/utils';
import { navLinks, openCommandMenu, scrollToSection, sectionIds, sectionPath } from '@/lib/nav';
import { lockScroll } from '@/lib/scroll';

/*
  Floating glass nav used on every public page. On the homepage links smooth-scroll
  to their section; on inner pages they are real links that open the homepage
  already positioned at that section.
*/
const Navigation = ({ back }: { back?: { to: string; label: string } }) => {
  const hero = useHero();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const onHome = !back;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  // Highlight the link for whichever section is in the middle of the viewport.
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome, pathname]);

  const go = (e: React.MouseEvent, id: string) => {
    setOpen(false);
    if (onHome && scrollToSection(id)) e.preventDefault();
  };

  const linkTo = (id: string) => ({ to: sectionPath(id), onClick: (e: React.MouseEvent) => go(e, id) });

  return (
    <header className="fixed inset-x-0 top-3 z-50 sm:top-4">
      <div className="container-custom">
        <nav
          className={cn(
            'flex h-14 items-center justify-between rounded-full border pl-4 pr-2 transition-all duration-500',
            scrolled || open || !onHome
              ? 'border-border bg-background/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl'
              : 'border-transparent bg-transparent',
          )}
        >
          <div className="flex items-center gap-2">
            <Link {...linkTo('home')} className="group flex items-center gap-2.5 text-[15px] font-medium">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card transition-colors group-hover:border-accent/50">
                <img src="/logo_dark.png" alt="" className="h-4 w-auto brightness-0 invert" />
              </span>
              <span className="hidden sm:inline">{hero.name}</span>
            </Link>
            {back && (
              <Link
                to={back.to}
                className="ml-1 inline-flex h-8 items-center gap-1 rounded-full px-3 font-mono text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {back.label}
              </Link>
            )}
          </div>

          <div className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                {...linkTo(link.id)}
                className={cn(
                  'relative isolate rounded-full px-4 py-2 text-sm transition-colors',
                  active === link.id && onHome ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active === link.id && onHome && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-secondary"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={openCommandMenu}
              className="hidden h-9 items-center gap-2 rounded-full border border-border bg-card/60 pl-3 pr-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              aria-label="Open command menu"
            >
              <Command className="h-3.5 w-3.5" />
              <span className="kbd">K</span>
            </button>
            <Link {...linkTo('contact')}
              className="hidden h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-all hover:bg-accent sm:inline-flex"
            >
              Let's talk
            </Link>
            <button
              className="rounded-full p-2.5 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-3xl border border-border bg-background/95 p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl md:hidden"
            >
              {navLinks.map((link, i) => (
                <Link key={link.id} {...linkTo(link.id)} className="flex items-baseline gap-3 rounded-2xl px-4 py-3 text-2xl font-semibold tracking-tight">
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  {link.label}
                </Link>
              ))}
              {hero.resumeUrl && (
                <a href={hero.resumeUrl} target="_blank" rel="noopener noreferrer" className="block rounded-2xl px-4 py-3 text-2xl font-semibold tracking-tight">
                  Resume ↗
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navigation;
