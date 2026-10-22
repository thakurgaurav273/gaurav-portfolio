import { z } from 'zod';

const str = z.string().trim();
const optionalUrl = z.union([str.url(), z.literal(''), z.null()]).optional().transform((v) => v || null);
const optionalDate = z.union([z.coerce.date(), z.literal(''), z.null()]).optional().transform((v) => v || null);

export const heroSchema = z.object({
  name: str.min(1),
  subtitle: str.min(1),
  description: str.min(1),
  resumeUrl: optionalUrl,
  about: z.array(str).default([]),
  socialLinks: z.array(z.object({ platform: str, url: str })).default([]),
  stats: z.array(z.object({ value: str, label: str })).default([]),
  sections: z
    .record(z.enum(['projects', 'experience', 'about', 'contact']), z.object({ label: str, title: str, intro: str }).partial())
    .default({}),
});

const optionalText = z.union([str, z.null()]).optional().transform((v) => v || null);

export const projectSchema = z.object({
  title: str.min(1),
  slug: str.regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and dashes').optional(),
  description: str.min(1),
  tagline: optionalText,
  headline: optionalText,
  subheadline: optionalText,
  category: optionalText,
  status: z.enum(['live', 'in-progress']).default('live'),
  role: optionalText,
  timeline: optionalText,
  overview: z.array(str).default([]),
  architecture: z.array(str).default([]),
  features: z.array(str).default([]),
  tech: z.array(str).default([]),
  builtIn: z.array(str).default([]),
  capabilities: z.array(z.object({ icon: str.optional(), title: str, description: str })).default([]),
  screenshots: z
    .array(
      z.object({
        url: str,
        alt: str.default(''),
        label: str.optional(),
        caption: str.optional(),
        orientation: z.enum(['desktop', 'mobile']).default('desktop'),
      }),
    )
    .default([]),
  stack: z.array(z.object({ layer: str, name: str, note: str.optional() })).default([]),
  image: z.string().nullable().optional(),
  media: z.array(z.object({ url: str, type: z.enum(['image', 'video']).default('image') })).default([]),
  featured: z.boolean().default(false),
  link: optionalUrl,
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  order: z.coerce.number().int().default(0),
});

export const experienceSchema = z.object({
  company: str.min(1),
  role: str.min(1),
  location: str.nullable().optional(),
  startDate: z.coerce.date(),
  endDate: optionalDate,
  isCurrent: z.boolean().default(false),
  description: z.array(str).default([]),
  tech: z.array(str).default([]),
  order: z.coerce.number().int().default(0),
});

export const skillSchema = z.object({
  category: str.min(1),
  items: z.array(str).default([]),
  order: z.coerce.number().int().default(0),
});

// Express middleware: replaces req.body with the parsed value or responds 400.
export const validate = (schema, { partial = false } = {}) => (req, res, next) => {
  const result = (partial ? schema.partial() : schema).safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  next();
};
