// Seeds the database from prisma/seed-data.json.
//
//   npm run db:seed            only fills tables that are empty
//   npm run db:seed -- --reset clears hero/experience/projects/skills first (admins are kept)
//
// Creates an admin from ADMIN_EMAIL / ADMIN_PASSWORD when both are set.
import { readFileSync } from 'node:fs';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const data = JSON.parse(readFileSync(new URL('./seed-data.json', import.meta.url), 'utf8'));
const reset = process.argv.includes('--reset');

const nullIfEmpty = (v) => (v === '' || v === undefined ? null : v);

const toProject = (p) => {
  const media = p.media ?? [];
  // Some screenshots point at files from an older repo (/projects/*.png). Swap those for the
  // uploaded media at the same position, and drop any that have no uploaded counterpart.
  const screenshots = (p.screenshots ?? [])
    .map((s, i) => (s.url.startsWith('http') ? s : media[i] && { ...s, url: media[i].url }))
    .filter(Boolean);

  return {
    ...p,
    screenshots,
    media,
    role: nullIfEmpty(p.role),
    timeline: nullIfEmpty(p.timeline),
    link: nullIfEmpty(p.link),
    githubUrl: nullIfEmpty(p.githubUrl),
    liveUrl: nullIfEmpty(p.liveUrl),
  };
};

async function main() {
  if (reset) {
    await prisma.$transaction([
      prisma.hero.deleteMany(),
      prisma.experience.deleteMany(),
      prisma.project.deleteMany(),
      prisma.skill.deleteMany(),
    ]);
  }

  if ((await prisma.hero.count()) === 0) await prisma.hero.create({ data: data.hero });
  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: data.experience.map((e) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : null })),
    });
  }
  if ((await prisma.project.count()) === 0) await prisma.project.createMany({ data: data.projects.map(toProject) });
  if ((await prisma.skill.count()) === 0) await prisma.skill.createMany({ data: data.skills });

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await prisma.admin.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: { email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 10) },
    });
    console.log(`Admin ready: ${ADMIN_EMAIL}`);
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
