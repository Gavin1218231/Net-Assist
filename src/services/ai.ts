import type { AIProvider, ChatMessage, ConnectionType } from '../types';

interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  connectionType?: ConnectionType;
}

const PROVIDER_NAMES: Record<AIProvider, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
  gemini: 'Gemini (Google)',
};

// ── Connection-type-specific placement advice ──

const PLACEMENT_BY_TYPE: Record<ConnectionType, string[]> = {
  fiber: [
    "With fiber, your router connects to the ONT box via Ethernet, so placement is flexible. Put the router in the **center of your home**, elevated about 5 feet high on a shelf. Keep it away from walls and metal objects for the best Wi-Fi coverage.\n\nSince fiber gives you high speeds at the source, the main goal is spreading that signal evenly through Wi-Fi.",
    "Fiber routers work best in a **central, open area**. Avoid closets or cabinets — they block the signal. If the ONT is near an exterior wall, use a longer Ethernet cable to move the router to a more central spot.\n\n**Tip:** Point the antennas vertically for the widest horizontal spread.",
  ],
  '5g_home': [
    "5G home internet is different from other setups — the gateway receives its signal from a **nearby cell tower**, so placement is critical.\n\n**Best location:** Place the gateway **near a window** that faces the cell tower, ideally on the **upper floor**. Avoid basements, interior rooms, and thick exterior walls.\n\n**Tip:** Most 5G gateways have signal-strength LED bars. Move it slowly along the window wall, wait 30 seconds at each spot, and note where you get the most bars.",
    "For 5G home internet, think of your gateway like a cell phone — it needs a clear path to the tower. Place it:\n\n1. **By a window** (preferably facing the nearest tower)\n2. **Elevated** — a high shelf or window sill works well\n3. **Away from metal** objects, mirrors, and appliances\n4. **Not in a cabinet** or enclosed space\n\nUnlike traditional routers, the 5G gateway needs strong outdoor signal first, then it broadcasts Wi-Fi indoors from that spot.",
    "Your 5G gateway should be placed where it can get the **strongest cellular signal**, which is usually:\n\n- Near a window on the **side of your home facing the cell tower**\n- On the **highest floor** available\n- Away from thick concrete walls and metal fixtures\n\nDo NOT place it in the center of your home — that's advice for traditional routers with a wired connection. 5G gateways need to \"see\" the tower first.",
  ],
  cable: [
    "With cable internet, your modem connects to a **coaxial outlet** on the wall, which limits where the modem can go. However, you can place the **router** further away using a longer Ethernet cable.\n\n**Ideal setup:** Keep the modem near the coax outlet, then run an Ethernet cable to your router positioned in the **center of your home**, elevated on a shelf.\n\nAvoid placing the router near the kitchen (microwaves cause 2.4 GHz interference) or next to large metal objects.",
    "For cable internet, the modem stays near the coax jack, but your router can go anywhere you can run an Ethernet cable to.\n\n1. **Central location** in your home for even coverage\n2. **Elevated** 4-5 feet off the ground\n3. **Open space** — not inside a cabinet or behind the TV\n4. **Away from interference** sources like microwaves and baby monitors\n\n**Tip:** If you have a combined modem/router (gateway), ask your ISP about using it in bridge mode with a separate router in a better spot.",
  ],
  dsl: [
    "With DSL, the modem plugs into a **phone jack**, so its location is somewhat fixed. Here's how to optimize:\n\n1. Use the phone jack **closest to where the phone line enters your home** — this gives the strongest DSL signal\n2. Run an Ethernet cable from the modem to your router in a **central location**\n3. Keep the router elevated and in an open space\n\n**Important:** Make sure you have DSL filters on all other phone jacks with phones attached, but NOT on the modem's jack.",
    "DSL performance depends on the quality of the phone line. For the best setup:\n\n- Connect the modem to the **main phone jack** (shortest line run from the street)\n- If speeds are slow, try different phone jacks — some may have better wiring\n- Place your **router centrally** using an Ethernet cable from the modem\n- Keep the router elevated and away from interference sources\n\n**Tip:** DSL speed drops with distance from the telephone exchange. If you're far away, even perfect placement won't fix that — consider upgrading to cable or fiber if available.",
  ],
  satellite: [
    "Satellite internet has two parts: the **outdoor dish** and the **indoor modem/router**.\n\n**Dish placement:**\n- Needs a **clear, unobstructed view of the sky** (especially southern sky in the Northern Hemisphere)\n- Avoid trees, buildings, and overhangs\n- Mount securely — wind can shift alignment\n\n**Indoor router placement:**\n- Place the router in a **central location** inside your home\n- Elevate it on a shelf for best Wi-Fi coverage\n- The cable from the dish gives you flexibility on where to put the router indoors\n\n**Note:** Satellite internet has higher latency (500-600ms) which can't be fixed by placement — it's the time for signals to travel to/from orbit.",
    "For satellite internet setup:\n\n1. The **dish** needs clear sky view — south-facing is typically best\n2. Run the cable from the dish to your chosen indoor location\n3. Place the **router centrally** in your home for even Wi-Fi coverage\n4. Elevate it and keep it in an open space\n\n**Keep in mind:** Satellite is affected by heavy rain and snow (\"rain fade\"). Good dish alignment and a clear sky path help minimize weather disruptions. Placement of the indoor router follows standard Wi-Fi rules — central, elevated, open.",
  ],
};

