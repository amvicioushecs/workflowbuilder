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

## Architecture

- `src/components/nebula/` - The Talking Nebula conversational presence
- `src/components/ssot/` - SSOT management and versioning
- `src/components/vault/` - Secure secret vault
- `src/components/preview/` - Live preview with visual adjustments
- `src/components/actions/` - One-click Git/Vercel actions
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/services/` - Backend integration services

## License

Apache 2.0
