// Lightweight localStorage cache for coverage / speed-test results.
// Persists the last result and a short history so users see continuity
// across navigations without re-running expensive tests.

import type { RealCoverageReport } from './realCoverage';

const KEY = 'netassist:coverage:v1';
const HISTORY_LIMIT = 20;

interface CachedShape {
  current?: RealCoverageReport;
  history: RealCoverageReport[];
}

function read(): CachedShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { history: [] };
    const parsed = JSON.parse(raw) as CachedShape;
    if (!parsed.history) parsed.history = [];
    return parsed;
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
  state.current = report;
  state.history = [report, ...state.history.filter(r => r.generatedAt !== report.generatedAt)].slice(0, HISTORY_LIMIT);
  write(state);
}

export function getCurrentCoverageReport(): RealCoverageReport | undefined {
  return read().current;
}

export function getCoverageHistory(): RealCoverageReport[] {
  return read().history;
}

export function clearCoverageHistory(): void {
  write({ history: [] });
}
