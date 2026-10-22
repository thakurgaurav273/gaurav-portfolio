import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/Section';
import Emphasis from '@/components/Emphasis';
import { BrowserFrame } from '@/components/ProjectCard';
import { cn } from '@/lib/utils';
import { scrollToSection } from '@/lib/nav';
import { projectCover, shortCompany, useExperience, useHero, useProjects, useSkills, type Project } from '@/lib/content';
import { socialIcon } from '@/lib/social';
import profileImage from '@/assets/profile.png';

const Str = ({ children }: { children: string }) => <span className="text-[#0a3069]">"{children}"</span>;

// Editor-style card that renders the profile as a small TypeScript object.
const ProfileCard = ({ name, role, company, previously, stack }: Record<string, string | string[] | undefined>) => (
  <div className="frame relative font-mono text-[13px] leading-[1.75]">
    <div className="flex h-10 items-center gap-1.5 border-b border-border bg-secondary/60 px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
      <span className="ml-3 text-[11px] text-muted-foreground">~/gaurav/profile.ts</span>
    </div>
    <pre className="overflow-x-auto p-5">
      <code>
        <span className="text-[#cf222e]">const</span> <span className="text-[#8250df]">engineer</span> = {'{'}
        {'\n'}  name: <Str>{String(name)}</Str>,
        {role && <>{'\n'}  role: <Str>{String(role)}</Str>,</>}
        {company && <>{'\n'}  company: <Str>{String(company)}</Str>,</>}
        {previously && <>{'\n'}  previously: <Str>{String(previously)}</Str>,</>}
        {Array.isArray(stack) && stack.length > 0 && (
          <>
            {'\n'}  stack: [
            {stack.map((s, i) => (
              <span key={s}>
                <Str>{s}</Str>
                {i < stack.length - 1 && ', '}
              </span>
            ))}
            ],
          </>
        )}
        {'\n'}  shipping: <span className="text-[#0550ae]">true</span>,
        {'\n'}
        {'}'};
        {'\n\n'}
        <span className="text-muted-foreground">$</span> npm run build<span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-foreground/70" />
      </code>
    </pre>
  </div>
);

// Two featured projects' screenshots, overlapped, each opening its case study.
const Showcase = ({ projects }: { projects: Project[] }) => (
  <div className="relative flex flex-col">
    {projects[1] && (
      <Link
        to={`/work/${projects[1].slug}`}
        aria-label={`${projects[1].title} case study`}
        className="group absolute right-0 top-0 block w-[78%] transition-transform duration-500 hover:-translate-y-1"
      >
        <BrowserFrame src={projectCover(projects[1])} alt={projects[1].title} label={projects[1].title} width={1000} priority />
      </Link>
    )}
    <Link
      to={`/work/${projects[0].slug}`}
      aria-label={`${projects[0].title} case study`}
      className={cn(
        'group relative block transition-transform duration-500 hover:-translate-y-1',
        projects[1] ? 'mt-[20%] w-[78%] shadow-[0_30px_60px_-30px_rgba(20,22,26,0.45)]' : 'w-full',
      )}
    >
      <BrowserFrame src={projectCover(projects[0])} alt={projects[0].title} label={projects[0].title} width={1000} priority />
    </Link>
  </div>
);

const HeroSection = () => {
  const hero = useHero();
  const { data: experience } = useExperience();
  const { data: skills } = useSkills();
  const { data: projects } = useProjects();

  const current = experience.find((e) => e.isCurrent);
  const previous = experience.find((e) => !e.isCurrent && e.company !== current?.company);
  const elsewhere = hero.socialLinks.filter((l) => !l.url.startsWith('mailto:'));
  const tech = skills.flatMap((g) => g.items);
  const showcase = projects.filter((p) => p.featured && projectCover(p)).slice(0, 2);

  const facts = [
    current && { label: 'Currently', value: current.role, sub: shortCompany(current.company) },
    previous && { label: 'Previously', value: previous.role, sub: shortCompany(previous.company) },
    tech.length > 0 && { label: 'Works in', value: tech.slice(0, 3).join(', '), sub: tech.slice(3, 6).join(', ') },
  ].filter(Boolean) as { label: string; value: string; sub?: string }[];

  return (
    <section id="home" className="tone-tint border-b border-border pt-24 md:pt-28">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-center gap-12 py-10 md:py-14 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <img src={profileImage} alt="" className="h-11 w-11 rounded-full border border-border bg-card object-cover" />
                <p className="text-[15px] leading-tight">
                  <span className="font-semibold">{hero.name}</span>
                  {current && (
                    <span className="block text-sm text-muted-foreground">
                      {current.role} at {shortCompany(current.company)}
                    </span>
                  )}
                </p>
              </div>
              <h1 className="display mt-7 text-[36px] sm:text-[44px] lg:text-[52px]">
                <Emphasis text={hero.subtitle} />
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">{hero.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <button onClick={() => scrollToSection('projects')} className="btn-primary">
                  View my work <ArrowDown className="h-4 w-4" />
                </button>
                {hero.resumeUrl ? (
                  <a href={hero.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    Resume <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button onClick={() => scrollToSection('contact')} className="btn-ghost">
                    Get in touch
                  </button>
                )}
                <div className="ml-1 flex items-center gap-1">
                  {elsewhere.map((l) => {
                    const Icon = socialIcon(l.platform);
                    return (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={l.platform}
                        className="grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="min-w-0 lg:col-span-6">
            {showcase.length > 0 ? (
              <Showcase projects={showcase} />
            ) : (
              <ProfileCard
                name={hero.name}
                role={current?.role}
                company={shortCompany(current?.company)}
                previously={shortCompany(previous?.company)}
                stack={tech.slice(0, 3)}
              />
            )}
          </Reveal>
        </div>

        {facts.length > 0 && (
          <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
            {facts.map((f, i) => (
              <div key={f.label} className={cn('py-5 sm:px-6', i === 0 ? 'sm:pl-0' : 'border-t border-border sm:border-l sm:border-t-0')}>
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-2 text-[15px] font-medium">{f.value}</dd>
                {f.sub && <dd className="text-sm text-muted-foreground">{f.sub}</dd>}
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
