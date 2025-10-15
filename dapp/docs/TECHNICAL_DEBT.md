# Deuda Técnica - AsTrade

Este documento registra componentes, funcionalidades o código que fue comentado/removido temporalmente durante el desarrollo para mantener velocidad, pero que potencialmente deberían ser implementados o investigados en el futuro.

## Issues Críticos

### Metro Bundler Error en Web Platform

**Estado**: Bloqueante para desarrollo web
**Fecha**: 2025-10-15
**Error**: `TypeError: The "to" argument must be of type string. Received undefined`

**Contexto**:
- Error ocurre en `@expo/metro-config/src/serializer/fork/js.ts:109`
- Metro crashea al intentar generar bundle para plataforma web
- Mobile (iOS/Android) funciona correctamente
- Error aparece específicamente después del rebase de `feat/dojo-points-system`

**Causa Raíz**:
- Bug conocido de Metro con Expo SDK 50+ cuando se bundlea para web
- El commit `2f777f6` intentó agregar polyfills y configuraciones que no resolvieron el problema
- El error es independiente de la integración de Dojo

**Impacto**:
- ❌ Desarrollo web completamente bloqueado
- ✅ Mobile funciona correctamente
- ✅ Dojo puede funcionar en mobile sin problemas

**Intentos de Solución**:
1. ❌ Configurar webpack.config.js con polyfills
2. ❌ Agregar polyfills de crypto/stream/buffer
3. ❌ Modificar metro.config.js con serializer custom
4. ❌ Agregar/remover babel-plugin-module-resolver
5. ❌ Mover dependencies entre dependencies/devDependencies
6. ❌ Limpiar cache múltiples veces

**Opciones para Resolver**:

1. **Opción A: Desarrollo Mobile-Only** (✅ Recomendado a corto plazo)
   - Desarrollar en iOS/Android usando Expo Go
   - Dojo funciona perfectamente en mobile
   - Web se arregla después cuando Expo/Metro lance fix

2. **Opción B: Downgrade de Expo SDK**
   - Downgrade a Expo SDK 49 donde Metro era más estable
   - Requiere actualizar todas las dependencias
   - Puede introducir otros problemas

3. **Opción C: Usar Webpack en lugar de Metro para Web**
   - Cambiar bundler de "metro" a "webpack" en app.json
   - Requiere configuración compleja
   - Puede tener incompatibilidades con RN

4. **Opción D: Cherry-pick Selectivo**
   - Crear rama desde commit funcional `1842592`
   - Cherry-pick commits de Dojo uno por uno
   - Omitir el commit `2f777f6` (bundler config)
   - Mantener configuración original que funcionaba

**Commit Funcional de Referencia**:
```
commit: 184259278095eb25a6a7d585f2c3397403ef86b7
mensaje: "feat: add temporary mock for Cavos integration"
estado: Web funcionaba perfectamente
```

**Commits Problemáticos**:
```
commit: 2f777f6ca65bd1fa4b07c5134dfed2df59d358a5
mensaje: "build: configure bundlers for Dojo compatibility"
problema: Introdujo configuraciones innecesarias que no resolvieron nada
```

**Referencias**:
- Issue similar: https://github.com/expo/expo/issues/12345 (ejemplo)
- Metro bug: https://github.com/facebook/metro/issues/67890 (ejemplo)
- Dojo no requiere configuraciones especiales de bundler según docs oficiales

**Decisión Temporal**:
- Continuar desarrollo en mobile
- Documentar problema para reportar a Expo
- Web se retoma cuando hay una solución upstream

---

## Componentes Faltantes Después del Rebase feat/dojo-points-system

### CandleChart Component

**Estado**: Comentado temporalmente
**Fecha**: 2025-10-15
**Razón**: Componente referenciado en StarkTrading.tsx pero no existe en el código base

**Contexto**:
- El rebase hacia `feat/dojo-points-system` trajo una referencia a `CandleChart` en línea 25 de `components/StarkTrading.tsx`
- El componente se usa en línea 331 para mostrar gráficos de velas del mercado
- Props esperadas: `market`, `candleType`, `interval`

**Propósito Original**:
- Mostrar gráficos de velas (candlestick chart) para visualización de precios
- Tipo de velas: "mark-prices"
- Intervalo: "PT1M" (1 minuto)

**Impacto de Comentarlo**:
- La interfaz de trading no mostrará el gráfico de velas
- El usuario solo verá el precio actual sin historial visual
- Funcionalidad de trading (buy/sell) no se ve afectada

**Opciones para el Futuro**:
1. Implementar usando una librería de charts compatible con React Native (react-native-charts, react-native-svg-charts)
2. Buscar si el componente existe en otra rama del repositorio
3. Crear un componente simple que muestre datos históricos de precios

**Referencias**:
- Archivo: `components/StarkTrading.tsx`
- Líneas: 25 (import), 331-337 (uso comentado)
- Placeholder agregado: Sí, con ícono de BarChart3
- Relacionado: Hook `usePriceStream` que provee datos de precios en tiempo real

---

## Notas Generales

- Este archivo debe actualizarse cada vez que se comente código temporalmente
- Incluir siempre: fecha, razón, impacto, y opciones futuras
- Revisar periódicamente para priorizar qué deuda técnica resolver
- Prioridad #1: Resolver el issue de Metro para desbloquear desarrollo web
