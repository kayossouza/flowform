# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-10

### Added - @flowform/core Package

**Complete implementation of the conversational form orchestrator core with 98.62% test coverage**

#### Core Features
- **Pure Function Orchestrator** (`runLlmStep`)
  - Single-turn LLM-powered form field extraction
  - Multi-turn conversation support with context preservation
  - Real-time field validation with descriptive error messages
  - Form completion detection and next field suggestion

- **Comprehensive Type System**
  - `FormDefinition` - Form schema with field definitions
  - `Session` - Conversation state with turns and collected fields
  - `SessionField` - Collected field values with timestamps
  - `SessionTurn` - Conversation message history
  - `LlmClient` - Provider-agnostic LLM abstraction
  - `OrchestratorResult` - Structured output from each turn
  - `ValidationResult` - Discriminated union for type-safe validation

- **Field Type Support**
  - TEXT - Short text input
  - LONG_TEXT - Multi-line text input
  - EMAIL - Email validation with RFC-compliant regex
  - PHONE - International phone number validation (10+ digits)
  - NUMBER - Numeric input with min/max constraints
  - DATE - ISO date validation with invalid date detection (e.g., Feb 30)
  - ENUM - Select from predefined options

- **Validation System**
  - `validateField` - Main dispatcher for field validation
  - `validateEmail` - RFC-compliant email format checking
  - `validatePhone` - International phone number validation
  - `validateNumber` - Min/max constraint validation
  - `validateDate` - ISO date parsing with UTC timezone handling
  - `validateEnum` - Exact match validation against allowed options
  - Required/optional field support
  - Automatic validation on field extraction

- **Context Management**
  - `buildConversationHistory` - Converts session turns to LLM message format
  - `buildFieldContext` - Formats collected fields as context string
  - `buildSystemPrompt` - Generates complete system prompt with form schema
  - `determineNextField` - Identifies next required field to collect

- **Error Handling**
  - `ClientError` - Custom error class for validation/client failures
  - Descriptive error messages with error codes
  - HTTP status codes (400 for client errors)
  - Detailed error context for debugging

#### Testing & Quality
- **75 Test Cases** across 4 test suites
  - Unit tests for all validators
  - Integration tests for orchestrator flow
  - Edge case tests (empty forms, null values, malformed responses)
  - Multi-turn conversation tests

- **98.62% Code Coverage**
  - 98.62% statement coverage
  - 91.6% branch coverage
  - 100% function coverage

- **Quality Gates**
  - Zero TypeScript errors (strict mode)
  - Zero ESLint warnings/errors
  - All functions ≤60 lines
  - All files ≤350 lines
  - Cyclomatic complexity ≤12
  - Zero `any` types

#### Documentation
- **Comprehensive README** with:
  - Quick start guide
  - Core concepts explanation
  - Advanced usage examples (multi-turn, custom prompts)
  - Complete API reference
  - Testing examples
  - Architecture overview

- **JSDoc Comments** on all public APIs
- **Type Annotations** on all exported types and functions

#### Architecture
- **Zero Runtime Dependencies** - Pure TypeScript implementation
- **Framework Agnostic** - Works with any UI or backend framework
- **LLM Agnostic** - Bring your own LLM client (OpenAI, Anthropic, etc.)
- **Pure Functions** - No side effects, fully testable
- **Dependency Injection** - LLM client injected for easy mocking
- **Clean Architecture** - Domain logic isolated from infrastructure

### Project Infrastructure

#### Monorepo Setup
- Turborepo configuration with optimized caching
- TypeScript project references for incremental builds
- Shared ESLint, Prettier, Vitest configurations
- pnpm workspaces with dependency management

#### Quality Automation
- Git hooks with Husky for pre-commit checks
- ESLint 9 flat config with TypeScript rules
- Vitest for unit and integration testing
- Coverage thresholds enforced (95%+ required)

#### Documentation
- 25,000+ words of technical documentation
- Spec Kit workflow for feature development
- Architecture Decision Records (ADRs)
- Development guides and troubleshooting

### Technical Details

#### Breaking Changes
- None (initial release)

#### Bug Fixes
- Fixed date validation to detect invalid dates like Feb 30
- Fixed UTC timezone handling in date validation
- Fixed TypeScript strict mode compliance
- Fixed cyclomatic complexity in date validator

#### Internal Changes
- Extracted helper functions to reduce complexity
- Refactored orchestrator to use prompt-builder helpers
- Created separate tsconfig for tests
- Removed unused ESLint disable directives

### Migration Guide

This is the initial release. To start using @flowform/core:

```bash
pnpm add @flowform/core
```

See the [README](./packages/core/README.md) for usage examples.

### Contributors

- [@kayossouza](https://github.com/kayossouza) - Core orchestrator implementation

---

## [Unreleased]

### Planned for v0.2.0
- [ ] @flowform/llm package (OpenAI and Anthropic adapters)
- [ ] Extended field types (URL, file upload placeholders)
- [ ] Conditional logic support
- [ ] Field dependencies and computed values

### Planned for v1.0.0 (MVP)
- [ ] Web dashboard (Next.js app)
- [ ] Form builder UI
- [ ] Submissions viewer
- [ ] Webhook delivery system
- [ ] Embed widget (script tag, React, iframe)
- [ ] Database layer (Prisma + PostgreSQL)

---

[0.1.0]: https://github.com/kayossouza/flowform/releases/tag/v0.1.0
