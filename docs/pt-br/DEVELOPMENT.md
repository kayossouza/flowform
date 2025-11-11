# Guia de Desenvolvimento do Flowform

Setup rápido. Workflow TDD. Checks de qualidade. É tudo que você precisa.

---

## Setup Rápido

### Pré-requisitos
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm@9`)
- Docker & Docker Compose
- Chave API OpenAI ou Anthropic

### Instalação
```bash
git clone https://github.com/kayossouza/flowform.git
cd flowform
pnpm install
cp .env.example .env
# Adicionar sua chave API no .env

pnpm db:up
pnpm db:migrate
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Verificar
```bash
pnpm check  # type-check + lint + test
```

Tudo verde? Pronto para começar.

---

## Workflow Diário

### Manhã
```bash
git pull origin main
pnpm install          # Se package.json mudou
pnpm db:up
pnpm db:migrate       # Se migrations foram adicionadas
pnpm dev
```

### Durante Desenvolvimento
```bash
# Watch tests para o pacote que está trabalhando
pnpm --filter @repo/core test:watch

# Type-check
pnpm type-check

# Lint e fix
pnpm lint:fix
```

### Antes de Commitar
```bash
pnpm check  # DEVE passar
```

---

## TDD: RED → GREEN → REFACTOR

**Cada linha de código começa com um teste falhando.**

### 1. RED - Escrever Teste Falhando
```typescript
it('extrai email da mensagem', () => {
  const result = extractEmail('Meu email é user@example.com');
  expect(result).toBe('user@example.com');
});
// Rodar: ❌ FAIL - extractEmail não definido
```

### 2. GREEN - Fazer Passar
```typescript
export function extractEmail(message: string): string | null {
  const match = message.match(/\S+@\S+/);
  return match ? match[0] : null;
}
// Rodar: ✅ PASS
```

### 3. REFACTOR - Limpar
```typescript
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function extractEmail(message: string): string | null {
  const match = message.match(EMAIL_REGEX);
  return match ? match[0] : null;
}
// Rodar: ✅ PASS (comportamento inalterado, código melhor)
```

### 4. REPETIR
Adicionar próximo teste. Voltar para RED.

**Regras:**
- Sem código de produção sem teste falhando primeiro
- Teste deve realmente falhar (não passar imediatamente)
- Só refatorar quando testes estiverem verdes

---

## Estilo de Código

### Funções
**≤60 linhas. Fazer uma coisa.**

```typescript
// ✅ Bom: Pequena, focada
function validateEmail(value: string): ValidationResult {
  if (!value) return { valid: false, error: 'Obrigatório' };
  if (!EMAIL_REGEX.test(value)) return { valid: false, error: 'Inválido' };
  return { valid: true };
}

// ❌ Ruim: Muito longa, múltiplas responsabilidades
function processForm(form: any) {
  // 100 linhas de validação, parsing, salvamento, email...
}
```

### Nomes
**Revelar intenção. Ser específico.**

```typescript
// ✅ Bom
function validateEmailAddress(value: string): ValidationResult { }
const userEmailAddress = getUserInput();

// ❌ Ruim
function validate(v: any) { }
const tmp = getData();
```

### Tipos
**Tipos de retorno explícitos. Sem `any`.**

```typescript
// ✅ Bom
function parseResponse(data: string): ParsedData {
  // ...
}

// ❌ Ruim
function parse(data) {  // Implicit any
  // ...
}
```

### Comentários
**Explicar POR QUE, não O QUE.**

```typescript
// ✅ Bom: Explica por que
// Usa regex simples aqui ao invés de RFC 5322 completo
// porque a maioria dos usuários não consegue lidar com endereços complexos
const EMAIL_REGEX = /\S+@\S+\.\S+/;

// ❌ Ruim: Explica o que (óbvio pelo código)
// Cria regex para email
const EMAIL_REGEX = /\S+@\S+\.\S+/;
```

---

## Testes

