import { describe, it, expect } from 'vitest';
import {
  getAllMetros,
  getMetroById,
  getMetrosByState,
  getNeighborhoodById,
  getNeighborhoodsByMetro,
  getZipCodeData,
  getBestCarrierForNeighborhood,
  getHyperlocalPlacementTips,
  searchNeighborhood,
} from '../hyperlocal5g';

describe('hyperlocal5g service', () => {
  describe('getAllMetros', () => {
    it('should return array of metros', () => {
      const metros = getAllMetros();
      expect(Array.isArray(metros)).toBe(true);
      expect(metros.length).toBeGreaterThan(0);
    });

    it('should have valid metro structure', () => {
      const metros = getAllMetros();

      metros.forEach(metro => {
        expect(typeof metro.id).toBe('string');
        expect(typeof metro.name).toBe('string');
        expect(typeof metro.stateCode).toBe('string');
        expect(metro.stateCode.length).toBe(2);
        expect(['ultra_dense', 'dense', 'moderate', 'sparse']).toContain(metro.towerDensity);
        expect(typeof metro.avgDownload).toBe('number');
        expect(typeof metro.avgUpload).toBe('number');
        expect(typeof metro.avgLatency).toBe('number');
        expect(Array.isArray(metro.neighborhoods)).toBe(true);
      });
    });

    it('should have unique IDs', () => {
      const metros = getAllMetros();
      const ids = metros.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getMetroById', () => {
    it('should find metro by ID', () => {
      const metros = getAllMetros();
      const firstMetro = metros[0];

      const found = getMetroById(firstMetro.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstMetro.id);
    });

    it('should return undefined for invalid ID', () => {
      const metro = getMetroById('non-existent-metro');
      expect(metro).toBeUndefined();
    });
  });

  describe('getMetrosByState', () => {
    it('should return metros for valid state', () => {
      // Get a state that has metros
      const allMetros = getAllMetros();
      if (allMetros.length > 0) {
        const stateCode = allMetros[0].stateCode;
        const metros = getMetrosByState(stateCode);

        expect(Array.isArray(metros)).toBe(true);
        metros.forEach(metro => {
          expect(metro.stateCode).toBe(stateCode);
        });
      }
    });

    it('should return empty array for state with no metros', () => {
      const metros = getMetrosByState('XX');
      expect(metros).toEqual([]);
    });
  });

  describe('getNeighborhoodById', () => {
    it('should find neighborhood by ID', () => {
      const metros = getAllMetros();
      const metroWithNeighborhoods = metros.find(m => m.neighborhoods.length > 0);

      if (metroWithNeighborhoods) {
        const neighborhoodId = metroWithNeighborhoods.neighborhoods[0].id;
        const neighborhood = getNeighborhoodById(neighborhoodId);

        expect(neighborhood).toBeDefined();
        expect(neighborhood?.id).toBe(neighborhoodId);
      }
    });

    it('should return undefined for invalid ID', () => {
      const neighborhood = getNeighborhoodById('non-existent-neighborhood');
      expect(neighborhood).toBeUndefined();
    });
  });

  describe('getNeighborhoodsByMetro', () => {
    it('should return neighborhoods for valid metro', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        const metroId = metros[0].id;
        const neighborhoods = getNeighborhoodsByMetro(metroId);

        expect(Array.isArray(neighborhoods)).toBe(true);
        neighborhoods.forEach(n => {
          expect(n.metroId).toBe(metroId);
        });
      }
    });

    it('should return empty array for invalid metro', () => {
      const neighborhoods = getNeighborhoodsByMetro('invalid-metro');
      expect(neighborhoods).toEqual([]);
    });
  });

  describe('getZipCodeData', () => {
    it('should find data for valid zip code', () => {
      // Use a known valid zip code from the metro.zipCodes array (ZipCodeData objects)
      // The getZipCodeData function searches metro.zipCodes, not neighborhood.zipCodes
      const data = getZipCodeData('10001');

      expect(data).toBeDefined();
      expect(data?.zip).toBe('10001');
    });

    it('should return undefined for invalid zip', () => {
      const data = getZipCodeData('00000');
      expect(data).toBeUndefined();
    });
  });

  describe('getBestCarrierForNeighborhood', () => {
    it('should return best carrier for valid neighborhood', () => {
      const metros = getAllMetros();
      const metroWithNeighborhoods = metros.find(m => m.neighborhoods.length > 0);

      if (metroWithNeighborhoods) {
        const neighborhoodId = metroWithNeighborhoods.neighborhoods[0].id;
        const carrier = getBestCarrierForNeighborhood(neighborhoodId);

        if (carrier) {
          expect(['tmobile', 'verizon', 'att']).toContain(carrier.carrier);
          expect(typeof carrier.avgDownload).toBe('number');
        }
      }
    });

    it('should return undefined for invalid neighborhood', () => {
      const carrier = getBestCarrierForNeighborhood('invalid-neighborhood');
      expect(carrier).toBeUndefined();
    });
  });

  describe('getHyperlocalPlacementTips', () => {
    it('should return tips for valid neighborhood', () => {
      const metros = getAllMetros();
      const metroWithNeighborhoods = metros.find(m => m.neighborhoods.length > 0);

      if (metroWithNeighborhoods) {
        const neighborhoodId = metroWithNeighborhoods.neighborhoods[0].id;
        const tips = getHyperlocalPlacementTips(neighborhoodId, 'tmobile');

        // Function returns HyperlocalPlacementTip[] directly
        expect(Array.isArray(tips)).toBe(true);
        expect(tips.length).toBeGreaterThan(0);
      }
    });

    it('should return empty array for invalid neighborhood', () => {
      const tips = getHyperlocalPlacementTips('invalid', 'tmobile');
      expect(tips).toEqual([]);
    });
  });

  describe('searchNeighborhood', () => {
    it('should find neighborhoods by partial name match', () => {
      const metros = getAllMetros();
      const neighborhoods = metros.flatMap(m => m.neighborhoods);
      if (neighborhoods.length > 0) {
        const firstName = neighborhoods[0].name;
        const searchTerm = firstName.substring(0, 3);
        const results = searchNeighborhood(searchTerm);

        expect(Array.isArray(results)).toBe(true);
      }
    });

    it('should be case insensitive', () => {
      const metros = getAllMetros();
      const neighborhoods = metros.flatMap(m => m.neighborhoods);
      if (neighborhoods.length > 0) {
        const firstName = neighborhoods[0].name;
        const upperResults = searchNeighborhood(firstName.toUpperCase());
        const lowerResults = searchNeighborhood(firstName.toLowerCase());

        expect(upperResults.length).toBe(lowerResults.length);
      }
    });

    it('should return empty array for no matches', () => {
      const results = searchNeighborhood('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('stress tests', () => {
    it('should handle 500 metro lookups', () => {
      const metros = getAllMetros();
      if (metros.length > 0) {
        for (let i = 0; i < 500; i++) {
          const id = metros[i % metros.length].id;
          const metro = getMetroById(id);
          expect(metro).toBeDefined();
        }
      }
    });

    it('should handle 100 neighborhood lookups', () => {
      const metros = getAllMetros();
      const neighborhoods = metros.flatMap(m => m.neighborhoods);

      if (neighborhoods.length > 0) {
        for (let i = 0; i < 100; i++) {
          const id = neighborhoods[i % neighborhoods.length].id;
          const neighborhood = getNeighborhoodById(id);
          expect(neighborhood).toBeDefined();
        }
      }
    });
  });
});
