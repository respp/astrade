/**
 * useDojo Hook
 * 
 * Provides convenient access to Dojo functionality from React components.
 * Re-exports the useDojo hook from DojoContext for easier imports.
 */

import { useContext } from 'react';
import { DojoContextType } from '@/lib/dojo/types';

// Import DojoContext - we'll export this from a barrel export
// For now, this is a re-export pattern
export { useDojo } from '@/contexts/DojoContext';

/**
 * Hook to check if Dojo is ready for use
 */
export const useDojoReady = (): boolean => {
  try {
    const { isConnected, toriiClient } = require('@/contexts/DojoContext').useDojo();
    return isConnected && toriiClient !== null;
  } catch {
    return false;
  }
};

/**
 * Hook to get Dojo connection status with safe fallback
 */
export const useDojoStatus = (): {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
} => {
  try {
    const { isConnected, isLoading, error } = require('@/contexts/DojoContext').useDojo();
    return {
      isConnected,
      isLoading,
      error: error || null,
    };
  } catch {
    return {
      isConnected: false,
      isLoading: false,
      error: 'Dojo not initialized',
    };
  }
};

