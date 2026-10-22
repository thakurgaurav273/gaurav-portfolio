import { useEffect, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Github, Lock } from 'lucide-react';
import { Reveal } from '@/components/Section';
import PageHeader from '@/components/PageHeader';
import { BrowserFrame } from '@/components/ProjectCard';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { optimizeImage, projectGallery, projectUrl, useProject, useProjects, type Screenshot } from '@/lib/content';

const Block = ({ label, children }: { label: string; children: ReactNode }) => (
  <Reveal className="rail border-t border-border py-14 md:py-20">
    <h2 className="rail-label eyebrow text-foreground md:pt-1.5">{label}</h2>
    <div className="rail-body">{children}</div>
  </Reveal>
);

const Shot = ({ shot, title, priority = false }: { shot: Screenshot; title: string; priority?: boolean }) => {
  const mobile = shot.orientation === 'mobile';
  return (
    <figure className={cn(mobile && 'mx-auto w-full max-w-[280px]')}>
      {mobile ? (
        <div className="frame rounded-[2rem] p-2">
          <img
            src={optimizeImage(shot.url, 600)}
            alt={shot.alt || shot.label || ''}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="aspect-[9/19] w-full rounded-[1.5rem] bg-muted object-cover object-top"
          />
        </div>
      ) : (
        <BrowserFrame
          src={shot.url}
          alt={shot.alt || shot.label || title}
          label={shot.label ? `${title} — ${shot.label}` : title}
          width={1800}
          priority={priority}
        />
      )}
      {(shot.label || shot.caption) && (
        <figcaption className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {shot.label && <span className="font-medium text-foreground">{shot.label}. </span>}
          {shot.caption}
        </figcaption>
      )}
    </figure>
  );
};

