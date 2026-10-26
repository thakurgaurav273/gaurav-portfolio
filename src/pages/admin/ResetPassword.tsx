import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthShell from '@/components/admin/AuthShell';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const MIN_LENGTH = 12;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const longEnough = password.length >= MIN_LENGTH;
  const matches = password.length > 0 && password === confirm;

  if (!token || !email) {
    return (
      <AuthShell>
        <h1 className="text-xl font-semibold tracking-tight">This link isn't valid</h1>
        <p className="mt-1 text-sm text-muted-foreground">Open the link from the email again, or ask for a new one.</p>
        <Button variant="outline" className="mt-5 w-full" asChild>
          <Link to="/admin/forgot-password">Request a new link</Link>
        </Button>
      </AuthShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longEnough || !matches) return;
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, email, password });
      toast.success('Password changed. Sign in with your new password.');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setError((isAxiosError(err) && err.response?.data?.error) || "Couldn't reset the password. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const Rule = ({ ok, children }: { ok: boolean; children: string }) => (
    <li className={cn('flex items-center gap-1.5 text-xs transition-colors', ok ? 'text-success' : 'text-muted-foreground')}>
      <Check className={cn('h-3.5 w-3.5 transition-opacity', ok ? 'opacity-100' : 'opacity-30')} /> {children}
    </li>
  );

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For <span className="font-medium text-foreground">{email}</span>. Every signed-in device will be signed out.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-9"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <ul className="space-y-1">
          <Rule ok={longEnough}>{`At least ${MIN_LENGTH} characters`}</Rule>
          <Rule ok={matches}>Both passwords match</Rule>
        </ul>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={busy || !longEnough || !matches}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            'Change password'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
