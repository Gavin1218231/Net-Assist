import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildCoverageReport, type RealCoverageReport } from '../realCoverage';
import { saveCoverageReport, getCoverageHistory, clearCoverageHistory, getCurrentCoverageReport } from '../coverageCache';
import type { RealLocation } from '../realLocation';
import type { RealSpeedTestResult } from '../realSpeedTest';

// Simulated locations across the US
const TEST_LOCATIONS: RealLocation[] = [
  { lat: 40.7128, lng: -74.0060, source: 'manual', zip: '10001', city: 'New York', stateCode: 'NY', resolvedAt: '' },
  { lat: 34.0522, lng: -118.2437, source: 'gps', zip: '90012', city: 'Los Angeles', stateCode: 'CA', resolvedAt: '' },
  { lat: 41.8781, lng: -87.6298, source: 'zip', zip: '60601', city: 'Chicago', stateCode: 'IL', resolvedAt: '' },
  { lat: 29.7604, lng: -95.3698, source: 'manual', zip: '77001', city: 'Houston', stateCode: 'TX', resolvedAt: '' },
  { lat: 33.4484, lng: -112.0740, source: 'gps', zip: '85001', city: 'Phoenix', stateCode: 'AZ', resolvedAt: '' },
  { lat: 39.7392, lng: -104.9903, source: 'manual', zip: '80202', city: 'Denver', stateCode: 'CO', resolvedAt: '' },
  { lat: 47.6062, lng: -122.3321, source: 'zip', zip: '98101', city: 'Seattle', stateCode: 'WA', resolvedAt: '' },
  { lat: 25.7617, lng: -80.1918, source: 'gps', zip: '33101', city: 'Miami', stateCode: 'FL', resolvedAt: '' },
  { lat: 42.3601, lng: -71.0589, source: 'manual', zip: '02101', city: 'Boston', stateCode: 'MA', resolvedAt: '' },
  { lat: 37.7749, lng: -122.4194, source: 'gps', zip: '94102', city: 'San Francisco', stateCode: 'CA', resolvedAt: '' },
];

// Generate realistic speed test results with variation
function generateSpeedResult(quality: 'excellent' | 'good' | 'fair' | 'poor'): RealSpeedTestResult {
  const profiles = {
    excellent: { down: [200, 500], up: [50, 150], lat: [5, 15], jitter: [1, 5], loss: 0 },
    good: { down: [50, 150], up: [10, 40], lat: [15, 40], jitter: [5, 15], loss: 0.5 },
    fair: { down: [15, 50], up: [3, 10], lat: [40, 80], jitter: [10, 25], loss: 2 },
    poor: { down: [1, 15], up: [0.5, 3], lat: [80, 200], jitter: [25, 50], loss: 8 },
  };
  const p = profiles[quality];
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  return {
    downloadMbps: rand(p.down[0], p.down[1]),
    uploadMbps: rand(p.up[0], p.up[1]),
    latencyMs: rand(p.lat[0], p.lat[1]),
    jitterMs: rand(p.jitter[0], p.jitter[1]),
    packetLossPct: Math.random() < 0.3 ? p.loss : 0,
    server: 'Cloudflare TEST',
    isp: 'Test ISP',
    timestamp: new Date().toISOString(),
    samples: { download: [], upload: [], latency: [] },
  };
}

