// Real-time speed test using Cloudflare's public speed-test endpoints.
// These are the same endpoints that power speed.cloudflare.com and are
// CORS-enabled for browser use.

export interface SpeedSample {
  bytes: number;
  durationMs: number;
  mbps: number;
}

export interface RealSpeedTestProgress {
  phase: 'latency' | 'download' | 'upload' | 'done';
  percent: number;
  currentMbps?: number;
  latencyMs?: number;
}

export interface RealSpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPct: number;
  server: string;
  isp?: string;
  timestamp: string;
  samples: {
    download: SpeedSample[];
    upload: SpeedSample[];
    latency: number[];
  };
}

const DOWN_URL = 'https://speed.cloudflare.com/__down';
const UP_URL = 'https://speed.cloudflare.com/__up';
const META_URL = 'https://speed.cloudflare.com/meta';

function parseServerTiming(header: string | null): number {
  if (!header) return 0;
  const match = /cfRequestDuration;dur=([\d.]+)/.exec(header);
  return match ? parseFloat(match[1]) : 0;
}

async function measureLatency(samples = 20): Promise<{ latencyMs: number; jitterMs: number; lossPct: number; values: number[] }> {
  const values: number[] = [];
  let lost = 0;
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    try {
      const res = await fetch(`${DOWN_URL}?bytes=0&cacheBust=${Date.now()}-${i}`, { cache: 'no-store' });
      await res.arrayBuffer();
      const total = performance.now() - start;
      const serverTime = parseServerTiming(res.headers.get('server-timing'));
      const netLatency = Math.max(0, total - serverTime);
      values.push(netLatency);
    } catch {
      lost++;
    }
  }
  if (values.length === 0) {
    return { latencyMs: 0, jitterMs: 0, lossPct: 100, values: [] };
  }
  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return {
    latencyMs: median,
    jitterMs: Math.sqrt(variance),
    lossPct: (lost / samples) * 100,
    values,
  };
}

async function downloadChunk(bytes: number): Promise<SpeedSample> {
  const start = performance.now();
  const res = await fetch(`${DOWN_URL}?bytes=${bytes}&cacheBust=${Date.now()}-${Math.random()}`, { cache: 'no-store' });
  const reader = res.body!.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
  }
  const total = performance.now() - start;
  const serverTime = parseServerTiming(res.headers.get('server-timing'));
  const transferMs = Math.max(1, total - serverTime);
  return {
    bytes: received,
    durationMs: transferMs,
    mbps: (received * 8) / (transferMs / 1000) / 1_000_000,
  };
}

async function uploadChunk(bytes: number): Promise<SpeedSample> {
  const blob = new Uint8Array(bytes);
  const start = performance.now();
  const res = await fetch(UP_URL, {
    method: 'POST',
    body: blob,
    cache: 'no-store',
  });
  await res.arrayBuffer();
  const total = performance.now() - start;
  const serverTime = parseServerTiming(res.headers.get('server-timing'));
  const transferMs = Math.max(1, total - serverTime);
  return {
    bytes,
    durationMs: transferMs,
    mbps: (bytes * 8) / (transferMs / 1000) / 1_000_000,
  };
}

async function runParallel(count: number, factory: () => Promise<SpeedSample>): Promise<SpeedSample[]> {
  return Promise.all(Array.from({ length: count }, () => factory()));
}

// Aggregate parallel samples into an aggregate throughput.
// Use total bytes / max duration so overlapping parallel streams aren't double-counted.
function aggregateThroughput(samples: SpeedSample[]): number {
  if (samples.length === 0) return 0;
  const totalBytes = samples.reduce((s, x) => s + x.bytes, 0);
  const maxDur = Math.max(...samples.map(s => s.durationMs));
  return (totalBytes * 8) / (maxDur / 1000) / 1_000_000;
}

async function fetchMeta(): Promise<{ colo?: string; asn?: string; isp?: string; ip?: string }> {
  try {
    const res = await fetch(META_URL, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return {
      colo: data.colo,
      asn: data.asn,
      isp: data.asOrganization,
      ip: data.clientIp,
    };
  } catch {
    return {};
  }
}

export async function runRealSpeedTest(
  onProgress?: (p: RealSpeedTestProgress) => void,
): Promise<RealSpeedTestResult> {
  const meta = await fetchMeta();

  onProgress?.({ phase: 'latency', percent: 5 });
  const lat = await measureLatency(20);
  onProgress?.({ phase: 'latency', percent: 20, latencyMs: lat.latencyMs });

  // Download: warmup small, then progressively larger sizes with parallelism.
  const downloadSamples: SpeedSample[] = [];
  const downloadPhases: { bytes: number; parallel: number; weight: number }[] = [
    { bytes: 1_000_000, parallel: 1, weight: 5 },     // 1 MB warmup
    { bytes: 10_000_000, parallel: 2, weight: 10 },   // 10 MB × 2 = 20 MB
    { bytes: 25_000_000, parallel: 4, weight: 15 },   // 25 MB × 4 = 100 MB
    { bytes: 25_000_000, parallel: 4, weight: 10 },   // sustained run
  ];
  let pct = 20;
  for (const phase of downloadPhases) {
    const batch = await runParallel(phase.parallel, () => downloadChunk(phase.bytes));
    downloadSamples.push(...batch);
    pct += phase.weight;
    onProgress?.({
      phase: 'download',
      percent: pct,
      currentMbps: aggregateThroughput(batch),
    });
  }
  // Use the sustained run (last two phases) for the final number,
  // not the warmup which underestimates fast connections.
  const sustainedDown = downloadSamples.slice(-8);
  const downloadMbps = aggregateThroughput(sustainedDown);

  // Upload phases.
  const uploadSamples: SpeedSample[] = [];
  const uploadPhases: { bytes: number; parallel: number; weight: number }[] = [
    { bytes: 1_000_000, parallel: 1, weight: 10 },    // 1 MB warmup
    { bytes: 5_000_000, parallel: 2, weight: 15 },    // 5 MB × 2
    { bytes: 10_000_000, parallel: 3, weight: 15 },   // 10 MB × 3
  ];
  for (const phase of uploadPhases) {
    const batch = await runParallel(phase.parallel, () => uploadChunk(phase.bytes));
    uploadSamples.push(...batch);
    pct += phase.weight;
    onProgress?.({
      phase: 'upload',
      percent: Math.min(pct, 95),
      currentMbps: aggregateThroughput(batch),
    });
  }
  const sustainedUp = uploadSamples.slice(-5);
  const uploadMbps = aggregateThroughput(sustainedUp);

  onProgress?.({ phase: 'done', percent: 100 });

  return {
    downloadMbps,
    uploadMbps,
    latencyMs: lat.latencyMs,
    jitterMs: lat.jitterMs,
    packetLossPct: lat.lossPct,
    server: meta.colo ? `Cloudflare ${meta.colo}` : 'Cloudflare',
    isp: meta.isp,
    timestamp: new Date().toISOString(),
    samples: {
      download: downloadSamples,
      upload: uploadSamples,
      latency: lat.values,
    },
  };
}
