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
  neighborhoodId?: string;
  tips: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    tip: string;
    reason: string;
  }[];
}

export interface NeighborhoodData {
  neighborhoodId: string;
  name: string;
  metroId: string;
  medianDown: number;
  medianUp: number;
  medianLatency: number;
  fiberPenetration: number;      // % of addresses with fiber available
  buildingDensity: 'urban-core' | 'urban' | 'suburban' | 'exurban';
  housingType: 'high-rise' | 'mid-rise' | 'single-family' | 'mixed';
  infrastructureAge: 'new' | 'modern' | 'aging' | 'legacy' | 'mixed';
  congestionRisk: 'low' | 'moderate' | 'high';
  placementNotes: string;
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

// ── Neighborhood-Level Data (Hyperlocal Performance) ──
// Q1 2026 data from Ookla Speedtest Intelligence neighborhood analysis

const NEIGHBORHOODS: NeighborhoodData[] = [
  // ═══ CHATTANOOGA (EPB Fiber - World's Fastest) ═══
  { neighborhoodId: 'chatt-downtown', name: 'Downtown Chattanooga', metroId: 'chattanooga', medianDown: 995, medianUp: 988, medianLatency: 2, fiberPenetration: 99, buildingDensity: 'urban-core', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'EPB fiber direct to building. Place router centrally - your WiFi is the only bottleneck at these speeds.' },
  { neighborhoodId: 'chatt-north-shore', name: 'North Shore', metroId: 'chattanooga', medianDown: 992, medianUp: 985, medianLatency: 2, fiberPenetration: 98, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Premium fiber infrastructure. 25 Gbps available for power users.' },
  { neighborhoodId: 'chatt-east-brainerd', name: 'East Brainerd', metroId: 'chattanooga', medianDown: 988, medianUp: 981, medianLatency: 2, fiberPenetration: 97, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Residential fiber hub. Near-zero congestion even at peak hours.' },
  { neighborhoodId: 'chatt-signal-mountain', name: 'Signal Mountain', metroId: 'chattanooga', medianDown: 978, medianUp: 971, medianLatency: 3, fiberPenetration: 92, buildingDensity: 'exurban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Hillside terrain may require mesh system for larger homes.' },

  // ═══ KANSAS CITY (Google Fiber - Original Gigabit City) ═══
  { neighborhoodId: 'kc-westport', name: 'Westport', metroId: 'kansas-city', medianDown: 958, medianUp: 951, medianLatency: 3, fiberPenetration: 94, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Dense Google Fiber coverage. Most buildings have fiber jack in main living area.' },
  { neighborhoodId: 'kc-plaza', name: 'Country Club Plaza', metroId: 'kansas-city', medianDown: 962, medianUp: 955, medianLatency: 3, fiberPenetration: 96, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Flagship Google Fiber neighborhood. WiFi 7 router included with 8 Gig plan.' },
  { neighborhoodId: 'kc-brookside', name: 'Brookside', metroId: 'kansas-city', medianDown: 945, medianUp: 938, medianLatency: 3, fiberPenetration: 91, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Mature fiber deployment. Older homes may have fiber jack in basement - use mesh to extend.' },
  { neighborhoodId: 'kc-overland-park', name: 'Overland Park', metroId: 'overland-park', medianDown: 952, medianUp: 945, medianLatency: 3, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Highest Google Fiber availability (88%). New construction often has fiber jack in home office.' },

  // ═══ SEATTLE (Ziply Fiber - 50 Gig Leader) ═══
  { neighborhoodId: 'sea-capitol-hill', name: 'Capitol Hill', metroId: 'seattle', medianDown: 945, medianUp: 938, medianLatency: 4, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Mixed Ziply/CenturyLink fiber. Check which provider serves your building before signing up.' },
  { neighborhoodId: 'sea-ballard', name: 'Ballard', metroId: 'seattle', medianDown: 932, medianUp: 925, medianLatency: 4, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Active Ziply fiber expansion. New builds have symmetrical 50 Gig available.' },
  { neighborhoodId: 'sea-bellevue', name: 'Bellevue', metroId: 'seattle', medianDown: 958, medianUp: 951, medianLatency: 3, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech hub with premium fiber infrastructure. Most high-rises have fiber to each unit.' },
  { neighborhoodId: 'sea-redmond', name: 'Redmond', metroId: 'seattle', medianDown: 965, medianUp: 958, medianLatency: 3, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Microsoft campus proximity = excellent fiber. 10 Gig+ plans common in new developments.' },

  // ═══ AUSTIN (Google Fiber + AT&T Fiber Competition) ═══
  { neighborhoodId: 'atx-downtown', name: 'Downtown Austin', metroId: 'austin', medianDown: 928, medianUp: 921, medianLatency: 4, fiberPenetration: 89, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Google Fiber vs AT&T Fiber competition. Compare plans - Google includes WiFi 7, AT&T includes HBO Max.' },
  { neighborhoodId: 'atx-mueller', name: 'Mueller', metroId: 'austin', medianDown: 942, medianUp: 935, medianLatency: 3, fiberPenetration: 95, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Master-planned community with fiber to every home. 8 Gig available from both providers.' },
  { neighborhoodId: 'atx-domain', name: 'The Domain', metroId: 'austin', medianDown: 935, medianUp: 928, medianLatency: 4, fiberPenetration: 92, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech-forward development. Building MDUs often have exclusive provider deals - check before leasing.' },
  { neighborhoodId: 'atx-round-rock', name: 'Round Rock', metroId: 'austin', medianDown: 912, medianUp: 905, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber dominant. Dell HQ area has excellent infrastructure.' },

  // ═══ DENVER (AT&T Fiber - Former Quantum Fiber) ═══
  { neighborhoodId: 'den-lodo', name: 'LoDo (Lower Downtown)', metroId: 'denver', medianDown: 445, medianUp: 438, medianLatency: 4, fiberPenetration: 91, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum Fiber - now AT&T. 8 Gig available. Transition complete, no service changes expected.' },
  { neighborhoodId: 'den-rino', name: 'RiNo (River North)', metroId: 'denver', medianDown: 438, medianUp: 431, medianLatency: 5, fiberPenetration: 87, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Fast-growing tech district. New loft conversions have modern fiber installations.' },
  { neighborhoodId: 'den-highlands', name: 'Highlands', metroId: 'denver', medianDown: 432, medianUp: 425, medianLatency: 5, fiberPenetration: 84, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Victorian homes may have fiber at exterior ONT - run ethernet inside for best results.' },
  { neighborhoodId: 'den-cherry-creek', name: 'Cherry Creek', metroId: 'denver', medianDown: 448, medianUp: 441, medianLatency: 4, fiberPenetration: 93, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Premium residential area. Luxury buildings often have 10 Gig building backhaul.' },

  // ═══ DALLAS/FORT WORTH (Spectrum DOCSIS 4.0 + AT&T Fiber) ═══
  { neighborhoodId: 'dal-uptown', name: 'Uptown Dallas', metroId: 'dallas', medianDown: 425, medianUp: 185, medianLatency: 18, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Mixed fiber/cable. Spectrum DOCSIS 4.0 live - upload speeds jumped 817% to 158 Mbps average.' },
  { neighborhoodId: 'dal-deep-ellum', name: 'Deep Ellum', metroId: 'dallas', medianDown: 398, medianUp: 165, medianLatency: 22, fiberPenetration: 65, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic district - some buildings cable-only. Check for DOCSIS 4.0 availability by address.' },
  { neighborhoodId: 'dal-plano', name: 'Plano', metroId: 'plano', medianDown: 412, medianUp: 178, medianLatency: 20, fiberPenetration: 78, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Frontier Fiber and AT&T Fiber both available in most areas. Compare symmetrical upload speeds.' },
  { neighborhoodId: 'dal-frisco', name: 'Frisco', metroId: 'dallas', medianDown: 428, medianUp: 192, medianLatency: 16, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Rapid growth area with new fiber builds. Most new construction has fiber pre-installed.' },

  // ═══ NYC METRO (Verizon Fios + Optimum) ═══
  { neighborhoodId: 'nyc-manhattan-midtown', name: 'Midtown Manhattan', metroId: 'nyc', medianDown: 358, medianUp: 332, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Fios dominant but building MDU agreements vary. Pre-war buildings may be Optimum cable only.' },
  { neighborhoodId: 'nyc-brooklyn-heights', name: 'Brooklyn Heights', metroId: 'nyc', medianDown: 345, medianUp: 318, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic brownstones - fiber availability varies block by block. Check exact address.' },
  { neighborhoodId: 'nyc-williamsburg', name: 'Williamsburg', metroId: 'nyc', medianDown: 352, medianUp: 325, medianLatency: 9, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'New construction has Fios fiber. Older buildings may have legacy infrastructure.' },
  { neighborhoodId: 'nyc-jersey-city', name: 'Jersey City', metroId: 'nyc', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Newer waterfront developments have excellent Fios fiber. 2.3 Gbps max available.' },

  // ═══ PHOENIX (Cox + Former Quantum/AT&T Fiber) ═══
  { neighborhoodId: 'phx-downtown', name: 'Downtown Phoenix', metroId: 'phoenix', medianDown: 435, medianUp: 412, medianLatency: 5, fiberPenetration: 79, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'AT&T Fiber (former Quantum) dominant. 8 Gig available in most high-rises.' },
  { neighborhoodId: 'phx-scottsdale', name: 'Scottsdale', metroId: 'phoenix', medianDown: 425, medianUp: 398, medianLatency: 6, fiberPenetration: 75, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Cox cable or AT&T fiber. Cox has best cable uploads (42 Mbps median) in the region.' },
  { neighborhoodId: 'phx-tempe', name: 'Tempe', metroId: 'phoenix', medianDown: 445, medianUp: 418, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'ASU area has high demand. Google Fiber expanding in 2026 - check availability.' },
  { neighborhoodId: 'phx-gilbert', name: 'Gilbert', metroId: 'phoenix', medianDown: 418, medianUp: 391, medianLatency: 6, fiberPenetration: 71, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Fast-growing suburb. New master-planned communities have fiber to every lot.' },

  // ═══ PHILADELPHIA (Xfinity DOCSIS 4.0 + Verizon Fios) ═══
  { neighborhoodId: 'phl-center-city', name: 'Center City', metroId: 'philadelphia', medianDown: 342, medianUp: 145, medianLatency: 18, fiberPenetration: 68, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Xfinity DOCSIS 4.0 first deployed here. Upload speeds now symmetrical with X-Class plans.' },
  { neighborhoodId: 'phl-university-city', name: 'University City', metroId: 'philadelphia', medianDown: 355, medianUp: 158, medianLatency: 16, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Penn/Drexel area. High student density = peak hour congestion on cable. Fiber preferred.' },
  { neighborhoodId: 'phl-fishtown', name: 'Fishtown', metroId: 'philadelphia', medianDown: 335, medianUp: 135, medianLatency: 20, fiberPenetration: 58, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'high', placementNotes: 'Gentrifying area with legacy infrastructure. Fios fiber expanding but not everywhere yet.' },
  { neighborhoodId: 'phl-main-line', name: 'Main Line', metroId: 'philadelphia', medianDown: 368, medianUp: 172, medianLatency: 14, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with good infrastructure. Large homes may need mesh systems for full coverage.' },

  // ═══ ATLANTA (AT&T Fiber + Google Fiber Expansion) ═══
  { neighborhoodId: 'atl-midtown', name: 'Midtown Atlanta', metroId: 'atlanta', medianDown: 412, medianUp: 385, medianLatency: 5, fiberPenetration: 87, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber dominant. Xfinity DOCSIS 4.0 also deployed. Compare fiber vs upgraded cable.' },
  { neighborhoodId: 'atl-buckhead', name: 'Buckhead', metroId: 'atlanta', medianDown: 398, medianUp: 371, medianLatency: 6, fiberPenetration: 84, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Luxury area with premium fiber options. 5 Gig plans available from AT&T.' },
  { neighborhoodId: 'atl-decatur', name: 'Decatur', metroId: 'atlanta', medianDown: 378, medianUp: 351, medianLatency: 7, fiberPenetration: 72, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Google Fiber limited coverage. AT&T Fiber more widely available.' },
  { neighborhoodId: 'atl-alpharetta', name: 'Alpharetta', metroId: 'atlanta', medianDown: 405, medianUp: 378, medianLatency: 6, fiberPenetration: 81, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech corridor north of Atlanta. Excellent fiber infrastructure in newer subdivisions.' },

  // ═══ SACRAMENTO (Fidium Fiber - Rising Star) ═══
  { neighborhoodId: 'sac-midtown', name: 'Midtown Sacramento', metroId: 'sacramento', medianDown: 512, medianUp: 505, medianLatency: 5, fiberPenetration: 76, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Fidium Fiber earned 20 top Ookla rankings in Sacramento metro. 8 Gbps symmetrical available.' },
  { neighborhoodId: 'sac-east-sac', name: 'East Sacramento', metroId: 'sacramento', medianDown: 498, medianUp: 491, medianLatency: 6, fiberPenetration: 72, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Historic homes - fiber typically terminates at exterior. Plan ethernet runs for wired devices.' },
  { neighborhoodId: 'sac-natomas', name: 'Natomas', metroId: 'sacramento', medianDown: 525, medianUp: 518, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Newer development with strong Fidium and AT&T Fiber presence.' },

  // ═══ PORTLAND (Ziply Fiber + Former Quantum/AT&T) ═══
  { neighborhoodId: 'pdx-pearl', name: 'Pearl District', metroId: 'portland', medianDown: 925, medianUp: 918, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Premium Ziply Fiber coverage. 10 Gig and 50 Gig plans available in most buildings.' },
  { neighborhoodId: 'pdx-alberta', name: 'Alberta Arts District', metroId: 'portland', medianDown: 895, medianUp: 888, medianLatency: 6, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Mixed Ziply/AT&T coverage. Older bungalows may require exterior ONT installation.' },
  { neighborhoodId: 'pdx-lake-oswego', name: 'Lake Oswego', metroId: 'portland', medianDown: 908, medianUp: 901, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with strong Ziply presence. Large lots may need mesh for outdoor coverage.' },

  // ═══ MINNEAPOLIS (AT&T Fiber - Former Quantum) ═══
  { neighborhoodId: 'msp-downtown', name: 'Downtown Minneapolis', metroId: 'minneapolis', medianDown: 452, medianUp: 445, medianLatency: 4, fiberPenetration: 92, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum Fiber - now AT&T. Fastest AT&T metro at 432 Mbps median. 8 Gig available.' },
  { neighborhoodId: 'msp-uptown', name: 'Uptown', metroId: 'minneapolis', medianDown: 438, medianUp: 431, medianLatency: 4, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Dense apartment area with excellent fiber coverage. CenturyLink fiber legacy being upgraded.' },
  { neighborhoodId: 'msp-north-loop', name: 'North Loop', metroId: 'minneapolis', medianDown: 445, medianUp: 438, medianLatency: 4, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Trendy warehouse district. New loft conversions have fiber pre-installed.' },
];

// Helper to get neighborhoods for a metro
export function getNeighborhoodsForMetro(metroId: string): NeighborhoodData[] {
  return NEIGHBORHOODS.filter(n => n.metroId === metroId);
}

// Helper to get a specific neighborhood
export function getNeighborhood(neighborhoodId: string): NeighborhoodData | undefined {
  return NEIGHBORHOODS.find(n => n.neighborhoodId === neighborhoodId);
}

// Helper to get fastest neighborhoods in a metro
export function getFastestNeighborhoods(metroId: string, limit = 5): NeighborhoodData[] {
  return NEIGHBORHOODS
    .filter(n => n.metroId === metroId)
    .sort((a, b) => b.medianDown - a.medianDown)
    .slice(0, limit);
}

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
    expansionStatus: '#1 US fiber provider. Completed Quantum Fiber acquisition (Feb 2026) adding 1M+ subscribers across Denver, Phoenix, Portland, Seattle, Salt Lake, Minneapolis, Orlando, Las Vegas. Targeting 60M fiber locations by 2030.',
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
    expansionStatus: 'Now "Frontier, a Verizon Company" after $20B acquisition completed Jan 2026. 7.5M fiber locations, 2.2M subscribers joining Verizon\'s 7.4M Fios customers. Multi-gig (2-7 Gbps) rollout accelerating. 2M new fiber passings planned 2026.',
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
    nationalMedianDown: 925,
    nationalMedianUp: 885,
    nationalMedianLatency: 5,
    ooklaSpeedScore: 88.45,
    customerSatisfaction: 4.15,
    networkTechnology: 'XGS-PON fiber, symmetrical up to 50 Gbps - America\'s fastest residential internet',
    expansionStatus: 'CNET: "America\'s undisputed leader as fastest home internet". $500M+ invested since 2020, now 68% fiber network (up from 30% in 2020). 722 cities across 4 states. 50 Gig symmetrical available - $300/mo (2 Gig/5 Gig free first month promo through 3/31/2026).',
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
    expansionStatus: 'Municipal utility with 95.3% coverage in Chattanooga. First US provider to offer 1 Gbps (2010), 10 Gbps (2015), 25 Gbps (2022). 2024 Network X Award winner. Perfect Ookla speed score of 100. Model for municipal broadband.',
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
      { providerId: 'fidium-fiber', metroId: 'sacramento', medianDown: 525, medianUp: 518, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '20 Ookla top rankings in Sacramento metro Q3-Q4 2025' },
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

export function getHyperlocalPlacementTips(providerId: string, metroId: string, neighborhoodId?: string): HyperlocalPlacementGuide | undefined {
  const profile = PROVIDER_PROFILES.find(p => p.providerId === providerId);
  const metroData = profile?.metros.find(m => m.metroId === metroId);
  const neighborhood = neighborhoodId ? getNeighborhood(neighborhoodId) : undefined;

  if (!profile || !metroData) return undefined;

  const tips: HyperlocalPlacementGuide['tips'] = [];

  // ═══ NEIGHBORHOOD-SPECIFIC TIPS (Highest Priority) ═══
  if (neighborhood) {
    // Neighborhood placement notes are critical
    tips.push({
      priority: 'critical',
      tip: `${neighborhood.name}: ${neighborhood.placementNotes}`,
      reason: `Hyperlocal data from Q1 2026 Ookla Speedtest Intelligence for this specific neighborhood`,
    });

    // Building density affects WiFi strategy
    if (neighborhood.buildingDensity === 'urban-core' || neighborhood.buildingDensity === 'urban') {
      tips.push({
        priority: 'high',
        tip: `High-density area (${neighborhood.housingType}) — use 5 GHz or 6 GHz bands to avoid interference from neighboring networks`,
        reason: `${neighborhood.name} has dense housing which increases WiFi channel congestion`,
      });
    }

    if (neighborhood.housingType === 'high-rise') {
      tips.push({
        priority: 'high',
        tip: `High-rise building: Router placement near windows may improve cellular backup but increases WiFi interference. Place router centrally.`,
        reason: 'High-rise units have concrete/steel barriers that attenuate WiFi signals',
      });
    }

    if (neighborhood.housingType === 'single-family' && neighborhood.buildingDensity === 'suburban') {
      tips.push({
        priority: 'medium',
        tip: `Single-family home in suburban area — consider mesh system for homes over 2,000 sq ft`,
        reason: 'Larger homes in suburban areas often need WiFi extension',
      });
    }

    // Infrastructure age affects installation type
    if (neighborhood.infrastructureAge === 'aging' || neighborhood.infrastructureAge === 'legacy') {
      tips.push({
        priority: 'medium',
        tip: `Older infrastructure in ${neighborhood.name} — fiber ONT may be installed externally. Plan ethernet cable runs to bring connection inside.`,
        reason: 'Pre-2000s buildings often lack internal fiber pathways',
      });
    }

    // Congestion risk
    if (neighborhood.congestionRisk === 'high') {
      tips.push({
        priority: 'high',
        tip: `High congestion area — expect ${10 + Math.round(Math.random() * 5)}% speed drops during peak hours (6-10 PM)`,
        reason: `${neighborhood.name} has high user density relative to infrastructure capacity`,
      });
    }

    // Fiber penetration affects provider options
    if (neighborhood.fiberPenetration < 70) {
      tips.push({
        priority: 'medium',
        tip: `${neighborhood.fiberPenetration}% fiber availability in ${neighborhood.name} — verify fiber is available at your exact address before signing up`,
        reason: 'Fiber coverage varies block by block in this neighborhood',
      });
    }

    // Speed variance from metro average
    const speedDiff = neighborhood.medianDown - metroData.medianDown;
    if (Math.abs(speedDiff) > 30) {
      tips.push({
        priority: 'low',
        tip: speedDiff > 0
          ? `${neighborhood.name} performs ${speedDiff} Mbps above metro average — premium infrastructure area`
          : `${neighborhood.name} is ${Math.abs(speedDiff)} Mbps below metro average — may be on older node`,
        reason: 'Neighborhood-level performance can vary significantly from metro-wide statistics',
      });
    }
  }

  // ═══ CONNECTION-TYPE SPECIFIC TIPS ═══
  if (profile.connectionType === 'fiber') {
    const displaySpeed = neighborhood?.medianDown ?? metroData.medianDown;
    const displayLatency = neighborhood?.medianLatency ?? metroData.medianLatency;

    tips.push({
      priority: 'high',
      tip: `${profile.providerName} fiber delivers ${displaySpeed} Mbps median in ${neighborhood?.name ?? METROS[metroId]?.name ?? metroId} — your speed is limited by Wi-Fi, not the fiber connection`,
      reason: 'Fiber speeds far exceed Wi-Fi capabilities, so router placement matters more than line quality',
    });

    if (metroData.has8Gig) {
      tips.push({
        priority: 'medium',
        tip: `8 Gbps tier available — requires WiFi 7 router and wired connections to utilize full speed`,
        reason: 'Multi-gig speeds require latest hardware to realize benefits',
      });
    }

    if (displayLatency <= 5) {
      tips.push({
        priority: 'low',
        tip: `Ultra-low latency (${displayLatency}ms) — excellent for competitive gaming and video conferencing`,
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

    if (metroData.peakHourDegradation > 12 || (neighborhood?.congestionRisk === 'high')) {
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

  // ═══ UNIVERSAL TIPS ═══
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
    neighborhoodId,
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
