import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Briefcase, GraduationCap, LayoutTemplate, LogOut } from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Hero', path: '/admin/hero', icon: ImageIcon },
  { name: 'Skills', path: '/admin/skills', icon: GraduationCap },
  { name: 'Experience', path: '/admin/experience', icon: Briefcase },
  { name: 'Projects', path: '/admin/projects', icon: LayoutTemplate },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold gradient-text">Portfolio CMS</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
