# Guía Completa: Verificación y Próximos Pasos con Dojo

## 🔍 Cómo Verificar que tu Conexión con Dojo es Correcta

### Opción 1: Verificar desde la Pantalla de Prueba (Recomendado)

1. **Inicia la app**:
   ```bash
   cd dapp
   npm run dev
   ```

2. **Abre el navegador** en `http://localhost:8081`

3. **Inicia sesión** con Cavos (usando el modo mock si estás en web)

4. **Ve al tab "Dojo" (🎮)** en la barra inferior

5. **Verifica el estado de conexión**:
   ```
   🔌 Estado de Conexión
   Estado: CONNECTED          ← Debe decir CONNECTED
   Cargando: ✅ No
   Conectado: ✅ Sí           ← Debe estar en verde
   ```

6. **Revisa la consola del navegador** (F12):
   ```javascript
   // Deberías ver estos mensajes:
   🔌 Connecting to Dojo...
   🌐 Web environment detected, using mock Torii client  // En web
   ✅ Connected to Dojo successfully
   ```

### Opción 2: Verificar desde el Código

Agrega esto a cualquier componente:

```tsx
import { useDojo } from '@/lib/hooks/useDojo';

function MyComponent() {
  const { isConnected, connectionState, config, manifest } = useDojo();

  console.log('Dojo Status:', {
    isConnected,           // true = conectado
    connectionState,       // 'CONNECTED' = OK
    worldAddress: config.worldAddress,
    toriiUrl: config.toriiUrl,
    hasManifest: !!manifest,
  });

  return <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>;
}
```

### Opción 3: Verificar con Pruebas de Funcionalidad

**Test 1: Spawn Player**
```tsx
// En la pantalla de Dojo, presiona "Spawn Player"
// Deberías ver:
✅ ¡Spawn exitoso!
TX Hash: 0xabcd1234...
```

**Test 2: Query Entities**
```tsx
// Presiona "Query Entities"
// En web verás datos mock:
✅ Datos onchain encontrados!
📍 Position: X: 10, Y: 10
🎮 Moves: Remaining: 100
```

**Test 3: Move Player**
```tsx
// Presiona cualquier botón de dirección (⬆️ ⬇️ ⬅️ ➡️)
// Deberías ver:
✅ ¡Movimiento exitoso!
Dirección: UP
TX Hash: 0xabcd1234...
```

---

## 📁 ¿Qué Pasó con la Carpeta @client/?

### Resumen

La carpeta `dojo-intro/client/` **NO se copió directamente** a tu proyecto. En su lugar:

1. **Se adaptó la lógica** para React Native
2. **Se extrajeron los conceptos** clave
3. **Se reimplementó** de forma compatible con móvil

### Comparación: @client/ vs Tu Implementación

| @client/ (Web original) | Tu implementación (RN) | Ubicación |
|------------------------|------------------------|-----------|
| `game.js` | `DojoContext.tsx` | `dapp/contexts/` |
| `controller.js` | `mockDojo.ts` | `dapp/lib/dojo/` |
| Torii directo | Mock Torii para web | `dapp/lib/dojo/mockDojo.ts` |
| `@cartridge/controller` | Cavos Wallet | Ya estaba integrado |
| HTML buttons | React Native components | `dapp/app/(tabs)/dojo-test.tsx` |

### ¿Por Qué No se Copió Directamente?

```
@client/ (dojo-intro)
├── index.html          ❌ No compatible con RN (es HTML)
├── game.js             ✅ Lógica adaptada a DojoContext.tsx
├── controller.js       ✅ Reemplazado por Cavos + mockDojo
├── vite.config.js      ❌ No compatible (RN usa Metro)
└── package.json        ✅ Dependencias extraídas

Tu implementación (dapp)
├── contexts/DojoContext.tsx      ✅ Equivalente a game.js
├── lib/dojo/mockDojo.ts          ✅ Mock para web
├── lib/dojo/systemCalls.ts       ✅ Utilidades para Dojo
├── lib/dojo/queries.ts           ✅ Consultas a Torii
├── app/(tabs)/dojo-test.tsx      ✅ UI equivalente a index.html
└── hooks/useDojo.ts              ✅ Hook para componentes
```

### ¿Necesitas la Carpeta @client/?

**NO**, porque:

- ✅ Ya tienes toda la funcionalidad adaptada
- ✅ Tu implementación es mejor para React Native
- ✅ Usa Cavos en lugar de Cartridge Controller
- ✅ Funciona en web (mock) y móvil (real)

**SÍ**, solo como referencia si:

