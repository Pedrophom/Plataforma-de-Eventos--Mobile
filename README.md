# Plataforma de Eventos - Mobile

Este aplicativo foi desenvolvido em React Native com Expo (SDK 58) e Expo Router para consumo da API REST fornecida pelo repositorio Web da aplicacao.

Escopo deste repositorio: Este projeto documenta exclusivamente o aplicativo mobile para Android e iOS. O servidor Next.js e o banco de dados Supabase operam de forma independente. O aplicativo mobile nao possui banco de dados local e nao deve receber credenciais diretas do PostgreSQL.

---

## 1. Visao Geral e Tecnologias

O aplicativo fornece a interface para que os usuarios se cadastrem, realizem autenticacao, visualizem os eventos disponiveis, realizem inscricoes e gerenciem suas inscricoes ativas.

### Especificacoes Tecnicas

- **React Native (0.88.0):** Framework para construcao de interfaces nativas.
- **Expo SDK (~58.0.19):** Plataforma de ferramentas e runtime de desenvolvimento.
- **Expo Router (~58.0.26):** Roteamento e navegacao baseados em estrutura de arquivos.
- **React (19.3.0):** Biblioteca base para construcao de componentes e gerenciamento de estado.
- **TypeScript (~6.0.3):** Tipagem estatica.
- **Fetch API:** Utilizado para comunicacao HTTP/REST com o servidor backend.
- **JWT (JSON Web Token):** Token de autenticacao recebido do servidor e repassado nos cabecalhos HTTP de autorizacao.

---

## 2. Comunicacao com o Backend Web

O aplicativo mobile envia requisicoes HTTP com payloads em formato JSON para a API REST do Next.js.

### Importante sobre o Endereco da API em Desenvolvimento

Durante os testes em dispositivos fisicos conectados via Expo Go, a aplicacao nao pode utilizar a URL `http://localhost:3000` ou `http://127.0.0.1:3000`, pois esses enderecos fazem referencia ao proprio dispositivo móvel. E obrigatorio utilizar o IP local (IPv4) do computador onde a API Web esta rodando.

### Fluxo de Autenticacao no Mobile

1. A tela `app/(auth)/login.tsx` coleta e-mail e senha e envia um `POST` para `${API_URL}/auth/login`.
2. O backend valida as credenciais e retorna o token JWT no objeto JSON.
3. O app chama a funcao `signIn(token)` exposta pelo `AuthContext`.
4. O `AuthContext` armazena o token em estado React em memoria (`useState`).
5. As telas protegidas utilizam o token do contexto para montar o cabecalho `Authorization: Bearer <token>`.

---

## 3. Estrutura de Pastas Detalhada

```text
mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── cadastro.tsx
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── minhas-inscricoes.tsx
│   │   └── evento/
│   │       └── [id].tsx
│   ├── _layout.tsx
│   ├── +html.tsx
│   └── +not-found.tsx
├── src/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── components/
│   └── constants/
│       └── Colors.ts
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── expo-env.d.ts
└── .gitignore
```

### Descricao das Rotas e Grupos de Navegacao

- **`app/(auth)/`:** Grupo de autenticacao (nao adiciona prefixo na URL).
  - `login.tsx`: Formulario de autenticacao. Envia e-mail/senha e armazena o JWT.
  - `cadastro.tsx`: Formulario de criacao de conta (`nome`, `email`, `senha`).
- **`app/(app)/`:** Grupo autenticado principal.
  - `index.tsx`: Tela inicial. Realiza o carregamento dos eventos (`GET /events`) e cruza com as inscricoes do usuario (`GET /my-registrations`) para ocultar eventos onde o usuario ja se inscreveu.
  - `evento/[id].tsx`: Exibe detalhes do evento e permite realizar inscricao (`POST /registrations`).
  - `minhas-inscricoes.tsx`: Lista as inscricoes do usuario logado e solicita confirmacao antes de cancelar uma inscricao (`DELETE /registrations/:id`).
- **`src/context/AuthContext.tsx`:** Provedor de contexto global. Mantem a constante `API_URL`, o estado do token e as funcoes `signIn` e `signOut`.

