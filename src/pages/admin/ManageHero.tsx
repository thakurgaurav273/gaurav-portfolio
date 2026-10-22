import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSection, Hint, PageHeader } from '@/components/admin/AdminUI';
import { type Hero, type SectionCopy, type SectionKey } from '@/lib/content';
import api from '@/lib/api';

const sectionFields: { key: SectionKey; name: string; where: string }[] = [
  { key: 'projects', name: 'Work', where: 'Heading above your featured projects.' },
  { key: 'experience', name: 'Experience', where: 'Heading above the job timeline.' },
  { key: 'about', name: 'About', where: 'Heading above your story and skills.' },
  { key: 'contact', name: 'Contact', where: 'Heading above the email card and form.' },
];

type Form = {
  name: string;
  subtitle: string;
  description: string;
  resumeUrl: string;
  about: string;
  socialLinks: { platform: string; url: string }[];
  stats: { value: string; label: string }[];
  sections: Record<SectionKey, Required<SectionCopy>>;
};

const toForm = (hero: Partial<Hero>): Form => ({
  name: hero.name || '',
  subtitle: hero.subtitle || '',
  description: hero.description || '',
  resumeUrl: hero.resumeUrl || '',
  // About is edited as one textarea; blank lines separate paragraphs.
  about: (hero.about || []).join('\n\n'),
  socialLinks: hero.socialLinks || [],
  stats: hero.stats || [],
  sections: Object.fromEntries(
    sectionFields.map(({ key }) => {
      const saved = hero.sections?.[key] ?? {};
      return [key, { label: saved.label || '', title: saved.title || '', intro: saved.intro || '' }];
    }),
  ) as Form['sections'],
});

const Field = ({ id, label, hint, children }: { id?: string; label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <Hint>{hint}</Hint>}
  </div>
);

export default function ManageHero() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);

  const { data: hero, isLoading } = useQuery({
    queryKey: ['admin-hero'],
    queryFn: async () => (await api.get<Partial<Hero>>('/content/hero')).data,
  });

  useEffect(() => {
    if (hero) setForm(toForm(hero));
  }, [hero]);

  const saved = useMemo(() => (hero ? JSON.stringify(toForm(hero)) : ''), [hero]);
  const dirty = form !== null && JSON.stringify(form) !== saved;

  const mutation = useMutation({
    mutationFn: async (data: Form) => {
      const about = data.about.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const socialLinks = data.socialLinks.filter((l) => l.platform.trim() && l.url.trim());
      const stats = data.stats.filter((s) => s.value.trim() && s.label.trim());
      await api.put('/content/hero', { ...data, about, socialLinks, stats });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero'] });
      queryClient.invalidateQueries({ queryKey: ['public-hero'] });
      toast.success('Site copy saved');
    },
    onError: () => toast.error("Couldn't save. Check the fields and try again."),
  });

  if (isLoading || !form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });
  const setSection = (key: SectionKey, field: keyof SectionCopy, value: string) =>
    set('sections', { ...form.sections, [key]: { ...form.sections[key], [field]: value } });
  const updateItem = <K extends 'socialLinks' | 'stats'>(key: K, i: number, patch: Partial<Form[K][number]>) =>
    set(key, form[key].map((item, idx) => (idx === i ? { ...item, ...patch } : item)) as Form[K]);
  const removeItem = (key: 'socialLinks' | 'stats', i: number) =>
    set(key, form[key].filter((_, idx) => idx !== i) as never);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="pb-24"
    >
      <PageHeader
        title="Site copy"
        description="Every piece of text on the homepage that isn't a project, job or skill. Changes go live as soon as you save."
      />

      <div className="space-y-5">
        <FormSection title="Intro" description="The top of the homepage.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Name">
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <Field id="resumeUrl" label="Resume link" hint="Shows a Resume button when set.">
              <Input
                id="resumeUrl"
                type="url"
                placeholder="https://"
                value={form.resumeUrl}
                onChange={(e) => set('resumeUrl', e.target.value)}
              />
            </Field>
          </div>
          <Field id="subtitle" label="Headline">
            <Textarea id="subtitle" rows={2} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} required />
          </Field>
          <Field id="description" label="Short introduction" hint="The paragraph under the headline.">
            <Textarea id="description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </Field>
        </FormSection>

        <FormSection title="Section headings" description="The small label, heading and intro line above each part of the page.">
          {sectionFields.map(({ key, name, where }, i) => (
            <div key={key} className={i > 0 ? 'border-t border-border pt-5' : undefined}>
              <p className="text-sm font-medium">{name}</p>
              <Hint>{where}</Hint>
              <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr]">
                <Field id={`${key}-label`} label="Label">
                  <Input id={`${key}-label`} value={form.sections[key].label} onChange={(e) => setSection(key, 'label', e.target.value)} />
                </Field>
                <Field id={`${key}-title`} label="Heading">
                  <Input id={`${key}-title`} value={form.sections[key].title} onChange={(e) => setSection(key, 'title', e.target.value)} />
                </Field>
              </div>
              <div className="mt-3">
                <Field id={`${key}-intro`} label="Intro line" hint="Optional. Leave empty to hide it.">
                  <Textarea id={`${key}-intro`} rows={2} value={form.sections[key].intro} onChange={(e) => setSection(key, 'intro', e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </FormSection>

        <FormSection title="About" description="Your story in the About section. The first paragraph is shown larger.">
          <Field id="about" label="Paragraphs" hint="Separate paragraphs with a blank line.">
            <Textarea id="about" rows={10} value={form.about} onChange={(e) => set('about', e.target.value)} />
          </Field>
        </FormSection>

        <FormSection title="Links" description="Shown in the hero, contact section and footer. Use mailto: for email.">
          {form.socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label="Platform"
                placeholder="GitHub"
                value={link.platform}
                onChange={(e) => updateItem('socialLinks', i, { platform: e.target.value })}
                className="w-36 shrink-0"
              />
              <Input
                aria-label="URL"
                placeholder="https://github.com/you"
                value={link.url}
                onChange={(e) => updateItem('socialLinks', i, { url: e.target.value })}
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove link" onClick={() => removeItem('socialLinks', i)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('socialLinks', [...form.socialLinks, { platform: '', url: '' }])}>
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </FormSection>

        <FormSection title="Stats" description="Optional numbers in the About section, after years of experience and company count.">
          {form.stats.map((stat, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label="Value"
                placeholder="10+"
                value={stat.value}
                onChange={(e) => updateItem('stats', i, { value: e.target.value })}
                className="w-28 shrink-0"
              />
              <Input
                aria-label="Label"
                placeholder="Projects shipped"
                value={stat.label}
                onChange={(e) => updateItem('stats', i, { label: e.target.value })}
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove stat" onClick={() => removeItem('stats', i)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('stats', [...form.stats, { value: '', label: '' }])}>
            <Plus className="h-4 w-4" /> Add stat
          </Button>
        </FormSection>
      </div>

      {/* Save bar stays in view so changes anywhere on the page can be saved. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 md:px-10">
          <p className="text-sm text-muted-foreground">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={!dirty || mutation.isPending} onClick={() => hero && setForm(toForm(hero))}>
              Discard
            </Button>
            <Button type="submit" disabled={!dirty || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
