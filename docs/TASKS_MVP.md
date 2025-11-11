# Flowform MVP Tasks

## Overview

This document breaks down the MVP into granular, implementable tasks. Each task should take 2-8 hours and result in a small, coherent commit.

**Legend:**
- ✅ Completed
- 🚧 In Progress
- ⏸️ Blocked
- ⏳ Pending

---

## Phase 0: Foundation ✅

### Monorepo Setup ✅
- [x] Create root `package.json` with pnpm workspace config
- [x] Create `pnpm-workspace.yaml`
- [x] Create `turbo.json` with task pipeline
- [x] Create `.gitignore`

### TypeScript Configuration ✅
- [x] Create `tsconfig.base.json`
- [x] Create `packages/typescript-config` package
- [x] Create root `tsconfig.json` with project references

### Linting & Formatting ✅
- [x] Create `packages/eslint-config` with ESLint 9 flat config
- [x] Create `.prettierrc` and `.prettierignore`

### Testing Setup ✅
- [x] Create `vitest.config.shared.ts`
- [x] Create `vitest.workspace.ts`

### Development Environment ✅
- [x] Create `docker-compose.yml` for Postgres
- [x] Create `.env.example`

### Documentation ✅
- [x] Create `LICENSE` (MIT)
- [x] Create `docs/PROJECT_SPEC.md`
- [x] Create `docs/TASKS_MVP.md` (this file)
- [ ] Create `docs/ARCHITECTURE.md`
- [ ] Create `docs/DEVELOPMENT.md`
- [ ] Create `.claude/CLAUDE.md`
- [ ] Create `README.md`

### Git Hooks ⏳
- [ ] Setup Husky
- [ ] Create `.husky/pre-commit` hook
- [ ] Create `.husky/pre-push` hook
- [ ] Test hooks work correctly

---

## Phase 1: Core Package (packages/core)

### Package Setup
- [ ] Create `packages/core/package.json`
- [ ] Create `packages/core/tsconfig.json` with composite: true
- [ ] Create `packages/core/vitest.config.ts`
- [ ] Add reference to root `tsconfig.json`

### Type Definitions
- [ ] Create `src/types/field.ts`
  - `FieldType` enum (TEXT, EMAIL, PHONE, NUMBER, DATE, ENUM, LONG_TEXT)
  - `FormField` interface
  - `FieldValue` union type
  - `ValidationRule` type

- [ ] Create `src/types/form.ts`
  - `FormDefinition` interface
  - `FormStatus` enum

- [ ] Create `src/types/session.ts`
  - `Session` interface
  - `SessionStatus` enum
  - `SessionTurn` interface (role: user|assistant, content, timestamp)
  - `SessionField` interface

- [ ] Create `src/types/index.ts`
  - Export all types

### Validation Logic
- [ ] Create `src/validation/validators.ts`
  - `validateEmail(value): ValidationResult`
  - `validatePhone(value): ValidationResult`
  - `validateNumber(value, min?, max?): ValidationResult`
  - `validateDate(value): ValidationResult`
  - `validateEnum(value, options): ValidationResult`

- [ ] Create `src/validation/validate-field.ts`
  - `validateField(field: FormField, value: unknown): ValidationResult`
  - Calls appropriate validator based on field type
  - Checks required constraint
  - Applies custom validation rules

- [ ] Create `tests/validation/validators.test.ts`
  - Test all validators with valid inputs
  - Test all validators with invalid inputs
  - Test edge cases (empty, null, undefined)

- [ ] Create `tests/validation/validate-field.test.ts`
  - Test required field validation
  - Test optional field validation
  - Test custom rules

### Orchestrator Core
- [ ] Create `src/orchestrator/prompt-builder.ts`
  - `buildSystemPrompt(form: FormDefinition): string`
  - `buildConversationHistory(turns: SessionTurn[]): string`
  - `buildFieldContext(fields: SessionField[]): string`

- [ ] Create `src/orchestrator/response-parser.ts`
  - `parseExtractedFields(response: string): Record<string, unknown>`
  - Handle JSON parsing errors
  - Validate extracted fields

- [ ] Create `src/orchestrator/orchestrator.ts`
  - `runLlmStep(form, session, userMessage, llmClient): Promise<OrchestratorResult>`
  - Main orchestration logic
  - Determine next field to ask
  - Handle completion