### Estrutura
```typescript
describe('Feature ou módulo', () => {
  describe('casos de sucesso', () => {
    it('faz X quando Y', () => {
      // Arrange
      const input = createInput();

      // Act
      const result = function(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('casos de erro', () => {
    it('lança ValidationError para entrada inválida', () => {
      expect(() => function(invalidInput)).toThrow(ValidationError);
    });
  });

  describe('casos extremos', () => {
    it('trata null', () => { /* ... */ });
    it('trata array vazio', () => { /* ... */ });
  });
});
```

### Requisitos de Cobertura
- Geral: 90%
- packages/core: 95%
- Branches: 85%

```bash
pnpm test:coverage
open coverage/index.html
```

### Testes de Integração
**Usar dependências reais. Sem mocks.**

```typescript
describe('POST /api/forms', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`BEGIN`;
  });

  afterEach(async () => {
    await prisma.$executeRaw`ROLLBACK`;
  });

  it('cria form', async () => {
    // DB real, chamada API real, sem mocks
    const response = await fetch('/api/forms', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    expect(response.status).toBe(201);
  });
});
```

---

## Workflow Git

### Branches
```bash
# Feature
git checkout -b feature/email-validation

# Bug fix
git checkout -b fix/null-pointer

# Docs
git checkout -b docs/update-readme
```

### Commits
[Conventional Commits](https://www.conventionalcommits.org/) garantido por git hook.

```bash
git commit -m "feat(core): adicionar validação de email

Implementa validateEmail usando regex RFC 5322.
Trata null, undefined, strings vazias.

Closes #42"
```

Hook valida:
- Tipo (feat, fix, docs, etc.)
- Descrição (min 10 chars)
- Formato

### Pull Requests
1. **Criar PR** - Usar template
2. **Checks CI** - Devem passar
3. **Code review** - Endereçar feedback
4. **Merge** - Squash and merge

---

## Comandos Comuns

### Desenvolvimento
```bash
pnpm dev                    # Iniciar todos apps
pnpm dev --filter=@repo/web # Iniciar app específico
```

### Testes
```bash
pnpm test                   # Rodar todos testes
pnpm test:watch             # Modo watch
pnpm test:coverage          # Relatório de cobertura
```

### Qualidade
```bash
pnpm check                  # type-check + lint + test
pnpm type-check             # Apenas TypeScript
pnpm lint                   # Apenas ESLint
pnpm lint:fix               # Auto-fix linting
pnpm format                 # Formatar com Prettier
```

### Build
```bash
pnpm build                  # Build todos pacotes
pnpm build --filter=@repo/core # Build pacote específico
pnpm clean                  # Remover artefatos de build
```

### Banco de Dados
```bash
pnpm db:up                  # Iniciar Postgres
pnpm db:down                # Parar Postgres
pnpm db:migrate             # Rodar migrations
pnpm db:seed                # Seed data
pnpm db:studio              # Abrir Prisma Studio
```

---

## Troubleshooting

### Testes Falhando Localmente
```bash
# Limpar e rebuildar
pnpm clean
pnpm install
pnpm build
pnpm test
```

### Erros de Tipo
```bash
# Checar pacote específico
pnpm --filter @repo/core type-check

# Rebuildar declarações de tipo
pnpm build --filter=@repo/core
```

### Problemas com Banco de Dados
```bash
# Resetar banco de dados
pnpm db:down
docker volume rm flowform_postgres_data
pnpm db:up
pnpm db:migrate
```

### Porta Já em Uso
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mudar porta
PORT=3001 pnpm dev
```

---

## Targets de Performance

| Métrica | Target |
|---------|--------|
| Cold build | <10 min |
| Incremental build | <1 min |
| Hot reload | <2 sec |
| Suite de testes | <5 min |
| Type-check | <2 min |

---

## Referências

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisões de design
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição
- [READING.md](./READING.md) - Leitura obrigatória

---

**Última Atualização:** 2025-01-10

**Escrever testes. Manter funções pequenas. Shipar.** Esse é o workflow.
