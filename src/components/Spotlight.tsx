import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Card whose glow and border follow the cursor (styles live in .spot-card).
const Spotlight = ({ className, onMouseMove, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={cn('spot-card', className)}
    onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
      onMouseMove?.(e);
    }}
  />
);

export default Spotlight;
