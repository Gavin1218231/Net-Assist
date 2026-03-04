import { describe, it, expect } from 'vitest';
import {
  getProvidersByType,
  getProviderById,
  getAllProviders,
  getMetricsByType,
  getAllMetrics,
  getConnectionTypeLabel,
} from '../providers';
import type { ConnectionType } from '../../types';

describe('providers service', () => {
  describe('getAllProviders', () => {
    it('should return array of providers', () => {
      const providers = getAllProviders();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should return valid provider objects', () => {
      const providers = getAllProviders();

      providers.forEach(provider => {
        expect(typeof provider.id).toBe('string');
        expect(typeof provider.name).toBe('string');
        expect(['fiber', '5g_home', 'cable', 'dsl', 'satellite']).toContain(provider.connectionType);
        expect(typeof provider.typicalDown).toBe('string');
        expect(typeof provider.typicalUp).toBe('string');
        expect(typeof provider.typicalLatency).toBe('string');
        expect(Array.isArray(provider.placementTips)).toBe(true);
        expect(provider.placementTips.length).toBeGreaterThan(0);
        expect(typeof provider.setupNotes).toBe('string');
        expect(typeof provider.website).toBe('string');
      });
    });

    it('should return a copy, not the original array', () => {
      const providers1 = getAllProviders();
      const providers2 = getAllProviders();
      expect(providers1).not.toBe(providers2);
    });

    it('should have unique IDs', () => {
      const providers = getAllProviders();
      const ids = providers.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getProvidersByType', () => {
    const connectionTypes: ConnectionType[] = ['fiber', '5g_home', 'cable', 'dsl', 'satellite'];

    connectionTypes.forEach(type => {
      it(`should return providers for ${type}`, () => {
        const providers = getProvidersByType(type);

        expect(Array.isArray(providers)).toBe(true);
        expect(providers.length).toBeGreaterThan(0);

        providers.forEach(provider => {
          expect(provider.connectionType).toBe(type);
        });
      });
    });

    it('should return fiber providers with fiber characteristics', () => {
      const fiberProviders = getProvidersByType('fiber');

      fiberProviders.forEach(provider => {
        // Fiber providers should mention fast speeds or fiber in their notes
        const combinedText = `${provider.typicalDown} ${provider.setupNotes}`.toLowerCase();
        expect(combinedText.includes('fiber') || combinedText.includes('mbps')).toBe(true);
      });
    });

    it('should return 5G providers with placement tips about windows', () => {
      const providers5G = getProvidersByType('5g_home');

      providers5G.forEach(provider => {
        // 5G placement tips should mention window placement
        const allTips = provider.placementTips.join(' ').toLowerCase();
        expect(allTips.includes('window') || allTips.includes('signal')).toBe(true);
      });
    });
  });

  describe('getProviderById', () => {
    it('should return provider for valid ID', () => {
      const providers = getAllProviders();
      const firstId = providers[0].id;

      const provider = getProviderById(firstId);

      expect(provider).toBeDefined();
      expect(provider?.id).toBe(firstId);
    });

    it('should return undefined for invalid ID', () => {
      const provider = getProviderById('non-existent-provider');
      expect(provider).toBeUndefined();
    });

    it('should find specific known providers', () => {
      const knownProviders = ['att-fiber', 'tmobile-5g', 'xfinity', 'starlink'];

      knownProviders.forEach(id => {
        const provider = getProviderById(id);
        expect(provider).toBeDefined();
        expect(provider?.id).toBe(id);
      });
    });
  });

  describe('getAllMetrics', () => {
    it('should return array of metrics', () => {
      const metrics = getAllMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should have metrics for all connection types', () => {
      const metrics = getAllMetrics();
      const types = metrics.map(m => m.connectionType);

      expect(types).toContain('fiber');
      expect(types).toContain('5g_home');
      expect(types).toContain('cable');
      expect(types).toContain('dsl');
      expect(types).toContain('satellite');
    });

    it('should have valid metric structure', () => {
      const metrics = getAllMetrics();

      metrics.forEach(metric => {
        expect(['fiber', '5g_home', 'cable', 'dsl', 'satellite']).toContain(metric.connectionType);
        expect(typeof metric.label).toBe('string');
        expect(typeof metric.avgDown).toBe('string');
        expect(typeof metric.avgUp).toBe('string');
        expect(typeof metric.avgLatency).toBe('string');
        expect(typeof metric.coverage).toBe('string');
      });
    });

    it('should return a copy, not the original array', () => {
      const metrics1 = getAllMetrics();
      const metrics2 = getAllMetrics();
      expect(metrics1).not.toBe(metrics2);
    });
  });

  describe('getMetricsByType', () => {
    const connectionTypes: ConnectionType[] = ['fiber', '5g_home', 'cable', 'dsl', 'satellite'];

    connectionTypes.forEach(type => {
      it(`should return metrics for ${type}`, () => {
        const metrics = getMetricsByType(type);

        expect(metrics).toBeDefined();
        expect(metrics?.connectionType).toBe(type);
      });
    });

    it('should return undefined for invalid type', () => {
      const metrics = getMetricsByType('invalid' as ConnectionType);
      expect(metrics).toBeUndefined();
    });
  });

  describe('getConnectionTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getConnectionTypeLabel('fiber')).toBe('Fiber Optic');
      expect(getConnectionTypeLabel('5g_home')).toBe('5G Home Internet');
      expect(getConnectionTypeLabel('cable')).toBe('Cable Internet');
      expect(getConnectionTypeLabel('dsl')).toBe('DSL Internet');
      expect(getConnectionTypeLabel('satellite')).toBe('Satellite Internet');
    });
  });

  describe('data quality', () => {
    it('should have non-empty placement tips for all providers', () => {
      const providers = getAllProviders();

      providers.forEach(provider => {
        expect(provider.placementTips.length).toBeGreaterThan(0);
        provider.placementTips.forEach(tip => {
          expect(typeof tip).toBe('string');
          expect(tip.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid website URLs', () => {
      const providers = getAllProviders();

      providers.forEach(provider => {
        // Website should be a valid domain
        expect(provider.website).toMatch(/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[a-z0-9-]*)*$/i);
      });
    });

    it('should have realistic speed ranges in typicalDown', () => {
      const providers = getAllProviders();

      providers.forEach(provider => {
        // Should contain Mbps or Gbps
        expect(provider.typicalDown.toLowerCase()).toMatch(/(mbps|gbps)/i);
      });
    });
  });

  describe('stress tests', () => {
    it('should handle 1000 getAllProviders calls', () => {
      for (let i = 0; i < 1000; i++) {
        const providers = getAllProviders();
        expect(providers.length).toBeGreaterThan(0);
      }
    });

    it('should handle 1000 getProviderById lookups', () => {
      const providers = getAllProviders();
      const ids = providers.map(p => p.id);

      for (let i = 0; i < 1000; i++) {
        const id = ids[i % ids.length];
        const provider = getProviderById(id);
        expect(provider).toBeDefined();
      }
    });

    it('should handle all type lookups rapidly', () => {
      const types: ConnectionType[] = ['fiber', '5g_home', 'cable', 'dsl', 'satellite'];

      for (let i = 0; i < 200; i++) {
        types.forEach(type => {
          const providers = getProvidersByType(type);
          expect(providers.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
