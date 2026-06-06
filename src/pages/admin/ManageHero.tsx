import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ManageHero() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
  });

  const { data: hero, isLoading } = useQuery({
    queryKey: ['admin-hero'],
    queryFn: async () => (await api.get('/content/hero')).data
  });

  useEffect(() => {
    if (hero) {
      setFormData({
        name: hero.name || '',
        subtitle: hero.subtitle || '',
        description: hero.description || '',
      });
    }
  }, [hero]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.put('/content/hero', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero'] });
      toast.success('Hero section updated successfully');
    },
    onError: () => {
      toast.error('Failed to update hero section');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Manage Hero</h1>
        <p className="text-muted-foreground mt-2">Update the main introduction on your homepage.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle / Tagline</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
