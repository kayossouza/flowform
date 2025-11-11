# Guia do Spec Kit - Desenvolvimento Colaborativo

O Flowform usa **Spec Kit** para desenvolvimento estruturado e colaborativo de features. Este guia mostra como você pode contribuir usando este workflow.

## O Que é Spec Kit?

Spec Kit é um workflow de 7 etapas para desenvolvimento orientado a especificações. Cada feature passa por:

1. **Constitution** - Definir princípios e decisões estratégicas
2. **Specify** - Escrever especificação técnica detalhada
3. **Clarify** - Validar e refinar a especificação
4. **Plan** - Criar plano de implementação
5. **Analyze** - Analisar código existente e impactos
6. **Tasks** - Quebrar em tarefas granulares
7. **Implement** - Executar implementação

## Por Que Usar Spec Kit?

**Benefícios:**
- Documentação sempre atualizada
- Menos retrabalho
- Onboarding mais rápido
- Colaboração mais eficiente
- Decisões documentadas (ADRs automáticos)

## Como Funciona na Prática

### Exemplo: Adicionar Upload de Arquivos

#### 1. Constitution (`/speckit constitution`)

Define decisões estratégicas:

```markdown
## Decisões Estratégicas

### Armazenamento
- Usar S3-compatible storage (AWS S3, MinIO, CloudFlare R2)
- Suportar self-hosted e cloud
- Princípio: BYO (Bring Your Own) - usuário configura suas credenciais

### Validação
- Client-side: tipo, tamanho
- Server-side: scan antivírus, metadata
- Princípio: Segurança em camadas

### Limites
- Tamanho máximo: 10MB por arquivo
- Tipos permitidos: imagens (jpg, png), PDFs
- Princípio: Começar restritivo, expandir depois
```

**Output:** ADR criado automaticamente

#### 2. Specify (`/speckit specify`)

Especificação técnica detalhada:

```markdown
## API Endpoints

### POST /api/upload
Request:
{
  "sessionId": "string",
  "fieldId": "string",
  "file": "multipart/form-data"
}

Response:
{
  "fileId": "string",
  "url": "string",
  "metadata": {
    "size": number,
    "type": "string",
    "uploadedAt": "ISO8601"
  }
}

## Database Schema

```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  field_id UUID REFERENCES form_fields(id),
  storage_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**Output:** spec.md completo

#### 3. Clarify (`/speckit clarify`)

Valida a spec com perguntas:

```markdown
## Questões para Clarificar

1. **Segurança**: Como garantir que apenas owner da sessão pode fazer upload?
   - Resposta: Token de sessão JWT validado no endpoint

2. **Performance**: Como lidar com uploads lentos?
   - Resposta: Upload direto para S3 com presigned URLs

3. **Cleanup**: Como deletar arquivos de sessões abandonadas?
   - Resposta: Cron job diário que limpa sessões > 30 dias
```

**Output:** spec.md refinado

#### 4. Plan (`/speckit plan`)

Plano de implementação:

```markdown
## Ordem de Implementação

1. Database migration (file_uploads table)
2. Storage adapter interface
3. S3 storage implementation
4. API endpoint /api/upload
5. Client-side upload component
6. Integration tests
7. E2E tests

## Dependências
- packages/core → Adicionar FieldType.FILE
- packages/storage → Novo pacote (adapter S3)
- apps/web → Upload component
```

**Output:** plan.md

#### 5. Analyze (`/speckit analyze`)

Análise de código existente:

```markdown
## Arquivos Afetados

### packages/core/src/types/field.ts
- Adicionar `FILE` ao enum `FieldType`
- Adicionar `FileFieldValidation` interface

### packages/core/src/validation/validators.ts
- Adicionar `validateFile()` function
- Validar tipo MIME e tamanho

### Impacto: BAIXO
- Zero breaking changes
- Apenas adição de novo tipo
```

**Output:** analysis.md

#### 6. Tasks (`/speckit tasks`)

Tarefas granulares com checklist:

