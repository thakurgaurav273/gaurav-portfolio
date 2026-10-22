import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminUI';
import { adminLinks } from '@/components/admin/links';
import api from '@/lib/api';

const descriptions: Record<string, string> = {
  '/admin/hero': 'Headline, introduction, section headings, about text, links and stats.',
  '/admin/projects': 'Case studies, screenshots and which projects are featured.',
  '/admin/experience': 'Roles, dates and what you did in each job.',
  '/admin/skills': 'Skill groups shown in the About section.',
};

const useCount = (key: string, path: string) =>
  useQuery({ queryKey: [key], queryFn: async () => (await api.get<unknown[]>(path)).data }).data?.length;

export default function Dashboard() {
  const counts: Record<string, number | undefined> = {
    '/admin/projects': useCount('admin-projects', '/content/projects'),
    '/admin/experience': useCount('admin-experience', '/content/experience'),
    '/admin/skills': useCount('admin-skills', '/content/skills'),
  };

  return (
    <div>
      <PageHeader title="Overview" description="Pick what you want to edit. Everything here updates the live site when you save." />
      <ul className="panel divide-y divide-border">
        {adminLinks
          .filter((l) => descriptions[l.path])
          .map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/50">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-background">
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium">
                    {link.name}
                    {counts[link.path] !== undefined && (
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{counts[link.path]}</span>
                    )}
                  </span>
                  <span className="block text-sm text-muted-foreground">{descriptions[link.path]}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
