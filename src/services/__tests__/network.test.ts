import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getQualityFromSpeed,
  getSignalQuality,
  getQualityLabel,
  getQualityColor,
  getBandLabel,
  getBandDescription,
  getNetworkStatus,
  runSpeedTest,
  getRecommendations,
  formatSpeed,
  formatLatency,
} from '../network';
import type { NetworkQuality, WifiBand } from '../../types';

describe('network service', () => {
  describe('getQualityFromSpeed', () => {
    it('should return excellent for speeds >= 100', () => {
      expect(getQualityFromSpeed(100)).toBe('excellent');
      expect(getQualityFromSpeed(500)).toBe('excellent');
      expect(getQualityFromSpeed(1000)).toBe('excellent');
    });

    it('should return good for speeds >= 50 and < 100', () => {
      expect(getQualityFromSpeed(50)).toBe('good');
      expect(getQualityFromSpeed(75)).toBe('good');
      expect(getQualityFromSpeed(99.9)).toBe('good');
    });

    it('should return fair for speeds >= 25 and < 50', () => {
      expect(getQualityFromSpeed(25)).toBe('fair');
      expect(getQualityFromSpeed(35)).toBe('fair');
      expect(getQualityFromSpeed(49.9)).toBe('fair');
    });

    it('should return poor for speeds > 0 and < 25', () => {
      expect(getQualityFromSpeed(0.1)).toBe('poor');
      expect(getQualityFromSpeed(10)).toBe('poor');
      expect(getQualityFromSpeed(24.9)).toBe('poor');
    });

    it('should return none for zero speed', () => {
      expect(getQualityFromSpeed(0)).toBe('none');
    });

    it('should handle edge cases', () => {
      expect(getQualityFromSpeed(-1)).toBe('none');
      expect(getQualityFromSpeed(-100)).toBe('none');
    });
  });

  describe('getSignalQuality', () => {
    it('should return excellent for strength >= -50', () => {
      expect(getSignalQuality(-50)).toBe('excellent');
      expect(getSignalQuality(-30)).toBe('excellent');
      expect(getSignalQuality(0)).toBe('excellent');
    });

    it('should return good for strength >= -60 and < -50', () => {
      expect(getSignalQuality(-60)).toBe('good');
      expect(getSignalQuality(-55)).toBe('good');
      expect(getSignalQuality(-51)).toBe('good');
    });

    it('should return fair for strength >= -70 and < -60', () => {
      expect(getSignalQuality(-70)).toBe('fair');
      expect(getSignalQuality(-65)).toBe('fair');
      expect(getSignalQuality(-61)).toBe('fair');
    });

    it('should return poor for strength >= -80 and < -70', () => {
      expect(getSignalQuality(-80)).toBe('poor');
      expect(getSignalQuality(-75)).toBe('poor');
      expect(getSignalQuality(-71)).toBe('poor');
    });

    it('should return none for strength < -80', () => {
      expect(getSignalQuality(-81)).toBe('none');
      expect(getSignalQuality(-100)).toBe('none');
    });
  });

  describe('getQualityLabel', () => {
    it('should return correct labels for all qualities', () => {
      const qualities: NetworkQuality[] = ['excellent', 'good', 'fair', 'poor', 'none'];
      const expectedLabels = ['Excellent', 'Good', 'Fair', 'Poor', 'No Signal'];

      qualities.forEach((quality, index) => {
        expect(getQualityLabel(quality)).toBe(expectedLabels[index]);
      });
    });
  });

  describe('getQualityColor', () => {
    it('should return correct colors for all qualities', () => {
      const qualities: NetworkQuality[] = ['excellent', 'good', 'fair', 'poor', 'none'];

      qualities.forEach(quality => {
        const color = getQualityColor(quality);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should return distinct colors', () => {
      const colors = new Set([
        getQualityColor('excellent'),
        getQualityColor('good'),
        getQualityColor('fair'),
        getQualityColor('poor'),
        getQualityColor('none'),
      ]);
      expect(colors.size).toBe(5);
    });
  });

  describe('getBandLabel', () => {
    it('should return correct labels for all bands', () => {
      expect(getBandLabel('2.4ghz')).toBe('2.4 GHz');
      expect(getBandLabel('5ghz')).toBe('5 GHz');
      expect(getBandLabel('6ghz')).toBe('6 GHz');
    });
  });

  describe('getBandDescription', () => {
    it('should return descriptions for all bands', () => {
      const bands: WifiBand[] = ['2.4ghz', '5ghz', '6ghz'];

      bands.forEach(band => {
        const description = getBandDescription(band);
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(20);
      });
    });

    it('should include relevant keywords', () => {
      expect(getBandDescription('2.4ghz').toLowerCase()).toContain('range');
      expect(getBandDescription('5ghz').toLowerCase()).toContain('fast');
      expect(getBandDescription('6ghz').toLowerCase()).toContain('fastest');
    });
  });

  describe('getNetworkStatus', () => {
    it('should return valid network status', async () => {
      const status = await getNetworkStatus();

      expect(status.isConnected).toBe(true);
      expect(typeof status.ssid).toBe('string');
      expect(['2.4ghz', '5ghz', '6ghz']).toContain(status.band);
      expect(status.signalStrength).toBeLessThanOrEqual(0);
      expect(status.signalStrength).toBeGreaterThanOrEqual(-100);
      expect(status.downloadSpeed).toBeGreaterThan(0);
      expect(status.uploadSpeed).toBeGreaterThan(0);
      expect(status.latency).toBeGreaterThan(0);
      expect(['excellent', 'good', 'fair', 'poor', 'none']).toContain(status.quality);
    });

    it('should return different values on multiple calls (random)', async () => {
      const status1 = await getNetworkStatus();
      const status2 = await getNetworkStatus();

      // At least some values should differ due to randomness
      const values1 = [status1.signalStrength, status1.downloadSpeed, status1.uploadSpeed];
      const values2 = [status2.signalStrength, status2.downloadSpeed, status2.uploadSpeed];

      // They shouldn't all be exactly equal (extremely unlikely with random)
      const allEqual = values1.every((v, i) => v === values2[i]);
      expect(allEqual).toBe(false);
    });
  });

  describe('runSpeedTest', () => {
    it('should call onProgress with increasing values', async () => {
      const progressValues: number[] = [];
      const onProgress = vi.fn((p: number) => progressValues.push(p));

      await runSpeedTest(onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(progressValues.length).toBeGreaterThan(0);

      // Progress should be increasing
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      // Should end at 100
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it('should return valid speed test result', async () => {
      const result = await runSpeedTest(() => {});

      expect(result.id).toMatch(/^test-\d+$/);
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
      expect(['2.4ghz', '5ghz', '6ghz']).toContain(result.band);
      expect(result.downloadSpeed).toBeGreaterThan(0);
      expect(result.uploadSpeed).toBeGreaterThan(0);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.jitter).toBeGreaterThan(0);
      expect(typeof result.server).toBe('string');
    });

    it('should vary speed based on band', async () => {
      const [results2_4, results6] = await Promise.all([
        runSpeedTest(() => {}, '2.4ghz'),
        runSpeedTest(() => {}, '6ghz'),
      ]);

      // 6ghz should generally be faster (band multiplier is higher)
      // 6ghz multiplier is 1.6, 2.4ghz is 0.4, so 6ghz should be ~4x on average
      expect(results6.downloadSpeed / results2_4.downloadSpeed).toBeGreaterThan(0.5);
    }, 15000);

    it('should handle all band types', async () => {
      const bands: WifiBand[] = ['2.4ghz', '5ghz', '6ghz'];

      const results = await Promise.all(
        bands.map(band => runSpeedTest(() => {}, band))
      );

      results.forEach((result, index) => {
        expect(result.band).toBe(bands[index]);
      });
    }, 15000);
  });

  describe('getRecommendations', () => {
    it('should return array of recommendations', async () => {
      const recommendations = await getRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should have valid recommendation structure', async () => {
      const recommendations = await getRecommendations();

      recommendations.forEach(rec => {
        expect(typeof rec.id).toBe('string');
        expect(typeof rec.title).toBe('string');
        expect(typeof rec.description).toBe('string');
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(['placement', 'security', 'performance', 'general']).toContain(rec.category);
        expect(typeof rec.isCompleted).toBe('boolean');
      });
    });

    it('should have unique IDs', async () => {
      const recommendations = await getRecommendations();
      const ids = recommendations.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('formatSpeed', () => {
    it('should format speeds less than 1000 as Mbps', () => {
      expect(formatSpeed(50)).toBe('50.0 Mbps');
      expect(formatSpeed(100.5)).toBe('100.5 Mbps');
      expect(formatSpeed(999.9)).toBe('999.9 Mbps');
    });

    it('should format speeds >= 1000 as Gbps', () => {
      expect(formatSpeed(1000)).toBe('1.0 Gbps');
      expect(formatSpeed(1500)).toBe('1.5 Gbps');
      expect(formatSpeed(10000)).toBe('10.0 Gbps');
    });

    it('should handle edge cases', () => {
      expect(formatSpeed(0)).toBe('0.0 Mbps');
      expect(formatSpeed(0.1)).toBe('0.1 Mbps');
    });
  });

  describe('formatLatency', () => {
    it('should format latency in ms', () => {
      expect(formatLatency(10)).toBe('10 ms');
      expect(formatLatency(25.7)).toBe('26 ms');
      expect(formatLatency(100)).toBe('100 ms');
    });

    it('should round to nearest integer', () => {
      expect(formatLatency(10.4)).toBe('10 ms');
      expect(formatLatency(10.5)).toBe('11 ms');
      expect(formatLatency(10.9)).toBe('11 ms');
    });

    it('should handle edge cases', () => {
      expect(formatLatency(0)).toBe('0 ms');
      expect(formatLatency(0.1)).toBe('0 ms');
    });
  });

  describe('stress tests', () => {
    it('should handle 50 concurrent getNetworkStatus calls', async () => {
      const promises = Array.from({ length: 50 }, () => getNetworkStatus());
      const results = await Promise.all(promises);

      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.isConnected).toBe(true);
      });
    });

    it('should handle 10 concurrent speed tests', async () => {
      const promises = Array.from({ length: 10 }, () => runSpeedTest(() => {}));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.downloadSpeed).toBeGreaterThan(0);
      });
    }, 60000);

    it('should handle rapid successive calls', async () => {
      const promises = Array.from({ length: 20 }, () => getNetworkStatus());
      const results = await Promise.all(promises);

      results.forEach(status => {
        expect(status.isConnected).toBe(true);
      });
    }, 15000);
  });
});
