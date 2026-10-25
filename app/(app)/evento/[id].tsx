import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL, AuthContext } from '../../../src/context/AuthContext';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  imagem: string | null;
}

export default function DetalhesEventoMobile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useContext(AuthContext); 

  const [evento, setEvento] = useState<Evento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processandoInscricao, setProcessandoInscricao] = useState(false);

  useEffect(() => {
    const carregarEvento = async () => {
      try {
        const resposta = await fetch(`${API_URL}/events/${id}`);
        const dados = await resposta.json();
        if (resposta.ok) {
          setEvento(dados);
        } else {
          Alert.alert("Erro", "Evento não encontrado.");
          router.back();
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao conectar ao servidor.");
      } finally {
        setCarregando(false);
      }
    };

    if (id) carregarEvento();
  }, [id]);

  const handleInscricao = async () => {
    setProcessandoInscricao(true);
    try {
      const resposta = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ eventoId: id }),
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Inscrição realizada com sucesso. Vemo-nos lá!");
        router.back(); 
      } else {
        const dados = await resposta.json();
        Alert.alert("Aviso", dados.erro || "Não foi possível realizar a inscrição.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na conexão ao tentar inscrever.");
    } finally {
      setProcessandoInscricao(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00823b" />
        <Text style={styles.loadingText}>A carregar detalhes...</Text>
      </View>
    );
  }

  if (!evento) return null;

  return (
    <>
      {/* Configura o cabeçalho nativo: botão de voltar automático, título correto e cores do IFMA */}
      <Stack.Screen 
        options={{ 
          title: "Detalhes do Evento",
          headerStyle: { backgroundColor: '#00823b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {evento.imagem ? (
          <Image source={{ uri: evento.imagem }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sem Imagem</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{evento.titulo}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Data: {evento.data}</Text>
            <Text style={styles.infoText}>Horário: {evento.horario}</Text>
            <Text style={styles.infoText}>Local: {evento.local}</Text>
          </View>

          <Text style={styles.sectionTitle}>Sobre o Evento</Text>
          <Text style={styles.description}>{evento.descricao}</Text>

          <TouchableOpacity 
            style={styles.subscribeButton} 
            onPress={handleInscricao}
            disabled={processandoInscricao}
          >
            {processandoInscricao ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.subscribeButtonText}>Inscrever-se no Evento</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  loadingText: { marginTop: 10, color: '#374151', fontSize: 16 },
  image: { width: '100%', height: 250, backgroundColor: '#e5e7eb' },
  placeholderImage: { width: '100%', height: 200, backgroundColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#6b7280', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 2, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  infoText: { fontSize: 15, color: '#374151', marginBottom: 8, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24, marginBottom: 30 },
  subscribeButton: { backgroundColor: '#00823b', paddingVertical: 18, borderRadius: 12, alignItems: 'center', elevation: 3 },
  subscribeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});