# Arquitetura do Flowform

Clean Architecture. Funções puras. Princípios SOLID. É isso.

---

## Visão Geral

```
┌─────────────────────────────────────┐
│  Apresentação (apps/web/app)        │
│  Componentes React, páginas, UI     │
└─────────────────┬───────────────────┘
                  ↓ usa
┌─────────────────────────────────────┐
│  Aplicação (apps/web/lib)           │
│  Rotas API, queries DB, casos de uso│
└─────────────────┬───────────────────┘
                  ↓ importa
┌─────────────────────────────────────┐
│  Domínio (packages/core)            │
│  TypeScript puro, ZERO dependências │
│  Tipos, validação, orquestração     │
└─────────────────┬───────────────────┘
                  ↓ usa (injetado)
┌─────────────────────────────────────┐
│  Infraestrutura (packages/llm)      │
│  Clientes LLM (OpenAI, Anthropic)   │
└─────────────────────────────────────┘
```

**A Regra:** Dependências apontam apenas para dentro.

Domínio não depende de **nada**. Nem mesmo logging.

---

## Insight Central: O Orquestrador é Puro

```typescript
async function runLlmStep(
  form: FormDefinition,
  session: Session,
  userMessage: string,
  llmClient: LlmClient  // Injetado, não importado!
): Promise<OrchestratorResult>
```

**Puro significa:**
- Sem efeitos colaterais (sem DB, sem chamadas API, sem logging)
- Sem estado global
- Mesmas entradas → mesmas saídas
- 100% testável

**Por que puro?**
- Testar sem mocks
- Rodar em qualquer lugar (CLI, mobile, edge, lambda)
- Comportamento previsível
- Paralelização segura

Veja ADR-0002 para justificativa completa.

---

## Quatro Regras de Design Simples

Regras de Kent Beck. Cada linha de código deve seguir:

1. **Passa em todos os testes**
   - Se não funciona, nada mais importa
   - Testes provam que funciona

2. **Revela intenção**
   - Código diz o que faz
   - Nomes são claros
   - Sem necessidade de comentários

3. **Sem duplicação**
   - DRY
   - Extrair padrões comuns
   - Uma única fonte da verdade

4. **Menor número de elementos**
   - Minimizar classes, funções, variáveis
   - Simples é melhor que complexo
   - Deletar código agressivamente

**Em ordem de prioridade.** Código funcionando vence código elegante. Código elegante vence código minimal.

---

## Princípios SOLID

### Princípio da Responsabilidade Única
Um módulo, uma razão para mudar.

```typescript
// ✅ Bom
class FormValidator { validate() { } }
class FormRepository { save() { } }
class EmailService { sendEmail() { } }

// ❌ Ruim
class FormHandler {
  validate() { }  // Validação
  save() { }      // Persistência
  sendEmail() { } // Notificação
}
```

### Princípio Aberto/Fechado
Aberto para extensão, fechado para modificação.

```typescript
// ✅ Bom: Adicionar providers sem mudar orchestrador
interface LlmClient {
  complete(messages: Message[]): Promise<Response>;
}

class OpenAIClient implements LlmClient { }
class AnthropicClient implements LlmClient { }
class GeminiClient implements LlmClient { } // Novo! Sem mudanças no orchestrador
```

### Princípio da Substituição de Liskov
Subtipos devem ser substituíveis.

```typescript
// Qualquer LlmClient funciona identicamente
function process(client: LlmClient) {
  return client.complete(messages);
}

// Todos funcionam igual
process(new OpenAIClient());
process(new AnthropicClient());
process(new MockLlmClient());
```

### Princípio da Segregação de Interface
Clientes não devem depender de métodos não utilizados.

```typescript
// ✅ Bom: Interface mínima
interface LlmClient {
  complete(messages: Message[]): Promise<Response>;
}

// ❌ Ruim: Interface inchada
interface LlmClient {
  complete(): Promise<Response>;
  streamComplete(): AsyncIterator<Response>;  // Nem todos suportam
  getUsage(): TokenUsage;                     // Nem todos rastreiam
  getModelInfo(): ModelInfo;                  // Nem todos expõem
}
```

### Princípio da Inversão de Dependência
Dependa de abstrações, não de concretizações.

```typescript
// ✅ Bom: Depende de interface
function runOrchestrator(client: LlmClient) {
  return client.complete(messages);
}

// ❌ Ruim: Depende de classe concreta
import { OpenAIClient } from './openai';
function runOrchestrator() {
  const client = new OpenAIClient();  // Acoplamento forte!
}
```

