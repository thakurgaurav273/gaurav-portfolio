import { Link } from 'react-router-dom';
import { ArrowUpRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Panel from '@/components/Panel';
import { optimizeImage, projectCover, projectUrl, type Project } from '@/lib/content';

// Screenshot presented in a minimal browser window. Neutral placeholder when there is no image.
export const BrowserFrame = ({
  src,
  alt,
  label,
  width = 1600,
  priority = false,
  className,
}: {
  src?: string;
  alt: string;
  label?: string;
  width?: number;
  priority?: boolean;
  className?: string;
}) => (
  <div className={cn('frame', className)}>
    <div className="flex h-9 items-center gap-1.5 border-b border-border bg-secondary/60 px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      {label && <span className="ml-3 truncate font-mono text-[11px] text-muted-foreground">{label}</span>}
    </div>
    <div className="overflow-hidden bg-muted">
      {src ? (
        <img
          src={optimizeImage(src, width)}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center text-xl font-semibold tracking-tight text-muted-foreground">
          {alt}
        </div>
      )}
    </div>
  </div>
);

const cover = (p: Project) => ({
  src: projectCover(p),
  alt: p.screenshots?.[0]?.alt || p.title,
  label: p.screenshots?.[0]?.label ? `${p.title} / ${p.screenshots[0].label}` : p.title,
});

const Stack = ({ tech, max = 6 }: { tech: string[]; max?: number }) => (
  <ul className="flex flex-wrap gap-1.5">
    {tech.slice(0, max).map((t) => (
      <li key={t} className="chip">{t}</li>
    ))}
    {tech.length > max && <li className="chip text-muted-foreground">+{tech.length - max}</li>}
  </ul>
);

// Large spotlight card for the headline projects; alternates image side on wide screens.
export const FeaturedProject = ({ project, index }: { project: Project; index: number }) => (
  <Panel className="panel-link group">
    <Link
      to={`/work/${project.slug}`}
      aria-label={`${project.title} case study`}
      className={cn('grid items-center gap-6 p-4 sm:p-5 lg:grid-cols-12 lg:gap-8', index % 2 === 0 && 'lg:[&>*:first-child]:order-2')}
    >
      <div className="lg:col-span-7">
        <BrowserFrame {...cover(project)} />
      </div>

      <div className="lg:col-span-5">
        <p className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span className="text-foreground">{String(index).padStart(2, '0')}</span>
          {project.category && <span className="uppercase tracking-[0.14em]">{project.category}</span>}
          {!projectUrl(project) && (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> Private
            </span>
          )}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">{project.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{project.description}</p>
        <div className="mt-4">
          <Stack tech={project.tech} />
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          Read the case study
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  </Panel>
);

// Compact card for the secondary collection.
export const ProjectRow = ({ project, index }: { project: Project; index: number }) => (
  <li>
    <Panel className="panel-link group h-full">
      <Link to={`/work/${project.slug}`} className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, '0')}</span>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{project.tagline || project.description}</p>
        {project.category && <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{project.category}</p>}
      </Link>
    </Panel>
  </li>
);

// Grid tile for the project archive.
export const ProjectTile = ({ project }: { project: Project }) => (
  <Panel className="panel-link group">
    <Link to={`/work/${project.slug}`} className="flex h-full flex-col p-4">
      <BrowserFrame {...cover(project)} width={900} />
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
        <ArrowUpRight className="mt-1.5 h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <p className="mt-2 flex-1 px-1 text-[15px] leading-relaxed text-muted-foreground">{project.tagline || project.description}</p>
      <div className="mt-4 px-1">
        <Stack tech={project.tech} max={4} />
      </div>
    </Link>
  </Panel>
);
