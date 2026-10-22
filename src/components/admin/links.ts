import { Briefcase, Home, LayoutTemplate, Type, Wrench } from 'lucide-react';

// Admin navigation, shared by the desktop sidebar and the mobile top bar.
export const adminLinks = [
  { name: 'Overview', path: '/admin/dashboard', icon: Home },
  { name: 'Site copy', path: '/admin/hero', icon: Type },
  { name: 'Projects', path: '/admin/projects', icon: LayoutTemplate },
  { name: 'Experience', path: '/admin/experience', icon: Briefcase },
  { name: 'Skills', path: '/admin/skills', icon: Wrench },
];
