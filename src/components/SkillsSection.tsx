import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Code2, Server, Smartphone, Database, Wrench } from 'lucide-react';

const getIconSlug = (name: string) => {
  const customMapping: Record<string, string> = {
    'react.js': 'react',
    'next.js': 'nextdotjs',
    'node.js': 'nodedotjs',
    'express.js': 'express',
    'nestjs': 'nestjs',
    'angular 17+ (signals, rxjs)': 'angular',
    'angular 17+': 'angular',
    'angular': 'angular',
    'vue': 'vuedotjs',
    'aws': 'amazonaws',
    'aws (ec2, s3)': 'amazonaws',
    'socket.io': 'socketdotio',
    'tailwind css': 'tailwindcss',
    'react native': 'react',
    'redux toolkit': 'redux',
    'context api': 'react',
    'rest apis': 'json',
    'microservices': 'docker',
  };
  
  const normalized = name.toLowerCase().trim();
  if (customMapping[normalized]) return customMapping[normalized];
  
  return normalized.replace(/[^a-z0-9]/g, '');
};

const getCategoryIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('front')) return <Code2 className="w-5 h-5 text-primary" />;
  if (t.includes('back')) return <Server className="w-5 h-5 text-primary" />;
  if (t.includes('mobile')) return <Smartphone className="w-5 h-5 text-primary" />;
  if (t.includes('data')) return <Database className="w-5 h-5 text-primary" />;
  return <Wrench className="w-5 h-5 text-primary" />;
};

const SkillPill = ({ name, delay }: { name: string; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const slug = getIconSlug(name);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: delay * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-2.5 px-4 py-2.5 bg-secondary/80 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-md"
    >
      <img 
        src={`https://cdn.simpleicons.org/${slug}`} 
        alt={name} 
        className="w-5 h-5 opacity-60 transition-all duration-300 brightness-0 dark:invert group-hover:brightness-100 group-hover:opacity-100 dark:group-hover:invert-0"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden w-2 h-2 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
      <span className="font-medium text-sm text-foreground">{name}</span>
    </motion.div>
  );
};

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { data: skills } = useQuery({
    queryKey: ['public-skills'],
    queryFn: async () => (await api.get('/content/skills')).data,
    retry: false
  });

  const { data: hero } = useQuery({
    queryKey: ['public-hero'],
    queryFn: async () => (await api.get('/content/hero')).data,
    retry: false
  });


  const displaySkills = skills && skills.length > 0 ? skills : [
    { category: 'Frontend', items: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
    { category: 'Backend', items: ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB'] },
  ];

  return (
    <section id="skills" className="section-padding bg-section-alt relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-custom relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 backdrop-blur-sm border border-primary/20"
          >
            My Arsenal
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The core technologies and tools I use to build scalable applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {displaySkills.map((category: any, categoryIndex: number) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              whileHover={{ y: -3 }}
              className="relative group"
            >
              <div className="relative glass-card rounded-2xl p-6 md:p-8 h-full backdrop-blur-xl border border-border/50 group-hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    {getCategoryIcon(category.category)}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground">{category.category}</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {category.items.map((skill: string, skillIndex: number) => (
                    <SkillPill
                      key={skill}
                      name={skill}
                      delay={categoryIndex * 2 + skillIndex}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-2xl rounded-[2rem]" />
          <div className="relative glass-card rounded-[2rem] p-8 md:p-12 border border-primary/20 backdrop-blur-xl bg-background/40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-x-0 md:divide-x divide-border/50">
              {(hero?.stats && hero.stats.length > 0 ? hero.stats : [
                { value: '2+', label: 'Years Experience' },
                { value: '10+', label: 'Projects Completed' },
                { value: '3', label: 'UI Kits Built' },
                { value: '100%', label: 'Client Satisfaction' },
              ]).map((stat: any, index: number) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`text-center flex flex-col items-center justify-center px-4 ${
                    index % 2 !== 0 ? 'border-l border-border/50 md:border-none' : ''
                  }`}
                >
                  <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3 hover:text-primary transition-colors cursor-default">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
