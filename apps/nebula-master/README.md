# Nebula Master

AI-native product creation platform built on Workflow Builder SDK.

## Overview

Nebula Master enables users to go from first conversation with the Talking Nebula all the way to a live, published application without ever leaving the product or opening a terminal.

## Core User Journey

1. **Sign-in** - User authenticates and is immediately taken into the product
2. **Talking Nebula** - A living, space-nebula conversational presence guides discovery
3. **SSOT Creation** - Single Source of Truth is minted with version history
4. **AI Builder** - Superpowers methodology decomposes SSOT into parallelizable tasks
5. **Live Preview** - Interactive preview with real-time visual adjustments
6. **One-Click Actions** - Push to Git and Publish to Vercel
7. **Secure Secret Vault** - Project-scoped encrypted vault for environment variables

## Data Layer

**Database:** Neon (Serverless Postgres)

Nebula uses Neon as the sole database for:
- Native Vercel compatibility
- Database branching for SSOT versions and previews
- Serverless scaling that matches the agent-driven workflow

### Key Entities

- `users` - User accounts
- `projects` - User projects with status tracking
- `ssot_versions` - Full SSOT history with rollback support
- `conversation_logs` - Permanent, project-scoped conversation history
- `secret_vault_references` - Encrypted pointers to secrets (never actual secrets)
- `deployments` - Git and Vercel deployment tracking

### Important Rules

- Conversation history and SSOT versions are cleanly separated and well-indexed
- Raw secrets are NEVER stored in Neon — only references/encrypted pointers to the vault
- Designed for growth with archival strategy for permanent history

## UI Philosophy

- **Minimal by force** - Every element must earn its place
- **Nebula/Space theme** - Deep space backgrounds with soft luminous accents
- **Glassmorphism surfaces** - Frosted, semi-transparent panels
- **No unnecessary chrome** - Only show what matters

## Development

```bash
pnpm dev
```

Open http://localhost:4202

## Environment Variables

```bash
# Neon Database Connection
VITE_NEON_DATABASE_URL=postgresql://...

# Optional: Encryption key for secret vault (auto-generated in dev)
VITE_VAULT_ENCRYPTION_KEY=...
```

## Architecture

- `src/components/nebula/` - The Talking Nebula conversational presence
- `src/components/ssot/` - SSOT management and versioning
- `src/components/vault/` - Secure secret vault UI
- `src/components/preview/` - Live preview with visual adjustments
- `src/components/actions/` - One-click Git/Vercel actions
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks (`useProjectData`)
- `src/services/` - Backend integration services
  - `nebula-db.ts` - Neon database service with full CRUD operations
  - `secret-vault.ts` - Encrypted secret vault service
- `src/utils/` - Helper utilities

## Non-Negotiable Behaviors

- The Talking Nebula never invents or assumes missing information
- SSOT is versioned and permanent
- Agents run under Superpowers + Headroom
- Preview is the only place for visual polishing
- Git push and Vercel publish are truly one-click
- Secrets live only in the vault
- Every UI element must justify its presence
- **Neon is the only database**

## License

Apache 2.0