// ── Connection-type-specific troubleshooting ──

const TROUBLESHOOTING_BY_TYPE: Record<ConnectionType, string[]> = {
  fiber: [
    "Troubleshooting fiber internet:\n\n1. **Check the ONT lights** — the \"PON\" or \"Optical\" light should be solid green. If it's off or red, the fiber line may be damaged (call your ISP)\n2. **Restart properly** — unplug the ONT for 30 seconds, wait for it to fully boot (2 min), then restart your router\n3. **Check the Ethernet cable** between ONT and router — try a different cable\n4. **Test with a direct connection** — plug a laptop directly into the ONT via Ethernet to rule out router issues\n5. **Check for firmware updates** on your router",
  ],
  '5g_home': [
    "Troubleshooting 5G home internet:\n\n1. **Check signal bars** on the gateway — if low, move it closer to a window or higher up\n2. **Restart the gateway** by unplugging for 30 seconds\n3. **Check for tower outages** — your carrier's app or website will show service status\n4. **Reduce interference** — move the gateway away from other electronics, especially other wireless devices\n5. **Try a different window** — the nearest tower may be in a different direction than you expect\n6. **Check for obstructions** — new construction, trees with leaves, or even parked vehicles can affect signal\n\n**Note:** 5G speeds vary significantly by time of day due to tower congestion. Slow speeds in the evening are common.",
  ],
  cable: [
    "Troubleshooting cable internet:\n\n1. **Check coax connections** — make sure the cable is finger-tight at both the wall and modem\n2. **Restart modem and router** — unplug modem for 30 seconds, wait for online light, then restart router\n3. **Check for splitters** — each coax splitter reduces signal. Remove unnecessary splitters\n4. **Look for damaged cables** — bent, crimped, or chewed coax cables cause problems\n5. **Check modem signal levels** — log into your modem (usually 192.168.100.1) and check downstream power levels\n6. **Contact ISP** — cable internet issues are often on the provider's end (node congestion, line damage)",
  ],
  dsl: [
    "Troubleshooting DSL internet:\n\n1. **Check DSL light on modem** — if blinking, the line isn't syncing. Try a different phone jack\n2. **Verify DSL filters** — every phone on the line needs a filter EXCEPT the modem jack\n3. **Test without filters** — unplug all phones and filters, connect only the modem to isolate the issue\n4. **Check for line noise** — pick up a phone on the same line. If you hear crackling, there's a wiring issue\n5. **Try a shorter phone cable** — long or old phone cables can degrade DSL signal\n6. **Restart modem** — unplug for 30 seconds and wait 5 minutes for resync\n\n**Note:** DSL speeds are limited by your distance from the telephone exchange. If you're far away, slow speeds may be the maximum available.",
  ],
  satellite: [
    "Troubleshooting satellite internet:\n\n1. **Check weather** — heavy rain, snow, or thick clouds cause \"rain fade\" and slow speeds. Wait for clear weather\n2. **Inspect the dish** — look for snow/ice buildup, bird nests, or shifted alignment after storms\n3. **Check all cables** — the coax from dish to modem should be undamaged with tight connections\n4. **Restart the modem** — unplug for 30 seconds. Satellite modems can take 3-5 minutes to reacquire signal\n5. **Check data cap** — many satellite plans throttle speeds after you hit a monthly limit\n6. **Verify dish alignment** — even a small shift from wind can drop your connection. Professional realignment may be needed\n\n**Reminder:** Satellite internet always has ~500-600ms latency. This makes video calls choppy and online gaming difficult — that's a limitation of the technology, not a problem to fix.",
  ],
};

