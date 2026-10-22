import { useRef, useState } from 'react';
import { z } from 'zod';
import { Check, Copy, Loader2, ArrowRight, ArrowUpRight } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { Section, Reveal } from '@/components/Section';
import Panel from '@/components/Panel';
import { socialIcon } from '@/lib/social';
import { emailFrom, useHero } from '@/lib/content';
import api from '@/lib/api';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email is too long'),
  message: z.string().trim().min(10, 'A little more detail, please (10+ characters)').max(1000, 'Message is too long'),
});

type ContactForm = z.infer<typeof contactSchema>;
const empty: ContactForm = { name: '', email: '', message: '' };

const ContactSection = () => {
  const hero = useHero();
  const email = emailFrom(hero);
  const { toast } = useToast();
  const recaptcha = useRecaptcha();

  const [form, setForm] = useState<ContactForm>(empty);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [copied, setCopied] = useState(false);
  // Spam signals checked by the server: a hidden field only bots fill, and how long the form took.
  const [website, setWebsite] = useState('');
  const startedAt = useRef(Date.now());

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<ContactForm> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof ContactForm] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus('sending');
    try {
      const recaptchaToken = await recaptcha.getToken('contact');
      await api.post('/contact', { ...result.data, website, elapsedMs: Date.now() - startedAt.current, recaptchaToken });
      setStatus('sent');
      setForm(empty);
      toast({ title: 'Message sent', description: "Thanks for reaching out. I'll reply soon." });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      setStatus('idle');
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast({
        title: "Couldn't send your message",
        description: message || `Please try again, or email me directly at ${email}.`,
        variant: 'destructive',
      });
    }
  };

  const field = (name: keyof ContactForm) => ({
    id: name,
    name,
    value: form[name],
    onChange,
    disabled: status === 'sending',
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const fieldError = (name: keyof ContactForm) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <Section id="contact" index="04" tone="tint">
      <div className="grid gap-3 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Panel className="flex h-full flex-col p-6">
            <p className="eyebrow">Email</p>
            <a
              href={`mailto:${email}`}
              className="mt-2 text-lg font-semibold tracking-tight transition-colors [overflow-wrap:anywhere] hover:text-accent"
            >
              {email}
            </a>
            <button
              onClick={copyEmail}
              className="mt-4 inline-flex h-8 w-fit items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copy email address"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>

            <p className="eyebrow mt-8">Elsewhere</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {hero.socialLinks
                .filter((l) => !l.url.startsWith('mailto:'))
                .map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-3 text-[15px] text-foreground/85 transition-colors hover:text-foreground"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" /> {link.platform}
                        <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </li>
                  );
                })}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <Panel className="h-full">
            <form onSubmit={onSubmit} noValidate className="p-6">
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <p className="eyebrow mb-5">Send a message</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="mb-2 block">Name</Label>
                  <Input {...field('name')} autoComplete="name" placeholder="Jane Doe" className="h-10 rounded-lg bg-background/60" />
                  {fieldError('name')}
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email</Label>
                  <Input {...field('email')} type="email" autoComplete="email" placeholder="jane@company.com" className="h-10 rounded-lg bg-background/60" />
                  {fieldError('email')}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="message" className="mb-2 block">Message</Label>
                <Textarea {...field('message')} placeholder="What are you working on?" className="min-h-36 resize-y rounded-lg bg-background/60" />
                {fieldError('message')}
              </div>

              <div className="mt-5 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                {recaptcha.enabled ? (
                  <p className="text-xs text-muted-foreground">
                    Protected by reCAPTCHA ·{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="link-underline">Privacy</a>{' '}
                    ·{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="link-underline">Terms</a>
                  </p>
                ) : (
                  <span />
                )}
                <button type="submit" disabled={status !== 'idle'} className="btn-primary disabled:opacity-60">
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                    </>
                  ) : status === 'sent' ? (
                    <>
                      <Check className="h-4 w-4" /> Sent
                    </>
                  ) : (
                    <>
                      Send message <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
};

export default ContactSection;
