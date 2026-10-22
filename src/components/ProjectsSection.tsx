import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { FeaturedProject, ProjectRow } from '@/components/ProjectCard';
import { useProjects } from '@/lib/content';

const ProjectsSection = () => {
  const { data } = useProjects();
  const featured = data.filter((p) => p.featured);
  const rest = data.filter((p) => !p.featured);

  return (
    <Section id="projects" index="01">
      <div className="space-y-4">
        {featured.map((project, i) => (
          <Reveal key={project.slug}>
            <FeaturedProject project={project} index={i + 1} />
          </Reveal>
        ))}
      </div>

      {rest.length > 0 && (
        <Reveal className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">More projects</h3>
            <Link to="/all-projects" className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse the archive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project, i) => (
              <ProjectRow key={project.slug} project={project} index={featured.length + i + 1} />
            ))}
          </ul>
        </Reveal>
      )}
    </Section>
  );
};

export default ProjectsSection;
