import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const skillCategories = [
  {
    title: 'Frontend',
    color: 'from-blue-500 to-cyan-400',
    skills: [
      { name: 'React', level: 95 },
      { name: 'Angular', level: 90 },
      { name: 'Vue', level: 85 },
      { name: 'TypeScript', level: 92 },
    ],
    featured: true,
  },
  {
    title: 'Backend',
    color: 'from-green-500 to-emerald-400',
    skills: [
      { name: 'Node.js', level: 88 },
      { name: 'NestJS', level: 85 },
      { name: 'Express', level: 90 },
    ],
  },
  {
    title: 'Mobile',
    color: 'from-purple-500 to-pink-400',
    skills: [
      { name: 'Ionic', level: 92 },
      { name: 'Capacitor', level: 90 },
      { name: 'React Native', level: 75 },
    ],
  },
  {
    title: 'Database',
    color: 'from-orange-500 to-amber-400',
    skills: [
      { name: 'MongoDB', level: 88 },
      { name: 'PostgreSQL', level: 82 },
      { name: 'Redis', level: 70 },
    ],
  },
];

const tools = [
  { name: 'Git', icon: '📦' },
  { name: 'Docker', icon: '🐳' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Figma', icon: '🎨' },
  { name: 'VS Code', icon: '💻' },
  { name: 'Postman', icon: '📮' },
];

const SkillBar = ({ name, level, delay, gradientClass }: { name: string; level: number; delay: number; gradientClass: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs font-semibold text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: delay * 0.1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${gradientClass} rounded-full relative`}
        />
      </div>
    </div>
  );
};

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="skills" className="section-padding bg-section-alt relative overflow-hidden">
      {/* Background decoration */}
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
            Skills <span className="text-primary">& Expertise</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Technologies I've mastered to build exceptional digital experiences
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {skillCategories.map((category, categoryIndex) => {
            // Determine progress bar gradient - use purple/pink for most, green for Backend
            const progressGradient = category.title === 'Backend' 
              ? 'from-green-500 to-emerald-500' 
              : 'from-purple-500 to-pink-500';
            
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                whileHover={{ y: -3 }}
                className="relative group"
              >
                {/* Card with enhanced styling */}
                <div className="relative glass-card rounded-2xl p-6 h-full backdrop-blur-xl border border-border/50 group-hover:border-border transition-all duration-300">
                  {/* Category header with enhanced dot */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground">{category.title}</h3>
                  </div>

                  {/* Skills with progress bars */}
                  <div className="space-y-5">
                    {category.skills.map((skill, skillIndex) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={categoryIndex * 2 + skillIndex}
                        gradientClass={progressGradient}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tools & Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-2xl p-8 border border-border/50"
        >
          <h3 className="text-xl font-display font-bold mb-6 text-center text-foreground">
            Tools & Technologies
          </h3>
          
          <div className="flex flex-wrap justify-center gap-4">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="group"
              >
                <div className="flex items-center gap-2 px-5 py-3 bg-secondary/80 backdrop-blur-sm rounded-xl border border-border/50 group-hover:border-border transition-all duration-300">
                  <span className="text-xl">{tool.icon}</span>
                  <span className="font-medium text-sm text-foreground">{tool.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { value: '2+', label: 'Years Experience' },
            { value: '10+', label: 'Projects Completed' },
            { value: '3', label: 'UI Kits Built' },
            { value: '100%', label: 'Client Satisfaction' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 backdrop-blur-sm hover:border-border transition-all duration-300 cursor-default"
            >
              <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
