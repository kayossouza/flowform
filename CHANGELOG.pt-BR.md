# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-10

### Adicionado - Pacote @flowform/core

**Implementação completa do core do orquestrador de formulários conversacionais com 98.62% de cobertura de testes**

#### Funcionalidades Core
- **Orquestrador de Função Pura** (`runLlmStep`)
  - Extração de campos de formulário via LLM em turno único
  - Suporte a conversas multi-turno com preservação de contexto
  - Validação de campos em tempo real com mensagens de erro descritivas
  - Detecção de completude do formulário e sugestão do próximo campo

- **Sistema de Tipos Abrangente**
  - `FormDefinition` - Schema do formulário com definições de campos
  - `Session` - Estado da conversa com turnos e campos coletados
  - `SessionField` - Valores de campos coletados com timestamps
  - `SessionTurn` - Histórico de mensagens da conversa
  - `LlmClient` - Abstração de LLM agnóstica a provider
  - `OrchestratorResult` - Saída estruturada de cada turno
  - `ValidationResult` - União discriminada para validação type-safe

- **Suporte a Tipos de Campo**
  - TEXT - Entrada de texto curto
  - LONG_TEXT - Entrada de texto multi-linha
  - EMAIL - Validação de email com regex compatível RFC
  - PHONE - Validação de número de telefone internacional (10+ dígitos)
  - NUMBER - Entrada numérica com restrições min/max
  - DATE - Validação de data ISO com detecção de datas inválidas (ex: 30 de fevereiro)
  - ENUM - Seleção de opções predefinidas

- **Sistema de Validação**
  - `validateField` - Dispatcher principal para validação de campos
  - `validateEmail` - Verificação de formato de email compatível RFC
  - `validatePhone` - Validação de número de telefone internacional
  - `validateNumber` - Validação de restrições min/max
  - `validateDate` - Parsing de data ISO com tratamento de timezone UTC
  - `validateEnum` - Validação de match exato contra opções permitidas
  - Suporte a campos obrigatórios/opcionais
  - Validação automática na extração de campos

- **Gerenciamento de Contexto**
  - `buildConversationHistory` - Converte turnos da sessão para formato de mensagem LLM
  - `buildFieldContext` - Formata campos coletados como string de contexto
  - `buildSystemPrompt` - Gera prompt de sistema completo com schema do formulário
  - `determineNextField` - Identifica próximo campo obrigatório a coletar

- **Tratamento de Erros**
  - `ClientError` - Classe de erro customizada para falhas de validação/cliente
  - Mensagens de erro descritivas com códigos de erro
  - Códigos de status HTTP (400 para erros de cliente)
  - Contexto de erro detalhado para debugging

#### Testes & Qualidade
- **75 Casos de Teste** em 4 suites de teste
  - Testes unitários para todos os validadores
  - Testes de integração para fluxo do orchestrador
  - Testes de casos extremos (formulários vazios, valores null, respostas malformadas)
  - Testes de conversas multi-turno

- **98.62% de Cobertura de Código**
  - 98.62% de cobertura de statements
  - 91.6% de cobertura de branches
  - 100% de cobertura de funções

- **Quality Gates**
  - Zero erros TypeScript (strict mode)
  - Zero warnings/erros ESLint
  - Todas funções ≤60 linhas
  - Todos arquivos ≤350 linhas
  - Complexidade ciclomática ≤12
  - Zero tipos `any`

#### Documentação
- **README Abrangente** com:
  - Guia de início rápido
  - Explicação de conceitos core
  - Exemplos de uso avançado (multi-turno, prompts customizados)
  - Referência completa da API
  - Exemplos de testes
  - Overview da arquitetura

- **Comentários JSDoc** em todas APIs públicas
- **Anotações de Tipo** em todos tipos e funções exportadas

#### Arquitetura
- **Zero Dependências Runtime** - Implementação TypeScript puro
- **Framework Agnostic** - Funciona com qualquer framework UI ou backend
- **LLM Agnostic** - Traga seu próprio cliente LLM (OpenAI, Anthropic, etc.)
- **Funções Puras** - Sem efeitos colaterais, totalmente testável
- **Injeção de Dependência** - Cliente LLM injetado para fácil mocking
- **Clean Architecture** - Lógica de domínio isolada da infraestrutura

### Infraestrutura do Projeto

#### Setup do Monorepo
- Configuração Turborepo com caching otimizado
- TypeScript project references para builds incrementais
- Configurações compartilhadas ESLint, Prettier, Vitest
- pnpm workspaces com gerenciamento de dependências

#### Automação de Qualidade
- Git hooks com Husky para checks pre-commit
- ESLint 9 flat config com regras TypeScript
- Vitest para testes unitários e de integração
- Thresholds de cobertura garantidos (95%+ obrigatório)

#### Documentação
- 25.000+ palavras de documentação técnica
- Workflow Spec Kit para desenvolvimento de features
- Architecture Decision Records (ADRs)
- Guias de desenvolvimento e troubleshooting

### Detalhes Técnicos

#### Breaking Changes
- Nenhum (release inicial)

#### Correções de Bugs
- Corrigida validação de data para detectar datas inválidas como 30 de fevereiro
- Corrigido tratamento de timezone UTC na validação de data
- Corrigida conformidade com TypeScript strict mode
- Corrigida complexidade ciclomática no validador de data

#### Mudanças Internas
- Extraídas funções helper para reduzir complexidade
- Refatorado orchestrador para usar helpers de prompt-builder
- Criado tsconfig separado para testes
- Removidas diretivas ESLint disable não usadas

### Guia de Migração

Este é o release inicial. Para começar a usar @flowform/core:

```bash
pnpm add @flowform/core
```

Veja o [README](./packages/core/README.md) para exemplos de uso.

### Contribuidores

- [@kayossouza](https://github.com/kayossouza) - Implementação do core orchestrator

---

## [Unreleased]

### Planejado para v0.2.0
- [ ] Pacote @flowform/llm (adaptadores OpenAI e Anthropic)
- [ ] Tipos de campo estendidos (URL, placeholders de upload de arquivo)
- [ ] Suporte a lógica condicional
- [ ] Dependências de campos e valores computados

### Planejado para v1.0.0 (MVP)
- [ ] Dashboard web (app Next.js)
- [ ] UI de construtor de formulários
- [ ] Visualizador de submissões
- [ ] Sistema de entrega via webhook
- [ ] Widget de embed (script tag, React, iframe)
- [ ] Camada de banco de dados (Prisma + PostgreSQL)

---

[0.1.0]: https://github.com/kayossouza/flowform/releases/tag/v0.1.0
