# 🔔 Sistema de Notificaciones Automáticas - AsTrade

## 📋 **Resumen**

El sistema de notificaciones automáticas de AsTrade está diseñado para proporcionar feedback inmediato al usuario sobre sus acciones y logros. Las notificaciones aparecen automáticamente sin interrumpir la experiencia del usuario.

---

## 🚀 **Tipos de Notificaciones**

### **1. Modal de Recompensas Diarias**
- **Cuándo aparece**: Al abrir la app si hay una recompensa disponible
- **Ubicación**: Centro de la pantalla
- **Duración**: Hasta que el usuario la cierre o reclame la recompensa
- **Trigger**: `dailyRewardsStatus?.can_claim === true`

### **2. Notificación de Recompensa Reclamada**
- **Cuándo aparece**: Después de reclamar una recompensa exitosamente
- **Ubicación**: Parte superior de la pantalla
- **Duración**: 3 segundos (auto-cerrar)
- **Trigger**: `onRewardClaimed` callback

### **3. Notificación de Logro Desbloqueado**
- **Cuándo aparece**: Cuando se desbloquea un nuevo logro
- **Ubicación**: Parte superior de la pantalla
- **Duración**: 4 segundos (auto-cerrar)
- **Trigger**: `achievement.unlocked === true`

---

## 🔧 **Configuración Automática**

### **Modal de Recompensas Automático**
```typescript
// En app/(tabs)/index.tsx
useEffect(() => {
  if (dailyRewardsStatus?.can_claim) {
    const timer = setTimeout(() => {
      setShowDailyRewards(true);
    }, 1000); // Delay de 1 segundo
    
    return () => clearTimeout(timer);
  }
}, [dailyRewardsStatus?.can_claim]);
```

### **Notificación de Logros**
```typescript
useEffect(() => {
  if (achievements.length > 0) {
    const newlyUnlocked = achievements.find(achievement => achievement.unlocked);
    if (newlyUnlocked) {
      setUnlockedAchievement({
        name: newlyUnlocked.name,
        description: newlyUnlocked.description
      });
      setShowAchievementNotification(true);
    }
  }
}, [achievements]);
```

---

## 🎨 **Diseño de Notificaciones**

### **Estilo Visual**
- **Posición**: Parte superior de la pantalla
- **Animación**: Slide-in desde arriba
- **Colores**: Gradientes temáticos por tipo
- **Iconos**: Específicos por tipo de recompensa/logro

### **Colores por Tipo**
- **Recompensas de Créditos**: Azul espacial (`#00D4FF`, `#0099CC`)
- **NFTs Misteriosos**: Púrpura (`#8B5CF6`, `#A855F7`)
- **NFTs Premium**: Dorado (`#FFD700`, `#FFA500`)
- **Logros**: Dorado (`#FFD700`, `#FFA500`)

---

## 🔄 **Flujo de Notificaciones**

### **1. Al Abrir la App**
```
App se abre → Registrar actividad → Cargar datos → Verificar recompensas
                                                    ↓
                                            Si hay recompensa disponible
                                                    ↓
                                            Mostrar modal automáticamente
```

### **2. Al Reclamar Recompensa**
```
Usuario reclama → Backend procesa → Modal se cierra → Notificación aparece
                                                    ↓
                                            Auto-cerrar en 3 segundos
```

### **3. Al Desbloquear Logro**
```
Logro se desbloquea → Detectar cambio → Mostrar notificación
                                    ↓
                            Auto-cerrar en 4 segundos
```

---

## 📱 **Componentes de Notificación**

### **AchievementNotification**
- **Archivo**: `components/AchievementNotification.tsx`
- **Props**:
  - `visible`: boolean
  - `achievement`: { name, description }
  - `onClose`: callback

### **RewardNotification**
- **Archivo**: `components/RewardNotification.tsx`
- **Props**:
  - `visible`: boolean
  - `reward`: { amount, type, description }
  - `onClose`: callback

### **DailyRewardsModal**
- **Archivo**: `components/DailyRewardsModal.tsx`
- **Props**:
  - `visible`: boolean
  - `onClose`: callback
  - `onRewardClaimed`: callback

---

## ⚙️ **Configuración de Tiempos**

### **Delays y Duración**
- **Modal de recompensas**: 1 segundo de delay al abrir
- **Notificación de recompensa**: 3 segundos de duración
- **Notificación de logro**: 4 segundos de duración
- **Animación de entrada**: 300ms
- **Animación de salida**: 300ms

### **Animaciones**
- **Entrada**: Spring animation con escala y slide
- **Salida**: Timing animation con fade out
- **NFTs**: Rotación continua durante la notificación

---

## 🎯 **Experiencia de Usuario**

### **Principios de UX**
1. **No intrusivo**: Las notificaciones no bloquean la interacción
2. **Informativo**: Proporcionan información clara y útil
3. **Celebrativo**: Hacen que el usuario se sienta recompensado
4. **Automático**: No requieren acción del usuario para aparecer
5. **Temporal**: Se auto-cierran para no saturar la interfaz

### **Estados Visuales**
- **Recompensa disponible**: Indicador con pulso en el header
- **Recompensa reclamada**: Notificación con animación de celebración
- **Logro desbloqueado**: Notificación dorada con trofeo
- **Error**: Manejo de errores sin notificaciones intrusivas

---

## 🔧 **Personalización**

### **Modificar Tiempos**
```typescript
// En los componentes de notificación
const timer = setTimeout(() => {
  handleClose();
}, 3000); // Cambiar duración aquí
```

### **Modificar Posición**
```typescript
// En los estilos
container: {
  position: 'absolute',
  top: 50, // Ajustar posición vertical
  left: 20,
  right: 20,
  zIndex: 1000
}
```

### **Modificar Colores**
```typescript
// En getRewardBackground()
if (reward.type === 'mystery_nft') {
  return ['#8B5CF6', '#A855F7']; // Cambiar colores aquí
}
```

---

## 🚀 **Próximas Mejoras**

### **Funcionalidades Sugeridas**
1. **Sonidos**: Efectos de sonido para notificaciones
2. **Vibración**: Feedback háptico en dispositivos móviles
3. **Notificaciones Push**: Para recordatorios de recompensas
4. **Historial**: Ver notificaciones anteriores
5. **Configuración**: Permitir al usuario personalizar notificaciones

### **Optimizaciones**
1. **Performance**: Optimizar animaciones
2. **Accesibilidad**: Mejorar soporte para lectores de pantalla
3. **Internacionalización**: Soporte para múltiples idiomas
4. **Testing**: Tests para diferentes escenarios

---

## 📝 **Notas de Desarrollo**

### **Dependencias**
- `react-native`: Para animaciones básicas
- `expo-linear-gradient`: Para efectos de gradiente
- `@expo/vector-icons`: Para iconos

### **Compatibilidad**
- ✅ iOS
- ✅ Android
- ✅ Web (con limitaciones de animaciones)

### **Performance**
- Animaciones optimizadas con `useNativeDriver`
- Cleanup automático de timers
- Memoización de componentes

---

## 🎉 **Conclusión**

El sistema de notificaciones automáticas proporciona una experiencia de usuario fluida y envolvente, manteniendo al usuario informado sobre sus progresos y recompensas sin ser intrusivo. Las notificaciones están diseñadas para ser celebrativas y motivadoras, fomentando el engagement continuo con la aplicación.

**¡El sistema está listo para usar y mejorar la experiencia del usuario! 🚀** 