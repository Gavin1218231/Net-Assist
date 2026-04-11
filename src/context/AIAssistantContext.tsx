import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useProvider } from './ProviderContext';
import { sendComprehensiveMessage, getQuickSuggestions, resetResponseIndex, type AppContext } from '../services/comprehensiveAI';
import type { ChatMessage, NetworkStatus, SpeedTestResult, Recommendation, AIProvider } from '../types';

interface AIAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  suggestions: string[];
  unreadCount: number;
}

interface AIAssistantContextType extends AIAssistantState {
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  minimizeAssistant: () => void;
  maximizeAssistant: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  updateNetworkStatus: (status: NetworkStatus) => void;
  updateSpeedTestResult: (result: SpeedTestResult) => void;
  updateRecommendations: (recs: Recommendation[]) => void;
  markAsRead: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm NetAssist AI, your comprehensive internet assistant. I can help with speed tests, network diagnostics, router placement, setup guides, troubleshooting, and more.\n\nWhat would you like help with?",
  timestamp: new Date().toISOString(),
};

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { provider, connectionType, setupCompleted } = useProvider();

  // Assistant UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // App context for AI
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | undefined>();
  const [speedTestResult, setSpeedTestResult] = useState<SpeedTestResult | undefined>();
  const [recommendations, setRecommendations] = useState<Recommendation[] | undefined>();

  // Build app context - memoize to avoid stale closures
  const appContextRef = useRef<AppContext>({
    currentPage: location.pathname,
    connectionType: connectionType || undefined,
    providerName: provider?.name,
    networkStatus,
    speedTestResult,
    recommendations,
    setupCompleted,
  });

  // Keep ref updated
  useEffect(() => {
    appContextRef.current = {
      currentPage: location.pathname,
      connectionType: connectionType || undefined,
      providerName: provider?.name,
      networkStatus,
      speedTestResult,
      recommendations,
      setupCompleted,
    };
  }, [location.pathname, connectionType, provider?.name, networkStatus, speedTestResult, recommendations, setupCompleted]);

  // Get suggestions based on context
  const suggestions = getQuickSuggestions(appContextRef.current);

  // Reset unread when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    if (isOpen && !isMinimized) {
      closeAssistant();
    } else {
      openAssistant();
    }
  }, [isOpen, isMinimized, openAssistant, closeAssistant]);

  const minimizeAssistant = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeAssistant = useCallback(() => {
    setIsMinimized(false);
    setUnreadCount(0);
  }, []);

  // Use ref for isMinimized to avoid stale closure in sendMessage
  const isMinimizedRef = useRef(isMinimized);
  useEffect(() => {
    isMinimizedRef.current = isMinimized;
  }, [isMinimized]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message first
    setMessages(prev => [...prev, userMessage]);

    // Then start async operation separately to avoid race condition
    setIsLoading(true);

    (async () => {
      try {
        // Get current messages including the user message we just added
        const currentMessages = [...messages, userMessage];
        const aiProvider: AIProvider = 'claude';
        const response = await sendComprehensiveMessage(content, currentMessages, {
          provider: aiProvider,
          appContext: appContextRef.current,
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        };

        setMessages(prevMsgs => [...prevMsgs, assistantMessage]);

        // Increment unread if minimized
        if (isMinimizedRef.current) {
          setUnreadCount(prevCount => prevCount + 1);
        }
      } catch {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages(prevMsgs => [...prevMsgs, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isLoading, messages]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setUnreadCount(0);
    resetResponseIndex(); // Reset response cycling for fresh experience
  }, []);

  const updateNetworkStatus = useCallback((status: NetworkStatus) => {
    setNetworkStatus(status);
  }, []);

  const updateSpeedTestResult = useCallback((result: SpeedTestResult) => {
    setSpeedTestResult(result);
  }, []);

  const updateRecommendations = useCallback((recs: Recommendation[]) => {
    setRecommendations(recs);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        isMinimized,
        messages,
        isLoading,
        suggestions,
        unreadCount,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        minimizeAssistant,
        maximizeAssistant,
        sendMessage,
        clearMessages,
        updateNetworkStatus,
        updateSpeedTestResult,
        updateRecommendations,
        markAsRead,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}
