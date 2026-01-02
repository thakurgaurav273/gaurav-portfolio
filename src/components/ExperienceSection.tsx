import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Building2, Calendar } from 'lucide-react';

const experiences = [
  {
    company: 'CometChat',
    role: 'Associate Software Developer',
    period: 'Mar 2024 – Present',
    description: [
      'Built features across React, Vue, and Angular UI Kits with enhanced cross-framework compatibility.',
      'Reduced client implementation time by 30-40% through customized component solutions.',
      'Provided expert guidance to accelerate customer product go-live processes.',
    ],
    current: true,
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Timeline line */}
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent hidden md:block" />

              <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:glow-sm transition-shadow duration-300">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                    >
                      <Building2 className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-xl font-display font-bold text-primary">
                          {exp.company}
                        </h3>
                        <p className="text-lg font-medium">{exp.role}</p>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{exp.period}</span>
                        {exp.current && (
                          <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {exp.description.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Looking for opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground">
              Eager to join a team focused on creating meaningful user experiences. With frontend and full-stack background, I'm ready to grow and contribute in backend roles. Driven to learn, build, and make an impact.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceSection;
