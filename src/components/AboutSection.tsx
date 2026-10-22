import { Section, Reveal } from '@/components/Section';
import Spotlight from '@/components/Spotlight';
import { shortCompany, useExperience, useHero, useSkills } from '@/lib/content';
import profileImage from '@/assets/profile.png';

const AboutSection = () => {
  const hero = useHero();
  const { data: skills } = useSkills();
  const { data: experience } = useExperience();
  const [lead, ...paragraphs] = hero.about ?? [];

  const earliest = experience.reduce<number | undefined>((min, e) => {
    const t = new Date(e.startDate).getTime();
    return min === undefined || t < min ? t : min;
  }, undefined);
  const years = earliest ? Math.max(1, Math.floor((Date.now() - earliest) / (365.25 * 24 * 3600 * 1000))) : undefined;
  const current = experience.find((e) => e.isCurrent);
  const companies = new Set(experience.map((e) => e.company)).size;
  const stats = [
    ...(years ? [{ value: `${years}+`, label: 'Years shipping' }] : []),
    ...(companies ? [{ value: String(companies), label: companies === 1 ? 'Company' : 'Companies' }] : []),
    ...hero.stats,
  ].slice(0, 3);

  return (
    <Section
      id="about"
      index="03"
      label="About"
      title={
        <>
          Interfaces, APIs and the <em>data</em> in between
        </>
      }
    >
      {/* Bento grid: story, profile, numbers and the toolbox. */}
      <div className="grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <Spotlight className="h-full p-7 md:p-10">
            {lead && <p className="text-2xl font-medium leading-snug tracking-tight md:text-[28px]">{lead}</p>}
            {paragraphs.length > 0 && (
              <div className="mt-8 space-y-5">
                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </div>
            )}
          </Spotlight>
        </Reveal>

        <div className="grid gap-4 md:col-span-2">
          <Reveal>
            <Spotlight className="flex h-full flex-col items-start justify-between gap-8 p-7">
              <div className="relative">
                <div aria-hidden className="absolute -inset-2 rounded-full bg-gradient-to-br from-accent/50 to-accent-2/40 blur-md" />
                <img src={profileImage} alt={hero.name} className="relative h-20 w-20 rounded-full border border-border bg-card object-cover" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">{hero.name}</p>
                {current && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {current.role} · {shortCompany(current.company)}
                  </p>
                )}
              </div>
            </Spotlight>
          </Reveal>

          {stats.length > 0 && (
            <Reveal delay={0.05}>
              <Spotlight className="grid h-full grid-cols-2 gap-6 p-7">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-gradient text-4xl font-semibold tracking-tight">{s.value}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </Spotlight>
            </Reveal>
          )}
        </div>

        {skills.map((group, i) => (
          <Reveal key={group.id ?? group.category} delay={i * 0.05} className="md:col-span-3">
            <Spotlight className="h-full p-6">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <span className="text-accent">#</span>
                {group.category}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground/85 transition-colors hover:border-accent/50 hover:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default AboutSection;
