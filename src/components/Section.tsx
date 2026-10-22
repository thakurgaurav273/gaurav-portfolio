import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Fades content up once as it enters the viewport.
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
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
  tone?: 'tint';
  children: ReactNode;
}

// Shared section shell: a small mono label, a headline, an optional intro and a background tone.
export const Section = ({ id, index, label, title, intro, tone, children }: SectionProps) => (
  <section id={id} className={cn('section', tone && `tone-${tone}`)}>
    <div className="container-custom">
      <Reveal className="mb-8 md:mb-10">
        <p className="font-mono text-xs text-muted-foreground">
          {index} / {label}
        </p>
        <h2 className="display mt-3 max-w-2xl text-[28px] md:text-[34px]">{title}</h2>
        {intro && <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{intro}</p>}
      </Reveal>
      {children}
    </div>
  </section>
);
