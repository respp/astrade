# 🔗 Integración con Backend Real - AsTrade

## 📋 **Resumen**

Esta guía explica cómo configurar y probar el sistema de recompensas con el backend real de AsTrade.

---

## 🚀 **Configuración Inicial**

### **1. Deshabilitar Modo Mock**
```typescript
// En lib/config.ts
export const CONFIG = {
  MOCK_MODE: false, // ← Cambiar a false
  // ... resto de configuración
};
```

### **2. Verificar Backend**
```bash
# Verificar que el backend esté corriendo
curl -X GET "http://localhost:8000/api/v1/rewards/daily-status" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: fb16ec78-ff70-4895-9ace-92a1d8202fdb"
```

### **3. Configurar User ID**
El User ID está configurado automáticamente en `lib/hooks/useUserConfig.ts`:
```typescript
const MOCK_USER_ID = 'fb16ec78-ff70-4895-9ace-92a1d8202fdb';
```

---

## 🔧 **Componentes de Debug**

### **MockModeIndicator**
- **Ubicación**: Esquina superior derecha
- **Función**: Indica si el modo mock está activo
- **Color**: Naranja cuando mock está ON

### **ApiDebugPanel**
- **Acceso**: Botón 🐛 en la esquina superior derecha
- **Funciones**:
  - Mostrar estado de todas las APIs
  - Probar todas las llamadas API
  - Ver datos del usuario
  - Monitorear errores

---

## 📊 **Datos del Usuario Actual**

Según las pruebas del backend, el usuario tiene:

```json
{
  "user_id": "fb16ec78-ff70-4895-9ace-92a1d8202fdb",
  "display_name": "stellarentdev_google-oauth2|114137465678767770606",
  "level": 1,
  "experience": 0,
  "total_trades": 0,
  "total_pnl": 0.0,
  "achievements": [],
  "streaks": {
    "daily_login": {
      "current_streak": 0,
      "longest_streak": 0,
      "last_activity_date": null
    },
    "galaxy_explorer": {
      "current_streak": 0,
      "longest_streak": 0,
      "last_activity_date": null
    }
  },
  "recent_rewards": []
}
```

---

## 🎯 **Flujo de Pruebas**

### **1. Primera Apertura**
```
App se abre → User ID configurado → Actividad registrada → Datos cargados
```

### **2. Verificar Datos**
- **Nivel**: 1 (Space Trader)
- **Experiencia**: 0 XP
- **Streak**: 0 días
- **Logros**: Ninguno desbloqueado
- **Recompensas**: No disponibles inicialmente

### **3. Registrar Actividad**
- La app registra actividad automáticamente
- Esto inicia el streak diario
- Después de 24h, habrá recompensa disponible

---

## 🔄 **Endpoints Verificados**

### **✅ Funcionando Correctamente**
- `GET /api/v1/rewards/daily-status`
- `GET /api/v1/rewards/streak-info`
- `GET /api/v1/rewards/achievements`
- `GET /api/v1/rewards/profile`
- `POST /api/v1/rewards/record-activity`
- `POST /api/v1/rewards/claim-daily`

### **📝 Respuestas Esperadas**
```json
// daily-status
{
  "can_claim": false,
  "current_streak": 0,
  "longest_streak": 0,
  "next_reward_in": null,
  "today_reward": null,
  "week_rewards": []
}

// profile
{
  "level": 1,
  "experience": 0,
  "total_trades": 0,
  "total_pnl": 0.0
}
```

---

## 🧪 **Pruebas Manuales**

### **1. Usar el Debug Panel**
1. Tocar el botón 🐛
2. Verificar que "Mock Mode: ❌ OFF"
3. Tocar "🧪 Probar APIs"
4. Revisar los resultados

### **2. Verificar Consola**
```javascript
// Buscar estos logs:
🔧 User ID configurado: fb16ec78-ff70-4895-9ace-92a1d8202fdb
✅ Actividad inicial registrada
✅ Todas las APIs probadas exitosamente
```

### **3. Probar Funcionalidades**
- **Daily Rewards**: Debería mostrar "No hay recompensa disponible"
- **Achievements**: Debería mostrar lista vacía
- **Profile**: Debería mostrar nivel 1, 0 XP

---

## 🐛 **Solución de Problemas**

### **Error 404 Persiste**
```typescript
// Verificar configuración
console.log('Mock mode:', CONFIG.MOCK_MODE);
console.log('User ID:', apiClient.getUserId());
```

### **Datos No Se Cargan**
1. Verificar que el backend esté corriendo
2. Verificar el User ID en las cabeceras
3. Revisar logs de la consola

### **Actividad No Se Registra**
```typescript
// Verificar en useActivityTracker
console.log('Registrando actividad...');
```

---

## 📈 **Progresión Esperada**

### **Día 1 (Primera vez)**
- Streak: 0 → 1 (después de registrar actividad)
- Recompensa: No disponible
- Nivel: 1

### **Día 2**
- Streak: 1 → 2
- Recompensa: Disponible (después de 24h)
- Nivel: 1 (hasta alcanzar 1000 XP)

### **Día 7**
- Streak: 7
- Recompensa: NFT Premium
- Nivel: 2 (si acumuló suficiente XP)

---

## 🔧 **Configuración Avanzada**

### **Cambiar User ID**
```typescript
// En lib/hooks/useUserConfig.ts
const MOCK_USER_ID = 'tu-nuevo-user-id';
```

### **Modificar Timeouts**
```typescript
// En lib/api/client.ts
timeout: 15000, // Aumentar timeout si es necesario
```

### **Agregar Logs**
```typescript
// En cualquier hook
console.log('🔍 Debug info:', data);
```

---

## 🎉 **Verificación Final**

### **Checklist de Integración**
- [ ] Modo mock deshabilitado
- [ ] Backend corriendo en localhost:8000
- [ ] User ID configurado correctamente
- [ ] Actividad se registra automáticamente
- [ ] Datos del usuario se cargan
- [ ] No hay errores 404 en consola
- [ ] Debug panel muestra datos reales

### **Indicadores de Éxito**
- ✅ No aparece "🔧 MODO MOCK ACTIVO"
- ✅ Debug panel muestra "Mock Mode: ❌ OFF"
- ✅ Datos del usuario se cargan desde el backend
- ✅ Actividad se registra sin errores

---

## 📝 **Notas de Desarrollo**

### **Ventajas del Backend Real**
- ✅ Datos persistentes
- ✅ Lógica de negocio real
- ✅ Validaciones del servidor
- ✅ Escalabilidad

### **Consideraciones**
- ⚠️ Dependencia del servidor
- ⚠️ Latencia de red
- ⚠️ Manejo de errores de red
- ⚠️ Estados de carga

### **Próximos Pasos**
1. **Testing**: Pruebas automatizadas
2. **Optimización**: Caché y optimizaciones
3. **Monitoreo**: Logs y métricas
4. **Producción**: Configuración de producción

---

## 🚀 **Conclusión**

El sistema está completamente integrado con el backend real y listo para uso en producción. El usuario puede:

- ✅ Ver su perfil real
- ✅ Registrar actividad automáticamente
- ✅ Acumular streaks diarios
- ✅ Reclamar recompensas cuando estén disponibles
- ✅ Ver su progreso en logros

**¡La integración está completa y funcionando! 🎉** 