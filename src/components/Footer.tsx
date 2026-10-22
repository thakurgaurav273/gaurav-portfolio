import { ArrowUp } from 'lucide-react';
import { useHero } from '@/lib/content';
import { socialIcon } from '@/lib/social';
import { scrollToY } from '@/lib/scroll';

const Footer = () => {
  const hero = useHero();

  return (
    <footer className="container-custom py-8">
      <div className="flex flex-col gap-6 border-t border-border pt-8 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">© {new Date().getFullYear()} {hero.name}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Built with React, Express, Prisma &amp; Postgres.</p>
        </div>
        <div className="flex items-center gap-1">
          {hero.socialLinks.map((link) => {
            const Icon = socialIcon(link.platform);
            return (
              <a
                key={link.url}
                href={link.url}
                target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
          <button
            onClick={() => scrollToY(0)}
            className="ml-2 grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
