# Dojo Integration Documentation

This document describes the Dojo integration in the AsTrade React Native application. The integration establishes a connection layer between the mobile app and Dojo world, enabling onchain entity queries and system call execution.

## Architecture Overview

The Dojo integration follows a modular architecture with clear separation of concerns:

```
dapp/
├── contexts/
│   └── DojoContext.tsx          # Main provider managing Torii connection
├── lib/
│   ├── dojo/
│   │   ├── config.ts            # Configuration and environment variables
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── systemCalls.ts       # System call utilities
│   │   └── queries.ts           # Entity query utilities
│   ├── hooks/
│   │   └── useDojo.ts           # React hook for component access
│   └── config.ts                # Extended with Dojo configuration
```

## Key Components

### 1. DojoProvider Context

Located in `dapp/contexts/DojoContext.tsx`, this is the main integration point.

**Features:**
- Initializes Torii client connection to Dojo world
- Manages connection state (connecting, connected, error, reconnecting)
- Integrates with WalletContext for transaction signing
- Provides methods for querying entities and executing system calls
- Handles automatic reconnection with configurable retry logic
- Auto-connects when wallet is authenticated

**Usage:**
```tsx
import { DojoProvider } from '@/contexts/DojoContext';

// Wrap your app with DojoProvider (after WalletProvider)
function App() {
  return (
    <WalletProvider>
      <DojoProvider>
        {/* Your app components */}
      </DojoProvider>
    </WalletProvider>
  );
}
```

### 2. Configuration System

Located in `dapp/lib/dojo/config.ts`.

**Environment Variables:**
```bash
# Required
EXPO_PUBLIC_DOJO_RPC_URL=http://localhost:5050          # Katana RPC endpoint
EXPO_PUBLIC_DOJO_TORII_URL=http://localhost:8080        # Torii indexer endpoint
EXPO_PUBLIC_DOJO_WORLD_ADDRESS=0x...                    # Deployed world address
EXPO_PUBLIC_DOJO_NAMESPACE=di                           # Dojo namespace

# Optional
EXPO_PUBLIC_DOJO_ENABLED=true                           # Enable/disable Dojo
EXPO_PUBLIC_DOJO_CHAIN_ID=0x4b4154414e41               # Chain ID (KATANA)
```

**Configuration Access:**
```typescript
import { getDojoConfig, isDojoConfigured } from '@/lib/dojo/config';

const config = getDojoConfig();
const isReady = isDojoConfigured();
```

### 3. Type System

Located in `dapp/lib/dojo/types.ts`.

Provides comprehensive TypeScript types for:
- Configuration structures
- Entity and model definitions
- Query filters and subscriptions
- System call interfaces
- Manifest structures
- Connection states and errors

### 4. System Calls

Located in `dapp/lib/dojo/systemCalls.ts`.

**Execute a system call:**
```typescript
import { useDojo } from '@/lib/hooks/useDojo';

function MyComponent() {
  const { executeSystemCall, findContract } = useDojo();

  const handleAction = async () => {
    // Find contract in manifest
    const actionsContract = findContract('actions');
    
    if (actionsContract) {
      // Execute system call
      const result = await executeSystemCall({
        contractAddress: actionsContract.address,
        entrypoint: 'spawn',
        calldata: [],
      });
      
      console.log('Transaction hash:', result.transaction_hash);
    }
  };

  return <Button onPress={handleAction}>Execute Action</Button>;
}
```

**Helper functions:**
```typescript
import { buildSystemCall, createActionCall } from '@/lib/dojo/systemCalls';

// Build a system call manually
const call = buildSystemCall(contractAddress, 'entrypoint', ['param1', 'param2']);

// Create an action call using manifest
const call = createActionCall(manifest, 'move', [Direction.Up]);
```

### 5. Entity Queries

Located in `dapp/lib/dojo/queries.ts`.

**Query entities:**
```typescript
import { useDojo } from '@/lib/hooks/useDojo';

function MyComponent() {
  const { queryEntities, config } = useDojo();

  const fetchPlayerData = async (playerAddress: string) => {
    const entities = await queryEntities({
      keys: [playerAddress],
      models: ['Position', 'Moves'],
    });
    
    console.log('Player entities:', entities);
  };
}
```

**Subscribe to entity updates:**
```typescript
import { useDojo } from '@/lib/hooks/useDojo';
import { useEffect } from 'react';

function MyComponent() {
  const { subscribeToEntities, config } = useDojo();
  const playerAddress = '0x...';

  useEffect(() => {
    let subscription: Subscription | null = null;

    const subscribe = async () => {
      subscription = await subscribeToEntities(
        {
          keys: [playerAddress],
          models: ['Position', 'Moves'],
        },
        ({ data, error }) => {
          if (error) {
            console.error('Subscription error:', error);
            return;
          }
          
          if (data) {
            console.log('Entity updated:', data);
            // Update UI with new data
          }
        }
      );
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.cancel();
      }
    };
  }, [playerAddress, subscribeToEntities]);
}
```

### 6. React Hook

Located in `dapp/lib/hooks/useDojo.ts`.

