import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isBLESupported,
  isNFCSupported,
  scanForDevices,
  connectToDevice,
  disconnectDevice,
  getConnectionState,
  initiateNFCHandshake,
  type BLEConnectionState,
} from '../ble';

describe('ble service', () => {
  describe('isBLESupported', () => {
    it('should return boolean', () => {
      const result = isBLESupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isNFCSupported', () => {
    it('should return boolean', () => {
      const result = isNFCSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getConnectionState', () => {
    it('should return valid state object', () => {
      const state = getConnectionState();

      expect(typeof state.state).toBe('string');
      expect(['disconnected', 'scanning', 'connecting', 'connected', 'error']).toContain(state.state);
      expect(Array.isArray(state.devices)).toBe(true);
      expect(state.connectedDevice === null || typeof state.connectedDevice === 'object').toBe(true);
    });

    it('should return a copy of state', () => {
      const state1 = getConnectionState();
      const state2 = getConnectionState();

      // Should be different objects
      expect(state1).not.toBe(state2);
      expect(state1.devices).not.toBe(state2.devices);
    });
  });

  describe('scanForDevices', () => {
    it('should transition through scanning state', async () => {
      const states: BLEConnectionState[] = [];
      const onStateChange = vi.fn((state: BLEConnectionState) => states.push(state));
      const devices: any[][] = [];
      const onDevicesFound = vi.fn((d: any[]) => devices.push([...d]));

      await scanForDevices(onStateChange, onDevicesFound);

      // Should have started with scanning
      expect(states[0]).toBe('scanning');
      // Should end with disconnected
      expect(states[states.length - 1]).toBe('disconnected');
    });

    it('should find devices progressively', async () => {
      const devices: any[][] = [];
      const onDevicesFound = vi.fn((d: any[]) => devices.push([...d]));

      await scanForDevices(() => {}, onDevicesFound);

      expect(onDevicesFound).toHaveBeenCalled();
      expect(devices.length).toBeGreaterThan(0);

      // Each call should have more devices
      for (let i = 1; i < devices.length; i++) {
        expect(devices[i].length).toBeGreaterThanOrEqual(devices[i - 1].length);
      }
    });

    it('should find valid device objects', async () => {
      let foundDevices: any[] = [];
      await scanForDevices(() => {}, (d) => { foundDevices = d; });

      expect(foundDevices.length).toBeGreaterThan(0);

      foundDevices.forEach(device => {
        expect(typeof device.id).toBe('string');
        expect(typeof device.name).toBe('string');
        expect(['router', 'mesh_node', 'modem', 'gateway']).toContain(device.type);
        expect(typeof device.manufacturer).toBe('string');
        expect(typeof device.model).toBe('string');
        expect(typeof device.isConnected).toBe('boolean');
        expect(['ble', 'wifi', 'ethernet', 'nfc']).toContain(device.connectionType);
        expect(typeof device.signalStrength).toBe('number');
      });
    });
  }, 30000);

  describe('connectToDevice', () => {
    beforeEach(async () => {
      // Ensure devices are scanned first
      await scanForDevices(() => {}, () => {});
    });

    it('should connect to valid device', async () => {
      const states: BLEConnectionState[] = [];
      const onStateChange = vi.fn((state: BLEConnectionState) => states.push(state));

      const state = getConnectionState();
      const deviceId = state.devices[0]?.id;

      if (deviceId) {
        const device = await connectToDevice(deviceId, onStateChange);

        expect(device).not.toBeNull();
        expect(device?.isConnected).toBe(true);
        expect(states).toContain('connecting');
        expect(states[states.length - 1]).toBe('connected');
      }
    });

    it('should handle invalid device ID', async () => {
      const states: BLEConnectionState[] = [];
      const onStateChange = vi.fn((state: BLEConnectionState) => states.push(state));

      const device = await connectToDevice('invalid-device-id', onStateChange);

      expect(device).toBeNull();
      expect(states[states.length - 1]).toBe('error');
    });

    it('should update connection state', async () => {
      const state = getConnectionState();
      const deviceId = state.devices[0]?.id;

      if (deviceId) {
        await connectToDevice(deviceId, () => {});
        const newState = getConnectionState();

        expect(newState.state).toBe('connected');
        expect(newState.connectedDevice).not.toBeNull();
        expect(newState.connectedDevice?.id).toBe(deviceId);
      }
    });
  }, 30000);

  describe('disconnectDevice', () => {
    beforeEach(async () => {
      await scanForDevices(() => {}, () => {});
      const state = getConnectionState();
      if (state.devices[0]) {
        await connectToDevice(state.devices[0].id, () => {});
      }
    });

    it('should disconnect and update state', async () => {
      const states: BLEConnectionState[] = [];
      const onStateChange = vi.fn((state: BLEConnectionState) => states.push(state));

      await disconnectDevice(onStateChange);

      expect(states[states.length - 1]).toBe('disconnected');

      const state = getConnectionState();
      expect(state.state).toBe('disconnected');
      expect(state.connectedDevice).toBeNull();
    });
  }, 15000);

  describe('initiateNFCHandshake', () => {
    it('should transition through scanning and connected states', async () => {
      const states: BLEConnectionState[] = [];
      const onStateChange = vi.fn((state: BLEConnectionState) => states.push(state));

      const device = await initiateNFCHandshake(onStateChange);

      expect(states).toContain('scanning');
      expect(states[states.length - 1]).toBe('connected');
      expect(device).not.toBeNull();
      expect(device?.connectionType).toBe('nfc');
      expect(device?.isConnected).toBe(true);
    });

    it('should return valid device info', async () => {
      const device = await initiateNFCHandshake(() => {});

      expect(device).not.toBeNull();
      expect(typeof device?.id).toBe('string');
      expect(typeof device?.name).toBe('string');
      expect(device?.type).toBe('router');
      expect(device?.connectionType).toBe('nfc');
    });
  }, 10000);

  describe('stress tests', () => {
    it('should handle multiple sequential scans', async () => {
      for (let i = 0; i < 3; i++) {
        await scanForDevices(() => {}, () => {});
        const state = getConnectionState();
        expect(state.state).toBe('disconnected');
        expect(state.devices.length).toBeGreaterThan(0);
      }
    }, 60000);

    it('should handle rapid connect/disconnect cycles', async () => {
      await scanForDevices(() => {}, () => {});
      const state = getConnectionState();
      const deviceId = state.devices[0]?.id;

      if (deviceId) {
        for (let i = 0; i < 3; i++) {
          await connectToDevice(deviceId, () => {});
          expect(getConnectionState().state).toBe('connected');
          await disconnectDevice(() => {});
          expect(getConnectionState().state).toBe('disconnected');
        }
      }
    }, 30000);
  });
});