- [ ] Create `tests/orchestrator/prompt-builder.test.ts`
  - Test prompt generation with different forms
  - Test with various session states

- [ ] Create `tests/orchestrator/response-parser.test.ts`
  - Test parsing valid JSON responses
  - Test handling malformed responses
  - Test field extraction

- [ ] Create `tests/orchestrator/orchestrator.test.ts`
  - Test full conversation flow with mock LlmClient
  - Test error handling
  - Test completion detection
  - Achieve 95%+ coverage

### Package Exports
- [ ] Create `src/index.ts`
  - Export all public APIs
  - Document exported functions

- [ ] Update `package.json` exports field
  - Main export: `./dist/index.js`
  - Types: `./dist/index.d.ts`

- [ ] Verify package builds correctly
  - Run `pnpm build`
  - Check `dist/` output

---

## Phase 2: LLM Package (packages/llm)

### Package Setup
- [ ] Create `packages/llm/package.json`
  - Add dependencies: `openai`, `@anthropic-ai/sdk`
- [ ] Create `packages/llm/tsconfig.json`
- [ ] Create `packages/llm/vitest.config.ts`
- [ ] Add reference to root `tsconfig.json`

### Interface Definition
- [ ] Create `src/types.ts`
  - `LlmMessage` interface (role, content)
  - `LlmResponse` interface (content, usage)
  - `LlmConfig` type
  - `OpenAIConfig` interface
  - `AnthropicConfig` interface

- [ ] Create `src/client.ts`
  - `LlmClient` interface with `complete()` method
  - Export interface

### Configuration
- [ ] Create `src/config.ts`
  - `readLlmConfig(): LlmConfig`
  - Read `LLM_PROVIDER` env var
  - Read provider-specific keys and URLs
  - Validate required fields
  - Throw clear errors for missing config

- [ ] Create `tests/config.test.ts`
  - Test OpenAI config resolution
  - Test Anthropic config resolution
  - Test error for missing provider
  - Test error for missing API keys

### OpenAI Provider
- [ ] Create `src/providers/openai.ts`
  - `OpenAIClient` class implements `LlmClient`
  - Constructor accepts `OpenAIConfig`
  - `complete()` method calls OpenAI API
  - Error handling and retries
  - Timeout configuration

- [ ] Create `tests/providers/openai.test.ts`
  - Test successful completion
  - Test error handling (API down, invalid key, rate limit)
  - Test timeout behavior
  - Mock OpenAI SDK

### Anthropic Provider
- [ ] Create `src/providers/anthropic.ts`
  - `AnthropicClient` class implements `LlmClient`
  - Constructor accepts `AnthropicConfig`
  - `complete()` method calls Anthropic API
  - Error handling and retries

- [ ] Create `tests/providers/anthropic.test.ts`
  - Test successful completion
  - Test error handling
  - Mock Anthropic SDK

### Provider Factory
- [ ] Create `src/create-client.ts`
  - `createLlmClient(config?: LlmConfig): LlmClient`
  - Reads config if not provided
  - Returns appropriate provider instance

- [ ] Create `tests/create-client.test.ts`
  - Test creating OpenAI client
  - Test creating Anthropic client
  - Test error for unknown provider

### Package Exports
- [ ] Create `src/index.ts`
  - Export `LlmClient` interface
  - Export `createLlmClient` function
  - Export types

- [ ] Verify package builds correctly

---

## Phase 3: Next.js Application (apps/web)

### App Initialization
- [ ] Create `apps/web/` directory
- [ ] Initialize Next.js with TypeScript
  - `pnpm create next-app@latest`
  - Select: TypeScript, App Router, Tailwind CSS, ESLint
- [ ] Create `apps/web/package.json`
  - Add dependency: `@repo/core`
  - Add dependency: `@repo/llm`
- [ ] Create `apps/web/tsconfig.json`
  - Extend `@repo/typescript-config/nextjs.json`
  - Add references to core and llm packages
- [ ] Add app reference to root `tsconfig.json`

### Tailwind Configuration
- [ ] Create `apps/web/tailwind.config.ts`
  - Configure content paths
  - Add custom theme if needed
- [ ] Update `apps/web/app/globals.css`
  - Tailwind directives
  - Custom CSS variables

