import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../src/context/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const router = useRouter();

  const handleCadastro = async () => {
    // 1. Verifica se está tudo preenchido
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    // 2. Verifica se o e-mail tem um formato válido (ex: teste@teste.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("E-mail inválido", "Por favor, digite um e-mail válido (exemplo: aluno@ifma.edu.br).");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Conta criada com sucesso. Faça o login.");
        router.replace('/(auth)/login'); 
      } else {
        Alert.alert("Erro no Cadastro", dados.erro || "Não foi possível criar a conta.");
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
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se aos eventos do IFMA</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o seu nome"
            value={nome}
            onChangeText={setNome}
          />
        </View>

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
            placeholder="Crie uma senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity 
          style={styles.buttonPrimary} 
          onPress={handleCadastro}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <Link href={"/(auth)/login" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Faça login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00823b' },
  header: { flex: 0.25, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#e5e7eb', fontSize: 16 },
  formContainer: { flex: 0.75, backgroundColor: '#f3f4f6', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 15, fontSize: 16, color: '#000' },
  buttonPrimary: { backgroundColor: '#00823b', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#6b7280', fontSize: 15, marginRight: 5 },
  linkText: { color: '#00823b', fontSize: 15, fontWeight: 'bold' },
});