import type {
  MetroArea,
  Neighborhood,
  NeighborhoodCarrierData,
  ZipCodeData,
  BandType,
  HyperlocalPlacementTip,
} from '../types';

// ── Hyperlocal 5G Data ──
// Based on Ookla tile data (~610m granularity), CellMapper tower data,
// RootMetrics 125-city reports, and carrier coverage tools (2025-2026)

const METRO_AREAS: MetroArea[] = [
  // ── New York Metro ──
  {
    id: 'nyc',
    name: 'New York City',
    stateCode: 'NY',
    towerDensity: 'ultra_dense',
    avgDownload: 312,
    avgUpload: 45,
    avgLatency: 18,
    neighborhoods: [
      {
        id: 'manhattan-midtown',
        name: 'Midtown Manhattan',
        metroId: 'nyc',
        zipCodes: ['10001', '10016', '10017', '10018', '10019', '10020', '10022', '10036'],
        towerCount: 142,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Dense skyscrapers create signal canyons. Street-facing windows best. mmWave available on major avenues.',
        carriers: [
          { carrier: 'verizon', avgDownload: 485, avgUpload: 68, avgLatency: 12, primaryBand: 'mmwave', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'tmobile', avgDownload: 395, avgUpload: 52, avgLatency: 15, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 285, avgUpload: 38, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'manhattan-downtown',
        name: 'Downtown Manhattan / Financial District',
        metroId: 'nyc',
        zipCodes: ['10004', '10005', '10006', '10007', '10038', '10280'],
        towerCount: 98,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Historic narrow streets limit signal propagation. East-facing windows towards East River often better.',
        carriers: [
          { carrier: 'verizon', avgDownload: 425, avgUpload: 62, avgLatency: 14, primaryBand: 'mmwave', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'east' },
          { carrier: 'tmobile', avgDownload: 365, avgUpload: 48, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 248, avgUpload: 32, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'brooklyn-downtown',
        name: 'Downtown Brooklyn',
        metroId: 'nyc',
        zipCodes: ['11201', '11205', '11217', '11238'],
        towerCount: 64,
        buildingDensity: 'high',
        terrainType: 'mixed_use',
        placementNotes: 'Growing tower density. Best signal on Atlantic Ave and Flatbush corridors.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'north' },
          { carrier: 'verizon', avgDownload: 295, avgUpload: 48, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'northwest' },
          { carrier: 'att', avgDownload: 225, avgUpload: 28, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'north' },
        ],
      },
      {
        id: 'brooklyn-williamsburg',
        name: 'Williamsburg',
        metroId: 'nyc',
        zipCodes: ['11211', '11249'],
        towerCount: 38,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Lower building heights improve mid-band penetration. Waterfront has strong signal.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 318, avgUpload: 38, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'west' },
          { carrier: 'verizon', avgDownload: 265, avgUpload: 42, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'west' },
          { carrier: 'att', avgDownload: 198, avgUpload: 25, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'fair', bestDirection: 'southwest' },
        ],
      },
      {
        id: 'queens-astoria',
        name: 'Astoria',
        metroId: 'nyc',
        zipCodes: ['11102', '11103', '11105', '11106'],
        towerCount: 28,
        buildingDensity: 'medium',
        terrainType: 'residential',
        placementNotes: 'Low-rise residential area. Central room placement often works. Strong T-Mobile presence.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 285, avgUpload: 35, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 225, avgUpload: 38, avgLatency: 25, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'southwest' },
          { carrier: 'att', avgDownload: 175, avgUpload: 22, avgLatency: 30, primaryBand: 'low_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
    ],
    zipCodes: [
      { zip: '10001', neighborhoodId: 'manhattan-midtown', avgDownload: 395, bestCarrier: 'verizon', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 25 },
      { zip: '10016', neighborhoodId: 'manhattan-midtown', avgDownload: 425, bestCarrier: 'verizon', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '10017', neighborhoodId: 'manhattan-midtown', avgDownload: 485, bestCarrier: 'verizon', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 30 },
      { zip: '10007', neighborhoodId: 'manhattan-downtown', avgDownload: 365, bestCarrier: 'verizon', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 28 },
      { zip: '11201', neighborhoodId: 'brooklyn-downtown', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 20 },
      { zip: '11211', neighborhoodId: 'brooklyn-williamsburg', avgDownload: 298, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 22 },
      { zip: '11102', neighborhoodId: 'queens-astoria', avgDownload: 268, bestCarrier: 'tmobile', has5GUltra: false, congestionLevel: 'low', peakHourImpact: 12 },
    ],
  },

  // ── Los Angeles Metro ──
  {
    id: 'la',
    name: 'Los Angeles',
    stateCode: 'CA',
    towerDensity: 'dense',
    avgDownload: 315,
    avgUpload: 42,
    avgLatency: 20,
    neighborhoods: [
      {
        id: 'la-downtown',
        name: 'Downtown LA',
        metroId: 'la',
        zipCodes: ['90012', '90013', '90014', '90015', '90017', '90071'],
        towerCount: 85,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Skyscraper clusters create dead zones. Staples Center area has excellent mmWave. Window placement critical.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 425, avgUpload: 55, avgLatency: 14, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 385, avgUpload: 58, avgLatency: 16, primaryBand: 'mmwave', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'south' },
          { carrier: 'att', avgDownload: 265, avgUpload: 35, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'la-hollywood',
        name: 'Hollywood',
        metroId: 'la',
        zipCodes: ['90028', '90038', '90068'],
        towerCount: 52,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Hills affect northern signal. Hollywood Blvd corridor has dense coverage. South-facing windows recommended.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 365, avgUpload: 45, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 298, avgUpload: 48, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
          { carrier: 'att', avgDownload: 235, avgUpload: 32, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'southeast' },
        ],
      },
      {
        id: 'la-santa-monica',
        name: 'Santa Monica',
        metroId: 'la',
        zipCodes: ['90401', '90402', '90403', '90404', '90405'],
        towerCount: 35,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Ocean-facing units may have weaker signal (no towers offshore). East-facing windows better.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 342, avgUpload: 42, avgLatency: 19, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'east' },
          { carrier: 'verizon', avgDownload: 285, avgUpload: 45, avgLatency: 23, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'east' },
          { carrier: 'att', avgDownload: 218, avgUpload: 28, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'northeast' },
        ],
      },
      {
        id: 'la-beverly-hills',
        name: 'Beverly Hills',
        metroId: 'la',
        zipCodes: ['90210', '90211', '90212'],
        towerCount: 28,
        buildingDensity: 'low',
        terrainType: 'residential',
        placementNotes: 'Hilly terrain and tree cover affect signal. Lower tower density but less congestion. Placement flexibility.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 298, avgUpload: 38, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 265, avgUpload: 42, avgLatency: 25, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
          { carrier: 'att', avgDownload: 228, avgUpload: 30, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'far', signalQuality: 'fair', bestDirection: 'southeast' },
        ],
      },
      {
        id: 'la-pasadena',
        name: 'Pasadena',
        metroId: 'la',
        zipCodes: ['91101', '91103', '91104', '91105', '91106', '91107'],
        towerCount: 42,
        buildingDensity: 'medium',
        terrainType: 'suburban',
        placementNotes: 'Good coverage along Colorado Blvd. San Gabriel Mountains to north may affect signal in foothills.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 325, avgUpload: 40, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 275, avgUpload: 35, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 255, avgUpload: 42, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'southwest' },
        ],
      },
    ],
    zipCodes: [
      { zip: '90012', neighborhoodId: 'la-downtown', avgDownload: 398, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 22 },
      { zip: '90028', neighborhoodId: 'la-hollywood', avgDownload: 345, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '90401', neighborhoodId: 'la-santa-monica', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 20 },
      { zip: '90210', neighborhoodId: 'la-beverly-hills', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: false, congestionLevel: 'low', peakHourImpact: 10 },
      { zip: '91101', neighborhoodId: 'la-pasadena', avgDownload: 312, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'low', peakHourImpact: 15 },
    ],
  },

  // ── Chicago Metro ──
  {
    id: 'chicago',
    name: 'Chicago',
    stateCode: 'IL',
    towerDensity: 'dense',
    avgDownload: 325,
    avgUpload: 48,
    avgLatency: 18,
    neighborhoods: [
      {
        id: 'chi-loop',
        name: 'The Loop',
        metroId: 'chicago',
        zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607'],
        towerCount: 95,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Dense high-rises create signal canyons. Lake-facing windows (east) have strong signal. T-Mobile HQ city.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 465, avgUpload: 62, avgLatency: 12, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 385, avgUpload: 55, avgLatency: 16, primaryBand: 'mmwave', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'east' },
          { carrier: 'att', avgDownload: 285, avgUpload: 38, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'chi-lincoln-park',
        name: 'Lincoln Park',
        metroId: 'chicago',
        zipCodes: ['60614', '60657'],
        towerCount: 45,
        buildingDensity: 'medium',
        terrainType: 'residential',
        placementNotes: 'Mix of high-rises and brownstones. Lake proximity helps eastern signal. Tree-lined streets may affect ground floors.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 365, avgUpload: 48, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'east' },
          { carrier: 'verizon', avgDownload: 295, avgUpload: 45, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'southeast' },
          { carrier: 'att', avgDownload: 235, avgUpload: 32, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'chi-wicker-park',
        name: 'Wicker Park / Bucktown',
        metroId: 'chicago',
        zipCodes: ['60622', '60647'],
        towerCount: 32,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Lower building heights improve coverage. Milwaukee Ave corridor has good signal. East-facing preferred.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 275, avgUpload: 42, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'east' },
          { carrier: 'att', avgDownload: 218, avgUpload: 28, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'fair', bestDirection: 'southeast' },
        ],
      },
      {
        id: 'chi-oak-park',
        name: 'Oak Park',
        metroId: 'chicago',
        zipCodes: ['60301', '60302', '60304'],
        towerCount: 22,
        buildingDensity: 'low',
        terrainType: 'suburban',
        placementNotes: 'Residential suburb with good T-Mobile/AT&T presence. Central placement often sufficient.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 295, avgUpload: 35, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 258, avgUpload: 32, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'east' },
          { carrier: 'verizon', avgDownload: 235, avgUpload: 38, avgLatency: 28, primaryBand: 'low_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
    ],
    zipCodes: [
      { zip: '60601', neighborhoodId: 'chi-loop', avgDownload: 445, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 25 },
      { zip: '60614', neighborhoodId: 'chi-lincoln-park', avgDownload: 345, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '60622', neighborhoodId: 'chi-wicker-park', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 20 },
      { zip: '60301', neighborhoodId: 'chi-oak-park', avgDownload: 278, bestCarrier: 'tmobile', has5GUltra: false, congestionLevel: 'low', peakHourImpact: 12 },
    ],
  },

  // ── Dallas-Fort Worth Metro ──
  {
    id: 'dfw',
    name: 'Dallas-Fort Worth',
    stateCode: 'TX',
    towerDensity: 'dense',
    avgDownload: 298,
    avgUpload: 40,
    avgLatency: 22,
    neighborhoods: [
      {
        id: 'dallas-downtown',
        name: 'Downtown Dallas',
        metroId: 'dfw',
        zipCodes: ['75201', '75202', '75204', '75226'],
        towerCount: 68,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Strong AT&T presence (HQ). High-rise corridors on Commerce St. Window placement important.',
        carriers: [
          { carrier: 'att', avgDownload: 365, avgUpload: 52, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 45, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'north' },
          { carrier: 'verizon', avgDownload: 285, avgUpload: 42, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'dallas-uptown',
        name: 'Uptown Dallas',
        metroId: 'dfw',
        zipCodes: ['75204', '75219', '75205'],
        towerCount: 42,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Growing density with excellent mid-band coverage. McKinney Ave corridor strong. Any direction works.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 335, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 318, avgUpload: 45, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 265, avgUpload: 40, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'dallas-plano',
        name: 'Plano',
        metroId: 'dfw',
        zipCodes: ['75023', '75024', '75025', '75074', '75075'],
        towerCount: 55,
        buildingDensity: 'medium',
        terrainType: 'suburban',
        placementNotes: 'Tech corridor with excellent coverage. Legacy West area has dense deployment. Flat terrain helps.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 315, avgUpload: 40, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 298, avgUpload: 42, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 258, avgUpload: 38, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'ft-worth-downtown',
        name: 'Downtown Fort Worth',
        metroId: 'dfw',
        zipCodes: ['76102', '76104', '76107'],
        towerCount: 38,
        buildingDensity: 'medium',
        terrainType: 'urban_core',
        placementNotes: 'Smaller downtown with good coverage. Sundance Square area excellent. Less congestion than Dallas.',
        carriers: [
          { carrier: 'att', avgDownload: 305, avgUpload: 42, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'tmobile', avgDownload: 285, avgUpload: 38, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
          { carrier: 'verizon', avgDownload: 248, avgUpload: 38, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'northeast' },
        ],
      },
    ],
    zipCodes: [
      { zip: '75201', neighborhoodId: 'dallas-downtown', avgDownload: 355, bestCarrier: 'att', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 22 },
      { zip: '75219', neighborhoodId: 'dallas-uptown', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '75024', neighborhoodId: 'dallas-plano', avgDownload: 305, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'low', peakHourImpact: 12 },
      { zip: '76102', neighborhoodId: 'ft-worth-downtown', avgDownload: 295, bestCarrier: 'att', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 15 },
    ],
  },

  // ── Seattle Metro ──
  {
    id: 'seattle',
    name: 'Seattle',
    stateCode: 'WA',
    towerDensity: 'dense',
    avgDownload: 335,
    avgUpload: 52,
    avgLatency: 16,
    neighborhoods: [
      {
        id: 'sea-downtown',
        name: 'Downtown Seattle',
        metroId: 'seattle',
        zipCodes: ['98101', '98104', '98121', '98154'],
        towerCount: 78,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'T-Mobile HQ city with exceptional coverage. Hills can create shadow zones. Waterfront has strong signal.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 485, avgUpload: 68, avgLatency: 10, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 345, avgUpload: 52, avgLatency: 18, primaryBand: 'mmwave', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'west' },
          { carrier: 'att', avgDownload: 265, avgUpload: 35, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'sea-capitol-hill',
        name: 'Capitol Hill',
        metroId: 'seattle',
        zipCodes: ['98102', '98112', '98122'],
        towerCount: 42,
        buildingDensity: 'medium',
        terrainType: 'residential',
        placementNotes: 'Hilly terrain affects coverage. Broadway corridor excellent. West-facing windows better for downtown signal.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 395, avgUpload: 52, avgLatency: 14, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'west' },
          { carrier: 'verizon', avgDownload: 285, avgUpload: 45, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'west' },
          { carrier: 'att', avgDownload: 228, avgUpload: 30, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'fair', bestDirection: 'southwest' },
        ],
      },
      {
        id: 'sea-bellevue',
        name: 'Bellevue',
        metroId: 'seattle',
        zipCodes: ['98004', '98005', '98006', '98007', '98008'],
        towerCount: 62,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Tech hub with excellent coverage. Downtown Bellevue has mmWave. Residential areas have strong mid-band.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 425, avgUpload: 58, avgLatency: 12, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 365, avgUpload: 55, avgLatency: 16, primaryBand: 'mmwave', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 275, avgUpload: 38, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'west' },
        ],
      },
      {
        id: 'sea-redmond',
        name: 'Redmond',
        metroId: 'seattle',
        zipCodes: ['98052', '98053'],
        towerCount: 38,
        buildingDensity: 'medium',
        terrainType: 'suburban',
        placementNotes: 'Microsoft campus area has dense coverage. Residential areas well-covered. Flat terrain helps.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 385, avgUpload: 48, avgLatency: 14, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 315, avgUpload: 48, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 255, avgUpload: 35, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'southwest' },
        ],
      },
    ],
    zipCodes: [
      { zip: '98101', neighborhoodId: 'sea-downtown', avgDownload: 465, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 20 },
      { zip: '98122', neighborhoodId: 'sea-capitol-hill', avgDownload: 375, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 15 },
      { zip: '98004', neighborhoodId: 'sea-bellevue', avgDownload: 405, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '98052', neighborhoodId: 'sea-redmond', avgDownload: 365, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'low', peakHourImpact: 10 },
    ],
  },

  // ── Miami Metro ──
  {
    id: 'miami',
    name: 'Miami',
    stateCode: 'FL',
    towerDensity: 'dense',
    avgDownload: 295,
    avgUpload: 38,
    avgLatency: 24,
    neighborhoods: [
      {
        id: 'mia-downtown',
        name: 'Downtown Miami / Brickell',
        metroId: 'miami',
        zipCodes: ['33128', '33130', '33131', '33132'],
        towerCount: 72,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'High-rise condo towers. Bay-facing windows (east) best. Hurricane-rated glass may affect signal.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 385, avgUpload: 48, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'west' },
          { carrier: 'verizon', avgDownload: 325, avgUpload: 52, avgLatency: 20, primaryBand: 'mmwave', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 265, avgUpload: 35, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'west' },
        ],
      },
      {
        id: 'mia-south-beach',
        name: 'South Beach',
        metroId: 'miami',
        zipCodes: ['33139', '33140'],
        towerCount: 45,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Tourism area with dense deployment. Ocean-facing has no towers. West-facing (towards mainland) better.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'west' },
          { carrier: 'verizon', avgDownload: 298, avgUpload: 48, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'west' },
          { carrier: 'att', avgDownload: 235, avgUpload: 32, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'northwest' },
        ],
      },
      {
        id: 'mia-coral-gables',
        name: 'Coral Gables',
        metroId: 'miami',
        zipCodes: ['33134', '33146'],
        towerCount: 28,
        buildingDensity: 'medium',
        terrainType: 'residential',
        placementNotes: 'Tree-lined streets with Mediterranean architecture. Good coverage but tree canopy affects ground floors.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 305, avgUpload: 38, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 275, avgUpload: 35, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'north' },
          { carrier: 'verizon', avgDownload: 248, avgUpload: 40, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'north' },
        ],
      },
    ],
    zipCodes: [
      { zip: '33131', neighborhoodId: 'mia-downtown', avgDownload: 365, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 22 },
      { zip: '33139', neighborhoodId: 'mia-south-beach', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 30 },
      { zip: '33134', neighborhoodId: 'mia-coral-gables', avgDownload: 285, bestCarrier: 'tmobile', has5GUltra: false, congestionLevel: 'low', peakHourImpact: 12 },
    ],
  },

  // ── Phoenix Metro ──
  {
    id: 'phoenix',
    name: 'Phoenix',
    stateCode: 'AZ',
    towerDensity: 'moderate',
    avgDownload: 295,
    avgUpload: 38,
    avgLatency: 22,
    neighborhoods: [
      {
        id: 'phx-downtown',
        name: 'Downtown Phoenix',
        metroId: 'phoenix',
        zipCodes: ['85003', '85004', '85007'],
        towerCount: 52,
        buildingDensity: 'medium',
        terrainType: 'urban_core',
        placementNotes: 'Grid layout with good signal propagation. High temperatures may require keeping gateway cool.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 365, avgUpload: 45, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 305, avgUpload: 48, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 258, avgUpload: 35, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'phx-scottsdale',
        name: 'Scottsdale',
        metroId: 'phoenix',
        zipCodes: ['85251', '85254', '85255', '85258', '85260'],
        towerCount: 65,
        buildingDensity: 'low',
        terrainType: 'suburban',
        placementNotes: 'Affluent area with excellent deployment. McDowell Mountain area may have reduced signal. Flat terrain helps.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 298, avgUpload: 45, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 268, avgUpload: 38, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'phx-tempe',
        name: 'Tempe',
        metroId: 'phoenix',
        zipCodes: ['85281', '85282', '85283', '85284'],
        towerCount: 48,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'ASU campus area has dense deployment. Mill Ave district excellent. Student population causes congestion.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 325, avgUpload: 40, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 275, avgUpload: 42, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'north' },
          { carrier: 'att', avgDownload: 245, avgUpload: 35, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'north' },
        ],
      },
    ],
    zipCodes: [
      { zip: '85004', neighborhoodId: 'phx-downtown', avgDownload: 345, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '85251', neighborhoodId: 'phx-scottsdale', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'low', peakHourImpact: 10 },
      { zip: '85281', neighborhoodId: 'phx-tempe', avgDownload: 305, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 28 },
    ],
  },

  // ── Denver Metro ──
  {
    id: 'denver',
    name: 'Denver',
    stateCode: 'CO',
    towerDensity: 'moderate',
    avgDownload: 305,
    avgUpload: 42,
    avgLatency: 20,
    neighborhoods: [
      {
        id: 'den-downtown',
        name: 'Downtown Denver / LoDo',
        metroId: 'denver',
        zipCodes: ['80202', '80204', '80205'],
        towerCount: 58,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Mile High altitude affects some equipment. Good tower density. Union Station area excellent.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 385, avgUpload: 50, avgLatency: 14, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 325, avgUpload: 48, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 265, avgUpload: 35, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'den-cherry-creek',
        name: 'Cherry Creek',
        metroId: 'denver',
        zipCodes: ['80206', '80209', '80246'],
        towerCount: 35,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Shopping district with good coverage. Residential areas have slightly lower tower density. Any direction works.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 295, avgUpload: 45, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'north' },
          { carrier: 'att', avgDownload: 248, avgUpload: 32, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'northeast' },
        ],
      },
      {
        id: 'den-boulder',
        name: 'Boulder',
        metroId: 'denver',
        zipCodes: ['80301', '80302', '80303', '80304'],
        towerCount: 42,
        buildingDensity: 'low',
        terrainType: 'suburban',
        placementNotes: 'Flatirons foothills affect western signal. Pearl St corridor excellent. East-facing windows recommended.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 325, avgUpload: 40, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'east' },
          { carrier: 'verizon', avgDownload: 285, avgUpload: 42, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'east' },
          { carrier: 'att', avgDownload: 235, avgUpload: 30, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'fair', bestDirection: 'southeast' },
        ],
      },
    ],
    zipCodes: [
      { zip: '80202', neighborhoodId: 'den-downtown', avgDownload: 365, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '80206', neighborhoodId: 'den-cherry-creek', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'low', peakHourImpact: 12 },
      { zip: '80302', neighborhoodId: 'den-boulder', avgDownload: 305, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 20 },
    ],
  },

  // ── Atlanta Metro ──
  {
    id: 'atlanta',
    name: 'Atlanta',
    stateCode: 'GA',
    towerDensity: 'dense',
    avgDownload: 288,
    avgUpload: 38,
    avgLatency: 24,
    neighborhoods: [
      {
        id: 'atl-downtown',
        name: 'Downtown Atlanta',
        metroId: 'atlanta',
        zipCodes: ['30303', '30308', '30309', '30313'],
        towerCount: 62,
        buildingDensity: 'high',
        terrainType: 'urban_core',
        placementNotes: 'Peachtree corridor has excellent coverage. Centennial Park area dense with towers. Window placement critical.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 365, avgUpload: 45, avgLatency: 16, primaryBand: 'mid_band', towerProximity: 'very_close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 325, avgUpload: 48, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 275, avgUpload: 42, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'east' },
        ],
      },
      {
        id: 'atl-midtown',
        name: 'Midtown Atlanta',
        metroId: 'atlanta',
        zipCodes: ['30308', '30309', '30324'],
        towerCount: 48,
        buildingDensity: 'high',
        terrainType: 'mixed_use',
        placementNotes: 'Growing skyline with new towers. Piedmont Park area has good coverage. Any direction typically works.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 345, avgUpload: 42, avgLatency: 18, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 305, avgUpload: 45, avgLatency: 22, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'verizon', avgDownload: 265, avgUpload: 40, avgLatency: 26, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'south' },
        ],
      },
      {
        id: 'atl-buckhead',
        name: 'Buckhead',
        metroId: 'atlanta',
        zipCodes: ['30305', '30326', '30327'],
        towerCount: 42,
        buildingDensity: 'medium',
        terrainType: 'mixed_use',
        placementNotes: 'Affluent area with excellent deployment. Lenox Square area dense. Rolling hills may affect some spots.',
        carriers: [
          { carrier: 'tmobile', avgDownload: 335, avgUpload: 40, avgLatency: 20, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'excellent', bestDirection: 'any' },
          { carrier: 'att', avgDownload: 295, avgUpload: 42, avgLatency: 24, primaryBand: 'mid_band', towerProximity: 'close', signalQuality: 'good', bestDirection: 'south' },
          { carrier: 'verizon', avgDownload: 258, avgUpload: 38, avgLatency: 28, primaryBand: 'mid_band', towerProximity: 'moderate', signalQuality: 'good', bestDirection: 'southwest' },
        ],
      },
    ],
    zipCodes: [
      { zip: '30303', neighborhoodId: 'atl-downtown', avgDownload: 345, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'high', peakHourImpact: 22 },
      { zip: '30309', neighborhoodId: 'atl-midtown', avgDownload: 325, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 18 },
      { zip: '30326', neighborhoodId: 'atl-buckhead', avgDownload: 315, bestCarrier: 'tmobile', has5GUltra: true, congestionLevel: 'medium', peakHourImpact: 15 },
    ],
  },
];