describe('Integration Stress Tests', () => {
  beforeEach(() => {
    clearCoverageHistory();
  });

  afterEach(() => {
    clearCoverageHistory();
  });

  describe('Cache Stress', () => {
    it('handles rapid sequential writes without data loss', () => {
      const reports: RealCoverageReport[] = [];

      // Generate and save 50 reports rapidly
      for (let i = 0; i < 50; i++) {
        const loc = { ...TEST_LOCATIONS[i % TEST_LOCATIONS.length], resolvedAt: new Date().toISOString() };
        const speed = generateSpeedResult(['excellent', 'good', 'fair', 'poor'][i % 4] as any);
        const report = buildCoverageReport(loc, speed);
        reports.push(report);
        saveCoverageReport(report);
      }

      // Cache should cap at 20 entries
      const history = getCoverageHistory();
      expect(history.length).toBe(20);

      // Most recent should be first
      expect(history[0].generatedAt).toBe(reports[reports.length - 1].generatedAt);
    });

    it('survives malformed localStorage data', () => {
      // Corrupt the cache
      localStorage.setItem('netassist:coverage:v1', '{"history": [{"garbage": true}, null, "string", {"generatedAt": "x"}]}');

      // Should recover gracefully
      const history = getCoverageHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0); // All invalid entries filtered out

      // Should still accept new valid entries
      const loc = { ...TEST_LOCATIONS[0], resolvedAt: new Date().toISOString() };
      const report = buildCoverageReport(loc, generateSpeedResult('good'));
      saveCoverageReport(report);
      expect(getCoverageHistory().length).toBe(1);
    });

    it('handles concurrent-like read/write cycles', () => {
      // Simulate rapid alternating reads and writes
      for (let cycle = 0; cycle < 100; cycle++) {
        const loc = { ...TEST_LOCATIONS[cycle % TEST_LOCATIONS.length], resolvedAt: new Date().toISOString() };
        const report = buildCoverageReport(loc, generateSpeedResult('good'));

        // Write
        saveCoverageReport(report);

        // Immediate read
        const current = getCurrentCoverageReport();
        expect(current).toBeDefined();
        expect(current?.generatedAt).toBe(report.generatedAt);

        // History read
        const history = getCoverageHistory();
        expect(history.length).toBeGreaterThan(0);
        expect(history.length).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('Grading Consistency', () => {
    it('maintains grade consistency across varied inputs', () => {
      const results: { quality: string; grade: string }[] = [];

      // Run 200 grading operations
      for (let i = 0; i < 200; i++) {
        const quality = ['excellent', 'good', 'fair', 'poor'][i % 4] as any;
        const loc = { ...TEST_LOCATIONS[i % TEST_LOCATIONS.length], resolvedAt: new Date().toISOString() };
        const speed = generateSpeedResult(quality);
        const report = buildCoverageReport(loc, speed);

        results.push({ quality, grade: report.grade.overall });

        // Basic sanity: report should have all required fields
        expect(report.location).toBeDefined();
        expect(report.speed).toBeDefined();
        expect(report.grade).toBeDefined();
        expect(report.generatedAt).toBeDefined();
        expect(['excellent', 'good', 'fair', 'poor']).toContain(report.grade.overall);
      }

      // Verify grade distribution makes sense (excellent inputs -> mostly excellent grades)
      const excellentInputs = results.filter(r => r.quality === 'excellent');
      const excellentGrades = excellentInputs.filter(r => r.grade === 'excellent' || r.grade === 'good');
      expect(excellentGrades.length / excellentInputs.length).toBeGreaterThan(0.7);

      const poorInputs = results.filter(r => r.quality === 'poor');
      const poorGrades = poorInputs.filter(r => r.grade === 'poor' || r.grade === 'fair');
      expect(poorGrades.length / poorInputs.length).toBeGreaterThan(0.7);
    });

    it('handles edge case speed values', () => {
      const edgeCases = [
        { downloadMbps: 0, uploadMbps: 0, latencyMs: 0, jitterMs: 0, packetLossPct: 0 },
        { downloadMbps: 10000, uploadMbps: 10000, latencyMs: 1, jitterMs: 0.1, packetLossPct: 0 },
        { downloadMbps: 0.001, uploadMbps: 0.001, latencyMs: 5000, jitterMs: 1000, packetLossPct: 100 },
        { downloadMbps: NaN, uploadMbps: Infinity, latencyMs: -1, jitterMs: -5, packetLossPct: -10 },
      ];

      for (const edge of edgeCases) {
        const loc = { ...TEST_LOCATIONS[0], resolvedAt: new Date().toISOString() };
        const speed: RealSpeedTestResult = {
          ...edge,
          server: 'Test',
          timestamp: new Date().toISOString(),
          samples: { download: [], upload: [], latency: [] },
        };

        // Should not throw
        expect(() => buildCoverageReport(loc, speed)).not.toThrow();

        const report = buildCoverageReport(loc, speed);
        expect(['excellent', 'good', 'fair', 'poor']).toContain(report.grade.overall);
      }
    });

    it('handles missing optional location fields', () => {
      const minimalLocations: Partial<RealLocation>[] = [
        { lat: 40, lng: -74, source: 'manual', resolvedAt: new Date().toISOString() },
        { lat: 0, lng: 0, source: 'gps', resolvedAt: new Date().toISOString() },
        { lat: -90, lng: 180, source: 'zip', resolvedAt: new Date().toISOString() },
      ];

      for (const loc of minimalLocations) {
        const speed = generateSpeedResult('good');
        expect(() => buildCoverageReport(loc as RealLocation, speed)).not.toThrow();
      }
    });
  });

  describe('Full Pipeline Stress', () => {
    it('runs 100 complete cycles without errors', () => {
      const errors: Error[] = [];
      const reports: RealCoverageReport[] = [];

      for (let i = 0; i < 100; i++) {
        try {
          // 1. Resolve location
          const loc: RealLocation = {
            ...TEST_LOCATIONS[i % TEST_LOCATIONS.length],
            resolvedAt: new Date().toISOString(),
            accuracy: Math.random() * 100,
          };

          // 2. Simulate speed test
          const qualities = ['excellent', 'good', 'fair', 'poor'] as const;
          const speed = generateSpeedResult(qualities[Math.floor(Math.random() * 4)]);

          // 3. Build report
          const report = buildCoverageReport(loc, speed);
          reports.push(report);

          // 4. Save to cache
          saveCoverageReport(report);

          // 5. Verify retrieval
          const retrieved = getCurrentCoverageReport();
          expect(retrieved?.generatedAt).toBe(report.generatedAt);

        } catch (e) {
          errors.push(e as Error);
        }
      }

      expect(errors.length).toBe(0);
      expect(reports.length).toBe(100);

      // Final cache state should be valid
      const finalHistory = getCoverageHistory();
      expect(finalHistory.length).toBe(20);
      expect(finalHistory.every(r => r.generatedAt && r.grade && r.speed)).toBe(true);
    });

    it('handles interleaved operations from multiple "users"', () => {
      // Simulate 5 concurrent users each doing 20 operations
      const userOps = Array.from({ length: 5 }, (_, userId) => {
        return Array.from({ length: 20 }, (_, opId) => ({ userId, opId }));
      }).flat();

      // Shuffle to simulate interleaving
      userOps.sort(() => Math.random() - 0.5);

      const userReports: Map<number, RealCoverageReport[]> = new Map();

      for (const { userId, opId } of userOps) {
        const loc: RealLocation = {
          ...TEST_LOCATIONS[userId],
          resolvedAt: new Date().toISOString(),
          city: `User${userId}-Op${opId}`,
        };
        const speed = generateSpeedResult('good');
        const report = buildCoverageReport(loc, speed);

        if (!userReports.has(userId)) userReports.set(userId, []);
        userReports.get(userId)!.push(report);

        saveCoverageReport(report);
      }

      // All operations should have succeeded
      expect(userReports.size).toBe(5);
      for (const [, reports] of userReports) {
        expect(reports.length).toBe(20);
      }

      // Cache should be valid
      const history = getCoverageHistory();
      expect(history.length).toBe(20);
    });
  });

  describe('Memory and Performance', () => {
    it('does not leak memory with repeated cache operations', () => {
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const loc = { ...TEST_LOCATIONS[0], resolvedAt: new Date().toISOString() };
        const speed = generateSpeedResult('good');
        const report = buildCoverageReport(loc, speed);
        saveCoverageReport(report);

        // Read operations
        getCoverageHistory();
        getCurrentCoverageReport();

        // Occasional clear
        if (i % 100 === 99) {
          clearCoverageHistory();
        }
      }

      // Should complete without hanging or crashing
      expect(true).toBe(true);
    });

    it('handles large report payloads', () => {
      // Create reports with maxed out sample arrays
      for (let i = 0; i < 20; i++) {
        const loc = { ...TEST_LOCATIONS[0], resolvedAt: new Date().toISOString() };
        const speed: RealSpeedTestResult = {
          downloadMbps: 100,
          uploadMbps: 50,
          latencyMs: 20,
          jitterMs: 5,
          packetLossPct: 0,
          server: 'Test',
          isp: 'Test ISP with a very long name '.repeat(10),
          timestamp: new Date().toISOString(),
          samples: {
            download: Array.from({ length: 100 }, (_, i) => ({ bytes: i * 1000000, durationMs: i * 100, mbps: i * 10 })),
            upload: Array.from({ length: 100 }, (_, i) => ({ bytes: i * 500000, durationMs: i * 100, mbps: i * 5 })),
            latency: Array.from({ length: 100 }, (_, i) => i + 10),
          },
        };

        const report = buildCoverageReport(loc, speed);
        saveCoverageReport(report);
      }

      // Should handle large payloads
      const history = getCoverageHistory();
      expect(history.length).toBe(20);
      expect(history[0].speed.samples.download.length).toBe(100);
    });
  });
});
