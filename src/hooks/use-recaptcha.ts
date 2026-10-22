import { useCallback, useEffect } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

// Loads reCAPTCHA v3 when a site key is configured and returns a token getter.
// The getter resolves to '' when reCAPTCHA is unavailable so the form still submits.
export function useRecaptcha() {
  useEffect(() => {
    if (!siteKey || document.querySelector('script[src*="recaptcha/api.js"]')) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const getToken = useCallback(async (action = 'submit') => {
    const grecaptcha = window.grecaptcha;
    if (!siteKey || !grecaptcha) return '';
    try {
      await new Promise<void>((resolve) => grecaptcha.ready(resolve));
      return await grecaptcha.execute(siteKey, { action });
    } catch (error) {
      console.warn('reCAPTCHA unavailable, submitting without a token', error);
      return '';
    }
  }, []);

  return { enabled: Boolean(siteKey), getToken };
}
