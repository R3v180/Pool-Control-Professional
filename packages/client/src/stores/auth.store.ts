// filename: packages/client/src/stores/auth.store.ts
// version: 1.0.1 (FIXED)
// description: Desacopla el store de @prisma/client.

import { create } from 'zustand';

// --- Tipos desacoplados del backend ---
// Definimos los tipos explícitamente en el frontend.
// Esto mantiene la separación entre cliente y servidor.
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'MANAGER';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type ViewAsRole = 'MANAGER' | 'ADMIN' | 'TECHNICIAN';

interface AuthState {
  user: User | null;
  activeView: ViewAsRole;
  setAuthState: (user: User | null, activeView: ViewAsRole) => void;
}

/**
 * Creamos el store de Zustand.
 * Este store contendrá el estado de autenticación que necesita ser
 * accesible fuera de los componentes de React, como en nuestro apiClient.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeView: 'MANAGER',
  setAuthState: (user, activeView) => set({ user, activeView }),
}));