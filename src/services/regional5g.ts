import type { StateData, BandPlacementTips, USRegion, BandType, RegionalCarrierData, CityData } from '../types';

// ── Band-specific placement guidance ──
// Based on 5G frequency characteristics and indoor penetration research

export const BAND_PLACEMENT_TIPS: BandPlacementTips[] = [
  {
    bandType: 'low_band',
    label: 'Low-Band 5G (Extended Range)',
    range: '600 MHz – 2.4 GHz',
    penetration: 'Excellent — penetrates walls, buildings, and obstacles easily',
    speedRange: '50–150 Mbps',
    placementTips: [
      'Low-band has excellent wall penetration — you have flexibility in gateway placement',
      'A central home location often works better than window placement for whole-home coverage',
      'Elevation still helps; place on a shelf 4-5 feet high rather than on the floor',
      'Low-band is less sensitive to obstructions — kitchen or living room placement is fine',
      'If signal is strong throughout, prioritize Wi-Fi distribution over cell signal',
      'Rural areas typically use low-band; expect 50-150 Mbps but very stable connections',
    ],
  },
  {
    bandType: 'mid_band',
    label: 'Mid-Band 5G (C-Band / Ultra Capacity)',
    range: '2.5 GHz – 4.2 GHz',
    penetration: 'Good — moderate wall penetration, balances speed and range',
    speedRange: '150–500 Mbps',
    placementTips: [
      'Window placement recommended but not critical — mid-band penetrates exterior walls reasonably well',
      'Avoid interior rooms without windows; signal drops significantly through multiple walls',
      'Upper floors preferred; mid-band benefits from height to clear neighborhood obstructions',
      'Keep gateway away from Low-E glass windows — they can block 30-50% of mid-band signal',
      'Brick and concrete walls reduce signal by 10-15 dB; place closer to exterior walls if possible',
      'SINR (signal quality) matters more than signal bars — use carrier app to check SINR > 10',
      'Mid-band delivers the best speed/coverage balance; expect 150-500 Mbps in good conditions',
    ],
  },
  {
    bandType: 'mmwave',
    label: 'mmWave 5G (Ultra Wideband)',
    range: '24 GHz – 100 GHz',
    penetration: 'Poor — cannot penetrate walls; requires line-of-sight',
    speedRange: '500–4,000 Mbps',
    placementTips: [
      'CRITICAL: Gateway MUST be at a window with direct line-of-sight to the mmWave node',
      'mmWave cannot penetrate walls, glass with metallic coating, or even heavy rain',
      'Place gateway directly on window sill facing the carrier\'s small cell (on utility poles/buildings)',
      'Do NOT place behind curtains, blinds, or tinted windows — any obstruction kills signal',
      'If you can\'t see the cell node from your window, mmWave won\'t work — try C-band/low-band instead',
      'Consider outdoor antenna mounting for best mmWave performance (biggest upgrade possible)',
      'mmWave is only available in dense urban areas within a few blocks of nodes',
      'When connected, expect 500-4,000 Mbps; if speeds are low, you\'re likely falling back to mid/low-band',
    ],
  },
];

// ── US State Data (Based on Ookla, OpenSignal, J.D. Power 2025-2026 reports) ──

