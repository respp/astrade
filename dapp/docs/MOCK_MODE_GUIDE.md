# 🔧 Modo Mock - Guía de Desarrollo

## 📋 **Resumen**

El modo mock permite desarrollar y probar el sistema de recompensas sin necesidad de tener el backend corriendo. Todos los endpoints de recompensas están simulados con datos realistas.

---

## 🚀 **Cómo Habilitar/Deshabilitar**

### **Habilitar Modo Mock**
```typescript
// En lib/config.ts
export const CONFIG = {
  MOCK_MODE: true, // ← Cambiar a true
  // ... resto de configuración
};
```

### **Deshabilitar Modo Mock**
```typescript
// En lib/config.ts
export const CONFIG = {
  MOCK_MODE: false, // ← Cambiar a false
  // ... resto de configuración
};
```

---

## 📊 **Datos Mock Disponibles**

### **Estado de Recompensas Diarias**
```json
{
  "can_claim": true,
  "current_streak": 2,
  "longest_streak": 5,
  "next_reward_in": "19h 37m",
  "today_reward": {
    "day": 3,
    "amount": 100,
    "type": "mystery_nft",
    "description": "Día 3 - NFT Misterioso"
  },
  "week_rewards": [
    // 7 días de recompensas
  ]
}
```

### **Perfil de Usuario**
```json
{
  "user_id": "mock-user-123",
  "display_name": "Space Trader",
  "level": 2,
  "experience": 1250,
  "total_trades": 45,
  "total_pnl": 1250.50,
  "achievements": [
    {
      "id": "trade_master",
      "name": "Maestro del Trading",
      "unlocked": true,
      "progress": 100
    }
  ]
}
```

### **Logros**
```json
{
  "achievements": [
    {
      "id": "week_warrior",
      "name": "Guerrero Semanal",
      "description": "Completa 7 días consecutivos de login",
      "unlocked": false,
      "progress": 42
    },
    {
      "id": "galaxy_master",
      "name": "Maestro de la Galaxia",
      "description": "Explora la galaxia por 30 días consecutivos",
      "unlocked": false,
      "progress": 50
    },
    {
      "id": "trade_master",
      "name": "Maestro del Trading",
      "description": "Realiza 100 trades exitosos",
      "unlocked": true,
      "progress": 100
    }
  ]
}
```

---

## 🔄 **Endpoints Mock Implementados**

### **GET /rewards/daily-status**
- ✅ Estado completo de recompensas diarias
- ✅ Streak actual y más largo
- ✅ Recompensa del día actual
- ✅ Grid de 7 días

### **POST /rewards/claim-daily**
- ✅ Reclamar recompensa diaria
- ✅ Respuesta con datos de recompensa
- ✅ Actualización de streak

### **POST /rewards/record-activity**
- ✅ Registrar actividad de exploración
- ✅ Respuesta de éxito

### **GET /rewards/achievements**
- ✅ Lista de logros del usuario
- ✅ Progreso de cada logro
- ✅ Estadísticas de streaks

### **GET /rewards/profile**
- ✅ Perfil completo del usuario
- ✅ Estadísticas de trading
- ✅ Historial de recompensas

### **GET /rewards/streak-info**
- ✅ Información detallada de streaks
- ✅ Estado de reclamación

---

## 🎯 **Características del Modo Mock**

### **Indicador Visual**
- **Componente**: `MockModeIndicator`
- **Ubicación**: Esquina superior derecha
- **Color**: Naranja con texto blanco
- **Texto**: "🔧 MODO MOCK ACTIVO"

### **Simulación de Red**
- **Delay**: 1 segundo para simular latencia
- **Errores**: 0% de tasa de error
- **Respuestas**: Consistentes y predecibles

### **Datos Realistas**
- **Streaks**: Valores realistas (2-15 días)
- **Niveles**: Progresión natural (1-10)
- **Experiencia**: Valores acumulativos
- **Logros**: Mezcla de desbloqueados y bloqueados

---

## 🔧 **Personalización de Datos Mock**

### **Modificar Recompensas**
```typescript
// En lib/api/client.ts, función getMockResponse
if (endpoint.includes('/rewards/daily-status')) {
  return {
    success: true,
    data: {
      can_claim: true, // ← Cambiar para probar diferentes estados
      current_streak: 2, // ← Modificar streak
      // ... resto de datos
    }
  };
}
```

### **Modificar Perfil de Usuario**
```typescript
if (endpoint.includes('/rewards/profile')) {
  return {
    success: true,
    data: {
      level: 5, // ← Cambiar nivel
      experience: 5000, // ← Modificar experiencia
      total_trades: 100, // ← Cambiar número de trades
      // ... resto de datos
    }
  };
}
```

### **Modificar Logros**
```typescript
if (endpoint.includes('/rewards/achievements')) {
  return {
    success: true,
    data: {
      achievements: [
        {
          id: "custom_achievement",
          name: "Logro Personalizado",
          description: "Descripción personalizada",
          unlocked: true, // ← Cambiar estado
          progress: 75 // ← Modificar progreso
        }
        // ... más logros
      ]
    }
  };
}
```

---

## 🚀 **Flujo de Desarrollo con Mock**

### **1. Desarrollo Frontend**
```bash
# Con modo mock activado
npm start
# o
expo start
```

### **2. Probar Funcionalidades**
- ✅ Abrir app → Modal de recompensas aparece automáticamente
- ✅ Tocar "Daily Rewards" → Modal se abre sin errores
- ✅ Reclamar recompensa → Notificación aparece
- ✅ Ver logros → Lista completa de logros
- ✅ Ver perfil → Datos del usuario

### **3. Cambiar a Backend Real**
```typescript
// En lib/config.ts
MOCK_MODE: false
```

---

## 🐛 **Solución de Problemas**

### **Error 404 Persiste**
```typescript
// Verificar que MOCK_MODE esté en true
console.log('Mock mode:', CONFIG.MOCK_MODE);
```

### **Datos No Se Actualizan**
```typescript
// Limpiar caché y reiniciar
// En el cliente API, verificar que getMockResponse se llame
console.log('Mock response for:', endpoint);
```

### **Animaciones No Funcionan**
```typescript
// Verificar que useNativeDriver esté configurado correctamente
// En web, algunas animaciones pueden no funcionar
```

---

## 📝 **Notas de Desarrollo**

### **Ventajas del Modo Mock**
- ✅ Desarrollo independiente del backend
- ✅ Datos consistentes y predecibles
- ✅ Pruebas rápidas de UI/UX
- ✅ Sin dependencias externas

### **Limitaciones**
- ❌ No refleja cambios reales en el backend
- ❌ No prueba integración real
- ❌ Datos estáticos (no persisten)

### **Transición a Producción**
1. **Deshabilitar mock**: `MOCK_MODE: false`
2. **Verificar endpoints**: Asegurar que el backend esté corriendo
3. **Probar integración**: Verificar que los datos reales funcionen
4. **Optimizar**: Ajustar timeouts y manejo de errores

---

## 🎉 **Conclusión**

El modo mock proporciona una experiencia de desarrollo fluida y permite probar todas las funcionalidades del sistema de recompensas sin necesidad del backend. Es especialmente útil para:

- **Desarrollo rápido** de nuevas características
- **Pruebas de UI/UX** con datos consistentes
- **Demostraciones** del sistema
- **Desarrollo offline** sin dependencias

**¡El modo mock está listo para usar! 🚀** 