// Lightweight localStorage cache for coverage / speed-test results.
// Persists a rolling history so users see continuity across navigations
// without re-running expensive tests.

import type { RealCoverageReport } from './realCoverage';

const KEY = 'netassist:coverage:v1';
const HISTORY_LIMIT = 20;

interface CachedShape {
  history: RealCoverageReport[];
}

function isReport(value: unknown): value is RealCoverageReport {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<RealCoverageReport>;
  return typeof r.id === 'string' && typeof r.generatedAt === 'string' && !!r.speed && !!r.location && !!r.grade;
}

function read(): CachedShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { history: [] };
    const parsed = JSON.parse(raw) as Partial<CachedShape>;
    const history = Array.isArray(parsed.history) ? parsed.history.filter(isReport) : [];
    return { history };
  } catch {
    return { history: [] };
  }
}

function write(value: CachedShape): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Quota or disabled storage -- silently ignore for a POC.
  }
}

export function saveCoverageReport(report: RealCoverageReport): void {
  const state = read();
  state.history = [
    report,
    ...state.history.filter(r => r.id !== report.id),
  ].slice(0, HISTORY_LIMIT);
  write(state);
}

export function getCurrentCoverageReport(): RealCoverageReport | undefined {
  return read().history[0];
}

export function getCoverageHistory(): RealCoverageReport[] {
  return read().history;
}

export function clearCoverageHistory(): void {
  write({ history: [] });
}
