import type { ConnectionType, ISPProvider, CarrierMetrics } from '../types';

// ── US ISP / Carrier database ──

const PROVIDERS: ISPProvider[] = [
  // ── Fiber ──
  // Ookla H1 2025: AT&T Fiber #1 (363 Mbps median down), Frontier #2 (359 Mbps), Verizon #3 (speed score 75.01)
  {
    id: 'att-fiber',
    name: 'AT&T Fiber',
    connectionType: 'fiber',
    typicalDown: '300–5,000 Mbps (median 364 Mbps — Ookla H1 2025)',
    typicalUp: '300–5,000 Mbps (median 297 Mbps)',
    typicalLatency: '4–10 ms',
    placementTips: [
      'AT&T Fiber is the #1 ranked US ISP by Ookla (H1 2025) with 364 Mbps median download — placement affects Wi-Fi, not fiber speed',
      'AT&T installs a BGW320 gateway with the ONT built in — place it centrally since the fiber terminates at the device',
      'The gateway supports Wi-Fi 6 (802.11ax); keep it elevated (4–5 feet) and in the open for best wireless coverage',
      'Use the AT&T Smart Home Manager app to check signal strength per room and identify dead zones',
      'For large homes (2,500+ sq ft), consider AT&T All-Fi mesh extenders to fill coverage gaps',
      'Keep the gateway away from microwaves, baby monitors, and cordless phones — these operate on the same 2.4 GHz band',
    ],
    setupNotes: 'AT&T Fiber requires professional installation. The technician installs the ONT/gateway combo unit. Activate via the Smart Home Manager app or att.com/myatt. AT&T Fiber ranked #1 fastest ISP in the US three consecutive Ookla reports (H1 2024–H1 2025).',
    website: 'att.com/fiber',
  },
  {
    id: 'google-fiber',
    name: 'Google Fiber',
    connectionType: 'fiber',
    typicalDown: '1,000–8,000 Mbps (fastest in 9 of top 100 US cities)',
    typicalUp: '1,000–8,000 Mbps (symmetrical)',
    typicalLatency: '3–8 ms',
    placementTips: [
      'Google Fiber delivers the fastest city-level speeds in the US — it was #1 in 9 of Ookla\'s top 100 cities (H1 2025)',
      'Google Fiber uses a dedicated fiber jack and separate router — you can move the router away from the jack using Ethernet',
      'The included Wi-Fi 6E router has excellent range; place it on a shelf in a central open area, elevated 4–5 feet',
      'For multi-story homes, Google offers mesh extender points — place one per floor for seamless roaming',
      'Wi-Fi 6E uses the 6 GHz band which has shorter range but much less interference — keep router in line of sight where possible',
    ],
    setupNotes: 'Google Fiber includes professional installation with a fiber jack and router. Setup is guided through the Google Fiber app. Available in select cities but delivers industry-leading speeds where offered.',
    website: 'fiber.google.com',
  },
  {
    id: 'verizon-fios',
    name: 'Verizon Fios',
    connectionType: 'fiber',
    typicalDown: '300–2,300 Mbps (Ookla speed score 75.01)',
    typicalUp: '300–2,300 Mbps (symmetrical)',
    typicalLatency: '4–12 ms (15 ms median multi-server)',
    placementTips: [
      'Verizon Fios ranked #3 overall by Ookla (H1 2025) — it has the lowest latency of any major ISP at 15 ms median',
      'Fios installs an ONT typically in the garage or basement — run Ethernet from it to a central router location for best Wi-Fi',
      'The Fios Home Router (CR1000A) supports Wi-Fi 6E; keep it away from thick walls and metal appliances',
      'Use the My Fios app to see connected devices and signal strength per room — optimize placement based on heat map',
      'For multi-story homes, add Fios Extender E3200 for whole-home mesh coverage',
    ],
    setupNotes: 'Verizon Fios includes professional ONT installation. The router auto-activates. Manage your network through the My Fios app or myfios.verizon.com. Fios has lowest latency among major ISPs.',
    website: 'verizon.com/fios',
  },
  {
    id: 'frontier-fiber',
    name: 'Frontier Fiber',
    connectionType: 'fiber',
    typicalDown: '500–5,000 Mbps (median 359 Mbps — Ookla H1 2025)',
    typicalUp: '500–5,000 Mbps (symmetrical)',
    typicalLatency: '5–12 ms',
    placementTips: [
      'Frontier Fiber ranked #2 fastest ISP in the US by Ookla (H1 2025) with 359 Mbps median — near-identical to AT&T Fiber',
      'Frontier installs an ONT box on the exterior or interior wall — place your eero router centrally using Ethernet from the ONT',
      'The included eero Wi-Fi 6E router provides mesh capability; add eero beacons for homes over 2,000 sq ft',
      'Place the eero router on a flat surface at desk height, not on the floor or inside a cabinet',
      'Avoid placing near large metal objects, mirrors, or fish tanks — water absorbs Wi-Fi signal significantly',
    ],
    setupNotes: 'Frontier Fiber includes professional installation with ONT. The eero Wi-Fi system activates through the eero app. Frontier rated #2 in customer satisfaction (3.64/5) by Speedtest users.',
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
  // Ookla H1 2025: Cox (score 70.55), Xfinity (69.95), Spectrum (67.71)
  // Q4 2023 medians: Cox 261 Mbps, Spectrum 253 Mbps, Xfinity 239 Mbps down
  // Cable uploads improving rapidly in 2025 with DOCSIS 4.0 mid-split/high-split upgrades
  {
    id: 'xfinity',
    name: 'Xfinity (Comcast)',
    connectionType: 'cable',
    typicalDown: '75–2,000 Mbps (median 239 Mbps — Ookla)',
    typicalUp: '5–200 Mbps (median 23 Mbps, improving with DOCSIS 4.0)',
    typicalLatency: '19–26 ms (median 26 ms)',
    placementTips: [
      'Xfinity median speed is 239 Mbps — your Wi-Fi setup matters more than the cable connection for speed at the device',
      'The xFi Gateway combines modem and router — it is tethered to the coax outlet, so use a longer coax cable (up to 25 ft) to place it more centrally',
      'Coax outlet in a bad spot? Run a longer RG6 coaxial cable to move the gateway — this does not affect speed',
      'Xfinity xFi pods can extend Wi-Fi to dead zones; place them halfway between the gateway and weak spots',
      'Keep the gateway elevated (shelf or table height), not on the floor — ground-level placement reduces Wi-Fi range by 30-40%',
      'Comcast is rolling out DOCSIS 4.0 mid-split upgrades — uploads in upgraded markets (Philadelphia, Atlanta, Colorado Springs) jumped 70%+',
    ],
    setupNotes: 'Xfinity provides self-install kits. Connect the gateway to a coaxial outlet, then activate via the Xfinity app or xfinity.com/activate. Xfinity won Opensignal\'s 2025 Video Experience award alongside Spectrum.',
    website: 'xfinity.com',
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    connectionType: 'cable',
    typicalDown: '300–1,000 Mbps (median 253 Mbps — Ookla)',
    typicalUp: '10–35 Mbps (median 16 Mbps, Dallas hit 158 Mbps with high-split)',
    typicalLatency: '12–32 ms (median 32 ms)',
    placementTips: [
      'Spectrum has the highest consistency score (92%) of any cable ISP — 92% of tests hit at least 25/3 Mbps',
      'Spectrum provides a separate modem and router — keep the modem at the coax outlet and run Ethernet to the router in a central spot',
      'The Spectrum Advanced Wi-Fi 6 router should be elevated on a shelf, not behind a TV or inside an entertainment center',
      'Spectrum is deploying high-split DOCSIS upgrades — Dallas saw upload speeds jump 817% to 158 Mbps in Q2 2025',
      'For homes over 2,000 sq ft, add Spectrum Wi-Fi extender pods to eliminate dead zones in far rooms',
      'If speeds are slow, check for coax splitters between the wall and modem — each splitter reduces signal by 3-7 dB',
    ],
    setupNotes: 'Spectrum offers free self-install kits. Connect the modem to coax, then the router via Ethernet. Activate at spectrum.net/selfinstall. Spectrum ranked #1 for Reliability and Download Speed by Opensignal (May 2025).',
    website: 'spectrum.com',
  },
  {
    id: 'cox',
    name: 'Cox Communications',
    connectionType: 'cable',
    typicalDown: '100–2,000 Mbps (median 261 Mbps — Ookla, fastest cable ISP)',
    typicalUp: '10–200 Mbps (median 34 Mbps)',
    typicalLatency: '12–25 ms (median 25 ms)',
    placementTips: [
      'Cox is the fastest cable ISP in the US with 261 Mbps median download (Ookla Q4 2023) and speed score of 70.55 (H1 2025)',
      'Cox Panoramic Wifi gateway is an all-in-one — if the coax outlet is in a corner, use a 15-25 ft coax cable to reposition centrally',
      'Cox Panoramic Wifi pods extend coverage to weak spots; place them in hallways or landings between the gateway and far rooms',
      'Keep the gateway away from baby monitors, cordless phones, and Bluetooth speakers — they share the 2.4 GHz band',
      'Cox has the best upload speeds of major cable ISPs (34 Mbps median) — good for video calls and cloud backups',
      'For best performance, connect gaming consoles and streaming boxes via Ethernet rather than Wi-Fi',
    ],
    setupNotes: 'Cox offers self-install or professional installation. The Panoramic Wifi gateway activates automatically within 20 minutes of connecting to a live coaxial outlet. Cox ranked #4 overall among all US ISPs by Ookla (H1 2025).',
    website: 'cox.com',
  },

  // ── DSL ──
  // FCC 2025: DSL connections declining as carriers upgrade to fiber. Slowest wired technology.
  // DSL speeds depend heavily on distance from the local exchange (DSLAM).
  // Within 5,000 ft: full speeds. Over 10,000 ft: significant degradation.
  {
    id: 'att-dsl',
    name: 'AT&T Internet (DSL)',
    connectionType: 'dsl',
    typicalDown: '5–100 Mbps (most areas 25–50 Mbps)',
    typicalUp: '1–20 Mbps (most areas 5–10 Mbps)',
    typicalLatency: '25–50 ms',
    placementTips: [
      'DSL speed is entirely determined by your distance from AT&T\'s local exchange — you cannot improve this with placement',
      'CRITICAL: Use the phone jack closest to where the telephone line enters your home — this minimizes internal wiring loss',
      'AT&T DSL gateways have built-in Wi-Fi; the gateway is tethered to the phone jack, so focus on Wi-Fi placement',
      'Install DSL filters on ALL other phone jacks with phones attached — unfiltered jacks cause noise that reduces speed',
      'If getting less than your plan speed, check for old or corroded phone wiring — replace with CAT5 between jack and gateway',
      'Consider upgrading to AT&T Fiber or AT&T Internet Air (5G) if available at your address — both are significantly faster',
    ],
    setupNotes: 'AT&T DSL self-install: connect the gateway to the phone jack using the included DSL cable, attach filters to other jacks, and activate via att.com/internet. AT&T is actively migrating DSL customers to fiber where available.',
    website: 'att.com/internet',
  },
  {
    id: 'centurylink',
    name: 'CenturyLink / Lumen (Quantum)',
    connectionType: 'dsl',
    typicalDown: '10–140 Mbps (VDSL2 areas: 80–140 Mbps; ADSL areas: 10–40 Mbps)',
    typicalUp: '1–20 Mbps',
    typicalLatency: '20–45 ms',
    placementTips: [
      'CenturyLink DSL speed depends heavily on distance from the local exchange — within 3,000 ft gets best speeds',
      'VDSL2 (bonded) connections can reach 140 Mbps but only within ~3,000 feet of the DSLAM',
      'Use the phone jack closest to where the phone line enters your home — this is usually in the basement or utility room',
      'The provided modem/router combo works best on a desk or shelf in an open area, elevated 3–4 feet',
      'If speeds are below plan, try a different phone jack — older internal wiring can drop speeds 20-40%',
      'Check if CenturyLink Quantum Fiber is available at your address — it uses the same brand but is actual fiber optic',
    ],
    setupNotes: 'CenturyLink ships a modem/router. Connect to a phone jack with DSL filters on other jacks. Activate at centurylink.net/selfinstall. CenturyLink/Lumen is expanding fiber but DSL remains in many areas.',
    website: 'centurylink.com',
  },
  {
    id: 'windstream',
    name: 'Windstream Kinetic',
    connectionType: 'dsl',
    typicalDown: '25–100 Mbps (Kinetic VDSL in select areas)',
    typicalUp: '3–15 Mbps',
    typicalLatency: '20–40 ms',
    placementTips: [
      'Windstream DSL performance varies significantly by location — test multiple phone jacks to find the best sync speed',
      'Place the provided router on a desk or shelf, not on the floor — floor placement cuts Wi-Fi range significantly',
      'Keep the modem away from other electronics, especially microwaves and cordless phones on 2.4 GHz',
      'If your speed is under 25 Mbps, check if Windstream Kinetic Fiber has reached your area — it offers 500+ Mbps',
      'Consider a Wi-Fi extender if the modem/router must stay near the phone jack in a corner of the house',
    ],
    setupNotes: 'Windstream provides a modem/router combo. Connect to an active phone jack, install filters on other jacks, and activate through the Windstream portal. Windstream is expanding fiber in rural areas.',
    website: 'windstream.com',
  },

  // ── Satellite ──
  // Ookla Q1 2025: Starlink 105 Mbps median down, 14.8 Mbps up, 45 ms latency
  // HughesNet: 47.8 Mbps down, 4.4 Mbps up, 683 ms latency (GEO)
  // Viasat: 41.5 Mbps down, 1.1 Mbps up, 684 ms latency (GEO)
  // Starlink (LEO) vs HughesNet/Viasat (GEO): LEO has 15x lower latency
  {
    id: 'starlink',
    name: 'Starlink',
    connectionType: 'satellite',
    typicalDown: '75–220 Mbps (median 105 Mbps — Ookla Q1 2025)',
    typicalUp: '10–40 Mbps (median 15 Mbps)',
    typicalLatency: '20–60 ms (median 45 ms — LEO orbit)',
    placementTips: [
      'Starlink uses Low Earth Orbit (LEO) satellites — 15x lower latency than HughesNet/Viasat, usable for gaming and video calls',
      'Dish placement is THE most important factor — use the Starlink app AR obstruction viewer BEFORE mounting to find a spot with clear sky view',
      'Even small obstructions (tree branches, chimney) cause brief dropouts — aim for 100% clear sky view, especially to the north',
      'Roof mount is ideal; if ground-mounting, use the pole adapter and get the dish above fence/tree line height',
      'The 75 ft cable from dish to router gives flexibility — route it to place the router centrally inside your home',
      'The Gen 3 router supports Wi-Fi 6; place it on a shelf at desk height, not behind furniture or in a closet',
      'Starlink speeds vary by congestion — rural areas (fewer users) often see 150–220 Mbps; dense suburbs may see 75–100 Mbps',
    ],
    setupNotes: 'Starlink is fully self-install. 9M+ active customers as of late 2025. Place the dish outside with clear sky view, run the cable to the router indoors, plug in, and follow the Starlink app. Speeds nearly doubled from 54 Mbps (Q3 2022) to 105 Mbps (Q1 2025).',
    website: 'starlink.com',
  },
  {
    id: 'hughesnet',
    name: 'HughesNet',
    connectionType: 'satellite',
    typicalDown: '25–100 Mbps (median 48 Mbps — Ookla Q1 2025)',
    typicalUp: '3–5 Mbps (median 4.4 Mbps)',
    typicalLatency: '600–700 ms (median 683 ms — GEO orbit)',
    placementTips: [
      'HughesNet uses geostationary (GEO) satellites at 22,000 miles — latency of ~683 ms makes video calls and gaming difficult',
      'The dish MUST point south (in Northern Hemisphere) with completely clear southern sky view — even partial obstructions degrade performance',
      'Professional installation is critical — dish alignment must be precise for GEO satellite lock',
      'Place the indoor modem/router centrally in your home for best Wi-Fi coverage — the dish-to-modem cable gives some flexibility',
      'HughesNet doubled speeds from 21 to 48 Mbps median (2022–2025) with Jupiter 3 satellite — but upload and latency remain limited',
      'Data caps apply on most plans — schedule large downloads during bonus hours (2–8 AM) when caps don\'t apply',
    ],
    setupNotes: 'HughesNet requires professional installation for dish alignment. 783K subscribers as of 2025. Activate through hughesnet.com or the installer. Consider Starlink if available — it offers 2x speed and 15x lower latency.',
    website: 'hughesnet.com',
  },
  {
    id: 'viasat',
    name: 'Viasat',
    connectionType: 'satellite',
    typicalDown: '25–150 Mbps (median 42 Mbps — Ookla Q3 2025)',
    typicalUp: '1–5 Mbps (median 1.1 Mbps — declining)',
    typicalLatency: '600–700 ms (median 684 ms — GEO orbit)',
    placementTips: [
      'Viasat uses geostationary (GEO) satellites — high latency (~684 ms) makes real-time applications (gaming, video calls) challenging',
      'Dish requires clear southern sky view — trees, buildings, and overhangs will degrade signal',
      'Professional installation is included and recommended — GEO dish alignment is precise work',
      'Place the indoor gateway centrally and elevated for best Wi-Fi; the dish cable provides placement flexibility',
      'Viasat upload speeds have dropped to 1.1 Mbps median — avoid for work-from-home with frequent uploads or video conferencing',
      'Viasat has lost 50%+ of its US customer base (157K remaining) — consider Starlink as an alternative with better speeds and latency',
    ],
    setupNotes: 'Viasat includes professional installation. 157K US subscribers remaining as of 2025. The technician installs and aligns the dish. Viasat\'s ViaSat-3 constellation may improve speeds in the future.',
    website: 'viasat.com',
  },
];

// ── Metrics by connection type ──

// Ookla H1 2025 Speedtest Connectivity Report + Q1 2025 satellite data
const CARRIER_METRICS: CarrierMetrics[] = [
  {
    connectionType: 'fiber',
    label: 'Fiber Optic',
    avgDown: '359–364 Mbps median (Ookla H1 2025)',
    avgUp: '297 Mbps median (symmetrical)',
    avgLatency: '4–15 ms',
    coverage: '#1 technology. AT&T Fiber: 364 Mbps, Frontier: 359 Mbps, Verizon: 75.01 score. Available to 49% of US — expanding rapidly. 26% of fixed connections now ≥940 Mbps.',
  },
  {
    connectionType: '5g_home',
    label: '5G Home Internet',
    avgDown: '100–310 Mbps (Ookla H2 2025)',
    avgUp: '12–75 Mbps',
    avgLatency: '30–46 ms',
    coverage: 'T-Mobile: fastest (209 Mbps median Q3 2025). Verizon: 138 Mbps median. AT&T: 104 Mbps median. FWA speeds declining as adoption grows.',
  },
  {
    connectionType: 'cable',
    label: 'Cable Internet',
    avgDown: '239–261 Mbps median (Ookla)',
    avgUp: '16–34 Mbps median (DOCSIS 4.0 upgrades incoming)',
    avgLatency: '19–32 ms',
    coverage: 'Available in 82% of US areas. Cox: 261 Mbps fastest cable. Spectrum: 92% consistency score, #1 reliability. Xfinity: 239 Mbps. Upload speeds rising with mid-split/high-split upgrades.',
  },
  {
    connectionType: 'dsl',
    label: 'DSL Internet',
    avgDown: '10–100 Mbps (most areas 25–50 Mbps)',
    avgUp: '1–20 Mbps (most areas 5–10 Mbps)',
    avgLatency: '20–50 ms',
    coverage: 'Available in 41% of US areas (declining). Slowest wired tech — being phased out in favor of fiber. Speed depends on distance from exchange. FCC no longer considers basic DSL as broadband.',
  },
  {
    connectionType: 'satellite',
    label: 'Satellite Internet',
    avgDown: 'Starlink: 105 Mbps / HughesNet: 48 Mbps / Viasat: 42 Mbps',
    avgUp: 'Starlink: 15 Mbps / HughesNet: 4 Mbps / Viasat: 1 Mbps',
    avgLatency: 'Starlink: 45 ms (LEO) / GEO: 683 ms',
    coverage: 'Available everywhere in the US. Starlink (LEO) dominates with 97% of satellite speed tests, 9M+ subscribers. GEO providers (HughesNet, Viasat) losing subscribers rapidly.',
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
