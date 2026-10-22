import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Copy, FileText, FolderGit2, Hash, Home, LayoutGrid } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { emailFrom, useHero, useProjects } from '@/lib/content';
import { navLinks, scrollToSection, sectionPath } from '@/lib/nav';
import { lockScroll } from '@/lib/scroll';
import { socialIcon } from '@/lib/social';

// ⌘K palette for jumping to sections, case studies and links.
const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hero = useHero();
  const { data: projects } = useProjects();
  const { toast } = useToast();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-menu', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-menu', onOpen);
    };
  }, [isAdmin]);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  if (isAdmin) return null;

  const run = (fn: () => void) => {
    setOpen(false);
    // Let the dialog close (and unlock scrolling) before moving.
    requestAnimationFrame(fn);
  };

  const goSection = (id: string) => run(() => scrollToSection(id) || navigate(sectionPath(id)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList data-lenis-prevent>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => goSection('home')}>
            <Home /> Home
          </CommandItem>
          {navLinks.map((l) => (
            <CommandItem key={l.id} onSelect={() => goSection(l.id)}>
              <Hash /> {l.label}
            </CommandItem>
          ))}
          <CommandItem onSelect={() => run(() => navigate('/all-projects'))}>
            <LayoutGrid /> All projects
          </CommandItem>
        </CommandGroup>
        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Case studies">
              {projects.map((p) => (
                <CommandItem key={p.slug} value={`${p.title} ${p.category ?? ''}`} onSelect={() => run(() => navigate(`/work/${p.slug}`))}>
                  <FolderGit2 /> {p.title}
                  {p.category && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{p.category}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Links">
          <CommandItem
            onSelect={() =>
              run(async () => {
                await navigator.clipboard.writeText(emailFrom(hero)).catch(() => undefined);
                toast({ title: 'Email copied', description: emailFrom(hero) });
              })
            }
          >
            <Copy /> Copy email
          </CommandItem>
          {hero.resumeUrl && (
            <CommandItem onSelect={() => run(() => window.open(hero.resumeUrl!, '_blank', 'noopener'))}>
              <FileText /> Resume <ArrowUpRight className="ml-auto !h-3.5 !w-3.5 text-muted-foreground" />
            </CommandItem>
          )}
          {hero.socialLinks
            .filter((l) => !l.url.startsWith('mailto:'))
            .map((l) => {
              const Icon = socialIcon(l.platform);
              return (
                <CommandItem key={l.url} onSelect={() => run(() => window.open(l.url, '_blank', 'noopener'))}>
                  <Icon /> {l.platform} <ArrowUpRight className="ml-auto !h-3.5 !w-3.5 text-muted-foreground" />
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
