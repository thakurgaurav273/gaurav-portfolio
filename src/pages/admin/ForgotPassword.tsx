import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, MailCheck } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthShell from '@/components/admin/AuthShell';
import api from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError((isAxiosError(err) && err.response?.data?.error) || "Couldn't send the reset email. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <AnimatePresence mode="wait" initial={false}>
        {!sent ? (
          <motion.form key="form" exit={{ opacity: 0, x: -24 }} onSubmit={handleSubmit} className="space-y-4">
            <Link to="/admin/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter the admin email and we'll send a link to choose a new password.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy || !email}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
              className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary"
            >
              <MailCheck className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span> is the admin email, a reset link is on its way. It expires in 1 hour.
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/login">Back to sign in</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