const STATE_DATA: StateData[] = [
  // ── Northeast Region ──
  {
    code: 'NY',
    name: 'New York',
    region: 'northeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 245, avgUpload: 28, avgLatency: 24, coverage5gPercent: 89, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 198, avgUpload: 35, avgLatency: 28, coverage5gPercent: 82, dominantBand: 'mmwave', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 165, avgUpload: 22, avgLatency: 32, coverage5gPercent: 78, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'New York City', avgDownload: 312, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Buffalo', avgDownload: 185, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Albany', avgDownload: 156, bestCarrier: 'tmobile', has5GUltra: false },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'NYC has excellent mmWave coverage. Upstate mountainous regions may have weaker signal; low-band dominant in rural areas.',
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    region: 'northeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 238, avgUpload: 26, avgLatency: 22, coverage5gPercent: 91, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 195, avgUpload: 32, avgLatency: 26, coverage5gPercent: 85, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 158, avgUpload: 20, avgLatency: 30, coverage5gPercent: 80, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Boston', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Worcester', avgDownload: 168, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Cambridge', avgDownload: 275, bestCarrier: 'verizon', has5GUltra: true },
    ],
    ruralCoverage: 'good',
    terrainNotes: 'Dense urban areas have strong mid-band coverage. Cape Cod and western MA have reduced coverage.',
  },
  {
    code: 'PA',
    name: 'Pennsylvania',
    region: 'northeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 215, avgUpload: 24, avgLatency: 26, coverage5gPercent: 84, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 178, avgUpload: 28, avgLatency: 30, coverage5gPercent: 79, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 152, avgUpload: 18, avgLatency: 34, coverage5gPercent: 75, dominantBand: 'low_band', rank: 3 },
    ],
    topCities: [
      { name: 'Philadelphia', avgDownload: 268, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Pittsburgh', avgDownload: 195, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Harrisburg', avgDownload: 142, bestCarrier: 'tmobile', has5GUltra: false },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Appalachian terrain affects rural coverage. Major cities have strong mid-band; rural areas rely on low-band.',
  },

  // ── Southeast Region ──
  {
    code: 'FL',
    name: 'Florida',
    region: 'southeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 232, avgUpload: 27, avgLatency: 25, coverage5gPercent: 88, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 175, avgUpload: 22, avgLatency: 32, coverage5gPercent: 82, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 168, avgUpload: 30, avgLatency: 29, coverage5gPercent: 76, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Miami', avgDownload: 295, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Orlando', avgDownload: 242, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Tampa', avgDownload: 228, bestCarrier: 'att', has5GUltra: true },
      { name: 'Jacksonville', avgDownload: 198, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'good',
    terrainNotes: 'Flat terrain aids coverage. Coastal areas and tourist zones have excellent mid-band. Everglades region has limited coverage.',
  },
  {
    code: 'GA',
    name: 'Georgia',
    region: 'southeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 225, avgUpload: 25, avgLatency: 26, coverage5gPercent: 85, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 182, avgUpload: 24, avgLatency: 30, coverage5gPercent: 83, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 165, avgUpload: 28, avgLatency: 28, coverage5gPercent: 74, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Atlanta', avgDownload: 288, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Savannah', avgDownload: 175, bestCarrier: 'att', has5GUltra: true },
      { name: 'Augusta', avgDownload: 148, bestCarrier: 'tmobile', has5GUltra: false },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Atlanta metro has dense coverage. North Georgia mountains have reduced signal; rural south relies on low-band.',
  },
  {
    code: 'NC',
    name: 'North Carolina',
    region: 'southeast',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 218, avgUpload: 24, avgLatency: 27, coverage5gPercent: 82, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 172, avgUpload: 21, avgLatency: 31, coverage5gPercent: 80, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 158, avgUpload: 26, avgLatency: 29, coverage5gPercent: 72, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Charlotte', avgDownload: 265, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Raleigh', avgDownload: 248, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Durham', avgDownload: 235, bestCarrier: 'att', has5GUltra: true },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Research Triangle has excellent coverage. Blue Ridge Mountains affect western NC signal.',
  },

  // ── Midwest Region ──
  {
    code: 'IL',
    name: 'Illinois',
    region: 'midwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 255, avgUpload: 30, avgLatency: 22, coverage5gPercent: 90, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 195, avgUpload: 32, avgLatency: 27, coverage5gPercent: 81, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 162, avgUpload: 20, avgLatency: 33, coverage5gPercent: 77, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Chicago', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Aurora', avgDownload: 215, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Springfield', avgDownload: 142, bestCarrier: 'verizon', has5GUltra: false },
    ],
    ruralCoverage: 'good',
    terrainNotes: 'Chicago metro has top-tier coverage. Flat terrain helps rural coverage but density is lower outside metro areas.',
  },
  {
    code: 'OH',
    name: 'Ohio',
    region: 'midwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 228, avgUpload: 26, avgLatency: 24, coverage5gPercent: 86, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 185, avgUpload: 30, avgLatency: 28, coverage5gPercent: 80, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 155, avgUpload: 19, avgLatency: 32, coverage5gPercent: 76, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Columbus', avgDownload: 275, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Cleveland', avgDownload: 248, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Cincinnati', avgDownload: 235, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'good',
    terrainNotes: 'Major metros have strong coverage. Appalachian foothills in SE Ohio have reduced signal.',
  },
  {
    code: 'MI',
    name: 'Michigan',
    region: 'midwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 212, avgUpload: 24, avgLatency: 26, coverage5gPercent: 82, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 178, avgUpload: 28, avgLatency: 29, coverage5gPercent: 78, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 148, avgUpload: 18, avgLatency: 34, coverage5gPercent: 72, dominantBand: 'low_band', rank: 3 },
    ],
    topCities: [
      { name: 'Detroit', avgDownload: 262, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Grand Rapids', avgDownload: 195, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Ann Arbor', avgDownload: 225, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Upper Peninsula has limited coverage. Detroit metro has excellent mid-band; rural areas rely on low-band.',
  },

  // ── Southwest Region ──
  {
    code: 'TX',
    name: 'Texas',
    region: 'southwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 248, avgUpload: 29, avgLatency: 23, coverage5gPercent: 87, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 195, avgUpload: 25, avgLatency: 28, coverage5gPercent: 85, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 175, avgUpload: 30, avgLatency: 30, coverage5gPercent: 75, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'San Antonio', avgDownload: 310, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Austin', avgDownload: 298, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Houston', avgDownload: 285, bestCarrier: 'att', has5GUltra: true },
      { name: 'Dallas', avgDownload: 278, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Major metros have excellent coverage. West Texas has significant gaps due to sparse population. AT&T strong in South Texas.',
  },
  {
    code: 'AZ',
    name: 'Arizona',
    region: 'southwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 235, avgUpload: 27, avgLatency: 24, coverage5gPercent: 85, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 188, avgUpload: 30, avgLatency: 28, coverage5gPercent: 78, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 165, avgUpload: 22, avgLatency: 32, coverage5gPercent: 76, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Phoenix', avgDownload: 295, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Tucson', avgDownload: 218, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Scottsdale', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'poor',
    terrainNotes: 'Phoenix metro has excellent coverage. Desert and mountainous regions have limited to no coverage.',
  },
  {
    code: 'CO',
    name: 'Colorado',
    region: 'southwest',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 242, avgUpload: 28, avgLatency: 23, coverage5gPercent: 84, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 195, avgUpload: 32, avgLatency: 27, coverage5gPercent: 79, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 168, avgUpload: 21, avgLatency: 31, coverage5gPercent: 75, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Denver', avgDownload: 305, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Colorado Springs', avgDownload: 225, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Boulder', avgDownload: 255, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'poor',
    terrainNotes: 'Front Range cities have excellent coverage. Rocky Mountain terrain severely limits rural/mountain coverage.',
  },

  // ── West Region ──
  {
    code: 'CA',
    name: 'California',
    region: 'west',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 258, avgUpload: 30, avgLatency: 22, coverage5gPercent: 91, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 215, avgUpload: 35, avgLatency: 26, coverage5gPercent: 83, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 178, avgUpload: 24, avgLatency: 30, coverage5gPercent: 80, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Los Angeles', avgDownload: 315, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'San Francisco', avgDownload: 298, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'San Diego', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'San Jose', avgDownload: 305, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'Major metros have top-tier mmWave/mid-band coverage. Central Valley has good low-band. Mountain/desert regions have gaps.',
  },
  {
    code: 'WA',
    name: 'Washington',
    region: 'west',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 268, avgUpload: 32, avgLatency: 21, coverage5gPercent: 92, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 205, avgUpload: 33, avgLatency: 25, coverage5gPercent: 80, dominantBand: 'mid_band', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 172, avgUpload: 22, avgLatency: 29, coverage5gPercent: 76, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Seattle', avgDownload: 335, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Bellevue', avgDownload: 318, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Tacoma', avgDownload: 245, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'fair',
    terrainNotes: 'T-Mobile HQ state — excellent coverage in Puget Sound region. Cascade Mountains limit eastern WA coverage.',
  },
  {
    code: 'NV',
    name: 'Nevada',
    region: 'west',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 242, avgUpload: 28, avgLatency: 24, coverage5gPercent: 82, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 198, avgUpload: 32, avgLatency: 27, coverage5gPercent: 76, dominantBand: 'mmwave', rank: 2 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 168, avgUpload: 21, avgLatency: 31, coverage5gPercent: 72, dominantBand: 'mid_band', rank: 3 },
    ],
    topCities: [
      { name: 'Las Vegas', avgDownload: 325, bestCarrier: 'verizon', has5GUltra: true },
      { name: 'Henderson', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Reno', avgDownload: 195, bestCarrier: 'tmobile', has5GUltra: true },
    ],
    ruralCoverage: 'poor',
    terrainNotes: 'Las Vegas has excellent mmWave coverage (casinos/strip). Rural Nevada has minimal coverage.',
  },

  // ── Pacific Region ──
  {
    code: 'HI',
    name: 'Hawaii',
    region: 'pacific',
    bestCarrier: 'tmobile',
    carriers: [
      { carrier: 'tmobile', carrierName: 'T-Mobile', avgDownload: 195, avgUpload: 22, avgLatency: 32, coverage5gPercent: 78, dominantBand: 'mid_band', rank: 1 },
      { carrier: 'att', carrierName: 'AT&T', avgDownload: 165, avgUpload: 18, avgLatency: 38, coverage5gPercent: 72, dominantBand: 'low_band', rank: 2 },
      { carrier: 'verizon', carrierName: 'Verizon', avgDownload: 148, avgUpload: 20, avgLatency: 35, coverage5gPercent: 65, dominantBand: 'low_band', rank: 3 },
    ],
    topCities: [
      { name: 'Honolulu', avgDownload: 245, bestCarrier: 'tmobile', has5GUltra: true },
      { name: 'Pearl City', avgDownload: 185, bestCarrier: 'tmobile', has5GUltra: false },
    ],
    ruralCoverage: 'poor',
    terrainNotes: 'Oahu has best coverage. Neighbor islands have limited 5G; mountainous terrain affects signal.',
  },
];

