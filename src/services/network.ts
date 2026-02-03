import type { NetworkStatus, SpeedTestResult, NetworkQuality, Recommendation, WifiBand } from '../types';

function getQualityFromSpeed(download: number): NetworkQuality {
  if (download >= 100) return 'excellent';
  if (download >= 50) return 'good';
  if (download >= 25) return 'fair';
  if (download > 0) return 'poor';
  return 'none';
}

export function getSignalQuality(strength: number): NetworkQuality {
  if (strength >= -50) return 'excellent';
  if (strength >= -60) return 'good';
  if (strength >= -70) return 'fair';
  if (strength >= -80) return 'poor';
  return 'none';
}

export function getQualityLabel(quality: NetworkQuality): string {
  const labels: Record<NetworkQuality, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    none: 'No Signal',
  };
  return labels[quality];
}

export function getQualityColor(quality: NetworkQuality): string {
  const colors: Record<NetworkQuality, string> = {
    excellent: '#10b981',
    good: '#22c55e',
    fair: '#f59e0b',
    poor: '#f97316',
    none: '#ef4444',
  };
  return colors[quality];
}

export function getBandLabel(band: WifiBand): string {
  const labels: Record<WifiBand, string> = {
    '2.4ghz': '2.4 GHz',
    '5ghz': '5 GHz',
    '6ghz': '6 GHz',
  };
  return labels[band];
}

export function getBandDescription(band: WifiBand): string {
  const descriptions: Record<WifiBand, string> = {
    '2.4ghz': 'Best range, slower speed. Good for IoT devices and distant rooms.',
    '5ghz': 'Fast speed, moderate range. Ideal for streaming and gaming.',
    '6ghz': 'Fastest speed, shortest range. Best for high-bandwidth tasks near the router.',
  };
  return descriptions[band];
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const downloadSpeed = 45 + Math.random() * 80;
  return {
    isConnected: true,
    ssid: 'HomeNetwork_5G',
    band: '5ghz',
    signalStrength: -(40 + Math.random() * 30),
    downloadSpeed,
    uploadSpeed: 10 + Math.random() * 30,
    latency: 5 + Math.random() * 25,
    quality: getQualityFromSpeed(downloadSpeed),
  };
}

export async function runSpeedTest(
  onProgress: (progress: number) => void,
  band: WifiBand = '5ghz',
): Promise<SpeedTestResult> {
  const stages = [
    { progress: 10, delay: 400 },
    { progress: 25, delay: 600 },
    { progress: 40, delay: 500 },
    { progress: 55, delay: 700 },
    { progress: 70, delay: 500 },
    { progress: 85, delay: 600 },
    { progress: 95, delay: 400 },
    { progress: 100, delay: 300 },
  ];

  for (const stage of stages) {
    await new Promise(resolve => setTimeout(resolve, stage.delay));
    onProgress(stage.progress);
  }

  // Speed varies by band
  const bandMultiplier = band === '6ghz' ? 1.6 : band === '5ghz' ? 1.0 : 0.4;

  return {
    id: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    band,
    downloadSpeed: (50 + Math.random() * 100) * bandMultiplier,
    uploadSpeed: (10 + Math.random() * 40) * bandMultiplier,
    latency: (5 + Math.random() * 20) / bandMultiplier,
    jitter: (1 + Math.random() * 5) / bandMultiplier,
    server: 'speedtest-server-01.netassist.app',
  };
}

export async function getRecommendations(): Promise<Recommendation[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      id: 'rec-1',
      title: 'Move router to a central location',
      description: 'Your router appears to be near an exterior wall. Moving it to a more central location could improve coverage by up to 40%.',
      priority: 'high',
      category: 'placement',
      isCompleted: false,
    },
    {
      id: 'rec-2',
      title: 'Update router firmware',
      description: 'Your router firmware may be outdated. Updating it can fix security vulnerabilities and improve performance.',
      priority: 'high',
      category: 'security',
      isCompleted: false,
    },
    {
      id: 'rec-3',
      title: 'Try the 6 GHz band',
      description: 'If your router supports Wi-Fi 6E, the 6 GHz band offers the fastest speeds and least interference for nearby devices.',
      priority: 'medium',
      category: 'performance',
      isCompleted: false,
    },
    {
      id: 'rec-4',
      title: 'Elevate your router',
      description: 'Place your router on a high shelf or mount it on the wall. Wi-Fi signals spread outward and downward from the antenna.',
      priority: 'low',
      category: 'placement',
      isCompleted: false,
    },
  ];
}

export function formatSpeed(speed: number): string {
  if (speed >= 1000) {
    return `${(speed / 1000).toFixed(1)} Gbps`;
  }
  return `${speed.toFixed(1)} Mbps`;
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(0)} ms`;
}
