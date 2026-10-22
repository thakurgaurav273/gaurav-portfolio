import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormSection, Hint, PageHeader } from '@/components/admin/AdminUI';
import { optimizeImage, type Capability, type Project, type Screenshot, type StackItem } from '@/lib/content';
import api from '@/lib/api';

type Form = {
  title: string;
  category: string;
  status: 'live' | 'in-progress';
  featured: boolean;
  order: number;
  tagline: string;
  description: string;
  headline: string;
  subheadline: string;
  role: string;
  timeline: string;
  liveUrl: string;
  githubUrl: string;
  overview: string;
  architecture: string;
  tech: string;
  builtIn: string;
  features: string;
  capabilities: Capability[];
  stack: StackItem[];
  screenshots: Screenshot[];
};

const list = (v?: string[]) => (v ?? []).join(', ');
const toForm = (p?: Partial<Project> & { order?: number }): Form => ({
  title: p?.title ?? '',
  category: p?.category ?? '',
  status: p?.status === 'in-progress' ? 'in-progress' : 'live',
  featured: Boolean(p?.featured),
  order: p?.order ?? 0,
  tagline: p?.tagline ?? '',
  description: p?.description ?? '',
  headline: p?.headline ?? '',
  subheadline: p?.subheadline ?? '',
  role: p?.role ?? '',
  timeline: p?.timeline ?? '',
  liveUrl: p?.liveUrl || p?.link || '',
  githubUrl: p?.githubUrl ?? '',
  overview: (p?.overview ?? []).join('\n\n'),
  architecture: (p?.architecture ?? []).join('\n'),
  tech: list(p?.tech),
  builtIn: list(p?.builtIn),
  features: list(p?.features),
  capabilities: p?.capabilities ?? [],
  stack: p?.stack ?? [],
  screenshots: p?.screenshots ?? [],
});

const split = (v: string, by: RegExp) => v.split(by).map((s) => s.trim()).filter(Boolean);

const toPayload = (f: Form) => ({
  ...f,
  overview: split(f.overview, /\n\s*\n/),
  architecture: split(f.architecture, /\n/),
  tech: split(f.tech, /,/),
  builtIn: split(f.builtIn, /,/),
  features: split(f.features, /,/),
  capabilities: f.capabilities.filter((c) => c.title.trim() && c.description.trim()),
  stack: f.stack.filter((s) => s.layer.trim() && s.name.trim()),
  screenshots: f.screenshots.filter((s) => s.url.trim()).map((s) => ({ ...s, alt: s.alt || s.label || f.title })),
});

const Field = ({ id, label, hint, className, children }: { id?: string; label: string; hint?: ReactNode; className?: string; children: ReactNode }) => (
  <div className={`space-y-1.5 ${className ?? ''}`}>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <Hint>{hint}</Hint>}
  </div>
);

