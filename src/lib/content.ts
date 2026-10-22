import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type SocialLink = { platform: string; url: string };
export type Stat = { value: string; label: string };
export type SectionKey = 'projects' | 'experience' | 'about' | 'contact';
export type SectionCopy = { label?: string; title?: string; intro?: string };

export type Hero = {
  id?: string;
  name: string;
  subtitle: string;
  description: string;
  resumeUrl?: string | null;
  about?: string[];
  socialLinks: SocialLink[];
  stats: Stat[];
  sections?: Partial<Record<SectionKey, SectionCopy>>;
};

export type Experience = {
  id?: string;
  company: string;
  role: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string[];
  tech?: string[];
};

export type Media = { url: string; type: 'image' | 'video' };
export type Screenshot = { url: string; alt?: string; label?: string; caption?: string; orientation?: 'desktop' | 'mobile' };
export type Capability = { icon?: string; title: string; description: string };
export type StackItem = { layer: string; name: string; note?: string };

export type Project = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  tagline?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  category?: string | null;
  status?: string;
  role?: string | null;
  timeline?: string | null;
  overview?: string[];
  architecture?: string[];
  features: string[];
  tech: string[];
  builtIn?: string[];
  capabilities?: Capability[];
  screenshots?: Screenshot[];
  stack?: StackItem[];
  image?: string | null;
  media?: Media[];
  featured?: boolean;
  link?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
};

export type SkillGroup = { id?: string; category: string; items: string[] };

// Placeholder until the API responds; components show loading states while `name` is empty.
const emptyHero: Hero = { name: '', subtitle: '', description: '', about: [], socialLinks: [], stats: [], sections: {} };

const get = async <T,>(path: string) => (await api.get<T>(path)).data;
const opts = { retry: 2, staleTime: 5 * 60 * 1000 } as const;

export const useHero = () => {
  const q = useQuery({ queryKey: ['public-hero'], queryFn: () => get<Partial<Hero>>('/content/hero'), ...opts });
  return q.data?.name ? ({ ...emptyHero, ...q.data } as Hero) : emptyHero;
};

// Heading copy for a homepage section, edited under Site copy in the admin.
export const useSectionCopy = (key: SectionKey) => {
  const saved = useHero().sections?.[key] ?? {};
  return { label: saved.label ?? '', title: saved.title ?? '', intro: saved.intro ?? '' };
};

const useList = <T,>(key: string, path: string) => {
  const q = useQuery({ queryKey: [key], queryFn: () => get<T[]>(path), ...opts });
  return { data: q.data ?? [], isLoading: q.isLoading };
};

export const useExperience = () => useList<Experience>('public-experience', '/content/experience');
export const useProjects = () => useList<Project>('public-projects', '/content/projects');
export const useSkills = () => useList<SkillGroup>('public-skills', '/content/skills');

export const useProject = (slug: string) => {
  const q = useQuery({
    queryKey: ['public-project', slug],
    queryFn: () => get<Project>(`/content/projects/${slug}`),
    ...opts,
    retry: (count, error: { response?: { status?: number } }) => error?.response?.status !== 404 && count < 1,
  });
  return { project: q.data, isLoading: q.isLoading, notFound: q.isError };
};

// Serve Cloudinary images resized and in a modern format; other URLs pass through untouched.
export const optimizeImage = (url: string, width: number) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;

export const projectCover = (p: Project) =>
  p.screenshots?.[0]?.url ?? p.media?.find((m) => m.type === 'image')?.url ?? p.image ?? undefined;

export const projectUrl = (p: Project) => p.liveUrl || p.link || undefined;

// Captioned screenshots first, then any uploaded media they don't already cover.
export const projectGallery = (p: Project): Screenshot[] => {
  const shots = p.screenshots ?? [];
  const seen = new Set(shots.map((s) => s.url));
  const extra = (p.media ?? []).filter((m) => m.type === 'image' && !seen.has(m.url)).map((m) => ({ url: m.url, alt: p.title }));
  const all = [...shots, ...extra];
  return all.length ? all : p.image ? [{ url: p.image, alt: p.title }] : [];
};

export const formatMonth = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

export const formatPeriod = (start: string, end?: string | null, isCurrent?: boolean) =>
  `${formatMonth(start)} to ${isCurrent ? 'Present' : formatMonth(end)}`;

// Strips the parenthetical legal name, e.g. "Eagle Inbrit (Xenage Solutions)" → "Eagle Inbrit".
export const shortCompany = (name?: string) => name?.replace(/\s*\(.*\)\s*$/, '');

export const emailFrom = (hero: Hero) =>
  hero.socialLinks.find((l) => l.url.startsWith('mailto:'))?.url.replace('mailto:', '') ?? 'gauravsingh.swe@gmail.com';
