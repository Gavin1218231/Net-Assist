import type { ConnectionType, ISPProvider, CarrierMetrics } from '../types';

// ── US ISP / Carrier database ──

const PROVIDERS: ISPProvider[] = [
  // ── Fiber ──
  {
    id: 'att-fiber',
    name: 'AT&T Fiber',
    connectionType: 'fiber',
    typicalDown: '300–5,000 Mbps',
    typicalUp: '300–5,000 Mbps',
    typicalLatency: '4–10 ms',
    placementTips: [
      'AT&T installs a BGW320 gateway with the ONT built in — place it centrally since the fiber terminates at the device',
      'The gateway supports Wi-Fi 6 (802.11ax); keep it elevated and in the open for best coverage',
      'Use the AT&T Smart Home Manager app to check signal strength per room',
    ],
    setupNotes: 'AT&T Fiber requires professional installation. The technician installs the ONT/gateway combo unit. Activate via the Smart Home Manager app or att.com/myatt.',
    website: 'att.com/fiber',
  },
  {
    id: 'google-fiber',
    name: 'Google Fiber',
    connectionType: 'fiber',
    typicalDown: '1,000–8,000 Mbps',
    typicalUp: '1,000–8,000 Mbps',
    typicalLatency: '3–8 ms',
    placementTips: [
      'Google Fiber uses a dedicated fiber jack and separate router — you can move the router away from the jack using Ethernet',
      'The included Wi-Fi 6E router has excellent range; place it on a shelf in a central open area',
      'For multi-story homes, Google offers mesh extender points for full-home coverage',
    ],
    setupNotes: 'Google Fiber includes professional installation with a fiber jack and router. Setup is guided through the Google Fiber app.',
    website: 'fiber.google.com',
  },
  {
    id: 'verizon-fios',
    name: 'Verizon Fios',
    connectionType: 'fiber',
    typicalDown: '300–2,300 Mbps',
    typicalUp: '300–2,300 Mbps',
    typicalLatency: '4–12 ms',
    placementTips: [
      'Fios installs an ONT typically in the garage or basement — run Ethernet from it to a central router location',
      'The Fios Home Router (CR1000A) supports Wi-Fi 6E; keep it away from thick walls and appliances',
      'Use the My Fios app to see connected devices and optimize placement',
    ],
    setupNotes: 'Verizon Fios includes professional ONT installation. The router auto-activates. Manage your network through the My Fios app or myfios.verizon.com.',
    website: 'verizon.com/fios',
  },
  {
    id: 'frontier-fiber',
    name: 'Frontier Fiber',
    connectionType: 'fiber',
    typicalDown: '500–5,000 Mbps',
    typicalUp: '500–5,000 Mbps',
    typicalLatency: '5–12 ms',
    placementTips: [
      'Frontier installs an ONT box on the exterior or interior wall — place your router centrally using Ethernet from the ONT',
      'The included eero router provides mesh capability; add eero beacons for larger homes',
      'Avoid placing the router near the kitchen or in a closet for best Wi-Fi performance',
    ],
    setupNotes: 'Frontier Fiber includes professional installation with ONT. The eero Wi-Fi system activates through the eero app.',
    website: 'frontier.com/fiber',
  },

  // ── 5G Home ──
  // Metrics based on Ookla H2 2025 Connectivity Report and real-world testing
  {
    id: 'tmobile-5g',
    name: 'T-Mobile 5G Home Internet',
    connectionType: '5g_home',
    typicalDown: '72–245 Mbps (median 193 Mbps)',
    typicalUp: '12–56 Mbps',
    typicalLatency: '18–46 ms',
    placementTips: [
      'Place the gateway near a window facing the nearest cell tower — use Cellmapper app to locate towers',
      'The gateway LCD shows signal bars; aim for 3+ bars. SINR (signal quality) matters more than bars for speed',
      'Upper floors get better signal; avoid basements. Height helps clear obstructions like trees and buildings',
      'Keep away from Low-E glass windows, metal objects, aquariums, and appliances (microwaves, baby monitors)',
      'Building materials like brick, concrete, and foil-backed insulation can weaken signal by 10–30 dB',
      'For best results, test multiple windows and wait 60 seconds at each spot for signal to stabilize',
    ],
    setupNotes: 'Self-install: plug in gateway, download T-Mobile Internet app, and use signal indicator to find optimal window placement. T-Mobile 5G ranked fastest US carrier with 309 Mbps median 5G speed (Ookla H2 2025).',
    website: 't-mobile.com/home-internet',
  },
  {
    id: 'verizon-5g',
    name: 'Verizon 5G Home',
    connectionType: '5g_home',
    typicalDown: '85–300 Mbps (median 214 Mbps)',
    typicalUp: '20–75 Mbps',
    typicalLatency: '30–35 ms',
    placementTips: [
      'Verizon uses mmWave or C-band — mmWave (Ultra Wideband) requires near line-of-sight to the node for speeds up to 1+ Gbps',
      'Place gateway on window sill facing the Verizon 5G node (small box on utility poles or buildings)',
      'C-band penetrates walls better than mmWave but window placement still optimal',
      'Use My Verizon app signal optimizer — prioritize SINR reading over simple signal bars',
      'Avoid placing near other wireless devices, metal objects, or thick walls',
      'For outdoor antenna option: placing antenna outdoors is the single biggest upgrade for speed and reliability',
    ],
    setupNotes: 'Self-install via My Verizon app. Verizon has best 5G coverage (30%) but speeds vary — only 36% of tests meet advertised range. Those near Ultra Wideband towers see 1,200–2,400 Mbps. Latency of 31ms is lowest among 5G providers.',
    website: 'verizon.com/5g/home',
  },
  {
    id: 'att-5g',
    name: 'AT&T Internet Air',
    connectionType: '5g_home',
    typicalDown: '90–300 Mbps',
    typicalUp: '8–30 Mbps',
    typicalLatency: '30–65 ms (avg 42 ms)',
    placementTips: [
      'Place gateway near window with clearest sky view — AT&T uses mid-band 3.45 GHz spectrum',
      'LED indicators: green = strong, yellow = adequate, red = move it. Wait 60 seconds for signal to stabilize',
      'Try different windows; AT&T recently boosted speeds up to 80% with new EchoStar spectrum deployment',
      'Upper floors recommended; avoid basements and interior rooms without windows',
      'Keep away from microwaves, cordless phones, Bluetooth devices, and metal furniture',
      'AT&T prioritizes mobile users during peak hours — expect slower speeds 6–10 PM',
    ],
    setupNotes: 'Self-install at $55–60/month ($47 with AT&T mobile). AT&T deployed mid-band spectrum to 23,000 sites in 48 states, boosting download speeds up to 80%. Best for upgrading from DSL or rural areas without fiber.',
    website: 'att.com/internet/fixed-wireless',
  },

  // ── Cable ──
  {
    id: 'xfinity',
    name: 'Xfinity (Comcast)',
    connectionType: 'cable',
    typicalDown: '75–2,000 Mbps',
    typicalUp: '5–200 Mbps',
    typicalLatency: '10–25 ms',
    placementTips: [
      'If using the Xfinity xFi Gateway, it combines modem and router — place it centrally if possible',
      'To move the gateway away from the coax outlet, use a longer coaxial cable (available at any hardware store)',
      'Xfinity xFi pods can extend Wi-Fi coverage in larger homes',
    ],
    setupNotes: 'Xfinity provides self-install kits with instructions. Connect the gateway to a coaxial outlet, then activate via the Xfinity app or xfinity.com/activate.',
    website: 'xfinity.com',
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    connectionType: 'cable',
    typicalDown: '300–1,000 Mbps',
    typicalUp: '10–35 Mbps',
    typicalLatency: '12–30 ms',
    placementTips: [
      'Spectrum provides a separate modem and router — keep the modem at the coax outlet and run Ethernet to the router in a central location',
      'The Spectrum Advanced Wi-Fi router supports Wi-Fi 6; place it elevated on a shelf for best coverage',
      'Avoid placing the router behind a TV or inside an entertainment center',
    ],
    setupNotes: 'Spectrum offers free self-install kits. Connect the modem to coax, then the router via Ethernet. Activate at spectrum.net/selfinstall or call Spectrum support.',
    website: 'spectrum.com',
  },
  {
    id: 'cox',
    name: 'Cox Communications',
    connectionType: 'cable',
    typicalDown: '100–2,000 Mbps',
    typicalUp: '10–200 Mbps',
    typicalLatency: '12–28 ms',
    placementTips: [
      'Cox Panoramic Wifi gateway is an all-in-one — position it centrally if the coax outlet allows',
      'Cox Panoramic Wifi pods can extend coverage to weak spots in your home',
      'Keep the gateway away from other electronics, especially baby monitors and cordless phones',
    ],
    setupNotes: 'Cox offers self-install or professional installation. The Panoramic Wifi gateway activates automatically within 20 minutes of connecting to a live coaxial outlet.',
    website: 'cox.com',
  },

  // ── DSL ──
  {
    id: 'att-dsl',
    name: 'AT&T Internet (DSL)',
    connectionType: 'dsl',
    typicalDown: '5–100 Mbps',
    typicalUp: '1–20 Mbps',
    typicalLatency: '25–50 ms',
    placementTips: [
      'Use the phone jack closest to where the telephone line enters your home for the best signal',
      'AT&T DSL gateways have built-in Wi-Fi; place centrally if possible using the nearest viable jack',
      'Install DSL filters on all other phone jacks with phones attached',
    ],
    setupNotes: 'AT&T DSL self-install: connect the gateway to the phone jack using the included DSL cable, attach filters to other jacks, and activate via att.com/internet.',
    website: 'att.com/internet',
  },
  {
    id: 'centurylink',
    name: 'CenturyLink (Quantum)',
    connectionType: 'dsl',
    typicalDown: '10–140 Mbps',
    typicalUp: '1–20 Mbps',
    typicalLatency: '20–45 ms',
    placementTips: [
      'CenturyLink DSL speed depends heavily on distance from the local exchange — use the closest phone jack to your home entry point',
      'The provided modem/router combo works best in an open, elevated spot',
      'If speeds are below plan, try a different phone jack — wiring quality varies between jacks',
    ],
    setupNotes: 'CenturyLink ships a modem/router. Connect to a phone jack with DSL filters on other jacks. Activate at centurylink.net/selfinstall.',
    website: 'centurylink.com',
  },
  {
    id: 'windstream',
    name: 'Windstream Kinetic',
    connectionType: 'dsl',
    typicalDown: '25–100 Mbps',
    typicalUp: '3–15 Mbps',
    typicalLatency: '20–40 ms',
    placementTips: [
      'Windstream DSL performance varies by location — test multiple phone jacks to find the one with best sync speed',
      'Place the provided router on a desk or shelf, not on the floor',
      'Keep the modem away from other electronics that could cause interference',
    ],
    setupNotes: 'Windstream provides a modem/router combo. Connect to an active phone jack, install filters on other jacks, and activate through the Windstream portal.',
    website: 'windstream.com',
  },

  // ── Satellite ──
  {
    id: 'starlink',
    name: 'Starlink',
    connectionType: 'satellite',
    typicalDown: '50–250 Mbps',
    typicalUp: '10–40 Mbps',
    typicalLatency: '25–60 ms',
    placementTips: [
      'Starlink dish (Dishy) auto-aligns itself — just place it where it has a clear view of the sky',
      'Use the Starlink app obstruction viewer (AR tool) to find the best spot before mounting',
      'The dish can be roof-mounted, pole-mounted, or even placed on the ground temporarily',
      'The included router should be placed inside in a central location; the cable from the dish gives you flexibility',
    ],
    setupNotes: 'Starlink is fully self-install. Place the dish outside with clear sky view, run the cable to the router indoors, plug in, and follow the Starlink app for activation.',
    website: 'starlink.com',
  },
  {
    id: 'hughesnet',
    name: 'HughesNet',
    connectionType: 'satellite',
    typicalDown: '25–100 Mbps',
    typicalUp: '3–5 Mbps',
    typicalLatency: '500–700 ms',
    placementTips: [
      'HughesNet uses geostationary satellites — the dish must point south (in Northern Hemisphere) with clear sky view',
      'Professional installation is recommended as dish alignment is critical for performance',
      'Place the indoor modem/router centrally in your home for Wi-Fi coverage',
    ],
    setupNotes: 'HughesNet requires professional installation for dish alignment. The technician sets up the dish and indoor modem. Activate through hughesnet.com or the installer.',
    website: 'hughesnet.com',
  },
  {
    id: 'viasat',
    name: 'Viasat',
    connectionType: 'satellite',
    typicalDown: '25–150 Mbps',
    typicalUp: '3–5 Mbps',
    typicalLatency: '500–700 ms',
    placementTips: [
      'Viasat dish requires clear southern sky view — avoid trees, buildings, and overhangs',
      'Professional installation is included; the technician will find the optimal dish location',
      'The indoor gateway should be placed in a central, elevated location for Wi-Fi',
    ],
    setupNotes: 'Viasat includes professional installation. The technician installs and aligns the dish, connects indoor equipment, and activates your service.',
    website: 'viasat.com',
  },
];

