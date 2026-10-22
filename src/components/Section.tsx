import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// Fades content up once as it enters the viewport.
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

interface SectionProps {
  id: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}

// Shared section shell: a mono `// 01 · label` tag, a large headline and an optional intro.
export const Section = ({ id, index, label, title, intro, children }: SectionProps) => (
  <section id={id} className="section">
    <div className="container-custom">
      <Reveal className="mb-14 md:mb-20">
        <p className="flex items-center gap-3 font-mono text-[13px] text-muted-foreground">
          <span className="text-accent">//</span>
          <span>{index}</span>
          <span className="h-px w-10 bg-border" />
          <span className="uppercase tracking-[0.14em]">{label}</span>
        </p>
        <h2 className="display mt-5 max-w-3xl text-[40px] sm:text-5xl md:text-6xl">{title}</h2>
        {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
      </Reveal>
      {children}
    </div>
  </section>
);
