import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      // Esta configuração global garante que todas as telas nasçam com a cor correta
      screenOptions={{
        headerStyle: { backgroundColor: '#00823b' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* A tela principal fica sem cabeçalho porque já desenhámos um à mão */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Pré-configura o título, eliminando o "evento/[id]" momentâneo */}
      <Stack.Screen name="evento/[id]" options={{ title: 'Detalhes do Evento' }} />
      
      {/* Pré-configura as inscrições */}
      <Stack.Screen name="minhas-inscricoes" options={{ title: 'Minhas Inscrições' }} />
    </Stack>
  );
}