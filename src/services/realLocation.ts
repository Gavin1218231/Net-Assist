// Real geolocation + Census reverse geocoding.
// Census Geocoder API: https://geocoding.geo.census.gov/geocoder/
// Public, no API key, CORS-enabled.

export interface RealLocation {
  lat: number;
  lng: number;
  source: 'gps' | 'manual' | 'zip';
  accuracy?: number;
  zip?: string;
  zcta?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
  blockGroup?: string;
  tract?: string;
  resolvedAt: string;
}

const CENSUS_COORDS = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates';
const CENSUS_ADDRESS = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const ZIPPOPOTAM = 'https://api.zippopotam.us/us';
const DEFAULT_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string, ms = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getBrowserLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation not supported by this browser');
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      err => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  });
}

interface CensusGeography {
  STATE?: string;
  STUSAB?: string;
  COUNTY?: string;
  ZCTA5?: string;
  BASENAME?: string;
  NAME?: string;
  TRACT?: string;
  BLKGRP?: string;
  GEOID?: string;
}

interface CensusGeographiesResponse {
  result?: {
    geographies?: Record<string, CensusGeography[]>;
    addressMatches?: Array<{
      coordinates?: { x: number; y: number };
      addressComponents?: { state?: string; zip?: string; city?: string };
      geographies?: Record<string, CensusGeography[]>;
    }>;
  };
}

function pickGeo(geographies: Record<string, CensusGeography[]> | undefined, key: string): CensusGeography | undefined {
  if (!geographies) return undefined;
  const arr = geographies[key];
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
}

export async function reverseGeocode(lat: number, lng: number): Promise<Partial<RealLocation>> {
  const params = new URLSearchParams({
    x: String(lng),
    y: String(lat),
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    layers: 'all',
    format: 'json',
  });
  const res = await fetchWithTimeout(`${CENSUS_COORDS}?${params}`);
  if (!res.ok) throw new Error(`Census reverse geocode failed: ${res.status}`);
  const data: CensusGeographiesResponse = await res.json();
  const geos = data.result?.geographies;
  const states = pickGeo(geos, 'States');
  const counties = pickGeo(geos, 'Counties');
  const tracts = pickGeo(geos, 'Census Tracts');
  const blockGroups = pickGeo(geos, '2020 Census Blocks') ?? pickGeo(geos, 'Census Block Groups');
  // ZCTAs aren't always returned by the coordinates endpoint; fall back to incorporated places
  const zcta = pickGeo(geos, 'Zip Code Tabulation Areas') ?? pickGeo(geos, '2020 Census ZIP Code Tabulation Areas');
  const places = pickGeo(geos, 'Incorporated Places') ?? pickGeo(geos, 'Census Designated Places');
  return {
    state: states?.BASENAME ?? states?.NAME,
    stateCode: states?.STUSAB,
    county: counties?.BASENAME ?? counties?.NAME,
    city: places?.BASENAME ?? places?.NAME,
    zcta: zcta?.BASENAME ?? zcta?.ZCTA5,
    zip: zcta?.BASENAME ?? zcta?.ZCTA5,
    tract: tracts?.BASENAME ?? tracts?.GEOID,
    blockGroup: blockGroups?.BASENAME ?? blockGroups?.GEOID,
  };
}

export async function geocodeAddress(address: string): Promise<RealLocation> {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    layers: 'all',
    format: 'json',
  });
  const res = await fetchWithTimeout(`${CENSUS_ADDRESS}?${params}`);
  if (!res.ok) throw new Error(`Census geocode failed: ${res.status}`);
  const data: CensusGeographiesResponse = await res.json();
  const match = data.result?.addressMatches?.[0];
  if (!match || !match.coordinates) throw new Error('No matching address found');
  const lat = match.coordinates.y;
  const lng = match.coordinates.x;
  const geos = match.geographies;
  const states = pickGeo(geos, 'States');
  const counties = pickGeo(geos, 'Counties');
  const places = pickGeo(geos, 'Incorporated Places') ?? pickGeo(geos, 'Census Designated Places');
  return {
    lat,
    lng,
    source: 'manual',
    state: states?.BASENAME ?? states?.NAME,
    stateCode: states?.STUSAB ?? match.addressComponents?.state,
    county: counties?.BASENAME ?? counties?.NAME,
    city: places?.BASENAME ?? places?.NAME ?? match.addressComponents?.city,
    zip: match.addressComponents?.zip,
    zcta: match.addressComponents?.zip,
    resolvedAt: new Date().toISOString(),
  };
}

export async function resolveCurrentLocation(): Promise<RealLocation> {
  const { lat, lng, accuracy } = await getBrowserLocation();
  const details = await reverseGeocode(lat, lng).catch(() => ({}));
  return {
    lat,
    lng,
    source: 'gps',
    accuracy,
    resolvedAt: new Date().toISOString(),
    ...details,
  };
}

// Public ZIP -> centroid service. No API key, CORS-enabled.
// We only use this when the Census address endpoint can't resolve a bare ZIP
// (which it often can't, since it's designed for street addresses).
async function lookupZipCentroid(zip: string): Promise<RealLocation> {
  const res = await fetchWithTimeout(`${ZIPPOPOTAM}/${zip}`);
  if (!res.ok) throw new Error(`ZIP ${zip} not found`);
  const data = await res.json() as {
    'post code': string;
    country: string;
    places: Array<{
      'place name': string;
      state: string;
      'state abbreviation': string;
      latitude: string;
      longitude: string;
    }>;
  };
  const place = data.places?.[0];
  if (!place) throw new Error(`ZIP ${zip} has no place data`);
  const lat = parseFloat(place.latitude);
  const lng = parseFloat(place.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`ZIP ${zip} returned invalid coordinates`);
  }
  // Enrich with Census geographies if possible; otherwise return the ZIP-level data.
  const enrich = await reverseGeocode(lat, lng).catch(() => ({}));
  return {
    lat,
    lng,
    source: 'zip',
    zip: data['post code'],
    zcta: data['post code'],
    city: place['place name'],
    state: place.state,
    stateCode: place['state abbreviation'],
    resolvedAt: new Date().toISOString(),
    ...enrich,
  };
}

export async function resolveZipOrAddress(input: string): Promise<RealLocation> {
  const trimmed = input.trim();
  if (/^\d{5}$/.test(trimmed)) {
    return lookupZipCentroid(trimmed);
  }
  return geocodeAddress(trimmed);
}
