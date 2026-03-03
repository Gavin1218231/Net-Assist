import type { AIProvider, ChatMessage, ConnectionType, NetworkStatus, SpeedTestResult, Recommendation } from '../types';

export interface AppContext {
  currentPage: string;
  connectionType?: ConnectionType;
  providerName?: string;
  networkStatus?: NetworkStatus;
  speedTestResult?: SpeedTestResult;
  recommendations?: Recommendation[];
  setupCompleted?: boolean;
}

export interface AIAssistantConfig {
  provider: AIProvider;
  appContext?: AppContext;
}

// Knowledge base categories
type KnowledgeCategory =
  | 'greeting'
  | 'speed_test'
  | 'network_diagnostics'
  | 'placement'
  | 'troubleshooting'
  | 'setup'
  | 'security'
  | 'provider'
  | 'settings'
  | 'wifi_bands'
  | 'general';

// Comprehensive knowledge base
const KNOWLEDGE_BASE: Record<KnowledgeCategory, string[]> = {
  greeting: [
    "Hello! I'm NetAssist AI, your comprehensive internet setup assistant. I can help you with:\n\n" +
    "**Network Analysis**\n" +
    "- Speed test interpretation and optimization tips\n" +
    "- Network quality diagnostics\n" +
    "- Wi-Fi band selection (2.4/5/6 GHz)\n\n" +
    "**Setup & Configuration**\n" +
    "- Router/gateway placement optimization\n" +
    "- Connection type setup (fiber, 5G, cable, DSL, satellite)\n" +
    "- Provider-specific guidance\n\n" +
    "**Troubleshooting**\n" +
    "- Connectivity issues\n" +
    "- Slow speed diagnosis\n" +
    "- Security recommendations\n\n" +
    "What would you like help with today?",
  ],

  speed_test: [
    "**Understanding Your Speed Test Results**\n\n" +
    "**Download Speed** measures how fast data comes TO your device:\n" +
    "- 25+ Mbps: Good for HD streaming, video calls\n" +
    "- 100+ Mbps: Great for 4K streaming, multiple users\n" +
    "- 300+ Mbps: Excellent for heavy usage, gaming\n\n" +
    "**Upload Speed** measures how fast data goes FROM your device:\n" +
    "- 5+ Mbps: Good for video calls\n" +
    "- 10+ Mbps: Good for streaming/content creation\n" +
    "- 25+ Mbps: Excellent for cloud backup\n\n" +
    "**Latency (Ping)** measures response time:\n" +
    "- <20ms: Excellent for gaming\n" +
    "- 20-50ms: Good for most uses\n" +
    "- 50-100ms: Acceptable\n" +
    "- >100ms: May cause lag in real-time apps\n\n" +
    "**Jitter** measures latency consistency:\n" +
    "- <5ms: Excellent\n" +
    "- 5-20ms: Good\n" +
    "- >20ms: May cause choppy video calls",

    "**Tips to Improve Speed Test Results**\n\n" +
    "1. **Test on 5 GHz or 6 GHz** bands for faster speeds (if your router supports them)\n" +
    "2. **Move closer to your router** during the test\n" +
    "3. **Close other apps** that might be using bandwidth\n" +
    "4. **Use Ethernet** for the most accurate results\n" +
    "5. **Test at different times** - speeds vary by network congestion\n" +
    "6. **Restart your router** if speeds are consistently slow\n\n" +
    "If your speeds are significantly below your plan, contact your ISP or check for:\n" +
    "- Outdated router firmware\n" +
    "- Too many devices connected\n" +
    "- Physical obstructions blocking signal",
  ],

  network_diagnostics: [
    "**Analyzing Your Network Quality**\n\n" +
    "**Signal Strength** (measured in dBm):\n" +
    "- -30 to -50 dBm: Excellent\n" +
    "- -50 to -60 dBm: Good\n" +
    "- -60 to -70 dBm: Fair\n" +
    "- Below -70 dBm: Poor\n\n" +
    "**Network Quality Ratings**:\n" +
    "- **Excellent**: Fast speeds, low latency, stable connection\n" +
    "- **Good**: Reliable for most activities\n" +
    "- **Fair**: May experience occasional slowdowns\n" +
    "- **Poor**: Expect frequent issues\n\n" +
    "**Common Issues & Solutions**:\n" +
    "- Weak signal: Move closer to router or add mesh nodes\n" +
    "- High latency: Check for background downloads, restart router\n" +
    "- Intermittent drops: Update firmware, check for interference",

    "**Wi-Fi Interference Sources**\n\n" +
    "Common devices that can interfere with Wi-Fi:\n\n" +
    "**2.4 GHz Interference**:\n" +
    "- Microwave ovens\n" +
    "- Bluetooth devices\n" +
    "- Baby monitors\n" +
    "- Cordless phones\n" +
    "- Neighboring Wi-Fi networks\n\n" +
    "**General Interference**:\n" +
    "- Thick walls (especially concrete/brick)\n" +
    "- Metal objects and appliances\n" +
    "- Fish tanks\n" +
    "- Mirrors\n\n" +
    "**Solutions**:\n" +
    "- Switch to 5 GHz or 6 GHz band\n" +
    "- Change your Wi-Fi channel\n" +
    "- Reposition your router\n" +
    "- Use mesh Wi-Fi system",
  ],

  wifi_bands: [
    "**Wi-Fi Frequency Bands Explained**\n\n" +
    "**2.4 GHz Band**\n" +
    "- Range: Best (up to 150 ft indoors)\n" +
    "- Speed: Slower (up to 600 Mbps theoretical)\n" +
    "- Penetration: Great through walls\n" +
    "- Best for: Smart home devices, IoT, distant rooms\n" +
    "- Drawback: More congested, more interference\n\n" +
    "**5 GHz Band**\n" +
    "- Range: Medium (up to 80 ft indoors)\n" +
    "- Speed: Fast (up to 1.3 Gbps theoretical)\n" +
    "- Penetration: Moderate through walls\n" +
    "- Best for: Streaming, gaming, general use\n" +
    "- Most popular choice for modern devices\n\n" +
    "**6 GHz Band (Wi-Fi 6E)**\n" +
    "- Range: Shortest (up to 50 ft indoors)\n" +
    "- Speed: Fastest (up to 2.4 Gbps theoretical)\n" +
    "- Penetration: Poor through walls\n" +
    "- Best for: High-bandwidth tasks in same room\n" +
    "- Requires Wi-Fi 6E compatible devices",

    "**Which Band Should You Use?**\n\n" +
    "**Choose 2.4 GHz when:**\n" +
    "- Device is far from router (different floor)\n" +
    "- Many walls between device and router\n" +
    "- Using older devices\n" +
    "- Connecting smart home devices\n\n" +
    "**Choose 5 GHz when:**\n" +
    "- Device is within 2 rooms of router\n" +
    "- Streaming HD/4K video\n" +
    "- Gaming online\n" +
    "- Video conferencing\n\n" +
    "**Choose 6 GHz when:**\n" +
    "- Device is in same room as router\n" +
    "- Need maximum speed\n" +
    "- Using Wi-Fi 6E devices\n" +
    "- Many other networks in area (6 GHz is less congested)",
  ],

  placement: [
    "**Router Placement Best Practices**\n\n" +
    "**General Rules:**\n" +
    "1. **Central location** - Place in the middle of your home\n" +
    "2. **Elevated position** - 4-5 feet off the ground on a shelf\n" +
    "3. **Open space** - Not inside cabinets or behind TVs\n" +
    "4. **Away from interference** - Keep away from microwaves, baby monitors\n" +
    "5. **Vertical antennas** - Point straight up for horizontal coverage\n\n" +
    "**Avoid placing near:**\n" +
    "- Metal objects and appliances\n" +
    "- Concrete/brick walls (if possible)\n" +
    "- Fish tanks\n" +
    "- Mirrors\n" +
    "- Other electronics",

    "**Connection-Type Specific Placement**\n\n" +
    "**Fiber/Cable/DSL:**\n" +
    "Router placement is flexible since the modem can be anywhere. Run an Ethernet cable to position the router centrally.\n\n" +
    "**5G Home Internet:**\n" +
    "Critical difference - the gateway needs cellular signal!\n" +
    "- Place near a **window facing the cell tower**\n" +
    "- Upper floors are better\n" +
    "- Don't hide it in the center of your home\n" +
    "- Use signal strength indicators to find the best spot\n\n" +
    "**Satellite:**\n" +
    "- Dish needs clear sky view (south-facing in Northern Hemisphere)\n" +
    "- Indoor router follows standard rules - place centrally",
  ],

  troubleshooting: [
    "**Quick Troubleshooting Guide**\n\n" +
    "**No Internet Connection:**\n" +
    "1. Check if other devices connect (isolate the problem)\n" +
    "2. Restart your router (unplug 30 seconds)\n" +
    "3. Check all cables are secure\n" +
    "4. Check your ISP's status page for outages\n" +
    "5. Try connecting via Ethernet\n\n" +
    "**Slow Speeds:**\n" +
    "1. Run a speed test on different bands\n" +
    "2. Move closer to the router\n" +
    "3. Check for bandwidth-heavy apps/downloads\n" +
    "4. Restart router and modem\n" +
    "5. Update router firmware\n\n" +
    "**Intermittent Drops:**\n" +
    "1. Check for overheating (router needs ventilation)\n" +
    "2. Look for interference sources\n" +
    "3. Try a different Wi-Fi channel\n" +
    "4. Check if drops happen at specific times (congestion)\n" +
    "5. Consider a mesh system for better coverage",

    "**Advanced Troubleshooting**\n\n" +
    "**Router/Modem Lights Guide:**\n" +
    "- **Power**: Should be solid on\n" +
    "- **Internet/WAN**: Solid = connected, blinking = activity\n" +
    "- **Wi-Fi**: Should be solid or blinking\n" +
    "- **LAN**: Blinks when Ethernet devices are active\n\n" +
    "If Internet light is off or red:\n" +
    "1. Check cable from wall to modem\n" +
    "2. Restart modem (wait 5 min to reconnect)\n" +
    "3. Contact ISP - may be line issue\n\n" +
    "**DNS Issues (pages won't load but internet works):**\n" +
    "1. Try pinging 8.8.8.8\n" +
    "2. Change DNS to 8.8.8.8 or 1.1.1.1\n" +
    "3. Flush DNS cache on your device\n\n" +
    "**IP Conflict:**\n" +
    "Symptoms: Random disconnects, can't access router\n" +
    "Solution: Release/renew IP or restart router",
  ],

  setup: [
    "**Internet Setup Overview**\n\n" +
    "The setup process depends on your connection type:\n\n" +
    "**Fiber Optic:**\n" +
    "ONT box + Router via Ethernet. Fastest option.\n" +
    "Key: ONT converts light to electrical signal.\n\n" +
    "**5G Home Internet:**\n" +
    "All-in-one gateway. Place near window for signal.\n" +
    "Key: Placement determines your speed.\n\n" +
    "**Cable Internet:**\n" +
    "Coax cable + Modem + Router.\n" +
    "Key: Wait for modem activation (can take 15 min).\n\n" +
    "**DSL:**\n" +
    "Phone line + Filters + Modem + Router.\n" +
    "Key: Don't put filter on modem's jack.\n\n" +
    "**Satellite:**\n" +
    "Dish (clear sky view) + Indoor modem/router.\n" +
    "Key: Expect 500-600ms latency (normal for satellite).\n\n" +
    "Check the **Setup Guides** page for detailed step-by-step instructions for each type!",

    "**First-Time Setup Checklist**\n\n" +
    "Before you start:\n" +
    "- [ ] Have your ISP account info ready\n" +
    "- [ ] Find the equipment stickers with Wi-Fi password\n" +
    "- [ ] Locate the connection point (coax/phone jack/ONT)\n" +
    "- [ ] Have a device ready to test (phone/laptop)\n\n" +
    "During setup:\n" +
    "- [ ] Connect in the right order (modem first, then router)\n" +
    "- [ ] Wait for lights to stabilize before proceeding\n" +
    "- [ ] Don't skip the activation step\n\n" +
    "After setup:\n" +
    "- [ ] Change default admin password\n" +
    "- [ ] Update router firmware\n" +
    "- [ ] Run a speed test\n" +
    "- [ ] Set up a guest network\n" +
    "- [ ] Consider placement optimization",
  ],

  security: [
    "**Home Network Security Essentials**\n\n" +
    "**Must-Do Security Steps:**\n\n" +
    "1. **Change Default Passwords**\n" +
    "   - Change both Wi-Fi AND router admin passwords\n" +
    "   - Use strong passwords (12+ chars, mixed case, numbers, symbols)\n\n" +
    "2. **Enable Strong Encryption**\n" +
    "   - Use WPA3 if available, otherwise WPA2-AES\n" +
    "   - Never use WEP (easily cracked)\n\n" +
    "3. **Update Firmware Regularly**\n" +
    "   - Patches security vulnerabilities\n" +
    "   - Check monthly or enable auto-updates\n\n" +
    "4. **Disable WPS**\n" +
    "   - The push-button setup has known vulnerabilities\n" +
    "   - Found in router settings\n\n" +
    "5. **Create a Guest Network**\n" +
    "   - Isolates visitors from your main network\n" +
    "   - Use for IoT devices too",

    "**Advanced Security Tips**\n\n" +
    "**Network Segmentation:**\n" +
    "- Put IoT devices (smart plugs, cameras) on guest network\n" +
    "- Keeps them isolated if compromised\n\n" +
    "**Router Admin Access:**\n" +
    "- Disable remote management\n" +
    "- Change default admin username if possible\n" +
    "- Use HTTPS for router login\n\n" +
    "**Firewall:**\n" +
    "- Enable the built-in router firewall\n" +
    "- Consider blocking unused ports\n\n" +
    "**DNS Security:**\n" +
    "- Use secure DNS (Cloudflare 1.1.1.1 or Google 8.8.8.8)\n" +
    "- Consider DNS-based filtering for malware protection\n\n" +
    "**Regular Audits:**\n" +
    "- Check connected devices periodically\n" +
    "- Remove unknown devices\n" +
    "- Change Wi-Fi password annually",
  ],

  provider: [
    "**Choosing an Internet Provider**\n\n" +
    "**Connection Type Comparison:**\n\n" +
    "| Type | Speed | Latency | Availability |\n" +
    "|------|-------|---------|-------------|\n" +
    "| Fiber | 100-5000 Mbps | <10ms | Limited |\n" +
    "| Cable | 25-1200 Mbps | 15-40ms | Wide |\n" +
    "| 5G Home | 50-1000 Mbps | 20-50ms | Growing |\n" +
    "| DSL | 5-100 Mbps | 20-45ms | Wide |\n" +
    "| Satellite | 25-200 Mbps | 500-600ms | Universal |\n\n" +
    "**Priority Order (when available):**\n" +
    "1. Fiber - Best overall\n" +
    "2. Cable - Good speeds, widely available\n" +
    "3. 5G Home - Good if coverage is strong\n" +
    "4. DSL - Reliable but slower\n" +
    "5. Satellite - Last resort (high latency)",

    "**Questions to Ask Your Provider:**\n\n" +
    "1. What are the actual speeds in my area?\n" +
    "2. Are there data caps? What happens if I exceed them?\n" +
    "3. What equipment do I need? Can I use my own?\n" +
    "4. What's the contract length? Early termination fees?\n" +
    "5. Are the promotional rates, and what's the regular price?\n" +
    "6. What's included in installation?\n" +
    "7. What's the typical latency/ping?\n\n" +
    "**Red Flags:**\n" +
    "- \"Up to\" speeds with no guarantees\n" +
    "- Hidden fees (equipment rental, installation)\n" +
    "- Long contracts with price increases\n" +
    "- Low data caps with expensive overage fees",
  ],

  settings: [
    "**App Settings Guide**\n\n" +
    "**Theme Settings:**\n" +
    "- Light/Dark/System modes available\n" +
    "- System mode follows your device preference\n\n" +
    "**Font Size:**\n" +
    "- Small, Medium, Large options\n" +
    "- Affects readability throughout the app\n\n" +
    "**AI Provider:**\n" +
    "- Choose between Claude, ChatGPT, or Gemini\n" +
    "- Different providers may have different response styles\n\n" +
    "**Notifications:**\n" +
    "- Toggle app notifications on/off\n" +
    "- Useful for speed test reminders and tips\n\n" +
    "**Profile:**\n" +
    "- Update your display name\n" +
    "- Change email or password\n" +
    "- View account creation date",
  ],

  general: [
    "I'm NetAssist AI, your comprehensive internet assistant. I can help with:\n\n" +
    "- **Speed Tests**: Understanding and improving your results\n" +
    "- **Network Quality**: Diagnosing issues and optimizing performance\n" +
    "- **Router Placement**: Finding the optimal position\n" +
    "- **Setup Guides**: Step-by-step for any connection type\n" +
    "- **Troubleshooting**: Fixing common problems\n" +
    "- **Security**: Keeping your network safe\n" +
    "- **Provider Info**: Comparing options and plans\n\n" +
    "Just ask me anything about your internet setup!",
  ],
};

