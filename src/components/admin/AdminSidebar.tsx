import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { adminLinks } from './links';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-card font-medium text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
  );

// Desktop sidebar; on small screens AdminLayout shows the same links as a top bar.
export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-secondary/60 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo className="h-6 w-auto" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Portfolio</p>
          <p className="text-xs text-muted-foreground">Content admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {adminLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={itemClass}>
            <link.icon className="h-4 w-4" />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <ArrowUpRight className="h-4 w-4" />
          View site
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
