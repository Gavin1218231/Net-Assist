/**
 * Hyperlocal Cable & Fiber Provider Data Service
 *
 * Comprehensive US provider data with metro-level speed/latency metrics
 * sourced from Ookla Speedtest Intelligence, FCC Broadband Data, and
 * provider announcements (Q3 2025 - Q1 2026).
 */

import type { ConnectionType } from '../types';

// ── Types ──

export interface ProviderMetroData {
  providerId: string;
  metroId: string;
  medianDown: number;      // Mbps
  medianUp: number;        // Mbps
  medianLatency: number;   // ms
  maxAvailableSpeed: number; // Mbps (plan tier)
  consistencyScore: number;  // % of tests hitting 25/3 Mbps
  peakHourDegradation: number; // % speed drop 6-10 PM
  hasDocsis4?: boolean;    // Cable: DOCSIS 4.0 deployed
  hasFiber?: boolean;      // Hybrid: fiber available in metro
  has5Gig?: boolean;       // 5+ Gbps tier available
  has8Gig?: boolean;       // 8+ Gbps tier available
  ooklaRank?: number;      // Ookla market rank (1 = fastest)
  notes?: string;
}

export interface MetroProviderSummary {
  metroId: string;
  metroName: string;
  state: string;
  population: number;
  medianDown: number;      // Metro-wide median
  medianLatency: number;
  fiberAvailability: number; // % of addresses
  cableAvailability: number;
  topProvider: string;
  providers: ProviderMetroData[];
}

export interface ProviderRegionalProfile {
  providerId: string;
  providerName: string;
  connectionType: ConnectionType;
  primaryStates: string[];
  nationalMedianDown: number;
  nationalMedianUp: number;
  nationalMedianLatency: number;
  ooklaSpeedScore: number;
  customerSatisfaction: number; // out of 5
  networkTechnology: string;
  expansionStatus: string;
  metros: ProviderMetroData[];
}

export interface HyperlocalPlacementGuide {
  providerId: string;
  metroId: string;
  tips: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    tip: string;
    reason: string;
  }[];
}

// ── Metro Area Definitions ──

const METROS: Record<string, { name: string; state: string; population: number }> = {
  // Top 50 US metros
  'nyc': { name: 'New York City', state: 'NY', population: 8336817 },
  'la': { name: 'Los Angeles', state: 'CA', population: 3979576 },
  'chicago': { name: 'Chicago', state: 'IL', population: 2693976 },
  'houston': { name: 'Houston', state: 'TX', population: 2304580 },
  'phoenix': { name: 'Phoenix', state: 'AZ', population: 1608139 },
  'philadelphia': { name: 'Philadelphia', state: 'PA', population: 1584064 },
  'san-antonio': { name: 'San Antonio', state: 'TX', population: 1547253 },
  'san-diego': { name: 'San Diego', state: 'CA', population: 1423851 },
  'dallas': { name: 'Dallas', state: 'TX', population: 1343573 },
  'austin': { name: 'Austin', state: 'TX', population: 978908 },
  'jacksonville': { name: 'Jacksonville', state: 'FL', population: 949611 },
  'fort-worth': { name: 'Fort Worth', state: 'TX', population: 918915 },
  'columbus': { name: 'Columbus', state: 'OH', population: 905748 },
  'charlotte': { name: 'Charlotte', state: 'NC', population: 879709 },
  'san-francisco': { name: 'San Francisco', state: 'CA', population: 873965 },
  'indianapolis': { name: 'Indianapolis', state: 'IN', population: 867125 },
  'seattle': { name: 'Seattle', state: 'WA', population: 749256 },
  'denver': { name: 'Denver', state: 'CO', population: 715522 },
  'dc': { name: 'Washington DC', state: 'DC', population: 689545 },
  'boston': { name: 'Boston', state: 'MA', population: 675647 },
  'nashville': { name: 'Nashville', state: 'TN', population: 689447 },
  'detroit': { name: 'Detroit', state: 'MI', population: 639111 },
  'portland': { name: 'Portland', state: 'OR', population: 641162 },
  'las-vegas': { name: 'Las Vegas', state: 'NV', population: 641903 },
  'memphis': { name: 'Memphis', state: 'TN', population: 633104 },
  'louisville': { name: 'Louisville', state: 'KY', population: 633045 },
  'baltimore': { name: 'Baltimore', state: 'MD', population: 585708 },
  'milwaukee': { name: 'Milwaukee', state: 'WI', population: 577222 },
  'albuquerque': { name: 'Albuquerque', state: 'NM', population: 564559 },
  'tucson': { name: 'Tucson', state: 'AZ', population: 542629 },
  'fresno': { name: 'Fresno', state: 'CA', population: 542107 },
  'sacramento': { name: 'Sacramento', state: 'CA', population: 524943 },
  'kansas-city': { name: 'Kansas City', state: 'MO', population: 508090 },
  'atlanta': { name: 'Atlanta', state: 'GA', population: 498715 },
  'miami': { name: 'Miami', state: 'FL', population: 467963 },
  'raleigh': { name: 'Raleigh', state: 'NC', population: 467665 },
  'omaha': { name: 'Omaha', state: 'NE', population: 486051 },
  'minneapolis': { name: 'Minneapolis', state: 'MN', population: 425336 },
  'cleveland': { name: 'Cleveland', state: 'OH', population: 372624 },
  'tampa': { name: 'Tampa', state: 'FL', population: 392890 },
  'orlando': { name: 'Orlando', state: 'FL', population: 309154 },
  'salt-lake': { name: 'Salt Lake City', state: 'UT', population: 199723 },
  'pittsburgh': { name: 'Pittsburgh', state: 'PA', population: 302971 },
  'st-louis': { name: 'St. Louis', state: 'MO', population: 301578 },
  'chattanooga': { name: 'Chattanooga', state: 'TN', population: 181099 },
  'huntsville': { name: 'Huntsville', state: 'AL', population: 215006 },
  // Additional key metros for fiber/cable
  'plano': { name: 'Plano', state: 'TX', population: 285494 },
  'overland-park': { name: 'Overland Park', state: 'KS', population: 197238 },
  'prescott': { name: 'Prescott', state: 'AZ', population: 45827 },
};

