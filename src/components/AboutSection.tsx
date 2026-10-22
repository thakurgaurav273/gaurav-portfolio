import { Section, Reveal } from '@/components/Section';
import Panel from '@/components/Panel';
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
    <Section id="about" index="03">
      {/* Bento grid: story, profile, numbers and the toolbox. */}
      <div className="grid gap-3 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <Panel className="h-full p-6">
            {lead && <p className="text-lg font-medium leading-snug tracking-tight">{lead}</p>}
            {paragraphs.length > 0 && (
              <div className="mt-4 space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </div>
            )}
          </Panel>
        </Reveal>

        <div className="grid gap-3 md:col-span-2">
          <Reveal>
            <Panel className="flex h-full flex-col items-start justify-between gap-5 p-6">
              <div className="relative">
                <img src={profileImage} alt={hero.name} className="relative h-14 w-14 rounded-full border border-border bg-card object-cover" />
              </div>
              <div>
                <p className="font-semibold tracking-tight">{hero.name}</p>
                {current && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {current.role} · {shortCompany(current.company)}
                  </p>
                )}
              </div>
            </Panel>
          </Reveal>

          {stats.length > 0 && (
            <Reveal delay={0.05}>
              <Panel className="grid h-full grid-cols-2 gap-5 p-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </Panel>
            </Reveal>
          )}
        </div>

        {skills.map((group, i) => (
          <Reveal key={group.id ?? group.category} delay={i * 0.05} className="md:col-span-3">
            <Panel className="h-full p-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {group.category}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-[13px] text-foreground/85 transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default AboutSection;
