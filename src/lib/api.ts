import axios, { type InternalAxiosRequestConfig } from 'axios';
import { SESSION_ENDED, clearSession, getSession, saveSession, type Session } from '@/lib/session';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

// One refresh at a time: requests that fail together all wait on the same new token.
let refreshing: Promise<Session | null> | null = null;

const refreshSession = () => {
  refreshing ??= (async () => {
    const current = getSession();
    if (!current) return null;
    try {
      const { data } = await axios.post<Session>(`${baseURL}/auth/refresh`, { refreshToken: current.refreshToken });
      saveSession(data);
      return data;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = config?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && config && !config._retried && !isAuthCall && getSession()) {
      config._retried = true;
      const session = await refreshSession();
      if (session) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(config);
      }
      clearSession();
      window.dispatchEvent(new Event(SESSION_ENDED));
    }
    return Promise.reject(error);
  },
);

export default api;
