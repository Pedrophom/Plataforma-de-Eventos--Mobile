import { Stack, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL, AuthContext } from '../../src/context/AuthContext';

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
  const { token } = useContext(AuthContext);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarInscricoes = async () => {
    try {
      const res = await fetch(`${API_URL}/my-registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        setInscricoes(dados);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as inscrições.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarInscricoes();
  }, []);

  const cancelarInscricao = async (idInscricao: string, tituloEvento: string) => {
    Alert.alert(
      "Cancelar Inscrição",
      `Tem a certeza que deseja cancelar a sua inscrição em "${tituloEvento}"?`,
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, Cancelar", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/registrations/${idInscricao}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (res.ok) {
                setInscricoes((prev) => prev.filter(item => item.id !== idInscricao));
                Alert.alert("Sucesso", "Inscrição cancelada.");
              } else {
                Alert.alert("Erro", "Não foi possível cancelar.");
              }
            } catch (error) {
              Alert.alert("Erro", "Falha de conexão.");
            }
          }
        }
      ]
    );
  };

  const renderInscricao = ({ item }: { item: Inscricao }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.evento.titulo}</Text>
      <Text style={styles.cardInfo}>Data: {item.evento.data} às {item.evento.horario}</Text>
      <Text style={styles.cardInfo}>Local: {item.evento.local}</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: '#e5e7eb', borderColor: '#d1d5db', flex: 1, marginRight: 10 }]}
          onPress={() => router.push({ pathname: '/(app)/evento/[id]', params: { id: item.evento.id, inscrito: 'true' } } as any)}
        >
          <Text style={[styles.cancelButtonText, { color: '#374151' }]}>Ver Detalhes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.cancelButton, { flex: 1, marginLeft: 10 }]}
          onPress={() => cancelarInscricao(item.id, item.evento.titulo)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Minhas Inscrições",
          headerStyle: { backgroundColor: '#00823b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <View style={styles.container}>
        {carregando ? (
          <ActivityIndicator size="large" color="#00823b" style={{ marginTop: 40 }} />
        ) : inscricoes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não se inscreveu em nenhum evento.</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.back()}
            >
              <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={inscricoes}
            keyExtractor={(item) => item.id}
            renderItem={renderInscricao}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  exploreButton: { backgroundColor: '#00823b', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  exploreButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#00823b' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  cancelButton: { marginTop: 15, backgroundColor: '#fee2e2', paddingVertical: 10, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  cancelButtonText: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
});