import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { ArrowUpRight, Copy, CornerDownLeft, FileText, FolderGit2, Hash, Home, LayoutGrid, Search, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailFrom, useHero, useProjects } from '@/lib/content';
import { navLinks, scrollToSection, sectionPath } from '@/lib/nav';
import { lockScroll } from '@/lib/scroll';
import { socialIcon } from '@/lib/social';

const Group = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <Command.Group
    heading={heading}
    className="px-2 pb-1 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground"
  >
    {children}
  </Command.Group>
);

// One row: icon, label, optional detail on the right, and an ↵ hint while highlighted.
const Item = ({
  icon: Icon,
  label,
  detail,
  external,
  value,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  detail?: string | null;
  external?: boolean;
  value?: string;
  onSelect: () => void;
}) => (
  <Command.Item
    value={value ?? label}
    onSelect={onSelect}
    className="group flex cursor-pointer select-none items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 outline-none transition-colors data-[selected=true]:bg-secondary data-[selected=true]:text-foreground"
  >
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground group-data-[selected=true]:text-foreground">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {detail && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{detail}</span>}
    {external && <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
    <CornerDownLeft className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground group-data-[selected=true]:block" />
  </Command.Item>
);

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
  const openUrl = (url: string) => run(() => window.open(url, '_blank', 'noopener'));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/15 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          // Centred with margins, not a translate: the open/close animation sets `transform`
          // and would otherwise override the centring and slide the panel in from the side.
          className="panel fixed inset-x-0 top-[14vh] z-50 mx-auto w-[calc(100%-2rem)] max-w-xl shadow-[0_24px_60px_-20px_rgba(20,22,26,0.35)] data-[state=closed]:duration-150 data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90"
        >
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <Command loop className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                autoFocus
                placeholder="Search pages, projects and links…"
                className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              />
              <span className="kbd shrink-0">esc</span>
            </div>

            <Command.List data-lenis-prevent className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain pb-2">
              <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing matches that.</Command.Empty>

              <Group heading="Navigate">
                <Item icon={Home} label="Home" onSelect={() => goSection('home')} />
                {navLinks.map((l) => (
                  <Item key={l.id} icon={Hash} label={l.label} onSelect={() => goSection(l.id)} />
                ))}
                <Item icon={LayoutGrid} label="All projects" onSelect={() => run(() => navigate('/all-projects'))} />
              </Group>

              {projects.length > 0 && (
                <Group heading="Case studies">
                  {projects.map((p) => (
                    <Item
                      key={p.slug}
                      icon={FolderGit2}
                      label={p.title}
                      detail={p.category}
                      value={`${p.title} ${p.category ?? ''}`}
                      onSelect={() => run(() => navigate(`/work/${p.slug}`))}
                    />
                  ))}
                </Group>
              )}

              <Group heading="Links">
                <Item
                  icon={Copy}
                  label="Copy email"
                  detail={emailFrom(hero)}
                  onSelect={() =>
                    run(async () => {
                      await navigator.clipboard.writeText(emailFrom(hero)).catch(() => undefined);
                      toast({ title: 'Email copied', description: emailFrom(hero) });
                    })
                  }
                />
                {hero.resumeUrl && <Item icon={FileText} label="Resume" external onSelect={() => openUrl(hero.resumeUrl!)} />}
                {hero.socialLinks
                  .filter((l) => !l.url.startsWith('mailto:'))
                  .map((l) => (
                    <Item key={l.url} icon={socialIcon(l.platform)} label={l.platform} external onSelect={() => openUrl(l.url)} />
                  ))}
              </Group>
            </Command.List>

            <div className="hidden items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[11px] text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> move
              </span>
              <span className="flex items-center gap-1.5">
                <span className="kbd">↵</span> open
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="kbd">⌘</span>
                <span className="kbd">K</span> toggle
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandMenu;
