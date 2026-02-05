import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Check, Lightbulb, MessageSquare, Send, Bot,
  Zap, Radio, Cable, Phone, Satellite, ArrowRight, Globe, ExternalLink,
  ChevronDown as ChevronDownIcon, PartyPopper,
} from 'lucide-react';
import { sendMessage } from '../services/ai';
import { getProvidersByType, getMetricsByType } from '../services/providers';
import { useProvider } from '../context/ProviderContext';
import type { ConnectionType, SetupGuide, ChatMessage, ISPProvider } from '../types';

const GUIDES: SetupGuide[] = [
  {
    id: 'fiber',
    connectionType: 'fiber',
    title: 'Fiber Optic',
    description: 'Fastest available. Uses light through thin glass fibers.',
    icon: 'zap',
    steps: [
      { id: 'f1', title: 'Locate the ONT box', description: 'Find the Optical Network Terminal (ONT) installed by your provider. It is usually a white box mounted on an interior wall near where the fiber cable enters your home.', tip: 'The ONT converts the light signal from the fiber cable into an electrical signal your router can use.' },
      { id: 'f2', title: 'Connect the router to the ONT', description: 'Use the Ethernet cable provided to connect the ONT\'s LAN/Ethernet port to your router\'s WAN/Internet port. Make sure both cables click firmly into place.' },
      { id: 'f3', title: 'Power on both devices', description: 'Plug in the ONT first and wait for its lights to stabilize (usually 1-2 minutes). Then plug in your router and wait for the Wi-Fi light to turn on.', tip: 'If the ONT has a battery backup, make sure it is charged.' },
      { id: 'f4', title: 'Connect to Wi-Fi', description: 'On your phone or computer, open Wi-Fi settings and look for your network name (SSID). It is usually printed on a sticker on the bottom or back of the router.' },
      { id: 'f5', title: 'Enter the password', description: 'Type the Wi-Fi password from the same sticker. This is sometimes called the "network key" or "WPA key".' },
      { id: 'f6', title: 'Test your connection', description: 'Open a web browser and visit any website to confirm you are online. You can also use the Speed Test feature in this app to verify your speeds.' },
    ],
  },
  {
    id: '5g_home',
    connectionType: '5g_home',
    title: '5G Home Internet',
    description: 'Wireless broadband using cellular 5G towers.',
    icon: 'radio',
    steps: [
      { id: '5g1', title: 'Unbox the 5G gateway', description: 'Remove the 5G gateway device from its box. It is an all-in-one unit that acts as both a modem and Wi-Fi router.' },
      { id: '5g2', title: 'Find the best window spot', description: 'Place the gateway near a window that faces the nearest cell tower. Avoid basements and interior rooms.', tip: 'Most 5G gateways have signal-strength indicator lights. Move the device around and wait 30 seconds at each spot to find the strongest signal.' },
      { id: '5g3', title: 'Plug in and power on', description: 'Connect the power cable and turn on the gateway. Wait 3-5 minutes for it to find and lock onto the 5G signal. The status lights will stop blinking when ready.' },
      { id: '5g4', title: 'Activate the device', description: 'Follow the activation instructions from your carrier. This usually involves scanning a QR code or visiting a setup website from a phone connected to the gateway\'s Wi-Fi.' },
      { id: '5g5', title: 'Connect your devices', description: 'Find the Wi-Fi network name and password on the sticker on the gateway. Connect your phone, tablet, or computer to this network.' },
      { id: '5g6', title: 'Optimize placement', description: 'If speeds are slower than expected, try elevating the gateway (a high shelf works well) or rotating it. Even a small change in position can improve signal.', tip: 'Use this app\'s Placement Assistant for AI-powered positioning help.' },
    ],
  },
  {
    id: 'cable',
    connectionType: 'cable',
    title: 'Cable Internet',
    description: 'Delivered through coaxial TV cable lines.',
    icon: 'cable',
    steps: [
      { id: 'c1', title: 'Find the coaxial outlet', description: 'Locate an active coaxial cable outlet in your home. It looks like a round threaded connector, the same type used for cable TV.' },
      { id: 'c2', title: 'Connect the modem', description: 'Screw the coaxial cable into the back of your cable modem. Then connect the modem\'s power adapter and turn it on.', tip: 'If you have a combined modem/router (gateway), skip step 3.' },
      { id: 'c3', title: 'Connect the router', description: 'Use an Ethernet cable to connect the modem\'s Ethernet port to the router\'s WAN port. Then power on the router.' },
      { id: 'c4', title: 'Wait for activation', description: 'The modem lights will cycle through as it connects to your provider\'s network. This can take 5-15 minutes on first setup. Wait until the "Online" light is solid.', tip: 'If lights keep blinking after 20 minutes, call your ISP to confirm the modem is activated on your account.' },
      { id: 'c5', title: 'Connect to Wi-Fi', description: 'Find your router\'s Wi-Fi name and password on the label sticker. Open Wi-Fi settings on your device and connect using those credentials.' },
      { id: 'c6', title: 'Verify your connection', description: 'Open a browser and navigate to any website. Run this app\'s Speed Test to check your speeds match what your plan offers.' },
    ],
  },
  {
    id: 'dsl',
    connectionType: 'dsl',
    title: 'DSL Internet',
    description: 'Uses existing telephone lines for internet.',
    icon: 'phone',
    steps: [
      { id: 'd1', title: 'Install DSL filters', description: 'Plug a DSL filter (small box included in your setup kit) into every phone jack that has a telephone connected. This prevents interference between voice calls and internet.', tip: 'Do NOT put a filter on the jack used for the DSL modem itself.' },
      { id: 'd2', title: 'Connect the DSL modem', description: 'Plug a phone cable from the wall jack into the modem\'s DSL/Line port. Use the cable that came with the modem, not a regular phone cord.' },
      { id: 'd3', title: 'Connect modem to router', description: 'Use an Ethernet cable to connect the modem\'s Ethernet port to your router\'s WAN port. If your modem has built-in Wi-Fi, you may skip this step.' },
      { id: 'd4', title: 'Power on and wait', description: 'Plug in the modem and router. The DSL light on the modem will blink while it synchronizes with your provider. Wait until it turns solid (may take 5-10 minutes).', tip: 'DSL speeds depend on your distance from the telephone exchange. Closer is faster.' },
      { id: 'd5', title: 'Connect to Wi-Fi', description: 'Find the Wi-Fi name and password on your router\'s sticker. Connect your devices using these credentials.' },
      { id: 'd6', title: 'Test and troubleshoot', description: 'Visit a website to confirm connectivity. If the DSL light never goes solid, make sure you are using the correct phone jack and that no filter is on that jack.' },
    ],
  },
  {
    id: 'satellite',
    connectionType: 'satellite',
    title: 'Satellite Internet',
    description: 'Beams internet from satellites in orbit.',
    icon: 'satellite',
    steps: [
      { id: 's1', title: 'Choose the dish location', description: 'The satellite dish needs a clear, unobstructed view of the sky. Avoid trees, buildings, and overhangs. South-facing locations work best in the Northern Hemisphere.', tip: 'Most providers include professional installation. Confirm with your provider before self-installing.' },
      { id: 's2', title: 'Mount and align the dish', description: 'Follow the mounting instructions to secure the dish to your roof, wall, or pole. Use the provider\'s app or alignment tool to point it at the correct satellite.' },
      { id: 's3', title: 'Run the cable inside', description: 'Route the coaxial cable from the dish to the location where you want your modem/router. Use weatherproof cable clips and seal any holes with silicone.' },
      { id: 's4', title: 'Connect the indoor equipment', description: 'Connect the dish cable to the satellite modem. Then connect the modem to your Wi-Fi router with an Ethernet cable. Power on both devices.' },
      { id: 's5', title: 'Activate your service', description: 'Follow your provider\'s activation steps, usually through their website or app. The modem will download configuration data from the satellite.', tip: 'Satellite internet has higher latency (500-600ms) than other types. This is normal and due to the signal traveling to space and back.' },
      { id: 's6', title: 'Connect and test', description: 'Join your Wi-Fi network and test your connection. Satellite works well for browsing and streaming but may feel sluggish for video calls due to latency.' },
    ],
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  radio: Radio,
  cable: Cable,
  phone: Phone,
  satellite: Satellite,
};

const COLOR_MAP: Record<ConnectionType, string> = {
  fiber: '#8b5cf6',
  '5g_home': '#3b82f6',
  cable: '#f59e0b',
  dsl: '#06b6d4',
  satellite: '#10b981',
};

export default function SetupGuides() {
  const navigate = useNavigate();
  const { setConnectionType: saveConnectionType, setProvider: saveProvider, markSetupComplete } = useProvider();

  const [selectedGuide, setSelectedGuide] = useState<SetupGuide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);

  // Provider selection
  const [selectedProvider, setSelectedProvider] = useState<ISPProvider | null>(null);
  const [showProviders, setShowProviders] = useState(false);

  // AI chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openGuide = (guide: SetupGuide) => {
    setSelectedGuide(guide);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setSelectedProvider(null);
    setShowProviders(false);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `I'm here to help you set up your ${guide.title} internet connection. If you get stuck on any step or have questions, just ask me!`,
      timestamp: new Date().toISOString(),
    }]);
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsSending(true);

    const step = selectedGuide?.steps[currentStep];
    const providerHint = selectedProvider ? ` Their provider is ${selectedProvider.name}.` : '';
    const contextHint = step
      ? `The user is on step ${currentStep + 1} ("${step.title}") of setting up ${selectedGuide?.title} internet.${providerHint} `
      : '';
    const response = await sendMessage(contextHint + userMsg.content, messages, {
      provider: 'claude',
      connectionType: selectedGuide?.connectionType,
    });

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    }]);
    setIsSending(false);
  };

  /* ── Guide list view ── */
  if (!selectedGuide) {
    return (
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Setup Guides</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Step-by-step instructions for your connection type</p>
        </div>

        <div className="space-y-3">
          {GUIDES.map(guide => {
            const Icon = ICON_MAP[guide.icon] || Zap;
            const color = COLOR_MAP[guide.connectionType];
            const metrics = getMetricsByType(guide.connectionType);
            const providers = getProvidersByType(guide.connectionType);
            return (
              <button
                key={guide.id}
                onClick={() => openGuide(guide)}
                className="card w-full !p-4 text-left hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)]">{guide.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{guide.description}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{guide.steps.length} steps</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                </div>
                {metrics && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
                      <span>Avg: {metrics.avgDown} down</span>
                      <span>{metrics.avgLatency} latency</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      Providers: {providers.map(p => p.name).join(', ')}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Guide detail view ── */
  const step = selectedGuide.steps[currentStep];
  const color = COLOR_MAP[selectedGuide.connectionType];
  const allDone = selectedGuide.steps.every(s => completedSteps.has(s.id));

  return (
    <div className="page-container">
      {/* Back / title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { setSelectedGuide(null); setShowChat(false); }}
          className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--color-text)]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">{selectedGuide.title} Setup</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Step {currentStep + 1} of {selectedGuide.steps.length}
            {allDone && ' — All complete!'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {selectedGuide.steps.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(idx)}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              backgroundColor: completedSteps.has(s.id) ? color : idx === currentStep ? `${color}80` : 'var(--color-bg-tertiary)',
            }}
          />
        ))}
      </div>

      {/* Provider selection */}
      <div className="card mb-4">
        <button
          onClick={() => setShowProviders(!showProviders)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
              <Globe className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {selectedProvider ? selectedProvider.name : 'Select your provider'}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {selectedProvider ? `${selectedProvider.typicalDown} down` : 'For provider-specific setup notes'}
              </p>
            </div>
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showProviders ? 'rotate-180' : ''}`} />
        </button>

        {showProviders && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
            {getProvidersByType(selectedGuide.connectionType).map(provider => (
              <button
                key={provider.id}
                onClick={() => { setSelectedProvider(selectedProvider?.id === provider.id ? null : provider); setShowProviders(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedProvider?.id === provider.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">{provider.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{provider.typicalDown} down</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedProvider && !showProviders && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">{selectedProvider.setupNotes}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-[10px] text-[var(--color-text-muted)]">
                <span>{selectedProvider.typicalDown} down</span>
                <span>{selectedProvider.typicalUp} up</span>
                <span>{selectedProvider.typicalLatency} latency</span>
              </div>
              <a
                href={`https://${selectedProvider.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:underline"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Current step card */}
      <div className="card mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{step.title}</h2>
          <button
            onClick={() => markStepComplete(step.id)}
            className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
              completedSteps.has(step.id)
                ? 'border-[var(--color-success)] bg-[var(--color-success)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            }`}
          >
            {completedSteps.has(step.id) && <Check className="w-4 h-4 text-white" />}
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{step.description}</p>

        {step.tip && (
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-900/10">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">{step.tip}</p>
          </div>
        )}
      </div>

      {/* Step navigation */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {currentStep < selectedGuide.steps.length - 1 ? (
          <button
            onClick={() => { markStepComplete(step.id); setCurrentStep(currentStep + 1); }}
            className="flex-1 btn-primary !py-2.5 text-sm"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={() => {
              markStepComplete(step.id);
              // Check if all will be done after this click
              const willBeAllDone = selectedGuide.steps.every(s => s.id === step.id || completedSteps.has(s.id));
              if (willBeAllDone || allDone) {
                // Save provider to context and go to dashboard
                saveConnectionType(selectedGuide.connectionType);
                if (selectedProvider) saveProvider(selectedProvider);
                markSetupComplete();
                navigate('/dashboard');
              }
            }}
            className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {allDone && <PartyPopper className="w-4 h-4" />}
            {allDone ? 'Finish Setup' : 'Mark Complete'}
          </button>
        )}
      </div>

      {/* AI help toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="card w-full !p-3 flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        {showChat ? 'Hide AI Assistant' : 'Need help? Ask AI Assistant'}
      </button>

      {/* AI chat panel */}
      {showChat && (
        <div className="card mt-4 !p-0 overflow-hidden flex flex-col" style={{ height: '350px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  msg.role === 'assistant' ? 'gradient-bg text-white' : 'bg-[var(--color-bg-tertiary)]'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : 'You'}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about this step..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="input-field !py-2"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isSending}
                className="btn-primary !py-2 !px-3"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
