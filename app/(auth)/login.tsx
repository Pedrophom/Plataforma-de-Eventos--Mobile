import { API_URL, AuthContext } from '@/src/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Verifica se os campos estão preenchidos
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    // 2. Verifica o formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("E-mail inválido", "Por favor, digite um e-mail válido (exemplo: aluno@ifma.edu.br).");
      return;
    }

    setCarregando(true);

    try {
      // Consumo da API com fetch nativo
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        // Guarda o token no contexto global
        signIn(dados.token);
        // Redireciona para o Dashboard (Lista de Eventos)
        router.replace('/'); 
      } else {
        Alert.alert("Erro no Login", dados.erro || "Credenciais inválidas.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plataforma de Eventos</Text>
        <Text style={styles.subtitle}>Instituto Federal do Maranhão</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Aceder à Conta</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Palavra-passe (Senha)</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a sua senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity 
          style={styles.buttonPrimary} 
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <Link href={"/(auth)/cadastro" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Cadastre-se aqui</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00823b' },
  header: { flex: 0.3, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#e5e7eb', fontSize: 16 },
  formContainer: { flex: 0.7, backgroundColor: '#f3f4f6', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 40 },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 15, fontSize: 16, color: '#000' },
  buttonPrimary: { backgroundColor: '#00823b', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#6b7280', fontSize: 15, marginRight: 5 },
  linkText: { color: '#00823b', fontSize: 15, fontWeight: 'bold' },
});