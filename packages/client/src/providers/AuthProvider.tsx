// filename: packages/client/src/providers/AuthProvider.tsx
// version: 2.1.0 (FEAT: Synchronize with Zustand store)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { PropsWithChildren } from 'react';
import apiClient from '../api/apiClient.js';
// --- ✅ 1. IMPORTAR EL HOOK DEL STORE ---
import { useAuthStore } from '../stores/auth.store.js';

// --- Tipos ---
type LoginCredentials = {
  email: string;
  password: string;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'MANAGER';
}

export type ViewAsRole = 'MANAGER' | 'ADMIN' | 'TECHNICIAN';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeView: ViewAsRole;
  setViewAs: (role: ViewAsRole) => void;
  activeRole: User['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewAsRole>('MANAGER');

  // --- ✅ 2. OBTENER LA FUNCIÓN PARA ACTUALIZAR EL STORE ---
  const setAuthStateInStore = useAuthStore((state) => state.setAuthState);

  // --- ✅ 3. SINCRONIZAR EL ESTADO LOCAL CON EL STORE ---
  // Cada vez que el usuario o la vista activa cambien, actualizamos el store.
  useEffect(() => {
    setAuthStateInStore(user, activeView);
  }, [user, activeView, setAuthStateInStore]);


  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      const loggedUser: User = response.data.data;
      setUser(loggedUser);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'TECHNICIAN') {
        setActiveView(loggedUser.role);
      } else {
        setActiveView('MANAGER');
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const loggedUser: User = response.data.data;
    setUser(loggedUser);
    if (loggedUser.role === 'ADMIN' || loggedUser.role === 'TECHNICIAN') {
      setActiveView(loggedUser.role);
    } else {
      setActiveView('MANAGER');
    }
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
  };

  const setViewAs = (role: ViewAsRole) => {
    if (user?.role === 'MANAGER') {
      setActiveView(role);
    }
  };

  const activeRole = useMemo(() => {
    if (!user) return null;
    if (user.role === 'MANAGER') {
      return activeView;
    }
    return user.role;
  }, [user, activeView]);


  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    activeView,
    setViewAs,
    activeRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};