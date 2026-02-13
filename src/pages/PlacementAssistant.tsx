import { useState, useRef, useEffect } from 'react';
import {
  MapPin, Plus, Trash2, Wifi, MessageSquare, Send, Bot,
  Bluetooth, Nfc, ChevronDown, Lightbulb, Home, X, Globe, ExternalLink,
  Navigation, Signal, Zap,
} from 'lucide-react';
import { sendMessage } from '../services/ai';
import { scanForDevices, connectToDevice, disconnectDevice, type BLEConnectionState } from '../services/ble';
import { getProvidersByType, getMetricsByType, getConnectionTypeLabel } from '../services/providers';
import {
  getAllStates, getBandPlacementTips, getPlacementRecommendation,
  CARRIER_DISPLAY_NAMES,
} from '../services/regional5g';
import {
  getAllMetros, getNeighborhoodsByMetro, getCarrierDataForNeighborhood,
  getBestCarrierForNeighborhood, getHyperlocalPlacementTips, getNeighborhoodByZip,
  CARRIER_DISPLAY, BAND_LABELS,
} from '../services/hyperlocal5g';
import type { Room, RoomType, ChatMessage, DeviceInfo, PlacementRecommendation, ConnectionType, ISPProvider, StateData, MetroArea, Neighborhood } from '../types';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'living_room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'office', label: 'Office' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement', label: 'Basement' },
  { value: 'hallway', label: 'Hallway' },
  { value: 'other', label: 'Other' },
];

const INITIAL_PLACEMENT: PlacementRecommendation = {
  id: 'rec-1',
  position: { x: 50, y: 40 },
  roomId: 'room-1',
  score: 87,
  reasoning: 'Central location provides the best overall coverage. Elevated placement recommended.',
  tips: [
    'Place the router on a shelf about 5 feet high',
    'Keep away from the kitchen to avoid microwave interference',
    'Ensure the router is not enclosed in a cabinet',
    'Point antennas vertically for best horizontal coverage',
  ],
};

