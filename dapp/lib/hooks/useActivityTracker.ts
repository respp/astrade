import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { RewardsService } from '../api/services/rewards';

export const useActivityTracker = () => {
  const appState = useRef(AppState.currentState);
  const lastActivityDate = useRef<string | null>(null);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Solo registrar actividad cuando la app se vuelve activa
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const today = new Date().toISOString().split('T')[0];
        
        // Evitar registrar actividad múltiples veces en el mismo día
        if (lastActivityDate.current !== today) {
          try {
            await RewardsService.recordActivity();
            lastActivityDate.current = today;
          } catch (error) {
            console.error('Error al registrar actividad:', error);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // NO registrar actividad automáticamente - solo cuando la app se vuelve activa
}; 