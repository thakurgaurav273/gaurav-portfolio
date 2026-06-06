import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ManageSkills() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ category: '', items: '' });

  const { data: skills, isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: async () => (await api.get('/content/skills')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/content/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast.success('Skill category added');
      setIsOpen(false);
      setFormData({ category: '', items: '' });
      setEditingId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.put(`/content/skills/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast.success('Skill category updated');
      setIsOpen(false);
      setFormData({ category: '', items: '' });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/content/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast.success('Skill category deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category: formData.category,
      items: formData.items.split(',').map(i => i.trim()).filter(Boolean)
    };
    
    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ category: '', items: '' });
    setIsOpen(true);
  };

  const openEditDialog = (skill: any) => {
    setEditingId(skill._id);
    setFormData({ category: skill.category, items: skill.items?.join(', ') || '' });
    setIsOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Skills</h1>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Skill Category' : 'Add Skill Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="items">Skills (comma separated)</Label>
                <Input
                  id="items"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {skills?.map((skill: any) => (
          <Card key={skill._id} className="group overflow-hidden border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-5">
              <div>
                <CardTitle>{skill.category}</CardTitle>
                <p className="text-sm text-muted-foreground">{skill.items?.join(', ')}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openEditDialog(skill)}
                  className="text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(skill._id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