---

## Tratamento de Erros

Quatro categorias. Tratar cada uma diferentemente.

### 1. Erros de Validação (Culpa do Usuário)
Retornar resultado, não lançar exceção.

```typescript
function validateEmail(value: string): ValidationResult {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
}
```

### 2. Erros de Cliente (Culpa do Chamador)
Lançar com contexto. Logar warning. Não tentar novamente.

```typescript
if (!apiKey) {
  throw new ClientError(
    'API key obrigatória',
    401,
    'MISSING_API_KEY'
  );
}
```

### 3. Erros de Servidor (Culpa do Sistema)
Lançar com contexto. Logar erro. Tentar novamente com backoff.

```typescript
try {
  await database.query(sql);
} catch (error) {
  throw new ServerError(
    'Query no banco falhou',
    500,
    error as Error
  );
}
```

### 4. Bugs (Culpa do Programador)
Deixar crashar. Corrigir o bug. Não capturar.

---

## Estrutura do Monorepo

### Pacotes
```
packages/
  core/           - Lógica de domínio (zero dependências)
  llm/            - Abstração de providers LLM
  ui/             - Componentes React compartilhados (futuro)
  eslint-config/  - Regras de linting compartilhadas
  typescript-config/ - Configs TS compartilhadas
```

**Camadas:**
- `core` importa de: nada
- `llm` importa de: core
- `ui` importa de: core (não llm)

### Apps
```
apps/
  web/   - Dashboard Next.js + API + widget de embed
  cli/   - Ferramenta CLI (futuro)
```

**Apps são wrappers finos.** Toda lógica nos pacotes.

---

## TypeScript Project References

**Por que:** Builds incrementais que escalam.

**Sem project references:**
- Mudar um tipo em `core`
- Rebuildar todos os 10 apps
- Esperar 15 minutos

**Com project references:**
- Mudar um tipo em `core`
- Rebuildar apenas pacotes afetados
- Esperar 30 segundos

**Como:**
- Root `tsconfig.json` referencia todos os pacotes
- Cada pacote: `composite: true` + `declaration: true`
- TypeScript gera `.tsbuildinfo` para compilação incremental

Veja `tsconfig.json` e `tsconfig.base.json` para configuração.

---

## Decisões de Design

Todas decisões importantes documentadas em ADRs:

- [ADR-0001: Clean Architecture](./adr/0001-use-clean-architecture.md)
- [ADR-0002: Pure Function Orchestrator](./adr/0002-pure-function-orchestrator.md)
- [ADR-0003: BYO API Key Model](./adr/0003-byo-api-key-model.md)

Escrever novos ADRs para:
- Escolhas de tecnologia (bancos de dados, frameworks, bibliotecas)
- Padrões de arquitetura
- Trade-offs (consistência vs disponibilidade, etc.)
- Convenções que afetam múltiplos pacotes

Template em `docs/adr/README.md`.

---

## Restrições Chave

**Limites rígidos:**
- Funções: ≤60 linhas
- Arquivos: ≤350 linhas
- Complexidade ciclomática: ≤12
- Cobertura de testes: ≥90% (core: ≥95%)
- Sem tipos `any`
- Sem `console.log` (usar logger)

**Garantido por:**
- ESLint (funções, complexidade, `any`)
- Vitest (cobertura)
- Code review (arquivos)
- Git hooks (checks pre-commit)

---

## Trade-offs

### Monorepo vs Polyrepo
**Escolha:** Monorepo

**Por que:** Commits atômicos, código compartilhado, refatoração mais fácil
**Custo:** Requer boas ferramentas (Turborepo, pnpm)

### Funções Puras vs Orientado a Objetos
**Escolha:** Funções puras para lógica de domínio

**Por que:** 100% testável, portável, previsível
**Custo:** Mais explícito (deve passar dependências)

### TypeScript Strict Mode
**Escolha:** Strict mode sempre ativo

**Por que:** Pegar bugs em tempo de compilação
**Custo:** Anotações de tipo mais verbosas

### Sem Mocks em Testes de Integração
**Escolha:** DB real com transactions

**Por que:** Testar comportamento real, pegar bugs de integração
**Custo:** Testes ligeiramente mais lentos

---

## Referências

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Four Rules of Simple Design - Kent Beck](https://martinfowler.com/bliki/BeckDesignRules.html)
- [SOLID Principles - Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Última Atualização:** 2025-01-10

**O código é a verdade.** Quando docs e código discordam, código vence. Manter docs curtos. Manter código limpo.