const Skeleton = () => (
  <div className="container-custom animate-pulse pt-20">
    <div className="h-3 w-32 rounded bg-muted" />
    <div className="mt-6 h-10 w-2/3 rounded bg-muted" />
    <div className="mt-4 h-5 w-1/2 rounded bg-muted" />
    <div className="mt-14 aspect-[16/10] w-full rounded-xl bg-muted" />
  </div>
);

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const { project, isLoading, notFound } = useProject(slug);
  const { data: all } = useProjects();

  useEffect(() => {
    if (project) document.title = `${project.title} — Gaurav Singh`;
    return () => {
      document.title = 'Gaurav Singh | Full-Stack Software Engineer';
    };
  }, [project]);

  if (isLoading && !project) {
    return (
      <div className="min-h-screen">
        <PageHeader back={{ to: '/all-projects', label: 'All projects' }} />
        <Skeleton />
      </div>
    );
  }

  if (!project || notFound) {
    return (
      <div className="min-h-screen">
        <PageHeader back={{ to: '/all-projects', label: 'All projects' }} />
        <main className="container-custom py-32">
          <p className="eyebrow mb-4">404</p>
          <h1 className="text-3xl">That project doesn't exist.</h1>
          <Link to="/all-projects" className="mt-6 inline-block text-sm font-medium link-underline">
            See all projects
          </Link>
        </main>
      </div>
    );
  }

  const gallery = projectGallery(project);
  const [cover, ...rest] = gallery;
  const href = projectUrl(project);
  const index = all.findIndex((p) => p.slug === project.slug);
  const next = all.length > 1 && index >= 0 ? all[(index + 1) % all.length] : undefined;

  const facts = [
    project.role && { label: 'Role', value: project.role },
    project.timeline && { label: 'Timeline', value: project.timeline },
    project.tech.length > 0 && { label: 'Stack', value: project.tech.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <PageHeader back={{ to: '/all-projects', label: 'All projects' }} />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <div aria-hidden className="glow pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[600px] opacity-70" />

      <main className="container-custom pb-24">
        <Reveal className="pt-10 md:pt-16">
          <p className="eyebrow flex items-center gap-3 text-foreground">
            <span className="h-px w-8 bg-foreground/50" />
            {[project.category, project.status === 'in-progress' ? 'In progress' : null].filter(Boolean).join(' · ') || 'Case study'}
          </p>
          <h1 className="display mt-7 text-[52px] sm:text-7xl md:text-[96px]">{project.title}</h1>
          {project.headline && (
            <p className="mt-7 max-w-3xl text-2xl font-medium leading-snug tracking-tight text-muted-foreground md:text-[30px]">
              {project.headline}
            </p>
          )}

          <div className="mt-12 grid gap-6 border-t border-border pt-6 sm:grid-cols-2 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className={f.label === 'Stack' ? 'md:col-span-2' : undefined}>
                <p className="eyebrow mb-1.5">{f.label}</p>
                <p className="text-[15px]">{f.value}</p>
              </div>
            ))}
            <div>
              <p className="eyebrow mb-1.5">Links</p>
              {href || project.githubUrl ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 link-underline">
                      Live site <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 link-underline">
                      <Github className="h-3.5 w-3.5" /> Source
                    </a>
                  )}
                </div>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Private — no public demo
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {cover && (
          <Reveal className="mt-14 md:mt-20">
            <Shot shot={cover} title={project.title} priority />
          </Reveal>
        )}

        <div className="mt-16 md:mt-20">
          <Block label="Overview">
            <div className="max-w-2xl space-y-5">
              <p className="text-2xl font-medium leading-snug tracking-tight md:text-[26px]">{project.description}</p>
              {project.overview?.map((p, i) => (
                <p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </Block>

          {project.architecture && project.architecture.length > 0 && (
            <Block label="Engineering">
              <ul className="max-w-2xl space-y-4">
                {project.architecture.map((note, i) => (
                  <li key={i} className="relative pl-5 leading-relaxed text-muted-foreground">
                    <span className="absolute left-0 top-[0.75em] h-px w-2.5 bg-foreground/30" aria-hidden />
                    {note}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {project.capabilities && project.capabilities.length > 0 && (
            <Block label="Capabilities">
              <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {project.capabilities.map((c) => (
                  <div key={c.title}>
                    <dt className="text-lg font-semibold leading-tight tracking-tight">{c.title}</dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{c.description}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {rest.length > 0 && (
            <Block label="Screens">
              <div
                className={cn(
                  'grid gap-12',
                  rest.every((s) => s.orientation === 'mobile') && 'sm:grid-cols-2 lg:grid-cols-3 gap-8',
                )}
              >
                {rest.map((shot) => (
                  <Shot key={shot.url} shot={shot} title={project.title} />
                ))}
              </div>
            </Block>
          )}

          {project.stack && project.stack.length > 0 && (
            <Block label="Stack">
              <dl className="divide-y divide-border border-y border-border">
                {project.stack.map((s) => (
                  <div key={`${s.layer}-${s.name}`} className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[15px] sm:grid-cols-[140px_180px_1fr]">
                    <dt className="font-mono text-[13px] leading-6 text-muted-foreground">{s.layer}</dt>
                    <dd className="font-medium">{s.name}</dd>
                    {s.note && <dd className="col-start-2 text-muted-foreground sm:col-start-auto">{s.note}</dd>}
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {project.builtIn && project.builtIn.length > 0 && (
            <Block label="Built in">
              <div className="flex flex-wrap gap-1.5">
                {project.builtIn.map((b) => (
                  <span key={b} className="chip">{b}</span>
                ))}
              </div>
            </Block>
          )}
        </div>

        {next && next.slug !== project.slug && (
          <Link
            to={`/work/${next.slug}`}
            className="group mt-10 flex items-end justify-between gap-6 border-t border-border pt-8"
          >
            <div>
              <p className="eyebrow mb-4">Next project</p>
              <p className="display text-5xl transition-colors group-hover:text-accent md:text-7xl">{next.title}</p>
            </div>
            <ArrowRight className="mb-3 h-8 w-8 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
          </Link>
        )}
      </main>
      <Footer />
    </div>
  );
}
