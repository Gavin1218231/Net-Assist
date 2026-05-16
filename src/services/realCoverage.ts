// Real coverage signal aggregation. Combines:
//   - Real geolocation + Census reverse geocoding
//   - Real ISP / ASN detection via Cloudflare meta endpoint
//   - Real connection class via the Network Information API
//   - Real measured throughput from the speed test
// The FCC Broadband Map API exists but most of its endpoints are not
// CORS-enabled and require a server-side proxy; rather than ship fake
// hand-coded numbers, we synthesise the coverage report from real signals
// the browser CAN measure.

import type { RealLocation } from './realLocation';
import type { RealSpeedTestResult } from './realSpeedTest';

export interface ConnectionClass {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number; // Mbps, browser-reported
  rtt?: number; // ms, browser-reported
  saveData?: boolean;
  type?: string;
}

export interface CarrierCoverageSignal {
  carrier: string;
  asn?: string;
  ip?: string;
  source: 'cloudflare-meta' | 'unknown';
}

export interface CoverageGrade {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  downloadGrade: string;
  uploadGrade: string;
  latencyGrade: string;
  jitterGrade: string;
  notes: string[];
}

export interface RealCoverageReport {
  generatedAt: string;
  location: RealLocation;
  carrier?: CarrierCoverageSignal;
  connection?: ConnectionClass;
  speed: RealSpeedTestResult;
  grade: CoverageGrade;
}

interface NavigatorConnectionLike {
  effectiveType?: ConnectionClass['effectiveType'];
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

export function getConnectionClass(): ConnectionClass | undefined {
  const conn = (navigator as Navigator & { connection?: NavigatorConnectionLike }).connection;
  if (!conn) return undefined;
  return {
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
    rtt: conn.rtt,
    saveData: conn.saveData,
    type: conn.type,
  };
}

export async function getCarrierSignal(): Promise<CarrierCoverageSignal | undefined> {
  try {
    const res = await fetch('https://speed.cloudflare.com/meta', { cache: 'no-store' });
    if (!res.ok) return undefined;
    const data = await res.json();
    if (!data.asOrganization) return undefined;
    return {
      carrier: data.asOrganization,
      asn: data.asn ? String(data.asn) : undefined,
      ip: data.clientIp,
      source: 'cloudflare-meta',
    };
  } catch {
    return undefined;
  }
}

function gradeDownload(mbps: number): string {
  if (mbps >= 500) return 'Excellent (>500 Mbps)';
  if (mbps >= 200) return 'Very good (200-500 Mbps)';
  if (mbps >= 100) return 'Good (100-200 Mbps)';
  if (mbps >= 50) return 'Fair (50-100 Mbps)';
  if (mbps >= 25) return 'Basic broadband (FCC threshold)';
  return 'Below FCC broadband threshold';
}

function gradeUpload(mbps: number): string {
  if (mbps >= 100) return 'Excellent symmetric (>100 Mbps)';
  if (mbps >= 50) return 'Very good (50-100 Mbps)';
  if (mbps >= 20) return 'Good (20-50 Mbps)';
  if (mbps >= 10) return 'Fair (10-20 Mbps)';
  if (mbps >= 3) return 'Basic upload (FCC threshold)';
  return 'Below FCC upload threshold';
}

function gradeLatency(ms: number): string {
  if (ms < 20) return 'Excellent (<20 ms) - real-time capable';
  if (ms < 40) return 'Good (<40 ms) - solid for gaming/video calls';
  if (ms < 80) return 'Fair (<80 ms) - some lag in real-time apps';
  if (ms < 150) return 'Poor (<150 ms) - noticeable lag';
  return 'Very poor (>150 ms)';
}

function gradeJitter(ms: number): string {
  if (ms < 5) return 'Excellent (<5 ms)';
  if (ms < 15) return 'Good (<15 ms)';
  if (ms < 30) return 'Fair (<30 ms)';
  return 'Poor (>30 ms) - expect call/stream stutter';
}

function overallGrade(speed: RealSpeedTestResult): CoverageGrade['overall'] {
  const { downloadMbps, uploadMbps, latencyMs, jitterMs, packetLossPct } = speed;
  if (packetLossPct > 5) return 'poor';
  if (downloadMbps >= 200 && uploadMbps >= 20 && latencyMs < 30 && jitterMs < 10) return 'excellent';
  if (downloadMbps >= 100 && uploadMbps >= 10 && latencyMs < 50) return 'good';
  if (downloadMbps >= 25 && uploadMbps >= 3) return 'fair';
  return 'poor';
}

function buildNotes(speed: RealSpeedTestResult, location: RealLocation, conn?: ConnectionClass): string[] {
  const notes: string[] = [];
  if (speed.packetLossPct > 1) {
    notes.push(`${speed.packetLossPct.toFixed(1)}% packet loss detected during latency probing.`);
  }
  if (speed.jitterMs > 20) {
    notes.push(`High jitter (${speed.jitterMs.toFixed(0)} ms) suggests an unstable link — try a wired connection or move closer to the router/gateway.`);
  }
  if (speed.uploadMbps * 10 < speed.downloadMbps) {
    notes.push('Highly asymmetric link (typical of cable/satellite). Video calls and large uploads will feel slow even on a fast plan.');
  }
  if (conn?.effectiveType && conn.effectiveType !== '4g') {
    notes.push(`Browser reports an effective connection type of "${conn.effectiveType}" — likely a cellular fallback.`);
  }
  if (location.zcta || location.zip) {
    notes.push(`ZCTA ${location.zcta ?? location.zip} resolved via the US Census Geocoder.`);
  }
  if (notes.length === 0) {
    notes.push('Connection looks healthy — no obvious red flags from this measurement.');
  }
  return notes;
}

export function buildCoverageReport(
  location: RealLocation,
  speed: RealSpeedTestResult,
  carrier?: CarrierCoverageSignal,
  connection?: ConnectionClass,
): RealCoverageReport {
  const grade: CoverageGrade = {
    overall: overallGrade(speed),
    downloadGrade: gradeDownload(speed.downloadMbps),
    uploadGrade: gradeUpload(speed.uploadMbps),
    latencyGrade: gradeLatency(speed.latencyMs),
    jitterGrade: gradeJitter(speed.jitterMs),
    notes: buildNotes(speed, location, connection),
  };
  return {
    generatedAt: new Date().toISOString(),
    location,
    carrier,
    connection,
    speed,
    grade,
  };
}
