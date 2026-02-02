import type { AIProvider, ChatMessage } from '../types';

interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
}

const PROVIDER_NAMES: Record<AIProvider, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
  gemini: 'Gemini (Google)',
};

// Simulated AI responses for the demo
const PLACEMENT_RESPONSES = [
  "Based on your home layout, I'd recommend placing your router in a central location, ideally elevated about 5 feet off the ground. The living room or hallway typically provides the best coverage for most homes.",
  "Looking at your room configuration, avoid placing the router near the kitchen - microwaves and other appliances can interfere with Wi-Fi signals. A central hallway location would give you the most even coverage.",
  "For your setup, I suggest placing the router away from walls and metal objects. The center of your home is ideal. If that's not possible, place it on the side of the house where you use the internet most.",
  "Your home has multiple floors, so consider placing the router on the upper floor - Wi-Fi signals travel better downward and horizontally than upward. A central closet or shelf on the upper floor would be optimal.",
];

const TROUBLESHOOTING_RESPONSES = [
  "If you're experiencing slow speeds, try these steps:\n1. Restart your router by unplugging it for 30 seconds\n2. Check for firmware updates in your router's admin panel\n3. Switch to the 5GHz band for faster speeds (2.4GHz has better range)\n4. Make sure no one is downloading large files",
  "For connectivity issues:\n1. Check all cable connections are secure\n2. Verify your ISP isn't having an outage\n3. Try connecting via ethernet to rule out Wi-Fi issues\n4. Reset your network settings on your device",
  "To improve your signal strength:\n1. Remove obstacles between your device and router\n2. Update your router's firmware\n3. Consider a mesh Wi-Fi system for larger homes\n4. Change your Wi-Fi channel to reduce interference from neighbors",
];

let messageIndex = 0;

function getSimulatedResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('place') || lower.includes('where') || lower.includes('position') || lower.includes('location')) {
    return PLACEMENT_RESPONSES[messageIndex++ % PLACEMENT_RESPONSES.length];
  }

  if (lower.includes('slow') || lower.includes('speed') || lower.includes('fast') || lower.includes('problem') || lower.includes('issue')) {
    return TROUBLESHOOTING_RESPONSES[messageIndex++ % TROUBLESHOOTING_RESPONSES.length];
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your NetAssist AI assistant. I can help you with:\n\n- **Router placement** - Finding the best spot for your router\n- **Troubleshooting** - Fixing connectivity issues\n- **Optimization** - Improving your network speed\n- **Security** - Keeping your network safe\n\nWhat would you like help with?";
  }

  if (lower.includes('security') || lower.includes('password') || lower.includes('safe')) {
    return "Here are some important security tips for your home network:\n\n1. **Change the default password** - Use a strong, unique password with letters, numbers, and symbols\n2. **Enable WPA3 encryption** - Or WPA2 if WPA3 isn't available\n3. **Hide your network name** - Disable SSID broadcast if you don't need it visible\n4. **Update firmware regularly** - This patches security vulnerabilities\n5. **Enable your firewall** - Most routers have a built-in firewall";
  }

  return "I'd be happy to help with your internet setup! Here are some things I can assist with:\n\n- Finding the best router placement for your home\n- Checking your network quality and speed\n- Troubleshooting connectivity issues\n- Security recommendations\n- General tips for better Wi-Fi coverage\n\nWhat specific help do you need?";
}

export function getProviderName(provider: AIProvider): string {
  return PROVIDER_NAMES[provider];
}

export async function sendMessage(
  message: string,
  _history: ChatMessage[],
  _config: AIConfig
): Promise<string> {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  return getSimulatedResponse(message);
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
