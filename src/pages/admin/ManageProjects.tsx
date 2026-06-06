import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ManageProjects() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: '', githubUrl: '', liveUrl: '', features: '', tech: '' });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get('/content/projects')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/content/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project added');
      setIsOpen(false);
      setFormData({ title: '', description: '', image: '', githubUrl: '', liveUrl: '', features: '', tech: '' });
      setEditingId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.put(`/content/projects/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project updated');
      setIsOpen(false);
      setFormData({ title: '', description: '', image: '', githubUrl: '', liveUrl: '', features: '', tech: '' });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/content/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Project deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      features: formData.features.split(',').map(i => i.trim()).filter(Boolean),
      tech: formData.tech.split(',').map(i => i.trim()).filter(Boolean)
    };

    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('image', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', image: '', githubUrl: '', liveUrl: '', features: '', tech: '' });
    setIsOpen(true);
  };

  const openEditDialog = (project: any) => {
    setEditingId(project._id);
    setFormData({ 
      title: project.title || '', 
      description: project.description || '', 
      image: project.image || '', 
      githubUrl: project.githubUrl || '', 
      liveUrl: project.liveUrl || '', 
      features: project.features?.join(', ') || '', 
      tech: project.tech?.join(', ') || '' 
    });
    setIsOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Projects</h1>
          <p className="text-muted-foreground mt-2">Add, edit, or remove portfolio projects.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="flex gap-2">
                    <Input id="image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full" disabled={isUploading} />
                      <Button type="button" variant="outline" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input id="liveUrl" value={formData.liveUrl} onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech">Technologies (comma separated)</Label>
                <Input id="tech" value={formData.tech} onChange={(e) => setFormData({ ...formData, tech: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (comma separated)</Label>
                <Textarea id="features" rows={2} value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects?.map((project: any) => (
          <Card key={project._id} className="group overflow-hidden border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-5">
              <div>
                <CardTitle>{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openEditDialog(project)}
                  className="text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(project._id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
        {projects?.length === 0 && <p>No projects found.</p>}
      </div>
    </div>
  );
}