**Basic usage:**
```typescript
import { useDojo } from '@/lib/hooks/useDojo';

function MyComponent() {
  const {
    isConnected,
    isLoading,
    error,
    connectionState,
    queryEntities,
    executeSystemCall,
    reconnect,
  } = useDojo();

  if (isLoading) {
    return <Text>Connecting to Dojo...</Text>;
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <Button onPress={reconnect}>Retry</Button>
      </View>
    );
  }

  if (!isConnected) {
    return <Text>Dojo not connected</Text>;
  }

  return <Text>Connected to Dojo!</Text>;
}
```

**Helper hooks:**
```typescript
import { useDojoReady, useDojoStatus } from '@/lib/hooks/useDojo';

// Check if Dojo is ready
const isReady = useDojoReady();

// Get connection status safely
const { isConnected, isLoading, error } = useDojoStatus();
```

## Integration with WalletContext

The Dojo integration uses the existing WalletContext for transaction signing:

1. **DojoProvider** depends on **WalletProvider** being available in the component tree
2. System calls are executed through `wallet.execute()` from WalletContext
3. Batch transactions use `wallet.executeCalls()`
4. Auto-connection happens when wallet authentication is detected

This design keeps wallet management centralized while allowing Dojo-specific logic to remain modular.

## Setup Instructions

### 1. Install Dependencies

```bash
cd dapp
npm install
# or
pnpm install
```

Dependencies added:
- `@dojoengine/core@1.7.1`
- `@dojoengine/sdk@^1.7.2`
- `@dojoengine/torii-client@1.7.2`
- `starknet@^8.5.2`

### 2. Configure Environment Variables

Create or update your `.env` file:

```bash
# Dojo Configuration
EXPO_PUBLIC_DOJO_ENABLED=true
EXPO_PUBLIC_DOJO_RPC_URL=http://localhost:5050
EXPO_PUBLIC_DOJO_TORII_URL=http://localhost:8080
EXPO_PUBLIC_DOJO_WORLD_ADDRESS=<your-deployed-world-address>
EXPO_PUBLIC_DOJO_NAMESPACE=di
```

### 3. Start Local Dojo Environment

In the `dojo-intro/contracts` directory:

```bash
# Terminal 1: Start Katana (local Starknet node)
katana --dev

# Terminal 2: Build and migrate contracts
sozo build
sozo migrate

# Terminal 3: Start Torii (indexer)
torii --world <WORLD_ADDRESS_FROM_MIGRATE>
```

Copy the world address from the `sozo migrate` output and set it in your `.env` file.

### 4. Update Your App Root

Wrap your app with DojoProvider:

```tsx
// app/_layout.tsx or App.tsx
import { WalletProvider } from '@/contexts/WalletContext';
import { DojoProvider } from '@/contexts/DojoContext';

export default function RootLayout() {
  return (
    <WalletProvider>
      <DojoProvider>
        {/* Your app routes */}
      </DojoProvider>
    </WalletProvider>
  );
}
```

### 5. Use in Components

```tsx
import { useDojo } from '@/lib/hooks/useDojo';

export default function GameScreen() {
  const { isConnected, executeSystemCall } = useDojo();

  // Your component logic
}
```

## Connection Flow

1. User authenticates with Cavos wallet (WalletContext)
2. DojoProvider detects authentication and auto-connects to Dojo
3. Torii client initializes with configured RPC and Torii URLs
4. Connection state updates to CONNECTED
5. Components can now query entities and execute system calls

## Error Handling

The integration includes comprehensive error handling:

```typescript
enum DojoError {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

Automatic reconnection is attempted up to 3 times with 5-second intervals between attempts.

## Next Steps

This integration provides the **connection infrastructure** for Dojo. Future development can include:

1. **Custom Models**: Define AsTrade-specific models (e.g., `CoinBalance`, `TradeHistory`)
2. **System Contracts**: Deploy custom systems for minting coins, trading, rewards
3. **Real-time Updates**: Implement UI updates based on entity subscriptions
4. **Manifest Integration**: Load actual manifest from deployed contracts
5. **Enhanced Error Recovery**: Implement more sophisticated reconnection strategies

## Development Tips

- **Mock Mode**: Set `EXPO_PUBLIC_DOJO_ENABLED=false` to disable Dojo during development
- **Logging**: Check console for detailed connection and transaction logs
- **Network Issues**: Ensure Katana and Torii are running and accessible from your device/emulator
- **Configuration**: Use `isDojoConfigured()` to check if all required config is present

## Troubleshooting

**Connection fails:**
- Verify Katana is running on the configured RPC URL
- Check Torii is running and indexed the world
- Ensure world address is correctly set in environment variables

**Transactions fail:**
- Confirm wallet is connected and authenticated
- Verify contract addresses in manifest are correct
- Check calldata format matches contract expectations

**Subscriptions don't update:**
- Ensure Torii is properly synced with Katana
- Verify entity keys match the queried data
- Check subscription hasn't been cancelled prematurely

## Resources

- [Dojo Documentation](https://book.dojoengine.org/)
- [Torii Client Reference](https://book.dojoengine.org/toolchain/torii/)
- [Starknet React Native](https://docs.starknet.io/documentation/tools/starknet-js/)
