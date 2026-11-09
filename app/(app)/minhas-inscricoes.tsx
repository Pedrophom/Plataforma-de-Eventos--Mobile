import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL, useAuth } from '../../src/context/AuthContext';

interface Inscricao {
  id: string;
  evento: {
    id: string;
    titulo: string;
    data: string;
    horario: string;
    local: string;
  };
}

export default function MinhasInscricoes() {
  const router = useRouter();
  const { token } = useAuth();
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarInscricoes = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setInscricoes(Array.isArray(dados) ? dados : []);
      }
    } catch (error) {
      console.error("Erro ao buscar inscrições:", error);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarInscricoes();
    }, [token])
  );

  const handleCancelarInscricao = async (inscricaoId: string) => {
    Alert.alert(
      "Cancelar Inscrição",
      "Tem certeza que deseja cancelar a sua inscrição neste evento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await fetch(`${API_URL}/registrations/${inscricaoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              if (resposta.ok) {
                Alert.alert("Sucesso", "Inscrição cancelada.");
                carregarInscricoes();
              } else {
                Alert.alert("Erro", "Não foi possível cancelar a inscrição.");
              }
            } catch (error) {
              Alert.alert("Erro", "Falha na conexão com o servidor.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Inscricao }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.evento.titulo}</Text>
      <Text style={styles.cardInfo}>Data: {item.evento.data} às {item.evento.horario}</Text>
      <Text style={styles.cardInfo}>Local: {item.evento.local}</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.buttonDetails}
          onPress={() => router.push(`/(app)/evento/${item.evento.id}` as any)}
        >
          <Text style={styles.buttonDetailsText}>Ver Detalhes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonCancel}
          onPress={() => handleCancelarInscricao(item.id)}
        >
          <Text style={styles.buttonCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Adiciona o cabeçalho verde com o botão voltar e empurra a lista para baixo da barra de status */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Minhas Inscrições',
          headerStyle: { backgroundColor: '#00823b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      {carregando ? (
        <ActivityIndicator size="large" color="#00823b" style={{ marginTop: 40 }} />
      ) : inscricoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não possui inscrições ativas.</Text>
        </View>
      ) : (
        <FlatList
          data={inscricoes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#6b7280', fontSize: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#00823b' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  buttonDetails: { backgroundColor: '#e5e7eb', flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  buttonDetailsText: { color: '#1f2937', fontWeight: 'bold', fontSize: 14 },
  buttonCancel: { backgroundColor: '#fee2e2', flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginLeft: 8, borderWidth: 1, borderColor: '#fca5a5' },
  buttonCancelText: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
});