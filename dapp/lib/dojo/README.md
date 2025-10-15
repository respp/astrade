# Dojo Integration Module

This directory contains the core utilities and types for integrating Dojo with the AsTrade React Native application.

## Files

### `types.ts`
TypeScript type definitions for the entire Dojo integration.

**Exports:**
- `DojoConfig` - Configuration interface
- `DomainSeparator` - Transaction signing domain
- `DojoManifest` - Manifest structure
- `Entity`, `EntityModel` - Entity types
- `QueryFilter`, `SubscriptionCallback` - Query types
- `SystemCall`, `TransactionResult` - Transaction types
- `DojoContextType` - Context interface
- `DojoConnectionState`, `DojoError` - State enums

### `config.ts`
Configuration management and validation.

**Exports:**
- `getDojoConfig()` - Get Dojo configuration from env vars
- `getDomainSeparator()` - Get domain separator for signing
- `validateDojoConfig()` - Validate configuration
- `getDefaultManifest()` - Get placeholder manifest
- `isDojoConfigured()` - Check if fully configured

**Environment Variables:**
```typescript
EXPO_PUBLIC_DOJO_RPC_URL          // Katana/Starknet RPC URL
EXPO_PUBLIC_DOJO_TORII_URL        // Torii indexer URL
EXPO_PUBLIC_DOJO_WORLD_ADDRESS    // Deployed world address
EXPO_PUBLIC_DOJO_NAMESPACE        // Dojo namespace
EXPO_PUBLIC_DOJO_CHAIN_ID         // Chain ID
```

### `systemCalls.ts`
Utilities for executing Dojo system calls.

**Exports:**
- `findContractByTag()` - Find contract in manifest by tag
- `findContractByName()` - Find contract by name
- `buildSystemCall()` - Build system call object
- `formatCalldata()` - Format calldata for Starknet
- `executeSystemCall()` - Execute single system call
- `executeBatchSystemCalls()` - Execute batch calls
- `createSpawnCall()` - Helper for spawn action
- `createActionCall()` - Helper for generic actions

**Usage:**
```typescript
import { buildSystemCall, executeSystemCall } from './systemCalls';

const call = buildSystemCall(contractAddress, 'entrypoint', ['param1']);
const result = await executeSystemCall(call, walletExecute);
```

### `queries.ts`
Utilities for querying entities from Torii.

**Exports:**
- `buildKeysClause()` - Build keys clause for queries
- `buildCompositeClause()` - Build composite query clauses
- `queryEntitiesByKeys()` - Query entities by keys
- `queryEntitiesByModel()` - Query all entities of a model
- `subscribeToEntityUpdates()` - Subscribe to entity changes
- `parseEntityModel()` - Parse specific model from entity
- `parseEntitiesModel()` - Parse model from multiple entities
- `formatEntityKey()` - Format entity key string
- `getEntityId()` - Extract entity ID

**Usage:**
```typescript
import { queryEntitiesByKeys } from './queries';

const entities = await queryEntitiesByKeys(
  toriiClient,
  'di',
  ['Position', 'Moves'],
  [playerAddress]
);
```

## Usage Example

```typescript
// Import types
import type { SystemCall, QueryFilter } from '@/lib/dojo/types';

// Import config
import { getDojoConfig, isDojoConfigured } from '@/lib/dojo/config';

// Import utilities
import { buildSystemCall } from '@/lib/dojo/systemCalls';
import { queryEntitiesByKeys } from '@/lib/dojo/queries';

// Use in components via useDojo hook
import { useDojo } from '@/lib/hooks/useDojo';

function MyComponent() {
  const { executeSystemCall, queryEntities } = useDojo();
  
  // Your logic here
}
```

## Architecture

```
┌─────────────────┐
│  React Native   │
│   Components    │
└────────┬────────┘
         │
         │ useDojo()
         │
┌────────▼────────┐
│  DojoProvider   │
│   (Context)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Torii │ │  Cavos  │
│Client │ │ Wallet  │
└───┬───┘ └────┬────┘
    │          │
    └──────┬───┘
           │
    ┌──────▼──────┐
    │    Dojo     │
    │    World    │
    └─────────────┘
```

## Integration Points

1. **DojoProvider** uses these utilities to:
   - Initialize Torii connection (`config.ts`)
   - Query entities (`queries.ts`)
   - Execute system calls (`systemCalls.ts`)

2. **Components** access functionality via:
   - `useDojo()` hook from `@/lib/hooks/useDojo`

3. **Wallet Integration**:
   - System calls use WalletContext's `executeTransaction()`
   - No separate account management needed

## Development Notes

- All functions are async where applicable
- Error handling is comprehensive with detailed logging
- TypeScript types ensure type safety throughout
- Compatible with React Native (no browser dependencies)
- Modular design allows easy testing and extension

## Testing

Each module can be tested independently:

```typescript
// Test config
import { validateDojoConfig } from './config';
const isValid = validateDojoConfig(myConfig);

// Test system calls
import { buildSystemCall, formatCalldata } from './systemCalls';
const call = buildSystemCall('0x123', 'test', [1, 2, 3]);

// Test queries
import { buildKeysClause } from './queries';
const clause = buildKeysClause('di', ['Position'], ['0x456']);
```

## Future Extensions

This module is designed to be extended with:
- Custom model parsers
- Specialized query builders
- Game-specific system call helpers
- Transaction batching strategies
- Caching layers

## Documentation

For complete documentation, see:
- **API Reference**: `/COINS.md`
- **Integration Guide**: `/dapp/DOJO_INTEGRATION.md`
- **Summary**: `/DOJO_INTEGRATION_SUMMARY.md`