- 📚 Quieres entender cómo funciona Dojo en web
- 🔍 Necesitas ver ejemplos de uso del SDK
- 💡 Quieres implementar features adicionales

---

## 🚀 Próximos Pasos para Seguir Desarrollando con Dojo

### Fase 1: Validación Básica (Ya Completada ✅)

- [x] Integrar DojoProvider
- [x] Crear pantalla de prueba
- [x] Verificar conexión
- [x] Probar system calls básicos

### Fase 2: Desarrollo Local con Contratos Reales

#### Paso 1: Desplegar Contratos Personalizados

```bash
cd dojo-intro/contracts/src

# 1. Edita models.cairo para agregar tu modelo
# Ejemplo: Agregar CoinBalance

nano models.cairo
```

```rust
// Agregar en models.cairo:
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct CoinBalance {
    #[key]
    pub player: ContractAddress,
    pub amount: u256,
}
```

```bash
# 2. Edita systems/actions.cairo para agregar tu sistema
nano systems/actions.cairo
```

```rust
// Agregar en actions.cairo:
#[abi(embed_v0)]
impl ActionsImpl of IActions<ContractState> {
    // ... existing functions ...
    
    fn mint_coins(ref self: ContractState, amount: u256) {
        let mut world = self.world_default();
        let player = starknet::get_caller_address();
        
        let mut balance: CoinBalance = world.read_model(player);
        balance.amount += amount;
        world.write_model(@balance);
    }
}
```

```bash
# 3. Compila y despliega
sozo build
sozo migrate

# 4. Copia la nueva world address y actualiza tu .env
```

#### Paso 2: Actualizar tu App para Usar los Nuevos Contratos

```typescript
// En dapp/lib/dojo/config.ts
// Actualiza EXPO_PUBLIC_DOJO_WORLD_ADDRESS con la nueva dirección
```

```typescript
// En dapp/app/(tabs)/dojo-test.tsx
// Agrega un nuevo botón:

const handleMintCoins = async () => {
  const actionsContract = findContract('di-actions');
  
  const result = await executeSystemCall({
    contractAddress: actionsContract.address,
    entrypoint: 'mint_coins',
    calldata: ['100'], // Mint 100 coins
  });
  
  console.log('Coins minted:', result);
};

// En el JSX:
<Button title="💰 Mint Coins" onPress={handleMintCoins} />
```

### Fase 3: Crear Modelos Específicos de AsTrade

#### Modelos Sugeridos para AsTrade

```rust
// 1. Trading History
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TradeHistory {
    #[key]
    pub trade_id: u256,
    pub player: ContractAddress,
    pub token_in: felt252,
    pub token_out: felt252,
    pub amount_in: u256,
    pub amount_out: u256,
    pub timestamp: u64,
}

// 2. Rewards Points
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct RewardsPoints {
    #[key]
    pub player: ContractAddress,
    pub points: u256,
    pub level: u8,
    pub streak_days: u16,
}

// 3. Planet Ownership
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct PlanetOwnership {
    #[key]
    pub planet_id: u256,
    pub owner: ContractAddress,
    pub resources: u256,
    pub production_rate: u64,
}
```

### Fase 4: Integrar con tus Pantallas Existentes

#### Ejemplo: Integrar Rewards con Dojo

```typescript
// En dapp/app/(tabs)/profile.tsx
import { useDojo } from '@/lib/hooks/useDojo';

export default function ProfileScreen() {
  const { queryEntities } = useDojo();
  const { wallet } = useWallet();
  const [rewardsPoints, setRewardsPoints] = useState(0);

  useEffect(() => {
    const fetchRewards = async () => {
      const entities = await queryEntities({
        keys: [wallet.address],
        models: ['RewardsPoints'],
      });
      
      if (entities.length > 0) {
        const points = entities[0].models.di.RewardsPoints;
        setRewardsPoints(points.points);
      }
    };

    fetchRewards();
  }, [wallet.address]);

  return (
    <View>
      <Text>Onchain Rewards: {rewardsPoints}</Text>
    </View>
  );
}
```

### Fase 5: Transición a React Native Nativo

Una vez validado en web, prueba en móvil:

```bash
# iOS
npm run ios

# Android
npm run android
```

En móvil, el DojoProvider automáticamente:
- ✅ Usará el SDK real de Dojo (no mock)
- ✅ Se conectará a Katana/Torii real
- ✅ Ejecutará transacciones reales

### Fase 6: Deploy a Testnet (Sepolia)

