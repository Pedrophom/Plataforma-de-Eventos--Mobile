import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL, AuthContext } from '../../src/context/AuthContext';

interface Evento {
  id: string;
  titulo: string;
  data: string;
  horario: string;
  local: string;
}

export default function HomeMobile() {
  const router = useRouter();
  const { signOut, token } = useContext(AuthContext); 
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Substituímos o useEffect pelo useFocusEffect + useCallback
  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        try {
          const [resEventos, resInscricoes] = await Promise.all([
            fetch(`${API_URL}/events`),
            fetch(`${API_URL}/my-registrations`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);

          const dadosEventos = await resEventos.json();
          const dadosInscricoes = resInscricoes.ok ? await resInscricoes.json() : [];

          const eventosNaoInscritos = dadosEventos.filter((evento: Evento) => 
            !dadosInscricoes.some((inscricao: any) => inscricao.evento.id === evento.id)
          );

          setEventos(eventosNaoInscritos);
        } catch (error) {
          console.error("Erro ao carregar dados", error);
        } finally {
          setCarregando(false);
        }
      };

      carregarDados();
    }, [token]) // A dependência do token garante que recarrega se o utilizador mudar
  );

  const handleSair = () => {
    signOut(); 
    router.replace('/(auth)/login'); 
  };

  const renderEvento = ({ item }: { item: Evento }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(app)/evento/${item.id}` as any)}
    >
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      <Text style={styles.cardInfo}>Data: {item.data} às {item.horario}</Text>
      <Text style={styles.cardInfo}>Local: {item.local}</Text>
      <Text style={styles.cardAction}>Ver Detalhes e Inscrever-se</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Olá, Aluno!</Text>
          <Text style={styles.headerSubtitle}>Eventos IFMA</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.myRegistrationsButton}
          onPress={() => router.push('/(app)/minhas-inscricoes' as any)}
        >
          <Text style={styles.myRegistrationsText}>Ver Minhas Inscrições</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Eventos Disponíveis</Text>
        
        {carregando ? (
          <ActivityIndicator size="large" color="#00823b" style={{ marginTop: 40 }} />
        ) : eventos.length === 0 ? (
          <Text style={styles.emptyText}>Você já está inscrito em todos os eventos ou não há novidades!</Text>
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            renderItem={renderEvento}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#00823b', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#e5e7eb', fontSize: 14 },
  logoutButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  actionsContainer: { padding: 20, paddingBottom: 0 },
  myRegistrationsButton: { backgroundColor: '#1f2937', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  myRegistrationsText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listContainer: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 20, paddingHorizontal: 10 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#00823b' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  cardAction: { fontSize: 14, color: '#00823b', fontWeight: 'bold', marginTop: 10, textAlign: 'right' },
});