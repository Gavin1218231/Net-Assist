export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  aiProvider: AIProvider;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

export type AIProvider = 'claude' | 'openai' | 'gemini';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type WifiBand = '2.4ghz' | '5ghz' | '6ghz';

export interface NetworkStatus {
  isConnected: boolean;
  ssid: string | null;
  band: WifiBand;
  signalStrength: number;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  quality: NetworkQuality;
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none';

export type ConnectionType = 'fiber' | '5g_home' | 'cable' | 'dsl' | 'satellite';

export interface SetupGuide {
  id: string;
  connectionType: ConnectionType;
  title: string;
  description: string;
  icon: string;
  steps: SetupStep[];
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  tip?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  dimensions?: { width: number; height: number };
  position: { x: number; y: number };
  signalStrength?: number;
}

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'garage'
  | 'basement'
  | 'hallway'
  | 'other';

export interface PlacementRecommendation {
  id: string;
  position: { x: number; y: number };
  roomId: string;
  score: number;
  reasoning: string;
  tips: string[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'router' | 'extender' | 'mesh_node' | 'modem';
  manufacturer?: string;
  model?: string;
  isConnected: boolean;
  connectionType: 'ble' | 'nfc' | 'wifi';
  signalStrength?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SpeedTestResult {
  id: string;
  timestamp: string;
  band: WifiBand;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  server: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'placement' | 'security' | 'performance' | 'general';
  isCompleted: boolean;
}

// ── Provider / ISP types ──

export interface ISPProvider {
  id: string;
  name: string;
  connectionType: ConnectionType;
  typicalDown: string;
  typicalUp: string;
  typicalLatency: string;
  placementTips: string[];
  setupNotes: string;
  website: string;
}

export interface CarrierMetrics {
  connectionType: ConnectionType;
  label: string;
  avgDown: string;
  avgUp: string;
  avgLatency: string;
  coverage: string;
}

// ── Regional 5G data types ──

export type USRegion = 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west' | 'pacific';

export type BandType = 'low_band' | 'mid_band' | 'mmwave';

export interface RegionalCarrierData {
  carrier: 'tmobile' | 'verizon' | 'att';
  carrierName: string;
  avgDownload: number; // Mbps
  avgUpload: number;
  avgLatency: number; // ms
  coverage5gPercent: number;
  dominantBand: BandType;
  rank: 1 | 2 | 3;
}

export interface StateData {
  code: string;
  name: string;
  region: USRegion;
  bestCarrier: 'tmobile' | 'verizon' | 'att';
  carriers: RegionalCarrierData[];
  topCities: CityData[];
  ruralCoverage: 'excellent' | 'good' | 'fair' | 'poor';
  terrainNotes: string;
}

export interface CityData {
  name: string;
  avgDownload: number;
  bestCarrier: 'tmobile' | 'verizon' | 'att';
  has5GUltra: boolean; // mmWave or Ultra Capacity available
}

export interface BandPlacementTips {
  bandType: BandType;
  label: string;
  range: string;
  penetration: string;
  speedRange: string;
  placementTips: string[];
}

// ── Hyperlocal 5G data types ──

export interface MetroArea {
  id: string;
  name: string;
  stateCode: string;
  neighborhoods: Neighborhood[];
  zipCodes: ZipCodeData[];
  towerDensity: 'ultra_dense' | 'dense' | 'moderate' | 'sparse';
  avgDownload: number;
  avgUpload: number;
  avgLatency: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  metroId: string;
  zipCodes: string[];
  carriers: NeighborhoodCarrierData[];
  towerCount: number;
  buildingDensity: 'high' | 'medium' | 'low';
  terrainType: 'urban_core' | 'suburban' | 'mixed_use' | 'residential' | 'industrial';
  placementNotes: string;
}

export interface NeighborhoodCarrierData {
  carrier: 'tmobile' | 'verizon' | 'att';
  avgDownload: number;
  avgUpload: number;
  avgLatency: number;
  primaryBand: BandType;
  towerProximity: 'very_close' | 'close' | 'moderate' | 'far';
  signalQuality: 'excellent' | 'good' | 'fair' | 'weak';
  bestDirection: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest' | 'any';
}

export interface ZipCodeData {
  zip: string;
  neighborhoodId: string;
  avgDownload: number;
  bestCarrier: 'tmobile' | 'verizon' | 'att';
  has5GUltra: boolean;
  congestionLevel: 'low' | 'medium' | 'high';
  peakHourImpact: number; // percentage speed reduction during peak (6-10 PM)
}

export interface TowerInfo {
  id: string;
  carrier: 'tmobile' | 'verizon' | 'att';
  band: BandType;
  direction: string; // compass direction from center of neighborhood
  distance: string; // approximate distance
  signalStrength: 'strong' | 'moderate' | 'weak';
}

export interface HyperlocalPlacementTip {
  priority: 'critical' | 'high' | 'medium' | 'low';
  tip: string;
  reason: string;
}
