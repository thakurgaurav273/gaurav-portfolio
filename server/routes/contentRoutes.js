import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, heroSchema, projectSchema, experienceSchema, skillSchema } from '../lib/validate.js';

const router = express.Router();

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    // P2025: record to update/delete does not exist
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    // P2002: unique constraint (e.g. a slug that's already taken)
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Already exists' });
    console.error(`${req.method} ${req.originalUrl} error:`, error);
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/hero', handle(async (req, res) => {
  const hero = await prisma.hero.findFirst();
  res.json(hero || {});
}));

// Partial update so the admin form can save a subset of fields without wiping the rest.
router.put('/hero', requireAuth, validate(heroSchema, { partial: true }), handle(async (req, res) => {
  const existing = await prisma.hero.findFirst({ select: { id: true } });
  if (existing) {
    return res.json(await prisma.hero.update({ where: { id: existing.id }, data: req.body }));
  }
  const parsed = heroSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors });
  }
  res.json(await prisma.hero.create({ data: parsed.data }));
}));

const slugify = (text) =>
  text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';

// Projects created from the admin form don't send a slug; derive a unique one from the title.
async function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; await prisma.project.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

router.get('/projects/:slug', handle(async (req, res) => {
  const { slug } = req.params;
  const project = await prisma.project.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
}));

router.post('/projects', requireAuth, validate(projectSchema), handle(async (req, res) => {
  const slug = req.body.slug || (await uniqueSlug(req.body.title));
  res.status(201).json(await prisma.project.create({ data: { ...req.body, slug } }));
}));

// Generic CRUD for the ordered collections.
const collections = [
  { path: 'projects', model: prisma.project, schema: projectSchema },
  { path: 'experience', model: prisma.experience, schema: experienceSchema, orderBy: [{ order: 'asc' }, { startDate: 'desc' }] },
  { path: 'skills', model: prisma.skill, schema: skillSchema },
];

for (const { path, model, schema, orderBy = [{ order: 'asc' }, { createdAt: 'asc' }] } of collections) {
  router.get(`/${path}`, handle(async (req, res) => {
    res.json(await model.findMany({ orderBy }));
  }));

  // Projects register their own POST above so they can assign a slug.
  if (path !== 'projects') {
    router.post(`/${path}`, requireAuth, validate(schema), handle(async (req, res) => {
      res.status(201).json(await model.create({ data: req.body }));
    }));
  }

  router.put(`/${path}/:id`, requireAuth, validate(schema, { partial: true }), handle(async (req, res) => {
    res.json(await model.update({ where: { id: req.params.id }, data: req.body }));
  }));

  router.delete(`/${path}/:id`, requireAuth, handle(async (req, res) => {
    await model.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  }));
}

export default router;