// ── Direction-based Placement Tips ──

const DIRECTION_PLACEMENT_TIPS: Record<NeighborhoodCarrierData['bestDirection'], string[]> = {
  north: [
    'Position your gateway on the north-facing side of your home',
    'North-facing windows will provide the best signal for your carrier',
    'If possible, place the gateway elevated on a north-facing wall',
  ],
  south: [
    'Position your gateway on the south-facing side of your home',
    'South-facing windows will provide the best signal for your carrier',
    'Cell towers for your carrier are primarily located to your south',
  ],
  east: [
    'Position your gateway on the east-facing side of your home',
    'East-facing windows will provide the best signal for your carrier',
    'Morning sun exposure is fine — the gateway handles normal temperatures',
  ],
  west: [
    'Position your gateway on the west-facing side of your home',
    'West-facing windows will provide the best signal for your carrier',
    'Consider afternoon heat from sun exposure — keep the gateway ventilated',
  ],
  northeast: [
    'Northeast-facing windows or walls will provide the best signal',
    'Position gateway in the corner of your home facing northeast',
    'This direction offers optimal line-of-sight to your carrier\'s towers',
  ],
  northwest: [
    'Northwest-facing windows or walls will provide the best signal',
    'Position gateway in the corner of your home facing northwest',
    'This direction offers optimal line-of-sight to your carrier\'s towers',
  ],
  southeast: [
    'Southeast-facing windows or walls will provide the best signal',
    'Position gateway in the corner of your home facing southeast',
    'This direction offers optimal line-of-sight to your carrier\'s towers',
  ],
  southwest: [
    'Southwest-facing windows or walls will provide the best signal',
    'Position gateway in the corner of your home facing southwest',
    'Be mindful of afternoon sun heat — ensure gateway is ventilated',
  ],
  any: [
    'Your neighborhood has excellent tower coverage from all directions',
    'You have flexibility in gateway placement — choose based on Wi-Fi needs',
    'Central placement is recommended for whole-home coverage',
  ],
};

