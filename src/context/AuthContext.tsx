import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithSSO: (provider: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: '1',
  email: 'demo@netassist.app',
  displayName: 'Demo User',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  preferences: {
    theme: 'system',
    notifications: true,
    aiProvider: 'claude',
    fontSize: 'medium',
    language: 'en',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (email: string, _password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState({
      user: { ...DEMO_USER, email },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState({
      user: { ...DEMO_USER, email: 'user@gmail.com', displayName: 'Google User' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const loginWithSSO = useCallback(async (provider: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState({
      user: { ...DEMO_USER, email: `user@${provider}.com`, displayName: `${provider} User` },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const signup = useCallback(async (email: string, _password: string, displayName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState({
      user: { ...DEMO_USER, email, displayName },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        loginWithSSO,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