// ── Connection-type-specific setup help ──

const SETUP_BY_TYPE: Record<ConnectionType, string> = {
  fiber: "Here's what you need for fiber setup:\n\n1. Your ISP installs the fiber cable and **ONT** (Optical Network Terminal) box\n2. Connect the ONT to your router with an Ethernet cable\n3. Power on the ONT first, then the router\n4. Find your Wi-Fi name and password on the router sticker\n5. Connect your devices\n\nFiber is the fastest option available — you should see speeds matching your plan almost exactly. If not, the issue is usually the router or Wi-Fi, not the fiber itself.",
  '5g_home': "Here's what you need for 5G home internet setup:\n\n1. Unbox the 5G **gateway** (it's an all-in-one modem and router)\n2. **Find the best window spot** — near a window facing the nearest cell tower, upper floor preferred\n3. Plug it in and wait 3-5 minutes for it to lock onto the 5G signal\n4. Activate through your carrier's app or website\n5. Connect your devices to the gateway's Wi-Fi\n\n**Key difference from other types:** The gateway needs to be near a window for tower signal, NOT in the center of your home. Center placement is wrong for 5G.",
  cable: "Here's what you need for cable internet setup:\n\n1. Find an active **coaxial outlet** (same type used for cable TV)\n2. Connect the coax cable to your **cable modem**\n3. Connect the modem to your **router** via Ethernet (or use a combined gateway)\n4. Power on modem first, wait for \"Online\" light (5-15 min on first use)\n5. Connect to Wi-Fi using credentials on the router sticker\n\n**Tip:** If the modem won't activate, call your ISP — they may need to register the modem's MAC address.",
  dsl: "Here's what you need for DSL internet setup:\n\n1. Install **DSL filters** on every phone jack with a phone (NOT the modem jack)\n2. Connect the **DSL modem** to a phone jack using the included cable\n3. Connect the modem to your **router** via Ethernet\n4. Power on and wait for the DSL light to go solid (5-10 min)\n5. Connect to Wi-Fi\n\n**Important:** Use the phone jack closest to where the line enters your home for the best signal. DSL speed depends heavily on line quality and distance from the exchange.",
  satellite: "Here's what you need for satellite internet setup:\n\n1. Install the **dish** with a clear, unobstructed view of the sky (south-facing in Northern Hemisphere)\n2. Align the dish using your provider's alignment tool or app\n3. Run the **cable** from the dish to your indoor modem location\n4. Connect and power on the modem and router\n5. Activate through your provider\n\n**Expect higher latency** (500-600ms) — this is normal for satellite. Good for browsing and streaming, but video calls and gaming will feel laggy.",
};

// ── General (no connection type specified) ──

const GENERAL_PLACEMENT = [
  "The best placement depends on your connection type! Here's a quick summary:\n\n- **Fiber / Cable / DSL:** Router goes in the **center of your home**, elevated on a shelf\n- **5G Home:** Gateway goes **near a window facing the cell tower**, on an upper floor\n- **Satellite:** Dish needs clear sky; indoor router goes centrally\n\nWhat type of internet connection do you have? I can give you specific advice.",
];

const GENERAL_TROUBLESHOOTING = [
  "Here are universal troubleshooting steps:\n\n1. **Restart your router** — unplug for 30 seconds, then reconnect\n2. **Check all cables** — make sure everything is firmly connected\n3. **Test with Ethernet** — plug directly into the router to rule out Wi-Fi issues\n4. **Check your ISP's status page** — outages are common\n5. **Update router firmware** — old firmware causes slowdowns and drops\n\nFor more specific help, tell me your connection type (fiber, 5G, cable, DSL, or satellite) and I'll give targeted advice.",
];

// ── Detect connection type from message context ──

function detectConnectionType(message: string): ConnectionType | null {
  const lower = message.toLowerCase();
  if (lower.includes('fiber') || lower.includes('ont') || lower.includes('optical')) return 'fiber';
  if (lower.includes('5g') || lower.includes('gateway') || lower.includes('cellular') || lower.includes('tower')) return '5g_home';
  if (lower.includes('cable') || lower.includes('coax') || lower.includes('coaxial')) return 'cable';
  if (lower.includes('dsl') || lower.includes('phone line') || lower.includes('telephone')) return 'dsl';
  if (lower.includes('satellite') || lower.includes('dish') || lower.includes('starlink') || lower.includes('hughesnet') || lower.includes('viasat')) return 'satellite';
  return null;
}

