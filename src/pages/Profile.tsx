import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Camera, LogOut, Shield, Activity, MapPin,
  ChevronRight, Edit3, Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    updateProfile({ displayName, email });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { icon: Activity, label: 'Speed Tests', value: '12', color: '#3b82f6' },
    { icon: MapPin, label: 'Placements', value: '3', color: '#8b5cf6' },
    { icon: Shield, label: 'Security Score', value: '85%', color: '#10b981' },
  ];

  return (
    <div className="page-container">
      {/* Profile header */}
      <div className="card mb-6 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center text-white text-3xl font-bold mx-auto">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
            <Camera className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field text-center"
              placeholder="Display name"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field text-center"
              placeholder="Email"
            />
            <div className="flex gap-2 justify-center">
              <button onClick={handleSave} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary !py-2 !px-4 text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[var(--color-text)]">{user?.displayName}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{user?.email}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 text-sm text-[var(--color-primary)] font-medium hover:underline inline-flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card !p-4 text-center">
            <div className="p-2 rounded-xl mx-auto w-fit mb-2" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-lg font-bold text-[var(--color-text)]">{value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Account section */}
      <div className="card mb-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Account</h3>
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--color-text)]">Personal Information</p>
                <p className="text-xs text-[var(--color-text-muted)]">Name, email, phone</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--color-text)]">Security</p>
                <p className="text-xs text-[var(--color-text-muted)]">Password, 2FA</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--color-text)]">Connected Accounts</p>
                <p className="text-xs text-[var(--color-text-muted)]">Google, Microsoft</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>
      </div>

      {/* Activity */}
      <div className="card mb-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Speed test completed', time: '2 hours ago', icon: Activity, color: '#3b82f6' },
            { action: 'Router placement updated', time: '1 day ago', icon: MapPin, color: '#8b5cf6' },
            { action: 'Security scan completed', time: '3 days ago', icon: Shield, color: '#10b981' },
            { action: 'Account created', time: '1 week ago', icon: User, color: '#f59e0b' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--color-text)]">{item.action}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
