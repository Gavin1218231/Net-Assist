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

// A stalled TCP connection would otherwise hang the whole test forever, so
// every request is bounded. Latency probes are tiny; transfers get more room.
const LATENCY_TIMEOUT_MS = 10_000;
const TRANSFER_TIMEOUT_MS = 60_000;
const META_TIMEOUT_MS = 10_000;

// Fetch bounded by both a local timeout and an optional external abort signal
// (so the caller can cancel the whole test, e.g. on component unmount).
async function fetchBounded(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  external?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const onTimeout = () => controller.abort(new DOMException('Request timed out', 'TimeoutError'));
  const timer = setTimeout(onTimeout, timeoutMs);
  const onExternalAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) controller.abort(external.reason);
    else external.addEventListener('abort', onExternalAbort, { once: true });
  }
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', onExternalAbort);
  }
}

function parseServerTiming(header: string | null): number {
  if (!header) return 0;
  const match = /cfRequestDuration;dur=([\d.]+)/.exec(header);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

// Subtract server-side processing time from the wall-clock measurement, but
// only when it's plausible. A server-timing value that meets or exceeds the
// total round-trip is measurement/clock skew -- subtracting it would collapse
// the transfer time to the 1 ms floor and report an absurd throughput spike.
function transferMs(totalMs: number, serverTimeMs: number): number {
  const adjusted = serverTimeMs < totalMs ? serverTimeMs : 0;
  return Math.max(1, totalMs - adjusted);
}

async function measureLatency(
  samples = 20,
  external?: AbortSignal,
): Promise<{ latencyMs: number; jitterMs: number; lossPct: number; values: number[] }> {
  const values: number[] = [];
  let lost = 0;
  for (let i = 0; i < samples; i++) {
    // If the caller cancelled (e.g. unmount), stop entirely rather than
    // recording the remaining probes as packet loss.
    if (external?.aborted) throw new DOMException('Aborted', 'AbortError');
    const start = performance.now();
    try {
      const res = await fetchBounded(
        `${DOWN_URL}?bytes=0&cacheBust=${Date.now()}-${i}`,
        { cache: 'no-store' },
        LATENCY_TIMEOUT_MS,
        external,
      );
      await res.arrayBuffer();
      const total = performance.now() - start;
      const serverTime = parseServerTiming(res.headers.get('server-timing'));
      values.push(Math.max(0, total - serverTime));
    } catch (err) {
      // A genuine external cancel should abort the whole test, not be counted
      // as loss.
      if (external?.aborted) throw err;
      // Timeout or network failure -> a lost probe.
      lost++;
    }
  }
  if (values.length === 0) {
    return { latencyMs: 0, jitterMs: 0, lossPct: 100, values: [] };
  }
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return {
    latencyMs: median,
    jitterMs: Math.sqrt(variance),
    lossPct: (lost / samples) * 100,
    values,
  };
}

async function downloadChunk(bytes: number, external?: AbortSignal): Promise<SpeedSample> {
  const start = performance.now();
  const res = await fetchBounded(
    `${DOWN_URL}?bytes=${bytes}&cacheBust=${Date.now()}-${Math.random()}`,
    { cache: 'no-store' },
    TRANSFER_TIMEOUT_MS,
    external,
  );
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  if (!res.body) {
    // Fall back to a single arrayBuffer read so we still get a measurement.
    const buf = await res.arrayBuffer();
    const total = performance.now() - start;
    const ms = transferMs(total, parseServerTiming(res.headers.get('server-timing')));
    return {
      bytes: buf.byteLength,
      durationMs: ms,
      mbps: (buf.byteLength * 8) / (ms / 1000) / 1_000_000,
    };
  }
  const reader = res.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) received += value.byteLength;
  }
  const total = performance.now() - start;
  const ms = transferMs(total, parseServerTiming(res.headers.get('server-timing')));
  return {
    bytes: received,
    durationMs: ms,
    mbps: (received * 8) / (ms / 1000) / 1_000_000,
  };
}

async function uploadChunk(bytes: number, external?: AbortSignal): Promise<SpeedSample> {
  const blob = new Uint8Array(bytes);
  const start = performance.now();
  const res = await fetchBounded(
    UP_URL,
    { method: 'POST', body: blob, cache: 'no-store' },
    TRANSFER_TIMEOUT_MS,
    external,
  );
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  await res.arrayBuffer();
  const total = performance.now() - start;
  const ms = transferMs(total, parseServerTiming(res.headers.get('server-timing')));
  return {
    bytes,
    durationMs: ms,
    mbps: (bytes * 8) / (ms / 1000) / 1_000_000,
  };
}

