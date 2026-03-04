import { describe, it, expect } from 'vitest';
import {
  getAllMetros,
  getMetroData,
  getMetrosByState,
  getFastestProvidersInMetro,
  getProviderProfile,
  getHyperlocalPlacementTips,
  getAllProviderProfiles,
  getProviderMetroData,
} from '../hyperlocalProviders';

describe('hyperlocalProviders service', () => {
  describe('getAllMetros', () => {
    it('should return array of metros', () => {
      const metros = getAllMetros();
      expect(Array.isArray(metros)).toBe(true);
      expect(metros.length).toBeGreaterThan(0);
    });

    it('should have valid simplified metro structure', () => {
      const metros = getAllMetros();

      metros.forEach(metro => {
        expect(typeof metro.id).toBe('string');
        expect(typeof metro.name).toBe('string');
        expect(typeof metro.state).toBe('string');
      });
    });

    it('should have unique IDs', () => {
      const metros = getAllMetros();
      const ids = metros.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getMetroData', () => {
    it('should return full metro data for valid ID', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        const metroData = getMetroData(metros[0].id);

        expect(metroData).toBeDefined();
        expect(metroData?.metroId).toBe(metros[0].id);
        expect(typeof metroData?.metroName).toBe('string');
        expect(typeof metroData?.population).toBe('number');
        expect(typeof metroData?.medianDown).toBe('number');
        expect(typeof metroData?.medianLatency).toBe('number');
        expect(Array.isArray(metroData?.providers)).toBe(true);
      }
    });

    it('should return undefined for invalid ID', () => {
      const metro = getMetroData('non-existent-metro');
      expect(metro).toBeUndefined();
    });

    it('should have providers with valid structure', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        const metroData = getMetroData(metros[0].id);
        if (metroData && metroData.providers.length > 0) {
          metroData.providers.forEach(provider => {
            expect(typeof provider.providerId).toBe('string');
            expect(typeof provider.metroId).toBe('string');
            expect(typeof provider.medianDown).toBe('number');
            expect(typeof provider.medianUp).toBe('number');
            expect(typeof provider.medianLatency).toBe('number');
            expect(typeof provider.maxAvailableSpeed).toBe('number');
            expect(typeof provider.consistencyScore).toBe('number');
          });
        }
      }
    });
  });

  describe('getMetrosByState', () => {
    it('should return metros for valid state', () => {
      const allMetros = getAllMetros();
      if (allMetros.length > 0) {
        const state = allMetros[0].state;
        const metros = getMetrosByState(state);

        expect(Array.isArray(metros)).toBe(true);
        metros.forEach(metro => {
          expect(metro.state).toBe(state);
        });
      }
    });

    it('should return empty array for invalid state', () => {
      const metros = getMetrosByState('XX');
      expect(metros).toEqual([]);
    });
  });

  describe('getFastestProvidersInMetro', () => {
    it('should return providers sorted by speed', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        const fastest = getFastestProvidersInMetro(metros[0].id);

        expect(Array.isArray(fastest)).toBe(true);

        // Should be sorted by download speed (descending) - check metroData
        for (let i = 1; i < fastest.length; i++) {
          expect(fastest[i - 1].metroData.medianDown).toBeGreaterThanOrEqual(fastest[i].metroData.medianDown);
        }
      }
    });

    it('should return empty array for invalid metro', () => {
      const fastest = getFastestProvidersInMetro('invalid-metro');
      expect(fastest).toEqual([]);
    });

    it('should include provider profile and metro data', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        const fastest = getFastestProvidersInMetro(metros[0].id);

        fastest.forEach(item => {
          expect(item.provider).toBeDefined();
          expect(item.metroData).toBeDefined();
          expect(typeof item.provider.providerName).toBe('string');
          expect(typeof item.metroData.medianDown).toBe('number');
        });
      }
    });
  });

  describe('getAllProviderProfiles', () => {
    it('should return array of provider profiles', () => {
      const profiles = getAllProviderProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('should have valid profile structure', () => {
      const profiles = getAllProviderProfiles();

      profiles.forEach(profile => {
        expect(typeof profile.providerId).toBe('string');
        expect(typeof profile.providerName).toBe('string');
        expect(['fiber', '5g_home', 'cable', 'dsl', 'satellite']).toContain(profile.connectionType);
        expect(Array.isArray(profile.primaryStates)).toBe(true);
        expect(typeof profile.nationalMedianDown).toBe('number');
        expect(typeof profile.nationalMedianUp).toBe('number');
        expect(typeof profile.nationalMedianLatency).toBe('number');
        expect(typeof profile.ooklaSpeedScore).toBe('number');
        expect(typeof profile.customerSatisfaction).toBe('number');
      });
    });
  });

  describe('getProviderProfile', () => {
    it('should return profile for valid provider', () => {
      const profiles = getAllProviderProfiles();
      if (profiles.length > 0) {
        const profile = getProviderProfile(profiles[0].providerId);

        expect(profile).toBeDefined();
        expect(profile?.providerId).toBe(profiles[0].providerId);
      }
    });

    it('should return undefined for invalid provider', () => {
      const profile = getProviderProfile('invalid-provider');
      expect(profile).toBeUndefined();
    });
  });

  describe('getProviderMetroData', () => {
    it('should return metro-specific provider data', () => {
      const metros = getAllMetros();
      const profiles = getAllProviderProfiles();

      if (metros.length > 0 && profiles.length > 0) {
        const metroData = getProviderMetroData(profiles[0].providerId, metros[0].id);

        // May or may not exist depending on provider coverage
        if (metroData) {
          expect(typeof metroData.medianDown).toBe('number');
          expect(typeof metroData.medianUp).toBe('number');
          expect(typeof metroData.medianLatency).toBe('number');
        }
      }
    });

    it('should return undefined for invalid combinations', () => {
      const data = getProviderMetroData('invalid-provider', 'invalid-metro');
      expect(data).toBeUndefined();
    });
  });

  describe('getHyperlocalPlacementTips', () => {
    it('should return tips for valid provider and metro', () => {
      const metros = getAllMetros();
      const profiles = getAllProviderProfiles();

      if (metros.length > 0 && profiles.length > 0) {
        // Find a provider that operates in this metro
        const metroData = getMetroData(metros[0].id);
        if (metroData && metroData.providers.length > 0) {
          const providerId = metroData.providers[0].providerId;
          const tips = getHyperlocalPlacementTips(providerId, metros[0].id);

          if (tips) {
            expect(Array.isArray(tips.tips)).toBe(true);
            expect(tips.tips.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should return undefined for invalid metro', () => {
      const tips = getHyperlocalPlacementTips('some-provider', 'invalid-metro');
      expect(tips).toBeUndefined();
    });
  });

  describe('data quality', () => {
    it('should have realistic speed values', () => {
      const metros = getAllMetros();

      metros.forEach(metro => {
        const data = getMetroData(metro.id);
        if (data) {
          expect(data.medianDown).toBeGreaterThan(0);
          expect(data.medianDown).toBeLessThan(10000); // Max 10 Gbps
          expect(data.medianLatency).toBeGreaterThan(0);
          expect(data.medianLatency).toBeLessThan(1000); // Max 1 second
        }
      });
    });

    it('should have valid availability percentages', () => {
      const metros = getAllMetros();

      metros.forEach(metro => {
        const data = getMetroData(metro.id);
        if (data) {
          expect(data.fiberAvailability).toBeGreaterThanOrEqual(0);
          expect(data.fiberAvailability).toBeLessThanOrEqual(100);
          expect(data.cableAvailability).toBeGreaterThanOrEqual(0);
          expect(data.cableAvailability).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should have positive population values', () => {
      const metros = getAllMetros();

      metros.forEach(metro => {
        const data = getMetroData(metro.id);
        if (data) {
          expect(data.population).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('stress tests', () => {
    it('should handle 500 metro lookups', () => {
      const metros = getAllMetros();
      // Find metros that have data available
      const metrosWithData = metros.filter(m => getMetroData(m.id) !== undefined);

      if (metrosWithData.length > 0) {
        let successCount = 0;
        for (let i = 0; i < 500; i++) {
          const id = metrosWithData[i % metrosWithData.length].id;
          const metro = getMetroData(id);
          if (metro) successCount++;
        }
        expect(successCount).toBe(500);
      }
    });

    it('should handle 100 provider profile lookups', () => {
      const profiles = getAllProviderProfiles();

      if (profiles.length > 0) {
        for (let i = 0; i < 100; i++) {
          const id = profiles[i % profiles.length].providerId;
          const profile = getProviderProfile(id);
          expect(profile).toBeDefined();
        }
      }
    });

    it('should handle 50 fastest provider queries', () => {
      const metros = getAllMetros();

      for (let i = 0; i < Math.min(50, metros.length); i++) {
        const metro = metros[i];
        const fastest = getFastestProvidersInMetro(metro.id);
        expect(Array.isArray(fastest)).toBe(true);
      }
    });
  });
});
