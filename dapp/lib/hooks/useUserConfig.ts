import { useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../../contexts/AuthContext';

export const useUserConfig = () => {
  const { backendUserId } = useAuth();

  useEffect(() => {
    // Usar el backendUserId real del contexto de autenticación
    if (backendUserId) {
      apiClient.setUserId(backendUserId);
    } else {
      console.warn('⚠️ useUserConfig: No backendUserId available');
    }
    
    // Cleanup al desmontar
    return () => {
      apiClient.clearUserId();
    };
  }, [backendUserId]);

  return {
    userId: backendUserId,
    setUserId: apiClient.setUserId.bind(apiClient),
    clearUserId: apiClient.clearUserId.bind(apiClient)
  };
}; 