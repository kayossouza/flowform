# Flowform

Plataforma open-source para formulários conversacionais com LLMs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/Coverage-98.62%25-brightgreen.svg)](./packages/core)

[English](./README.md) | [Português](./README.pt-BR.md)

**[Início Rápido](#início-rápido) · [Documentação](#índice-de-documentação) · [Arquitetura](./docs/pt-br/ARCHITECTURE.md) · [Contribuindo](./CONTRIBUTING.pt-BR.md)**

---

## Índice de Documentação

### Começando
- [Guia de Início Rápido](#início-rápido) - Configure em 5 minutos
- [Instalação](#instalação) - Instruções detalhadas de setup
- [Usando @flowform/core](#usando-flowformcore) - Uso do pacote core

### Arquitetura & Design
- [Visão Geral da Arquitetura](./docs/pt-br/ARCHITECTURE.md) - Decisões de design e padrões
- [Especificação do Projeto](./docs/PROJECT_SPEC.md) - Especificação técnica completa
- [ADRs (Architecture Decision Records)](./docs/adr/) - Decisões de design importantes

### Desenvolvimento
- [Guia de Desenvolvimento](./docs/pt-br/DEVELOPMENT.md) - Setup, workflow, troubleshooting
- [Guia de Contribuição](./CONTRIBUTING.pt-BR.md) - Como contribuir
- [Guia do Spec Kit](./docs/pt-br/SPEC_KIT_GUIDE.md) - Workflow de desenvolvimento colaborativo
- [Estilo de Código](./CONTRIBUTING.pt-BR.md#estilo-de-código) - Padrões de código

### Gerenciamento do Projeto
- [Roadmap & Tasks](./docs/TASKS_MVP.md) - 11 fases, 300+ tarefas
- [Changelog](./CHANGELOG.pt-BR.md) - Histórico de versões e release notes
- [Release Notes v0.1.0](./docs/releases/v0.1.0.md) - Release do core orchestrator

### Documentação de Pacotes
- [@flowform/core README](./packages/core/README.md) - Referência da API do core

### Contribuindo com Spec Kit

Flowform usa [Spec Kit](./docs/pt-br/SPEC_KIT_GUIDE.md) para desenvolvimento estruturado e colaborativo:

1. **Escolha uma feature** de [TASKS_MVP.md](./docs/TASKS_MVP.md)
2. **Escreva uma spec** usando workflow Spec Kit
3. **Obtenha feedback** da comunidade
4. **Implemente** com orientação clara
5. **Shipar!**

Novo no Spec Kit? Leia o [guia completo](./docs/pt-br/SPEC_KIT_GUIDE.md) para entender como construímos features colaborativamente.

---

## Visão Geral

Flowform transforma formulários web tradicionais em conversas naturais. Em vez de forçar usuários através de campos rígidos, usa LLMs para extrair dados estruturados de linguagem natural.

**Status Atual:** v0.1.0 - Orquestrador core completo e pronto para produção

---

## O Problema

Formulários web tradicionais têm problemas fundamentais:

- **Alta taxa de abandono** (70%+): Cada campo adiciona fricção
- **Experiência ruim**: Formulários parecem interrogatórios
- **Inflexíveis**: Não aceitam entrada em linguagem natural
- **Tamanho único**: Sem adaptação ao contexto

**Custo:** Bilhões em conversões perdidas, milhões de horas desperdiçadas

---

## A Solução

Substituir formulários por conversas com LLM:

### Antes: Formulário Tradicional
```
Nome: [________]
Email: [________]
Telefone: [________]
Empresa: [________]
Mensagem: [________]
```
5 campos. 5 decisões. 5 chances de abandonar.

### Depois: Fluxo Conversacional
```
Usuário: "Preciso de uma demo do produto para minha equipe na Acme Corp"
Bot: "Obrigado! Vou configurar. Qual o melhor email para enviar os detalhes?"
Usuário: "joao@acme.com"
Bot: "Perfeito. Vou enviar as informações da demo para joao@acme.com"
```
Dados estruturados capturados automaticamente da conversa natural.

### Como Funciona

```
Entrada do Usuário (Linguagem Natural)
    ↓
Extração via LLM
    ↓
Validação em Tempo Real
    ↓
JSON Estruturado de Saída
```

1. **Entrada natural**: Usuários digitam conversacionalmente
2. **Extração IA**: LLMs analisam e extraem campos estruturados
3. **Validação em tempo real**: Correção de erros conversacional
4. **Integração**: JSON limpo para webhooks, CRMs, bancos de dados

---

## Por Que Open Source

Infraestrutura para a era da IA deve pertencer a todos.

**Princípios:**
- **Sem vendor lock-in**: Self-host em qualquer lugar
- **Privacy-first**: BYO API keys, seus dados nunca tocam nossos servidores
- **Direcionado pela comunidade**: As melhores ideias vencem
- **Feito para durar**: Não amarrado à sobrevivência de uma startup

Flowform é infraestrutura como Linux, Postgres ou React. Livre, aberto, comunitário.

---

## Funcionalidades

### v0.1.0 - Core Orchestrator (Pronto para Produção)

**Pacote @flowform/core**
- Orquestrador de funções puras (98.62% cobertura de testes)
- Sistema de tipos completo (FormDefinition, Session, validation)
- 7 tipos de campo com validação (TEXT, EMAIL, PHONE, NUMBER, DATE, ENUM, LONG_TEXT)
- Suporte a conversas multi-turno com preservação de contexto
- 75 casos de teste (unitários, integração, casos extremos)
- Zero dependências runtime
- Agnóstico a framework (React, Vue, Node.js, edge functions)
- Agnóstico a LLM (OpenAI, Anthropic, provedores customizados)

**Infraestrutura**
- Monorepo production-grade (Turborepo + TypeScript project references)
- Configurações compartilhadas (ESLint, Prettier, Vitest)
- Automação de qualidade (git hooks, linting rigoroso, 85%+ cobertura forçada)
- 25.000+ palavras de documentação técnica
- Clean architecture (lógica de domínio pura, zero efeitos colaterais)

### v1.0 - MVP (Q1 2025)

**Em Progresso:**
- Lógica de domínio core (COMPLETO)

**Planejado:**
- Pacote de abstração LLM (adaptadores OpenAI, Anthropic)
- Dashboard web (Next.js)
- UI de construção de formulários
- Visualizador de submissões
- Entrega via webhook com retentativas
- Camada de banco de dados (Prisma + PostgreSQL)
- Widget de embed (script tag, React, iframe)

### v1.1+ - Roadmap

- Integrações CRM (Salesforce, HubSpot, Pipedrive)
- Lógica condicional (pular/mostrar campos baseado em respostas)
- Analytics (funis de conversão, análise de abandono, testes A/B)
- Suporte multi-workspace (equipes, funções, permissões)
- Upload de arquivos em conversas
- i18n (suporte multi-idioma)

[Roadmap completo](./docs/TASKS_MVP.md)

---

## Início Rápido

### Pré-requisitos

```bash
node -v   # 20+
pnpm -v   # 9+
```

Mais: Chave API OpenAI ou Anthropic

### Instalação

```bash
# Clonar repositório
git clone https://github.com/kayossouza/flowform.git
cd flowform

# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env
# Adicionar sua chave API no .env

# Iniciar banco de dados (para futura web app)
pnpm db:up

# Rodar migrações (para futura web app)
pnpm db:migrate

# Iniciar desenvolvimento
pnpm dev
```

### Usando @flowform/core

```bash
pnpm add @flowform/core
```

```typescript
import {
  runLlmStep,
  type FormDefinition,
  type Session,
  FieldType,
  SessionStatus,
} from '@flowform/core';

// Definir schema do formulário
const form: FormDefinition = {
  id: 'contact',
  name: 'Formulário de Contato',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Nome',
      type: FieldType.TEXT,
      required: true,
      order: 0,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: FieldType.EMAIL,
      required: true,
      order: 1,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Inicializar sessão
const session: Session = {
  id: 'session-1',
  formId: 'contact',
  status: SessionStatus.ACTIVE,
  turns: [],
  fields: [],
  startedAt: new Date(),
};

// Processar entrada do usuário
const result = await runLlmStep(
  form,
  session,
  'Meu nome é João e email é joao@exemplo.com',
  llmClient
);

console.log(result.extractedFields);
// Output: { name: "João", email: "joao@exemplo.com" }
```

[Documentação completa](./packages/core/README.md)

---

## Arquitetura

### Estrutura

```
apps/web (Next.js)
    Dashboard + API + Widget de Embed
    ↓ imports
packages/core (TypeScript Puro)
    Types · Validation · Orchestration
    Zero Dependencies
    ↓ usa (injeção de dependência)
packages/llm (Futuro)
    Abstração de Provedores (OpenAI, Anthropic)
```

### Princípios de Design

**Clean Architecture com IA**

O orquestrador é uma função pura sem efeitos colaterais:
- 100% testável (mock do LLM, testa todos os caminhos)
- Portável (CLI, mobile, edge, qualquer lugar)
- Previsível (mesmas entradas = mesmas saídas)
- Manutenível (limites claros)

**Modelo BYO API Key**

Seus dados nunca tocam nossos servidores:
- Sua infraestrutura
- Suas chaves API
- Suas conversas
- Seus dados

Não é um modelo de negócio. É um princípio.

[Arquitetura completa](./docs/pt-br/ARCHITECTURE.md)

---

## Stack Tecnológica

**Frontend**
- Next.js 14+ (App Router, React Server Components)
- React 18
- Tailwind CSS

**Backend**
- Next.js API Routes (serverless)
- Prisma (ORM type-safe)
- PostgreSQL

**Monorepo**
- pnpm (rápido, eficiente em disco)
- Turborepo (builds de alta performance)
- TypeScript Project References (compilação incremental)

**Qualidade**
- Vitest (testes unitários + integração)
- ESLint 9 (flat config, ciente de TypeScript)
- Husky (git hooks para gates de qualidade)

**Provedores LLM**
- OpenAI (gpt-4o-mini, gpt-4o, gpt-4-turbo)
- Anthropic (claude-3.5-sonnet, claude-3-opus)
- Extensível (adicione novos provedores facilmente)

---

## Desenvolvimento

### Requisitos

**Padrões de qualidade:**
- Funções ≤60 linhas (responsabilidade única)
- Arquivos ≤350 linhas (limites claros)
- 85%+ cobertura (testes são obrigatórios)
- Zero tipos `any` (TypeScript strict mode)
- Git hooks (gates de qualidade rodam automaticamente)

### Comandos

```bash
pnpm dev           # Iniciar desenvolvimento
pnpm test          # Rodar todos os testes
pnpm test:watch    # Modo watch
pnpm check         # type-check + lint + test (rodar antes de push)
pnpm build         # Build de todos os pacotes
```

[Guia de desenvolvimento](./docs/pt-br/DEVELOPMENT.md)

---

## Documentação

| Documento | Descrição |
|----------|-------------|
| [Especificação](./docs/PROJECT_SPEC.md) | Especificação técnica completa |
| [Arquitetura](./docs/pt-br/ARCHITECTURE.md) | Decisões de design, padrões, trade-offs |
| [Breakdown de Tarefas](./docs/TASKS_MVP.md) | 11 fases, 300+ tarefas granulares |
| [Guia de Desenvolvimento](./docs/pt-br/DEVELOPMENT.md) | Setup, workflow, troubleshooting |
| [CHANGELOG](./CHANGELOG.pt-BR.md) | Histórico de versões e notas de release |
| [Release v0.1.0](./docs/releases/v0.1.0.md) | Detalhes do release do core orchestrator |

---

## Contribuindo

Esta é infraestrutura. Contribuições ajudam todos.

### Como Contribuir

- Reportar bugs: [Abrir issue](https://github.com/kayossouza/flowform/issues)
- Sugerir features: [Iniciar discussão](https://github.com/kayossouza/flowform/discussions)
- Melhorar docs: Clareza ajuda todos
- Escrever código: Escolha uma tarefa de [TASKS_MVP.md](./docs/TASKS_MVP.md)
- Adicionar testes: Mais cobertura sempre agrega valor

### Filosofia de Desenvolvimento

```
Qualidade > Velocidade
Clareza > Esperteza
Testes > Features
Comunidade > Empresa
```

- Commits pequenos (mudanças atômicas)
- Test-first (escreva testes junto com código)
- Sem gambiarras (corrija dívida técnica imediatamente)
- Documente tudo (futuros mantenedores dependem disso)

### Obtendo Ajuda

- Discussões: [GitHub Discussions](https://github.com/kayossouza/flowform/discussions)
- Issues: [GitHub Issues](https://github.com/kayossouza/flowform/issues)
- Primeira vez? Procure [`good first issue`](https://github.com/kayossouza/flowform/labels/good%20first%20issue)

[Guia de contribuição](./CONTRIBUTING.pt-BR.md)

---

## Deploy (Em breve na v1.0)

Self-host onde quiser. Controle total.

### Deploy One-Click

**Vercel** (Recomendado)
```bash
vercel deploy
```

**Railway**
```bash
railway up
```

**Netlify**
```bash
netlify deploy
```

### Self-Hosted (Docker)

```bash
docker build -t flowform .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e LLM_PROVIDER="openai" \
  -e OPENAI_API_KEY="sk-..." \
  flowform
```

Sem vendor lock-in. Controle total.

---

## Roadmap

### v0.1 - Foundation + Core (COMPLETO)
- Monorepo production-grade
- TypeScript strict mode + project references
- 25.000+ palavras de documentação
- Automação de qualidade (git hooks, linting, testing)
- Pacote @flowform/core (98.62% cobertura)
- Sistema de tipos completo
- 7 tipos de campo com validação abrangente
- Conversas multi-turno com contexto
- 75 casos de teste
- Zero dependências

### v1.0 - MVP (Q1 2025)
- Lógica de domínio core (COMPLETO)
- Pacote de abstração LLM
- Dashboard web
- UI de construtor de formulários
- Visualizador de submissões
- Entrega via webhook
- Camada de banco de dados
- Widget de embed

### v1.1 - Integrações (Q2 2025)
- Conectores Salesforce, HubSpot, Pipedrive
- Lógica condicional
- Upload de arquivos

### v2.0 - Escala (Q3 2025)
- Suporte multi-workspace
- Funções & permissões de usuários
- Testes A/B
- Dashboard de analytics
- i18n

[Ver todas as 300+ tarefas](./docs/TASKS_MVP.md)

---

## Licença

Licença MIT - Ver [LICENSE](./LICENSE)

Use livremente. Modifique livremente. Contribua se puder.

---

## Agradecimentos

**Contribuidores Core:**
- [@kayossouza](https://github.com/kayossouza)

**Construído com:**
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Turborepo](https://turbo.build/repo)
- [Vitest](https://vitest.dev/)
- [pnpm](https://pnpm.io/)

---

**Status Atual:** v0.1.0 Lançada - Core Orchestrator Pronto para Produção (98.62% cobertura)

Open Source · Licença MIT · Propriedade Comunitária

[Começar](#início-rápido) · [Documentação](#documentação) · [Contribuindo](#contribuindo)
