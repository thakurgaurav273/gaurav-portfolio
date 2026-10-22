import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/AdminUI';
import { optimizeImage, projectCover, type Project } from '@/lib/content';
import api from '@/lib/api';

type Row = Project & { id: string };

export default function ManageProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get<Row[]>('/content/projects')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/content/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['public-projects'] });
      toast.success('Project deleted');
    },
    onError: () => toast.error("Couldn't delete the project"),
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Featured projects appear large on the homepage; the rest show as smaller cards and in the archive."
        actions={
          <Button asChild>
            <Link to="/admin/projects/new">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="panel p-6 text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="panel divide-y divide-border">
          {projects.map((p) => {
            const cover = projectCover(p);
            return (
              <li key={p.id} className="flex items-center gap-4 px-4 py-3">
                <Link to={`/admin/projects/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                  {cover ? (
                    <img src={optimizeImage(cover, 240)} alt="" className="h-12 w-20 shrink-0 rounded-md border border-border bg-muted object-cover object-top" />
                  ) : (
                    <span className="h-12 w-20 shrink-0 rounded-md border border-border bg-muted" />
                  )}
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium group-hover:underline">{p.title}</span>
                      {p.featured && <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">Featured</span>}
                      {p.status === 'in-progress' && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">In progress</span>}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{p.category || p.tagline || p.description}</span>
                  </span>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${p.title}`}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {p.title}?</AlertDialogTitle>
                      <AlertDialogDescription>This removes the project and its case study from the site. It can't be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
