import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Activity, User, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/placement', label: 'Placement', icon: MapPin },
  { path: '/network', label: 'Network', icon: Activity },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--color-bg)]/90 backdrop-blur-lg border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all no-underline ${
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 gradient-bg rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
