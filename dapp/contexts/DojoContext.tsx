/**
 * DojoContext - Dojo Integration Provider
 * 
 * Manages connection to Dojo world via Torii client.
 * Integrates with WalletContext for transaction signing.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useWallet } from './WalletContext';
import { 
  mockInit, 
  MockToriiClient, 
  mockExecuteSystemCall, 
  mockQueryEntities, 
  mockSubscribeToEntityUpdates 
} from '@/lib/dojo/mockDojo';

// Check if we're in a web environment
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
import {
  DojoContextType,
  DojoConnectionState,
  DojoError,
  DojoManifest,
  QueryFilter,
  SystemCall,
  TransactionResult,
  Entity,
  SubscriptionCallback,
  Subscription,
  ContractManifest,
} from '@/lib/dojo/types';
import {
  getDojoConfig,
  getDomainSeparator,
  validateDojoConfig,
  getDefaultManifest,
} from '@/lib/dojo/config';
import {
  executeSystemCall,
  executeBatchSystemCalls,
  findContractByTag,
} from '@/lib/dojo/systemCalls';
import { queryEntitiesByKeys, formatEntityKey } from '@/lib/dojo/queries';

const DojoContext = createContext<DojoContextType | undefined>(undefined);

export const useDojo = () => {
  const context = useContext(DojoContext);
  if (!context) {
    throw new Error('useDojo must be used within a DojoProvider');
  }
  return context;
};

const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3;

export const DojoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet, isAuthenticated, executeTransaction, executeBatch } = useWallet();

  // State
  const [connectionState, setConnectionState] = useState<DojoConnectionState>(
    DojoConnectionState.DISCONNECTED
  );
  const [error, setError] = useState<DojoError | null>(null);
  const [toriiClient, setToriiClient] = useState<ToriiClient | null>(null);
  const [manifest, setManifest] = useState<DojoManifest | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Refs
  const isConnectingRef = useRef(false);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  const config = getDojoConfig();

  // Connect to Dojo
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('⏳ Connection already in progress...');
      return;
    }

    if (!validateDojoConfig(config)) {
      console.error('❌ Invalid Dojo configuration');
      setError(DojoError.INVALID_CONFIG);
      setConnectionState(DojoConnectionState.ERROR);
      return;
    }

    isConnectingRef.current = true;
    setConnectionState(DojoConnectionState.CONNECTING);
    setError(null);

    try {
      console.log('🔌 Connecting to Dojo...', {
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        worldAddress: config.worldAddress,
        isWeb,
      });

      let torii;
      
      if (isWeb) {
        // For web, use mock client to avoid WASM issues
        console.log('🌐 Web environment detected, using mock Torii client');
        torii = await mockInit({
          client: {
            rpcUrl: config.rpcUrl,
            toriiUrl: config.toriiUrl,
            worldAddress: config.worldAddress,
          },
          domain: getDomainSeparator(),
        });
      } else {
        // For React Native, use real Torii client
        try {
          const { init } = await import('@dojoengine/sdk');
          torii = await init({
            client: {
              rpcUrl: config.rpcUrl,
              toriiUrl: config.toriiUrl,
              worldAddress: config.worldAddress,
            },
            domain: getDomainSeparator(),
          });
        } catch (error) {
          console.warn('⚠️ Failed to load real Dojo SDK, falling back to mock:', error);
          torii = await mockInit({
            client: {
              rpcUrl: config.rpcUrl,
              toriiUrl: config.toriiUrl,
              worldAddress: config.worldAddress,
            },
            domain: getDomainSeparator(),
          });
        }
      }

      setToriiClient(torii);

      // Load manifest (for now, use default/placeholder)
      const defaultManifest = getDefaultManifest();
      setManifest(defaultManifest);

      setConnectionState(DojoConnectionState.CONNECTED);
      setReconnectAttempts(0);
      console.log('✅ Connected to Dojo successfully');
    } catch (err) {
      console.error('❌ Failed to connect to Dojo:', err);
      setError(DojoError.CONNECTION_FAILED);
      setConnectionState(DojoConnectionState.ERROR);

      // Attempt reconnection if configured
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`🔄 Will retry connection (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          reconnect();
        }, RECONNECT_INTERVAL);
      }
    } finally {
      isConnectingRef.current = false;
    }
  }, [config, reconnectAttempts]);

  // Disconnect from Dojo
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting from Dojo...');

    // Cancel all active subscriptions
    subscriptionsRef.current.forEach((subscription, key) => {
      try {
        if (subscription && typeof subscription.cancel === 'function') {
          subscription.cancel();
        }
      } catch (err) {
        console.error(`Failed to cancel subscription ${key}:`, err);
      }
    });
    subscriptionsRef.current.clear();

    setToriiClient(null);
    setManifest(null);
    setConnectionState(DojoConnectionState.DISCONNECTED);
    setError(null);
    setReconnectAttempts(0);
    console.log('✅ Disconnected from Dojo');
  }, []);

  // Reconnect to Dojo
  const reconnect = useCallback(async () => {
    console.log('🔄 Reconnecting to Dojo...');
    setConnectionState(DojoConnectionState.RECONNECTING);
    await disconnect();
    await connect();
  }, [connect, disconnect]);

  // Query entities
  const queryEntities = useCallback(
    async (filter: QueryFilter): Promise<Entity[]> => {
      if (!toriiClient) {
        throw new Error(DojoError.CONNECTION_FAILED);
      }

      try {
        const keys = filter.keys || [];
        const models = filter.models || [];

        if (isWeb) {
          // Use mock query for web
          console.log('🌐 Mock query for web environment');
          return await mockQueryEntities(
            toriiClient,
            config.namespace,
            models,
            keys
          );
        }

        const entities = await queryEntitiesByKeys(
          toriiClient,
          config.namespace,
          models,
          keys
        );

        return entities;
      } catch (err) {
        console.error('❌ Query failed:', err);
        setError(DojoError.QUERY_FAILED);
        throw err;
      }
    },
    [toriiClient, config.namespace]
  );

  // Subscribe to entity updates
  const subscribeToEntities = useCallback(
    async (
      filter: QueryFilter,
      callback: SubscriptionCallback
    ): Promise<Subscription> => {
      if (!toriiClient) {
        throw new Error(DojoError.CONNECTION_FAILED);
      }

      try {
        const keys = filter.keys || [];
        const models = filter.models || [];

        // Create subscription key
        const subKey = `${models.join(',')}-${keys.join(',')}`;

        if (isWeb) {
          // Use mock subscription for web
          console.log('🌐 Mock subscription for web environment');
          return await mockSubscribeToEntityUpdates(
            toriiClient,
            config.namespace,
            models,
            keys,
            (entities) => {
              callback({ data: entities });
            }
          );
        }

        // Use Torii SDK subscription
        const subscription = await toriiClient.onEntityUpdated(
          [{ Keys: { keys, models: models.map((m) => `${config.namespace}-${m}`) } }],
          (response: any) => {
            if (response.error) {
              callback({ error: response.error });
            } else if (response.data) {
              callback({ data: response.data });
            }
          }
        );

        // Store subscription
        subscriptionsRef.current.set(subKey, subscription);

        console.log('✅ Entity subscription created:', subKey);

        return {
          cancel: () => {
            if (subscription && typeof subscription.cancel === 'function') {
              subscription.cancel();
              subscriptionsRef.current.delete(subKey);
              console.log('🛑 Subscription cancelled:', subKey);
            }
          },
        };
      } catch (err) {
        console.error('❌ Subscription failed:', err);
        setError(DojoError.SUBSCRIPTION_FAILED);
        throw err;
      }
    },
    [toriiClient, config.namespace]
  );

  // Execute system call
  const executeSystemCall = useCallback(
    async (call: SystemCall): Promise<TransactionResult> => {
      if (!isAuthenticated || !executeTransaction) {
        throw new Error(DojoError.WALLET_NOT_CONNECTED);
      }

      try {
        if (isWeb) {
          return await mockExecuteSystemCall(call, executeTransaction);
        } else {
          return await executeSystemCall(call, executeTransaction);
        }
      } catch (err) {
        console.error('❌ System call failed:', err);
        setError(DojoError.TRANSACTION_FAILED);
        throw err;
      }
    },
    [isAuthenticated, executeTransaction]
  );

  // Execute batch system calls
  const executeBatchSystemCalls = useCallback(
    async (calls: SystemCall[]): Promise<TransactionResult> => {
      if (!isAuthenticated || !executeBatch) {
        throw new Error(DojoError.WALLET_NOT_CONNECTED);
      }

      try {
        if (isWeb) {
          // For web, execute calls sequentially
          const results = [];
          for (const call of calls) {
            const result = await mockExecuteSystemCall(call, executeTransaction);
            results.push(result);
          }
          return results[0]; // Return first result
        } else {
          return await executeBatchSystemCalls(calls, executeBatch);
        }
      } catch (err) {
        console.error('❌ Batch system calls failed:', err);
        setError(DojoError.TRANSACTION_FAILED);
        throw err;
      }
    },
    [isAuthenticated, executeBatch]
  );

  // Find contract by tag
  const findContract = useCallback(
    (tag: string): ContractManifest | null => {
      return findContractByTag(manifest, tag);
    },
    [manifest]
  );

  // Format entity key
  const formatEntityKeyFn = useCallback(
    (namespace: string, model: string, keys: string[]): string => {
      return formatEntityKey(namespace, model, keys);
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    if (connectionState === DojoConnectionState.DISCONNECTED) {
      console.log('🔌 Auto-connecting to Dojo...');
      connect();
    }
  }, [connectionState, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: DojoContextType = {
    connectionState,
    error,
    isConnected: connectionState === DojoConnectionState.CONNECTED,
    isLoading:
      connectionState === DojoConnectionState.CONNECTING ||
      connectionState === DojoConnectionState.RECONNECTING,
    toriiClient,
    config,
    manifest,
    connect,
    disconnect,
    reconnect,
    queryEntities,
    subscribeToEntities,
    executeSystemCall,
    executeBatchSystemCalls,
    findContract,
    formatEntityKey: formatEntityKeyFn,
  };

  return <DojoContext.Provider value={value}>{children}</DojoContext.Provider>;
};