// Small up/down/remove controls for a row in a repeatable list.
const RowActions = ({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void }) => (
  <div className="flex shrink-0 items-center">
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}>
      <ArrowUp className="h-3.5 w-3.5" />
    </Button>
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Move down" disabled={index === length - 1} onClick={() => onMove(index + 1)}>
      <ArrowDown className="h-3.5 w-3.5" />
    </Button>
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove" onClick={onRemove}>
      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  </div>
);

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Form | null>(isNew ? toForm() : null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: async () => (await api.get<Project & { order?: number }>(`/content/projects/${id}`)).data,
    enabled: !isNew,
  });

  useEffect(() => {
    if (project) setForm(toForm(project));
  }, [project]);

  const saved = useMemo(() => JSON.stringify(toForm(isNew ? undefined : project)), [isNew, project]);
  const dirty = form !== null && JSON.stringify(form) !== saved;

  const mutation = useMutation({
    mutationFn: async (f: Form) =>
      isNew ? (await api.post<Project & { id: string }>('/content/projects', toPayload(f))).data : (await api.put(`/content/projects/${id}`, toPayload(f))).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-project', id] });
      queryClient.invalidateQueries({ queryKey: ['public-projects'] });
      queryClient.invalidateQueries({ queryKey: ['public-project'] });
      toast.success(isNew ? 'Project created' : 'Project saved');
      if (isNew) navigate(`/admin/projects/${data.id}`, { replace: true });
    },
    onError: (error) => {
      const details = isAxiosError(error) ? error.response?.data?.details : undefined;
      const first = details && Object.entries(details)[0];
      toast.error(first ? `${first[0]}: ${(first[1] as string[])[0]}` : "Couldn't save the project.");
    },
  });

  if (!isNew && isError) return <p className="text-sm text-muted-foreground">That project couldn't be loaded.</p>;
  if ((!isNew && isLoading) || !form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });
  const text = (key: keyof Form) => ({
    id: key,
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never),
  });

  type ListKey = 'capabilities' | 'stack' | 'screenshots';
  const updateRow = <K extends ListKey>(key: K, i: number, patch: Partial<Form[K][number]>) =>
    set(key, form[key].map((row, idx) => (idx === i ? { ...row, ...patch } : row)) as Form[K]);
  const removeRow = (key: ListKey, i: number) => set(key, form[key].filter((_, idx) => idx !== i) as never);
  const moveRow = (key: ListKey, from: number, to: number) => {
    const rows = [...form[key]] as unknown[];
    const [row] = rows.splice(from, 1);
    rows.splice(to, 0, row);
    set(key, rows as never);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: Screenshot[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append('image', file);
      try {
        const { data } = await api.post<{ url: string }>('/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
        added.push({ url: data.url, alt: '', label: '', caption: '', orientation: 'desktop' });
      } catch {
        toast.error(`Couldn't upload ${file.name}`);
      }
    }
    setUploading(false);
    if (added.length) setForm((f) => (f ? { ...f, screenshots: [...f.screenshots, ...added] } : f));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="pb-24"
    >
      <Link to="/admin/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <PageHeader
        title={isNew ? 'New project' : form.title || 'Untitled project'}
        description={isNew ? 'Fill in at least a title and summary. Everything else can come later.' : 'Changes go live as soon as you save.'}
        actions={
          project?.slug && (
            <a href={`/work/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View case study <ArrowUpRight className="h-4 w-4" />
            </a>
          )
        }
      />

      <div className="space-y-5">
        <FormSection title="Card" description="What visitors see in the project lists.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="title" label="Title">
              <Input {...text('title')} required />
            </Field>
            <Field id="category" label="Category" hint="e.g. Construction, Healthcare. Used for the archive filter.">
              <Input {...text('category')} />
            </Field>
          </div>
          <Field id="tagline" label="One-line tagline" hint="Shown on the smaller cards. Falls back to the summary.">
            <Input {...text('tagline')} />
          </Field>
          <Field id="description" label="Summary" hint="Shown on featured cards and at the top of the case study.">
            <Textarea {...text('description')} rows={3} required />
          </Field>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => set('featured', v)} />
              Featured on the homepage
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={form.status === 'in-progress'} onCheckedChange={(v) => set('status', v ? 'in-progress' : 'live')} />
              Still in progress
            </label>
            <label className="flex items-center gap-2 text-sm">
              Order
              <Input type="number" value={form.order} onChange={(e) => set('order', Number(e.target.value) || 0)} className="h-8 w-20" />
            </label>
          </div>
        </FormSection>

        <FormSection title="Case study header" description="The top of the project page.">
          <Field id="headline" label="Headline">
            <Textarea {...text('headline')} rows={2} />
          </Field>
          <Field id="subheadline" label="Subheadline">
            <Textarea {...text('subheadline')} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="role" label="Your role">
              <Input {...text('role')} placeholder="Full-stack developer" />
            </Field>
            <Field id="timeline" label="Timeline">
              <Input {...text('timeline')} placeholder="2025" />
            </Field>
            <Field id="liveUrl" label="Live site" hint="Leave empty for private projects.">
              <Input {...text('liveUrl')} type="url" placeholder="https://" />
            </Field>
            <Field id="githubUrl" label="Source code">
              <Input {...text('githubUrl')} type="url" placeholder="https://github.com/…" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Screenshots" description="The first one is the cover image everywhere on the site.">
          {form.screenshots.map((shot, i) => (
            <div key={`${shot.url}-${i}`} className="flex gap-4 rounded-lg border border-border p-3">
              <img src={optimizeImage(shot.url, 320)} alt="" className="h-20 w-32 shrink-0 rounded-md border border-border bg-muted object-cover object-top" />
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <Input aria-label="Label" placeholder="Label, e.g. Dashboard" value={shot.label ?? ''} onChange={(e) => updateRow('screenshots', i, { label: e.target.value })} />
                <select
                  aria-label="Orientation"
                  value={shot.orientation ?? 'desktop'}
                  onChange={(e) => updateRow('screenshots', i, { orientation: e.target.value as Screenshot['orientation'] })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="desktop">Desktop screenshot</option>
                  <option value="mobile">Phone screenshot</option>
                </select>
                <Input
                  aria-label="Caption"
                  placeholder="Caption (optional)"
                  value={shot.caption ?? ''}
                  onChange={(e) => updateRow('screenshots', i, { caption: e.target.value })}
                  className="sm:col-span-2"
                />
              </div>
              <RowActions index={i} length={form.screenshots.length} onMove={(to) => moveRow('screenshots', i, to)} onRemove={() => removeRow('screenshots', i)} />
            </div>
          ))}
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files).finally(() => (e.target.value = ''))} />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Upload screenshots'}
          </Button>
        </FormSection>

        <FormSection title="Story" description="The written part of the case study.">
          <Field id="overview" label="Overview" hint="Separate paragraphs with a blank line.">
            <Textarea {...text('overview')} rows={8} />
          </Field>
          <Field id="architecture" label="Engineering notes" hint="One point per line.">
            <Textarea {...text('architecture')} rows={6} />
          </Field>
        </FormSection>

        <FormSection title="Capabilities" description="What the product does, as short titled points.">
          {form.capabilities.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="grid flex-1 gap-2">
                <Input aria-label="Title" placeholder="Title" value={c.title} onChange={(e) => updateRow('capabilities', i, { title: e.target.value })} />
                <Textarea aria-label="Description" placeholder="Description" rows={2} value={c.description} onChange={(e) => updateRow('capabilities', i, { description: e.target.value })} />
              </div>
              <RowActions index={i} length={form.capabilities.length} onMove={(to) => moveRow('capabilities', i, to)} onRemove={() => removeRow('capabilities', i)} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('capabilities', [...form.capabilities, { title: '', description: '' }])}>
            <Plus className="h-4 w-4" /> Add capability
          </Button>
        </FormSection>

        <FormSection title="Tech" description="Comma separated.">
          <Field id="tech" label="Main stack" hint="Shown as chips on project cards.">
            <Input {...text('tech')} placeholder="Next.js, NestJS, PostgreSQL" />
          </Field>
          <Field id="builtIn" label="Built in" hint="Libraries and tools listed on the case study.">
            <Input {...text('builtIn')} />
          </Field>
          <Field id="features" label="Features">
            <Input {...text('features')} />
          </Field>
          <div className="space-y-2 pt-2">
            <Label>Stack breakdown</Label>
            <Hint>Layer by layer, e.g. Frontend / Next.js / App Router with server components.</Hint>
            {form.stack.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input aria-label="Layer" placeholder="Layer" value={s.layer} onChange={(e) => updateRow('stack', i, { layer: e.target.value })} className="w-32 shrink-0" />
                <Input aria-label="Name" placeholder="Name" value={s.name} onChange={(e) => updateRow('stack', i, { name: e.target.value })} className="w-40 shrink-0" />
                <Input aria-label="Note" placeholder="Note (optional)" value={s.note ?? ''} onChange={(e) => updateRow('stack', i, { note: e.target.value })} />
                <RowActions index={i} length={form.stack.length} onMove={(to) => moveRow('stack', i, to)} onRemove={() => removeRow('stack', i)} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => set('stack', [...form.stack, { layer: '', name: '', note: '' }])}>
              <Plus className="h-4 w-4" /> Add layer
            </Button>
          </div>
        </FormSection>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 md:px-10">
          <p className="text-sm text-muted-foreground">{dirty ? 'You have unsaved changes.' : isNew ? 'Not saved yet.' : 'All changes saved.'}</p>
          <div className="flex gap-2">
            {!isNew && (
              <Button type="button" variant="ghost" disabled={!dirty || mutation.isPending} onClick={() => setForm(toForm(project))}>
                Discard
              </Button>
            )}
            <Button type="submit" disabled={(!dirty && !isNew) || mutation.isPending || uploading}>
              {mutation.isPending ? 'Saving…' : isNew ? 'Create project' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