```markdown
## Fase 1: Database & Types (2h)

- [ ] Criar migration `001_add_file_uploads.sql`
- [ ] Adicionar `FILE` a `FieldType` enum
- [ ] Criar `FileFieldValidation` interface
- [ ] Escrever testes para tipos

## Fase 2: Storage Layer (4h)

- [ ] Criar `packages/storage/` package
- [ ] Implementar `StorageAdapter` interface
- [ ] Implementar `S3StorageAdapter`
- [ ] Escrever testes unitários storage
- [ ] Escrever testes integração S3

## Fase 3: API Endpoint (3h)
...
```

**Output:** tasks.md com checklist completo

#### 7. Implement (`/speckit implement`)

Implementação com TDD:

```markdown
## Implementação Atual

### Completo
- [x] Database migration
- [x] Field types
- [x] Storage adapter interface

### Em Progresso
- [ ] S3 implementation (50%)
  - File: packages/storage/src/adapters/s3.ts
  - Tests: 8/12 passing

### Próximos Passos
1. Finalizar S3 upload com presigned URLs
2. Adicionar retry logic
3. Completar testes integração
```

**Output:** Progresso em tempo real

## Como Contribuir Usando Spec Kit

### Para Features Novas

1. **Abra uma Issue** descrevendo a feature
2. **Inicie o Spec Kit** com `/speckit constitution`
3. **Compartilhe a Spec** - faça PR apenas da spec (sem código)
4. **Obtenha Feedback** - comunidade revisa a spec
5. **Implemente** - após spec aprovada, faça implementação
6. **PR do Código** - com link para a spec

### Para Features em Andamento

Veja `docs/TASKS_MVP.md` - lista completa de features planejadas com:
- Specs prontas
- Tasks quebradas
- Status de implementação

**Escolha uma task, implemente, faça PR!**

## Comandos Spec Kit

Todos comandos disponíveis em `.claude/commands/`:

- `/speckit constitution` - Definir princípios
- `/speckit specify` - Escrever spec
- `/speckit clarify` - Validar spec
- `/speckit plan` - Criar plano
- `/speckit analyze` - Analisar código
- `/speckit tasks` - Quebrar em tasks
- `/speckit implement` - Executar
- `/speckit checklist` - Ver progresso

## Estrutura de Arquivos

```
specs/
  001-feature-name/
    spec.md           # Especificação técnica
    plan.md           # Plano de implementação
    tasks.md          # Tarefas granulares
    data-model.md     # Modelos de dados
    contracts/        # Contratos de API
    checklists/       # Progresso
```

## Exemplos Reais

### Exemplo 1: Core Orchestrator (Completo)
- Spec: `specs/001-orchestrator-core/spec.md`
- Status: Implementado (v0.1.0)
- Ver: Estrutura completa de como foi do zero ao release

### Exemplo 2: LLM Integration (Próximo)
- Spec: `docs/TASKS_MVP.md` - Fase 1
- Status: Planejado
- Ótimo para primeira contribuição

## Benefícios para Contribuidores

1. **Clareza** - Você sabe exatamente o que implementar
2. **Contexto** - Entende o "por quê" das decisões
3. **Colaboração** - Pode dar feedback antes do código
4. **Reconhecimento** - Specs são creditadas
5. **Aprendizado** - Vê como features são pensadas do zero

## FAQ

**P: Preciso usar Spec Kit para contribuir?**
R: Para features grandes sim. Para bugs pequenos, não é necessário.

**P: Posso modificar uma spec existente?**
R: Sim! Abra issue propondo mudanças, depois atualize a spec.

**P: E se discordar de uma decisão na spec?**
R: Abra discussão no GitHub. Specs são documentos vivos.

**P: Spec Kit funciona sem Claude?**
R: Sim, mas é mais manual. Templates em `.claude/commands/` podem ser usados como guia.

## Recursos

- **Templates**: `.claude/commands/speckit.*.md`
- **Specs Exemplo**: `specs/001-orchestrator-core/`
- **Tasks MVP**: `docs/TASKS_MVP.md`
- **ADRs**: `docs/adr/`

## Começando

1. Leia uma spec existente: `specs/001-orchestrator-core/spec.md`
2. Escolha uma task: `docs/TASKS_MVP.md`
3. Abra issue: "Quero implementar X"
4. Discuta abordagem
5. Implemente
6. PR!

**Dúvidas?** Abra uma [discussão](https://github.com/kayossouza/flowform/discussions).

---

**O Spec Kit torna colaboração mais eficiente. Especificações claras = menos retrabalho.**
