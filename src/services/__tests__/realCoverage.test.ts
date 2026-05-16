import { describe, it, expect } from 'vitest';
import { buildCoverageReport } from '../realCoverage';
import type { RealLocation } from '../realLocation';
import type { RealSpeedTestResult } from '../realSpeedTest';

const loc: RealLocation = {
  lat: 40.7128,
  lng: -74.0060,
  source: 'manual',
  zcta: '10001',
  zip: '10001',
  city: 'New York',
  stateCode: 'NY',
  resolvedAt: new Date().toISOString(),
};

function speed(overrides: Partial<RealSpeedTestResult>): RealSpeedTestResult {
  return {
    downloadMbps: 250,
    uploadMbps: 50,
    latencyMs: 15,
    jitterMs: 3,
    packetLossPct: 0,
    server: 'Cloudflare EWR',
    timestamp: new Date().toISOString(),
    samples: { download: [], upload: [], latency: [] },
    ...overrides,
  };
}

describe('buildCoverageReport', () => {
  it('grades a fast, stable link as excellent', () => {
    const report = buildCoverageReport(loc, speed({}));
    expect(report.grade.overall).toBe('excellent');
    expect(report.grade.downloadGrade).toMatch(/Very good|Excellent/);
  });

  it('downgrades when packet loss is high', () => {
    const report = buildCoverageReport(loc, speed({ packetLossPct: 8 }));
    expect(report.grade.overall).toBe('poor');
  });

  it('flags asymmetric uploads in the notes', () => {
    const report = buildCoverageReport(loc, speed({ downloadMbps: 500, uploadMbps: 10 }));
    expect(report.grade.notes.some(n => /asymmetric/i.test(n))).toBe(true);
  });

  it('falls into fair when speeds clear FCC baseline but not much more', () => {
    const report = buildCoverageReport(loc, speed({
      downloadMbps: 30,
      uploadMbps: 5,
      latencyMs: 60,
    }));
    expect(report.grade.overall).toBe('fair');
  });

  it('calls out high jitter explicitly', () => {
    const report = buildCoverageReport(loc, speed({ jitterMs: 35 }));
    expect(report.grade.notes.some(n => /jitter/i.test(n))).toBe(true);
  });

  it('includes ZCTA in notes when resolved', () => {
    const report = buildCoverageReport(loc, speed({}));
    expect(report.grade.notes.some(n => n.includes('10001'))).toBe(true);
  });
});