// ── Public API ──

export function getAllMetros(): MetroArea[] {
  return [...METRO_AREAS];
}

export function getMetroById(id: string): MetroArea | undefined {
  return METRO_AREAS.find(m => m.id === id);
}

export function getMetrosByState(stateCode: string): MetroArea[] {
  return METRO_AREAS.filter(m => m.stateCode.toLowerCase() === stateCode.toLowerCase());
}

export function getNeighborhoodById(id: string): Neighborhood | undefined {
  for (const metro of METRO_AREAS) {
    const neighborhood = metro.neighborhoods.find(n => n.id === id);
    if (neighborhood) return neighborhood;
  }
  return undefined;
}

export function getNeighborhoodsByMetro(metroId: string): Neighborhood[] {
  const metro = getMetroById(metroId);
  return metro?.neighborhoods ?? [];
}

export function getZipCodeData(zip: string): ZipCodeData | undefined {
  for (const metro of METRO_AREAS) {
    const zipData = metro.zipCodes.find(z => z.zip === zip);
    if (zipData) return zipData;
  }
  return undefined;
}

export function getNeighborhoodByZip(zip: string): Neighborhood | undefined {
  const zipData = getZipCodeData(zip);
  if (!zipData) return undefined;
  return getNeighborhoodById(zipData.neighborhoodId);
}