async function runParallel(count: number, factory: () => Promise<SpeedSample>): Promise<SpeedSample[]> {
  return Promise.all(Array.from({ length: count }, () => factory()));
}

// Aggregate a single batch of *concurrent* samples into an aggregate throughput.
// Uses total bytes / max duration so overlapping parallel streams aren't
// double-counted. NOTE: only valid within one concurrent batch -- never across
// batches that ran sequentially, which would divide summed bytes by a single
// batch's duration and roughly double the reported speed.
function aggregateThroughput(samples: SpeedSample[]): number {
  if (samples.length === 0) return 0;
  const totalBytes = samples.reduce((s, x) => s + x.bytes, 0);
  const maxDur = Math.max(...samples.map(s => s.durationMs));
  return (totalBytes * 8) / (maxDur / 1000) / 1_000_000;
}

// Report the peak sustained throughput across the measured phases, excluding
// the warmup phase (which underestimates fast connections). Falls back to the
// warmup number if it's the only measurement we have.
function peakSustained(phaseThroughputs: number[]): number {
  const sustained = phaseThroughputs.slice(1);
  if (sustained.length > 0) return Math.max(...sustained);
  return phaseThroughputs[0] ?? 0;
}

async function fetchMeta(external?: AbortSignal): Promise<{ colo?: string; asn?: string; isp?: string; ip?: string }> {
  try {
    const res = await fetchBounded(META_URL, { cache: 'no-store' }, META_TIMEOUT_MS, external);
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
  signal?: AbortSignal,
): Promise<RealSpeedTestResult> {
  const meta = await fetchMeta(signal);

  onProgress?.({ phase: 'latency', percent: 5 });
  const lat = await measureLatency(20, signal);
  onProgress?.({ phase: 'latency', percent: 20, latencyMs: lat.latencyMs });

  // Download: warmup small, then progressively larger sizes with parallelism.
  const downloadSamples: SpeedSample[] = [];
  const downloadThroughputs: number[] = [];
  const downloadPhases: { bytes: number; parallel: number; weight: number }[] = [
    { bytes: 1_000_000, parallel: 1, weight: 5 },     // 1 MB warmup
    { bytes: 10_000_000, parallel: 2, weight: 10 },   // 10 MB × 2 = 20 MB
    { bytes: 25_000_000, parallel: 4, weight: 15 },   // 25 MB × 4 = 100 MB
    { bytes: 25_000_000, parallel: 4, weight: 10 },   // sustained run
  ];
  let pct = 20;
  for (const phase of downloadPhases) {
    const batch = await runParallel(phase.parallel, () => downloadChunk(phase.bytes, signal));
    const tput = aggregateThroughput(batch);
    downloadSamples.push(...batch);
    downloadThroughputs.push(tput);
    pct += phase.weight;
    onProgress?.({ phase: 'download', percent: pct, currentMbps: tput });
  }
  // Peak of the sustained (non-warmup) phases; each phase is one concurrent
  // batch, so its aggregateThroughput is a valid measurement.
  const downloadMbps = peakSustained(downloadThroughputs);

  // Upload phases.
  const uploadSamples: SpeedSample[] = [];
  const uploadThroughputs: number[] = [];
  const uploadPhases: { bytes: number; parallel: number; weight: number }[] = [
    { bytes: 1_000_000, parallel: 1, weight: 10 },    // 1 MB warmup
    { bytes: 5_000_000, parallel: 2, weight: 15 },    // 5 MB × 2
    { bytes: 10_000_000, parallel: 3, weight: 15 },   // 10 MB × 3
  ];
  for (const phase of uploadPhases) {
    const batch = await runParallel(phase.parallel, () => uploadChunk(phase.bytes, signal));
    const tput = aggregateThroughput(batch);
    uploadSamples.push(...batch);
    uploadThroughputs.push(tput);
    pct += phase.weight;
    onProgress?.({ phase: 'upload', percent: Math.min(pct, 95), currentMbps: tput });
  }
  const uploadMbps = peakSustained(uploadThroughputs);

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
