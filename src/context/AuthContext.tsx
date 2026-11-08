import { createContext, ReactNode, useState } from 'react';
import { MEU_IP } from '../services/api'; // Importa a variável do ficheiro api.ts

// Monta a URL dinamicamente usando a mesma variável
export const API_URL = `http://${MEU_IP}:3000/api`;

interface AuthContextData {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const signIn = (newToken: string) => {
    setToken(newToken);
  };

  const signOut = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}