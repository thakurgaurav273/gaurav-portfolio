import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { getSession, saveSession, type Session } from '@/lib/session';

type Step = 'credentials' | 'verified' | 'code' | 'success';
type Challenge = { challengeId: string; email: string; resendAfter: number };

const errorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) && (error.response?.data?.error as string | undefined)) || fallback;

const ease = [0.16, 1, 0.3, 1] as const;

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

// Circle and tick that draw themselves in.
const DrawnCheck = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
    <motion.circle
      cx="32"
      cy="32"
      r="29"
      fill="none"
      stroke="hsl(var(--success))"
      strokeWidth="3"
      initial={{ pathLength: 0, rotate: -90 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, ease }}
      style={{ transformOrigin: 'center' }}
    />
    <motion.path
      d="M20 33 l8 8 l16 -18"
      fill="none"
      stroke="hsl(var(--success))"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, delay: 0.45, ease }}
    />
  </svg>
);

const FieldError = ({ children }: { children: ReactNode }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-sm text-destructive"
    role="alert"
  >
    {children}
  </motion.p>
);

export default function Login() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const card = useAnimationControls();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Countdown for the "Send a new code" link.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduce ? 0 : ms));

  const fail = (message: string) => {
    setError(message);
    if (!reduce) card.start({ x: [0, -10, 10, -7, 7, -3, 3, 0], transition: { duration: 0.45 } });
  };

  if (getSession() && step === 'credentials') return <Navigate to="/admin/dashboard" replace />;

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post<Challenge>('/auth/login', { email, password });
      setChallenge(data);
      setResendIn(Math.ceil(data.resendAfter / 1000));
      setStep('verified');
      later(() => setStep('code'), 900);
    } catch (err) {
      fail(errorMessage(err, "Couldn't sign in. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (value: string) => {
    if (!challenge || value.length !== 6 || busy) return;
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post<Session>('/auth/verify-otp', { challengeId: challenge.challengeId, code: value, remember });
      saveSession(data);
      setStep('success');
      later(() => navigate('/admin/dashboard', { replace: true }), 1300);
    } catch (err) {
      setCode('');
      if (isAxiosError(err) && err.response?.data?.expired) {
        setStep('credentials');
        setChallenge(null);
        setPassword('');
      }
      fail(errorMessage(err, "Couldn't check the code. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!challenge || resendIn > 0) return;
    setError('');
    try {
      const { data } = await api.post<{ resendAfter: number }>('/auth/resend-otp', { challengeId: challenge.challengeId });
      setResendIn(Math.ceil(data.resendAfter / 1000));
      setCode('');
    } catch (err) {
      fail(errorMessage(err, "Couldn't send a new code."));
    }
  };

  const startOver = () => {
    setStep('credentials');
    setChallenge(null);
    setCode('');
    setError('');
  };

  return (
    <div className="tone-tint flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Logo className="h-7 w-auto" />
          <span className="text-sm font-semibold">Content admin</span>
        </div>

        <motion.div animate={card} className="panel overflow-hidden p-6 sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            {(step === 'credentials' || step === 'verified') && (
              <motion.form key="credentials" {...slide} onSubmit={submitPassword} className="space-y-4" noValidate>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
                  <p className="mt-1 text-sm text-muted-foreground">We'll email you a code to confirm it's you.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={step === 'verified'}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/admin/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={step === 'verified'}
                      className="px-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} disabled={step === 'verified'} />
                  Keep me signed in for 30 days
                </label>

                <AnimatePresence>{error && <FieldError>{error}</FieldError>}</AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={busy || step === 'verified' || !email || !password}
                  animate={{ backgroundColor: step === 'verified' ? 'hsl(var(--success))' : 'hsl(var(--foreground))' }}
                  transition={{ duration: 0.3 }}
                  className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-background disabled:cursor-default"
                  style={{ opacity: busy || step === 'verified' || (email && password) ? 1 : 0.5 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 'verified' ? (
                      <motion.span
                        key="ok"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" strokeWidth={3} /> Password verified
                      </motion.span>
                    ) : busy ? (
                      <motion.span key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Continue
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>
            )}

            {step === 'code' && challenge && (
              <motion.div key="code" {...slide} className="space-y-5">
                <button type="button" onClick={startOver} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div>
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
                    className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-secondary"
                  >
                    <Mail className="h-5 w-5" />
                  </motion.div>
                  <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{challenge.email}</span>. It expires in 10 minutes.
                  </p>
                </div>

                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(v) => {
                    setCode(v.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  onComplete={submitCode}
                  autoFocus
                  disabled={busy}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className={cn(
                          'h-12 w-11 rounded-lg border text-lg font-semibold first:rounded-lg first:border-l last:rounded-lg',
                          error && 'border-destructive',
                        )}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className="min-h-5 text-center">
                  <AnimatePresence mode="wait">
                    {busy ? (
                      <motion.p key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                      </motion.p>
                    ) : error ? (
                      <FieldError key="err">{error}</FieldError>
                    ) : null}
                  </AnimatePresence>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't get it?{' '}
                  {resendIn > 0 ? (
                    <span>Send a new code in {resendIn}s</span>
                  ) : (
                    <button type="button" onClick={resend} className="font-medium text-foreground underline-offset-4 hover:underline">
                      Send a new code
                    </button>
                  )}
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease } }}
                className="flex flex-col items-center py-6 text-center"
              >
                <DrawnCheck />
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-5 text-xl font-semibold tracking-tight"
                >
                  You're in
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mt-1 text-sm text-muted-foreground">
                  {remember ? 'Signed in for 30 days on this device.' : 'Signed in until you close this browser.'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Back to the site
          </a>
        </p>
      </motion.div>
    </div>
  );
}
