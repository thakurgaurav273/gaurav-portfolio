import express from 'express';
import { Hero } from '../models/Hero.js';
import { Project } from '../models/Project.js';
import { Experience } from '../models/Experience.js';
import { Skill } from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/hero', async (req, res) => {
  try {
    const hero = await Hero.findOne();
    res.json(hero || {});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/hero', requireAuth, async (req, res) => {
  try {
    const { name, subtitle, description, resumeUrl, socialLinks, stats } = req.body;
    let hero = await Hero.findOne();
    
    if (hero) {
      hero.name = name;
      hero.subtitle = subtitle;
      hero.description = description;
      hero.resumeUrl = resumeUrl;
      hero.socialLinks = socialLinks;
      hero.stats = stats;
      await hero.save();
    } else {
      hero = new Hero({ name, subtitle, description, resumeUrl, socialLinks, stats });
      await hero.save();
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/experience', async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/experience', requireAuth, async (req, res) => {
  try {
    const exp = new Experience(req.body);
    await exp.save();
    res.status(201).json(exp);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/experience/:id', requireAuth, async (req, res) => {
  try {
    const exp = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json(exp);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/experience/:id', requireAuth, async (req, res) => {
  try {
    const exp = await Experience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/skills', requireAuth, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/skills/:id', requireAuth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/skills/:id', requireAuth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