// Context-aware response generators
function generateSpeedTestAnalysis(result?: SpeedTestResult): string {
  if (!result) return KNOWLEDGE_BASE.speed_test[0];

  const { downloadSpeed, uploadSpeed, latency, jitter, band } = result;

  let analysis = `**Your Speed Test Analysis (${band.toUpperCase()})**\n\n`;

  // Download analysis
  if (downloadSpeed >= 300) {
    analysis += `**Download: ${downloadSpeed.toFixed(1)} Mbps** - Excellent! Great for 4K streaming, large downloads, and multiple users.\n\n`;
  } else if (downloadSpeed >= 100) {
    analysis += `**Download: ${downloadSpeed.toFixed(1)} Mbps** - Very good! Handles HD streaming and video calls easily.\n\n`;
  } else if (downloadSpeed >= 25) {
    analysis += `**Download: ${downloadSpeed.toFixed(1)} Mbps** - Good for basic streaming and browsing. Multiple simultaneous users may experience slowdowns.\n\n`;
  } else {
    analysis += `**Download: ${downloadSpeed.toFixed(1)} Mbps** - Below average. Consider upgrading your plan or optimizing your setup.\n\n`;
  }

  // Upload analysis
  if (uploadSpeed >= 25) {
    analysis += `**Upload: ${uploadSpeed.toFixed(1)} Mbps** - Excellent for video calls, streaming, and cloud backups.\n\n`;
  } else if (uploadSpeed >= 10) {
    analysis += `**Upload: ${uploadSpeed.toFixed(1)} Mbps** - Good for video calls and typical use.\n\n`;
  } else {
    analysis += `**Upload: ${uploadSpeed.toFixed(1)} Mbps** - May struggle with HD video calls or streaming.\n\n`;
  }

  // Latency analysis
  if (latency < 20) {
    analysis += `**Latency: ${latency.toFixed(0)}ms** - Excellent! Great for gaming and real-time apps.\n\n`;
  } else if (latency < 50) {
    analysis += `**Latency: ${latency.toFixed(0)}ms** - Good for most activities.\n\n`;
  } else if (latency < 100) {
    analysis += `**Latency: ${latency.toFixed(0)}ms** - Acceptable, but may notice lag in games.\n\n`;
  } else {
    analysis += `**Latency: ${latency.toFixed(0)}ms** - High latency. Video calls and gaming may be affected.\n\n`;
  }

  // Jitter
  if (jitter < 5) {
    analysis += `**Jitter: ${jitter.toFixed(0)}ms** - Very stable connection.\n`;
  } else if (jitter < 20) {
    analysis += `**Jitter: ${jitter.toFixed(0)}ms** - Acceptable stability.\n`;
  } else {
    analysis += `**Jitter: ${jitter.toFixed(0)}ms** - High jitter may cause choppy video calls.\n`;
  }

  return analysis;
}