// ── Metrics by connection type ──

const CARRIER_METRICS: CarrierMetrics[] = [
  {
    connectionType: 'fiber',
    label: 'Fiber Optic',
    avgDown: '500–2,000 Mbps',
    avgUp: '500–2,000 Mbps',
    avgLatency: '3–12 ms',
    coverage: 'Available in urban and suburban areas. Expanding rapidly.',
  },
  {
    connectionType: '5g_home',
    label: '5G Home Internet',
    avgDown: '100–310 Mbps (Ookla H2 2025)',
    avgUp: '12–75 Mbps',
    avgLatency: '30–46 ms',
    coverage: 'T-Mobile: fastest (309 Mbps median), widest home coverage. Verizon: best coverage (30%), lowest latency (31ms). AT&T: most balanced, recently boosted 80%.',
  },
  {
    connectionType: 'cable',
    label: 'Cable Internet',
    avgDown: '100–1,200 Mbps',
    avgUp: '5–50 Mbps',
    avgLatency: '10–30 ms',
    coverage: 'Widely available in urban, suburban, and some rural areas.',
  },
  {
    connectionType: 'dsl',
    label: 'DSL Internet',
    avgDown: '10–100 Mbps',
    avgUp: '1–20 Mbps',
    avgLatency: '20–50 ms',
    coverage: 'Available wherever telephone lines exist. Speeds depend on distance from exchange.',
  },
  {
    connectionType: 'satellite',
    label: 'Satellite Internet',
    avgDown: '25–250 Mbps',
    avgUp: '3–40 Mbps',
    avgLatency: '25–700 ms',
    coverage: 'Available everywhere in the US. Starlink offers LEO low-latency; HughesNet and Viasat use GEO.',
  },
];

// ── Public API ──

export function getProvidersByType(type: ConnectionType): ISPProvider[] {
  return PROVIDERS.filter(p => p.connectionType === type);
}

export function getProviderById(id: string): ISPProvider | undefined {
  return PROVIDERS.find(p => p.id === id);
}

export function getAllProviders(): ISPProvider[] {
  return [...PROVIDERS];
}

export function getMetricsByType(type: ConnectionType): CarrierMetrics | undefined {
  return CARRIER_METRICS.find(m => m.connectionType === type);
}

export function getAllMetrics(): CarrierMetrics[] {
  return [...CARRIER_METRICS];
}

export function getConnectionTypeLabel(type: ConnectionType): string {
  const labels: Record<ConnectionType, string> = {
    fiber: 'Fiber Optic',
    '5g_home': '5G Home Internet',
    cable: 'Cable Internet',
    dsl: 'DSL Internet',
    satellite: 'Satellite Internet',
  };
  return labels[type];
}
