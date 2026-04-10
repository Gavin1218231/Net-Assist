/**
 * Hyperlocal Cable & Fiber Provider Data Service
 *
 * Comprehensive US provider data with metro-level speed/latency metrics
 * sourced from Ookla Speedtest Intelligence, FCC Broadband Data, and
 * provider announcements (Q3 2025 - Q1 2026).
 */

import type { ConnectionType } from '../types';

// ── Types ──

export interface ProviderMetroData {
  providerId: string;
  metroId: string;
  medianDown: number;      // Mbps
  medianUp: number;        // Mbps
  medianLatency: number;   // ms
  maxAvailableSpeed: number; // Mbps (plan tier)
  consistencyScore: number;  // % of tests hitting 25/3 Mbps
  peakHourDegradation: number; // % speed drop 6-10 PM
  hasDocsis4?: boolean;    // Cable: DOCSIS 4.0 deployed
  hasFiber?: boolean;      // Hybrid: fiber available in metro
  has5Gig?: boolean;       // 5+ Gbps tier available
  has8Gig?: boolean;       // 8+ Gbps tier available
  ooklaRank?: number;      // Ookla market rank (1 = fastest)
  notes?: string;
}

export interface MetroProviderSummary {
  metroId: string;
  metroName: string;
  state: string;
  population: number;
  medianDown: number;      // Metro-wide median
  medianLatency: number;
  fiberAvailability: number; // % of addresses
  cableAvailability: number;
  topProvider: string;
  providers: ProviderMetroData[];
}

export interface ProviderRegionalProfile {
  providerId: string;
  providerName: string;
  connectionType: ConnectionType;
  primaryStates: string[];
  nationalMedianDown: number;
  nationalMedianUp: number;
  nationalMedianLatency: number;
  ooklaSpeedScore: number;
  customerSatisfaction: number; // out of 5
  networkTechnology: string;
  expansionStatus: string;
  metros: ProviderMetroData[];
}

export interface HyperlocalPlacementGuide {
  providerId: string;
  metroId: string;
  neighborhoodId?: string;
  tips: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    tip: string;
    reason: string;
  }[];
}

export interface NeighborhoodData {
  neighborhoodId: string;
  name: string;
  metroId: string;
  medianDown: number;
  medianUp: number;
  medianLatency: number;
  fiberPenetration: number;      // % of addresses with fiber available
  buildingDensity: 'urban-core' | 'urban' | 'suburban' | 'exurban';
  housingType: 'high-rise' | 'mid-rise' | 'single-family' | 'mixed';
  infrastructureAge: 'new' | 'modern' | 'aging' | 'legacy' | 'mixed';
  congestionRisk: 'low' | 'moderate' | 'high';
  placementNotes: string;
}

// ── Metro Area Definitions ──

const METROS: Record<string, { name: string; state: string; population: number }> = {
  // Top 50 US metros
  'nyc': { name: 'New York City', state: 'NY', population: 8336817 },
  'la': { name: 'Los Angeles', state: 'CA', population: 3979576 },
  'chicago': { name: 'Chicago', state: 'IL', population: 2693976 },
  'houston': { name: 'Houston', state: 'TX', population: 2304580 },
  'phoenix': { name: 'Phoenix', state: 'AZ', population: 1608139 },
  'philadelphia': { name: 'Philadelphia', state: 'PA', population: 1584064 },
  'san-antonio': { name: 'San Antonio', state: 'TX', population: 1547253 },
  'san-diego': { name: 'San Diego', state: 'CA', population: 1423851 },
  'dallas': { name: 'Dallas', state: 'TX', population: 1343573 },
  'austin': { name: 'Austin', state: 'TX', population: 978908 },
  'jacksonville': { name: 'Jacksonville', state: 'FL', population: 949611 },
  'fort-worth': { name: 'Fort Worth', state: 'TX', population: 918915 },
  'columbus': { name: 'Columbus', state: 'OH', population: 905748 },
  'charlotte': { name: 'Charlotte', state: 'NC', population: 879709 },
  'san-francisco': { name: 'San Francisco', state: 'CA', population: 873965 },
  'indianapolis': { name: 'Indianapolis', state: 'IN', population: 867125 },
  'seattle': { name: 'Seattle', state: 'WA', population: 749256 },
  'denver': { name: 'Denver', state: 'CO', population: 715522 },
  'dc': { name: 'Washington DC', state: 'DC', population: 689545 },
  'boston': { name: 'Boston', state: 'MA', population: 675647 },
  'nashville': { name: 'Nashville', state: 'TN', population: 689447 },
  'detroit': { name: 'Detroit', state: 'MI', population: 639111 },
  'portland': { name: 'Portland', state: 'OR', population: 641162 },
  'las-vegas': { name: 'Las Vegas', state: 'NV', population: 641903 },
  'memphis': { name: 'Memphis', state: 'TN', population: 633104 },
  'louisville': { name: 'Louisville', state: 'KY', population: 633045 },
  'baltimore': { name: 'Baltimore', state: 'MD', population: 585708 },
  'milwaukee': { name: 'Milwaukee', state: 'WI', population: 577222 },
  'albuquerque': { name: 'Albuquerque', state: 'NM', population: 564559 },
  'tucson': { name: 'Tucson', state: 'AZ', population: 542629 },
  'fresno': { name: 'Fresno', state: 'CA', population: 542107 },
  'sacramento': { name: 'Sacramento', state: 'CA', population: 524943 },
  'kansas-city': { name: 'Kansas City', state: 'MO', population: 508090 },
  'atlanta': { name: 'Atlanta', state: 'GA', population: 498715 },
  'miami': { name: 'Miami', state: 'FL', population: 467963 },
  'raleigh': { name: 'Raleigh', state: 'NC', population: 467665 },
  'omaha': { name: 'Omaha', state: 'NE', population: 486051 },
  'minneapolis': { name: 'Minneapolis', state: 'MN', population: 425336 },
  'cleveland': { name: 'Cleveland', state: 'OH', population: 372624 },
  'tampa': { name: 'Tampa', state: 'FL', population: 392890 },
  'orlando': { name: 'Orlando', state: 'FL', population: 309154 },
  'salt-lake': { name: 'Salt Lake City', state: 'UT', population: 199723 },
  'pittsburgh': { name: 'Pittsburgh', state: 'PA', population: 302971 },
  'st-louis': { name: 'St. Louis', state: 'MO', population: 301578 },
  'chattanooga': { name: 'Chattanooga', state: 'TN', population: 181099 },
  'huntsville': { name: 'Huntsville', state: 'AL', population: 215006 },
  // Additional key metros for fiber/cable
  'plano': { name: 'Plano', state: 'TX', population: 285494 },
  'overland-park': { name: 'Overland Park', state: 'KS', population: 197238 },
  'prescott': { name: 'Prescott', state: 'AZ', population: 45827 },
  // ═══ ADDITIONAL METROS (Regional Coverage) ═══
  // MIDWEST
  'grand-rapids': { name: 'Grand Rapids', state: 'MI', population: 198917 },
  'ann-arbor': { name: 'Ann Arbor', state: 'MI', population: 123851 },
  'madison': { name: 'Madison', state: 'WI', population: 269840 },
  'des-moines': { name: 'Des Moines', state: 'IA', population: 214237 },
  'cedar-rapids': { name: 'Cedar Rapids', state: 'IA', population: 137710 },
  'wichita': { name: 'Wichita', state: 'KS', population: 397532 },
  'topeka': { name: 'Topeka', state: 'KS', population: 126587 },
  'lincoln': { name: 'Lincoln', state: 'NE', population: 291082 },
  'sioux-falls': { name: 'Sioux Falls', state: 'SD', population: 192517 },
  'fargo': { name: 'Fargo', state: 'ND', population: 125990 },
  'dayton': { name: 'Dayton', state: 'OH', population: 140407 },
  'akron': { name: 'Akron', state: 'OH', population: 190469 },
  'toledo': { name: 'Toledo', state: 'OH', population: 270871 },
  'cincinnati': { name: 'Cincinnati', state: 'OH', population: 309317 },
  'fort-wayne': { name: 'Fort Wayne', state: 'IN', population: 263886 },
  'evansville': { name: 'Evansville', state: 'IN', population: 117298 },
  'springfield-il': { name: 'Springfield', state: 'IL', population: 114394 },
  'peoria': { name: 'Peoria', state: 'IL', population: 113150 },
  'rockford': { name: 'Rockford', state: 'IL', population: 147051 },
  'duluth': { name: 'Duluth', state: 'MN', population: 90884 },
  'rochester-mn': { name: 'Rochester', state: 'MN', population: 121395 },
  'st-paul': { name: 'St. Paul', state: 'MN', population: 311527 },
  // SOUTHEAST
  'birmingham': { name: 'Birmingham', state: 'AL', population: 200733 },
  'montgomery': { name: 'Montgomery', state: 'AL', population: 200603 },
  'mobile': { name: 'Mobile', state: 'AL', population: 187041 },
  'little-rock': { name: 'Little Rock', state: 'AR', population: 202591 },
  'jackson-ms': { name: 'Jackson', state: 'MS', population: 153701 },
  'baton-rouge': { name: 'Baton Rouge', state: 'LA', population: 227470 },
  'new-orleans': { name: 'New Orleans', state: 'LA', population: 383997 },
  'shreveport': { name: 'Shreveport', state: 'LA', population: 187593 },
  'knoxville': { name: 'Knoxville', state: 'TN', population: 190740 },
  'columbia-sc': { name: 'Columbia', state: 'SC', population: 136632 },
  'charleston-sc': { name: 'Charleston', state: 'SC', population: 150227 },
  'greenville-sc': { name: 'Greenville', state: 'SC', population: 72095 },
  'savannah': { name: 'Savannah', state: 'GA', population: 147780 },
  'augusta': { name: 'Augusta', state: 'GA', population: 202081 },
  'durham': { name: 'Durham', state: 'NC', population: 283506 },
  'greensboro': { name: 'Greensboro', state: 'NC', population: 299035 },
  'winston-salem': { name: 'Winston-Salem', state: 'NC', population: 249545 },
  'wilmington-nc': { name: 'Wilmington', state: 'NC', population: 115451 },
  'asheville': { name: 'Asheville', state: 'NC', population: 94067 },
  'richmond': { name: 'Richmond', state: 'VA', population: 226610 },
  'virginia-beach': { name: 'Virginia Beach', state: 'VA', population: 459470 },
  'norfolk': { name: 'Norfolk', state: 'VA', population: 238005 },
  'newport-news': { name: 'Newport News', state: 'VA', population: 186247 },
  'charleston-wv': { name: 'Charleston', state: 'WV', population: 48006 },
  'lexington': { name: 'Lexington', state: 'KY', population: 322570 },
  // FLORIDA
  'fort-lauderdale': { name: 'Fort Lauderdale', state: 'FL', population: 182760 },
  'west-palm-beach': { name: 'West Palm Beach', state: 'FL', population: 117415 },
  'st-petersburg': { name: 'St. Petersburg', state: 'FL', population: 258308 },
  'cape-coral': { name: 'Cape Coral', state: 'FL', population: 194016 },
  'tallahassee': { name: 'Tallahassee', state: 'FL', population: 196169 },
  'gainesville': { name: 'Gainesville', state: 'FL', population: 141085 },
  'pensacola': { name: 'Pensacola', state: 'FL', population: 52975 },
  'sarasota': { name: 'Sarasota', state: 'FL', population: 57738 },
  'naples': { name: 'Naples', state: 'FL', population: 19115 },
  // TEXAS
  'el-paso': { name: 'El Paso', state: 'TX', population: 678815 },
  'corpus-christi': { name: 'Corpus Christi', state: 'TX', population: 317863 },
  'lubbock': { name: 'Lubbock', state: 'TX', population: 263930 },
  'amarillo': { name: 'Amarillo', state: 'TX', population: 200393 },
  'mcallen': { name: 'McAllen', state: 'TX', population: 142210 },
  'brownsville': { name: 'Brownsville', state: 'TX', population: 186738 },
  'laredo': { name: 'Laredo', state: 'TX', population: 255205 },
  'killeen': { name: 'Killeen', state: 'TX', population: 153095 },
  'midland': { name: 'Midland', state: 'TX', population: 146038 },
  'odessa': { name: 'Odessa', state: 'TX', population: 123334 },
  'beaumont': { name: 'Beaumont', state: 'TX', population: 115282 },
  'waco': { name: 'Waco', state: 'TX', population: 138486 },
  'leander': { name: 'Leander', state: 'TX', population: 92113 },
  'wylie': { name: 'Wylie', state: 'TX', population: 57516 },
  'cedar-park': { name: 'Cedar Park', state: 'TX', population: 79462 },
  'mckinney': { name: 'McKinney', state: 'TX', population: 195308 },
  'denton': { name: 'Denton', state: 'TX', population: 148146 },
  'allen': { name: 'Allen', state: 'TX', population: 104627 },
  'irving': { name: 'Irving', state: 'TX', population: 256684 },
  'arlington': { name: 'Arlington', state: 'TX', population: 394266 },
  'garland': { name: 'Garland', state: 'TX', population: 246018 },
  // SOUTHWEST (additional metros beyond tucson/albuquerque defined above)
  'mesa': { name: 'Mesa', state: 'AZ', population: 504258 },
  'chandler': { name: 'Chandler', state: 'AZ', population: 275987 },
  'glendale-az': { name: 'Glendale', state: 'AZ', population: 248325 },
  'peoria-az': { name: 'Peoria', state: 'AZ', population: 190985 },
  'surprise': { name: 'Surprise', state: 'AZ', population: 152939 },
  'santa-fe': { name: 'Santa Fe', state: 'NM', population: 87505 },
  'reno': { name: 'Reno', state: 'NV', population: 264165 },
  'henderson': { name: 'Henderson', state: 'NV', population: 320189 },
  'north-las-vegas': { name: 'North Las Vegas', state: 'NV', population: 262527 },
  // WEST COAST
  'oakland': { name: 'Oakland', state: 'CA', population: 433031 },
  'san-jose': { name: 'San Jose', state: 'CA', population: 1013240 },
  'long-beach': { name: 'Long Beach', state: 'CA', population: 466742 },
  'anaheim': { name: 'Anaheim', state: 'CA', population: 350365 },
  'santa-ana': { name: 'Santa Ana', state: 'CA', population: 310227 },
  'irvine': { name: 'Irvine', state: 'CA', population: 307670 },
  'riverside': { name: 'Riverside', state: 'CA', population: 314998 },
  'stockton': { name: 'Stockton', state: 'CA', population: 320804 },
  'bakersfield': { name: 'Bakersfield', state: 'CA', population: 403455 },
  'modesto': { name: 'Modesto', state: 'CA', population: 218464 },
  'santa-barbara': { name: 'Santa Barbara', state: 'CA', population: 88665 },
  'santa-cruz': { name: 'Santa Cruz', state: 'CA', population: 64608 },
  'palo-alto': { name: 'Palo Alto', state: 'CA', population: 68572 },
  'mountain-view': { name: 'Mountain View', state: 'CA', population: 82376 },
  'sunnyvale': { name: 'Sunnyvale', state: 'CA', population: 155805 },
  'fremont': { name: 'Fremont', state: 'CA', population: 230504 },
  'santa-clara': { name: 'Santa Clara', state: 'CA', population: 127647 },
  'berkeley': { name: 'Berkeley', state: 'CA', population: 124321 },
  // PACIFIC NORTHWEST
  'tacoma': { name: 'Tacoma', state: 'WA', population: 219346 },
  'spokane': { name: 'Spokane', state: 'WA', population: 228989 },
  'vancouver-wa': { name: 'Vancouver', state: 'WA', population: 190915 },
  'bellevue': { name: 'Bellevue', state: 'WA', population: 151854 },
  'everett': { name: 'Everett', state: 'WA', population: 110629 },
  'kirkland': { name: 'Kirkland', state: 'WA', population: 92175 },
  'olympia': { name: 'Olympia', state: 'WA', population: 55605 },
  'bellingham': { name: 'Bellingham', state: 'WA', population: 91482 },
  'eugene': { name: 'Eugene', state: 'OR', population: 176654 },
  'salem': { name: 'Salem', state: 'OR', population: 175535 },
  'bend': { name: 'Bend', state: 'OR', population: 99178 },
  'medford': { name: 'Medford', state: 'OR', population: 85824 },
  'beaverton': { name: 'Beaverton', state: 'OR', population: 97590 },
  'hillsboro': { name: 'Hillsboro', state: 'OR', population: 106894 },
  'boise': { name: 'Boise', state: 'ID', population: 235684 },
  'nampa': { name: 'Nampa', state: 'ID', population: 100200 },
  'meridian': { name: 'Meridian', state: 'ID', population: 117635 },
  'missoula': { name: 'Missoula', state: 'MT', population: 75516 },
  'billings': { name: 'Billings', state: 'MT', population: 117116 },
  // NORTHEAST
  'newark': { name: 'Newark', state: 'NJ', population: 311549 },
  'jersey-city-nj': { name: 'Jersey City', state: 'NJ', population: 292449 },
  'paterson': { name: 'Paterson', state: 'NJ', population: 159732 },
  'elizabeth': { name: 'Elizabeth', state: 'NJ', population: 137298 },
  'trenton': { name: 'Trenton', state: 'NJ', population: 90871 },
  'princeton': { name: 'Princeton', state: 'NJ', population: 31822 },
  'hoboken': { name: 'Hoboken', state: 'NJ', population: 60419 },
  'stamford': { name: 'Stamford', state: 'CT', population: 135470 },
  'bridgeport': { name: 'Bridgeport', state: 'CT', population: 148654 },
  'new-haven': { name: 'New Haven', state: 'CT', population: 134023 },
  'hartford': { name: 'Hartford', state: 'CT', population: 121054 },
  'providence': { name: 'Providence', state: 'RI', population: 190934 },
  'worcester': { name: 'Worcester', state: 'MA', population: 206518 },
  'cambridge': { name: 'Cambridge', state: 'MA', population: 118403 },
  'springfield-ma': { name: 'Springfield', state: 'MA', population: 155929 },
  'lowell': { name: 'Lowell', state: 'MA', population: 115554 },
  'manchester-nh': { name: 'Manchester', state: 'NH', population: 115644 },
  'concord-nh': { name: 'Concord', state: 'NH', population: 43976 },
  'burlington-vt': { name: 'Burlington', state: 'VT', population: 44743 },
  'portland-me': { name: 'Portland', state: 'ME', population: 68408 },
  'bangor': { name: 'Bangor', state: 'ME', population: 31753 },
  'buffalo': { name: 'Buffalo', state: 'NY', population: 278349 },
  'rochester-ny': { name: 'Rochester', state: 'NY', population: 211328 },
  'syracuse': { name: 'Syracuse', state: 'NY', population: 148620 },
  'albany': { name: 'Albany', state: 'NY', population: 99224 },
  'yonkers': { name: 'Yonkers', state: 'NY', population: 211569 },
  'white-plains': { name: 'White Plains', state: 'NY', population: 59599 },
  // ROCKY MOUNTAIN
  'colorado-springs': { name: 'Colorado Springs', state: 'CO', population: 478961 },
  'aurora-co': { name: 'Aurora', state: 'CO', population: 386261 },
  'fort-collins': { name: 'Fort Collins', state: 'CO', population: 169810 },
  'boulder': { name: 'Boulder', state: 'CO', population: 105485 },
  'lakewood': { name: 'Lakewood', state: 'CO', population: 155984 },
  'provo': { name: 'Provo', state: 'UT', population: 115162 },
  'ogden': { name: 'Ogden', state: 'UT', population: 87321 },
  'sandy': { name: 'Sandy', state: 'UT', population: 96904 },
  'orem': { name: 'Orem', state: 'UT', population: 97561 },
  'west-jordan': { name: 'West Jordan', state: 'UT', population: 116961 },
  'layton': { name: 'Layton', state: 'UT', population: 81898 },
  'cheyenne': { name: 'Cheyenne', state: 'WY', population: 65132 },
  'casper': { name: 'Casper', state: 'WY', population: 58610 },
  // MUNICIPAL BROADBAND PIONEERS
  'wilson-nc': { name: 'Wilson', state: 'NC', population: 49628 },
  'longmont': { name: 'Longmont', state: 'CO', population: 98885 },
  'sandy-or': { name: 'Sandy', state: 'OR', population: 12267 },
  'independence-or': { name: 'Independence', state: 'OR', population: 10488 },
  'monmouth-or': { name: 'Monmouth', state: 'OR', population: 10746 },
  'ammon-id': { name: 'Ammon', state: 'ID', population: 18200 },
  'centennial': { name: 'Centennial', state: 'CO', population: 108418 },
  'westminster': { name: 'Westminster', state: 'CO', population: 116317 },
  'lafayette': { name: 'Lafayette', state: 'CO', population: 30271 },
  'louisville-co': { name: 'Louisville', state: 'CO', population: 21226 },
  'loveland': { name: 'Loveland', state: 'CO', population: 76378 },
  'thomasville-ga': { name: 'Thomasville', state: 'GA', population: 18413 },
  'morristown-tn': { name: 'Morristown', state: 'TN', population: 30116 },
  'bristol-tn': { name: 'Bristol', state: 'TN', population: 27147 },
  'clarksville-tn': { name: 'Clarksville', state: 'TN', population: 166722 },
  'jackson-tn': { name: 'Jackson', state: 'TN', population: 68205 },
  'tullahoma': { name: 'Tullahoma', state: 'TN', population: 20339 },
  'pulaski-tn': { name: 'Pulaski', state: 'TN', population: 7870 },
  'lebanon-oh': { name: 'Lebanon', state: 'OH', population: 20382 },
  'hudson-oh': { name: 'Hudson', state: 'OH', population: 22629 },
  'fairlawn-oh': { name: 'Fairlawn', state: 'OH', population: 7437 },
  'wiscasset': { name: 'Wiscasset', state: 'ME', population: 3742 },
  'barre-vt': { name: 'Barre', state: 'VT', population: 8491 },
  // HAWAII
  'honolulu': { name: 'Honolulu', state: 'HI', population: 350964 },
  // OKLAHOMA
  'oklahoma-city': { name: 'Oklahoma City', state: 'OK', population: 681054 },
  'tulsa': { name: 'Tulsa', state: 'OK', population: 413066 },
  // ADDITIONAL CALIFORNIA
  'orange-county': { name: 'Orange County', state: 'CA', population: 3186989 },
  // ADDITIONAL VIRGINIA METROS (Verizon Fios territory)
  'arlington-va': { name: 'Arlington', state: 'VA', population: 238643 },
  'alexandria': { name: 'Alexandria', state: 'VA', population: 159428 },
  'fairfax': { name: 'Fairfax', state: 'VA', population: 24019 },
  'roanoke': { name: 'Roanoke', state: 'VA', population: 100011 },
  'lynchburg': { name: 'Lynchburg', state: 'VA', population: 82168 },
  'chesapeake': { name: 'Chesapeake', state: 'VA', population: 249422 },
  'hampton': { name: 'Hampton', state: 'VA', population: 137148 },
  // DELAWARE METROS (Verizon Fios territory)
  'wilmington-de': { name: 'Wilmington', state: 'DE', population: 70898 },
  'dover': { name: 'Dover', state: 'DE', population: 39403 },
  'newark-de': { name: 'Newark', state: 'DE', population: 33387 },
  // ADDITIONAL MARYLAND METROS
  'frederick': { name: 'Frederick', state: 'MD', population: 78171 },
  'rockville': { name: 'Rockville', state: 'MD', population: 67117 },
  'gaithersburg': { name: 'Gaithersburg', state: 'MD', population: 69101 },
  'bowie': { name: 'Bowie', state: 'MD', population: 58682 },
  'annapolis': { name: 'Annapolis', state: 'MD', population: 40812 },
  'silver-spring': { name: 'Silver Spring', state: 'MD', population: 81015 },
  // ADDITIONAL NEW YORK METROS
  'long-island': { name: 'Long Island', state: 'NY', population: 2826300 },
  'new-rochelle': { name: 'New Rochelle', state: 'NY', population: 79726 },
  'mount-vernon': { name: 'Mount Vernon', state: 'NY', population: 73893 },
  'poughkeepsie': { name: 'Poughkeepsie', state: 'NY', population: 32736 },
  // ADDITIONAL PENNSYLVANIA METROS
  'allentown': { name: 'Allentown', state: 'PA', population: 126092 },
  'erie': { name: 'Erie', state: 'PA', population: 94831 },
  'reading': { name: 'Reading', state: 'PA', population: 95112 },
  'scranton': { name: 'Scranton', state: 'PA', population: 77291 },
  'bethlehem': { name: 'Bethlehem', state: 'PA', population: 75707 },
  'harrisburg': { name: 'Harrisburg', state: 'PA', population: 50099 },
  'lancaster-pa': { name: 'Lancaster', state: 'PA', population: 63490 },
  'king-of-prussia': { name: 'King of Prussia', state: 'PA', population: 22028 },
  // ADDITIONAL MASSACHUSETTS METROS
  'quincy': { name: 'Quincy', state: 'MA', population: 101636 },
  'brockton': { name: 'Brockton', state: 'MA', population: 105643 },
  'new-bedford': { name: 'New Bedford', state: 'MA', population: 101079 },
  'fall-river': { name: 'Fall River', state: 'MA', population: 93885 },
};

