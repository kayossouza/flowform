# Architecture Decision Records (ADRs)

## What Are ADRs?

Architecture Decision Records document important architectural decisions made in the project. They capture:
- **What** decision was made
- **Why** it was made
- **What** alternatives were considered
- **What** consequences (positive and negative) result from the decision

## Why We Use ADRs

**"Your code tells you WHAT it does. ADRs tell you WHY it does it."** - Uncle Bob

ADRs are essential because:
- **Onboarding**: New contributors understand why the system is built this way
- **Context**: Decisions make sense years later when the original author is gone
- **Accountability**: Forces us to think through decisions carefully
- **Learning**: Future us learns from past us

## Format

Each ADR follows this structure:

```markdown
# ADR-XXXX: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-YYYY

## Context
What is the issue we're facing? What constraints exist?

## Decision
What did we decide to do?

## Consequences
What becomes easier or harder as a result?
```

## Naming Convention

- `0001-use-clean-architecture.md`
- `0002-pure-function-orchestrator.md`
- `0003-byo-api-key-model.md`

Zero-padded numbers, kebab-case titles.

## When to Write an ADR

Write an ADR when making decisions about:
- Architecture patterns (layering, dependency injection)
- Technology choices (databases, frameworks, libraries)
- Trade-offs (consistency vs. availability, simplicity vs. flexibility)
- Conventions (file structure, naming, error handling)

**Rule of thumb**: If you had to think hard about it, write an ADR.

## How to Write an ADR

1. Copy the template below
2. Fill in each section
3. Discuss with team (if applicable)
4. Commit to `docs/adr/`
5. Reference ADR number in code comments when implementing the decision

## Template

```markdown
# ADR-XXXX: [Short Title]

## Status
Proposed

## Context
[Describe the problem and any constraints]

## Decision
[Describe what you decided to do]

## Alternatives Considered
[List other options and why they were rejected]

## Consequences

### Positive
- [What becomes easier?]
- [What risks are mitigated?]

### Negative
- [What becomes harder?]
- [What new risks are introduced?]

### Neutral
- [What changes but isn't clearly better or worse?]
```

## References

- [Architecture Decision Records](https://adr.github.io/)
- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