function generateNetworkAnalysis(status?: NetworkStatus): string {
  if (!status) return KNOWLEDGE_BASE.network_diagnostics[0];

  let analysis = `**Your Network Status**\n\n`;
  analysis += `**Network:** ${status.ssid}\n`;
  analysis += `**Band:** ${status.band.toUpperCase()}\n`;
  analysis += `**Quality:** ${status.quality.charAt(0).toUpperCase() + status.quality.slice(1)}\n`;
  analysis += `**Signal:** ${status.signalStrength} dBm\n\n`;

  // Signal strength interpretation
  if (status.signalStrength > -50) {
    analysis += "**Signal Analysis:** Excellent signal strength! You're very close to the router.\n\n";
  } else if (status.signalStrength > -60) {
    analysis += "**Signal Analysis:** Good signal strength. Should work well for all activities.\n\n";
  } else if (status.signalStrength > -70) {
    analysis += "**Signal Analysis:** Fair signal. Consider moving closer to the router or adding a mesh node.\n\n";
  } else {
    analysis += "**Signal Analysis:** Weak signal. Try moving closer to the router, switching bands, or adding a Wi-Fi extender.\n\n";
  }

  // Band recommendation
  if (status.band === '2.4ghz' && status.downloadSpeed < 50) {
    analysis += "**Tip:** You're on 2.4 GHz. Try switching to 5 GHz for faster speeds if you're close to the router.";
  }

  return analysis;
}