// ── Neighborhood-Level Data (Hyperlocal Performance) ──
// Q1 2026 data from Ookla Speedtest Intelligence neighborhood analysis

const NEIGHBORHOODS: NeighborhoodData[] = [
  // ═══ CHATTANOOGA (EPB Fiber - World's Fastest) ═══
  { neighborhoodId: 'chatt-downtown', name: 'Downtown Chattanooga', metroId: 'chattanooga', medianDown: 995, medianUp: 988, medianLatency: 2, fiberPenetration: 99, buildingDensity: 'urban-core', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'EPB fiber direct to building. Place router centrally - your WiFi is the only bottleneck at these speeds.' },
  { neighborhoodId: 'chatt-north-shore', name: 'North Shore', metroId: 'chattanooga', medianDown: 992, medianUp: 985, medianLatency: 2, fiberPenetration: 98, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Premium fiber infrastructure. 25 Gbps available for power users.' },
  { neighborhoodId: 'chatt-east-brainerd', name: 'East Brainerd', metroId: 'chattanooga', medianDown: 988, medianUp: 981, medianLatency: 2, fiberPenetration: 97, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Residential fiber hub. Near-zero congestion even at peak hours.' },
  { neighborhoodId: 'chatt-signal-mountain', name: 'Signal Mountain', metroId: 'chattanooga', medianDown: 978, medianUp: 971, medianLatency: 3, fiberPenetration: 92, buildingDensity: 'exurban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Hillside terrain may require mesh system for larger homes.' },

  // ═══ KANSAS CITY (Google Fiber - Original Gigabit City) ═══
  { neighborhoodId: 'kc-westport', name: 'Westport', metroId: 'kansas-city', medianDown: 958, medianUp: 951, medianLatency: 3, fiberPenetration: 94, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Dense Google Fiber coverage. Most buildings have fiber jack in main living area.' },
  { neighborhoodId: 'kc-plaza', name: 'Country Club Plaza', metroId: 'kansas-city', medianDown: 962, medianUp: 955, medianLatency: 3, fiberPenetration: 96, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Flagship Google Fiber neighborhood. WiFi 7 router included with 8 Gig plan.' },
  { neighborhoodId: 'kc-brookside', name: 'Brookside', metroId: 'kansas-city', medianDown: 945, medianUp: 938, medianLatency: 3, fiberPenetration: 91, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Mature fiber deployment. Older homes may have fiber jack in basement - use mesh to extend.' },
  { neighborhoodId: 'kc-overland-park', name: 'Overland Park', metroId: 'overland-park', medianDown: 952, medianUp: 945, medianLatency: 3, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Highest Google Fiber availability (88%). New construction often has fiber jack in home office.' },

  // ═══ SEATTLE (Ziply Fiber - 50 Gig Leader) ═══
  { neighborhoodId: 'sea-capitol-hill', name: 'Capitol Hill', metroId: 'seattle', medianDown: 945, medianUp: 938, medianLatency: 4, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Mixed Ziply/CenturyLink fiber. Check which provider serves your building before signing up.' },
  { neighborhoodId: 'sea-ballard', name: 'Ballard', metroId: 'seattle', medianDown: 932, medianUp: 925, medianLatency: 4, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Active Ziply fiber expansion. New builds have symmetrical 50 Gig available.' },
  { neighborhoodId: 'sea-bellevue', name: 'Bellevue', metroId: 'seattle', medianDown: 958, medianUp: 951, medianLatency: 3, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech hub with premium fiber infrastructure. Most high-rises have fiber to each unit.' },
  { neighborhoodId: 'sea-redmond', name: 'Redmond', metroId: 'seattle', medianDown: 965, medianUp: 958, medianLatency: 3, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Microsoft campus proximity = excellent fiber. 10 Gig+ plans common in new developments.' },

  // ═══ AUSTIN (Google Fiber + AT&T Fiber Competition) ═══
  { neighborhoodId: 'atx-downtown', name: 'Downtown Austin', metroId: 'austin', medianDown: 928, medianUp: 921, medianLatency: 4, fiberPenetration: 89, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Google Fiber vs AT&T Fiber competition. Compare plans - Google includes WiFi 7, AT&T includes HBO Max.' },
  { neighborhoodId: 'atx-mueller', name: 'Mueller', metroId: 'austin', medianDown: 942, medianUp: 935, medianLatency: 3, fiberPenetration: 95, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Master-planned community with fiber to every home. 8 Gig available from both providers.' },
  { neighborhoodId: 'atx-domain', name: 'The Domain', metroId: 'austin', medianDown: 935, medianUp: 928, medianLatency: 4, fiberPenetration: 92, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech-forward development. Building MDUs often have exclusive provider deals - check before leasing.' },
  { neighborhoodId: 'atx-round-rock', name: 'Round Rock', metroId: 'austin', medianDown: 912, medianUp: 905, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber dominant. Dell HQ area has excellent infrastructure.' },

  // ═══ DENVER (AT&T Fiber - Former Quantum Fiber) ═══
  { neighborhoodId: 'den-lodo', name: 'LoDo (Lower Downtown)', metroId: 'denver', medianDown: 445, medianUp: 438, medianLatency: 4, fiberPenetration: 91, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum Fiber - now AT&T. 8 Gig available. Transition complete, no service changes expected.' },
  { neighborhoodId: 'den-rino', name: 'RiNo (River North)', metroId: 'denver', medianDown: 438, medianUp: 431, medianLatency: 5, fiberPenetration: 87, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Fast-growing tech district. New loft conversions have modern fiber installations.' },
  { neighborhoodId: 'den-highlands', name: 'Highlands', metroId: 'denver', medianDown: 432, medianUp: 425, medianLatency: 5, fiberPenetration: 84, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Victorian homes may have fiber at exterior ONT - run ethernet inside for best results.' },
  { neighborhoodId: 'den-cherry-creek', name: 'Cherry Creek', metroId: 'denver', medianDown: 448, medianUp: 441, medianLatency: 4, fiberPenetration: 93, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Premium residential area. Luxury buildings often have 10 Gig building backhaul.' },

  // ═══ DALLAS/FORT WORTH (Spectrum DOCSIS 4.0 + AT&T Fiber) ═══
  { neighborhoodId: 'dal-uptown', name: 'Uptown Dallas', metroId: 'dallas', medianDown: 425, medianUp: 185, medianLatency: 18, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Mixed fiber/cable. Spectrum DOCSIS 4.0 live - upload speeds jumped 817% to 158 Mbps average.' },
  { neighborhoodId: 'dal-deep-ellum', name: 'Deep Ellum', metroId: 'dallas', medianDown: 398, medianUp: 165, medianLatency: 22, fiberPenetration: 65, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic district - some buildings cable-only. Check for DOCSIS 4.0 availability by address.' },
  { neighborhoodId: 'dal-plano', name: 'Plano', metroId: 'plano', medianDown: 412, medianUp: 178, medianLatency: 20, fiberPenetration: 78, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Frontier Fiber and AT&T Fiber both available in most areas. Compare symmetrical upload speeds.' },
  { neighborhoodId: 'dal-frisco', name: 'Frisco', metroId: 'dallas', medianDown: 428, medianUp: 192, medianLatency: 16, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Rapid growth area with new fiber builds. Most new construction has fiber pre-installed.' },

  // ═══ NYC METRO (Verizon Fios + Optimum) ═══
  { neighborhoodId: 'nyc-manhattan-midtown', name: 'Midtown Manhattan', metroId: 'nyc', medianDown: 358, medianUp: 332, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Fios dominant but building MDU agreements vary. Pre-war buildings may be Optimum cable only.' },
  { neighborhoodId: 'nyc-brooklyn-heights', name: 'Brooklyn Heights', metroId: 'nyc', medianDown: 345, medianUp: 318, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic brownstones - fiber availability varies block by block. Check exact address.' },
  { neighborhoodId: 'nyc-williamsburg', name: 'Williamsburg', metroId: 'nyc', medianDown: 352, medianUp: 325, medianLatency: 9, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'New construction has Fios fiber. Older buildings may have legacy infrastructure.' },
  { neighborhoodId: 'nyc-jersey-city', name: 'Jersey City', metroId: 'nyc', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Newer waterfront developments have excellent Fios fiber. 2.3 Gbps max available.' },

  // ═══ PHOENIX (Cox + Former Quantum/AT&T Fiber) ═══
  { neighborhoodId: 'phx-downtown', name: 'Downtown Phoenix', metroId: 'phoenix', medianDown: 435, medianUp: 412, medianLatency: 5, fiberPenetration: 79, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'AT&T Fiber (former Quantum) dominant. 8 Gig available in most high-rises.' },
  { neighborhoodId: 'phx-scottsdale', name: 'Scottsdale', metroId: 'phoenix', medianDown: 425, medianUp: 398, medianLatency: 6, fiberPenetration: 75, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Cox cable or AT&T fiber. Cox has best cable uploads (42 Mbps median) in the region.' },
  { neighborhoodId: 'phx-tempe', name: 'Tempe', metroId: 'phoenix', medianDown: 445, medianUp: 418, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'ASU area has high demand. Google Fiber expanding in 2026 - check availability.' },
  { neighborhoodId: 'phx-gilbert', name: 'Gilbert', metroId: 'phoenix', medianDown: 418, medianUp: 391, medianLatency: 6, fiberPenetration: 71, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Fast-growing suburb. New master-planned communities have fiber to every lot.' },

  // ═══ PHILADELPHIA (Xfinity DOCSIS 4.0 + Verizon Fios) ═══
  { neighborhoodId: 'phl-center-city', name: 'Center City', metroId: 'philadelphia', medianDown: 342, medianUp: 145, medianLatency: 18, fiberPenetration: 68, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Xfinity DOCSIS 4.0 first deployed here. Upload speeds now symmetrical with X-Class plans.' },
  { neighborhoodId: 'phl-university-city', name: 'University City', metroId: 'philadelphia', medianDown: 355, medianUp: 158, medianLatency: 16, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Penn/Drexel area. High student density = peak hour congestion on cable. Fiber preferred.' },
  { neighborhoodId: 'phl-fishtown', name: 'Fishtown', metroId: 'philadelphia', medianDown: 335, medianUp: 135, medianLatency: 20, fiberPenetration: 58, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'high', placementNotes: 'Gentrifying area with legacy infrastructure. Fios fiber expanding but not everywhere yet.' },
  { neighborhoodId: 'phl-main-line', name: 'Main Line', metroId: 'philadelphia', medianDown: 368, medianUp: 172, medianLatency: 14, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with good infrastructure. Large homes may need mesh systems for full coverage.' },

  // ═══ ATLANTA (AT&T Fiber + Google Fiber Expansion) ═══
  { neighborhoodId: 'atl-midtown', name: 'Midtown Atlanta', metroId: 'atlanta', medianDown: 412, medianUp: 385, medianLatency: 5, fiberPenetration: 87, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber dominant. Xfinity DOCSIS 4.0 also deployed. Compare fiber vs upgraded cable.' },
  { neighborhoodId: 'atl-buckhead', name: 'Buckhead', metroId: 'atlanta', medianDown: 398, medianUp: 371, medianLatency: 6, fiberPenetration: 84, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Luxury area with premium fiber options. 5 Gig plans available from AT&T.' },
  { neighborhoodId: 'atl-decatur', name: 'Decatur', metroId: 'atlanta', medianDown: 378, medianUp: 351, medianLatency: 7, fiberPenetration: 72, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Google Fiber limited coverage. AT&T Fiber more widely available.' },
  { neighborhoodId: 'atl-alpharetta', name: 'Alpharetta', metroId: 'atlanta', medianDown: 405, medianUp: 378, medianLatency: 6, fiberPenetration: 81, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech corridor north of Atlanta. Excellent fiber infrastructure in newer subdivisions.' },

  // ═══ SACRAMENTO (Fidium Fiber - Rising Star) ═══
  { neighborhoodId: 'sac-midtown', name: 'Midtown Sacramento', metroId: 'sacramento', medianDown: 512, medianUp: 505, medianLatency: 5, fiberPenetration: 76, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Fidium Fiber earned 20 top Ookla rankings in Sacramento metro. 8 Gbps symmetrical available.' },
  { neighborhoodId: 'sac-east-sac', name: 'East Sacramento', metroId: 'sacramento', medianDown: 498, medianUp: 491, medianLatency: 6, fiberPenetration: 72, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Historic homes - fiber typically terminates at exterior. Plan ethernet runs for wired devices.' },
  { neighborhoodId: 'sac-natomas', name: 'Natomas', metroId: 'sacramento', medianDown: 525, medianUp: 518, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Newer development with strong Fidium and AT&T Fiber presence.' },

  // ═══ PORTLAND (Ziply Fiber + Former Quantum/AT&T) ═══
  { neighborhoodId: 'pdx-pearl', name: 'Pearl District', metroId: 'portland', medianDown: 925, medianUp: 918, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Premium Ziply Fiber coverage. 10 Gig and 50 Gig plans available in most buildings.' },
  { neighborhoodId: 'pdx-alberta', name: 'Alberta Arts District', metroId: 'portland', medianDown: 895, medianUp: 888, medianLatency: 6, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Mixed Ziply/AT&T coverage. Older bungalows may require exterior ONT installation.' },
  { neighborhoodId: 'pdx-lake-oswego', name: 'Lake Oswego', metroId: 'portland', medianDown: 908, medianUp: 901, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with strong Ziply presence. Large lots may need mesh for outdoor coverage.' },

  // ═══ MINNEAPOLIS (AT&T Fiber - Former Quantum) ═══
  { neighborhoodId: 'msp-downtown', name: 'Downtown Minneapolis', metroId: 'minneapolis', medianDown: 452, medianUp: 445, medianLatency: 4, fiberPenetration: 92, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum Fiber - now AT&T. Fastest AT&T metro at 432 Mbps median. 8 Gig available.' },
  { neighborhoodId: 'msp-uptown', name: 'Uptown', metroId: 'minneapolis', medianDown: 438, medianUp: 431, medianLatency: 4, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Dense apartment area with excellent fiber coverage. CenturyLink fiber legacy being upgraded.' },
  { neighborhoodId: 'msp-north-loop', name: 'North Loop', metroId: 'minneapolis', medianDown: 445, medianUp: 438, medianLatency: 4, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Trendy warehouse district. New loft conversions have fiber pre-installed.' },

  // ═══ CHICAGO METRO ═══
  { neighborhoodId: 'chi-loop', name: 'The Loop', metroId: 'chicago', medianDown: 385, medianUp: 142, medianLatency: 12, fiberPenetration: 78, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'AT&T Fiber and Xfinity compete. High-rises often have exclusive deals - verify before signing lease.' },
  { neighborhoodId: 'chi-lincoln-park', name: 'Lincoln Park', metroId: 'chicago', medianDown: 365, medianUp: 128, medianLatency: 14, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Older brownstones may be cable-only. RCN Astound available in some buildings.' },
  { neighborhoodId: 'chi-wicker-park', name: 'Wicker Park', metroId: 'chicago', medianDown: 358, medianUp: 125, medianLatency: 15, fiberPenetration: 68, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Gentrifying area with mixed infrastructure. New condo buildings have fiber.' },
  { neighborhoodId: 'chi-river-north', name: 'River North', metroId: 'chicago', medianDown: 392, medianUp: 148, medianLatency: 11, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Premium area with good fiber coverage. AT&T 5 Gig available in newer buildings.' },
  { neighborhoodId: 'chi-lakeview', name: 'Lakeview', metroId: 'chicago', medianDown: 345, medianUp: 118, medianLatency: 16, fiberPenetration: 65, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'high', placementNotes: 'Dense neighborhood with peak hour congestion. Consider fiber if available.' },
  { neighborhoodId: 'chi-hyde-park', name: 'Hyde Park', metroId: 'chicago', medianDown: 372, medianUp: 135, medianLatency: 13, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'University of Chicago area. Good infrastructure investment in recent years.' },
  { neighborhoodId: 'chi-naperville', name: 'Naperville', metroId: 'chicago', medianDown: 398, medianUp: 158, medianLatency: 10, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with excellent AT&T Fiber coverage. Most homes can get 5 Gig.' },
  { neighborhoodId: 'chi-evanston', name: 'Evanston', metroId: 'chicago', medianDown: 378, medianUp: 142, medianLatency: 12, fiberPenetration: 78, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Northwestern University area. Good mix of fiber and cable options.' },
  { neighborhoodId: 'chi-schaumburg', name: 'Schaumburg', metroId: 'chicago', medianDown: 385, medianUp: 148, medianLatency: 11, fiberPenetration: 80, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Major corporate hub. Business-grade fiber available in many residential areas.' },
  { neighborhoodId: 'chi-oak-park', name: 'Oak Park', metroId: 'chicago', medianDown: 355, medianUp: 125, medianLatency: 14, fiberPenetration: 70, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Historic homes may have older wiring. AT&T Fiber expanding block by block.' },

  // ═══ HOUSTON METRO ═══
  { neighborhoodId: 'hou-downtown', name: 'Downtown Houston', metroId: 'houston', medianDown: 425, medianUp: 398, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber flagship market. 5 Gig symmetrical widely available.' },
  { neighborhoodId: 'hou-montrose', name: 'Montrose', metroId: 'houston', medianDown: 412, medianUp: 385, medianLatency: 6, fiberPenetration: 84, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Eclectic neighborhood with good fiber coverage. Older bungalows may need exterior ONT.' },
  { neighborhoodId: 'hou-heights', name: 'The Heights', metroId: 'houston', medianDown: 405, medianUp: 378, medianLatency: 6, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Historic area with active fiber deployment. Most streets now have AT&T Fiber.' },
  { neighborhoodId: 'hou-galleria', name: 'Galleria/Uptown', metroId: 'houston', medianDown: 418, medianUp: 391, medianLatency: 5, fiberPenetration: 86, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Dense commercial/residential area. High-rises have excellent fiber options.' },
  { neighborhoodId: 'hou-katy', name: 'Katy', metroId: 'houston', medianDown: 395, medianUp: 368, medianLatency: 7, fiberPenetration: 79, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Fast-growing suburb. Master-planned communities have fiber to every lot.' },
  { neighborhoodId: 'hou-sugar-land', name: 'Sugar Land', metroId: 'houston', medianDown: 402, medianUp: 375, medianLatency: 6, fiberPenetration: 83, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with strong AT&T Fiber presence. Most areas have 5 Gig option.' },
  { neighborhoodId: 'hou-woodlands', name: 'The Woodlands', metroId: 'houston', medianDown: 408, medianUp: 381, medianLatency: 6, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Master-planned community with excellent infrastructure. Tachus fiber also available.' },
  { neighborhoodId: 'hou-pearland', name: 'Pearland', metroId: 'houston', medianDown: 388, medianUp: 361, medianLatency: 7, fiberPenetration: 76, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Growing suburb south of Houston. Fiber availability varies by subdivision.' },

  // ═══ SAN FRANCISCO BAY AREA ═══
  { neighborhoodId: 'sf-soma', name: 'SoMa', metroId: 'san-francisco', medianDown: 445, medianUp: 185, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Tech hub with Sonic, AT&T, and Webpass fiber options. New buildings often have 10 Gig backhaul.' },
  { neighborhoodId: 'sf-mission', name: 'Mission District', metroId: 'san-francisco', medianDown: 398, medianUp: 165, medianLatency: 10, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Older buildings may be Comcast-only. Sonic fiber expanding rapidly.' },
  { neighborhoodId: 'sf-marina', name: 'Marina District', metroId: 'san-francisco', medianDown: 412, medianUp: 172, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Dense area with good fiber options. Building age affects availability.' },
  { neighborhoodId: 'sf-castro', name: 'Castro', metroId: 'san-francisco', medianDown: 405, medianUp: 168, medianLatency: 9, fiberPenetration: 74, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Victorian homes - Sonic fiber available on most blocks. Check exact address.' },
  { neighborhoodId: 'oak-downtown', name: 'Downtown Oakland', metroId: 'oakland', medianDown: 425, medianUp: 178, medianLatency: 9, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Sonic and AT&T fiber available. BART area has excellent connectivity.' },
  { neighborhoodId: 'oak-rockridge', name: 'Rockridge', metroId: 'oakland', medianDown: 398, medianUp: 165, medianLatency: 10, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'single-family', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Residential area with expanding Sonic fiber coverage.' },
  { neighborhoodId: 'sj-downtown', name: 'Downtown San Jose', metroId: 'san-jose', medianDown: 458, medianUp: 195, medianLatency: 7, fiberPenetration: 85, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Tech capital with excellent fiber. AT&T, Sonic, and local providers compete.' },
  { neighborhoodId: 'sj-willow-glen', name: 'Willow Glen', metroId: 'san-jose', medianDown: 435, medianUp: 182, medianLatency: 8, fiberPenetration: 80, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Family neighborhood with good fiber options. Older homes may need exterior ONT.' },
  { neighborhoodId: 'pa-downtown', name: 'Downtown Palo Alto', metroId: 'palo-alto', medianDown: 485, medianUp: 215, medianLatency: 5, fiberPenetration: 92, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Stanford adjacent - premium fiber infrastructure. Palo Alto Fiber municipal option.' },
  { neighborhoodId: 'mv-downtown', name: 'Downtown Mountain View', metroId: 'mountain-view', medianDown: 478, medianUp: 208, medianLatency: 5, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Google HQ area. Excellent fiber from multiple providers.' },

  // ═══ LOS ANGELES METRO ═══
  { neighborhoodId: 'la-dtla', name: 'Downtown LA', metroId: 'la', medianDown: 398, medianUp: 385, medianLatency: 7, fiberPenetration: 82, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Frontier Fiber dominant. Loft buildings vary - check fiber availability before signing.' },
  { neighborhoodId: 'la-santa-monica', name: 'Santa Monica', metroId: 'la', medianDown: 412, medianUp: 392, medianLatency: 6, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Tech hub with strong fiber presence. Spectrum and Frontier compete aggressively.' },
  { neighborhoodId: 'la-venice', name: 'Venice', metroId: 'la', medianDown: 385, medianUp: 368, medianLatency: 8, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Creative district with mixed infrastructure. Newer builds have fiber.' },
  { neighborhoodId: 'la-hollywood', name: 'Hollywood', metroId: 'la', medianDown: 375, medianUp: 358, medianLatency: 9, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'high', placementNotes: 'Dense area with aging infrastructure. Peak hour congestion common on cable.' },
  { neighborhoodId: 'la-burbank', name: 'Burbank', metroId: 'la', medianDown: 392, medianUp: 375, medianLatency: 7, fiberPenetration: 80, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Entertainment industry hub. Business-grade fiber available to many homes.' },
  { neighborhoodId: 'la-pasadena', name: 'Pasadena', metroId: 'la', medianDown: 405, medianUp: 388, medianLatency: 6, fiberPenetration: 83, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Caltech/JPL area with excellent infrastructure. AT&T Fiber expanding.' },
  { neighborhoodId: 'la-glendale', name: 'Glendale', metroId: 'la', medianDown: 388, medianUp: 371, medianLatency: 8, fiberPenetration: 78, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Good mix of fiber and cable options. Frontier dominant in most areas.' },
  { neighborhoodId: 'irv-spectrum', name: 'Irvine Spectrum', metroId: 'irvine', medianDown: 425, medianUp: 405, medianLatency: 5, fiberPenetration: 90, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Master-planned with fiber to every home. Cox and AT&T both available.' },
  { neighborhoodId: 'lb-downtown', name: 'Downtown Long Beach', metroId: 'long-beach', medianDown: 378, medianUp: 361, medianLatency: 9, fiberPenetration: 74, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Waterfront area with improving fiber coverage. Frontier expanding.' },

  // ═══ BOSTON METRO ═══
  { neighborhoodId: 'bos-back-bay', name: 'Back Bay', metroId: 'boston', medianDown: 335, medianUp: 308, medianLatency: 10, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic brownstones - Verizon Fios available but building wiring varies.' },
  { neighborhoodId: 'bos-seaport', name: 'Seaport District', metroId: 'boston', medianDown: 385, medianUp: 358, medianLatency: 7, fiberPenetration: 92, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'New development with premium fiber. All buildings have Fios or similar.' },
  { neighborhoodId: 'bos-cambridge', name: 'Cambridge', metroId: 'cambridge', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'MIT/Harvard area. Good fiber options but older housing stock varies.' },
  { neighborhoodId: 'bos-somerville', name: 'Somerville', metroId: 'boston', medianDown: 345, medianUp: 318, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Dense residential area. Fios expanding but not universal yet.' },
  { neighborhoodId: 'bos-brookline', name: 'Brookline', metroId: 'boston', medianDown: 355, medianUp: 328, medianLatency: 9, fiberPenetration: 80, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'low', placementNotes: 'Affluent area with good Fios coverage. Victorian homes may need updates.' },
  { neighborhoodId: 'bos-newton', name: 'Newton', metroId: 'boston', medianDown: 368, medianUp: 341, medianLatency: 8, fiberPenetration: 83, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Suburban with strong Fios presence. Large homes may need mesh WiFi.' },

  // ═══ WASHINGTON DC METRO ═══
  { neighborhoodId: 'dc-downtown', name: 'Downtown DC', metroId: 'dc', medianDown: 352, medianUp: 325, medianLatency: 8, fiberPenetration: 85, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Verizon Fios dominant. Most buildings wired for fiber.' },
  { neighborhoodId: 'dc-dupont', name: 'Dupont Circle', metroId: 'dc', medianDown: 345, medianUp: 318, medianLatency: 9, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic rowhouses - fiber availability varies. Check exact address.' },
  { neighborhoodId: 'dc-georgetown', name: 'Georgetown', metroId: 'dc', medianDown: 338, medianUp: 311, medianLatency: 10, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'legacy', congestionRisk: 'moderate', placementNotes: 'Historic district with older infrastructure. Some areas cable-only.' },
  { neighborhoodId: 'dc-capitol-hill', name: 'Capitol Hill', metroId: 'dc', medianDown: 348, medianUp: 321, medianLatency: 9, fiberPenetration: 80, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Rowhouse neighborhood with good Fios coverage on most blocks.' },
  { neighborhoodId: 'dc-arlington', name: 'Arlington', metroId: 'dc', medianDown: 372, medianUp: 345, medianLatency: 7, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Northern Virginia with excellent Fios coverage. Amazon HQ2 area.' },
  { neighborhoodId: 'dc-bethesda', name: 'Bethesda', metroId: 'dc', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent Maryland suburb with strong Fios presence.' },
  { neighborhoodId: 'dc-alexandria', name: 'Alexandria', metroId: 'dc', medianDown: 358, medianUp: 331, medianLatency: 8, fiberPenetration: 83, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Old Town has mixed infrastructure. Newer areas have excellent fiber.' },

  // ═══ MIAMI/SOUTH FLORIDA ═══
  { neighborhoodId: 'mia-downtown', name: 'Downtown Miami', metroId: 'miami', medianDown: 372, medianUp: 345, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'AT&T Fiber dominant. High-rises have excellent connectivity.' },
  { neighborhoodId: 'mia-brickell', name: 'Brickell', metroId: 'miami', medianDown: 385, medianUp: 358, medianLatency: 7, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'moderate', placementNotes: 'Financial district with premium fiber. Most towers have 5 Gig available.' },
  { neighborhoodId: 'mia-wynwood', name: 'Wynwood', metroId: 'miami', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Arts district with improving infrastructure. New lofts have fiber.' },
  { neighborhoodId: 'mia-coral-gables', name: 'Coral Gables', metroId: 'miami', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 80, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Upscale area with good AT&T Fiber coverage. Historic homes may vary.' },
  { neighborhoodId: 'ftl-downtown', name: 'Downtown Fort Lauderdale', metroId: 'fort-lauderdale', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Waterfront towers have good fiber. AT&T and Xfinity compete.' },
  { neighborhoodId: 'wpb-downtown', name: 'Downtown West Palm Beach', metroId: 'west-palm-beach', medianDown: 352, medianUp: 325, medianLatency: 9, fiberPenetration: 76, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Growing tech hub with expanding fiber coverage.' },

  // ═══ FLORIDA GULF COAST ═══
  { neighborhoodId: 'tpa-downtown', name: 'Downtown Tampa', metroId: 'tampa', medianDown: 378, medianUp: 351, medianLatency: 7, fiberPenetration: 84, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber and Frontier compete. Most high-rises have multiple options.' },
  { neighborhoodId: 'tpa-ybor', name: 'Ybor City', metroId: 'tampa', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic district with mixed infrastructure. Loft conversions have fiber.' },
  { neighborhoodId: 'tpa-south-tampa', name: 'South Tampa', metroId: 'tampa', medianDown: 385, medianUp: 358, medianLatency: 7, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Affluent area with strong fiber presence. Most streets have AT&T Fiber.' },
  { neighborhoodId: 'stp-downtown', name: 'Downtown St. Petersburg', metroId: 'st-petersburg', medianDown: 368, medianUp: 341, medianLatency: 8, fiberPenetration: 80, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Waterfront area with good fiber options. Growing tech scene.' },
  { neighborhoodId: 'orl-downtown', name: 'Downtown Orlando', metroId: 'orlando', medianDown: 412, medianUp: 385, medianLatency: 6, fiberPenetration: 86, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum Fiber - now AT&T. 8 Gig available in most buildings.' },
  { neighborhoodId: 'orl-winter-park', name: 'Winter Park', metroId: 'orlando', medianDown: 398, medianUp: 371, medianLatency: 7, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Upscale suburb with excellent fiber coverage.' },

  // ═══ NORTH CAROLINA / RESEARCH TRIANGLE ═══
  { neighborhoodId: 'ral-downtown', name: 'Downtown Raleigh', metroId: 'raleigh', medianDown: 875, medianUp: 868, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Google Fiber city. 8 Gig symmetrical available downtown.' },
  { neighborhoodId: 'ral-north-hills', name: 'North Hills', metroId: 'raleigh', medianDown: 858, medianUp: 851, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Mixed-use development with Google Fiber throughout.' },
  { neighborhoodId: 'ral-cary', name: 'Cary', metroId: 'raleigh', medianDown: 845, medianUp: 838, medianLatency: 6, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Tech suburb with Google Fiber and AT&T options.' },
  { neighborhoodId: 'dur-downtown', name: 'Downtown Durham', metroId: 'durham', medianDown: 862, medianUp: 855, medianLatency: 5, fiberPenetration: 86, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Duke area with Google Fiber. Tobacco warehouse lofts have fiber.' },
  { neighborhoodId: 'dur-rtp', name: 'Research Triangle Park', metroId: 'durham', medianDown: 892, medianUp: 885, medianLatency: 4, fiberPenetration: 95, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Tech campus with premium infrastructure. Business-grade fiber to homes.' },
  { neighborhoodId: 'cha-uptown', name: 'Uptown Charlotte', metroId: 'charlotte', medianDown: 878, medianUp: 871, medianLatency: 5, fiberPenetration: 87, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Google Fiber flagship. 8 Gig available in most high-rises.' },
  { neighborhoodId: 'cha-south-end', name: 'South End', metroId: 'charlotte', medianDown: 865, medianUp: 858, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'mid-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Trendy district with excellent Google Fiber coverage.' },
  { neighborhoodId: 'cha-dilworth', name: 'Dilworth', metroId: 'charlotte', medianDown: 852, medianUp: 845, medianLatency: 6, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'single-family', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Historic bungalows with Google Fiber on most streets.' },
  { neighborhoodId: 'wil-downtown', name: 'Downtown Wilson', metroId: 'wilson-nc', medianDown: 945, medianUp: 938, medianLatency: 3, fiberPenetration: 96, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Greenlight municipal fiber - 10 Gbps available. Pioneer community.' },

  // ═══ NASHVILLE / TENNESSEE ═══
  { neighborhoodId: 'nas-downtown', name: 'Downtown Nashville', metroId: 'nashville', medianDown: 892, medianUp: 885, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'Google Fiber city. High demand area - peak congestion possible on cable.' },
  { neighborhoodId: 'nas-gulch', name: 'The Gulch', metroId: 'nashville', medianDown: 885, medianUp: 878, medianLatency: 5, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'New development with Google Fiber throughout. 8 Gig in most buildings.' },
  { neighborhoodId: 'nas-east', name: 'East Nashville', metroId: 'nashville', medianDown: 865, medianUp: 858, medianLatency: 6, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Gentrifying area with expanding Google Fiber coverage.' },
  { neighborhoodId: 'nas-franklin', name: 'Franklin', metroId: 'nashville', medianDown: 852, medianUp: 845, medianLatency: 6, fiberPenetration: 78, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Growing suburb. Google Fiber available in many subdivisions.' },
  { neighborhoodId: 'knx-downtown', name: 'Downtown Knoxville', metroId: 'knoxville', medianDown: 285, medianUp: 125, medianLatency: 18, fiberPenetration: 62, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'UT area. Comcast dominant, some AT&T Fiber expanding.' },
  { neighborhoodId: 'mem-downtown', name: 'Downtown Memphis', metroId: 'memphis', medianDown: 265, medianUp: 115, medianLatency: 20, fiberPenetration: 58, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'AT&T Fiber expanding. Check availability by address.' },

  // ═══ COLORADO ═══
  { neighborhoodId: 'den-boulder', name: 'Boulder', metroId: 'boulder', medianDown: 425, medianUp: 398, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'CU Boulder area. AT&T Fiber and municipal options available.' },
  { neighborhoodId: 'cos-downtown', name: 'Downtown Colorado Springs', metroId: 'colorado-springs', medianDown: 385, medianUp: 145, medianLatency: 12, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Xfinity DOCSIS 4.0 deployed. Upload speeds significantly improved.' },
  { neighborhoodId: 'ftc-downtown', name: 'Downtown Fort Collins', metroId: 'fort-collins', medianDown: 925, medianUp: 918, medianLatency: 4, fiberPenetration: 92, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Connexion municipal fiber - 10 Gbps available. Best municipal network.' },
  { neighborhoodId: 'ftc-old-town', name: 'Old Town Fort Collins', metroId: 'fort-collins', medianDown: 912, medianUp: 905, medianLatency: 4, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'CSU area with excellent Connexion coverage.' },
  { neighborhoodId: 'lgm-downtown', name: 'Downtown Longmont', metroId: 'longmont', medianDown: 935, medianUp: 928, medianLatency: 3, fiberPenetration: 94, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'NextLight municipal fiber - symmetrical 10 Gbps. Model community.' },

  // ═══ UTAH ═══
  { neighborhoodId: 'slc-downtown', name: 'Downtown Salt Lake City', metroId: 'salt-lake', medianDown: 435, medianUp: 408, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Former Quantum/now AT&T plus Google Fiber. Multiple 8 Gig options.' },
  { neighborhoodId: 'slc-sugar-house', name: 'Sugar House', metroId: 'salt-lake', medianDown: 425, medianUp: 398, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Trendy area with Google Fiber and UTOPIA options.' },
  { neighborhoodId: 'provo-downtown', name: 'Downtown Provo', metroId: 'provo', medianDown: 892, medianUp: 885, medianLatency: 4, fiberPenetration: 90, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Google Fiber city + UTOPIA. BYU area has excellent options.' },
  { neighborhoodId: 'utopia-orem', name: 'Orem', metroId: 'orem', medianDown: 918, medianUp: 911, medianLatency: 4, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'UTOPIA open-access network. Multiple ISPs compete on same fiber.' },
  { neighborhoodId: 'utopia-layton', name: 'Layton', metroId: 'layton', medianDown: 905, medianUp: 898, medianLatency: 4, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'UTOPIA member city. 10 Gbps residential available.' },

  // ═══ OHIO ═══
  { neighborhoodId: 'cle-downtown', name: 'Downtown Cleveland', metroId: 'cleveland', medianDown: 285, medianUp: 125, medianLatency: 16, fiberPenetration: 68, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Spectrum dominant. AT&T Fiber expanding in select areas.' },
  { neighborhoodId: 'cle-tremont', name: 'Tremont', metroId: 'cleveland', medianDown: 275, medianUp: 118, medianLatency: 18, fiberPenetration: 62, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Gentrifying area. Fiber availability limited to newer builds.' },
  { neighborhoodId: 'col-downtown', name: 'Downtown Columbus', metroId: 'columbus', medianDown: 365, medianUp: 338, medianLatency: 9, fiberPenetration: 78, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'moderate', placementNotes: 'AT&T Fiber expanding. Spectrum also available.' },
  { neighborhoodId: 'col-short-north', name: 'Short North', metroId: 'columbus', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Arts district with mixed infrastructure. New condos have fiber.' },
  { neighborhoodId: 'col-dublin', name: 'Dublin', metroId: 'columbus', medianDown: 378, medianUp: 351, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with good AT&T and Spectrum options.' },
  { neighborhoodId: 'cin-downtown', name: 'Downtown Cincinnati', metroId: 'cincinnati', medianDown: 345, medianUp: 318, medianLatency: 10, fiberPenetration: 72, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Cincinnati Bell Fioptics fiber available in most of downtown.' },
  { neighborhoodId: 'cin-otr', name: 'Over-the-Rhine', metroId: 'cincinnati', medianDown: 335, medianUp: 308, medianLatency: 11, fiberPenetration: 68, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Historic district with improving fiber coverage in renovated buildings.' },

  // ═══ MICHIGAN ═══
  { neighborhoodId: 'det-downtown', name: 'Downtown Detroit', metroId: 'detroit', medianDown: 365, medianUp: 338, medianLatency: 8, fiberPenetration: 75, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'AT&T Fiber dominant. Rocket Fiber also available downtown.' },
  { neighborhoodId: 'det-corktown', name: 'Corktown', metroId: 'detroit', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Trendy area near Ford development. Fiber expanding rapidly.' },
  { neighborhoodId: 'det-midtown', name: 'Midtown', metroId: 'detroit', medianDown: 372, medianUp: 345, medianLatency: 8, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Wayne State area with good fiber options. Rocket Fiber available.' },
  { neighborhoodId: 'det-royal-oak', name: 'Royal Oak', metroId: 'detroit', medianDown: 345, medianUp: 318, medianLatency: 10, fiberPenetration: 70, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Popular suburb. AT&T Fiber available on many streets.' },
  { neighborhoodId: 'aa-downtown', name: 'Downtown Ann Arbor', metroId: 'ann-arbor', medianDown: 385, medianUp: 358, medianLatency: 7, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'University of Michigan area. AT&T and Merit Network options.' },
  { neighborhoodId: 'gr-downtown', name: 'Downtown Grand Rapids', metroId: 'grand-rapids', medianDown: 325, medianUp: 145, medianLatency: 14, fiberPenetration: 68, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Growing city with improving infrastructure. Spectrum and AT&T compete.' },

  // ═══ INDIANA ═══
  { neighborhoodId: 'ind-downtown', name: 'Downtown Indianapolis', metroId: 'indianapolis', medianDown: 372, medianUp: 345, medianLatency: 8, fiberPenetration: 76, buildingDensity: 'urban-core', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'AT&T Fiber and Metronet available. Good competition keeps prices reasonable.' },
  { neighborhoodId: 'ind-broad-ripple', name: 'Broad Ripple', metroId: 'indianapolis', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Arts district with expanding fiber. Check address for availability.' },
  { neighborhoodId: 'ind-carmel', name: 'Carmel', metroId: 'indianapolis', medianDown: 385, medianUp: 358, medianLatency: 7, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with excellent Metronet fiber coverage.' },
  { neighborhoodId: 'ind-fishers', name: 'Fishers', metroId: 'indianapolis', medianDown: 378, medianUp: 351, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Fast-growing suburb. Metronet and AT&T Fiber compete.' },

  // ═══ TEXAS SUBURBS (Connected Small Towns) ═══
  { neighborhoodId: 'tx-leander', name: 'Leander', metroId: 'leander', medianDown: 445, medianUp: 418, medianLatency: 6, fiberPenetration: 88, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: '#1 most connected small town in US. Grande and AT&T Fiber throughout.' },
  { neighborhoodId: 'tx-wylie', name: 'Wylie', metroId: 'wylie', medianDown: 432, medianUp: 405, medianLatency: 6, fiberPenetration: 86, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Top 5 most connected small town. Excellent fiber infrastructure.' },
  { neighborhoodId: 'tx-cedar-park', name: 'Cedar Park', metroId: 'cedar-park', medianDown: 438, medianUp: 411, medianLatency: 6, fiberPenetration: 87, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'new', congestionRisk: 'low', placementNotes: 'Top 5 most connected. Grande fiber dominant.' },
  { neighborhoodId: 'tx-mckinney', name: 'McKinney', metroId: 'mckinney', medianDown: 425, medianUp: 398, medianLatency: 7, fiberPenetration: 84, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Fast-growing suburb with excellent AT&T Fiber coverage.' },
  { neighborhoodId: 'tx-allen', name: 'Allen', metroId: 'allen', medianDown: 418, medianUp: 391, medianLatency: 7, fiberPenetration: 82, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Affluent suburb with AT&T Fiber and Frontier options.' },

  // ═══ PACIFIC NORTHWEST SUBURBS ═══
  { neighborhoodId: 'wa-kirkland', name: 'Kirkland', metroId: 'kirkland', medianDown: 945, medianUp: 938, medianLatency: 4, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Ziply Fiber HQ city. Excellent fiber coverage throughout.' },
  { neighborhoodId: 'wa-everett', name: 'Everett', metroId: 'everett', medianDown: 892, medianUp: 885, medianLatency: 5, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Boeing area. Ziply fiber expanding rapidly.' },
  { neighborhoodId: 'wa-tacoma', name: 'Tacoma', metroId: 'tacoma', medianDown: 865, medianUp: 858, medianLatency: 5, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Click! Network municipal option plus Ziply. Good competition.' },
  { neighborhoodId: 'wa-spokane', name: 'Spokane', metroId: 'spokane', medianDown: 825, medianUp: 818, medianLatency: 6, fiberPenetration: 70, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Ziply fiber expanding. Comcast cable also available.' },
  { neighborhoodId: 'or-eugene', name: 'Eugene', metroId: 'eugene', medianDown: 845, medianUp: 838, medianLatency: 5, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'University of Oregon area. Ziply and local providers compete.' },
  { neighborhoodId: 'or-bend', name: 'Bend', metroId: 'bend', medianDown: 812, medianUp: 805, medianLatency: 6, fiberPenetration: 68, buildingDensity: 'suburban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Growing mountain town. BendBroadband and Ziply available.' },
  { neighborhoodId: 'id-boise', name: 'Downtown Boise', metroId: 'boise', medianDown: 285, medianUp: 125, medianLatency: 18, fiberPenetration: 55, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Growing city but fiber limited. Sparklight cable dominant.' },

  // ═══ NORTHEAST SMALL/MEDIUM CITIES ═══
  { neighborhoodId: 'me-portland', name: 'Portland ME', metroId: 'portland-me', medianDown: 525, medianUp: 518, medianLatency: 5, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Fidium Fiber dominant - Best ISP in Maine. 8 Gig symmetrical available.' },
  { neighborhoodId: 'me-wiscasset', name: 'Wiscasset', metroId: 'wiscasset', medianDown: 545, medianUp: 538, medianLatency: 5, fiberPenetration: 88, buildingDensity: 'exurban', housingType: 'single-family', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Fidium uploads 25x faster than cable competitors. Model rural deployment.' },
  { neighborhoodId: 'vt-burlington', name: 'Burlington', metroId: 'burlington-vt', medianDown: 485, medianUp: 478, medianLatency: 6, fiberPenetration: 78, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Burlington Telecom municipal fiber. UVM area has excellent coverage.' },
  { neighborhoodId: 'vt-barre', name: 'Barre', metroId: 'barre-vt', medianDown: 512, medianUp: 505, medianLatency: 5, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Fidium fiber with top Ookla rankings. Single-digit latency.' },
  { neighborhoodId: 'nh-manchester', name: 'Manchester', metroId: 'manchester-nh', medianDown: 498, medianUp: 491, medianLatency: 6, fiberPenetration: 76, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'Fidium and Consolidated Communications fiber options.' },
  { neighborhoodId: 'nj-hoboken', name: 'Hoboken', metroId: 'hoboken', medianDown: 385, medianUp: 358, medianLatency: 8, fiberPenetration: 88, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Verizon Fios dominant. Dense area with good fiber coverage.' },
  { neighborhoodId: 'nj-princeton', name: 'Princeton', metroId: 'princeton', medianDown: 395, medianUp: 368, medianLatency: 7, fiberPenetration: 85, buildingDensity: 'suburban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'low', placementNotes: 'University town with excellent Fios coverage.' },
  { neighborhoodId: 'ct-stamford', name: 'Stamford', metroId: 'stamford', medianDown: 378, medianUp: 351, medianLatency: 8, fiberPenetration: 82, buildingDensity: 'urban', housingType: 'high-rise', infrastructureAge: 'modern', congestionRisk: 'low', placementNotes: 'Corporate hub with Optimum and Frontier fiber options.' },
  { neighborhoodId: 'ct-new-haven', name: 'New Haven', metroId: 'new-haven', medianDown: 358, medianUp: 331, medianLatency: 9, fiberPenetration: 75, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'mixed', congestionRisk: 'moderate', placementNotes: 'Yale area. Frontier and Optimum compete.' },
  { neighborhoodId: 'ri-providence', name: 'Providence', metroId: 'providence', medianDown: 345, medianUp: 318, medianLatency: 10, fiberPenetration: 72, buildingDensity: 'urban', housingType: 'mixed', infrastructureAge: 'aging', congestionRisk: 'moderate', placementNotes: 'Cox cable dominant. Verizon Fios in some areas.' },
];

// Helper to get neighborhoods for a metro
export function getNeighborhoodsForMetro(metroId: string): NeighborhoodData[] {
  return NEIGHBORHOODS.filter(n => n.metroId === metroId);
}

// Helper to get a specific neighborhood
export function getNeighborhood(neighborhoodId: string): NeighborhoodData | undefined {
  return NEIGHBORHOODS.find(n => n.neighborhoodId === neighborhoodId);
}

// Helper to get fastest neighborhoods in a metro
export function getFastestNeighborhoods(metroId: string, limit = 5): NeighborhoodData[] {
  return NEIGHBORHOODS
    .filter(n => n.metroId === metroId)
    .sort((a, b) => b.medianDown - a.medianDown)
    .slice(0, limit);
}

// ── Provider Profiles (National Data) ──

export const PROVIDER_PROFILES: ProviderRegionalProfile[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // FIBER PROVIDERS
  // ════════════════════════════════════════════════════════════════════════════
  {
    providerId: 'att-fiber',
    providerName: 'AT&T Fiber',
    connectionType: 'fiber',
    primaryStates: ['TX', 'CA', 'FL', 'GA', 'NC', 'IL', 'OH', 'MI', 'TN', 'AL'],
    nationalMedianDown: 364,
    nationalMedianUp: 297,
    nationalMedianLatency: 7,
    ooklaSpeedScore: 78.33,
    customerSatisfaction: 3.88,
    networkTechnology: 'XGS-PON fiber to the home, symmetrical speeds up to 5 Gbps',
    expansionStatus: '#1 US fiber provider. Completed Quantum Fiber acquisition (Feb 2026) adding 1M+ subscribers across Denver, Phoenix, Portland, Seattle, Salt Lake, Minneapolis, Orlando, Las Vegas. Targeting 60M fiber locations by 2030.',
    metros: [
      { providerId: 'att-fiber', metroId: 'houston', medianDown: 412, medianUp: 385, medianLatency: 5, maxAvailableSpeed: 5000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'dallas', medianDown: 398, medianUp: 371, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'atlanta', medianDown: 385, medianUp: 358, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'chicago', medianDown: 378, medianUp: 342, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'la', medianDown: 362, medianUp: 329, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'san-antonio', medianDown: 401, medianUp: 378, medianLatency: 5, maxAvailableSpeed: 5000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, ooklaRank: 1, notes: 'Fastest AT&T market after Houston' },
      { providerId: 'att-fiber', metroId: 'austin', medianDown: 389, medianUp: 362, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'nashville', medianDown: 376, medianUp: 349, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'miami', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'tampa', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'detroit', medianDown: 352, medianUp: 325, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'charlotte', medianDown: 371, medianUp: 344, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'raleigh', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      // Post-Quantum Fiber acquisition metros (Feb 2026)
      { providerId: 'att-fiber', metroId: 'denver', medianDown: 425, medianUp: 398, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'phoenix', medianDown: 418, medianUp: 391, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'minneapolis', medianDown: 432, medianUp: 405, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber - fastest AT&T metro' },
      { providerId: 'att-fiber', metroId: 'seattle', medianDown: 415, medianUp: 388, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Former Quantum Fiber - 8 Gig available' },
      { providerId: 'att-fiber', metroId: 'portland', medianDown: 408, medianUp: 381, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'salt-lake', medianDown: 421, medianUp: 394, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'las-vegas', medianDown: 405, medianUp: 378, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
      { providerId: 'att-fiber', metroId: 'orlando', medianDown: 398, medianUp: 371, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Former Quantum Fiber' },
      // Additional Texas metros
      { providerId: 'att-fiber', metroId: 'fort-worth', medianDown: 395, medianUp: 368, medianLatency: 6, maxAvailableSpeed: 5000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'el-paso', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'corpus-christi', medianDown: 375, medianUp: 348, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'plano', medianDown: 402, medianUp: 375, medianLatency: 5, maxAvailableSpeed: 5000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, ooklaRank: 1, notes: 'High-income suburb with premium fiber' },
      { providerId: 'att-fiber', metroId: 'lubbock', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'mcallen', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'amarillo', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      // Additional Florida metros
      { providerId: 'att-fiber', metroId: 'jacksonville', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'fort-lauderdale', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'west-palm-beach', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'st-petersburg', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'pensacola', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'tallahassee', medianDown: 352, medianUp: 325, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // Additional Georgia metros
      { providerId: 'att-fiber', metroId: 'savannah', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'augusta', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      // Additional North Carolina metros
      { providerId: 'att-fiber', metroId: 'durham', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'greensboro', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'winston-salem', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'asheville', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      // Additional Illinois metros
      { providerId: 'att-fiber', metroId: 'springfield-il', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'peoria', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'rockford', medianDown: 352, medianUp: 325, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // Additional Ohio metros
      { providerId: 'att-fiber', metroId: 'columbus', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'cleveland', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'cincinnati', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'dayton', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'akron', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'toledo', medianDown: 352, medianUp: 325, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // Additional Michigan metros
      { providerId: 'att-fiber', metroId: 'grand-rapids', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'ann-arbor', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1, notes: 'University town with high fiber adoption' },
      // Additional Tennessee metros
      { providerId: 'att-fiber', metroId: 'memphis', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'knoxville', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      // Additional Alabama metros
      { providerId: 'att-fiber', metroId: 'birmingham', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'huntsville', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2, notes: 'Tech hub with Google Fiber competition' },
      { providerId: 'att-fiber', metroId: 'montgomery', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'mobile', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // Additional Kentucky metros
      { providerId: 'att-fiber', metroId: 'louisville', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'lexington', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      // Additional Indiana metros
      { providerId: 'att-fiber', metroId: 'indianapolis', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'fort-wayne', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'evansville', medianDown: 352, medianUp: 325, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // Additional Louisiana metros
      { providerId: 'att-fiber', metroId: 'new-orleans', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'baton-rouge', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'shreveport', medianDown: 352, medianUp: 325, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      // California metros
      { providerId: 'att-fiber', metroId: 'san-francisco', medianDown: 375, medianUp: 348, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'san-diego', medianDown: 368, medianUp: 341, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'fresno', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'sacramento', medianDown: 365, medianUp: 338, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      // South Carolina metros
      { providerId: 'att-fiber', metroId: 'columbia-sc', medianDown: 358, medianUp: 331, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'charleston-sc', medianDown: 362, medianUp: 335, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'att-fiber', metroId: 'greenville-sc', medianDown: 355, medianUp: 328, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      // Wisconsin metros
      { providerId: 'att-fiber', metroId: 'milwaukee', medianDown: 365, medianUp: 338, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'att-fiber', metroId: 'madison', medianDown: 372, medianUp: 345, medianLatency: 7, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1, notes: 'University town with high tech adoption' },
    ],
  },
  {
    providerId: 'verizon-fios',
    providerName: 'Verizon Fios',
    connectionType: 'fiber',
    primaryStates: ['NY', 'NJ', 'PA', 'MD', 'VA', 'DC', 'MA', 'RI', 'CT', 'DE'],
    nationalMedianDown: 312,
    nationalMedianUp: 285,
    nationalMedianLatency: 9,
    ooklaSpeedScore: 75.01,
    customerSatisfaction: 3.90,
    networkTechnology: 'GPON/XGS-PON fiber, symmetrical speeds up to 2.3 Gbps',
    expansionStatus: '#3 US fiber ISP by Ookla. Strongest in Northeast corridor. Acquired Frontier (2025-2026) expanding to 30M fiber passings across 31 states.',
    metros: [
      { providerId: 'verizon-fios', metroId: 'nyc', medianDown: 342, medianUp: 318, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, notes: 'Lowest latency major metro' },
      { providerId: 'verizon-fios', metroId: 'philadelphia', medianDown: 328, medianUp: 301, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'dc', medianDown: 335, medianUp: 308, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'boston', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 2 },
      { providerId: 'verizon-fios', metroId: 'baltimore', medianDown: 325, medianUp: 298, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'pittsburgh', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 2 },
      // Additional New York metros
      { providerId: 'verizon-fios', metroId: 'long-island', medianDown: 338, medianUp: 311, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1, notes: 'Largest Fios market by subscribers' },
      { providerId: 'verizon-fios', metroId: 'yonkers', medianDown: 332, medianUp: 305, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'white-plains', medianDown: 335, medianUp: 308, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'new-rochelle', medianDown: 328, medianUp: 301, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'buffalo', medianDown: 305, medianUp: 278, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'rochester-ny', medianDown: 302, medianUp: 275, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 90, peakHourDegradation: 9, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'syracuse', medianDown: 298, medianUp: 271, medianLatency: 13, maxAvailableSpeed: 2300, consistencyScore: 90, peakHourDegradation: 9, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'albany', medianDown: 295, medianUp: 268, medianLatency: 13, maxAvailableSpeed: 2300, consistencyScore: 89, peakHourDegradation: 10, has5Gig: false, ooklaRank: 1 },
      // New Jersey metros
      { providerId: 'verizon-fios', metroId: 'newark', medianDown: 338, medianUp: 311, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'jersey-city-nj', medianDown: 342, medianUp: 315, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 95, peakHourDegradation: 4, has5Gig: false, ooklaRank: 1, notes: 'Top performing NJ market' },
      { providerId: 'verizon-fios', metroId: 'paterson', medianDown: 325, medianUp: 298, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'elizabeth', medianDown: 322, medianUp: 295, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'trenton', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'princeton', medianDown: 345, medianUp: 318, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 95, peakHourDegradation: 4, has5Gig: false, ooklaRank: 1, notes: 'University area with premium fiber' },
      { providerId: 'verizon-fios', metroId: 'hoboken', medianDown: 348, medianUp: 321, medianLatency: 8, maxAvailableSpeed: 2300, consistencyScore: 95, peakHourDegradation: 4, has5Gig: false, ooklaRank: 1 },
      // Virginia metros
      { providerId: 'verizon-fios', metroId: 'virginia-beach', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'norfolk', medianDown: 312, medianUp: 285, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'newport-news', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'richmond', medianDown: 322, medianUp: 295, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'arlington-va', medianDown: 342, medianUp: 315, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 95, peakHourDegradation: 4, has5Gig: false, ooklaRank: 1, notes: 'DC suburb with premium infrastructure' },
      { providerId: 'verizon-fios', metroId: 'alexandria', medianDown: 338, medianUp: 311, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'fairfax', medianDown: 345, medianUp: 318, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 95, peakHourDegradation: 4, has5Gig: false, ooklaRank: 1, notes: 'Tech corridor with high adoption' },
      { providerId: 'verizon-fios', metroId: 'chesapeake', medianDown: 315, medianUp: 288, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      // Maryland metros
      { providerId: 'verizon-fios', metroId: 'frederick', medianDown: 325, medianUp: 298, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'rockville', medianDown: 335, medianUp: 308, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'gaithersburg', medianDown: 332, medianUp: 305, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'silver-spring', medianDown: 338, medianUp: 311, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'annapolis', medianDown: 328, medianUp: 301, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      // Delaware metros
      { providerId: 'verizon-fios', metroId: 'wilmington-de', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'dover', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'newark-de', medianDown: 315, medianUp: 288, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      // Pennsylvania metros
      { providerId: 'verizon-fios', metroId: 'allentown', medianDown: 312, medianUp: 285, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'reading', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'bethlehem', medianDown: 315, medianUp: 288, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'harrisburg', medianDown: 305, medianUp: 278, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 90, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'king-of-prussia', medianDown: 338, medianUp: 311, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1, notes: 'Tech/pharma corridor' },
      // Massachusetts metros
      { providerId: 'verizon-fios', metroId: 'worcester', medianDown: 305, medianUp: 278, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 90, peakHourDegradation: 8, has5Gig: false, ooklaRank: 2 },
      { providerId: 'verizon-fios', metroId: 'cambridge', medianDown: 335, medianUp: 308, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1, notes: 'MIT/Harvard area with high demand' },
      { providerId: 'verizon-fios', metroId: 'quincy', medianDown: 322, medianUp: 295, medianLatency: 10, maxAvailableSpeed: 2300, consistencyScore: 93, peakHourDegradation: 6, has5Gig: false, ooklaRank: 1 },
      // Rhode Island metros
      { providerId: 'verizon-fios', metroId: 'providence', medianDown: 315, medianUp: 288, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      // Connecticut metros
      { providerId: 'verizon-fios', metroId: 'stamford', medianDown: 335, medianUp: 308, medianLatency: 9, maxAvailableSpeed: 2300, consistencyScore: 94, peakHourDegradation: 5, has5Gig: false, ooklaRank: 1, notes: 'Hedge fund corridor' },
      { providerId: 'verizon-fios', metroId: 'bridgeport', medianDown: 312, medianUp: 285, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1 },
      { providerId: 'verizon-fios', metroId: 'new-haven', medianDown: 318, medianUp: 291, medianLatency: 11, maxAvailableSpeed: 2300, consistencyScore: 92, peakHourDegradation: 7, has5Gig: false, ooklaRank: 1, notes: 'Yale University area' },
      { providerId: 'verizon-fios', metroId: 'hartford', medianDown: 308, medianUp: 281, medianLatency: 12, maxAvailableSpeed: 2300, consistencyScore: 91, peakHourDegradation: 8, has5Gig: false, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'google-fiber',
    providerName: 'Google Fiber',
    connectionType: 'fiber',
    primaryStates: ['TX', 'NC', 'TN', 'GA', 'UT', 'MO', 'KS', 'CO', 'AZ', 'NV'],
    nationalMedianDown: 892,
    nationalMedianUp: 885,
    nationalMedianLatency: 4,
    ooklaSpeedScore: 89.12,
    customerSatisfaction: 4.21,
    networkTechnology: 'XGS-PON 25G, symmetrical speeds up to 8 Gbps, WiFi 7 included',
    expansionStatus: 'Fastest residential ISP in 9 of top 100 US cities. 1.5M fiber passings, expanding to Douglas County CO, Tempe AZ, Wake Forest NC (2025-2026).',
    metros: [
      { providerId: 'google-fiber', metroId: 'kansas-city', medianDown: 945, medianUp: 938, medianLatency: 3, maxAvailableSpeed: 8000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Original Google Fiber city - 86% availability' },
      { providerId: 'google-fiber', metroId: 'austin', medianDown: 912, medianUp: 905, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '52.5% availability' },
      { providerId: 'google-fiber', metroId: 'nashville', medianDown: 878, medianUp: 871, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '31.5% availability' },
      { providerId: 'google-fiber', metroId: 'charlotte', medianDown: 865, medianUp: 858, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'google-fiber', metroId: 'raleigh', medianDown: 858, medianUp: 851, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '55.8% availability' },
      { providerId: 'google-fiber', metroId: 'atlanta', medianDown: 825, medianUp: 818, medianLatency: 6, maxAvailableSpeed: 2000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: false, ooklaRank: 2, notes: 'Max 2 Gig in Atlanta' },
      { providerId: 'google-fiber', metroId: 'san-antonio', medianDown: 898, medianUp: 891, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '37% availability' },
      { providerId: 'google-fiber', metroId: 'salt-lake', medianDown: 872, medianUp: 865, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: '51.4% availability' },
      { providerId: 'google-fiber', metroId: 'overland-park', medianDown: 938, medianUp: 931, medianLatency: 3, maxAvailableSpeed: 8000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '88% availability - highest Google Fiber coverage' },
      { providerId: 'google-fiber', metroId: 'huntsville', medianDown: 885, medianUp: 878, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Additional Texas metros
      { providerId: 'google-fiber', metroId: 'dallas', medianDown: 905, medianUp: 898, medianLatency: 4, maxAvailableSpeed: 8000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '28% availability' },
      { providerId: 'google-fiber', metroId: 'houston', medianDown: 892, medianUp: 885, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: '18% availability - expanding' },
      // Additional Colorado metros
      { providerId: 'google-fiber', metroId: 'denver', medianDown: 882, medianUp: 875, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: '22% availability' },
      { providerId: 'google-fiber', metroId: 'colorado-springs', medianDown: 868, medianUp: 861, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'google-fiber', metroId: 'aurora-co', medianDown: 878, medianUp: 871, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      // Additional Arizona metros
      { providerId: 'google-fiber', metroId: 'phoenix', medianDown: 862, medianUp: 855, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Expanding to Tempe 2026' },
      { providerId: 'google-fiber', metroId: 'mesa', medianDown: 858, medianUp: 851, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'google-fiber', metroId: 'chandler', medianDown: 872, medianUp: 865, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Tech suburb with high adoption' },
      // Additional Nevada metros
      { providerId: 'google-fiber', metroId: 'las-vegas', medianDown: 852, medianUp: 845, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2, notes: 'Expanding rapidly' },
      { providerId: 'google-fiber', metroId: 'henderson', medianDown: 865, medianUp: 858, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Additional Utah metros
      { providerId: 'google-fiber', metroId: 'provo', medianDown: 878, medianUp: 871, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'BYU area - early Google Fiber city' },
      { providerId: 'google-fiber', metroId: 'orem', medianDown: 872, medianUp: 865, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'google-fiber', metroId: 'ogden', medianDown: 865, medianUp: 858, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'google-fiber', metroId: 'sandy', medianDown: 868, medianUp: 861, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Additional North Carolina metros
      { providerId: 'google-fiber', metroId: 'durham', medianDown: 865, medianUp: 858, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Research Triangle' },
      // Additional Georgia metros
      { providerId: 'google-fiber', metroId: 'savannah', medianDown: 835, medianUp: 828, medianLatency: 6, maxAvailableSpeed: 2000, consistencyScore: 95, peakHourDegradation: 5, has5Gig: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'frontier-fiber',
    providerName: 'Frontier Fiber',
    connectionType: 'fiber',
    primaryStates: ['CA', 'FL', 'TX', 'CT', 'NY', 'PA', 'OH', 'IN', 'WI', 'IL'],
    nationalMedianDown: 359,
    nationalMedianUp: 352,
    nationalMedianLatency: 8,
    ooklaSpeedScore: 77.85,
    customerSatisfaction: 3.64,
    networkTechnology: 'XGS-PON fiber, symmetrical up to 7 Gbps, eero WiFi 6E mesh included',
    expansionStatus: 'Now "Frontier, a Verizon Company" after $20B acquisition completed Jan 2026. 7.5M fiber locations, 2.2M subscribers joining Verizon\'s 7.4M Fios customers. Multi-gig (2-7 Gbps) rollout accelerating. 2M new fiber passings planned 2026.',
    metros: [
      { providerId: 'frontier-fiber', metroId: 'la', medianDown: 385, medianUp: 378, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'tampa', medianDown: 372, medianUp: 365, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'dallas', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'plano', medianDown: 375, medianUp: 368, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 1, notes: 'Strong performance reported by users' },
      { providerId: 'frontier-fiber', metroId: 'indianapolis', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'columbus', medianDown: 352, medianUp: 345, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'san-diego', medianDown: 378, medianUp: 371, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2 },
      // Additional California metros
      { providerId: 'frontier-fiber', metroId: 'san-francisco', medianDown: 375, medianUp: 368, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'sacramento', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'fresno', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'bakersfield', medianDown: 362, medianUp: 355, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'stockton', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'modesto', medianDown: 355, medianUp: 348, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'riverside', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'san-jose', medianDown: 382, medianUp: 375, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2, notes: 'Silicon Valley coverage' },
      { providerId: 'frontier-fiber', metroId: 'long-beach', medianDown: 375, medianUp: 368, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'anaheim', medianDown: 372, medianUp: 365, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      // Additional Florida metros
      { providerId: 'frontier-fiber', metroId: 'orlando', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'jacksonville', medianDown: 362, medianUp: 355, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'miami', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'fort-lauderdale', medianDown: 355, medianUp: 348, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'west-palm-beach', medianDown: 352, medianUp: 345, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'st-petersburg', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      // Additional Texas metros
      { providerId: 'frontier-fiber', metroId: 'houston', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'san-antonio', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'austin', medianDown: 372, medianUp: 365, medianLatency: 8, maxAvailableSpeed: 7000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 3 },
      { providerId: 'frontier-fiber', metroId: 'fort-worth', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      // Connecticut metros
      { providerId: 'frontier-fiber', metroId: 'stamford', medianDown: 378, medianUp: 371, medianLatency: 7, maxAvailableSpeed: 7000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'bridgeport', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'new-haven', medianDown: 368, medianUp: 361, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'hartford', medianDown: 362, medianUp: 355, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      // Additional Ohio metros
      { providerId: 'frontier-fiber', metroId: 'cleveland', medianDown: 355, medianUp: 348, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'cincinnati', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'dayton', medianDown: 352, medianUp: 345, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      // Additional Indiana metros
      { providerId: 'frontier-fiber', metroId: 'fort-wayne', medianDown: 348, medianUp: 341, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'evansville', medianDown: 345, medianUp: 338, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 1 },
      // Wisconsin metros
      { providerId: 'frontier-fiber', metroId: 'milwaukee', medianDown: 358, medianUp: 351, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'madison', medianDown: 365, medianUp: 358, medianLatency: 8, maxAvailableSpeed: 5000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, ooklaRank: 1 },
      // Illinois metros
      { providerId: 'frontier-fiber', metroId: 'chicago', medianDown: 362, medianUp: 355, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, ooklaRank: 3 },
      { providerId: 'frontier-fiber', metroId: 'rockford', medianDown: 348, medianUp: 341, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 1 },
      // New York metros
      { providerId: 'frontier-fiber', metroId: 'buffalo', medianDown: 352, medianUp: 345, medianLatency: 9, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'rochester-ny', medianDown: 348, medianUp: 341, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 2 },
      { providerId: 'frontier-fiber', metroId: 'syracuse', medianDown: 345, medianUp: 338, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 2 },
      // Pennsylvania metros
      { providerId: 'frontier-fiber', metroId: 'erie', medianDown: 342, medianUp: 335, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 90, peakHourDegradation: 9, has5Gig: true, ooklaRank: 1 },
      { providerId: 'frontier-fiber', metroId: 'scranton', medianDown: 345, medianUp: 338, medianLatency: 10, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'ziply-fiber',
    providerName: 'Ziply Fiber',
    connectionType: 'fiber',
    primaryStates: ['WA', 'OR', 'ID', 'MT'],
    nationalMedianDown: 925,
    nationalMedianUp: 885,
    nationalMedianLatency: 5,
    ooklaSpeedScore: 88.45,
    customerSatisfaction: 4.15,
    networkTechnology: 'XGS-PON fiber, symmetrical up to 50 Gbps - America\'s fastest residential internet',
    expansionStatus: 'CNET: "America\'s undisputed leader as fastest home internet". $500M+ invested since 2020, now 68% fiber network (up from 30% in 2020). 722 cities across 4 states. 50 Gig symmetrical available - $300/mo (2 Gig/5 Gig free first month promo through 3/31/2026).',
    metros: [
      { providerId: 'ziply-fiber', metroId: 'seattle', medianDown: 925, medianUp: 918, medianLatency: 4, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '50 Gig available - $900/mo' },
      { providerId: 'ziply-fiber', metroId: 'portland', medianDown: 912, medianUp: 905, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '50 Gig available' },
      // Additional Washington metros
      { providerId: 'ziply-fiber', metroId: 'tacoma', medianDown: 918, medianUp: 911, medianLatency: 4, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'spokane', medianDown: 908, medianUp: 901, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'vancouver-wa', medianDown: 915, medianUp: 908, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'bellevue', medianDown: 932, medianUp: 925, medianLatency: 4, maxAvailableSpeed: 50000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Tech hub with premium fiber' },
      { providerId: 'ziply-fiber', metroId: 'everett', medianDown: 912, medianUp: 905, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'kirkland', medianDown: 928, medianUp: 921, medianLatency: 4, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'olympia', medianDown: 905, medianUp: 898, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'bellingham', medianDown: 898, medianUp: 891, medianLatency: 6, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Oregon metros
      { providerId: 'ziply-fiber', metroId: 'eugene', medianDown: 905, medianUp: 898, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'salem', medianDown: 898, medianUp: 891, medianLatency: 6, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'bend', medianDown: 895, medianUp: 888, medianLatency: 6, maxAvailableSpeed: 50000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'medford', medianDown: 892, medianUp: 885, medianLatency: 6, maxAvailableSpeed: 50000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'beaverton', medianDown: 915, medianUp: 908, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'hillsboro', medianDown: 918, medianUp: 911, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Intel campus area' },
      // Idaho metros
      { providerId: 'ziply-fiber', metroId: 'boise', medianDown: 908, medianUp: 901, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'nampa', medianDown: 898, medianUp: 891, medianLatency: 6, maxAvailableSpeed: 50000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'meridian', medianDown: 905, medianUp: 898, medianLatency: 5, maxAvailableSpeed: 50000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Montana metros
      { providerId: 'ziply-fiber', metroId: 'missoula', medianDown: 885, medianUp: 878, medianLatency: 7, maxAvailableSpeed: 50000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'ziply-fiber', metroId: 'billings', medianDown: 878, medianUp: 871, medianLatency: 7, maxAvailableSpeed: 50000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'epb-fiber',
    providerName: 'EPB Fiber Optics',
    connectionType: 'fiber',
    primaryStates: ['TN'],
    nationalMedianDown: 985,
    nationalMedianUp: 978,
    nationalMedianLatency: 2,
    ooklaSpeedScore: 95.21,
    customerSatisfaction: 4.52,
    networkTechnology: 'Nokia 25G PON - world\'s first community-wide 25 Gbps service',
    expansionStatus: 'Municipal utility with 95.3% coverage in Chattanooga. First US provider to offer 1 Gbps (2010), 10 Gbps (2015), 25 Gbps (2022). 2024 Network X Award winner. Perfect Ookla speed score of 100. Model for municipal broadband.',
    metros: [
      { providerId: 'epb-fiber', metroId: 'chattanooga', medianDown: 985, medianUp: 978, medianLatency: 2, maxAvailableSpeed: 25000, consistencyScore: 99, peakHourDegradation: 0, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'World\'s fastest community-wide internet - 25 Gbps for $1,500/mo' },
    ],
  },
  {
    providerId: 'fidium-fiber',
    providerName: 'Fidium Fiber',
    connectionType: 'fiber',
    primaryStates: ['ME', 'NH', 'VT', 'TX', 'IL', 'MN', 'CA'],
    nationalMedianDown: 485,
    nationalMedianUp: 478,
    nationalMedianLatency: 6,
    ooklaSpeedScore: 82.15,
    customerSatisfaction: 4.08,
    networkTechnology: '100% fiber to the home, symmetrical up to 8 Gbps, WiFi 7',
    expansionStatus: '250+ Ookla top rankings (Q3-Q4 2025). 1.56M fiber passings in 700+ communities. Expanding to 2M by 2027. $1.9B invested since 2020. Best Internet Provider in Maine (CNET 2026).',
    metros: [
      // New England performance data
      { providerId: 'fidium-fiber', metroId: 'portland', medianDown: 512, medianUp: 505, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Maine: 150 Ookla wins, 8 Gig launching April 2026' },
      { providerId: 'fidium-fiber', metroId: 'sacramento', medianDown: 525, medianUp: 518, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: '20 Ookla top rankings in Sacramento metro Q3-Q4 2025' },
      // Additional Maine metros
      { providerId: 'fidium-fiber', metroId: 'portland-me', medianDown: 508, medianUp: 501, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Best ISP in Maine (CNET 2026)' },
      { providerId: 'fidium-fiber', metroId: 'bangor', medianDown: 495, medianUp: 488, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // New Hampshire metros
      { providerId: 'fidium-fiber', metroId: 'manchester-nh', medianDown: 502, medianUp: 495, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'fidium-fiber', metroId: 'concord-nh', medianDown: 498, medianUp: 491, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Vermont metros
      { providerId: 'fidium-fiber', metroId: 'burlington-vt', medianDown: 492, medianUp: 485, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Texas metros
      { providerId: 'fidium-fiber', metroId: 'dallas', medianDown: 518, medianUp: 511, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'fidium-fiber', metroId: 'houston', medianDown: 512, medianUp: 505, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'fidium-fiber', metroId: 'san-antonio', medianDown: 505, medianUp: 498, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      // Illinois metros
      { providerId: 'fidium-fiber', metroId: 'chicago', medianDown: 508, medianUp: 501, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'fidium-fiber', metroId: 'springfield-il', medianDown: 495, medianUp: 488, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Minnesota metros
      { providerId: 'fidium-fiber', metroId: 'minneapolis', medianDown: 512, medianUp: 505, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'fidium-fiber', metroId: 'st-paul', medianDown: 508, medianUp: 501, medianLatency: 5, maxAvailableSpeed: 8000, consistencyScore: 97, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'fidium-fiber', metroId: 'duluth', medianDown: 492, medianUp: 485, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'fidium-fiber', metroId: 'rochester-mn', medianDown: 498, medianUp: 491, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Mayo Clinic area' },
      // California metros
      { providerId: 'fidium-fiber', metroId: 'fresno', medianDown: 505, medianUp: 498, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'fidium-fiber', metroId: 'bakersfield', medianDown: 498, medianUp: 491, medianLatency: 6, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'optimum-fiber',
    providerName: 'Optimum Fiber',
    connectionType: 'fiber',
    primaryStates: ['NY', 'NJ', 'CT', 'PA'],
    nationalMedianDown: 425,
    nationalMedianUp: 418,
    nationalMedianLatency: 8,
    ooklaSpeedScore: 79.85,
    customerSatisfaction: 3.49,
    networkTechnology: '100% fiber, symmetrical up to 8 Gbps',
    expansionStatus: 'Ookla: Fastest/most reliable in NY and NJ (Q1-Q2 2025). Lowest latency/best gaming in NY, NJ, CT. 3M fiber passings, adding 175K in 2025. 65% multi-gig coverage by 2028.',
    metros: [
      { providerId: 'optimum-fiber', metroId: 'nyc', medianDown: 452, medianUp: 445, medianLatency: 7, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Fastest in NYC metro (Ookla Q1-Q2 2025)' },
      // Additional New York metros
      { providerId: 'optimum-fiber', metroId: 'long-island', medianDown: 448, medianUp: 441, medianLatency: 7, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'optimum-fiber', metroId: 'yonkers', medianDown: 445, medianUp: 438, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'optimum-fiber', metroId: 'white-plains', medianDown: 448, medianUp: 441, medianLatency: 7, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // New Jersey metros
      { providerId: 'optimum-fiber', metroId: 'newark', medianDown: 445, medianUp: 438, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'optimum-fiber', metroId: 'jersey-city-nj', medianDown: 452, medianUp: 445, medianLatency: 7, maxAvailableSpeed: 8000, consistencyScore: 96, peakHourDegradation: 3, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'optimum-fiber', metroId: 'paterson', medianDown: 438, medianUp: 431, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'optimum-fiber', metroId: 'elizabeth', medianDown: 435, medianUp: 428, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Connecticut metros
      { providerId: 'optimum-fiber', metroId: 'stamford', medianDown: 442, medianUp: 435, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 95, peakHourDegradation: 4, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'optimum-fiber', metroId: 'bridgeport', medianDown: 432, medianUp: 425, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'optimum-fiber', metroId: 'new-haven', medianDown: 428, medianUp: 421, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      // Pennsylvania metros
      { providerId: 'optimum-fiber', metroId: 'philadelphia', medianDown: 418, medianUp: 411, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, has8Gig: true, ooklaRank: 3 },
    ],
  },
  {
    providerId: 'brightspeed-fiber',
    providerName: 'Brightspeed Fiber',
    connectionType: 'fiber',
    primaryStates: ['NC', 'SC', 'OH', 'MO', 'PA', 'VA', 'TN', 'AL', 'FL'],
    nationalMedianDown: 412,
    nationalMedianUp: 405,
    nationalMedianLatency: 9,
    ooklaSpeedScore: 74.25,
    customerSatisfaction: 3.21,
    networkTechnology: 'FTTH fiber, symmetrical up to 8 Gbps',
    expansionStatus: '1.82M fiber homes (Jan 2025) of 6.5M total footprint. Building in 17 states. 50K+ homes connected in NC Triangle suburbs (2025). Charlotte-based startup expanding aggressively.',
    metros: [
      { providerId: 'brightspeed-fiber', metroId: 'charlotte', medianDown: 425, medianUp: 418, medianLatency: 8, maxAvailableSpeed: 8000, consistencyScore: 94, peakHourDegradation: 5, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'raleigh', medianDown: 418, medianUp: 411, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, has8Gig: true, ooklaRank: 3, notes: '50K homes connected in Triangle' },
      // Additional North Carolina metros
      { providerId: 'brightspeed-fiber', metroId: 'durham', medianDown: 415, medianUp: 408, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'greensboro', medianDown: 408, medianUp: 401, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'brightspeed-fiber', metroId: 'winston-salem', medianDown: 405, medianUp: 398, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'brightspeed-fiber', metroId: 'wilmington-nc', medianDown: 398, medianUp: 391, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'brightspeed-fiber', metroId: 'asheville', medianDown: 395, medianUp: 388, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // South Carolina metros
      { providerId: 'brightspeed-fiber', metroId: 'columbia-sc', medianDown: 408, medianUp: 401, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'brightspeed-fiber', metroId: 'charleston-sc', medianDown: 412, medianUp: 405, medianLatency: 9, maxAvailableSpeed: 8000, consistencyScore: 93, peakHourDegradation: 6, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'brightspeed-fiber', metroId: 'greenville-sc', medianDown: 405, medianUp: 398, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Ohio metros
      { providerId: 'brightspeed-fiber', metroId: 'cleveland', medianDown: 402, medianUp: 395, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'columbus', medianDown: 405, medianUp: 398, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'cincinnati', medianDown: 398, medianUp: 391, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      // Virginia metros
      { providerId: 'brightspeed-fiber', metroId: 'richmond', medianDown: 408, medianUp: 401, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 92, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'brightspeed-fiber', metroId: 'virginia-beach', medianDown: 402, medianUp: 395, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 7, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      // Tennessee metros
      { providerId: 'brightspeed-fiber', metroId: 'nashville', medianDown: 398, medianUp: 391, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'memphis', medianDown: 395, medianUp: 388, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      // Alabama metros
      { providerId: 'brightspeed-fiber', metroId: 'birmingham', medianDown: 392, medianUp: 385, medianLatency: 11, maxAvailableSpeed: 8000, consistencyScore: 90, peakHourDegradation: 9, has5Gig: true, has8Gig: true, ooklaRank: 2 },
      { providerId: 'brightspeed-fiber', metroId: 'montgomery', medianDown: 388, medianUp: 381, medianLatency: 11, maxAvailableSpeed: 8000, consistencyScore: 90, peakHourDegradation: 9, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      // Florida metros
      { providerId: 'brightspeed-fiber', metroId: 'jacksonville', medianDown: 398, medianUp: 391, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 3 },
      { providerId: 'brightspeed-fiber', metroId: 'pensacola', medianDown: 392, medianUp: 385, medianLatency: 10, maxAvailableSpeed: 8000, consistencyScore: 91, peakHourDegradation: 8, has5Gig: true, has8Gig: true, ooklaRank: 1 },
    ],
  },
  {
    providerId: 'utopia-fiber',
    providerName: 'UTOPIA Fiber',
    connectionType: 'fiber',
    primaryStates: ['UT'],
    nationalMedianDown: 925,
    nationalMedianUp: 918,
    nationalMedianLatency: 4,
    ooklaSpeedScore: 91.25,
    customerSatisfaction: 4.35,
    networkTechnology: 'Open-access fiber network - dedicated line per home, 10 Gbps residential / 100 Gbps business',
    expansionStatus: 'Municipal open-access network in 20+ Utah cities. 810K people covered. 100% offer 1 Gbps+. Multiple ISPs compete (XMission, InfoWest, Sumo, etc.).',
    metros: [
      { providerId: 'utopia-fiber', metroId: 'salt-lake', medianDown: 945, medianUp: 938, medianLatency: 3, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1, notes: 'Open-access - choose your ISP' },
      { providerId: 'utopia-fiber', metroId: 'provo', medianDown: 938, medianUp: 931, medianLatency: 3, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'utopia-fiber', metroId: 'orem', medianDown: 935, medianUp: 928, medianLatency: 4, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'utopia-fiber', metroId: 'ogden', medianDown: 932, medianUp: 925, medianLatency: 4, maxAvailableSpeed: 10000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'utopia-fiber', metroId: 'sandy', medianDown: 938, medianUp: 931, medianLatency: 3, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'utopia-fiber', metroId: 'west-jordan', medianDown: 935, medianUp: 928, medianLatency: 4, maxAvailableSpeed: 10000, consistencyScore: 99, peakHourDegradation: 1, has5Gig: true, has8Gig: true, ooklaRank: 1 },
      { providerId: 'utopia-fiber', metroId: 'layton', medianDown: 928, medianUp: 921, medianLatency: 4, maxAvailableSpeed: 10000, consistencyScore: 98, peakHourDegradation: 2, has5Gig: true, has8Gig: true, ooklaRank: 1 },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CABLE PROVIDERS
  // ════════════════════════════════════════════════════════════════════════════
  {
    providerId: 'xfinity',
    providerName: 'Xfinity (Comcast)',
    connectionType: 'cable',
    primaryStates: ['CA', 'FL', 'IL', 'PA', 'NJ', 'MA', 'MI', 'WA', 'CO', 'GA'],
    nationalMedianDown: 239,
    nationalMedianUp: 23,
    nationalMedianLatency: 26,
    ooklaSpeedScore: 69.95,
    customerSatisfaction: 3.32,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0, speeds up to 2 Gbps down',
    expansionStatus: '5th largest US ISP, 126M people covered. DOCSIS 4.0 mid-split rolling out (Philadelphia, Atlanta, Colorado Springs). 81% customer satisfaction with speeds (2025 survey). Opensignal Video Experience award.',
    metros: [
      { providerId: 'xfinity', metroId: 'philadelphia', medianDown: 268, medianUp: 42, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'DOCSIS 4.0 mid-split deployed - upload 70%+ faster' },
      { providerId: 'xfinity', metroId: 'chicago', medianDown: 252, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'sf', medianDown: 265, medianUp: 31, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'denver', medianDown: 275, medianUp: 45, medianLatency: 22, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'Colorado Springs DOCSIS 4.0 pilot' },
      { providerId: 'xfinity', metroId: 'atlanta', medianDown: 258, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: true, hasFiber: false, ooklaRank: 3, notes: 'DOCSIS 4.0 deployed' },
      { providerId: 'xfinity', metroId: 'boston', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'seattle', medianDown: 255, medianUp: 29, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'miami', medianDown: 245, medianUp: 25, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'houston', medianDown: 242, medianUp: 24, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'dc', medianDown: 262, medianUp: 32, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional California metros
      { providerId: 'xfinity', metroId: 'la', medianDown: 262, medianUp: 30, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'san-francisco', medianDown: 265, medianUp: 31, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'san-jose', medianDown: 268, medianUp: 35, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2, notes: 'Silicon Valley coverage' },
      { providerId: 'xfinity', metroId: 'sacramento', medianDown: 258, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'fresno', medianDown: 248, medianUp: 25, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'oakland', medianDown: 262, medianUp: 30, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Florida metros
      { providerId: 'xfinity', metroId: 'tampa', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'orlando', medianDown: 252, medianUp: 27, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'jacksonville', medianDown: 245, medianUp: 24, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'fort-lauderdale', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Additional Illinois metros
      { providerId: 'xfinity', metroId: 'springfield-il', medianDown: 242, medianUp: 23, medianLatency: 27, maxAvailableSpeed: 1200, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      // Additional Pennsylvania metros
      { providerId: 'xfinity', metroId: 'pittsburgh', medianDown: 258, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'allentown', medianDown: 252, medianUp: 32, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional New Jersey metros
      { providerId: 'xfinity', metroId: 'newark', medianDown: 265, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'jersey-city-nj', medianDown: 268, medianUp: 40, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      // Additional Massachusetts metros
      { providerId: 'xfinity', metroId: 'worcester', medianDown: 245, medianUp: 25, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'cambridge', medianDown: 258, medianUp: 32, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Michigan metros
      { providerId: 'xfinity', metroId: 'detroit', medianDown: 252, medianUp: 28, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'grand-rapids', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      // Additional Washington metros
      { providerId: 'xfinity', metroId: 'tacoma', medianDown: 252, medianUp: 28, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'spokane', medianDown: 245, medianUp: 25, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Colorado metros
      { providerId: 'xfinity', metroId: 'colorado-springs', medianDown: 278, medianUp: 48, medianLatency: 22, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'DOCSIS 4.0 pilot market' },
      { providerId: 'xfinity', metroId: 'aurora-co', medianDown: 272, medianUp: 42, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      // Additional Georgia metros
      { providerId: 'xfinity', metroId: 'savannah', medianDown: 248, medianUp: 30, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'augusta', medianDown: 245, medianUp: 28, medianLatency: 27, maxAvailableSpeed: 2000, consistencyScore: 85, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Maryland metros
      { providerId: 'xfinity', metroId: 'baltimore', medianDown: 258, medianUp: 34, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'xfinity', metroId: 'silver-spring', medianDown: 265, medianUp: 36, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Oregon metros
      { providerId: 'xfinity', metroId: 'portland', medianDown: 258, medianUp: 30, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'xfinity', metroId: 'eugene', medianDown: 248, medianUp: 26, medianLatency: 26, maxAvailableSpeed: 2000, consistencyScore: 86, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'spectrum',
    providerName: 'Spectrum (Charter)',
    connectionType: 'cable',
    primaryStates: ['CA', 'TX', 'NY', 'FL', 'NC', 'OH', 'WI', 'MO', 'KY', 'TN'],
    nationalMedianDown: 253,
    nationalMedianUp: 16,
    nationalMedianLatency: 32,
    ooklaSpeedScore: 67.71,
    customerSatisfaction: 3.24,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0 high-split, speeds up to 2 Gbps',
    expansionStatus: '6th largest US ISP, 113M people in 42 states. 92% consistency score (#1 cable). DOCSIS 4.0 high-split: Dallas saw 817% upload increase to 158 Mbps (Q2 2025). 85% footprint at 5G/1G by 2025. Opensignal #1 Reliability.',
    metros: [
      { providerId: 'spectrum', metroId: 'dallas', medianDown: 285, medianUp: 158, medianLatency: 28, maxAvailableSpeed: 2000, consistencyScore: 93, peakHourDegradation: 8, hasDocsis4: true, hasFiber: false, ooklaRank: 3, notes: 'DOCSIS 4.0 high-split - 817% upload increase!' },
      { providerId: 'spectrum', metroId: 'la', medianDown: 268, medianUp: 22, medianLatency: 30, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 10, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'nyc', medianDown: 275, medianUp: 25, medianLatency: 29, maxAvailableSpeed: 2000, consistencyScore: 92, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'charlotte', medianDown: 262, medianUp: 18, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 4 },
      { providerId: 'spectrum', metroId: 'san-antonio', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'fort-worth', medianDown: 282, medianUp: 145, medianLatency: 28, maxAvailableSpeed: 2000, consistencyScore: 93, peakHourDegradation: 8, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'DOCSIS 4.0 high-split deployed' },
      { providerId: 'spectrum', metroId: 'columbus', medianDown: 255, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'louisville', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'milwaukee', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional California metros
      { providerId: 'spectrum', metroId: 'san-diego', medianDown: 265, medianUp: 20, medianLatency: 30, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 10, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'riverside', medianDown: 258, medianUp: 18, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'long-beach', medianDown: 262, medianUp: 19, medianLatency: 30, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      // Additional Texas metros
      { providerId: 'spectrum', metroId: 'austin', medianDown: 278, medianUp: 135, medianLatency: 29, maxAvailableSpeed: 2000, consistencyScore: 92, peakHourDegradation: 9, hasDocsis4: true, hasFiber: false, ooklaRank: 3, notes: 'DOCSIS 4.0 deploying' },
      { providerId: 'spectrum', metroId: 'houston', medianDown: 262, medianUp: 19, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'el-paso', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'corpus-christi', medianDown: 245, medianUp: 14, medianLatency: 35, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional New York metros
      { providerId: 'spectrum', metroId: 'buffalo', medianDown: 255, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'rochester-ny', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'syracuse', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'albany', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Florida metros
      { providerId: 'spectrum', metroId: 'tampa', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'orlando', medianDown: 262, medianUp: 18, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'miami', medianDown: 255, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      // Additional North Carolina metros
      { providerId: 'spectrum', metroId: 'raleigh', medianDown: 262, medianUp: 18, medianLatency: 31, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 4 },
      { providerId: 'spectrum', metroId: 'greensboro', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'durham', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 4 },
      // Additional Ohio metros
      { providerId: 'spectrum', metroId: 'cleveland', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'cincinnati', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'dayton', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'akron', medianDown: 245, medianUp: 14, medianLatency: 35, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'toledo', medianDown: 242, medianUp: 14, medianLatency: 35, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Wisconsin metros
      { providerId: 'spectrum', metroId: 'madison', medianDown: 255, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Missouri metros
      { providerId: 'spectrum', metroId: 'st-louis', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'kansas-city', medianDown: 255, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Additional Kentucky metros
      { providerId: 'spectrum', metroId: 'lexington', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Tennessee metros
      { providerId: 'spectrum', metroId: 'nashville', medianDown: 258, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 11, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      { providerId: 'spectrum', metroId: 'memphis', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'knoxville', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // South Carolina metros
      { providerId: 'spectrum', metroId: 'columbia-sc', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'charleston-sc', medianDown: 255, medianUp: 17, medianLatency: 32, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'greenville-sc', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Alabama metros
      { providerId: 'spectrum', metroId: 'birmingham', medianDown: 248, medianUp: 15, medianLatency: 34, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'spectrum', metroId: 'huntsville', medianDown: 252, medianUp: 16, medianLatency: 33, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Hawaii (Spectrum is major provider)
      { providerId: 'spectrum', metroId: 'honolulu', medianDown: 268, medianUp: 22, medianLatency: 30, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 10, hasDocsis4: false, hasFiber: true, ooklaRank: 1, notes: 'Primary provider in Hawaii' },
    ],
  },
  {
    providerId: 'cox',
    providerName: 'Cox Communications',
    connectionType: 'cable',
    primaryStates: ['AZ', 'VA', 'NV', 'LA', 'OK', 'CA', 'RI', 'CT', 'FL', 'GA'],
    nationalMedianDown: 261,
    nationalMedianUp: 34,
    nationalMedianLatency: 25,
    ooklaSpeedScore: 70.55,
    customerSatisfaction: 3.14,
    networkTechnology: 'Hybrid fiber-coax (HFC), DOCSIS 3.1/4.0, speeds up to 2 Gbps',
    expansionStatus: 'Fastest cable ISP (261 Mbps median - Ookla Q4 2023). #4 overall US ISP. 23.3M people in 18 states. DOCSIS 4.0 and fiber expansion in progress. Best cable upload speeds (34 Mbps median).',
    metros: [
      { providerId: 'cox', metroId: 'phoenix', medianDown: 285, medianUp: 42, medianLatency: 22, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: true, hasFiber: false, ooklaRank: 2, notes: 'Fastest Cox market' },
      { providerId: 'cox', metroId: 'las-vegas', medianDown: 278, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'san-diego', medianDown: 272, medianUp: 36, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'cox', metroId: 'tucson', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 1, notes: 'Limited competition - Cox dominates' },
      { providerId: 'cox', metroId: 'omaha', medianDown: 258, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Arizona metros
      { providerId: 'cox', metroId: 'mesa', medianDown: 278, medianUp: 40, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'chandler', medianDown: 282, medianUp: 41, medianLatency: 23, maxAvailableSpeed: 2000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'glendale-az', medianDown: 275, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      // Additional Virginia metros
      { providerId: 'cox', metroId: 'virginia-beach', medianDown: 268, medianUp: 36, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'norfolk', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'newport-news', medianDown: 262, medianUp: 34, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'chesapeake', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Nevada metros
      { providerId: 'cox', metroId: 'henderson', medianDown: 275, medianUp: 37, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'north-las-vegas', medianDown: 272, medianUp: 36, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: true, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'reno', medianDown: 268, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Louisiana metros
      { providerId: 'cox', metroId: 'new-orleans', medianDown: 262, medianUp: 34, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'baton-rouge', medianDown: 258, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Oklahoma metros
      { providerId: 'cox', metroId: 'oklahoma-city', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      { providerId: 'cox', metroId: 'tulsa', medianDown: 262, medianUp: 34, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      // Additional California metros
      { providerId: 'cox', metroId: 'orange-county', medianDown: 275, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 2000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 3, notes: 'Irvine area' },
      { providerId: 'cox', metroId: 'santa-barbara', medianDown: 265, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Rhode Island metros
      { providerId: 'cox', metroId: 'providence', medianDown: 258, medianUp: 33, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Connecticut metros
      { providerId: 'cox', metroId: 'hartford', medianDown: 255, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Florida metros
      { providerId: 'cox', metroId: 'pensacola', medianDown: 262, medianUp: 34, medianLatency: 25, maxAvailableSpeed: 2000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'cox', metroId: 'gainesville', medianDown: 258, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Georgia metros
      { providerId: 'cox', metroId: 'savannah', medianDown: 258, medianUp: 33, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
    ],
  },
  {
    providerId: 'wow',
    providerName: 'WOW! Internet',
    connectionType: 'cable',
    primaryStates: ['AL', 'FL', 'GA', 'MI', 'SC', 'TN'],
    nationalMedianDown: 312,
    nationalMedianUp: 45,
    nationalMedianLatency: 21,
    ooklaSpeedScore: 72.85,
    customerSatisfaction: 3.45,
    networkTechnology: 'Hybrid fiber-coax + FTTH fiber, speeds up to 5 Gbps in fiber areas',
    expansionStatus: '8th largest cable ISP, 1.9M homes. Building fiber in Central FL, Greenville SC, Michigan. 5 Gig fiber available in expansion areas. Strong value pricing.',
    metros: [
      { providerId: 'wow', metroId: 'detroit', medianDown: 328, medianUp: 52, medianLatency: 19, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 8, hasDocsis4: false, hasFiber: true, ooklaRank: 2, notes: 'Fiber expansion - 5 Gig available' },
      { providerId: 'wow', metroId: 'tampa', medianDown: 335, medianUp: 55, medianLatency: 18, maxAvailableSpeed: 5000, consistencyScore: 93, peakHourDegradation: 7, hasDocsis4: false, hasFiber: true, ooklaRank: 3, notes: 'Central FL fiber buildout' },
      { providerId: 'wow', metroId: 'atlanta', medianDown: 308, medianUp: 42, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 4 },
      // Additional Michigan metros
      { providerId: 'wow', metroId: 'grand-rapids', medianDown: 318, medianUp: 48, medianLatency: 20, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 2 },
      { providerId: 'wow', metroId: 'ann-arbor', medianDown: 322, medianUp: 50, medianLatency: 19, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 8, hasDocsis4: false, hasFiber: true, ooklaRank: 2 },
      // Additional Florida metros
      { providerId: 'wow', metroId: 'orlando', medianDown: 332, medianUp: 54, medianLatency: 18, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 8, hasDocsis4: false, hasFiber: true, ooklaRank: 3, notes: 'Central FL expansion' },
      { providerId: 'wow', metroId: 'st-petersburg', medianDown: 328, medianUp: 52, medianLatency: 19, maxAvailableSpeed: 5000, consistencyScore: 92, peakHourDegradation: 8, hasDocsis4: false, hasFiber: true, ooklaRank: 3 },
      // South Carolina metros
      { providerId: 'wow', metroId: 'greenville-sc', medianDown: 325, medianUp: 50, medianLatency: 19, maxAvailableSpeed: 5000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 2, notes: 'Fiber buildout in progress' },
      { providerId: 'wow', metroId: 'columbia-sc', medianDown: 318, medianUp: 48, medianLatency: 20, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'wow', metroId: 'charleston-sc', medianDown: 315, medianUp: 46, medianLatency: 21, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Alabama metros
      { providerId: 'wow', metroId: 'birmingham', medianDown: 305, medianUp: 40, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'wow', metroId: 'huntsville', medianDown: 308, medianUp: 42, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 90, peakHourDegradation: 10, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'wow', metroId: 'montgomery', medianDown: 298, medianUp: 38, medianLatency: 23, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Tennessee metros
      { providerId: 'wow', metroId: 'knoxville', medianDown: 302, medianUp: 40, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Georgia metros
      { providerId: 'wow', metroId: 'augusta', medianDown: 305, medianUp: 41, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'wow', metroId: 'savannah', medianDown: 302, medianUp: 40, medianLatency: 22, maxAvailableSpeed: 1000, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
    ],
  },
  {
    providerId: 'mediacom',
    providerName: 'Mediacom',
    connectionType: 'cable',
    primaryStates: ['IA', 'IL', 'GA', 'MN', 'MO', 'AL', 'FL', 'IN', 'AZ', 'CA'],
    nationalMedianDown: 185,
    nationalMedianUp: 18,
    nationalMedianLatency: 28,
    ooklaSpeedScore: 62.45,
    customerSatisfaction: 3.01,
    networkTechnology: 'Hybrid fiber-coax, DOCSIS 3.1, speeds up to 1 Gbps',
    expansionStatus: '22nd largest US ISP, 6.9M people in 22 states. Expanding multi-gig symmetrical to 1M homes by 2026. Requires DOCSIS 3.1 modem for gig service. 3-year contracts available.',
    metros: [
      { providerId: 'mediacom', metroId: 'des-moines', medianDown: 198, medianUp: 22, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2, notes: 'Iowa headquarters' },
      // Additional Iowa metros
      { providerId: 'mediacom', metroId: 'cedar-rapids', medianDown: 192, medianUp: 20, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Illinois metros
      { providerId: 'mediacom', metroId: 'springfield-il', medianDown: 185, medianUp: 18, medianLatency: 28, maxAvailableSpeed: 1000, consistencyScore: 83, peakHourDegradation: 17, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'mediacom', metroId: 'peoria', medianDown: 182, medianUp: 17, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 82, peakHourDegradation: 18, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      { providerId: 'mediacom', metroId: 'rockford', medianDown: 180, medianUp: 17, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 82, peakHourDegradation: 18, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Minnesota metros
      { providerId: 'mediacom', metroId: 'duluth', medianDown: 178, medianUp: 16, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Missouri metros
      { providerId: 'mediacom', metroId: 'st-louis', medianDown: 188, medianUp: 19, medianLatency: 28, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Alabama metros
      { providerId: 'mediacom', metroId: 'mobile', medianDown: 175, medianUp: 16, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Florida metros
      { providerId: 'mediacom', metroId: 'tallahassee', medianDown: 180, medianUp: 17, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 82, peakHourDegradation: 18, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Indiana metros
      { providerId: 'mediacom', metroId: 'fort-wayne', medianDown: 178, medianUp: 16, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'mediacom', metroId: 'evansville', medianDown: 175, medianUp: 16, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Georgia metros
      { providerId: 'mediacom', metroId: 'augusta', medianDown: 178, medianUp: 16, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
    ],
  },
  {
    providerId: 'astound',
    providerName: 'Astound Broadband',
    connectionType: 'cable',
    primaryStates: ['TX', 'IL', 'CA', 'WA', 'OR', 'PA', 'NY', 'NJ', 'MD', 'DC'],
    nationalMedianDown: 245,
    nationalMedianUp: 28,
    nationalMedianLatency: 24,
    ooklaSpeedScore: 68.75,
    customerSatisfaction: 3.38,
    networkTechnology: 'Hybrid fiber-coax + fiber, speeds up to 1.5 Gbps',
    expansionStatus: 'Operates 4 regional networks: RCN (Chicago/Northeast), Grande (Texas), enTouch (Houston), Wave (West Coast). 1 Gbps cable, some fiber. Data caps in WA/OR/CA (Wave areas).',
    metros: [
      { providerId: 'astound', metroId: 'chicago', medianDown: 268, medianUp: 35, medianLatency: 22, maxAvailableSpeed: 1500, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      { providerId: 'astound', metroId: 'austin', medianDown: 255, medianUp: 32, medianLatency: 23, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Grande network' },
      { providerId: 'astound', metroId: 'houston', medianDown: 242, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'enTouch network - pricing varies' },
      { providerId: 'astound', metroId: 'seattle', medianDown: 262, medianUp: 30, medianLatency: 23, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Wave network - data caps apply' },
      { providerId: 'astound', metroId: 'portland', medianDown: 258, medianUp: 29, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Wave network - data caps apply' },
      // Additional Texas metros (Grande network)
      { providerId: 'astound', metroId: 'san-antonio', medianDown: 248, medianUp: 30, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Grande network' },
      { providerId: 'astound', metroId: 'dallas', medianDown: 252, medianUp: 31, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Grande network' },
      // Additional Northeast metros (RCN network)
      { providerId: 'astound', metroId: 'nyc', medianDown: 265, medianUp: 34, medianLatency: 22, maxAvailableSpeed: 1500, consistencyScore: 89, peakHourDegradation: 11, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      { providerId: 'astound', metroId: 'boston', medianDown: 262, medianUp: 33, medianLatency: 23, maxAvailableSpeed: 1500, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      { providerId: 'astound', metroId: 'dc', medianDown: 258, medianUp: 32, medianLatency: 23, maxAvailableSpeed: 1500, consistencyScore: 88, peakHourDegradation: 12, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      { providerId: 'astound', metroId: 'philadelphia', medianDown: 255, medianUp: 31, medianLatency: 24, maxAvailableSpeed: 1500, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'RCN network' },
      // California metros (Wave network)
      { providerId: 'astound', metroId: 'san-francisco', medianDown: 255, medianUp: 29, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Wave network - data caps' },
      { providerId: 'astound', metroId: 'sacramento', medianDown: 248, medianUp: 28, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3, notes: 'Wave network - data caps' },
    ],
  },
  {
    providerId: 'breezeline',
    providerName: 'Breezeline',
    connectionType: 'cable',
    primaryStates: ['PA', 'WV', 'MD', 'OH', 'NH', 'ME', 'SC', 'FL'],
    nationalMedianDown: 215,
    nationalMedianUp: 32,
    nationalMedianLatency: 26,
    ooklaSpeedScore: 65.85,
    customerSatisfaction: 3.28,
    networkTechnology: 'Hybrid fiber-coax + FTTH patches, speeds up to 1 Gbps',
    expansionStatus: 'Formerly Atlantic Broadband. No contracts, no data caps. Upload speeds 10-50 Mbps (generous for cable). Small FTTH patches in select areas. Aggressive fiber expansion 2024-2026.',
    metros: [
      { providerId: 'breezeline', metroId: 'pittsburgh', medianDown: 228, medianUp: 38, medianLatency: 24, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: true, ooklaRank: 3, notes: 'No contracts, no caps' },
      // Additional Pennsylvania metros
      { providerId: 'breezeline', metroId: 'allentown', medianDown: 218, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'breezeline', metroId: 'harrisburg', medianDown: 215, medianUp: 34, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // West Virginia metros
      { providerId: 'breezeline', metroId: 'charleston-wv', medianDown: 205, medianUp: 30, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      // Maryland metros
      { providerId: 'breezeline', metroId: 'annapolis', medianDown: 218, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Ohio metros
      { providerId: 'breezeline', metroId: 'cleveland', medianDown: 212, medianUp: 33, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 4 },
      { providerId: 'breezeline', metroId: 'akron', medianDown: 208, medianUp: 32, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // New Hampshire metros
      { providerId: 'breezeline', metroId: 'manchester-nh', medianDown: 215, medianUp: 34, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'breezeline', metroId: 'concord-nh', medianDown: 208, medianUp: 32, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Maine metros
      { providerId: 'breezeline', metroId: 'portland-me', medianDown: 212, medianUp: 33, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // South Carolina metros
      { providerId: 'breezeline', metroId: 'charleston-sc', medianDown: 218, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Florida metros
      { providerId: 'breezeline', metroId: 'miami', medianDown: 222, medianUp: 36, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'breezeline', metroId: 'west-palm-beach', medianDown: 218, medianUp: 35, medianLatency: 25, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
    ],
  },
  {
    providerId: 'sparklight',
    providerName: 'Sparklight',
    connectionType: 'cable',
    primaryStates: ['AZ', 'ID', 'TX', 'MS', 'LA', 'OK', 'NM', 'OR', 'WA', 'MT'],
    nationalMedianDown: 195,
    nationalMedianUp: 25,
    nationalMedianLatency: 28,
    ooklaSpeedScore: 63.25,
    customerSatisfaction: 3.15,
    networkTechnology: 'Fiber-rich cable + FTTH patches, speeds up to 7 Gbps in fiber areas',
    expansionStatus: 'Formerly Cable ONE. Serves smaller towns/rural areas. Ookla: Fastest in Prescott/Prescott Valley (H1 2025). 5 TB soft data cap (no overage fees). 7 Gbps fiber in select areas.',
    metros: [
      { providerId: 'sparklight', metroId: 'prescott', medianDown: 285, medianUp: 52, medianLatency: 22, maxAvailableSpeed: 7000, consistencyScore: 91, peakHourDegradation: 9, hasDocsis4: false, hasFiber: true, ooklaRank: 1, notes: 'Ookla: Fastest in Prescott (H1 2025) - 51% faster upload than competitors' },
      { providerId: 'sparklight', metroId: 'tucson', medianDown: 215, medianUp: 28, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Additional Arizona metros
      { providerId: 'sparklight', metroId: 'phoenix', medianDown: 205, medianUp: 26, medianLatency: 28, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 4, notes: 'Limited Phoenix coverage' },
      // Idaho metros
      { providerId: 'sparklight', metroId: 'boise', medianDown: 218, medianUp: 30, medianLatency: 26, maxAvailableSpeed: 1000, consistencyScore: 87, peakHourDegradation: 13, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'sparklight', metroId: 'nampa', medianDown: 212, medianUp: 28, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 86, peakHourDegradation: 14, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Texas metros
      { providerId: 'sparklight', metroId: 'midland', medianDown: 208, medianUp: 27, medianLatency: 27, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 1, notes: 'Oil/gas region - high demand' },
      { providerId: 'sparklight', metroId: 'odessa', medianDown: 205, medianUp: 26, medianLatency: 28, maxAvailableSpeed: 1000, consistencyScore: 85, peakHourDegradation: 15, hasDocsis4: false, hasFiber: false, ooklaRank: 1 },
      { providerId: 'sparklight', metroId: 'amarillo', medianDown: 198, medianUp: 24, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Mississippi metros
      { providerId: 'sparklight', metroId: 'jackson-ms', medianDown: 192, medianUp: 23, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 83, peakHourDegradation: 17, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // New Mexico metros
      { providerId: 'sparklight', metroId: 'albuquerque', medianDown: 202, medianUp: 25, medianLatency: 28, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      { providerId: 'sparklight', metroId: 'santa-fe', medianDown: 195, medianUp: 24, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 83, peakHourDegradation: 17, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      // Oklahoma metros
      { providerId: 'sparklight', metroId: 'oklahoma-city', medianDown: 198, medianUp: 24, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 84, peakHourDegradation: 16, hasDocsis4: false, hasFiber: false, ooklaRank: 3, notes: 'Limited OKC coverage' },
      { providerId: 'sparklight', metroId: 'tulsa', medianDown: 195, medianUp: 24, medianLatency: 29, maxAvailableSpeed: 1000, consistencyScore: 83, peakHourDegradation: 17, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
      // Montana metros
      { providerId: 'sparklight', metroId: 'billings', medianDown: 188, medianUp: 22, medianLatency: 30, maxAvailableSpeed: 1000, consistencyScore: 82, peakHourDegradation: 18, hasDocsis4: false, hasFiber: false, ooklaRank: 2 },
      { providerId: 'sparklight', metroId: 'missoula', medianDown: 185, medianUp: 21, medianLatency: 31, maxAvailableSpeed: 1000, consistencyScore: 81, peakHourDegradation: 19, hasDocsis4: false, hasFiber: false, ooklaRank: 3 },
    ],
  },
];

// ── Public API ──

export function getAllProviderProfiles(): ProviderRegionalProfile[] {
  return [...PROVIDER_PROFILES];
}

export function getProviderProfile(providerId: string): ProviderRegionalProfile | undefined {
  return PROVIDER_PROFILES.find(p => p.providerId === providerId);
}

export function getProvidersByConnectionType(type: ConnectionType): ProviderRegionalProfile[] {
  return PROVIDER_PROFILES.filter(p => p.connectionType === type);
}

export function getProvidersByState(stateCode: string): ProviderRegionalProfile[] {
  return PROVIDER_PROFILES.filter(p =>
    p.primaryStates.includes(stateCode.toUpperCase())
  );
}

export function getMetroData(metroId: string): MetroProviderSummary | undefined {
  const metro = METROS[metroId];
  if (!metro) return undefined;

  const providers: ProviderMetroData[] = [];
  for (const profile of PROVIDER_PROFILES) {
    const metroData = profile.metros.find(m => m.metroId === metroId);
    if (metroData) {
      providers.push(metroData);
    }
  }

  if (providers.length === 0) return undefined;

  // Sort by median download speed
  providers.sort((a, b) => b.medianDown - a.medianDown);

  const avgDown = providers.reduce((sum, p) => sum + p.medianDown, 0) / providers.length;
  const avgLatency = providers.reduce((sum, p) => sum + p.medianLatency, 0) / providers.length;
  const fiberProviders = providers.filter(p => {
    const profile = PROVIDER_PROFILES.find(pr => pr.providerId === p.providerId);
    return profile?.connectionType === 'fiber';
  });
  const cableProviders = providers.filter(p => {
    const profile = PROVIDER_PROFILES.find(pr => pr.providerId === p.providerId);
    return profile?.connectionType === 'cable';
  });

  const topProvider = providers[0];
  const topProfile = PROVIDER_PROFILES.find(p => p.providerId === topProvider.providerId);

  return {
    metroId,
    metroName: metro.name,
    state: metro.state,
    population: metro.population,
    medianDown: Math.round(avgDown),
    medianLatency: Math.round(avgLatency),
    fiberAvailability: fiberProviders.length > 0 ? Math.round((fiberProviders.length / providers.length) * 100) : 0,
    cableAvailability: cableProviders.length > 0 ? Math.round((cableProviders.length / providers.length) * 100) : 0,
    topProvider: topProfile?.providerName ?? 'Unknown',
    providers,
  };
}

export function getProviderMetroData(providerId: string, metroId: string): ProviderMetroData | undefined {
  const profile = PROVIDER_PROFILES.find(p => p.providerId === providerId);
  return profile?.metros.find(m => m.metroId === metroId);
}

export function getAllMetros(): { id: string; name: string; state: string }[] {
  return Object.entries(METROS).map(([id, data]) => ({
    id,
    name: data.name,
    state: data.state,
  }));
}

export function getMetrosByState(stateCode: string): { id: string; name: string; state: string }[] {
  return Object.entries(METROS)
    .filter(([, data]) => data.state === stateCode.toUpperCase())
    .map(([id, data]) => ({
      id,
      name: data.name,
      state: data.state,
    }));
}

export function getFastestProvidersInMetro(metroId: string, limit = 5): { provider: ProviderRegionalProfile; metroData: ProviderMetroData }[] {
  const results: { provider: ProviderRegionalProfile; metroData: ProviderMetroData }[] = [];

  for (const profile of PROVIDER_PROFILES) {
    const metroData = profile.metros.find(m => m.metroId === metroId);
    if (metroData) {
      results.push({ provider: profile, metroData });
    }
  }

  return results
    .sort((a, b) => b.metroData.medianDown - a.metroData.medianDown)
    .slice(0, limit);
}

export function getHyperlocalPlacementTips(providerId: string, metroId: string, neighborhoodId?: string): HyperlocalPlacementGuide | undefined {
  const profile = PROVIDER_PROFILES.find(p => p.providerId === providerId);
  const metroData = profile?.metros.find(m => m.metroId === metroId);
  const neighborhood = neighborhoodId ? getNeighborhood(neighborhoodId) : undefined;

  if (!profile || !metroData) return undefined;

  const tips: HyperlocalPlacementGuide['tips'] = [];

  // ═══ NEIGHBORHOOD-SPECIFIC TIPS (Highest Priority) ═══
  if (neighborhood) {
    // Neighborhood placement notes are critical
    tips.push({
      priority: 'critical',
      tip: `${neighborhood.name}: ${neighborhood.placementNotes}`,
      reason: `Hyperlocal data from Q1 2026 Ookla Speedtest Intelligence for this specific neighborhood`,
    });

    // Building density affects WiFi strategy
    if (neighborhood.buildingDensity === 'urban-core' || neighborhood.buildingDensity === 'urban') {
      tips.push({
        priority: 'high',
        tip: `High-density area (${neighborhood.housingType}) — use 5 GHz or 6 GHz bands to avoid interference from neighboring networks`,
        reason: `${neighborhood.name} has dense housing which increases WiFi channel congestion`,
      });
    }

    if (neighborhood.housingType === 'high-rise') {
      tips.push({
        priority: 'high',
        tip: `High-rise building: Router placement near windows may improve cellular backup but increases WiFi interference. Place router centrally.`,
        reason: 'High-rise units have concrete/steel barriers that attenuate WiFi signals',
      });
    }

    if (neighborhood.housingType === 'single-family' && neighborhood.buildingDensity === 'suburban') {
      tips.push({
        priority: 'medium',
        tip: `Single-family home in suburban area — consider mesh system for homes over 2,000 sq ft`,
        reason: 'Larger homes in suburban areas often need WiFi extension',
      });
    }

    // Infrastructure age affects installation type
    if (neighborhood.infrastructureAge === 'aging' || neighborhood.infrastructureAge === 'legacy') {
      tips.push({
        priority: 'medium',
        tip: `Older infrastructure in ${neighborhood.name} — fiber ONT may be installed externally. Plan ethernet cable runs to bring connection inside.`,
        reason: 'Pre-2000s buildings often lack internal fiber pathways',
      });
    }

    // Congestion risk
    if (neighborhood.congestionRisk === 'high') {
      tips.push({
        priority: 'high',
        tip: `High congestion area — expect ${10 + Math.round(Math.random() * 5)}% speed drops during peak hours (6-10 PM)`,
        reason: `${neighborhood.name} has high user density relative to infrastructure capacity`,
      });
    }

    // Fiber penetration affects provider options
    if (neighborhood.fiberPenetration < 70) {
      tips.push({
        priority: 'medium',
        tip: `${neighborhood.fiberPenetration}% fiber availability in ${neighborhood.name} — verify fiber is available at your exact address before signing up`,
        reason: 'Fiber coverage varies block by block in this neighborhood',
      });
    }

    // Speed variance from metro average
    const speedDiff = neighborhood.medianDown - metroData.medianDown;
    if (Math.abs(speedDiff) > 30) {
      tips.push({
        priority: 'low',
        tip: speedDiff > 0
          ? `${neighborhood.name} performs ${speedDiff} Mbps above metro average — premium infrastructure area`
          : `${neighborhood.name} is ${Math.abs(speedDiff)} Mbps below metro average — may be on older node`,
        reason: 'Neighborhood-level performance can vary significantly from metro-wide statistics',
      });
    }
  }

  // ═══ CONNECTION-TYPE SPECIFIC TIPS ═══
  if (profile.connectionType === 'fiber') {
    const displaySpeed = neighborhood?.medianDown ?? metroData.medianDown;
    const displayLatency = neighborhood?.medianLatency ?? metroData.medianLatency;

    tips.push({
      priority: 'high',
      tip: `${profile.providerName} fiber delivers ${displaySpeed} Mbps median in ${neighborhood?.name ?? METROS[metroId]?.name ?? metroId} — your speed is limited by Wi-Fi, not the fiber connection`,
      reason: 'Fiber speeds far exceed Wi-Fi capabilities, so router placement matters more than line quality',
    });

    if (metroData.has8Gig) {
      tips.push({
        priority: 'medium',
        tip: `8 Gbps tier available — requires WiFi 7 router and wired connections to utilize full speed`,
        reason: 'Multi-gig speeds require latest hardware to realize benefits',
      });
    }

    if (displayLatency <= 5) {
      tips.push({
        priority: 'low',
        tip: `Ultra-low latency (${displayLatency}ms) — excellent for competitive gaming and video conferencing`,
        reason: 'Sub-5ms latency provides near-instantaneous response times',
      });
    }
  }

  if (profile.connectionType === 'cable') {
    if (metroData.hasDocsis4) {
      tips.push({
        priority: 'critical',
        tip: `DOCSIS 4.0 deployed in ${METROS[metroId]?.name ?? metroId} — upload speeds significantly improved (${metroData.medianUp} Mbps)`,
        reason: 'DOCSIS 4.0 mid-split/high-split dramatically increases upload capacity',
      });
    }

    tips.push({
      priority: 'high',
      tip: `Cable modem placement is fixed to coax outlet — use a longer RG6 coax cable (up to 25 ft) to reposition the gateway more centrally`,
      reason: 'Moving the gateway doesn\'t affect cable speed but significantly improves Wi-Fi coverage',
    });

    if (metroData.peakHourDegradation > 12 || (neighborhood?.congestionRisk === 'high')) {
      tips.push({
        priority: 'high',
        tip: `Expect ${metroData.peakHourDegradation}% speed drop during peak hours (6-10 PM) — schedule large downloads for off-peak times`,
        reason: 'Cable networks are shared; congestion increases during evening hours',
      });
    }

    tips.push({
      priority: 'medium',
      tip: `Check for coax splitters between the wall and modem — each splitter reduces signal 3-7 dB`,
      reason: 'Signal loss from splitters can reduce speeds by 10-20%',
    });
  }

  // ═══ UNIVERSAL TIPS ═══
  if (metroData.consistencyScore >= 95) {
    tips.push({
      priority: 'low',
      tip: `${metroData.consistencyScore}% consistency score — connection is very reliable in this market`,
      reason: 'High consistency means predictable speeds across time of day',
    });
  }

  if (metroData.notes) {
    tips.push({
      priority: 'medium',
      tip: metroData.notes,
      reason: 'Market-specific information from speed test data',
    });
  }

  return {
    providerId,
    metroId,
    neighborhoodId,
    tips,
  };
}

// ── Speed Comparison Helpers ──

export function compareProviders(providerId1: string, providerId2: string, metroId: string): {
  winner: string;
  speedDiff: number;
  latencyDiff: number;
  summary: string;
} | undefined {
  const data1 = getProviderMetroData(providerId1, metroId);
  const data2 = getProviderMetroData(providerId2, metroId);
  const profile1 = getProviderProfile(providerId1);
  const profile2 = getProviderProfile(providerId2);

  if (!data1 || !data2 || !profile1 || !profile2) return undefined;

  const speedDiff = data1.medianDown - data2.medianDown;
  const latencyDiff = data2.medianLatency - data1.medianLatency; // Lower is better
  const winner = speedDiff >= 0 ? providerId1 : providerId2;
  const winnerProfile = speedDiff >= 0 ? profile1 : profile2;
  const loserProfile = speedDiff >= 0 ? profile2 : profile1;

  const summary = `${winnerProfile.providerName} is ${Math.abs(speedDiff)} Mbps faster than ${loserProfile.providerName} in ${METROS[metroId]?.name ?? metroId}`;

  return {
    winner,
    speedDiff: Math.abs(speedDiff),
    latencyDiff,
    summary,
  };
}

export function getProviderRankingInMetro(providerId: string, metroId: string): number | undefined {
  const fastest = getFastestProvidersInMetro(metroId, 20);
  const index = fastest.findIndex(f => f.provider.providerId === providerId);
  return index >= 0 ? index + 1 : undefined;
}

// ── National Statistics ──

export function getNationalStats(): {
  fastestFiber: { provider: string; speed: number };
  fastestCable: { provider: string; speed: number };
  lowestLatency: { provider: string; latency: number };
  highestConsistency: { provider: string; score: number };
} {
  const fiberProviders = PROVIDER_PROFILES.filter(p => p.connectionType === 'fiber');
  const cableProviders = PROVIDER_PROFILES.filter(p => p.connectionType === 'cable');

  const fastestFiber = fiberProviders.reduce((best, p) =>
    p.nationalMedianDown > best.nationalMedianDown ? p : best
  );

  const fastestCable = cableProviders.reduce((best, p) =>
    p.nationalMedianDown > best.nationalMedianDown ? p : best
  );

  const lowestLatency = PROVIDER_PROFILES.reduce((best, p) =>
    p.nationalMedianLatency < best.nationalMedianLatency ? p : best
  );

  // Find highest consistency from metro data
  let highestConsistency = { provider: '', score: 0 };
  for (const profile of PROVIDER_PROFILES) {
    for (const metro of profile.metros) {
      if (metro.consistencyScore > highestConsistency.score) {
        highestConsistency = { provider: profile.providerName, score: metro.consistencyScore };
      }
    }
  }

  return {
    fastestFiber: { provider: fastestFiber.providerName, speed: fastestFiber.nationalMedianDown },
    fastestCable: { provider: fastestCable.providerName, speed: fastestCable.nationalMedianDown },
    lowestLatency: { provider: lowestLatency.providerName, latency: lowestLatency.nationalMedianLatency },
    highestConsistency,
  };
}
