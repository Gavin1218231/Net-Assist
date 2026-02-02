import { useState } from 'react';
import {
  Sun, Moon, Monitor, Bell, BellOff, Globe, Type,
  Cpu, ChevronDown, Check, Palette, Volume2, Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAvailableProviders } from '../services/ai';
import type { AIProvider } from '../types';

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mb-4">
      <h3 className="font-semibold text-[var(--color-text)] mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-tertiary)]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(user?.preferences.notifications ?? true);
  const [fontSize, setFontSize] = useState(user?.preferences.fontSize ?? 'medium');
  const [aiProvider, setAiProvider] = useState<AIProvider>(user?.preferences.aiProvider ?? 'claude');
  const [language, setLanguage] = useState(user?.preferences.language ?? 'en');
  const [showSaved, setShowSaved] = useState(false);

  const providers = getAvailableProviders();
  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];
  const fontSizes = [
    { value: 'small' as const, label: 'Small' },
    { value: 'medium' as const, label: 'Medium' },
    { value: 'large' as const, label: 'Large' },
  ];

  const handleSave = () => {
    updateProfile({
      preferences: {
        theme: theme,
        notifications,
        aiProvider,
        fontSize,
        language,
      },
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Customize your experience</p>
        </div>
        <button onClick={handleSave} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
          {showSaved ? <Check className="w-4 h-4" /> : null}
          {showSaved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm font-medium text-[var(--color-text)]">Theme</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  theme === opt.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <opt.icon className={`w-5 h-5 ${theme === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
                <span className={`text-xs font-medium ${theme === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm font-medium text-[var(--color-text)]">Font Size</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {fontSizes.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  fontSize === opt.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <span className={`text-sm font-medium ${fontSize === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notifications ? <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" /> : <BellOff className="w-5 h-5 text-[var(--color-text-muted)]" />}
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Push Notifications</p>
              <p className="text-xs text-[var(--color-text-muted)]">Get alerts about network issues</p>
            </div>
          </div>
          <ToggleSwitch enabled={notifications} onChange={setNotifications} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Sound Alerts</p>
              <p className="text-xs text-[var(--color-text-muted)]">Play sounds for critical alerts</p>
            </div>
          </div>
          <ToggleSwitch enabled={false} onChange={() => {}} />
        </div>
      </SettingSection>

      {/* AI Provider */}
      <SettingSection title="AI Assistant">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm font-medium text-[var(--color-text)]">AI Provider</span>
          </div>
          <div className="space-y-2">
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setAiProvider(provider.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  aiProvider === provider.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-medium ${aiProvider === provider.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                    {provider.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{provider.description}</p>
                </div>
                {aiProvider === provider.id && (
                  <Check className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Language */}
      <SettingSection title="Language & Region">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Language</p>
              <p className="text-xs text-[var(--color-text-muted)]">App display language</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="input-field !py-2 !pl-3 !pr-8 !w-auto text-sm appearance-none"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
        </div>
      </SettingSection>

      {/* About */}
      <SettingSection title="About">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">NetAssist</p>
            <p className="text-xs text-[var(--color-text-muted)]">Version 1.0.0</p>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
