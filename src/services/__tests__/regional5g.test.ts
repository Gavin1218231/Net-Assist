import { describe, it, expect } from 'vitest';
import {
  getAllStates,
  getStateByCode,
  getStatesByRegion,
  getBandPlacementTips,
  getAllBandTips,
  getBestCarrierForState,
  getCarrierDataForState,
  getCitiesForState,
  getPlacementRecommendation,
  US_REGIONS,
  CARRIER_DISPLAY_NAMES,
} from '../regional5g';
import type { USRegion, BandType } from '../../types';

describe('regional5g service', () => {
  describe('getAllStates', () => {
    it('should return array of states', () => {
      const states = getAllStates();
      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
    });

    it('should have valid state structure', () => {
      const states = getAllStates();

      states.forEach(state => {
        expect(typeof state.code).toBe('string');
        expect(state.code.length).toBe(2);
        expect(typeof state.name).toBe('string');
        expect(['northeast', 'southeast', 'midwest', 'southwest', 'west', 'pacific']).toContain(state.region);
        expect(['tmobile', 'verizon', 'att']).toContain(state.bestCarrier);
        expect(Array.isArray(state.carriers)).toBe(true);
        expect(state.carriers.length).toBeGreaterThan(0);
        expect(Array.isArray(state.topCities)).toBe(true);
        expect(['excellent', 'good', 'fair', 'poor']).toContain(state.ruralCoverage);
        expect(typeof state.terrainNotes).toBe('string');
      });
    });

    it('should return a copy', () => {
      const states1 = getAllStates();
      const states2 = getAllStates();
      expect(states1).not.toBe(states2);
    });

    it('should have unique state codes', () => {
      const states = getAllStates();
      const codes = states.map(s => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('getStateByCode', () => {
    it('should find state by uppercase code', () => {
      const state = getStateByCode('NY');
      expect(state).toBeDefined();
      expect(state?.name).toBe('New York');
    });

    it('should find state by lowercase code', () => {
      const state = getStateByCode('ny');
      expect(state).toBeDefined();
      expect(state?.name).toBe('New York');
    });

    it('should find state by mixed case', () => {
      const state = getStateByCode('Ny');
      expect(state).toBeDefined();
      expect(state?.name).toBe('New York');
    });

    it('should return undefined for invalid code', () => {
      const state = getStateByCode('XX');
      expect(state).toBeUndefined();
    });

    it('should find all states by code', () => {
      const states = getAllStates();
      states.forEach(s => {
        const found = getStateByCode(s.code);
        expect(found).toBeDefined();
        expect(found?.code).toBe(s.code);
      });
    });
  });

  describe('getStatesByRegion', () => {
    const regions: USRegion[] = ['northeast', 'southeast', 'midwest', 'southwest', 'west', 'pacific'];

    regions.forEach(region => {
      it(`should return states for ${region}`, () => {
        const states = getStatesByRegion(region);
        expect(Array.isArray(states)).toBe(true);

        states.forEach(state => {
          expect(state.region).toBe(region);
        });
      });
    });

    it('should return empty array for invalid region', () => {
      const states = getStatesByRegion('invalid' as USRegion);
      expect(states).toHaveLength(0);
    });
  });

  describe('getBandPlacementTips', () => {
    const bandTypes: BandType[] = ['low_band', 'mid_band', 'mmwave'];

    bandTypes.forEach(band => {
      it(`should return tips for ${band}`, () => {
        const tips = getBandPlacementTips(band);

        expect(tips).toBeDefined();
        expect(tips?.bandType).toBe(band);
        expect(typeof tips?.label).toBe('string');
        expect(typeof tips?.range).toBe('string');
        expect(typeof tips?.penetration).toBe('string');
        expect(typeof tips?.speedRange).toBe('string');
        expect(Array.isArray(tips?.placementTips)).toBe(true);
        expect(tips?.placementTips.length).toBeGreaterThan(0);
      });
    });

    it('should return undefined for invalid band type', () => {
      const tips = getBandPlacementTips('invalid' as BandType);
      expect(tips).toBeUndefined();
    });

    it('should have unique characteristics per band', () => {
      const lowBand = getBandPlacementTips('low_band');
      const midBand = getBandPlacementTips('mid_band');
      const mmwave = getBandPlacementTips('mmwave');

      // Low band should mention good penetration
      expect(lowBand?.penetration.toLowerCase()).toContain('excellent');

      // Mid band should mention moderate penetration
      expect(midBand?.penetration.toLowerCase()).toContain('moderate');

      // mmWave should mention poor penetration
      expect(mmwave?.penetration.toLowerCase()).toContain('poor');
    });
  });

  describe('getAllBandTips', () => {
    it('should return all band tips', () => {
      const tips = getAllBandTips();

      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBe(3); // low_band, mid_band, mmwave
    });

    it('should return a copy', () => {
      const tips1 = getAllBandTips();
      const tips2 = getAllBandTips();
      expect(tips1).not.toBe(tips2);
    });
  });

  describe('getBestCarrierForState', () => {
    it('should return best carrier data', () => {
      const carrier = getBestCarrierForState('NY');

      expect(carrier).toBeDefined();
      expect(carrier?.rank).toBe(1);
      expect(typeof carrier?.avgDownload).toBe('number');
      expect(typeof carrier?.avgUpload).toBe('number');
      expect(typeof carrier?.avgLatency).toBe('number');
      expect(typeof carrier?.coverage5gPercent).toBe('number');
    });

    it('should return undefined for invalid state', () => {
      const carrier = getBestCarrierForState('XX');
      expect(carrier).toBeUndefined();
    });

    it('should work for all states', () => {
      const states = getAllStates();
      states.forEach(state => {
        const carrier = getBestCarrierForState(state.code);
        expect(carrier).toBeDefined();
        expect(carrier?.rank).toBe(1);
      });
    });
  });

  describe('getCarrierDataForState', () => {
    const carriers = ['tmobile', 'verizon', 'att'] as const;

    carriers.forEach(carrier => {
      it(`should return ${carrier} data for NY`, () => {
        const data = getCarrierDataForState('NY', carrier);

        expect(data).toBeDefined();
        expect(data?.carrier).toBe(carrier);
        expect(typeof data?.avgDownload).toBe('number');
      });
    });

    it('should return undefined for invalid state', () => {
      const data = getCarrierDataForState('XX', 'tmobile');
      expect(data).toBeUndefined();
    });
  });

  describe('getCitiesForState', () => {
    it('should return cities for valid state', () => {
      const cities = getCitiesForState('NY');

      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBeGreaterThan(0);

      cities.forEach(city => {
        expect(typeof city.name).toBe('string');
        expect(typeof city.avgDownload).toBe('number');
        expect(['tmobile', 'verizon', 'att']).toContain(city.bestCarrier);
        expect(typeof city.has5GUltra).toBe('boolean');
      });
    });

    it('should return empty array for invalid state', () => {
      const cities = getCitiesForState('XX');
      expect(cities).toEqual([]);
    });
  });

  describe('getPlacementRecommendation', () => {
    it('should return recommendation for valid state and carrier', () => {
      const rec = getPlacementRecommendation('NY', 'tmobile');

      expect(rec).toBeDefined();
      expect(Array.isArray(rec?.tips)).toBe(true);
      expect(rec?.tips.length).toBeGreaterThan(0);
      expect(['low_band', 'mid_band', 'mmwave']).toContain(rec?.bandType);
      expect(typeof rec?.expectedSpeed).toBe('string');
    });

    it('should include state-specific info', () => {
      const rec = getPlacementRecommendation('NY', 'tmobile');

      // Tips should include state name
      const allTips = rec?.tips.join(' ');
      expect(allTips).toContain('New York');
    });

    it('should return undefined for invalid state', () => {
      const rec = getPlacementRecommendation('XX', 'tmobile');
      expect(rec).toBeUndefined();
    });
  });

  describe('US_REGIONS', () => {
    it('should have all regions', () => {
      expect(US_REGIONS.length).toBeGreaterThanOrEqual(5);

      const values = US_REGIONS.map(r => r.value);
      expect(values).toContain('northeast');
      expect(values).toContain('southeast');
      expect(values).toContain('midwest');
      expect(values).toContain('southwest');
      expect(values).toContain('west');
    });

    it('should have value and label for each region', () => {
      US_REGIONS.forEach(region => {
        expect(typeof region.value).toBe('string');
        expect(typeof region.label).toBe('string');
      });
    });
  });

  describe('CARRIER_DISPLAY_NAMES', () => {
    it('should have display names for all carriers', () => {
      expect(CARRIER_DISPLAY_NAMES.tmobile).toBe('T-Mobile');
      expect(CARRIER_DISPLAY_NAMES.verizon).toBe('Verizon');
      expect(CARRIER_DISPLAY_NAMES.att).toBe('AT&T');
    });
  });

  describe('stress tests', () => {
    it('should handle 500 state lookups', () => {
      const states = getAllStates();
      const codes = states.map(s => s.code);

      for (let i = 0; i < 500; i++) {
        const code = codes[i % codes.length];
        const state = getStateByCode(code);
        expect(state).toBeDefined();
      }
    });

    it('should handle 100 placement recommendations', () => {
      const states = getAllStates();
      const carriers = ['tmobile', 'verizon', 'att'] as const;

      for (let i = 0; i < 100; i++) {
        const state = states[i % states.length];
        const carrier = carriers[i % carriers.length];
        const rec = getPlacementRecommendation(state.code, carrier);
        expect(rec).toBeDefined();
      }
    });
  });
});
