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

export default function ManageExperience() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });

  const { data: experience, isLoading } = useQuery({
    queryKey: ['admin-experience'],
    queryFn: async () => (await api.get('/content/experience')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/content/experience', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experience'] });
      toast.success('Experience added');
      setIsOpen(false);
      setFormData({ company: '', role: '', period: '', description: '' });
      setEditingId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.put(`/content/experience/${editingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experience'] });
      toast.success('Experience updated');
      setIsOpen(false);
      setFormData({ company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/content/experience/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experience'] });
      toast.success('Experience deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      company: formData.company,
      role: formData.role,
      startDate: new Date(formData.startDate),
      endDate: formData.isCurrent ? null : new Date(formData.endDate),
      isCurrent: formData.isCurrent,
      description: formData.description.split('\n').map(i => i.trim()).filter(Boolean)
    };

    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setIsOpen(true);
  };

  const openEditDialog = (exp: any) => {
    setEditingId(exp._id);
    setFormData({ 
      company: exp.company, 
      role: exp.role, 
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : '', 
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : '',
      isCurrent: exp.isCurrent || false,
      description: exp.description?.join('\n') || '' 
    });
    setIsOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  const sortedExperience = [...(experience || [])].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const formatPeriod = (start: string, end: string, isCurrent: boolean) => {
    if (!start) return '';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    const s = new Date(start).toLocaleDateString('en-US', opts);
    const e = isCurrent ? 'Present' : (end ? new Date(end).toLocaleDateString('en-US', opts) : '');
    return `${s} – ${e}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Experience</h1>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" /> Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="month" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                {!formData.isCurrent && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="month" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required={!formData.isCurrent} />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isCurrent" 
                  checked={formData.isCurrent} 
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })} 
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isCurrent" className="font-normal cursor-pointer">I am currently working here</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (new line for each bullet point)</Label>
                <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Experience'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sortedExperience?.map((exp: any) => (
          <Card key={exp._id} className="group overflow-hidden border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-5">
              <div>
                <CardTitle>{exp.company} - {exp.role}</CardTitle>
                <p className="text-sm text-muted-foreground">{formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openEditDialog(exp)}
                  className="text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteMutation.mutate(exp._id)}
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
