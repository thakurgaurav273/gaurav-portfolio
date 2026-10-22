import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Shared building blocks so every admin page has the same header and grouped panels.
export const PageHeader = ({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions}
  </div>
);

export const FormSection = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('panel p-5 md:p-6', className)}>
    <div className="mb-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

export const Hint = ({ children }: { children: ReactNode }) => <p className="text-xs text-muted-foreground">{children}</p>;