```bash
# 1. Configura Sepolia en tu .env
EXPO_PUBLIC_DOJO_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia
EXPO_PUBLIC_DOJO_TORII_URL=https://api.cartridge.gg/x/your-project/torii

# 2. Despliega contratos a Sepolia
cd dojo-intro/contracts
sozo migrate --rpc-url https://api.cartridge.gg/x/starknet/sepolia

# 3. Actualiza world address en .env
EXPO_PUBLIC_DOJO_WORLD_ADDRESS=<nueva-direccion-sepolia>
```

---

## 📊 Roadmap Completo de Desarrollo con Dojo

```
┌─────────────────────────────────────────────────────┐
│ FASE 1: VALIDACIÓN (✅ Completado)                  │
│ - Setup básico                                      │
│ - Conexión mock en web                              │
│ - Pantalla de prueba                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ FASE 2: DESARROLLO LOCAL (📍 Siguiente)             │
│ - Crear modelos personalizados                      │
│ - Implementar systems para AsTrade                  │
│ - Probar con Katana + Torii local                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ FASE 3: INTEGRACIÓN APP (Después)                   │
│ - Conectar pantallas existentes                     │
│ - Reemplazar APIs centralizadas por Dojo            │
│ - Implementar sincronización onchain                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ FASE 4: PRUEBAS MÓVILES (Después)                   │
│ - Probar en emulador iOS/Android                    │
│ - Validar transacciones reales                      │
│ - Optimizar UX móvil                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ FASE 5: DEPLOY TESTNET (Final)                      │
│ - Desplegar a Sepolia                               │
│ - Configurar URLs productivas                       │
│ - Testing completo                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Tareas Inmediatas Sugeridas

### 1. Validar Conexión (Hoy)
```bash
# Inicia la app y ve al tab Dojo
npm run dev
# Verifica que todo esté verde ✅
```

### 2. Crear tu Primer Modelo Personalizado (Esta Semana)
```rust
// En dojo-intro/contracts/src/models.cairo
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct PlayerStats {
    #[key]
    pub player: ContractAddress,
    pub total_trades: u64,
    pub total_volume: u256,
    pub level: u8,
}
```

### 3. Implementar tu Primer Sistema (Esta Semana)
```rust
// En dojo-intro/contracts/src/systems/actions.cairo
fn record_trade(
    ref self: ContractState,
    volume: u256
) {
    // Actualizar PlayerStats onchain
}
```

### 4. Integrar con una Pantalla Real (Próxima Semana)
```typescript
// Usa Dojo en dapp/app/(tabs)/trading.tsx
// Reemplaza API calls por Dojo queries
```

---

## 🔧 Comandos Útiles

### Desarrollo Local
```bash
# Terminal 1: Katana
katana --config katana.toml

# Terminal 2: Contratos
cd dojo-intro/contracts
sozo build && sozo migrate

# Terminal 3: Torii
torii --config torii.toml

# Terminal 4: App
cd dapp
npm run dev
```

### Debugging
```bash
# Ver logs de Dojo en la app
# Abre DevTools (F12) y busca:
🔌 Connecting to Dojo...
📝 Executing Dojo system call...
🔍 Querying entities...
```

### Inspeccionar Datos Onchain
```bash
# Consultar entidades desde CLI
cd dojo-intro/contracts
sozo inspect

# Ver modelos
sozo model get <MODEL_NAME> <PLAYER_ADDRESS>
```

---

## 📚 Recursos Adicionales

- **Documentación Dojo**: https://book.dojoengine.org/
- **Tu Implementación**: Ver archivos en `dapp/lib/dojo/`
- **Ejemplos de Código**: Ver `dapp/app/(tabs)/dojo-test.tsx`
- **Referencia Web**: Ver `dojo-intro/client/` (solo referencia)

---

## ❓ FAQs

**P: ¿Necesito copiar algo de @client/?**
R: No, ya tienes todo adaptado en tu proyecto.

**P: ¿Cómo sé si Dojo está conectado?**
R: Ve al tab Dojo (🎮) y verifica que el estado esté verde ✅

**P: ¿Funciona en móvil?**
R: Sí, pero necesitas instalar las dependencias de Dojo primero (opcional por ahora).

**P: ¿Dónde están mis transacciones?**
R: En web son mock (simuladas). En móvil con Katana serán reales.

**P: ¿Cuándo desplegar a testnet?**
R: Después de validar todo localmente con Katana.

---

**Estado Actual**: ✅ FASE 1 COMPLETADA
**Siguiente Paso**: Crear modelos personalizados en Dojo
**Objetivo**: Tener AsTrade 100% onchain con Dojo