function generatePlacementAdvice(connectionType?: ConnectionType): string {
  if (connectionType === '5g_home') {
    return "**5G Gateway Placement Guide**\n\n" +
      "Unlike traditional routers, 5G gateways need cellular signal first!\n\n" +
      "**Best Placement:**\n" +
      "1. Near a **window** facing the nearest cell tower\n" +
      "2. On an **upper floor** (higher = better signal)\n" +
      "3. Away from metal objects and thick walls\n" +
      "4. **NOT** in the center of your home\n\n" +
      "**Finding the Best Spot:**\n" +
      "1. Check the signal bars on your gateway\n" +
      "2. Move it slowly along the window wall\n" +
      "3. Wait 30 seconds at each spot\n" +
      "4. Note where you get the most bars\n" +
      "5. Try different windows/walls\n\n" +
      "**Tower Direction:**\n" +
      "Use the Placement Assistant to find your nearest tower and optimal window.";
  }

  return "**Router Placement Guide**\n\n" +
    "**Optimal Location:**\n" +
    "- **Central** in your home for even coverage\n" +
    "- **Elevated** 4-5 feet off the ground\n" +
    "- **Open space** - not in cabinets or closets\n\n" +
    "**Avoid:**\n" +
    "- Corners and edges of your home\n" +
    "- Near microwaves or cordless phones\n" +
    "- Behind TVs or large electronics\n" +
    "- In basements (unless that's your center)\n" +
    "- Near metal objects, fish tanks, or mirrors\n\n" +
    "**Antenna Position:**\n" +
    "- External antennas: Point straight up\n" +
    "- For multi-story: Angle some horizontally\n\n" +
    "**Coverage Issues?**\n" +
    "Consider a mesh Wi-Fi system for large homes or those with thick walls.";
}