// ── Public API ──

export function getAllStates(): StateData[] {
  return [...STATE_DATA];
}

export function getStateByCode(code: string): StateData | undefined {
  return STATE_DATA.find(s => s.code.toLowerCase() === code.toLowerCase());
}

export function getStatesByRegion(region: USRegion): StateData[] {
  return STATE_DATA.filter(s => s.region === region);
}

export function getBandPlacementTips(bandType: BandType): BandPlacementTips | undefined {
  return BAND_PLACEMENT_TIPS.find(b => b.bandType === bandType);
}

export function getAllBandTips(): BandPlacementTips[] {
  return [...BAND_PLACEMENT_TIPS];
}

export function getBestCarrierForState(stateCode: string): RegionalCarrierData | undefined {
  const state = getStateByCode(stateCode);
  if (!state) return undefined;
  return state.carriers.find(c => c.rank === 1);
}

export function getCarrierDataForState(stateCode: string, carrier: 'tmobile' | 'verizon' | 'att'): RegionalCarrierData | undefined {
  const state = getStateByCode(stateCode);
  if (!state) return undefined;
  return state.carriers.find(c => c.carrier === carrier);
}

export function getCitiesForState(stateCode: string): CityData[] {
  const state = getStateByCode(stateCode);
  return state?.topCities ?? [];
}

