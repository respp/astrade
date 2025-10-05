# AsTrade Integration Guide - Dual System Architecture

## System Overview

AsTrade utiliza una **arquitectura dual** que combina dos sistemas complementarios:

1. **🔐 Cavos Wallet** - Para transacciones blockchain (StarkNet)
2. **🚀 FastAPI Backend** - Para trading en Extended Exchange

## Arquitectura Completa

```
Mobile App (React Native)
         ↓
    AuthContext (Coordinador)
    ↙             ↘
Cavos Wallet    FastAPI Backend
    ↓                ↓
StarkNet         Extended Exchange
(Blockchain)     (Trading)
```

## ¿Por qué Dos Sistemas?

### Cavos Wallet (StarkNet)
- **Propósito**: Transacciones blockchain, DeFi, swaps, NFTs
- **Tecnología**: StarkNet (Layer 2 de Ethereum)
- **Funciones**: `execute()`, `executeCalls()`, `swap()`
- **Autenticación**: Apple/Google OAuth → Cavos wallet

### FastAPI Backend (Trading)
- **Propósito**: Trading de perpetuos en Extended Exchange
- **Tecnología**: FastAPI + Extended Exchange API
- **Funciones**: Market orders, limit orders, positions, PnL
- **Claves privadas**: `extended_stark_private_key` (nunca sale del backend)

## Flujo de Creación de Usuario

### Paso a Paso

1. **Usuario abre app**
   ```
   App verifica storage → Si existe ambos IDs → Auto-login
   ```

2. **Usuario click "Continue with Apple/Google"**
   ```typescript
   // Se ejecuta createUser(provider)
   const result = await createUser('apple');
   ```

3. **Sistema crea ambas cuentas**
   ```typescript
   // Paso 1: Crear Cavos Wallet
   const demoWallet = new CavosWallet(
     `demo-apple-${Date.now()}`,    // address
     'mainnet',                     // network
     'demo-apple@astrade.app',      // email
     `cavos-${Date.now()}`,         // cavos user_id
     'astrade-org',                 // org_id
     'astrade-demo-secret'          // orgSecret
   );

   // Paso 2: Login en Cavos
   await walletLogin(demoWallet);

   // Paso 3: Crear usuario de trading
   const response = await accountService.createUser(); // POST /users/
   // Backend genera extended_stark_private_key

   // Paso 4: Guardar trading user_id
   await secureStorage.setItemAsync('astrade_user_id', response.user_id);
   ```

4. **Resultado Final**
   ```
   ✅ Cavos Wallet: Conectado a StarkNet
   ✅ Trading Account: Conectado a Extended Exchange
   ✅ Usuario: Listo para trading y blockchain
   ```

## Coordinated Authentication

### AuthContext como Coordinador

```typescript
interface AuthContextType {
  userId: string | null          // Trading user ID
  loading: boolean
  authenticated: boolean         // Solo true si AMBOS están conectados
  createUser: (provider?) => Promise<{}>
  signOut: () => Promise<void>   // Logout de AMBOS sistemas
  refreshUser: () => Promise<void>
}
```

### Estado de Autenticación

```typescript
// Ambos deben estar conectados para autenticación completa
authenticated: authenticated && walletAuthenticated
```

### Storage Management

```
SecureStore:
├── 'cavos_auth_data'     → Datos de Cavos Wallet
└── 'astrade_user_id'     → Trading user ID
```

## API Requests Coordination

### Blockchain Operations (Cavos)
```typescript
// Usar WalletContext
const { executeTransaction, swapTokens } = useWallet();

// Ejecutar swap en StarkNet
const result = await swapTokens(100, 'ETH', 'USDC');
```

### Trading Operations (FastAPI)
```typescript
// Usar servicios API (incluyen user_id automáticamente)
const order = await ordersService.marketBuy('BTCUSD', 0.001);
const positions = await accountService.getPositions();
```

## User Interface Integration

### Profile Screen
Muestra información de ambos sistemas:

```typescript
// Status de Cavos Wallet
{walletAuthenticated ? 'Connected' : 'Disconnected'}
Address: {formatAddress(walletInfo.address)}

// Status de Trading Account  
{authenticated ? 'Connected' : 'Disconnected'}
ID: {formatUserId(userId)}
```

### Login Screen
Un solo flujo que crea ambos:

```typescript
// Apple/Google buttons → createUser(provider) → Both systems
"🍎 Continue with Apple" → Creates Cavos + Trading accounts
"🔍 Continue with Google" → Creates Cavos + Trading accounts
```

## Logout Coordination

```typescript
const signOut = async () => {
  // Paso 1: Logout de Cavos Wallet
  await walletLogout();
  
  // Paso 2: Clear trading user ID
  await secureStorage.deleteItemAsync('astrade_user_id');
  
  // Paso 3: Clear API client
  accountService.setUserId('');
  
  // Paso 4: Update state
  setAuthenticated(false);
};
```

## Mission System Integration

Las misiones pueden usar AMBOS sistemas:

```typescript
// Misión blockchain: "Swap 100 USDC to ETH"
await swapTokens(100, 'USDC', 'ETH'); // Usa Cavos

// Misión trading: "Execute 5 market orders"  
await marketBuy('BTCUSD', 0.001); // Usa FastAPI backend
```

## Testing the Integration

### 1. Mock Mode (Current)
```typescript
// Cavos: Mock StarkNet transactions
// FastAPI: Mock Extended Exchange API
```

### 2. Real Integration
```typescript
// Update API_BASE_URL in lib/api/client.ts
const API_BASE_URL = 'https://your-backend.com/api/v1/';

// Cavos automatically connects to real StarkNet
```

## Benefits of Dual System

1. **🔗 Blockchain Freedom**: DeFi, swaps, NFTs via Cavos
2. **📈 Professional Trading**: Perpetuals, leverage via Extended Exchange  
3. **🎮 Gamification**: Missions spanning both ecosystems
4. **🔒 Security**: Private keys managed appropriately
5. **🚀 Scalability**: Best tools for each use case

## Error Handling

```typescript
// Si Cavos falla pero trading funciona → Parcial
// Si trading falla pero Cavos funciona → Parcial  
// Si ambos fallan → Login screen
// Si ambos funcionan → Main app
```

## Development Notes

- **Cavos Wallet**: Mock implementation, ready for real integration
- **FastAPI Backend**: Needs implementation of `/users/` endpoint
- **Extended Exchange**: Requires actual API keys and configuration
- **StarkNet**: Will use real network when Cavos is configured

## Future Enhancements

- [ ] Real Cavos Wallet integration
- [ ] Cross-system transaction coordination
- [ ] Unified balance display (StarkNet + Extended Exchange)
- [ ] Cross-chain arbitrage opportunities
- [ ] Unified mission rewards system 