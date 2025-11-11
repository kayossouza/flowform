# Contribuindo para o Flowform

Infraestrutura open-source para formulários conversacionais com IA. Cada contribuição conta.

---

## Início Rápido

### 1. Fork & Clone
```bash
git clone https://github.com/SEU_USUARIO/flowform.git
cd flowform
pnpm install
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
# Adicionar sua chave API OpenAI ou Anthropic no .env

pnpm db:up
pnpm db:migrate
pnpm dev
```

### 3. Verificar Setup
```bash
pnpm check  # Deve passar: type-check + lint + test
```

---

## Fazendo Mudanças

### Criar um Branch
```bash
git checkout -b feature/seu-nome-feature
# ou: fix/descricao-bug, docs/*, refactor/*, test/*
```

### Escrever Código

**Seguir estes princípios:**
- Escrever testes primeiro (TDD)
- Manter funções ≤60 linhas
- Manter arquivos ≤350 linhas
- Sem tipos `any`
- Usar logger, não `console.log`

Veja [DEVELOPMENT.md](./docs/pt-br/DEVELOPMENT.md) para workflow detalhado.

### A Regra do Escoteiro

**"Sempre deixe o código mais limpo do que encontrou."**

Quando tocar em um arquivo:
- Corrigir code smells que ver
- Melhorar nomes pouco claros
- Extrair funções longas
- Adicionar testes faltantes
- Documentar comportamento pouco claro

Se cada contribuidor melhorar o código 1%, teremos uma codebase de classe mundial.

### Fazer Commit de Mudanças

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(core): adicionar validação de email

Implementa validateEmail com regex RFC 5322.
Trata null, undefined, strings vazias.

Closes #42"
```

**Tipos de commit:**
- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Reestruturação de código
- `test:` - Adição de testes
- `chore:` - Tooling, dependências

Git hooks validarão automaticamente o formato da mensagem de commit.

### Push & Criar PR

```bash
git push origin feature/seu-nome-feature
```

Abrir um PR no GitHub. Usar o template. Responder todas as perguntas.

---

## O Que Profissionais Fazem

Não precisa de compromisso. Apenas faça isso:

1. **Escrever testes primeiro** - RED → GREEN → REFACTOR
2. **Manter funções pequenas** - Uma coisa, bem feita
3. **Nomear coisas claramente** - Sem abreviações
4. **Deixar mais limpo** - Regra do Escoteiro
5. **Shipar funcionando** - Testes provam que funciona

É isso. Qualidade é um hábito, não uma regra.

---

## Padrões de Code Review

Reviewers checam:
1. **Funciona?** (testes passam)
2. **Está limpo?** (fácil de ler)
3. **É simples?** (sem complexidade desnecessária)
4. **Se encaixa?** (segue arquitetura)

Rejeitamos PRs que falham nesses padrões. Não é pessoal - é profissionalismo.

---

## Estilo de Código

### TypeScript
```typescript
// ✅ Bom
function validateEmail(value: string): ValidationResult {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
}

// ❌ Ruim
function valEm(v: any) { /* ... */ }
```

### Testes
```typescript
describe('validateEmail', () => {
  it('aceita email válido', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = validateEmail('not-an-email');
    expect(result.valid).toBe(false);
  });
});
```

### Tratamento de Erros
```typescript
// ✅ Bom: Erros específicos
throw new ValidationError(
  'Formato de email inválido',
  'INVALID_EMAIL',
  { value }
);

// ❌ Ruim: Erros genéricos
throw new Error('Algo deu errado');
```

---

## Arquitetura

Flowform usa Clean Architecture:

```
Domínio (packages/core) - TypeScript puro, zero dependências
  ↑
Infraestrutura (packages/llm) - Clientes LLM
  ↑
Aplicação (apps/web/lib) - Rotas API, queries DB
  ↑
Apresentação (apps/web/app) - Componentes UI
```

**Regra:** Dependências apontam apenas para dentro. Domínio não depende de nada.

Veja [ARCHITECTURE.md](./docs/pt-br/ARCHITECTURE.md) para decisões de design.

---

## Obtendo Ajuda

- **Perguntas:** [GitHub Discussions](https://github.com/kayossouza/flowform/discussions)
- **Bugs:** [GitHub Issues](https://github.com/kayossouza/flowform/issues)
- **Primeira vez?** Procure label [`good first issue`](https://github.com/kayossouza/flowform/labels/good%20first%20issue)

---

## Leitura Obrigatória

Antes de contribuir para pacotes core, ler:
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) (capítulos 2-3)
- [Test Driven Development](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

Lista completa de leitura: [docs/READING.md](./docs/READING.md)

---

## Reconhecimento

Top contribuidores (mais impactantes, não mais commits) podem ser convidados para o core team.

---

## Código de Conduta

Seja gentil. Seja respeitoso. Seja construtivo.

Veja [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) para detalhes.

---

**Obrigado por contribuir.** Confira [good first issues](https://github.com/kayossouza/flowform/labels/good%20first%20issue) para começar.
