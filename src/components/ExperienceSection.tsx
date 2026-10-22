import { Section, Reveal } from '@/components/Section';
import Panel from '@/components/Panel';
import { formatPeriod, useExperience, type Experience } from '@/lib/content';

// Consecutive roles at the same company are shown together so promotions read as one progression.
const groupByCompany = (roles: Experience[]) =>
  roles.reduce<{ company: string; roles: Experience[] }[]>((groups, role) => {
    const last = groups[groups.length - 1];
    if (last && last.company === role.company) last.roles.push(role);
    else groups.push({ company: role.company, roles: [role] });
    return groups;
  }, []);

const ExperienceSection = () => {
  const { data } = useExperience();
  const sorted = [...data].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const groups = groupByCompany(sorted);

  return (
    <Section id="experience" index="02" tone="tint">
      {/* Timeline: a vertical rail with a node per company; the current one is filled. */}
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border ">
        {groups.map((group, i) => {
          const first = group.roles[group.roles.length - 1];
          const latest = group.roles[0];
          return (
            <li key={`${group.company}-${first.startDate}`} className="relative pl-8 md:pl-10">
              <span className="absolute left-0 top-6 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-border bg-background">
                <span className={latest.isCurrent ? 'h-[7px] w-[7px] rounded-full bg-foreground' : 'h-[5px] w-[5px] rounded-full bg-muted-foreground'} />
              </span>

              <Reveal delay={i * 0.05}>
                <Panel className="p-5 md:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="text-lg font-semibold tracking-tight md:text-xl">{group.company}</h3>
                    <p className="font-mono text-[13px] text-muted-foreground">
                      {formatPeriod(first.startDate, latest.endDate, latest.isCurrent)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-6">
                    {group.roles.map((role) => (
                      <div key={role.id ?? role.startDate}>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium">{role.role}</span>
                          {group.roles.length > 1 && (
                            <span className="font-mono text-[12px] text-muted-foreground">
                              {formatPeriod(role.startDate, role.endDate, role.isCurrent)}
                            </span>
                          )}
                          {role.location && <span className="font-mono text-[12px] text-muted-foreground">· {role.location}</span>}
                        </p>

                        {role.description.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {role.description.map((item, j) => (
                              <li key={j} className="relative pl-5 text-[15px] leading-relaxed text-muted-foreground">
                                <span className="absolute left-0 top-0 font-mono text-muted-foreground/60" aria-hidden>
                                  ›
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {role.tech && role.tech.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-1.5">
                            {role.tech.map((t) => (
                              <li key={t} className="chip">{t}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
};

export default ExperienceSection;
