import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, Activity, MapPin, Shield, ChevronRight,
  ArrowDown, ArrowUp, Clock, CheckCircle2, AlertTriangle, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNetworkStatus, getRecommendations, getQualityColor, formatSpeed, formatLatency } from '../services/network';
import type { NetworkStatus, Recommendation } from '../types';

function QualityBadge({ quality }: { quality: string }) {
  const color = getQualityColor(quality as any);
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {quality.charAt(0).toUpperCase() + quality.slice(1)}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: any;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      {subtext && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtext}</p>}
    </div>
  );
}

function RecommendationItem({ rec }: { rec: Recommendation }) {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
  };
  const color = priorityColors[rec.priority];
  const categoryIcons = {
    placement: MapPin,
    security: Shield,
    performance: Zap,
    general: Activity,
  };
  const Icon = categoryIcons[rec.category];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-[var(--color-border)] ${rec.isCompleted ? 'opacity-60' : ''}`}>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-medium text-[var(--color-text)] ${rec.isCompleted ? 'line-through' : ''}`}>
            {rec.title}
          </p>
          {rec.isCompleted && <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{rec.description}</p>
      </div>
      <span
        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {rec.priority}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [status, recs] = await Promise.all([
        getNetworkStatus(),
        getRecommendations(),
      ]);
      setNetworkStatus(status);
      setRecommendations(recs);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {greeting}, {user?.displayName?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Here's your network overview</p>
      </div>

      {/* Network status banner */}
      {networkStatus && (
        <div className="card mb-6 !p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-bg">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">{networkStatus.ssid || 'Not Connected'}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Current Network</p>
              </div>
            </div>
            <QualityBadge quality={networkStatus.quality} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[var(--color-text-secondary)] mb-1">
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="text-xs">Download</span>
              </div>
              <p className="text-lg font-bold text-[var(--color-text)]">{formatSpeed(networkStatus.downloadSpeed)}</p>
            </div>
            <div className="text-center border-x border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1 text-[var(--color-text-secondary)] mb-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="text-xs">Upload</span>
              </div>
              <p className="text-lg font-bold text-[var(--color-text)]">{formatSpeed(networkStatus.uploadSpeed)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[var(--color-text-secondary)] mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">Latency</span>
              </div>
              <p className="text-lg font-bold text-[var(--color-text)]">{formatLatency(networkStatus.latency)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link to="/placement" className="card !p-4 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-2">
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">Placement</span>
          <span className="text-xs text-[var(--color-text-muted)]">AI Assistant</span>
        </Link>
        <Link to="/network" className="card !p-4 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 mb-2">
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">Speed Test</span>
          <span className="text-xs text-[var(--color-text-muted)]">Check Quality</span>
        </Link>
        <Link to="/placement" className="card !p-4 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 mb-2">
            <Wifi className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">Connect</span>
          <span className="text-xs text-[var(--color-text-muted)]">BLE / NFC</span>
        </Link>
        <Link to="/settings" className="card !p-4 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 mb-2">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">Security</span>
          <span className="text-xs text-[var(--color-text-muted)]">Check & Fix</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={ArrowDown} label="Download" value={networkStatus ? formatSpeed(networkStatus.downloadSpeed) : '--'} color="#3b82f6" />
        <StatCard icon={ArrowUp} label="Upload" value={networkStatus ? formatSpeed(networkStatus.uploadSpeed) : '--'} color="#8b5cf6" />
        <StatCard icon={Clock} label="Latency" value={networkStatus ? formatLatency(networkStatus.latency) : '--'} color="#06b6d4" />
        <StatCard icon={Wifi} label="Signal" value={networkStatus ? `${Math.round(networkStatus.signalStrength)} dBm` : '--'} color="#10b981" />
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Recommendations</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {recommendations.filter(r => !r.isCompleted).length} items need attention
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
        </div>
        <div className="space-y-3">
          {recommendations.map(rec => (
            <RecommendationItem key={rec.id} rec={rec} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/placement"
        className="card flex items-center justify-between !p-5 gradient-bg !border-0 group no-underline"
      >
        <div>
          <h3 className="text-white font-semibold text-lg">Need help with setup?</h3>
          <p className="text-white/80 text-sm mt-1">Our AI assistant can guide you step by step</p>
        </div>
        <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
