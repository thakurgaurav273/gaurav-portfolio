// Admin session tokens. "Remember me" keeps them in localStorage for up to 30 days;
// otherwise they live in sessionStorage and disappear when the browser closes.
// The access token lasts 15 minutes and is renewed with the refresh token as needed.

export type Session = { accessToken: string; refreshToken: string; expiresAt: string; remember: boolean };

const KEY = 'adminSession';

const read = (store: Storage): Session | null => {
  try {
    const raw = store.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const getSession = (): Session | null => {
  const session = read(localStorage) ?? read(sessionStorage);
  if (session && new Date(session.expiresAt) <= new Date()) {
    clearSession();
    return null;
  }
  return session;
};

export const saveSession = (session: Session) => {
  clearSession();
  (session.remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  localStorage.removeItem('adminToken'); // pre-OTP token format
};

export const SESSION_ENDED = 'admin-session-ended';
