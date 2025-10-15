# Objetivo general

Integrar la lógica del cliente de Dojo (`@client/`) en la carpeta React Native de mi aplicación **AstraDe** (`@dapp/`).  
El objetivo de esta tarea es establecer la **conexión inicial entre AstraDe y Dojo**, permitiendo la comunicación básica con el mundo Dojo (sistemas, entidades y componentes).  
Más adelante se desarrollarán sistemas adicionales en Dojo, como la generación de monedas onchain (coins), pero **eso NO forma parte de este paso**.

---

# Alcance de esta tarea

- Usar la lógica existente en `@client/` del repositorio base de **Dojo Intro** como **referencia técnica** para entender cómo interactúa con Torii, Starknet y los sistemas Dojo.  
- Integrar **solo la parte funcional necesaria** para que AstraDe (en React Native) pueda:
  - Conectarse al mundo Dojo.
  - Realizar queries básicas a entidades.
  - Ejecutar llamadas a sistemas (system calls) ya definidos.

---

# Reglas y lineamientos

1. **No copiar toda la carpeta `@client/`**.  
   Solo integrar los archivos o funciones necesarias (por ejemplo `createClientComponents.ts`, `createSystemCalls.ts`, hooks o providers relevantes).  

2. **El entorno de destino es React Native (`@dapp/`)**, no Vite o web.  
   Adaptar cualquier código que dependa del navegador (browser APIs, fetch con CORS, etc.) para que funcione en un entorno móvil.

3. **El archivo `@COINS.md` contiene un EJEMPLO de referencia**, pero **no debe ser seguido de forma literal**.  
   Puede servir como ayuda para entender la estructura esperada, pero tené criterio: el código final debe ser funcional y coherente con la arquitectura actual de AstraDe.

4. Si el código de `@client/` depende de rutas, configuraciones o inicializaciones propias del entorno web, reemplazalas por equivalentes compatibles con React Native y Starknet SDK móvil.

---

# Objetivo técnico final del PR / implementación

- Crear un módulo o provider (`DojoProvider.tsx`) dentro de `@dapp/` que:
  - Inicialice la conexión con Dojo (RPC + Torii + worldAddress).
  - Exponga `systemCalls` y `components` accesibles para el resto de la app.
- Permitir que, desde un componente RN (por ejemplo una pantalla de “Recompensas”), se pueda:
  - Leer un componente onchain (como `CoinBalance`).
  - Ejecutar una llamada simple a un sistema (por ejemplo `mint_coins` en el futuro).

---

# Contexto adicional

- El repositorio base a usar como referencia es **https://github.com/dojoengine/dojo-intro**.  
- AstraDe ya tiene estructura en monorepo, con `@client/`, `@contracts/` y `@dapp/`.  
- Esta integración debe mantener esa arquitectura y respetar las convenciones del proyecto.  
- El backend de Dojo puede estar corriendo localmente (Katana + Torii), y luego se usará una testnet (Sepolia).

---

# Resultado esperado

- Código modular, ubicado dentro de `@dapp/`, capaz de conectarse a Dojo.  
- Sin romper compatibilidad con la app móvil existente.  
- Documentación mínima en el archivo `@COINS.md` sobre cómo inicializar y usar la conexión Dojo desde RN (no copiar texto de ejemplo; solo explicar brevemente el flujo real implementado).

---

# Nota final

> Este prompt define el **primer paso** en la integración Dojo ↔ AstraDe.  
> Asegurate de que el resultado sea estable y extensible, ya que sobre esta base se construirá la capa de interacción onchain (mint y gestión de coins).