export function getCarrierDataForNeighborhood(
  neighborhoodId: string,
  carrier: 'tmobile' | 'verizon' | 'att'
): NeighborhoodCarrierData | undefined {
  const neighborhood = getNeighborhoodById(neighborhoodId);
  if (!neighborhood) return undefined;
  return neighborhood.carriers.find(c => c.carrier === carrier);
}

export function getBestCarrierForNeighborhood(neighborhoodId: string): NeighborhoodCarrierData | undefined {
  const neighborhood = getNeighborhoodById(neighborhoodId);
  if (!neighborhood || neighborhood.carriers.length === 0) return undefined;
  return [...neighborhood.carriers].sort((a, b) => b.avgDownload - a.avgDownload)[0];
}

export function getDirectionTips(direction: NeighborhoodCarrierData['bestDirection']): string[] {
  return DIRECTION_PLACEMENT_TIPS[direction] ?? DIRECTION_PLACEMENT_TIPS.any;
}

export function getHyperlocalPlacementTips(
  neighborhoodId: string,
  carrier: 'tmobile' | 'verizon' | 'att'
): HyperlocalPlacementTip[] {
  const neighborhood = getNeighborhoodById(neighborhoodId);
  const carrierData = getCarrierDataForNeighborhood(neighborhoodId, carrier);

  if (!neighborhood || !carrierData) return [];

  const tips: HyperlocalPlacementTip[] = [];

  // Direction-based tip
  const directionTips = getDirectionTips(carrierData.bestDirection);
  if (directionTips.length > 0) {
    tips.push({
      priority: 'critical',
      tip: directionTips[0],
      reason: `Based on tower locations in ${neighborhood.name}`,
    });
  }

  // Band-specific tips
  if (carrierData.primaryBand === 'mmwave') {
    tips.push({
      priority: 'critical',
      tip: 'mmWave requires direct line-of-sight to the cell tower',
      reason: 'mmWave cannot penetrate walls — window placement is mandatory',
    });
    tips.push({
      priority: 'high',
      tip: 'Place gateway directly on window sill, not behind curtains or blinds',
      reason: 'Any obstruction significantly degrades mmWave signal',
    });
  } else if (carrierData.primaryBand === 'mid_band') {
    tips.push({
      priority: 'high',
      tip: 'Window placement recommended but not critical for mid-band',
      reason: 'C-band penetrates walls moderately — within 10 feet of window is usually fine',
    });
  } else {
    tips.push({
      priority: 'medium',
      tip: 'Low-band offers placement flexibility',
      reason: 'Low-band penetrates walls well — central placement often works',
    });
  }

  // Building density tip
  if (neighborhood.buildingDensity === 'high') {
    tips.push({
      priority: 'high',
      tip: 'High-rise area: upper floors have better signal',
      reason: 'Dense buildings create signal shadows on lower floors',
    });
  }

  // Tower proximity tip
  if (carrierData.towerProximity === 'very_close') {
    tips.push({
      priority: 'medium',
      tip: 'Excellent tower coverage in your area — multiple placement options will work',
      reason: `${carrierData.carrier === 'tmobile' ? 'T-Mobile' : carrierData.carrier === 'verizon' ? 'Verizon' : 'AT&T'} has dense tower deployment here`,
    });
  } else if (carrierData.towerProximity === 'far') {
    tips.push({
      priority: 'high',
      tip: 'Limited tower coverage — window placement is important',
      reason: 'Maximize signal reception by placing gateway at optimal window',
    });
  }

  // Congestion tip (find zip data for this neighborhood)
  const metro = METRO_AREAS.find(m => m.neighborhoods.some(n => n.id === neighborhoodId));
  const zipData = metro?.zipCodes.find(z => z.neighborhoodId === neighborhoodId);
  if (zipData && zipData.congestionLevel === 'high') {
    tips.push({
      priority: 'medium',
      tip: `Expect ${zipData.peakHourImpact}% slower speeds during peak hours (6-10 PM)`,
      reason: 'High-traffic area — consider scheduling large downloads for off-peak times',
    });
  }

  // Neighborhood-specific note
  tips.push({
    priority: 'low',
    tip: neighborhood.placementNotes,
    reason: `Local insight for ${neighborhood.name}`,
  });

  return tips;
}

export function searchZipCode(query: string): ZipCodeData[] {
  const results: ZipCodeData[] = [];
  for (const metro of METRO_AREAS) {
    for (const zip of metro.zipCodes) {
      if (zip.zip.startsWith(query)) {
        results.push(zip);
      }
    }
  }
  return results;
}

export function searchNeighborhood(query: string): Neighborhood[] {
  const lowerQuery = query.toLowerCase();
  const results: Neighborhood[] = [];
  for (const metro of METRO_AREAS) {
    for (const neighborhood of metro.neighborhoods) {
      if (neighborhood.name.toLowerCase().includes(lowerQuery)) {
        results.push(neighborhood);
      }
    }
  }
  return results;
}

export const CARRIER_DISPLAY: Record<'tmobile' | 'verizon' | 'att', string> = {
  tmobile: 'T-Mobile',
  verizon: 'Verizon',
  att: 'AT&T',
};

export const BAND_LABELS: Record<BandType, string> = {
  low_band: 'Low-Band (Extended Range)',
  mid_band: 'Mid-Band (C-Band)',
  mmwave: 'mmWave (Ultra Wideband)',
};
