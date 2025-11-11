# ADR-0003: BYO (Bring Your Own) API Key Model

## Status
Accepted

## Context

Flowform needs to call LLM providers (OpenAI, Anthropic) to power conversational forms. We must decide who pays for API usage and who controls the API keys.

**Options**:
1. **Flowform provides API keys** (SaaS model)
   - Users sign up, Flowform bills them
   - Flowform pays OpenAI/Anthropic, marks up cost

2. **Users provide their own API keys** (BYO model)
   - Users create OpenAI/Anthropic accounts
   - Users configure their own keys in Flowform
   - Users pay OpenAI/Anthropic directly

**Constraints**:
- Flowform is 100% open source
- Community-owned infrastructure (not a startup)
- Privacy-first philosophy
- No vendor lock-in

## Decision

Users **bring their own API keys** (BYO model).

**How it works**:
1. User creates account with OpenAI or Anthropic
2. User copies API key from provider
3. User configures key in Flowform (environment variable or dashboard)
4. Flowform calls LLM provider using user's key
5. User pays provider directly (no Flowform markup)

**Configuration**:
```bash
# Environment variables
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Or via dashboard (coming in v1.0):
```
Settings → LLM Provider → Add API Key
```

## Alternatives Considered

### 1. Flowform-Managed API Keys (SaaS Model)
**How it would work**:
- Users sign up to Flowform
- Flowform provides API keys
- Flowform calls LLM on user's behalf
- Flowform bills user (subscription or usage-based)

**Rejected because**:
- **Privacy**: Flowform sees all conversation data
- **Vendor lock-in**: Users depend on Flowform staying alive
- **Business model conflict**: Open source but commercial API?
- **Complexity**: Billing, payments, subscriptions, support
- **Against mission**: "Infrastructure should be owned by everyone"

### 2. Hybrid Model (Optional Managed Keys)
**How it would work**:
- Users can BYO key OR use Flowform-managed keys
- Flowform provides keys as convenience (with markup)
- Users choose based on preference

**Rejected because**:
- **Complexity**: Two modes to maintain and test
- **Support burden**: Questions about billing, usage, limits
- **Mission drift**: Starts as convenience, becomes revenue source
- **Privacy concerns**: Some users' data goes through Flowform
- **Unfair competition**: Hosted Flowform has advantage over self-hosted

### 3. No LLM Abstraction (Users Build Their Own)
**How it would work**:
- Flowform provides framework
- Users implement LLM integration themselves
- No opinionated LLM client

**Rejected because**:
- **Friction**: Too much work for basic use case
- **Fragmentation**: Every deployment implements it differently
- **Lost value**: LLM orchestration is core value prop

## Consequences

### Positive
- **Privacy**: Your data never touches Flowform servers
- **Control**: You control your API keys, usage, provider
- **No lock-in**: Not dependent on Flowform as middleman
- **No markup**: Pay OpenAI/Anthropic directly (no Flowform fee)
- **Simplicity**: No billing, subscriptions, payment processing
- **Aligned with mission**: Open source, community-owned
- **Multiple providers**: Easy to support OpenAI, Anthropic, Google, etc.

### Negative
- **Friction**: Users must create OpenAI/Anthropic account
- **Cost visibility**: Users pay LLM costs directly (some prefer bundled pricing)
- **Support burden**: Users confused about OpenAI vs Flowform
- **Rate limits**: Users hit OpenAI rate limits individually
- **No free tier**: Can't offer "free trial" easily

### Neutral
- **Not a SaaS business**: This isn't a business model (by design)
- **Hosting required**: Users must self-host or use hosted Flowform
- **API key management**: Users must secure their own keys

## Implementation Notes

**Security**:
- API keys stored as environment variables or encrypted in database
- Keys never logged or sent to client
- Keys transmitted over HTTPS only
- Per-workspace keys (in multi-tenant mode)

**Provider support** (v1.0):
- OpenAI (gpt-4o-mini, gpt-4o, gpt-4-turbo)
- Anthropic (claude-3.5-sonnet, claude-3-opus)

**Future providers** (v1.1+):
- Google Gemini
- Mistral
- Cohere
- Local models (Ollama, llama.cpp)

**Error handling**:
```typescript
if (!apiKey) {
  throw new ClientError(
    'LLM provider API key is required. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.',
    401,
    'MISSING_API_KEY'
  );
}
```

**Documentation**:
- Quick start guide: How to get API keys
- Troubleshooting: Rate limits, invalid keys, costs
- Cost estimation: Typical usage for 1000 form submissions

## Comparison

| Aspect | BYO Keys | Flowform-Managed |
|--------|----------|------------------|
| Privacy | ✅ User owns data | ❌ Data goes through Flowform |
| Cost | ✅ Pay provider directly | ❌ Provider cost + markup |
| Setup | ❌ More friction | ✅ Easier (one signup) |
| Vendor lock-in | ✅ None | ❌ Locked to Flowform |
| Billing complexity | ✅ None for Flowform | ❌ Subscriptions, payments |
| Mission alignment | ✅ Community-owned | ❌ Commercial service |
| Self-hosting | ✅ Fully independent | ⚠️ Still depends on Flowform keys |

## References

- [Supabase BYO Database Philosophy](https://supabase.com/docs/guides/platform/bring-your-own-database)
- [n8n Self-Hosting](https://docs.n8n.io/hosting/)
- [Plausible Analytics Self-Hosting](https://plausible.io/self-hosted-web-analytics)

## Date
2025-01-10

## Author
@kayossouza