---

## 4. Passo a Passo para Configuracao e Execucao Local

### 1. Pre-requisitos

- Node.js 22.13.x ou compativel.
- Dispositivo fisico com o aplicativo Expo Go instalado ou emulador configurado.
- Repositorio Web em execucao na mesma rede local.

### 2. Clonar e Instalar Dependencias

```bash
git clone <URL_DO_REPOSITORIO_MOBILE>
cd <PASTA_CRIADA>
npm install
```

### 3. Descobrir o IP Local do Computador

No computador onde o projeto Web esta rodando:

- **Windows (Prompt de Comando):** Execute `ipconfig` e procure pelo **Endereco IPv4** da interface Wi-Fi ou Ethernet (exemplo: `192.168.1.50`).
- **Linux (Terminal):** Execute `hostname -I` ou `ip -4 addr`.
- **macOS:** Execute `ipconfig getifaddr en0`.

### 4. Configurar a Variavel da API no Projeto

Abra o arquivo `src/context/AuthContext.tsx` e atualize o valor da constante `API_URL` utilizando o IP obtido no passo anterior:

```typescript
export const API_URL = "http://192.168.1.50:3000/api";
```

Atencao: Mantenha o protocolo `http://`, a porta `:3000` (ou a porta configurada no servidor Web) e o sufixo `/api` ao final da string.

### 5. Iniciar a Aplicacao com Expo

No terminal da pasta do projeto Mobile:

```bash
npx expo start
```

- **Dispositivo Fisico:** Abra o aplicativo Expo Go no celular e escaneie o QR Code exibido no terminal.
- **Emulador Android:** Pressione a tecla `a` no terminal (requer Android Studio e emulador previamente configurados). No emulador padrao do Android Studio, caso enfrente problemas de conexao, pode-se utilizar a ponte `10.0.2.2:3000/api`.

---

## 5. Endpoints Consumidos pelo Aplicativo

| Tela/Arquivo                      | Requisicao HTTP | Rota Relativa        | Finalidade                            |
| --------------------------------- | --------------- | -------------------- | ------------------------------------- |
| `app/(auth)/cadastro.tsx`         | POST            | `/auth/register`     | Cadastrar novo usuario                |
| `app/(auth)/login.tsx`            | POST            | `/auth/login`        | Realizar login e obter JWT            |
| `app/(app)/index.tsx`             | GET             | `/events`            | Carregar lista geral de eventos       |
| `app/(app)/index.tsx`             | GET             | `/my-registrations`  | Carregar inscricoes ativas do usuario |
| `app/(app)/evento/[id].tsx`       | GET             | `/events/:id`        | Carregar detalhes do evento por ID    |
| `app/(app)/evento/[id].tsx`       | POST            | `/registrations`     | Realizar inscricao no evento          |
| `app/(app)/minhas-inscricoes.tsx` | GET             | `/my-registrations`  | Listar inscricoes do usuario logado   |
| `app/(app)/minhas-inscricoes.tsx` | DELETE          | `/registrations/:id` | Cancelar uma inscricao ativa          |

---

## 6. Limitacoes Conhecidas e Ajustes Futuros

1. **Token Apenas em Memoria:** O token JWT fica armazenado no estado do React (`useState` em `AuthContext.tsx`). Ao fechar ou recarregar o aplicativo totalmente, a sessao e perdida. Para producao, deve-se implementar persistencia segura via `expo-secure-store`.
2. **Duplicidade de URLs Base:** O arquivo `src/context/AuthContext.tsx` define `API_URL` com `/api`, enquanto `src/services/api.ts` define uma instancia Axios com `baseURL` sem `/api`. Padronize o cliente HTTP da aplicacao em um unico arquivo de servico.
3. **Mapeamento de Mensagens de Erro:** As telas de autenticacao consultam a propriedade `dados.erro`, enquanto alguns endpoints da API Web retornam o campo no formato `error`. Alinhar a estrutura das respostas do backend com as tratativas do app.