### Base UI Components
- [ ] Create `components/ui/button.tsx`
- [ ] Create `components/ui/input.tsx`
- [ ] Create `components/ui/card.tsx`
- [ ] Create `components/ui/label.tsx`
- [ ] Create `components/ui/textarea.tsx`

### Utilities
- [ ] Create `lib/utils.ts`
  - `cn()` function (classnames helper)
  - Date/time formatters
  - String utilities

- [ ] Create `lib/logger.ts`
  - Winston or Pino logger
  - No `console.log` usage

### Root Layout
- [ ] Create `app/layout.tsx`
  - Metadata configuration
  - Font loading
  - Global styles

- [ ] Create `app/page.tsx`
  - Landing page (redirect to dashboard for now)

### Verify App Runs
- [ ] Run `pnpm dev`
- [ ] Verify app loads at `http://localhost:3000`
- [ ] No console errors

---

## Phase 4: Database Layer (apps/web/prisma)

### Prisma Setup
- [ ] Install Prisma
  - `pnpm add -D prisma`
  - `pnpm add @prisma/client`
- [ ] Initialize Prisma
  - `pnpm prisma init`

### Schema Definition
- [ ] Create `prisma/schema.prisma`
  - Configure datasource (PostgreSQL)
  - Configure client generator

- [ ] Define `Form` model
- [ ] Define `FormField` model with relation to Form
- [ ] Define `FormWebhook` model
- [ ] Define `Session` model
- [ ] Define `SessionTurn` model
- [ ] Define `SessionField` model
- [ ] Define `Submission` model
- [ ] Define `WebhookDelivery` model
- [ ] Add all indexes

### Migrations
- [ ] Run first migration
  - `pnpm prisma migrate dev --name init`
- [ ] Verify migration applied
  - Check database tables created

### Seed Script
- [ ] Create `prisma/seed.ts`
  - Create 2-3 sample forms
  - Create sample sessions
  - Create sample submissions

- [ ] Add seed script to `package.json`
  ```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
  ```

- [ ] Run seed
  - `pnpm db:seed`

### Prisma Client
- [ ] Create `lib/prisma.ts`
  - Singleton Prisma client
  - Connection pooling configuration
  - Logging configuration

- [ ] Test database connection
  - Create simple script to query forms

---

## Phase 5: API Routes (apps/web/app/api)

### Forms API
- [ ] Create `app/api/forms/route.ts`
  - `GET /api/forms` - List all forms
  - `POST /api/forms` - Create new form

- [ ] Create `app/api/forms/[id]/route.ts`
  - `GET /api/forms/[id]` - Get single form with fields
  - `PUT /api/forms/[id]` - Update form
  - `DELETE /api/forms/[id]` - Delete form

- [ ] Create `tests/api/forms.test.ts`
  - Test CRUD operations
  - Test validation errors
  - Test 404 for missing form

### Sessions API
- [ ] Create `app/api/sessions/route.ts`
  - `POST /api/sessions` - Create new session
  - Initialize with greeting message

- [ ] Create `app/api/sessions/[id]/messages/route.ts`
  - `POST /api/sessions/[id]/messages` - Send user message
  - Call orchestrator
  - Save turn to database
  - Return bot response

- [ ] Create `tests/api/sessions.test.ts`
  - Test session creation
  - Test sending messages
  - Test conversation flow
  - Test completion detection

### Submissions API
- [ ] Create `app/api/submissions/route.ts`
  - `POST /api/submissions` - Submit completed form
  - Validate all required fields
  - Save to database
  - Trigger webhook delivery

- [ ] Create `app/api/submissions/[formId]/route.ts`
  - `GET /api/submissions?formId=...` - List submissions for form

- [ ] Create `tests/api/submissions.test.ts`
  - Test submission creation
  - Test validation
  - Test listing

### Error Handling
- [ ] Create `lib/api-error.ts`
  - Standard error response format
  - HTTP status codes

- [ ] Add error handling middleware
  - Catch unexpected errors
  - Return consistent error format
  - Log errors

---

## Phase 6: Dashboard UI (apps/web/app/(dashboard))

### Layout
- [ ] Create `app/(dashboard)/layout.tsx`
  - Sidebar navigation
  - Header with app name
  - Responsive design

