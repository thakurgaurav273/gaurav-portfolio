import { Github, Linkedin, Mail, Twitter, Globe, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  mail: Mail,
  twitter: Twitter,
  x: Twitter,
};

export const socialIcon = (platform: string): LucideIcon => icons[platform.toLowerCase()] ?? Globe;