// Detect the topic from message
function detectCategory(message: string, context?: AppContext): KnowledgeCategory {
  const lower = message.toLowerCase();

  // Check for greetings
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening))[\s!.,?]*$/i.test(lower.trim())) {
    return 'greeting';
  }

  // Speed test related
  if (lower.includes('speed test') || lower.includes('speedtest') || lower.includes('download speed') ||
      lower.includes('upload speed') || lower.includes('mbps') || lower.includes('bandwidth') ||
      lower.includes('my speed') || lower.includes('test result')) {
    return 'speed_test';
  }

  // Network diagnostics
  if (lower.includes('signal') || lower.includes('network quality') || lower.includes('connection quality') ||
      lower.includes('network status') || lower.includes('dbm') || lower.includes('interference') ||
      lower.includes('drop') || lower.includes('disconnect')) {
    return 'network_diagnostics';
  }

  // Wi-Fi bands
  if (lower.includes('2.4') || lower.includes('5 ghz') || lower.includes('5ghz') || lower.includes('6 ghz') ||
      lower.includes('6ghz') || lower.includes('wifi band') || lower.includes('wi-fi band') ||
      lower.includes('frequency') || lower.includes('which band')) {
    return 'wifi_bands';
  }

  // Placement
  if (lower.includes('place') || lower.includes('position') || lower.includes('where') ||
      lower.includes('location') || lower.includes('move router') || lower.includes('put router') ||
      lower.includes('antenna') || lower.includes('coverage')) {
    return 'placement';
  }

  // Troubleshooting
  if (lower.includes('slow') || lower.includes('problem') || lower.includes('issue') || lower.includes('fix') ||
      lower.includes('not working') || lower.includes('help') || lower.includes('troubleshoot') ||
      lower.includes('why is') || lower.includes("can't connect") || lower.includes('no internet')) {
    return 'troubleshooting';
  }

  // Setup
  if (lower.includes('setup') || lower.includes('set up') || lower.includes('install') ||
      lower.includes('configure') || lower.includes('start') || lower.includes('new') ||
      lower.includes('how do i') || lower.includes('how to') || lower.includes('first time')) {
    return 'setup';
  }

  // Security
  if (lower.includes('security') || lower.includes('password') || lower.includes('secure') ||
      lower.includes('hack') || lower.includes('wpa') || lower.includes('encryption') ||
      lower.includes('firewall') || lower.includes('protect')) {
    return 'security';
  }

  // Provider
  if (lower.includes('provider') || lower.includes('isp') || lower.includes('fiber') ||
      lower.includes('5g home') || lower.includes('cable internet') || lower.includes('dsl') ||
      lower.includes('satellite') || lower.includes('plan') || lower.includes('verizon') ||
      lower.includes('tmobile') || lower.includes('at&t') || lower.includes('xfinity') ||
      lower.includes('spectrum')) {
    return 'provider';
  }

  // Settings
  if (lower.includes('setting') || lower.includes('theme') || lower.includes('dark mode') ||
      lower.includes('preference') || lower.includes('notification') || lower.includes('profile') ||
      lower.includes('account')) {
    return 'settings';
  }

  // Context-aware defaults
  if (context?.currentPage === '/network') return 'network_diagnostics';
  if (context?.currentPage === '/placement') return 'placement';
  if (context?.currentPage === '/guides') return 'setup';

  return 'general';
}