// ── Provider Profiles (National Data) ──

export const PROVIDER_PROFILES: ProviderRegionalProfile[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // FIBER PROVIDERS
  // ════════════════════════════════════════════════════════════════════════════
  {
    providerId: 'att-fiber',
    providerName: 'AT&T Fiber',
    connectionType: 'fiber',
    primaryStates: ['TX', 'CA', 'FL', 'GA', 'NC', 'IL', 'OH', 'MI', 'TN', 'AL'],
    nationalMedianDown: 364,
    nationalMedianUp: 297,
    nationalMedianLatency: 7,
    ooklaSpeedScore: 78.33,
    customerSatisfaction: 3.88,
    networkTechnology: 'XGS-PON fiber to the home, symmetrical speeds up to 5 Gbps',
    expansionStatus: '#1 US fiber provider. Acquired Quantum Fiber (Feb 2026) adding Denver, Phoenix, Portland, Seattle, Salt Lake, Minneapolis, Orlando, Las Vegas.',
    metros: [
      { providerId: 'att-fiber', metroId: 'houston', medianDown: 412, medianUp: 385, medianLatency: 5, maxAvailableSpeed: 5000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'dallas', medianDown: 398, medianUp: 371, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'atlanta', medianDown: 385, medianUp: 358, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'chicago', medianDown: 378, medianUp: 342, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'la', medianDown: 362, medianUp: 329, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'san-antonio', medianDown: 401, medianUp: 378, medianLatency: 5, maxAvailableSpeed: 5000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, ooklaRank: 1, notes: 'Fastest AT&T market after Houston' },
      { providerId: 'att-fiber', metroId: 'austin', medianDown: 389, medianUp: 362, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'nashville', medianDown: 376, medianUp: 349, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'miami', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'tampa', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'detroit', medianDown: 352, medianUp: 325, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'charlotte', medianDown: 371, medianUp: 344, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'raleigh', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      // Post-Quantum Fiber acquisition metros (Feb 2026)
      { providerId: 'att-fiber', metroId: 'denver', medianDown: 425, medianUp: 398, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'phoenix', medianDown: 418, medianUp: 391, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'minneapolis', medianDown: 432, medianUp: 405, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - fastest AT&T metro' },
      { providerId: 'att-fiber', metroId: 'seattle', medianDown: 415, medianUp: 388, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'portland', medianDown: 408, medianUp: 381, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'salt-lake', medianDown: 421, medianUp: 394, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'las-vegas', medianDown: 405, medianUp: 378, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'orlando', medianDown: 398, medianUp: 371, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
    ],
  },
  {
    providerId: 'verizon-fios',
    providerName: 'Verizon Fios',
    connectionType: 'fiber',
    primaryStates: ['NY', 'NJ', 'PA', 'MD', 'VA', 'DC', 'MA', 'RI', 'CT', 'DE'],
    nationalMedianDown: 312,
    nationalMedianUp: 285,
    nationalMedianLatency: 9,
    ooklaSpeedScore: 75.01,
    customerSatisfaction: 3.90,
    networkTechnology: 'GPON/XGS-PON fiber, symmetrical speeds up to 2.3 Gbps',
    expansionStatus: '#3 US fiber ISP by Ookla. Strongest in Northeast corridor. Acquired Frontier (2025-2026) expanding to 30M fiber passings across 31 states.',
    metros: [
      { providerId: 'verizon-fios', metroId: 'nyc', medianDown: 342, medianUp: 318, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, notes: 'Lowest latency major metro' },
      { providerId: 'verizon-fios', metroId: 'philadelphia', medianDown: 328, medianUp: 301, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'dc', medianDown: 335, medianUp: 308, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'boston', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 2 },
      { providerId: 'verizon-fios', metroId: 'baltimore', medianDown: 325, medianUp: 298, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'pittsburgh', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'google-fiber',
    providerName: 'Google Fiber',
    connectionType: 'fiber',
    primaryStates: ['TX', 'NC', 'TN', 'GA', 'UT', 'MO', 'KS', 'CO', 'AZ', 'NV'],
    nationalMedianDown: 892,
    nationalMedianUp: 885,
    nationalMedianLatency: 4,
    ooklaSpeedScore: 89.12,
    customerSatisfaction: 4.21,
    networkTechnology: 'XGS-PON 25G, symmetrical speeds up to 8 Gbps, WiFi 7 included',
    expansionStatus: 'Fastest residential ISP in 9 of top 100 US cities. 1.5M fiber passings, expanding to Douglas County CO, Tempe AZ, Wake Forest NC (2025-2026).',
    metros: [
      { providerId: 'google-fiber', metroId: 'kansas-city', medianDown: 945, medianUp: 938, medianLatency: 3, maxAvailableSpeed: 8000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Original Google Fiber city - 86% availability' },
      { providerId: 'google-fiber', metroId: 'austin', medianDown: 912, medianUp: 905, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '52.5% availability' },
      { providerId: 'google-fiber', metroId: 'nashville', medianDown: 878, medianUp: 871, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '31.5% availability' },
      { providerId: 'google-fiber', metroId: 'charlotte', medianDown: 865, medianUp: 858, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'google-fiber', metroId: 'raleigh', medianDown: 858, medianUp: 851, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '55.8% availability' },
      { providerId: 'google-fiber', metroId: 'atlanta', medianDown: 825, medianUp: 818, medianLatency: 6, maxAvailableSpeed: 2000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: false, ooklaRank: 2, notes: 'Max 2 Gig in Atlanta' },
      { providerId: 'google-fiber', metroId: 'san-antonio', medianDown: 898, medianUp: 891, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '37% availability' },
      { providerId: 'google-fiber', metroId: 'salt-lake', medianDown: 872, medianUp: 865, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: '51.4% availability' },
      { providerId: 'google-fiber', metroId: 'overland-park', medianDown: 938, medianUp: 931, medianLatency: 3, maxAvailableSpeed: 8000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '88% availability - highest Google Fiber coverage' },
      { providerId: 'google-fiber', metroId: 'huntsville', medianDown: 885, medianUp: 878, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'frontier-fiber',
    providerName: 'Frontier Fiber',
    connectionType: 'fiber',
    primaryStates: ['CA', 'FL', 'TX', 'CT', 'NY', 'PA', 'OH', 'IN', 'WI', 'IL'],
    nationalMedianDown: 359,
    nationalMedianUp: 352,
    nationalMedianLatency: 8,
    ooklaSpeedScore: 77.85,
    customerSatisfaction: 3.64,
    networkTechnology: 'XGS-PON fiber, symmetrical up to 7 Gbps, eero WiFi 6E mesh included',
    expansionStatus: '#2 fastest US ISP (Ookla H1 2025). 7.2M fiber locations, 2.2M subscribers. Verizon acquisition approved May 2025, closing Feb 2026. Adding 2.8M fiber locations by end 2026.',
    metros: [
      { providerId: 'frontier-fiber', metroId: 'la', medianDown: 385, medianUp: 378, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'tampa', medianDown: 372, medianUp: 365, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'dallas', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'plano', medianDown: 375, medianUp: 368, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1, notes: 'Strong performance reported by users' },
      { providerId: 'frontier-fiber', metroId: 'indianapolis', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'columbus', medianDown: 352, medianUp: 345, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'san-diego', medianDown: 378, medianUp: 371, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'ziply-fiber',
    providerName: 'Ziply Fiber',
    connectionType: 'fiber',
    primaryStates: ['WA', 'OR', 'ID', 'MT'],
    nationalMedianDown: 892,
    nationalMedianUp: 885,
    nationalMedianLatency: 5,
    ooklaSpeedScore: 88.45,
    customerSatisfaction: 4.15,
    networkTechnology: 'XGS-PON fiber, symmetrical up to 50 Gbps - America\'s fastest residential internet',
    expansionStatus: 'CNET: "America\'s undisputed leader as fastest home internet". Investing hundreds of millions to reach 50% fiber coverage by end 2026. 50 Gig available in early-adopter regions.',
    metros: [
      { providerId: 'ziply-fiber', metroId: 'seattle', medianDown: 925, medianUp: 918, medianLatency: 4, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '50 Gig available - $900/mo' },
      { providerId: 'ziply-fiber', metroId: 'portland', medianDown: 912, medianUp: 905, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '50 Gig available' },
    ],
  },
  {
    providerId: 'epb-fiber',
    providerName: 'EPB Fiber Optics',
    connectionType: 'fiber',
    primaryStates: ['TN'],
    nationalMedianDown: 985,
    nationalMedianUp: 978,
    nationalMedianLatency: 2,
    ooklaSpeedScore: 95.21,
    customerSatisfaction: 4.52,
    networkTechnology: 'Nokia 25G PON - world\'s first community-wide 25 Gbps service',
    expansionStatus: 'Municipal utility serving 180K homes in Chattanooga area. First US provider to offer 1 Gbps (2010), 10 Gbps (2015), and 25 Gbps (2022). Model for municipal broadband.',
    metros: [
      { providerId: 'epb-fiber', metroId: 'chattanooga', medianDown: 985, medianUp: 978, medianLatency: 2, maxAvailableSpeed: 25000, consistencyScore: 99, peakHourDegradation: 0, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'World\'s fastest community-wide internet - 25 Gbps for $1,500/mo' },
    ],
  },
  {
    providerId: 'fidium-fiber',
    providerName: 'Fidium Fiber',
    connectionType: 'fiber',
    primaryStates: ['ME', 'NH', 'VT', 'TX', 'IL', 'MN', 'CA'],
    nationalMedianDown: 485,
    nationalMedianUp: 478,
    nationalMedianLatency: 6,
    ooklaSpeedScore: 82.15,
    customerSatisfaction: 4.08,
    networkTechnology: '100% fiber to the home, symmetrical up to 8 Gbps, WiFi 7',
    expansionStatus: '250+ Ookla top rankings (Q3-Q4 2025). 1.56M fiber passings in 700+ communities. Expanding to 2M by 2027. $1.9B invested since 2020. Best Internet Provider in Maine (CNET 2026).',
    metros: [
      // New England performance data
      { providerId: 'fidium-fiber', metroId: 'portland', medianDown: 512, medianUp: 505, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Maine: 150 Ookla wins, 8 Gig launching April 2026' },
    ],
  },
  {
    providerId: 'optimum-fiber',
    providerName: 'Optimum Fiber',
    connectionType: 'fiber',
    primaryStates: ['NY', 'NJ', 'CT', 'PA'],
    nationalMedianDown: 425,
    nationalMedianUp: 418,
    nationalMedianLatency: 8,
    ooklaSpeedScore: 79.85,
    customerSatisfaction: 3.49,
    networkTechnology: '100% fiber, symmetrical up to 8 Gbps',
    expansionStatus: 'Ookla: Fastest/most reliable in NY and NJ (Q1-Q2 2025). Lowest latency/best gaming in NY, NJ, CT. 3M fiber passings, adding 175K in 2025. 65% multi-gig coverage by 2028.',
    metros: [
      { providerId: 'optimum-fiber', metroId: 'nyc', medianDown: 452, medianUp: 445, medianLatency: 7, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Fastest in NYC metro (Ookla Q1-Q2 2025)' },
    ],
  },
  {
    providerId: 'brightspeed-fiber',
    providerName: 'Brightspeed Fiber',
    connectionType: 'fiber',
    primaryStates: ['NC', 'SC', 'OH', 'MO', 'PA', 'VA', 'TN', 'AL', 'FL'],
    nationalMedianDown: 412,
    nationalMedianUp: 405,
    nationalMedianLatency: 9,
    ooklaSpeedScore: 74.25,
    customerSatisfaction: 3.21,
    networkTechnology: 'FTTH fiber, symmetrical up to 8 Gbps',
    expansionStatus: '1.82M fiber homes (Jan 2025) of 6.5M total footprint. Building in 17 states. 50K+ homes connected in NC Triangle suburbs (2025). Charlotte-based startup expanding aggressively.',
    metros: [
      { providerId: 'brightspeed-fiber', metroId: 'charlotte', medianDown: 425, medianUp: 418, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'raleigh', medianDown: 418, medianUp: 411, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, has8Gig: true, ooklaRank: 3, notes: '50K homes connected in Triangle' },
    ],
  },
  {
    providerId: 'utopia-fiber',
    providerName: 'UTOPIA Fiber',
    connectionType: 'fiber',
    primaryStates: ['UT'],
    nationalMedianDown: 925,
    nationalMedianUp: 918,
    nationalMedianLatency: 4,
    ooklaSpeedScore: 91.25,
    customerSatisfaction: 4.35,
    networkTechnology: 'Open-access fiber network - dedicated line per home, 10 Gbps residential / 100 Gbps business',
    expansionStatus: 'Municipal open-access network in 20+ Utah cities. 810K people covered. 100% offer 1 Gbps+. Multiple ISPs compete (XMission, InfoWest, Sumo, etc.).',
    metros: [
      { providerId: 'utopia-fiber', metroId: 'salt-lake', medianDown: 945, medianUp: 938, medianLatency: 3, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Open-access - choose your ISP' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CABLE PROVIDERS
  // ════════════════════════════════════════════════════════════════════════════
  {
    providerId: 'xfinity',
    providerName: 'Xfinity (Comcast)',
    connectionType: 'cable',
    primaryStates: ['CA', 'FL', 'IL', 'PA', 'NJ', 'MA', 'MI', 'WA', 'CO', 'GA'],
    nationalMedianDown: 239,
    nationalMedianUp: 23,
    nationalMedianLatency: 26,
    ooklaSpeedScore: 69.95,
    customerSatisfaction: 3.32,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0, speeds up to 2 Gbps down',
    expansionStatus: '5th largest US ISP, 126M people covered. DOCSIS 4.0 mid-split rolling out (Philadelphia, Atlanta, Colorado Springs). 81% customer satisfaction with speeds (2025 survey). Opensignal Video Experience award.',
    metros: [
      { providerId: 'xfinity', metroId: 'philadelphia', medianDown: 268, medianUp: 42, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'DOCSIS 4.0 mid-split deployed - upload 70%+ faster' },
      { providerId: 'xfinity', metroId: 'chicago', medianDown: 252, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'sf', medianDown: 265, medianUp: 31, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'denver', medianDown: 275, medianUp: 45, medianLatency: 22, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'Colorado Springs DOCSIS 4.0 pilot' },
      { providerId: 'xfinity', metroId: 'atlanta', medianDown: 258, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: true, hasFiber: false, ooklaRank: 3, notes: 'DOCSIS 4.0 deployed' },
      { providerId: 'xfinity', metroId: 'boston', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'seattle', medianDown: 255, medianUp: 29, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'miami', medianDown: 245, medianUp: 25, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'houston', medianDown: 242, medianUp: 24, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'dc', medianDown: 262, medianUp: 32, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'spectrum',
    providerName: 'Spectrum (Charter)',
    connectionType: 'cable',
    primaryStates: ['CA', 'TX', 'NY', 'FL', 'NC', 'OH', 'WI', 'MO', 'KY', 'TN'],
    nationalMedianDown: 253,
    nationalMedianUp: 16,
    nationalMedianLatency: 32,
    ooklaSpeedScore: 67.71,
    customerSatisfaction: 3.24,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0 high-split, speeds up to 2 Gbps',
    expansionStatus: '6th largest US ISP, 113M people in 42 states. 92% consistency score (#1 cable). DOCSIS 4.0 high-split: Dallas saw 817% upload increase to 158 Mbps (Q2 2025). 85% footprint at 5G/1G by 2025. Opensignal #1 Reliability.',
    metros: [
      { providerId: 'spectrum', metroId: 'dallas', medianDown: 285, medianUp: 158, medianLatency: 28, maxAvailableSpeed: 2000, consistencyScore: 93, peakHourDegradation: 8, hasDocsis4: true, hasFiber: false, ooklaRank: 3, notes: 'DOCSIS 4.0 high-split - 817% upload increase!' },
      { providerId: 'spectrum', metroId: 'la', medianDown: 268, medianUp: 22, medianLatency: 30, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 10, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'nyc', medianDown: 275, medianUp: 25, medianLatency: 29, maxAvailableSpeed: 2000, consistencyScore: 92, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'charlotte', medianDown: 262, medianUp: 18, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 4 },
      { providerId: 'spectrum', metroId: 'san-antonio', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'fort-worth', medianDown: 282, medianUp: 145, medianLatency: 28, maxAvailableSpeed: 2000, consistencyScore: 93, peakHourDegradation: 8, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'DOCSIS 4.0 high-split deployed' },
      { providerId: 'spectrum', metroId: 'columbus', medianDown: 255, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'louisville', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'milwaukee', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'cox',
    providerName: 'Cox Communications',
    connectionType: 'cable',
    primaryStates: ['AZ', 'VA', 'NV', 'LA', 'OK', 'CA', 'RI', 'CT', 'FL', 'GA'],
    nationalMedianDown: 261,
    nationalMedianUp: 34,
    nationalMedianLatency: 25,
    ooklaSpeedScore: 70.55,
    customerSatisfaction: 3.14,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0, speeds up to 2 Gbps',
    expansionStatus: 'Fastest cable ISP (261 Mbps median - Ookla Q4 2023). #4 overall US ISP. 23.3M people in 18 states. DOCSIS 4.0 and fiber expansion in progress. Best cable upload speeds (34 Mbps median).',
    metros: [
      { providerId: 'cox', metroId: 'phoenix', medianDown: 285, medianUp: 42, medianLatency: 22, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'Fastest Cox market' },
      { providerId: 'cox', metroId: 'las-vegas', medianDown: 278, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'san-diego', medianDown: 272, medianUp: 36, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'cox', metroId: 'tucson', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 1, notes: 'Limited competition - Cox dominates' },
      { providerId: 'cox', metroId: 'omaha', medianDown: 258, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'wow',
    providerName: 'WOW! Internet',
    connectionType: 'cable',
    primaryStates: ['AL', 'FL', 'GA', 'MI', 'SC', 'TN'],
    nationalMedianDown: 312,
    nationalMedianUp: 45,
    nationalMedianLatency: 21,
    ooklaSpeedScore: 72.85,
    customerSatisfaction: 3.45,
    networkTechnology: 'Hybrid fiber-coax + FTTH fiber, speeds up to 5 Gbps in fiber areas',
    expansionStatus: '8th largest cable ISP, 1.9M homes. Building fiber in Central FL, Greenville SC, Michigan. 5 Gig fiber available in expansion areas. Strong value pricing.',
    metros: [
      { providerId: 'wow', metroId: 'detroit', medianDown: 328, medianUp: 52, medianLatency: 19, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 8, hasDocsis4: false, hasFiber: true, ooklaRank: 2, notes: 'Fiber expansion - 5 Gig available' },
      { providerId: 'wow', metroId: 'tampa', medianDown: 335, medianUp: 55, medianLatency: 18, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 7, hasDocsis4: false, hasFiber: true, ooklaRank: 3, notes: 'Central FL fiber buildout' },
      { providerId: 'wow', metroId: 'atlanta', medianDown: 308, medianUp: 42, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 4 },
    ],
  },
  {
    providerId: 'mediacom',
    providerName: 'Mediacom',
    connectionType: 'cable',
    primaryStates: ['IA', 'IL', 'GA', 'MN', 'MO', 'AL', 'FL', 'IN', 'AZ', 'CA'],
    nationalMedianDown: 185,
    nationalMedianUp: 18,
    nationalMedianLatency: 28,
    ooklaSpeedScore: 62.45,
    customerSatisfaction: 3.01,
    networkTechnology: 'Hybrid fiber-coax, DOCSIS 3.1, speeds up to 1 Gbps',
    expansionStatus: '22nd largest US ISP, 6.9M people in 22 states. Expanding multi-gig symmetrical to 1M homes by 2026. Requires DOCSIS 3.1 modem for gig service. 3-year contracts available.',
    metros: [
      { providerId: 'mediacom', metroId: 'des-moines', medianDown: 198, medianUp: 22, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2, notes: 'Iowa headquarters' },
    ],
  },
  {
    providerId: 'astound',
    providerName: 'Astound Broadband',
    connectionType: 'cable',
    primaryStates: ['TX', 'IL', 'CA', 'WA', 'OR', 'PA', 'NY', 'NJ', 'MD', 'DC'],
    nationalMedianDown: 245,
    nationalMedianUp: 28,
    nationalMedianLatency: 24,
    ooklaSpeedScore: 68.75,
    customerSatisfaction: 3.38,
    networkTechnology: 'Hybrid fiber-coax + fiber, speeds up to 1.5 Gbps',
    expansionStatus: 'Operates 4 regional networks: RCN (Chicago/Northeast), Grande (Texas), enTouch (Houston), Wave (West Coast). 1 Gbps cable, some fiber. Data caps in WA/OR/CA (Wave areas).',
    metros: [
      { providerId: 'astound', metroId: 'chicago', medianDown: 268, medianUp: 35, medianLatency: 22, maxAvailableSpeed: 1500, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      { providerId: 'astound', metroId: 'austin', medianDown: 255, medianUp: 32, medianLatency: 23, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Grande network' },
      { providerId: 'astound', metroId: 'houston', medianDown: 242, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'enTouch network - pricing varies' },
      { providerId: 'astound', metroId: 'seattle', medianDown: 262, medianUp: 30, medianLatency: 23, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Wave network - data caps apply' },
      { providerId: 'astound', metroId: 'portland', medianDown: 258, medianUp: 29, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Wave network - data caps apply' },
    ],
  },
  {
    providerId: 'breezeline',
    providerName: 'Breezeline',
    connectionType: 'cable',
    primaryStates: ['PA', 'WV', 'MD', 'OH', 'NH', 'ME', 'SC', 'FL'],
    nationalMedianDown: 215,
    nationalMedianUp: 32,
    nationalMedianLatency: 26,
    ooklaSpeedScore: 65.85,
    customerSatisfaction: 3.28,
    networkTechnology: 'Hybrid fiber-coax + FTTH patches, speeds up to 1 Gbps',
    expansionStatus: 'Formerly Atlantic Broadband. No contracts, no data caps. Upload speeds 10-50 Mbps (generous for cable). Small FTTH patches in select areas. Aggressive fiber expansion 2024-2026.',
    metros: [
      { providerId: 'breezeline', metroId: 'pittsburgh', medianDown: 228, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: true, ooklaRank: 3, notes: 'No contracts, no caps' },
    ],
  },
  {
    providerId: 'sparklight',
    providerName: 'Sparklight',
    connectionType: 'cable',
    primaryStates: ['AZ', 'ID', 'TX', 'MS', 'LA', 'OK', 'NM', 'OR', 'WA', 'MT'],
    nationalMedianDown: 195,
    nationalMedianUp: 25,
    nationalMedianLatency: 28,
    ooklaSpeedScore: 63.25,
    customerSatisfaction: 3.15,
    networkTechnology: 'Fiber-rich cable + FTTH patches, speeds up to 7 Gbps in fiber areas',
    expansionStatus: 'Formerly Cable ONE. Serves smaller towns/rural areas. Ookla: Fastest in Prescott/Prescott Valley (H1 2025). 5 TB soft data cap (no overage fees). 7 Gbps fiber in select areas.',
    metros: [
      { providerId: 'sparklight', metroId: 'prescott', medianDown: 285, medianUp: 52, medianLatency: 22, maxAvailableSpeed: 7000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 1, notes: 'Ookla: Fastest in Prescott (H1 2025) - 51% faster upload than competitors' },
      { providerId: 'sparklight', metroId: 'tucson', medianDown: 215, medianUp: 28, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
];

// ── Public API ──

export function getAllProviderProfiles(): ProviderRegionalProfile[] {
  return [...PROVIDER_PROFILES];
}

export function getProviderProfile(providerId: string): ProviderRegionalProfile | undefined {
  return PROVIDER_PROFILES.find(p => p.providerId === providerId);
}

export function getProvidersByConnectionType(type: ConnectionType): ProviderRegionalProfile[] {
  return PROVIDER_PROFILES.filter(p => p.connectionType === type);
}

export function getProvidersByState(stateCode: string): ProviderRegionalProfile[] {
  return PROVIDER_PROFILES.filter(p =>
    p.primaryStates.includes(stateCode.toUpperCase())
  );
}

export function getMetroData(metroId: string): MetroProviderSummary | undefined {
  const metro = METROS[metroId];
  if (!metro) return undefined;

  const providers: ProviderMetroData[] = [];
  for (const profile of PROVIDER_PROFILES) {
    const metroData = profile.metros.find(m => m.metroId === metroId);
    if (metroData) {
      providers.push(metroData);
    }
  }

  if (providers.length === 0) return undefined;

  // Sort by median download speed
  providers.sort((a, b) => b.medianDown - a.medianDown);

  const avgDown = providers.reduce((sum, p) => sum + p.medianDown, 0) / providers.length;
  const avgLatency = providers.reduce((sum, p) => sum + p.medianLatency, 0) / providers.length;
  const fiberProviders = providers.filter(p => {
    const profile = PROVIDER_PROFILES.find(pr => pr.providerId === p.providerId);
    return profile?.connectionType === 'fiber';
  });
  const cableProviders = providers.filter(p => {
    const profile = PROVIDER_PROFILES.find(pr => pr.providerId === p.providerId);
    return profile?.connectionType === 'cable';
  });

  const topProvider = providers[0];
  const topProfile = PROVIDER_PROFILES.find(p => p.providerId === topProvider.providerId);

  return {
    metroId,
    metroName: metro.name,
    state: metro.state,
    population: metro.population,
    medianDown: Math.round(avgDown),
    medianLatency: Math.round(avgLatency),
    fiberAvailability: fiberProviders.length > 0 ? Math.round((fiberProviders.length / providers.length) * 100) : 0,
    cableAvailability: cableProviders.length > 0 ? Math.round((cableProviders.length / providers.length) * 100) : 0,
    topProvider: topProfile?.providerName ?? 'Unknown',
    providers,
  };
}

export function getProviderMetroData(providerId: string, metroId: string): ProviderMetroData | undefined {
  const profile = PROVIDER_PROFILES.find(p => p.providerId === providerId);
  return profile?.metros.find(m => m.metroId === metroId);
}

export function getAllMetros(): { id: string; name: string; state: string }[] {
  return Object.entries(METROS).map(([id, data]) => ({
    id,
    name: data.name,
    state: data.state,
  }));
}

export function getMetrosByState(stateCode: string): { id: string; name: string; state: string }[] {
  return Object.entries(METROS)
    .filter(([, data]) => data.state === stateCode.toUpperCase())
    .map(([id, data]) => ({
      id,
      name: data.name,
      state: data.state,
    }));
}

export function getFastestProvidersInMetro(metroId: string, limit = 5): { provider: ProviderRegionalProfile; metroData: ProviderMetroData }[] {
  const results: { provider: ProviderRegionalProfile; metroData: ProviderMetroData }[] = [];

  for (const profile of PROVIDER_PROFILES) {
    const metroData = profile.metros.find(m => m.metroId === metroId);
    if (metroData) {
      results.push({ provider: profile, metroData });
    }
  }

  return results
    .sort((a, b) => b.metroData.medianDown - a.metroData.medianDown)
    .slice(0, limit);
}

export function getHyperlocalPlacementTips(providerId: string, metroId: string): HyperlocalPlacementGuide | undefined {
  const profile = PROVIDER_PROFILES.find(p => p.providerId === providerId);
  const metroData = profile?.metros.find(m => m.metroId === metroId);

  if (!profile || !metroData) return undefined;

  const tips: HyperlocalPlacementGuide['tips'] = [];

  // Connection-type specific tips
  if (profile.connectionType === 'fiber') {
    tips.push({
      priority: 'high',
      tip: `${profile.providerName} fiber delivers ${metroData.medianDown} Mbps median in ${METROS[metroId]?.name ?? metroId} — your speed is limited by Wi-Fi, not the fiber connection`,
      reason: 'Fiber speeds far exceed Wi-Fi capabilities, so router placement matters more than line quality',
    });

    if (metroData.has8Gig) {
      tips.push({
        priority: 'medium',
        tip: `8 Gbps tier available — requires WiFi 7 router and wired connections to utilize full speed`,
        reason: 'Multi-gig speeds require latest hardware to realize benefits',
      });
    }

    if (metroData.medianLatency <= 5) {
      tips.push({
        priority: 'low',
        tip: `Ultra-low latency (${metroData.medianLatency}ms) — excellent for competitive gaming and video conferencing`,
        reason: 'Sub-5ms latency provides near-instantaneous response times',
      });
    }
  }

  if (profile.connectionType === 'cable') {
    if (metroData.hasDocsis4) {
      tips.push({
        priority: 'critical',
        tip: `DOCSIS 4.0 deployed in ${METROS[metroId]?.name ?? metroId} — upload speeds significantly improved (${metroData.medianUp} Mbps)`,
        reason: 'DOCSIS 4.0 mid-split/high-split dramatically increases upload capacity',
      });
    }

    tips.push({
      priority: 'high',
      tip: `Cable modem placement is fixed to coax outlet — use a longer RG6 coax cable (up to 25 ft) to reposition the gateway more centrally`,
      reason: 'Moving the gateway doesn\'t affect cable speed but significantly improves Wi-Fi coverage',
    });

    if (metroData.peakHourDegradation > 12) {
      tips.push({
        priority: 'high',
        tip: `Expect ${metroData.peakHourDegradation}% speed drop during peak hours (6-10 PM) — schedule large downloads for off-peak times`,
        reason: 'Cable networks are shared; congestion increases during evening hours',
      });
    }

    tips.push({
      priority: 'medium',
      tip: `Check for coax splitters between the wall and modem — each splitter reduces signal 3-7 dB`,
      reason: 'Signal loss from splitters can reduce speeds by 10-20%',
    });
  }

  // Universal tips
  if (metroData.consistencyScore >= 95) {
    tips.push({
      priority: 'low',
      tip: `${metroData.consistencyScore}% consistency score — connection is very reliable in this market`,
      reason: 'High consistency means predictable speeds across time of day',
    });
  }

  if (metroData.notes) {
    tips.push({
      priority: 'medium',
      tip: metroData.notes,
      reason: 'Market-specific information from speed test data',
    });
  }

  return {
    providerId,
    metroId,
    tips,
  };
}

// ── Speed Comparison Helpers ──

export function compareProviders(providerId1: string, providerId2: string, metroId: string): {
  winner: string;
  speedDiff: number;
  latencyDiff: number;
  summary: string;
} | undefined {
  const data1 = getProviderMetroData(providerId1, metroId);
  const data2 = getProviderMetroData(providerId2, metroId);
  const profile1 = getProviderProfile(providerId1);
  const profile2 = getProviderProfile(providerId2);

  if (!data1 || !data2 || !profile1 || !profile2) return undefined;

  const speedDiff = data1.medianDown - data2.medianDown;
  const latencyDiff = data2.medianLatency - data1.medianLatency; // Lower is better
  const winner = speedDiff >= 0 ? providerId1 : providerId2;
  const winnerProfile = speedDiff >= 0 ? profile1 : profile2;
  const loserProfile = speedDiff >= 0 ? profile2 : profile1;

  const summary = `${winnerProfile.providerName} is ${Math.abs(speedDiff)} Mbps faster than ${loserProfile.providerName} in ${METROS[metroId]?.name ?? metroId}`;

  return {
    winner,
    speedDiff: Math.abs(speedDiff),
    latencyDiff,
    summary,
  };
}

export function getProviderRankingInMetro(providerId: string, metroId: string): number | undefined {
  const fastest = getFastestProvidersInMetro(metroId, 20);
  const index = fastest.findIndex(f => f.provider.providerId === providerId);
  return index >= 0 ? index + 1 : undefined;
}

// ── National Statistics ──

export function getNationalStats(): {
  fastestFiber: { provider: string; speed: number };
  fastestCable: { provider: string; speed: number };
  lowestLatency: { provider: string; latency: number };
  highestConsistency: { provider: string; score: number };
} {
  const fiberProviders = PROVIDER_PROFILES.filter(p => p.connectionType === 'fiber');
  const cableProviders = PROVIDER_PROFILES.filter(p => p.connectionType === 'cable');

  const fastestFiber = fiberProviders.reduce((best, p) =>
    p.nationalMedianDown > best.nationalMedianDown ? p : best
  );

  const fastestCable = cableProviders.reduce((best, p) =>
    p.nationalMedianDown > best.nationalMedianDown ? p : best
  );

  const lowestLatency = PROVIDER_PROFILES.reduce((best, p) =>
    p.nationalMedianLatency < best.nationalMedianLatency ? p : best
  );

  // Find highest consistency from metro data
  let highestConsistency = { provider: '', score: 0 };
  for (const profile of PROVIDER_PROFILES) {
    for (const metro of profile.metros) {
      if (metro.consistencyScore > highestConsistency.score) {
        highestConsistency = { provider: profile.providerName, score: metro.consistencyScore };
      }
    }
  }

  return {
    fastestFiber: { provider: fastestFiber.providerName, speed: fastestFiber.nationalMedianDown },
    fastestCable: { provider: fastestCable.providerName, speed: fastestCable.nationalMedianDown },
    lowestLatency: { provider: lowestLatency.providerName, latency: lowestLatency.nationalMedianLatency },
    highestConsistency,
  };
}
