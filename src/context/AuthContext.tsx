import { createContext, ReactNode, useState } from 'react';

// Substitua pelo IP da sua máquina
export const API_URL = 'http://192.168.1.121:3000/api';

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