import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Briefcase, GraduationCap, LayoutTemplate } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: projects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get('/content/projects')).data
  });

  const { data: skills } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: async () => (await api.get('/content/skills')).data
  });

  const { data: experience } = useQuery({
    queryKey: ['admin-experience'],
    queryFn: async () => (await api.get('/content/experience')).data
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Admin</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>
        <h1 className="text-4xl font-display font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage live site content from one place. Counts update from your database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PROJECTS</CardTitle>
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SKILLS CATEGORIES</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{skills?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EXPERIENCE</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{experience?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase">Manage Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/hero">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">Hero section</span>
                </CardTitle>
                <CardDescription>Headlines, subtitles, and main text for the homepage.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/projects">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Projects</span>
                  <span className="text-sm font-normal bg-secondary px-2 py-1 rounded-full">{projects?.length || 0}</span>
                </CardTitle>
                <CardDescription>Add or modify your featured work and portfolio projects.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/experience">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Experience</span>
                  <span className="text-sm font-normal bg-secondary px-2 py-1 rounded-full">{experience?.length || 0}</span>
                </CardTitle>
                <CardDescription>Manage your work history and professional roles.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/skills">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Skills</span>
                  <span className="text-sm font-normal bg-secondary px-2 py-1 rounded-full">{skills?.length || 0}</span>
                </CardTitle>
                <CardDescription>Organize and list your technical skills by category.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
