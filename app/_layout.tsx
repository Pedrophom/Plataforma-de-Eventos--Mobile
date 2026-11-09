import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav() {
  const { token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    // Se NÃO tem token e NÃO está na pasta (auth) -> vai para o login
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } 
    // Se JÁ TEM token e tenta entrar na área de (auth) -> vai para a tela principal
    else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [token, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}