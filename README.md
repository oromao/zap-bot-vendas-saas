# ZapBot - Plataforma SaaS de Automação WhatsApp

## 🚀 Visão Geral

O ZapBot é uma plataforma SaaS (Software as a Service) que oferece automação avançada para WhatsApp, permitindo empresas e desenvolvedores criarem fluxos de trabalho personalizados para atendimento ao cliente, marketing e automação de processos.

## 🛠️ Tecnologias Principais

- **Frontend:** React + TypeScript, Vite
- **Estilização:** Tailwind CSS, SASS
- **UI Components:** Radix UI, Shadcn/ui
- **Backend/Serverless:** Supabase Functions (Deno/TypeScript)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Bot WhatsApp:** Node.js (whatsapp-web.js)
- **Autenticação:** Supabase Auth
- **Logger:** Winston/Pino (backend), logger customizado (frontend)
- **DevOps:** Docker, Nginx
- **Qualidade de Código:** ESLint, Prettier

## 📋 Funcionalidades Principais

### 1. Autenticação e Gerenciamento de Usuários
- Login e registro de usuários
- Autenticação via Supabase
- Proteção de rotas (AuthGuard)
- Perfis de usuário e configurações

### 2. Interface do WhatsApp
- Conexão com API do WhatsApp
- Visualização de conversas em tempo real
- Tutorial de configuração inicial
- Preview do bot em funcionamento

### 3. Construtor de Fluxos de Trabalho
- Editor visual de fluxos
- Painel de edição de nós
- Barra lateral com componentes
- Modal de testes de fluxo
- Integração com APIs externas

### 4. Dashboard e Analytics
- Visualização de métricas
- Gráficos e relatórios
- Monitoramento de conversas
- Status do sistema

### 5. Componentes UI Reutilizáveis
- Acordeões e diálogos
- Menus e navegação
- Formulários e inputs
- Tabelas e cards
- Toasts e notificações

## 📁 Estrutura do Projeto

```
windsurf-project/
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base (Radix UI)
│   │   └── ...            # Componentes específicos
│   ├── hooks/             # Hooks customizados
│   ├── integrations/      # Integrações (Supabase)
│   ├── lib/               # Utilitários e logger
│   ├── pages/             # Páginas da aplicação
│   ├── theme/             # Contexto de tema
│   └── styles/            # Estilos globais
├── supabase/              # Backend serverless
└── public/                # Arquivos estáticos
```

## 🔧 Configuração e Instalação

1. **Pré-requisitos**
   - Node.js 18+
   - npm ou yarn
   - Conta no Supabase

2. **Instalação**
   ```bash
   npm install
   ```

3. **Desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

## 🤖 Bot WhatsApp

### Funcionalidades do Bot
- Conexão automática via QR Code
- Gerenciamento de sessões
- Processamento de mensagens
- Integração com fluxos de trabalho
- Respostas automáticas
- Encaminhamento inteligente

### Comandos do Bot
```bash
# Iniciar o bot
npm run bot

# Desenvolvimento completo (frontend + bot)
npm run dev
```

## 🔐 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
BOT_WEBHOOK_URL=url_webhook_bot
```

## 📚 Hooks Customizados

- `useAuth`: Gerenciamento de autenticação
- `useWhatsAppStatus`: Status da conexão
- `useWhatsAppConversations`: Gestão de conversas
- `useWhatsAppMessages`: Manipulação de mensagens
- `useFormValidation`: Validação de formulários
- `useAsyncFeedback`: Feedback assíncrono

## 🎨 Componentes UI

### Componentes Base
- Accordion, Alert, Avatar
- Button, Card, Dialog
- Dropdown, Form, Input
- Modal, Popover, Toast
- Table, Tabs, Tooltip

### Componentes Específicos
- BotPreview
- WhatsAppConnect
- WorkflowBuilder
- Features
- Integration

## 📱 Páginas

- `/`: Landing page
- `/login`: Autenticação
- `/signup`: Registro
- `/dashboard`: Painel principal
- `/whatsapp`: Gestão do WhatsApp
- `/workflows`: Editor de fluxos
- `/config`: Configurações
- `/admin`: Área administrativa

## 🔄 Ciclo de Desenvolvimento

1. **Qualidade de Código**
   ```bash
   npm run lint      # Verificar código
   npm run lint:fix  # Corrigir automaticamente
   npm run format    # Formatar código
   ```

2. **Testes**
   - Implementação futura de testes unitários e E2E

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Amazing Feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