let responseIndex = 0;
function pick<T>(arr: T[]): T {
  return arr[responseIndex++ % arr.length];
}

function getContextualResponse(message: string, context?: AppContext): string {
  const category = detectCategory(message, context);
  const lower = message.toLowerCase();

  // Handle specific contextual queries
  if (category === 'speed_test' && context?.speedTestResult) {
    if (lower.includes('analyz') || lower.includes('result') || lower.includes('explain') || lower.includes('how')) {
      return generateSpeedTestAnalysis(context.speedTestResult);
    }
  }

  if (category === 'network_diagnostics' && context?.networkStatus) {
    if (lower.includes('status') || lower.includes('analyz') || lower.includes('diagnos')) {
      return generateNetworkAnalysis(context.networkStatus);
    }
  }

  if (category === 'placement') {
    return generatePlacementAdvice(context?.connectionType);
  }

  // Provider-specific responses
  if (context?.providerName && (lower.includes('provider') || lower.includes('my isp'))) {
    return `You're currently set up with **${context.providerName}**.\n\n` +
      "I can help you with:\n" +
      "- Optimizing your connection for your provider\n" +
      "- Troubleshooting provider-specific issues\n" +
      "- Understanding your plan speeds\n\n" +
      "What would you like to know?";
  }

  // Return knowledge base response
  return pick(KNOWLEDGE_BASE[category]);
}

export async function sendComprehensiveMessage(
  message: string,
  _history: ChatMessage[],
  config: AIAssistantConfig
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

  return getContextualResponse(message, config.appContext);
}

export function getQuickSuggestions(context?: AppContext): string[] {
  const suggestions: string[] = [];

  // Context-aware suggestions
  if (context?.currentPage === '/dashboard') {
    suggestions.push('Analyze my network', 'Run a speed test', 'Optimize my setup');
  } else if (context?.currentPage === '/network') {
    suggestions.push('Explain my speed test', 'Which band is best?', 'Why is my speed slow?');
  } else if (context?.currentPage === '/placement') {
    suggestions.push('Best router placement', 'Fix weak signal', '5G gateway positioning');
  } else if (context?.currentPage === '/guides') {
    suggestions.push('Help with setup', 'Connection types', 'First-time checklist');
  } else if (context?.currentPage === '/settings') {
    suggestions.push('Change theme', 'Update profile', 'Notification settings');
  } else {
    suggestions.push('Help me get started', 'Troubleshoot issues', 'Security tips');
  }

  if (context?.speedTestResult) {
    suggestions.unshift('Analyze my last speed test');
  }

  return suggestions.slice(0, 4);
}
