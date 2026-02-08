import type { DeviceInfo } from '../types';

export type BLEConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

interface BLEService {
  state: BLEConnectionState;
  devices: DeviceInfo[];
  connectedDevice: DeviceInfo | null;
}

// Simulated BLE devices for demo
const MOCK_DEVICES: DeviceInfo[] = [
  {
    id: 'dev-001',
    name: 'NetGear Nighthawk R7000',
    type: 'router',
    manufacturer: 'NETGEAR',
    model: 'R7000',
    isConnected: false,
    connectionType: 'ble',
    signalStrength: -45,
  },
  {
    id: 'dev-002',
    name: 'TP-Link Archer AX73',
    type: 'router',
    manufacturer: 'TP-Link',
    model: 'Archer AX73',
    isConnected: false,
    connectionType: 'ble',
    signalStrength: -62,
  },
  {
    id: 'dev-003',
    name: 'Eero Pro 6E',
    type: 'mesh_node',
    manufacturer: 'Eero',
    model: 'Pro 6E',
    isConnected: false,
    connectionType: 'ble',
    signalStrength: -55,
  },
];

const currentState: BLEService = {
  state: 'disconnected',
  devices: [],
  connectedDevice: null,
};

export function isBLESupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export function isNFCSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

export async function scanForDevices(
  onStateChange: (state: BLEConnectionState) => void,
  onDevicesFound: (devices: DeviceInfo[]) => void
): Promise<void> {
  onStateChange('scanning');
  currentState.state = 'scanning';

  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate finding devices one by one
  const foundDevices: DeviceInfo[] = [];
  for (const device of MOCK_DEVICES) {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    foundDevices.push(device);
    onDevicesFound([...foundDevices]);
  }

  currentState.devices = foundDevices;
  onStateChange('disconnected');
  currentState.state = 'disconnected';
}

export async function connectToDevice(
  deviceId: string,
  onStateChange: (state: BLEConnectionState) => void
): Promise<DeviceInfo | null> {
  onStateChange('connecting');
  currentState.state = 'connecting';

  await new Promise(resolve => setTimeout(resolve, 1500));

  const device = currentState.devices.find(d => d.id === deviceId);
  if (device) {
    const connectedDevice = { ...device, isConnected: true };
    currentState.connectedDevice = connectedDevice;
    currentState.state = 'connected';
    onStateChange('connected');
    return connectedDevice;
  }

  currentState.state = 'error';
  onStateChange('error');
  return null;
}

export async function disconnectDevice(
  onStateChange: (state: BLEConnectionState) => void
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  currentState.connectedDevice = null;
  currentState.state = 'disconnected';
  onStateChange('disconnected');
}

export function getConnectionState(): BLEService {
  return { ...currentState };
}

export async function initiateNFCHandshake(
  onStateChange: (state: BLEConnectionState) => void
): Promise<DeviceInfo | null> {
  onStateChange('scanning');

  await new Promise(resolve => setTimeout(resolve, 3000));

  const device: DeviceInfo = {
    id: 'nfc-001',
    name: 'Detected Router (NFC)',
    type: 'router',
    manufacturer: 'Unknown',
    model: 'Unknown',
    isConnected: true,
    connectionType: 'nfc',
    signalStrength: -30,
  };

  currentState.connectedDevice = device;
  currentState.state = 'connected';
  onStateChange('connected');
  return device;
}