function detectTopic(message: string): 'placement' | 'troubleshooting' | 'setup' | 'security' | 'greeting' | 'general' {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'greeting';
  if (lower.includes('place') || lower.includes('where') || lower.includes('position') || lower.includes('location') || lower.includes('put') || lower.includes('move') || lower.includes('window') || lower.includes('center')) return 'placement';
  if (lower.includes('slow') || lower.includes('problem') || lower.includes('issue') || lower.includes('not working') || lower.includes('dropped') || lower.includes('disconnect') || lower.includes('fix') || lower.includes('help') || lower.includes('troubleshoot')) return 'troubleshooting';
  if (lower.includes('setup') || lower.includes('install') || lower.includes('connect') || lower.includes('start') || lower.includes('begin') || lower.includes('new') || lower.includes('how do i') || lower.includes('how to')) return 'setup';
  if (lower.includes('security') || lower.includes('password') || lower.includes('safe') || lower.includes('hack') || lower.includes('wpa')) return 'security';
  return 'general';
}

let responseIndex = 0;

function pick<T>(arr: T[]): T {
  return arr[responseIndex++ % arr.length];
}

function getSimulatedResponse(message: string, configType?: ConnectionType): string {
  // Detect connection type from message or from config context
  const detectedType = detectConnectionType(message) || configType || null;
  const topic = detectTopic(message);

  if (topic === 'greeting') {
    return "Hello! I'm your NetAssist AI assistant. I can help you with:\n\n- **Router placement** — finding the best spot for your specific connection type\n- **Setup walkthrough** — step-by-step for fiber, 5G, cable, DSL, or satellite\n- **Troubleshooting** — fixing connectivity and speed issues\n- **Security** — keeping your network safe\n\nWhat type of internet do you have, and what do you need help with?";
  }

  if (topic === 'security') {
    return "Here are important security steps for your home network:\n\n1. **Change the default password** — use a strong, unique password with letters, numbers, and symbols\n2. **Enable WPA3 encryption** — or WPA2 if WPA3 isn't available\n3. **Update firmware regularly** — patches security vulnerabilities\n4. **Disable WPS** — the push-button setup feature has known vulnerabilities\n5. **Create a guest network** — keep visitors off your main network\n6. **Enable the built-in firewall** — most routers have one, make sure it's turned on\n7. **Change the admin login** — don't leave it as admin/admin or admin/password";
  }

  if (topic === 'placement') {
    if (detectedType) {
      return pick(PLACEMENT_BY_TYPE[detectedType]);
    }
    return pick(GENERAL_PLACEMENT);
  }

  if (topic === 'troubleshooting') {
    if (detectedType) {
      return pick(TROUBLESHOOTING_BY_TYPE[detectedType]);
    }
    return pick(GENERAL_TROUBLESHOOTING);
  }

  if (topic === 'setup') {
    if (detectedType) {
      return SETUP_BY_TYPE[detectedType];
    }
    return "I can walk you through setup for any connection type:\n\n- **Fiber** — ONT box + router\n- **5G Home** — cellular gateway placement\n- **Cable** — coaxial modem + router\n- **DSL** — phone line + filters + modem\n- **Satellite** — dish alignment + modem\n\nWhich type do you have? Or check out the **Setup Guides** page for full step-by-step walkthroughs.";
  }

  // General fallback — still try to be connection-type-aware
  if (detectedType) {
    return SETUP_BY_TYPE[detectedType];
  }

  return "I'd be happy to help with your internet setup! I can give specific advice for:\n\n- **Fiber** — fastest, uses ONT box\n- **5G Home** — cellular gateway, window placement matters\n- **Cable** — coaxial connection\n- **DSL** — phone line based\n- **Satellite** — dish alignment and latency info\n\nTell me your connection type and what you need help with, and I'll give you targeted advice. You can also check the **Setup Guides** page for step-by-step walkthroughs.";
}

export function getProviderName(provider: AIProvider): string {
  return PROVIDER_NAMES[provider];
}

export async function sendMessage(
  message: string,
  _history: ChatMessage[],
  config: AIConfig
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  return getSimulatedResponse(message, config.connectionType);
}

export function getAvailableProviders(): { id: AIProvider; name: string; description: string }[] {
  return [
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic\'s helpful, harmless, and honest AI assistant',
    },
    {
      id: 'openai',
      name: 'ChatGPT',
      description: 'OpenAI\'s powerful language model',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google\'s multimodal AI model',
    },
  ];
}
