import { useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SESSION_ENDED, getSession } from '@/lib/session';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { AdminSidebar } from './AdminSidebar';
import { adminLinks } from './links';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const session = getSession();

  // Fired by the API client when the refresh token is rejected (expired, revoked or reused).
  useEffect(() => {
    const onEnded = () => {
      toast.error('Your session ended. Please sign in again.');
      navigate('/admin/login', { replace: true });
    };
    window.addEventListener(SESSION_ENDED, onEnded);
    return () => window.removeEventListener(SESSION_ENDED, onEnded);
  }, [navigate]);

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      {/* Small screens: logo plus a scrollable row of the same links. */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur md:hidden">
        <div className="flex items-center gap-2 px-4 pt-3">
          <Logo className="h-5 w-auto" />
          <span className="text-sm font-semibold">Content admin</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2">
          {adminLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                  isActive ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground',
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 md:ml-60 md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
