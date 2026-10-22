import { useMemo, useState } from 'react';
import { Reveal } from '@/components/Section';
import { ProjectTile } from '@/components/ProjectCard';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { useProjects } from '@/lib/content';

const ALL = 'All';

export default function AllProjects() {
  const { data: projects, isLoading } = useProjects();
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[]))],
    [projects],
  );
  const shown = category === ALL ? projects : projects.filter((p) => p.category === category);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <PageHeader back={{ to: '/', label: 'Home' }} />
      <main className="container-custom pb-24">
        <Reveal className="max-w-3xl pt-10 md:pt-16">
          <p className="eyebrow flex items-center gap-3 text-foreground">
            <span className="h-px w-8 bg-foreground/50" />
            Archive
          </p>
          <h1 className="display mt-4 text-[32px] md:text-[44px]">
            Everything I've <em>built</em>
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Business platforms, developer tooling and client sites. Each one opens to a write-up of the problem, the
            workflows and how it's put together.
          </p>
        </Reveal>

        {categories.length > 2 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  category === c
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[16/12] animate-pulse rounded-2xl bg-card" />)
            : shown.map((project) => <ProjectTile key={project.slug} project={project} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
