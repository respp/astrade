# Dojo Integration Guide

This guide explains how to integrate the DojoProvider into your AsTrade app and start using Dojo functionality.

## Step 1: Install Dependencies

Run the following command in the `dapp` directory:

```bash
npm install
# or
pnpm install
```

This will install the Dojo SDK packages:
- `@dojoengine/core@1.7.1`
- `@dojoengine/sdk@^1.7.2`
- `@dojoengine/torii-client@1.7.2`
- `starknet@^8.5.2`

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.dojo.example .env
   ```

2. Or add these variables to your existing `.env` file:
   ```bash
   EXPO_PUBLIC_DOJO_ENABLED=true
   EXPO_PUBLIC_DOJO_RPC_URL=http://localhost:5050
   EXPO_PUBLIC_DOJO_TORII_URL=http://localhost:8080
   EXPO_PUBLIC_DOJO_WORLD_ADDRESS=<your-world-address>
   EXPO_PUBLIC_DOJO_NAMESPACE=di
   ```

3. Get your world address:
   - Navigate to `dojo-intro/contracts`
   - Run `sozo migrate`
   - Copy the world address from the output
   - Paste it into your `.env` file

## Step 3: Update App Layout

Update `app/_layout.tsx` to include the DojoProvider:

```tsx
import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WalletProvider } from '../contexts/WalletContext';
import { DojoProvider } from '../contexts/DojoContext'; // Add this import

// ... existing RootLayoutNav component ...

export default function RootLayout() {
  useFrameworkReady();

  return (
    <WalletProvider>
      <DojoProvider>  {/* Add DojoProvider inside WalletProvider */}
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </AuthProvider>
      </DojoProvider>
    </WalletProvider>
  );
}
```

**Important**: DojoProvider must be placed inside WalletProvider because it depends on wallet functionality for transaction signing.

## Step 4: Start Local Dojo Environment

In the `dojo-intro/contracts` directory, run these commands in separate terminals:

**Terminal 1 - Start Katana (local Starknet node):**
```bash
katana --dev
```

**Terminal 2 - Build and deploy contracts:**
```bash
sozo build
sozo migrate
```

**Terminal 3 - Start Torii (indexer):**
```bash
torii --world <WORLD_ADDRESS_FROM_MIGRATE>
```

## Step 5: Use Dojo in Your Components

### Basic Usage

```tsx
import { useDojo } from '@/lib/hooks/useDojo';
import { View, Text, Button } from 'react-native';

export default function MyScreen() {
  const { isConnected, isLoading, error } = useDojo();

  if (isLoading) {
    return <Text>Connecting to Dojo...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!isConnected) {
    return <Text>Dojo not connected</Text>;
  }

  return (
    <View>
      <Text>Connected to Dojo! ✅</Text>
    </View>
  );
}
```

### Execute System Calls

```tsx
import { useDojo } from '@/lib/hooks/useDojo';
import { View, Button } from 'react-native';

export default function GameScreen() {
  const { executeSystemCall, findContract } = useDojo();

  const handleSpawn = async () => {
    try {
      // Find the actions contract
      const actionsContract = findContract('di-actions');
      
      if (!actionsContract) {
        console.error('Actions contract not found');
        return;
      }

      // Execute spawn system call
      const result = await executeSystemCall({
        contractAddress: actionsContract.address,
        entrypoint: 'spawn',
        calldata: [],
      });

      console.log('Transaction hash:', result.transaction_hash);
      alert('Player spawned successfully!');
    } catch (error) {
      console.error('Failed to spawn:', error);
      alert('Failed to spawn player');
    }
  };

  return (
    <View>
      <Button title="Spawn Player" onPress={handleSpawn} />
    </View>
  );
}
```

### Query Entities

```tsx
import { useDojo } from '@/lib/hooks/useDojo';
import { useWallet } from '@/contexts/WalletContext';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function PlayerStatsScreen() {
  const { queryEntities } = useDojo();
  const { wallet } = useWallet();
  const [position, setPosition] = useState(null);
  const [moves, setMoves] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!wallet?.address) return;

      try {
        const entities = await queryEntities({
          keys: [wallet.address],
          models: ['Position', 'Moves'],
        });

        // Parse entity data
        if (entities.length > 0) {
          const entity = entities[0];
          setPosition(entity.models?.di?.Position);
          setMoves(entity.models?.di?.Moves);
        }
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      }
    };

    fetchPlayerData();
  }, [wallet?.address, queryEntities]);

  return (
    <View>
      <Text>Position: {position ? `(${position.x}, ${position.y})` : 'Unknown'}</Text>
      <Text>Moves Remaining: {moves?.remaining ?? 'Unknown'}</Text>
    </View>
  );
}
```

### Subscribe to Entity Updates

```tsx
import { useDojo } from '@/lib/hooks/useDojo';
import { useWallet } from '@/contexts/WalletContext';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function LivePlayerStatsScreen() {
  const { subscribeToEntities } = useDojo();
  const { wallet } = useWallet();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!wallet?.address) return;

    let subscription = null;

    const subscribe = async () => {
      subscription = await subscribeToEntities(
        {
          keys: [wallet.address],
          models: ['Position'],
        },
        ({ data, error }) => {
          if (error) {
            console.error('Subscription error:', error);
            return;
          }

          if (data && data.length > 0) {
            const entity = data[0];
            const newPosition = entity.models?.di?.Position;
            setPosition(newPosition);
            console.log('Position updated:', newPosition);
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
  }, [wallet?.address, subscribeToEntities]);

  return (
    <View>
      <Text>Live Position: {position ? `(${position.x}, ${position.y})` : 'Waiting...'}</Text>
    </View>
  );
}
```

## Troubleshooting

### "Connection Failed" Error

**Possible causes:**
1. Katana is not running
2. Torii is not running
3. World address is incorrect
4. Network URLs are wrong

**Solutions:**
- Check that Katana is running on `http://localhost:5050`
- Check that Torii is running on `http://localhost:8080`
- Verify the world address in your `.env` file
- Check console logs for detailed error messages

### "Transaction Failed" Error

**Possible causes:**
1. Wallet not connected
2. Invalid calldata
3. Contract address is wrong

**Solutions:**
- Ensure you're logged in with Cavos wallet
- Verify contract address from manifest
- Check that calldata matches contract expectations

### Subscriptions Not Updating

**Possible causes:**
1. Torii is not synced
2. Entity keys are wrong
3. Subscription was cancelled

**Solutions:**
- Restart Torii to ensure it's synced with Katana
- Verify entity keys match your query
- Check that subscription cleanup isn't running too early

## Next Steps

Once the basic integration is working, you can:

1. **Deploy Custom Contracts**: Add AsTrade-specific models and systems
2. **Create UI Components**: Build React Native components that interact with Dojo
3. **Implement Game Logic**: Add gameplay features using Dojo systems
4. **Deploy to Testnet**: Move from local Katana to Starknet Sepolia

## Additional Resources

- [Complete API Documentation](../COINS.md)
- [Dojo Book](https://book.dojoengine.org/)
- [Starknet Documentation](https://docs.starknet.io/)

