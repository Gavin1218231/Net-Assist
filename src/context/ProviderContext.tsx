import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ConnectionType, ISPProvider } from '../types';
import { getProviderById } from '../services/providers';

interface ProviderContextType {
  connectionType: ConnectionType | null;
  provider: ISPProvider | null;
  setConnectionType: (type: ConnectionType | null) => void;
  setProvider: (provider: ISPProvider | null) => void;
  setupCompleted: boolean;
  markSetupComplete: () => void;
  clearProvider: () => void;
}

const ProviderContext = createContext<ProviderContextType | null>(null);

const STORAGE_KEY = 'netassist-provider';

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [provider, setProvider] = useState<ISPProvider | null>(null);
  const [setupCompleted, setSetupCompleted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.connectionType) setConnectionType(data.connectionType);
        if (data.providerId) {
          const p = getProviderById(data.providerId);
          if (p) setProvider(p);
        }
        if (data.setupCompleted) setSetupCompleted(true);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    const data = {
      connectionType,
      providerId: provider?.id ?? null,
      setupCompleted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [connectionType, provider, setupCompleted]);

  const markSetupComplete = () => {
    setSetupCompleted(true);
  };

  const clearProvider = () => {
    setConnectionType(null);
    setProvider(null);
    setSetupCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProviderContext.Provider value={{
      connectionType,
      provider,
      setConnectionType,
      setProvider,
      setupCompleted,
      markSetupComplete,
      clearProvider,
    }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}