### Forms List Page
- [ ] Create `app/(dashboard)/page.tsx`
  - Fetch forms from `/api/forms`
  - Display in table or card grid
  - "Create Form" button
  - Empty state when no forms

- [ ] Create `components/forms/forms-list.tsx`
  - Table component
  - Actions menu (edit, delete)

### Form Builder
- [ ] Create `app/(dashboard)/forms/new/page.tsx`
  - Form builder UI
  - Add/remove fields
  - Configure field properties (name, type, required)
  - Save button (POST to `/api/forms`)

- [ ] Create `components/forms/form-builder.tsx`
  - Drag-and-drop field reordering (nice-to-have)
  - Field editor modal/panel

- [ ] Create `components/forms/field-editor.tsx`
  - Field configuration form
  - Type selector
  - Validation options

### Form Details Page
- [ ] Create `app/(dashboard)/forms/[id]/page.tsx`
  - Display form details
  - List of fields
  - Embed code display (copy to clipboard)
  - Link to edit
  - Link to submissions

### Form Edit Page
- [ ] Create `app/(dashboard)/forms/[id]/edit/page.tsx`
  - Re-use form builder component
  - Load existing form data
  - Save updates (PUT to `/api/forms/[id]`)

### Submissions Page
- [ ] Create `app/(dashboard)/forms/[id]/submissions/page.tsx`
  - Fetch submissions from `/api/submissions?formId=...`
  - Display in table
  - View individual submission details
  - Export as CSV (nice-to-have)

- [ ] Create `components/submissions/submissions-table.tsx`
  - Display submission data
  - Show webhook delivery status

---

## Phase 7: Embed Widget (apps/web/app/embed)

### Embed Page
- [ ] Create `app/embed/[formId]/page.tsx`
  - Standalone page for iframe embed
  - Minimal layout (no header/sidebar)
  - Load form definition
  - Render chat widget

### Chat Widget Component
- [ ] Create `components/embed/chat-widget.tsx`
  - Message list
  - Input area
  - Send button
  - Loading states
  - Error states

- [ ] Create `components/embed/message-bubble.tsx`
  - User message styling
  - Assistant message styling
  - Timestamp display

- [ ] Create `components/embed/chat-input.tsx`
  - Textarea for user input
  - Send button
  - Auto-resize textarea
  - Enter to send (Shift+Enter for new line)

### Embed Logic
- [ ] Create `hooks/use-chat-session.ts`
  - React hook for managing chat state
  - Create session on mount
  - Send messages
  - Handle responses
  - Track completion status

- [ ] Handle form completion
  - Show success message
  - Submit to `/api/submissions`
  - Display confirmation

### Embed Options
- [ ] Create `public/embed.js`
  - Script tag embed
  - Creates iframe pointing to `/embed/[formId]`
  - Configurable position (bottom-right, bottom-left, etc.)

- [ ] Document embed options in README
  - Script tag usage
  - React component usage
  - iframe direct usage

---

## Phase 8: Webhooks (apps/web/lib/webhooks)

### Webhook Configuration
- [ ] Add webhook URL to form builder
  - Input for webhook URL
  - Optional headers configuration
  - Save to `FormWebhook` table

- [ ] Create `lib/webhooks/validate-url.ts`
  - Validate webhook URL format
  - Test webhook connectivity (optional)

### Webhook Delivery
- [ ] Create `lib/webhooks/deliver.ts`
  - `deliverWebhook(submission): Promise<WebhookDelivery>`
  - HTTP POST to webhook URL
  - Include headers
  - Set timeout (10s)
  - Retry logic (3 attempts with exponential backoff)
  - Save delivery record to database

- [ ] Create `lib/webhooks/retry.ts`
  - Background job to retry failed deliveries
  - Check for `FAILED` or `RETRYING` deliveries
  - Attempt redelivery
  - Update status

- [ ] Create `tests/lib/webhooks.test.ts`
  - Test successful delivery
  - Test retry on failure
  - Test timeout handling

### Webhook Dashboard
- [ ] Add webhook delivery status to submissions page
  - Show delivery status badge
  - Show retry count
  - Show last attempt time
  - Show response details

- [ ] Create `app/(dashboard)/forms/[id]/webhooks/page.tsx` (nice-to-have)
  - Configure webhook for form
  - Test webhook
  - View delivery history

