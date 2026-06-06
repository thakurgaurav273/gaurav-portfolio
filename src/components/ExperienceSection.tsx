import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Building2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const experiences = [
  {
    company: 'CometChat',
    role: 'Associate Software Developer',
    startDate: '2024-03-01T00:00:00.000Z',
    isCurrent: true,
    description: [
      'Built features across React, Vue, and Angular UI Kits with enhanced cross-framework compatibility.',
      'Reduced client implementation time by 30-40% through customized component solutions.',
      'Provided expert guidance to accelerate customer product go-live processes.',
    ],
  },
];

const formatPeriod = (start: string, end: string, isCurrent: boolean) => {
  if (!start) return '';
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  const e = isCurrent ? 'Present' : (end ? new Date(end).toLocaleDateString('en-US', opts) : '');
  return `${s} – ${e}`;
};

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { data: dynamicExperience } = useQuery({
    queryKey: ['public-experience'],
    queryFn: async () => (await api.get('/content/experience')).data,
    retry: false
  });

  const displayExperience = (dynamicExperience && dynamicExperience.length > 0 ? dynamicExperience : experiences)
    .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <section id="experience" className="section-padding">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Work <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            My professional journey building impactful applications and solving complex challenges
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Main vertical timeline line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          <div className="space-y-12">
            {displayExperience.map((exp: any, index: number) => (
              <motion.div
                key={exp._id || index}
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative pl-24 md:pl-32"
              >
                {/* Timeline Node Icon */}
                <div className="absolute left-8 md:left-12 top-6 -translate-x-1/2 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] z-10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>

                {/* Content Card */}
                <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden group border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.2)] bg-background/40 backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-xl font-medium text-muted-foreground mt-1">{exp.company}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground shrink-0 mt-1 md:mt-0">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                      </div>
                      {exp.isCurrent && (
                        <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                          Current
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {exp.description.map((item: string, i: number) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-xl rounded-full" />
          <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden border border-primary/20 bg-background/50 backdrop-blur-xl group hover:border-primary/50 transition-colors duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              I love building products that people actually want to use. While my background is heavily rooted in <span className="text-primary font-semibold">frontend and full-stack development</span>, I'm currently looking for opportunities where I can tackle complex <span className="text-accent font-semibold">backend challenges</span> and continue growing as an engineer.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceSection;
