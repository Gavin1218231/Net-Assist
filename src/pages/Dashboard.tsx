import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, MapPin, ChevronRight, ArrowDown, ArrowUp, Clock,
  Play, RotateCcw, BookOpen, Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getNetworkStatus, getRecommendations, runSpeedTest, getQualityFromSpeed,
  getQualityColor, getQualityLabel, getBandLabel, formatSpeed, formatLatency,
} from '../services/network';
import type { NetworkStatus, Recommendation, SpeedTestResult, WifiBand } from '../types';

const BANDS: WifiBand[] = ['2.4ghz', '5ghz', '6ghz'];

export default function Dashboard() {
  const { user } = useAuth();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Speed test state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedBand, setSelectedBand] = useState<WifiBand>('5ghz');
  const [speedResult, setSpeedResult] = useState<SpeedTestResult | null>(null);

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

  const handleSpeedTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setSpeedResult(null);
    const result = await runSpeedTest(setProgress, selectedBand);
    setSpeedResult(result);
    // Update the network status card with fresh results
    setNetworkStatus(prev => prev ? {
      ...prev,
      band: result.band,
      downloadSpeed: result.downloadSpeed,
      uploadSpeed: result.uploadSpeed,
      latency: result.latency,
      quality: getQualityFromSpeed(result.downloadSpeed),
    } : prev);
    setIsRunning(false);
  };

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

  const pendingRecs = recommendations.filter(r => !r.isCompleted);

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {greeting}, {user?.displayName?.split(' ')[0] || 'there'}
        </h1>
      </div>

      {/* ── Network status card ── */}
      {networkStatus && (
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl gradient-bg">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--color-text)] truncate">{networkStatus.ssid}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{getBandLabel(networkStatus.band)} band</p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
              style={{ backgroundColor: `${getQualityColor(networkStatus.quality)}20`, color: getQualityColor(networkStatus.quality) }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getQualityColor(networkStatus.quality) }} />
              {getQualityLabel(networkStatus.quality)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3 text-center">
              <ArrowDown className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Down</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{formatSpeed(networkStatus.downloadSpeed)}</p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3 text-center">
              <ArrowUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Up</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{formatSpeed(networkStatus.uploadSpeed)}</p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3 text-center">
              <Clock className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Ping</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{formatLatency(networkStatus.latency)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick speed test ── */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--color-text)]">Speed Test</h2>
          <Link to="/network" className="text-xs text-[var(--color-primary)] font-medium hover:underline no-underline">
            Full details
          </Link>
        </div>

        {/* Band selector */}
        <div className="flex gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl mb-4">
          {BANDS.map(band => (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedBand === band
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Radio className="w-3 h-3" />
              {getBandLabel(band)}
            </button>
          ))}
        </div>

        {/* Progress bar while running */}
        {isRunning && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">
                {progress < 50 ? 'Testing download...' : progress < 90 ? 'Testing upload...' : 'Measuring latency...'}
              </span>
              <span className="text-xs font-medium text-[var(--color-primary)]">{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
              <div className="h-full rounded-full gradient-bg transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Result summary */}
        {speedResult && !isRunning && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-text)]">{formatSpeed(speedResult.downloadSpeed)}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Download</p>
            </div>
            <div className="text-center border-x border-[var(--color-border)]">
              <p className="text-lg font-bold text-[var(--color-text)]">{formatSpeed(speedResult.uploadSpeed)}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Upload</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-text)]">{formatLatency(speedResult.latency)}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Latency</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSpeedTest}
          disabled={isRunning}
          className="btn-primary w-full flex items-center justify-center gap-2 !py-2.5 text-sm"
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              Running on {getBandLabel(selectedBand)}...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {speedResult ? 'Run Again' : 'Run Speed Test'}
            </>
          )}
        </button>
      </div>

      {/* ── Quick links row ── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Link to="/placement" className="card !p-3 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-1.5">
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xs font-medium text-[var(--color-text)]">Placement</span>
        </Link>
        <Link to="/guides" className="card !p-3 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 mb-1.5">
            <BookOpen className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-xs font-medium text-[var(--color-text)]">Setup Guides</span>
        </Link>
        <Link to="/network" className="card !p-3 flex flex-col items-center text-center hover:scale-[1.02] transition-transform no-underline">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 mb-1.5">
            <Wifi className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-xs font-medium text-[var(--color-text)]">Network</span>
        </Link>
      </div>

      {/* ── Top recommendations (max 3) ── */}
      {pendingRecs.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[var(--color-text)]">Recommendations</h2>
            <span className="text-xs text-[var(--color-text-muted)]">{pendingRecs.length} items</span>
          </div>
          <div className="space-y-2.5">
            {pendingRecs.slice(0, 3).map(rec => {
              const color = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#3b82f6';
              return (
                <div key={rec.id} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)]">{rec.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {pendingRecs.length > 3 && (
            <p className="text-xs text-[var(--color-primary)] mt-3 font-medium">+{pendingRecs.length - 3} more</p>
          )}
        </div>
      )}

      {/* ── CTA banner ── */}
      <Link
        to="/guides"
        className="card flex items-center justify-between !p-4 gradient-bg !border-0 group no-underline"
      >
        <div>
          <h3 className="text-white font-semibold">New to internet setup?</h3>
          <p className="text-white/80 text-xs mt-0.5">Follow our step-by-step guides for your connection type</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
