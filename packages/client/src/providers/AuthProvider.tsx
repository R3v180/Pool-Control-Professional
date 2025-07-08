import {
  createContext,
  useContext,
  useState,
  useEffect,
  // useCallback, // No se usa por ahora
} from 'react';
import type { PropsWithChildren } from 'react';
import apiClient from '../api/apiClient.js';

// --- Types ---
// Este tipo define los datos que necesita la función de login.
// Lo definimos aquí en el cliente.
type LoginCredentials = {
  email: string;
  password: string;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // La función para comprobar el estado de la sesión se deja comentada
  // hasta que el endpoint del backend '/api/auth/me' esté creado.
  /*
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  */

  useEffect(() => {
    // Por ahora, asumimos que no hay sesión al iniciar la app
    // y simplemente terminamos el estado de carga.
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    setUser(response.data.data);
  };

  const logout = async () => {
    // TODO: Create a '/api/auth/logout' endpoint on the backend
    await apiClient.post('/auth/logout');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};