---

## Phase 9: Polish & Documentation

### Error Handling
- [ ] Add global error boundary
- [ ] Add 404 page
- [ ] Add 500 page
- [ ] Improve error messages throughout

### Loading States
- [ ] Add loading skeletons for dashboard pages
- [ ] Add loading spinners for API calls
- [ ] Add optimistic updates where appropriate

### Accessibility
- [ ] Run basic a11y audit
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

### Performance
- [ ] Optimize bundle size
- [ ] Add caching headers
- [ ] Optimize database queries (indexes)
- [ ] Add request rate limiting

### Documentation
- [ ] Complete `README.md`
  - Project overview
  - Quick start guide
  - Architecture diagram
  - Contributing guidelines

- [ ] Complete `docs/DEVELOPMENT.md`
  - Setup instructions
  - Development workflow
  - Testing guidelines
  - Common issues

- [ ] Complete `docs/ARCHITECTURE.md`
  - Design decisions
  - Trade-offs made
  - Future considerations

- [ ] Create `CONTRIBUTING.md`
  - Code style guide
  - Pull request process
  - Issue templates

- [ ] Create `CHANGELOG.md`
  - Version history
  - Breaking changes
  - Migration guides

### Demo & Marketing
- [ ] Deploy demo instance
- [ ] Create demo video (2-3 minutes)
- [ ] Write launch blog post
- [ ] Prepare social media posts

---

## Phase 10: Testing & Quality Assurance

### Test Coverage
- [ ] Achieve 90%+ overall coverage
- [ ] Achieve 95%+ coverage for packages/core
- [ ] Add missing tests identified by coverage report

### E2E Tests
- [ ] Setup Playwright
- [ ] Test: Create form via dashboard
- [ ] Test: Complete conversation in embed widget
- [ ] Test: View submission in dashboard
- [ ] Test: Webhook delivery

### Manual Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS, Android)
- [ ] Test with slow network (throttling)
- [ ] Test with OpenAI provider
- [ ] Test with Anthropic provider

### Security Review
- [ ] Review for SQL injection vulnerabilities
- [ ] Review for XSS vulnerabilities
- [ ] Review for CSRF vulnerabilities
- [ ] Review for secrets in code
- [ ] Add security policy (`SECURITY.md`)

---

## Phase 11: Launch Preparation

### CI/CD
- [ ] Setup GitHub Actions
  - Lint on PR
  - Test on PR
  - Type-check on PR
  - Build on PR
  - Deploy on merge to main

- [ ] Setup remote caching (Turborepo)
  - Vercel Remote Cache or self-hosted

### Deployment
- [ ] Choose hosting platform (Vercel, Netlify, Railway)
- [ ] Setup staging environment
- [ ] Setup production environment
- [ ] Configure environment variables
- [ ] Test deployment

### Monitoring
- [ ] Add error tracking (Sentry or similar)
- [ ] Add basic analytics (PostHog or similar)
- [ ] Add uptime monitoring
- [ ] Add performance monitoring

### Launch
- [ ] Final QA pass
- [ ] Write announcement post
- [ ] Submit to Product Hunt
- [ ] Share on Twitter, LinkedIn, Reddit
- [ ] Publish to GitHub

---

## Post-MVP Backlog

Ideas for future development (not v1):

### Features
- [ ] Multi-workspace support
- [ ] User authentication (OAuth, SSO)
- [ ] Role-based permissions
- [ ] Streaming responses
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Integration marketplace
- [ ] Custom branding/white-label
- [ ] Mobile apps (React Native)
- [ ] Conditional logic (skip fields based on answers)
- [ ] File upload fields
- [ ] Payment integration (Stripe)

### Technical Improvements
- [ ] GraphQL API option
- [ ] WebSocket support for real-time updates
- [ ] Edge function deployment
- [ ] Rate limiting per form
- [ ] Caching layer (Redis)
- [ ] Full-text search (Elasticsearch)
- [ ] Internationalization (i18n)
- [ ] Dark mode
- [ ] Comprehensive a11y audit (WCAG 2.1 AA)

---

**Last Updated**: 2025-01-10
**Status**: Active Development
**Current Phase**: Phase 0 (Foundation)
