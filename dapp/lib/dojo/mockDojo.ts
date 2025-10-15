/**
 * Mock Dojo Implementation for Web Compatibility
 * 
 * This provides a mock implementation of Dojo functionality
 * that works in web environments without WASM dependencies.
 */

import { DojoConfig, DojoManifest, Entity, SystemCall, TransactionResult } from './types';

// Mock Torii client for web compatibility
export class MockToriiClient {
  async onEntityUpdated(clauses: any[], callback: (response: any) => void) {
    console.log('🌐 Mock Torii: onEntityUpdated called');
    return { cancel: () => console.log('🛑 Mock subscription cancelled') };
  }

  async getEntities(query: any) {
    console.log('🌐 Mock Torii: getEntities called');
    return [];
  }
}

// Mock Dojo SDK init function
export const mockInit = async (config: any) => {
  console.log('🌐 Mock Dojo: init called with config:', config);
  return new MockToriiClient();
};

// Mock system call execution
export const mockExecuteSystemCall = async (
  call: SystemCall,
  walletExecute: (contractAddress: string, entryPoint: string, calldata: any[]) => Promise<any>
): Promise<TransactionResult> => {
  console.log('🌐 Mock Dojo: executeSystemCall called:', call);
  
  try {
    // For web, we'll simulate the transaction
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log('✅ Mock system call successful:', mockTxHash);
    
    return {
      transaction_hash: mockTxHash,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Mock system call failed:', error);
    throw error;
  }
};

// Mock query entities
export const mockQueryEntities = async (
  toriiClient: any,
  namespace: string,
  models: string[],
  keys: string[]
): Promise<Entity[]> => {
  console.log('🌐 Mock Dojo: queryEntities called:', { namespace, models, keys });
  
  // Return mock data
  return [{
    entityId: `mock-entity-${keys[0]?.slice(0, 8) || 'default'}`,
    models: {
      [namespace]: {
        Position: { x: 10, y: 10 },
        Moves: { remaining: 100 }
      }
    }
  }];
};

// Mock subscription
export const mockSubscribeToEntityUpdates = async (
  toriiClient: any,
  namespace: string,
  models: string[],
  keys: string[],
  callback: (entities: Entity[]) => void
) => {
  console.log('🌐 Mock Dojo: subscribeToEntityUpdates called');
  
  // Simulate periodic updates
  const interval = setInterval(() => {
    const mockEntities = [{
      entityId: `mock-entity-${keys[0]?.slice(0, 8) || 'default'}`,
      models: {
        [namespace]: {
          Position: { 
            x: Math.floor(Math.random() * 20), 
            y: Math.floor(Math.random() * 20) 
          },
          Moves: { remaining: Math.floor(Math.random() * 100) }
        }
      }
    }];
    
    callback(mockEntities);
  }, 5000);
  
  return {
    cancel: () => {
      clearInterval(interval);
      console.log('🛑 Mock subscription cancelled');
    }
  };
};
