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

export interface NetworkStatus {
  isConnected: boolean;
  ssid: string | null;
  signalStrength: number;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  quality: NetworkQuality;
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none';

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
