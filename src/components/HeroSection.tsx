import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/Section';
import Emphasis from '@/components/Emphasis';
import { openCommandMenu, scrollToSection } from '@/lib/nav';
import { shortCompany, useExperience, useHero, useSkills } from '@/lib/content';
import { socialIcon } from '@/lib/social';

const Str = ({ children }: { children: string }) => <span className="text-accent">"{children}"</span>;

// Editor-style card that renders the profile as a small TypeScript object.
const ProfileCard = ({ name, role, company, previously, stack }: Record<string, string | string[] | undefined>) => (
  <div className="frame relative font-mono text-[13px] leading-[1.8] md:text-sm">
    <div className="flex h-10 items-center gap-1.5 border-b border-border bg-secondary/50 px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
      <span className="ml-3 text-[11px] text-muted-foreground">~/gaurav/profile.ts</span>
    </div>
    <pre className="overflow-x-auto p-5 md:p-6">
      <code>
        <span className="text-[#c084fc]">const</span> <span className="text-accent-2">engineer</span> = {'{'}
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
        {'\n'}  shipping: <span className="text-[#fbbf24]">true</span>,
        {'\n'}
        {'}'};
        {'\n\n'}
        <span className="text-muted-foreground">$</span> npm run build<span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
      </code>
    </pre>
  </div>
);

const HeroSection = () => {
  const hero = useHero();
  const { data: experience } = useExperience();
  const { data: skills } = useSkills();

  const current = experience.find((e) => e.isCurrent);
  const previous = experience.find((e) => !e.isCurrent && e.company !== current?.company);
  const elsewhere = hero.socialLinks.filter((l) => !l.url.startsWith('mailto:'));
  const tech = skills.flatMap((g) => g.items);

  return (
    <section id="home" className="relative overflow-hidden pt-32 md:pt-44">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="glow pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[700px]" />

      <div className="container-custom">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-1.5 pl-3 pr-4 text-[13px] text-muted-foreground backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {current ? (
                  <>
                    {current.role} <span className="text-foreground/40">@</span>
                    <span className="text-foreground">{shortCompany(current.company)}</span>
                  </>
                ) : (
                  'Open to new opportunities'
                )}
              </span>

              <p className="mt-8 font-mono text-sm text-muted-foreground">
                <span className="text-accent">&gt;</span> Hi, I'm {hero.name.split(' ')[0]} 👋
              </p>
              <h1 className="display mt-3 text-[36px] sm:text-6xl lg:text-[68px]">
                <Emphasis text={hero.subtitle} />
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">{hero.description}</p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
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
                        className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={openCommandMenu}
                className="mt-8 hidden items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Press <span className="kbd">⌘</span>
                <span className="kbd">K</span> to jump anywhere
              </button>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="min-w-0 lg:col-span-5">
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" />
              <ProfileCard
                name={hero.name}
                role={current?.role}
                company={shortCompany(current?.company)}
                previously={shortCompany(previous?.company)}
                stack={tech.slice(0, 3)}
              />
            </div>
          </Reveal>
        </div>
      </div>

      {tech.length > 0 && (
        <div className="relative mt-20 border-y border-border bg-card/40 py-5 md:mt-28 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
            {[...tech, ...tech].map((t, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-sm text-muted-foreground">
                {t}
                <span className="text-accent/60">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
