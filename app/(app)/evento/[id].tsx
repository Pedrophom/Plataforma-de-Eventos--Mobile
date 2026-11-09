import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL, useAuth } from '../../../src/context/AuthContext';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  imagem?: string;
}

export default function DetalhesEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [jaInscrito, setJaInscrito] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        try {
          setCarregando(true);
          
          // 1. Busca os detalhes do evento
          const resEvento = await fetch(`${API_URL}/events/${id}`);
          if (resEvento.ok) {
            const dadosEvento = await resEvento.json();
            setEvento(dadosEvento);
          }

          // 2. Busca as inscrições do usuário para saber se já está inscrito
          const resInscricoes = await fetch(`${API_URL}/my-registrations`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (resInscricoes.ok) {
            const dadosInscricoes = await resInscricoes.json();
            const inscricoes = Array.isArray(dadosInscricoes) ? dadosInscricoes : [];
            const inscrito = inscricoes.some((item: any) => item?.evento?.id === id);
            setJaInscrito(inscrito);
          }
        } catch (error) {
          console.error("Erro ao carregar detalhes:", error);
        } finally {
          setCarregando(false);
        }
      };

      if (id) carregarDados();
    }, [id, token])
  );

  const handleInscricao = async () => {
    if (jaInscrito) return;

    setInscrevendo(true);
    try {
      const resposta = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventoId: id })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Inscrição realizada com sucesso!");
        setJaInscrito(true);
      } else {
        Alert.alert("Atenção", dados.message || dados.erro || "Não foi possível realizar a inscrição.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setInscrevendo(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: true, title: 'Detalhes do Evento', headerStyle: { backgroundColor: '#00823b' }, headerTintColor: '#fff' }} />
        <ActivityIndicator size="large" color="#00823b" />
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: true, title: 'Detalhes do Evento', headerStyle: { backgroundColor: '#00823b' }, headerTintColor: '#fff' }} />
        <Text style={styles.errorText}>Evento não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Cabeçalho nativo do Expo Router com setinha de voltar */}
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: evento.titulo || 'Detalhes do Evento', 
          headerStyle: { backgroundColor: '#00823b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {evento.imagem ? (
          <Image source={{ uri: evento.imagem }} style={styles.bannerImage} resizeMode="cover" />
        ) : null}

        <View style={styles.content}>
          <Text style={styles.title}>{evento.titulo}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Data: </Text>{evento.data}</Text>
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Horário: </Text>{evento.horario}</Text>
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Local: </Text>{evento.local}</Text>
          </View>

          <Text style={styles.sectionTitle}>Sobre o Evento</Text>
          <Text style={styles.description}>{evento.descricao || "Sem descrição disponível."}</Text>

          {/* O Botão só aparece se o aluno NÃO estiver inscrito */}
          {!jaInscrito ? (
            <TouchableOpacity 
              style={styles.buttonSubscribe} 
              onPress={handleInscricao}
              disabled={inscrevendo}
            >
              {inscrevendo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonSubscribeText}>Inscrever-se no Evento</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.badgeInscrito}>
              <Ionicons name="checkmark-circle" size={24} color="#00823b" />
              <Text style={styles.badgeInscritoText}>Você já está inscrito neste evento</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  errorText: { color: '#6b7280', fontSize: 16 },
  container: { paddingBottom: 40 },
  bannerImage: { width: '100%', height: 200 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  infoCard: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  infoText: { fontSize: 15, color: '#374151', marginBottom: 6 },
  infoLabel: { fontWeight: 'bold', color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 25 },
  buttonSubscribe: { backgroundColor: '#00823b', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonSubscribeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  badgeInscrito: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e6f4ea', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#a7f3d0', marginTop: 10 },
  badgeInscritoText: { color: '#00823b', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
});