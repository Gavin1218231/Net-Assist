import { Link } from 'react-router-dom';
import { Wifi, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="gradient-bg p-2 rounded-xl">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text)]">NetAssist</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm font-medium no-underline">
              Dashboard
            </Link>
            <Link to="/placement" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm font-medium no-underline">
              Placement
            </Link>
            <Link to="/network" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-sm font-medium no-underline">
              Network
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
              <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error)] rounded-full" />
            </button>

            <Link to="/profile" className="hidden md:flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            </Link>

            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--color-text)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--color-text)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/placement"
              className="block px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Placement Assistant
            </Link>
            <Link
              to="/network"
              className="block px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Network Check
            </Link>
            <Link
              to="/profile"
              className="block px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-xl no-underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-[var(--color-error)] hover:bg-[var(--color-bg-secondary)] rounded-xl"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
