import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Plain bordered surface used for cards across the site (styles live in .panel).
const Panel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props} className={cn('panel', className)} />;

export default Panel;