export default function PlacementAssistant() {
  const [activeTab, setActiveTab] = useState<'map' | 'chat' | 'connect'>('map');
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'room-1', name: 'Living Room', type: 'living_room', position: { x: 20, y: 20 }, dimensions: { width: 30, height: 25 } },
    { id: 'room-2', name: 'Kitchen', type: 'kitchen', position: { x: 55, y: 20 }, dimensions: { width: 20, height: 25 } },
    { id: 'room-3', name: 'Bedroom', type: 'bedroom', position: { x: 20, y: 55 }, dimensions: { width: 25, height: 25 } },
    { id: 'room-4', name: 'Office', type: 'office', position: { x: 55, y: 55 }, dimensions: { width: 20, height: 20 } },
  ]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', type: 'other' as RoomType });
  const [placement] = useState<PlacementRecommendation>(INITIAL_PLACEMENT);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your NetAssist AI placement assistant. I can help you find the best location for your router. Tell me about your home, or ask me any questions about router placement!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // BLE state
  const [bleState, setBleState] = useState<BLEConnectionState>('disconnected');
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<DeviceInfo | null>(null);

  // Provider state
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ISPProvider | null>(null);

  // Regional 5G state
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<'tmobile' | 'verizon' | 'att' | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);

  // Hyperlocal 5G state
  const [selectedMetro, setSelectedMetro] = useState<MetroArea | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [hyperlocalCarrier, setHyperlocalCarrier] = useState<'tmobile' | 'verizon' | 'att' | null>(null);
  const [zipSearch, setZipSearch] = useState('');
  const [showMetroSelector, setShowMetroSelector] = useState(false);
  const [showNeighborhoodSelector, setShowNeighborhoodSelector] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSending(true);

    const providerHint = selectedProvider
      ? `The user has ${selectedProvider.name} (${getConnectionTypeLabel(selectedProvider.connectionType)}). `
      : connectionType
        ? `The user has ${getConnectionTypeLabel(connectionType)} internet. `
        : '';
    const regionalHint = selectedState && selectedCarrier
      ? `They are in ${selectedState.name} using ${CARRIER_DISPLAY_NAMES[selectedCarrier]}. `
      : '';
    const carrierData = selectedState?.carriers.find(c => c.carrier === selectedCarrier);
    const bandHint = carrierData
      ? `The dominant band in their area is ${carrierData.dominantBand.replace('_', '-')} with ~${carrierData.avgDownload} Mbps avg. `
      : '';

    // Hyperlocal context
    const hyperlocalCarrierData = selectedNeighborhood && hyperlocalCarrier
      ? getCarrierDataForNeighborhood(selectedNeighborhood.id, hyperlocalCarrier)
      : null;
    const hyperlocalHint = selectedNeighborhood && hyperlocalCarrierData
      ? `HYPERLOCAL DATA: They are in ${selectedNeighborhood.name}, ${selectedMetro?.name}. ` +
        `Using ${CARRIER_DISPLAY[hyperlocalCarrier!]} with ${hyperlocalCarrierData.primaryBand.replace('_', '-')} band. ` +
        `Expected: ${hyperlocalCarrierData.avgDownload} Mbps down, ${hyperlocalCarrierData.avgLatency}ms latency. ` +
        `Best window direction: ${hyperlocalCarrierData.bestDirection}. ` +
        `Signal quality: ${hyperlocalCarrierData.signalQuality}. Tower proximity: ${hyperlocalCarrierData.towerProximity}. ` +
        `Building density: ${selectedNeighborhood.buildingDensity}. Local note: ${selectedNeighborhood.placementNotes} `
      : '';

    const response = await sendMessage(providerHint + regionalHint + bandHint + hyperlocalHint + userMessage.content, messages, {
      provider: 'claude',
      connectionType: connectionType ?? undefined,
    });

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsSending(false);
  };

  const handleScan = async () => {
    setDiscoveredDevices([]);
    await scanForDevices(setBleState, setDiscoveredDevices);
  };

  const handleConnect = async (deviceId: string) => {
    const device = await connectToDevice(deviceId, setBleState);
    if (device) {
      setConnectedDevice(device);
    }
  };

  const handleDisconnect = async () => {
    await disconnectDevice(setBleState);
    setConnectedDevice(null);
  };

  const addRoom = () => {
    if (!newRoom.name.trim()) return;
    const room: Room = {
      id: `room-${Date.now()}`,
      name: newRoom.name,
      type: newRoom.type,
      position: { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 },
      dimensions: { width: 20, height: 20 },
    };
    setRooms(prev => [...prev, room]);
    setNewRoom({ name: '', type: 'other' });
    setShowAddRoom(false);
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    if (selectedRoom === id) setSelectedRoom(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Placement Assistant</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Find the optimal spot for your router</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl mb-6">
        {[
          { id: 'map' as const, label: 'Room Map', icon: Home },
          { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
          { id: 'connect' as const, label: 'Connect', icon: Bluetooth },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Room Map Tab */}
      {activeTab === 'map' && (
        <div>
          {/* Floor plan visualization */}
          <div className="card mb-6 !p-0 overflow-hidden">
            <div className="relative w-full aspect-[4/3] bg-[var(--color-bg-secondary)]">
              {/* Grid background */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Rooms */}
              {rooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                  className={`absolute border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                    selectedRoom === room.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-lg'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)]/80 hover:border-[var(--color-primary)]/50'
                  }`}
                  style={{
                    left: `${room.position.x}%`,
                    top: `${room.position.y}%`,
                    width: `${room.dimensions?.width || 20}%`,
                    height: `${room.dimensions?.height || 20}%`,
                  }}
                >
                  <div className="text-center p-2">
                    <p className="text-xs font-medium text-[var(--color-text)] truncate">{room.name}</p>
                    {room.signalStrength !== undefined && (
                      <p className="text-[10px] text-[var(--color-text-muted)]">{room.signalStrength} dBm</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Router placement marker */}
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${placement.position.x}%`,
                  top: `${placement.position.y}%`,
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary)]/30 w-12 h-12 -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }} />
                  <div className="relative gradient-bg p-2.5 rounded-full shadow-lg">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Room list and actions */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Rooms</h2>
            <button
              onClick={() => setShowAddRoom(true)}
              className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>

          {/* Add room form */}
          {showAddRoom && (
            <div className="card mb-4 !p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[var(--color-text)]">Add a Room</h3>
                <button onClick={() => setShowAddRoom(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Room name"
                  value={newRoom.name}
                  onChange={e => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field flex-1 !py-2"
                />
                <div className="relative">
                  <select
                    value={newRoom.type}
                    onChange={e => setNewRoom(prev => ({ ...prev, type: e.target.value as RoomType }))}
                    className="input-field !py-2 appearance-none pr-8"
                  >
                    {ROOM_TYPES.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                </div>
                <button onClick={addRoom} className="btn-primary !py-2 !px-4 text-sm">Add</button>
              </div>
            </div>
          )}

          {/* Room cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {rooms.map(room => (
              <div key={room.id} className={`card !p-4 flex items-center justify-between ${selectedRoom === room.id ? '!border-[var(--color-primary)]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)]">
                    <Home className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{room.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] capitalize">{room.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeRoom(room.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Placement recommendation */}
          <div className="card !border-[var(--color-primary)]/30 !bg-blue-50/50 dark:!bg-blue-900/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl gradient-bg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">Recommended Placement</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-[var(--color-text-secondary)]">Score:</span>
                  <span className="text-sm font-bold text-[var(--color-primary)]">{placement.score}/100</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{placement.reasoning}</p>
            <div className="space-y-2">
              {placement.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--color-text-secondary)]">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Provider-specific placement tips */}
          <div className="card mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Globe className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">Your Internet Provider</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Get placement tips specific to your provider</p>
              </div>
            </div>

            {/* Connection type selector */}
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Connection type</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['fiber', '5g_home', 'cable', 'dsl', 'satellite'] as ConnectionType[]).map(ct => (
                <button
                  key={ct}
                  onClick={() => { setConnectionType(ct); setSelectedProvider(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    connectionType === ct
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  {getConnectionTypeLabel(ct)}
                </button>
              ))}
            </div>

            {/* Provider selector */}
            {connectionType && (
              <>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Your provider</p>
                <div className="space-y-2 mb-4">
                  {getProvidersByType(connectionType).map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)}
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

                {/* Metrics for connection type */}
                {(() => {
                  const metrics = getMetricsByType(connectionType);
                  if (!metrics) return null;
                  return (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 text-center">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Avg Down</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{metrics.avgDown}</p>
                      </div>
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 text-center">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Avg Up</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{metrics.avgUp}</p>
                      </div>
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 text-center">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Latency</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{metrics.avgLatency}</p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Provider-specific tips */}
            {selectedProvider && (
              <div className="border-t border-[var(--color-border)] pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">{selectedProvider.name} Placement Tips</h4>
                  <a
                    href={`https://${selectedProvider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:underline"
                  >
                    {selectedProvider.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="space-y-2">
                  {selectedProvider.placementTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--color-text-secondary)]">{tip}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-text)]">Typical speeds: </span>
                    {selectedProvider.typicalDown} down / {selectedProvider.typicalUp} up / {selectedProvider.typicalLatency} latency
                  </p>
                </div>
              </div>
            )}

            {!connectionType && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                Select your connection type above to see provider-specific placement advice
              </p>
            )}
          </div>

          {/* Regional 5G Placement Intelligence (for 5G connections) */}
          {connectionType === '5g_home' && (
            <div className="card mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <Navigation className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Regional 5G Intelligence</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Location-specific placement recommendations</p>
                </div>
              </div>

              {/* State selector */}
              <button
                onClick={() => setShowStateSelector(!showStateSelector)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-all mb-4"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">
                    {selectedState ? selectedState.name : 'Select your state'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showStateSelector ? 'rotate-180' : ''}`} />
              </button>

              {showStateSelector && (
                <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {getAllStates().map(state => (
                    <button
                      key={state.code}
                      onClick={() => { setSelectedState(state); setShowStateSelector(false); setSelectedCarrier(null); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-bg-secondary)] transition-colors ${
                        selectedState?.code === state.code ? 'bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{state.name}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">Best: {CARRIER_DISPLAY_NAMES[state.bestCarrier]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedState && (
                <>
                  {/* Carrier comparison for selected state */}
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Carriers in {selectedState.name}</p>
                  <div className="space-y-2 mb-4">
                    {selectedState.carriers.map(carrier => (
                      <button
                        key={carrier.carrier}
                        onClick={() => setSelectedCarrier(selectedCarrier === carrier.carrier ? null : carrier.carrier)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedCarrier === carrier.carrier
                            ? 'border-purple-500 bg-purple-500/5'
                            : 'border-[var(--color-border)] hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              carrier.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              carrier.rank === 2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                              'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>#{carrier.rank}</span>
                            <span className="text-sm font-medium text-[var(--color-text)]">{carrier.carrierName}</span>
                          </div>
                          <span className="text-xs font-bold text-purple-500">{carrier.avgDownload} Mbps</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                          <span>↑ {carrier.avgUpload} Mbps</span>
                          <span>{carrier.avgLatency}ms latency</span>
                          <span>{carrier.coverage5gPercent}% 5G coverage</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Top cities in state */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {selectedState.topCities.slice(0, 3).map(city => (
                      <div key={city.name} className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 text-center">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5 truncate">{city.name}</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{city.avgDownload} Mbps</p>
                        {city.has5GUltra && <span className="text-[8px] text-purple-500">5G Ultra</span>}
                      </div>
                    ))}
                  </div>

                  {/* Terrain notes */}
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-900/10 mb-4">
                    <div className="flex items-start gap-2">
                      <Signal className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">{selectedState.terrainNotes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Band-specific placement tips */}
              {selectedState && selectedCarrier && (() => {
                const recommendation = getPlacementRecommendation(selectedState.code, selectedCarrier);
                const carrierData = selectedState.carriers.find(c => c.carrier === selectedCarrier);
                const bandTips = carrierData ? getBandPlacementTips(carrierData.dominantBand) : null;
                if (!recommendation || !bandTips) return null;

                return (
                  <div className="border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <h4 className="text-sm font-semibold text-[var(--color-text)]">
                        {bandTips.label} Placement Tips
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="rounded-xl bg-purple-50/70 dark:bg-purple-900/10 p-2.5">
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-0.5">Penetration</p>
                        <p className="text-xs font-medium text-[var(--color-text)]">{bandTips.penetration.split('—')[0]}</p>
                      </div>
                      <div className="rounded-xl bg-purple-50/70 dark:bg-purple-900/10 p-2.5">
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-0.5">Expected Speed</p>
                        <p className="text-xs font-medium text-[var(--color-text)]">{bandTips.speedRange}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {recommendation.tips.slice(0, 5).map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-[var(--color-text-secondary)]">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {!selectedState && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  Select your state above to see regional 5G performance and placement recommendations
                </p>
              )}
            </div>
          )}

          {/* Hyperlocal 5G Intelligence (for 5G connections with metro data) */}
          {connectionType === '5g_home' && (
            <div className="card mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Hyperlocal 5G Intelligence</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Neighborhood-level placement recommendations</p>
                </div>
              </div>

              {/* Zip code search */}
              <div className="mb-4">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Search by zip code</p>
                <div className="relative">
                  <input
                    type="text"
                    value={zipSearch}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setZipSearch(val);
                      if (val.length === 5) {
                        const neighborhood = getNeighborhoodByZip(val);
                        if (neighborhood) {
                          const metros = getAllMetros();
                          const metro = metros.find(m => m.neighborhoods.some(n => n.id === neighborhood.id));
                          if (metro) {
                            setSelectedMetro(metro);
                            setSelectedNeighborhood(neighborhood);
                            setShowMetroSelector(false);
                            setShowNeighborhoodSelector(false);
                          }
                        }
                      }
                    }}
                    placeholder="Enter zip code (e.g., 10001)"
                    className="input-field !py-2 pr-20"
                  />
                  {zipSearch.length === 5 && !getNeighborhoodByZip(zipSearch) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500">Not found</span>
                  )}
                  {zipSearch.length === 5 && getNeighborhoodByZip(zipSearch) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500">Found!</span>
                  )}
                </div>
              </div>

              <div className="text-center text-xs text-[var(--color-text-muted)] mb-4">— or select manually —</div>

              {/* Metro selector */}
              <button
                onClick={() => setShowMetroSelector(!showMetroSelector)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 transition-all mb-3"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">
                    {selectedMetro ? selectedMetro.name : 'Select your metro area'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showMetroSelector ? 'rotate-180' : ''}`} />
              </button>

              {showMetroSelector && (
                <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {getAllMetros().map(metro => (
                    <button
                      key={metro.id}
                      onClick={() => {
                        setSelectedMetro(metro);
                        setSelectedNeighborhood(null);
                        setHyperlocalCarrier(null);
                        setShowMetroSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-bg-secondary)] transition-colors ${
                        selectedMetro?.id === metro.id ? 'bg-emerald-500/5 text-emerald-600' : 'text-[var(--color-text)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{metro.name}, {metro.stateCode}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{metro.avgDownload} Mbps avg</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Neighborhood selector */}
              {selectedMetro && (
                <>
                  <button
                    onClick={() => setShowNeighborhoodSelector(!showNeighborhoodSelector)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 transition-all mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text)]">
                        {selectedNeighborhood ? selectedNeighborhood.name : 'Select your neighborhood'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showNeighborhoodSelector ? 'rotate-180' : ''}`} />
                  </button>

                  {showNeighborhoodSelector && (
                    <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                      {getNeighborhoodsByMetro(selectedMetro.id).map(neighborhood => {
                        const bestCarrier = getBestCarrierForNeighborhood(neighborhood.id);
                        return (
                          <button
                            key={neighborhood.id}
                            onClick={() => {
                              setSelectedNeighborhood(neighborhood);
                              setHyperlocalCarrier(null);
                              setShowNeighborhoodSelector(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-bg-secondary)] transition-colors ${
                              selectedNeighborhood?.id === neighborhood.id ? 'bg-emerald-500/5 text-emerald-600' : 'text-[var(--color-text)]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{neighborhood.name}</span>
                              {bestCarrier && (
                                <span className="text-xs font-bold text-emerald-500">{bestCarrier.avgDownload} Mbps</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                              <span>{neighborhood.towerCount} towers</span>
                              <span>•</span>
                              <span>{neighborhood.buildingDensity} density</span>
                              {bestCarrier && (
                                <>
                                  <span>•</span>
                                  <span>Best: {CARRIER_DISPLAY[bestCarrier.carrier]}</span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Neighborhood details and carrier selection */}
              {selectedNeighborhood && (
                <>
                  {/* Neighborhood info card */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/10 mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Signal className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{selectedNeighborhood.name}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedNeighborhood.placementNotes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-emerald-700 dark:text-emerald-300">
                      <span>{selectedNeighborhood.towerCount} cell towers</span>
                      <span>{selectedNeighborhood.terrainType.replace('_', ' ')}</span>
                      <span>ZIP: {selectedNeighborhood.zipCodes.slice(0, 3).join(', ')}{selectedNeighborhood.zipCodes.length > 3 ? '...' : ''}</span>
                    </div>
                  </div>

                  {/* Carrier comparison for neighborhood */}
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Carriers in {selectedNeighborhood.name}</p>
                  <div className="space-y-2 mb-4">
                    {selectedNeighborhood.carriers
                      .sort((a, b) => b.avgDownload - a.avgDownload)
                      .map((carrier, idx) => (
                        <button
                          key={carrier.carrier}
                          onClick={() => setHyperlocalCarrier(hyperlocalCarrier === carrier.carrier ? null : carrier.carrier)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            hyperlocalCarrier === carrier.carrier
                              ? 'border-emerald-500 bg-emerald-500/5'
                              : 'border-[var(--color-border)] hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                idx === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>#{idx + 1}</span>
                              <span className="text-sm font-medium text-[var(--color-text)]">{CARRIER_DISPLAY[carrier.carrier]}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                                {BAND_LABELS[carrier.primaryBand].split(' ')[0]}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">{carrier.avgDownload} Mbps</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                            <span>↑ {carrier.avgUpload} Mbps</span>
                            <span>{carrier.avgLatency}ms</span>
                            <span className={`${
                              carrier.signalQuality === 'excellent' ? 'text-emerald-500' :
                              carrier.signalQuality === 'good' ? 'text-blue-500' :
                              carrier.signalQuality === 'fair' ? 'text-amber-500' : 'text-red-500'
                            }`}>{carrier.signalQuality} signal</span>
                            <span>Best: {carrier.bestDirection}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </>
              )}

              {/* Hyperlocal placement tips */}
              {selectedNeighborhood && hyperlocalCarrier && (() => {
                const tips = getHyperlocalPlacementTips(selectedNeighborhood.id, hyperlocalCarrier);
                const carrierData = getCarrierDataForNeighborhood(selectedNeighborhood.id, hyperlocalCarrier);
                if (!tips.length || !carrierData) return null;

                return (
                  <div className="border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-semibold text-[var(--color-text)]">
                          Hyperlocal Placement Tips for {CARRIER_DISPLAY[hyperlocalCarrier]}
                        </h4>
                      </div>
                    </div>

                    {/* Direction indicator */}
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="relative w-16 h-16">
                        {/* Compass rose */}
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-200 dark:border-emerald-800" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center transform ${
                            carrierData.bestDirection === 'north' ? '-translate-y-3' :
                            carrierData.bestDirection === 'south' ? 'translate-y-3' :
                            carrierData.bestDirection === 'east' ? 'translate-x-3' :
                            carrierData.bestDirection === 'west' ? '-translate-x-3' :
                            carrierData.bestDirection === 'northeast' ? 'translate-x-2 -translate-y-2' :
                            carrierData.bestDirection === 'northwest' ? '-translate-x-2 -translate-y-2' :
                            carrierData.bestDirection === 'southeast' ? 'translate-x-2 translate-y-2' :
                            carrierData.bestDirection === 'southwest' ? '-translate-x-2 translate-y-2' : ''
                          }`}>
                            <Navigation className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] text-emerald-600">N</span>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] text-emerald-600">S</span>
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[8px] text-emerald-600">W</span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-emerald-600">E</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          Best Direction: {carrierData.bestDirection === 'any' ? 'Any (flexible)' : carrierData.bestDirection.toUpperCase()}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                          {carrierData.bestDirection === 'any'
                            ? 'Excellent coverage from all directions — choose based on Wi-Fi needs'
                            : `Position gateway facing ${carrierData.bestDirection} for optimal signal`}
                        </p>
                      </div>
                    </div>

                    {/* Tips list */}
                    <div className="space-y-3">
                      {tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                            tip.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                            tip.priority === 'high' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            tip.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Lightbulb className={`w-3 h-3 ${
                              tip.priority === 'critical' ? 'text-red-500' :
                              tip.priority === 'high' ? 'text-amber-500' :
                              tip.priority === 'medium' ? 'text-blue-500' :
                              'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--color-text)]">{tip.tip}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{tip.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expected performance */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-900/10 p-2.5 text-center">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">Download</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{carrierData.avgDownload} Mbps</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-900/10 p-2.5 text-center">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">Upload</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{carrierData.avgUpload} Mbps</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-900/10 p-2.5 text-center">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">Latency</p>
                        <p className="text-xs font-bold text-[var(--color-text)]">{carrierData.avgLatency} ms</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {!selectedMetro && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  Enter a zip code or select your metro area for hyperlocal 5G recommendations
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <div className="card !p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant' ? 'gradient-bg' : 'bg-[var(--color-bg-tertiary)]'
                }`}>
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-semibold text-[var(--color-text)]">You</span>
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3.5 ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-2xl rounded-bl-md p-3.5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about router placement..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="input-field !py-2.5"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isSending}
                className="btn-primary !py-2.5 !px-4"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Tab (BLE/NFC) */}
      {activeTab === 'connect' && (
        <div>
          {/* Connection status */}
          {connectedDevice && (
            <div className="card mb-6 !border-[var(--color-success)]/30 !bg-green-50/50 dark:!bg-green-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <Wifi className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{connectedDevice.name}</p>
                    <p className="text-xs text-[var(--color-success)]">Connected via {connectedDevice.connectionType.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={handleDisconnect} className="text-sm text-red-500 hover:underline font-medium">
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Scan options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleScan}
              disabled={bleState === 'scanning'}
              className="card !p-5 text-left hover:scale-[1.01] transition-transform"
            >
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 inline-block mb-3">
                <Bluetooth className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">Bluetooth (BLE)</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Scan for nearby routers using Bluetooth Low Energy
              </p>
              {bleState === 'scanning' && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-xs text-blue-500">Scanning...</span>
                </div>
              )}
            </button>

            <button
              onClick={handleScan}
              className="card !p-5 text-left hover:scale-[1.01] transition-transform"
            >
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 inline-block mb-3">
                <Nfc className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">NFC Tap</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Tap your phone on the router to connect instantly
              </p>
            </button>
          </div>

          {/* Discovered devices */}
          {discoveredDevices.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                Discovered Devices ({discoveredDevices.length})
              </h2>
              <div className="space-y-3">
                {discoveredDevices.map(device => (
                  <div key={device.id} className="card !p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)]">
                        <Wifi className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{device.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {device.manufacturer} {device.model} | {device.signalStrength} dBm
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(device.id)}
                      disabled={bleState === 'connecting'}
                      className="btn-primary !py-1.5 !px-3 text-xs"
                    >
                      {bleState === 'connecting' ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {discoveredDevices.length === 0 && bleState === 'disconnected' && !connectedDevice && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <Bluetooth className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-[var(--color-text)] font-medium mb-2">No devices found</h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
                Use the scan options above to find nearby routers and network devices
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
