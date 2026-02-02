import { useState, useEffect } from 'react';
import {
  Activity, ArrowDown, ArrowUp, Clock, Gauge, Play,
  RotateCcw, Wifi, TrendingUp, BarChart3,
} from 'lucide-react';
import { runSpeedTest, getNetworkStatus, getQualityColor, getQualityLabel, formatSpeed, formatLatency } from '../services/network';
import type { NetworkStatus, SpeedTestResult, NetworkQuality } from '../types';

function GaugeChart({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="120" viewBox="0 0 160 160">
        {/* Background arc */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          transform="rotate(135 80 80)"
        />
        {/* Value arc */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(135 80 80)"
          className="transition-all duration-1000 ease-out"
        />
        {/* Value text */}
        <text x="80" y="75" textAnchor="middle" className="fill-[var(--color-text)]" fontSize="28" fontWeight="700">
          {value.toFixed(1)}
        </text>
        <text x="80" y="95" textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="11">
          {label}
        </text>
      </svg>
    </div>
  );
}

function SignalBar({ strength, label }: { strength: number; label: string }) {
  const normalized = Math.max(0, Math.min(100, ((strength + 100) / 60) * 100));
  const quality: NetworkQuality =
    normalized > 80 ? 'excellent' : normalized > 60 ? 'good' : normalized > 40 ? 'fair' : normalized > 20 ? 'poor' : 'none';
  const color = getQualityColor(quality);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-sm font-medium" style={{ color }}>
          {getQualityLabel(quality)}
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${normalized}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function NetworkCheck() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [speedResult, setSpeedResult] = useState<SpeedTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetworkStatus().then(status => {
      setNetworkStatus(status);
      setLoading(false);
    });
  }, []);

  const handleSpeedTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setSpeedResult(null);

    const result = await runSpeedTest(setProgress);
    setSpeedResult(result);
    setHistory(prev => [result, ...prev].slice(0, 10));
    setIsRunning(false);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Checking network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Network Quality</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Test and monitor your connection</p>
      </div>

      {/* Current connection */}
      {networkStatus && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl gradient-bg">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">{networkStatus.ssid}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Connected</p>
            </div>
            <div className="ml-auto">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `${getQualityColor(networkStatus.quality)}20`,
                  color: getQualityColor(networkStatus.quality),
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getQualityColor(networkStatus.quality) }} />
                {getQualityLabel(networkStatus.quality)}
              </span>
            </div>
          </div>

          <SignalBar strength={networkStatus.signalStrength} label="Signal Strength" />
        </div>
      )}

      {/* Speed test */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Speed Test</h2>
          <button
            onClick={handleSpeedTest}
            disabled={isRunning}
            className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Test
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {progress < 50 ? 'Testing download...' : progress < 90 ? 'Testing upload...' : 'Measuring latency...'}
              </span>
              <span className="text-sm font-medium text-[var(--color-primary)]">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full gradient-bg transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {speedResult && !isRunning && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <GaugeChart
                value={speedResult.downloadSpeed}
                max={200}
                label="Mbps Download"
                color="#3b82f6"
              />
              <GaugeChart
                value={speedResult.uploadSpeed}
                max={100}
                label="Mbps Upload"
                color="#8b5cf6"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <ArrowDown className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-[var(--color-text-muted)]">Download</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{formatSpeed(speedResult.downloadSpeed)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <ArrowUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-[var(--color-text-muted)]">Upload</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{formatSpeed(speedResult.uploadSpeed)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <Clock className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                <p className="text-xs text-[var(--color-text-muted)]">Latency</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{formatLatency(speedResult.latency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <Activity className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-[var(--color-text-muted)]">Jitter</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{formatLatency(speedResult.jitter)}</p>
              </div>
            </div>
          </div>
        )}

        {!speedResult && !isRunning && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mx-auto mb-4">
              <Gauge className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-secondary)] mb-1">Ready to test your speed</p>
            <p className="text-sm text-[var(--color-text-muted)]">Tap "Run Test" to measure your connection</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Test History</h2>
          </div>
          <div className="space-y-3">
            {history.map((test, idx) => (
              <div key={test.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-6">{idx + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {formatSpeed(test.downloadSpeed)} / {formatSpeed(test.uploadSpeed)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(test.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {formatLatency(test.latency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
