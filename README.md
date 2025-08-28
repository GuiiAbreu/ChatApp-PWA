# ChatApp PWA - Aplicação de Chat em Tempo Real

Uma aplicação Progressive Web App (PWA) completa para comunicação em tempo real, desenvolvida com React, Next.js e WebSocket, incluindo funcionalidades offline e notificações push.

## 🚀 Características Principais

- **Comunicação em Tempo Real**: WebSocket para mensagens instantâneas
- **Funcionalidade Offline**: Sincronização automática quando a conexão é restaurada
- **Notificações Push**: Alertas para novas mensagens mesmo com o app fechado
- **Progressive Web App**: Instalável como aplicativo nativo
- **Service Worker**: Cache inteligente para performance otimizada
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
chatapp-pwa/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globais e tokens de design
│   ├── layout.tsx         # Layout principal com metadados PWA
│   └── page.tsx           # Página principal do chat
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── chat-messages.tsx # Exibição de mensagens
│   ├── connection-status.tsx # Status da conexão
│   ├── offline-indicator.tsx # Indicador offline
│   ├── notification-settings.tsx # Configurações de notificação
│   ├── pwa-install-banner.tsx # Banner de instalação PWA
│   └── pwa-settings.tsx  # Configurações PWA
├── hooks/                # Custom React Hooks
│   ├── use-websocket.ts  # Gerenciamento WebSocket
│   ├── use-offline.ts    # Detecção offline
│   ├── use-pwa.ts        # Funcionalidades PWA
│   ├── use-push-notifications.ts # Notificações push
│   └── use-cache-manager.ts # Gerenciamento de cache
├── lib/                  # Utilitários e serviços
│   ├── websocket.ts      # Gerenciador WebSocket principal
│   ├── mock-websocket.ts # WebSocket simulado para demo
│   ├── offline-storage.ts # Armazenamento offline
│   ├── push-notifications.ts # Sistema de notificações
│   ├── pwa-manager.ts    # Gerenciador PWA
│   └── cache-manager.ts  # Estratégias de cache
├── public/               # Arquivos estáticos
│   ├── manifest.json     # Manifesto PWA
│   ├── sw.js            # Service Worker
│   ├── offline.html     # Página offline
│   └── icons/           # Ícones da aplicação
└── scripts/             # Scripts de configuração
```

### Fluxo de Dados

1. **Inicialização**: App carrega → Service Worker registra → WebSocket conecta
2. **Mensagem Enviada**: Input → WebSocket → Servidor → Broadcast para clientes
3. **Offline**: Mensagens armazenadas localmente → Sincronização quando online
4. **Notificações**: Mensagem recebida → Service Worker → Push Notification

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca de interface com hooks modernos
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Tailwind CSS v4**: Framework CSS utilitário
- **shadcn/ui**: Componentes de interface pré-construídos

### PWA e Performance
- **Service Worker**: Cache estratégico e funcionalidade offline
- **Web App Manifest**: Configuração para instalação nativa
- **IndexedDB**: Armazenamento local para mensagens offline
- **Cache API**: Estratégias de cache personalizadas

### Comunicação
- **WebSocket**: Comunicação bidirecional em tempo real
- **Push API**: Notificações push nativas
- **Notification API**: Alertas do sistema operacional

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Navegador moderno com suporte a PWA

### Instalação Local

```bash```
# Clone o repositório
```git clone <repository-url>```

```cd chatapp-pwa```

# Instale as dependências
```npm install```

# Configure as variáveis de ambiente
```cp .env.example .env.local```

# Execute em modo desenvolvimento
```npm run dev```


### Variáveis de Ambiente

```env```
# Chave pública VAPID para notificações push
```NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key```

# URL do servidor WebSocket (opcional para demo)
```NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080```


### Build para Produção

```bash
# Build otimizado
npm run build

# Servir localmente
npm start
```

## 📱 Funcionalidades PWA

### Instalação
- Banner automático de instalação
- Suporte a múltiplas plataformas (iOS, Android, Desktop)
- Ícones adaptativos e splash screens

### Offline
- Cache inteligente de recursos estáticos
- Armazenamento local de mensagens
- Sincronização automática quando online
- Página offline personalizada

### Notificações
- Push notifications para novas mensagens
- Configurações granulares de notificação
- Suporte a ações de notificação

## 🎨 Design System

### Paleta de Cores
- **Primária**: Indigo (#6366f1) - Elementos principais
- **Secundária**: Slate (#64748b) - Elementos secundários  
- **Fundo**: Dark (#0f172a) - Tema escuro principal
- **Texto**: White/Gray - Contraste otimizado

### Tipografia
- **Fonte Principal**: Geist Sans - Interface limpa
- **Fonte Mono**: Geist Mono - Código e dados técnicos

### Layout
- Design mobile-first responsivo
- Sidebar colapsível para navegação
- Grid flexível para mensagens
- Componentes modulares reutilizáveis

## 🔒 Segurança e Performance

### Segurança
- Content Security Policy (CSP)
- HTTPS obrigatório para PWA
- Validação de entrada de dados
- Sanitização de mensagens

### Performance
- Code splitting automático
- Lazy loading de componentes
- Cache estratégico de recursos
- Otimização de imagens

## 🧪 Testes e Qualidade

### Estratégias de Teste
- Testes unitários com Jest
- Testes de integração com Testing Library
- Testes E2E com Playwright
- Lighthouse para auditoria PWA

### Qualidade de Código
- ESLint para linting
- Prettier para formatação
- TypeScript para tipagem
- Husky para git hooks

## 📈 Monitoramento e Analytics

### Métricas PWA
- Core Web Vitals
- Service Worker performance
- Cache hit rates
- Offline usage patterns

### Monitoramento de Erros
- Error boundaries React
- Service Worker error handling
- WebSocket connection monitoring
- Push notification delivery tracking

## 🚀 Deploy e Distribuição

### Plataformas Suportadas
- **Vercel**: Deploy automático com otimizações PWA
- **Netlify**: Suporte completo a Service Workers
- **Firebase Hosting**: Configuração PWA nativa

### Configurações de Deploy
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

## 🤝 Contribuição

### Padrões de Código
- Conventional Commits
- Feature branches
- Pull Request reviews
- Automated testing

### Estrutura de Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: ajustes de formatação
refactor: refatoração de código
test: adiciona ou modifica testes
```

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação técnica
- Entre em contato com a equipe de desenvolvimento

---

**Aplicação desenvolvida para a disciplina de Programação para Web II lecionada pelo Prof. Me. Cicero Aristofanio**