export function getPlacementRecommendation(
  stateCode: string,
  carrier: 'tmobile' | 'verizon' | 'att'
): { tips: string[]; bandType: BandType; expectedSpeed: string } | undefined {
  const state = getStateByCode(stateCode);
  const carrierData = state?.carriers.find(c => c.carrier === carrier);
  if (!state || !carrierData) return undefined;

  const bandTips = getBandPlacementTips(carrierData.dominantBand);
  if (!bandTips) return undefined;

  // Combine band tips with regional context
  const tips = [
    ...bandTips.placementTips.slice(0, 4), // Top 4 band-specific tips
    `In ${state.name}, ${carrierData.carrierName} uses primarily ${bandTips.label}`,
    state.terrainNotes,
  ];

  return {
    tips,
    bandType: carrierData.dominantBand,
    expectedSpeed: `${carrierData.avgDownload} Mbps avg (${bandTips.speedRange} typical for ${bandTips.label})`,
  };
}

export const US_REGIONS: { value: USRegion; label: string }[] = [
  { value: 'northeast', label: 'Northeast' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'west', label: 'West' },
  { value: 'pacific', label: 'Pacific' },
];

export const CARRIER_DISPLAY_NAMES: Record<'tmobile' | 'verizon' | 'att', string> = {
  tmobile: 'T-Mobile',
  verizon: 'Verizon',
  att: 'AT&T',
};
