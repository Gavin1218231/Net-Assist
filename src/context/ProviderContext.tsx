/* eslint-disable react-refresh/only-export-components */
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

function loadFromStorage(): { connectionType: ConnectionType | null; provider: ISPProvider | null; setupCompleted: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        connectionType: data.connectionType ?? null,
        provider: data.providerId ? getProviderById(data.providerId) ?? null : null,
        setupCompleted: data.setupCompleted ?? false,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { connectionType: null, provider: null, setupCompleted: false };
}

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(() => loadFromStorage());
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(initialState.connectionType);
  const [provider, setProvider] = useState<ISPProvider | null>(initialState.provider);
  const [setupCompleted, setSetupCompleted] = useState(initialState.setupCompleted);

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
