import { useState, useEffect, useRef } from 'react';
import {
  Activity, ArrowDown, ArrowUp, Clock, Gauge, MapPin,
  Play, Radio, RotateCcw, Server, Signal, Wifi, AlertCircle,
} from 'lucide-react';
import { runRealSpeedTest } from '../services/realSpeedTest';
import type { RealSpeedTestProgress, RealSpeedTestResult } from '../services/realSpeedTest';
import {
  resolveCurrentLocation, resolveZipOrAddress,
} from '../services/realLocation';
import type { RealLocation } from '../services/realLocation';
import {
  buildCoverageReport, getCarrierSignal, getConnectionClass,
} from '../services/realCoverage';
import type { RealCoverageReport } from '../services/realCoverage';
import {
  saveCoverageReport, getCurrentCoverageReport, getCoverageHistory,
} from '../services/coverageCache';

function formatMbps(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} Gbps`;
  return `${value.toFixed(1)} Mbps`;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('Excellent') || grade.startsWith('Very good')) return '#10b981';
  if (grade.startsWith('Good')) return '#22c55e';
  if (grade.startsWith('Fair') || grade.startsWith('Basic')) return '#f59e0b';
  if (grade.startsWith('Poor')) return '#f97316';
  return '#ef4444';
}

function overallColor(overall: RealCoverageReport['grade']['overall']): string {
  const map: Record<RealCoverageReport['grade']['overall'], string> = {
    excellent: '#10b981',
    good: '#22c55e',
    fair: '#f59e0b',
    poor: '#ef4444',
    unknown: '#94a3b8',
  };
  return map[overall];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  accent?: string;
}

function StatCard({ icon, label, value, subtext, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>
        <div style={{ color: accent ?? 'var(--color-accent)' }}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
      {subtext && <div className="mt-1 text-xs" style={{ color: accent ?? 'var(--color-text-muted)' }}>{subtext}</div>}
    </div>
  );
}

export default function RealTimeCoverage() {
  const [location, setLocation] = useState<RealLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<RealSpeedTestProgress | null>(null);
  const [result, setResult] = useState<RealSpeedTestResult | null>(null);
  const [report, setReport] = useState<RealCoverageReport | null>(null);
  const [history, setHistory] = useState<RealCoverageReport[]>([]);
  const [testError, setTestError] = useState<string | null>(null);

  // Guards so we never call setState after unmount and can cancel the in-flight
  // speed test (100+ MB of transfers) if the user navigates away mid-run.
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = getCurrentCoverageReport();
    if (cached) {
      setReport(cached);
      setResult(cached.speed);
      setLocation(cached.location);
    }
    setHistory(getCoverageHistory());
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  async function locateMe() {
    setLocating(true);
    setLocationError(null);
    try {
      const loc = await resolveCurrentLocation();
      if (mountedRef.current) setLocation(loc);
    } catch (err) {
      if (mountedRef.current) setLocationError(err instanceof Error ? err.message : 'Could not get your location');
    } finally {
      if (mountedRef.current) setLocating(false);
    }
  }

  async function lookupManual() {
    if (locating || running || !manualInput.trim()) return;
    setLocating(true);
    setLocationError(null);
    try {
      const loc = await resolveZipOrAddress(manualInput);
      if (mountedRef.current) setLocation(loc);
    } catch (err) {
      if (mountedRef.current) setLocationError(err instanceof Error ? err.message : 'Could not resolve that location');
    } finally {
      if (mountedRef.current) setLocating(false);
    }
  }

  async function runTest() {
    if (!location) {
      setTestError('Choose a location first so the result can be tagged.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setTestError(null);
    setResult(null);
    setProgress({ phase: 'latency', percent: 0 });
    try {
      const [speed, carrier] = await Promise.all([
        runRealSpeedTest(p => { if (mountedRef.current) setProgress(p); }, controller.signal),
        getCarrierSignal(controller.signal),
      ]);
      if (!mountedRef.current) return;
      setResult(speed);
      const conn = getConnectionClass();
      const built = buildCoverageReport(location, speed, carrier, conn);
      setReport(built);
      saveCoverageReport(built);
      setHistory(getCoverageHistory());
      setProgress({ phase: 'done', percent: 100 });
    } catch (err) {
      // A cancel from unmount/navigation isn't a user-facing error.
      if (controller.signal.aborted || !mountedRef.current) return;
      setTestError(err instanceof Error ? err.message : 'Speed test failed');
      setProgress(null);
    } finally {
      if (mountedRef.current) setRunning(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">Real-Time Coverage</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Live speed test via Cloudflare + location resolution via the US Census Geocoder.
          No mocked data — everything below is measured on this device, right now.
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
        <h2 className="font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
          <MapPin size={18} /> Location
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={locateMe}
            disabled={locating || running}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2 justify-center"
          >
            <MapPin size={16} />
            {locating ? 'Locating…' : 'Use my GPS location'}
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupManual()}
              placeholder="ZIP code or full address"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <button
              onClick={lookupManual}
              disabled={locating || running || !manualInput.trim()}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"
            >
              Look up
            </button>
          </div>
        </div>
        {locationError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-500">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
        {location && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">City / State</div>
              <div className="text-[var(--color-text)] font-medium">{location.city ?? '—'}, {location.stateCode ?? location.state ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">County</div>
              <div className="text-[var(--color-text)] font-medium">{location.county ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">ZIP / ZCTA</div>
              <div className="text-[var(--color-text)] font-medium">{location.zcta ?? location.zip ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Coordinates</div>
              <div className="text-[var(--color-text)] font-medium font-mono text-xs">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Activity size={18} /> Live measurement
          </h2>
          {result && (
            <button
              onClick={runTest}
              disabled={running || !location}
              className="text-sm flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <RotateCcw size={14} /> Run again
            </button>
          )}
        </div>

        {!result && !running && (
          <button
            onClick={runTest}
            disabled={!location}
            className="w-full py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2 justify-center"
          >
            <Play size={18} />
            {location ? 'Start real-time speed test' : 'Pick a location first'}
          </button>
        )}

        {running && progress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text)] font-medium capitalize">
                {progress.phase === 'latency' && 'Probing latency…'}
                {progress.phase === 'download' && 'Measuring download throughput…'}
                {progress.phase === 'upload' && 'Measuring upload throughput…'}
                {progress.phase === 'done' && 'Finalising…'}
              </span>
              <span className="text-[var(--color-text-muted)]">{progress.percent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="text-center py-4">
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Live throughput</div>
              <span className="text-3xl font-bold text-[var(--color-text)]">
                {progress.currentMbps ? `${progress.currentMbps.toFixed(0)} Mbps` : '— Mbps'}
              </span>
              {progress.latencyMs !== undefined && (
                <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Latency: {progress.latencyMs.toFixed(0)} ms
                </div>
              )}
            </div>
          </div>
        )}

        {testError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-500">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{testError}</span>
          </div>
        )}

        {result && !running && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            <StatCard
              icon={<ArrowDown size={16} />}
              label="Download"
              value={formatMbps(result.downloadMbps)}
              subtext={`from ${result.server}`}
              accent="#10b981"
            />
            <StatCard
              icon={<ArrowUp size={16} />}
              label="Upload"
              value={formatMbps(result.uploadMbps)}
              accent="#3b82f6"
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Latency"
              value={`${result.latencyMs.toFixed(0)} ms`}
              subtext={`jitter ${result.jitterMs.toFixed(1)} ms`}
              accent="#f59e0b"
            />
            <StatCard
              icon={<Signal size={16} />}
              label="Packet loss"
              value={`${result.packetLossPct.toFixed(1)}%`}
              accent={result.packetLossPct > 1 ? '#ef4444' : '#22c55e'}
            />
          </div>
        )}
      </section>

      {report && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Gauge size={18} /> Coverage analysis
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: overallColor(report.grade.overall) }}
            />
            <span className="text-lg font-semibold capitalize text-[var(--color-text)]">
              {report.grade.overall}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">overall</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Download</div>
              <div style={{ color: gradeColor(report.grade.downloadGrade) }} className="font-medium">
                {report.grade.downloadGrade}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Upload</div>
              <div style={{ color: gradeColor(report.grade.uploadGrade) }} className="font-medium">
                {report.grade.uploadGrade}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Latency</div>
              <div style={{ color: gradeColor(report.grade.latencyGrade) }} className="font-medium">
                {report.grade.latencyGrade}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Jitter</div>
              <div style={{ color: gradeColor(report.grade.jitterGrade) }} className="font-medium">
                {report.grade.jitterGrade}
              </div>
            </div>
          </div>

          {report.grade.notes.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
              {report.grade.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-text-muted)] flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm border-t border-[var(--color-border)] pt-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] flex items-center gap-1">
                <Radio size={12} /> ISP / Carrier
              </div>
              <div className="text-[var(--color-text)] font-medium">
                {report.carrier?.carrier ?? 'Unknown'}
              </div>
              {report.carrier?.asn && (
                <div className="text-xs text-[var(--color-text-muted)]">AS{report.carrier.asn}</div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] flex items-center gap-1">
                <Wifi size={12} /> Connection class
              </div>
              <div className="text-[var(--color-text)] font-medium">
                {report.connection?.effectiveType ?? 'unknown'}
              </div>
              {report.connection?.downlink !== undefined && (
                <div className="text-xs text-[var(--color-text-muted)]">
                  Browser estimate: {report.connection.downlink} Mbps
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] flex items-center gap-1">
                <Server size={12} /> Test server
              </div>
              <div className="text-[var(--color-text)] font-medium">{report.speed.server}</div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {new Date(report.generatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </section>
      )}

      {history.length > 1 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-3">Recent tests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Location</th>
                  <th className="py-2 pr-3">Down</th>
                  <th className="py-2 pr-3">Up</th>
                  <th className="py-2 pr-3">Latency</th>
                  <th className="py-2 pr-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2 pr-3 text-[var(--color-text-secondary)]">
                      {new Date(h.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-[var(--color-text-secondary)]">
                      {h.location.city ?? h.location.zcta ?? `${h.location.lat.toFixed(2)}, ${h.location.lng.toFixed(2)}`}
                    </td>
                    <td className="py-2 pr-3 text-[var(--color-text)] font-medium">
                      {formatMbps(h.speed.downloadMbps)}
                    </td>
                    <td className="py-2 pr-3 text-[var(--color-text)] font-medium">
                      {formatMbps(h.speed.uploadMbps)}
                    </td>
                    <td className="py-2 pr-3 text-[var(--color-text)] font-medium">
                      {h.speed.latencyMs.toFixed(0)} ms
                    </td>
                    <td className="py-2 pr-3 capitalize" style={{ color: overallColor(h.grade.overall) }}>
                      {h.grade.overall}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
