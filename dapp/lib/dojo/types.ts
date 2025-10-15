/**
 * TypeScript type definitions for Dojo integration
 * 
 * These types define the structure for interacting with Dojo entities,
 * system calls, and Torii subscriptions.
 */

// Import type from Dojo SDK - will be available after npm install
import type { ToriiClient } from '@dojoengine/sdk';

// ==================== Configuration Types ====================

export interface DojoConfig {
  rpcUrl: string;
  toriiUrl: string;
  worldAddress: string;
  namespace: string;
  chainId: string;
}

export interface DomainSeparator {
  name: string;
  version: string;
  chainId: string;
  revision: string;
}

// ==================== Manifest Types ====================

export interface ContractManifest {
  address: string;
  tag: string;
  name?: string;
  description?: string;
}

export interface ModelManifest {
  name: string;
  members: Array<{
    name: string;
    type: string;
    key: boolean;
  }>;
}

export interface DojoManifest {
  world: {
    address: string;
    name: string;
  };
  contracts: ContractManifest[];
  models: ModelManifest[];
}

// ==================== Entity Types ====================

export interface Entity {
  entityId: string;
  models: Record<string, Record<string, any>>;
}

export interface EntityModel {
  [key: string]: any;
}

// ==================== Query Types ====================

export interface QueryFilter {
  keys?: string[];
  models?: string[];
  clause?: any;
}

export interface SubscriptionCallback {
  (result: { data?: Entity[]; error?: Error }): void;
}

export interface Subscription {
  cancel: () => void;
}

// ==================== System Call Types ====================

export interface SystemCall {
  contractAddress: string;
  entrypoint: string;
  calldata: any[];
}

export interface TransactionResult {
  transaction_hash: string;
  status?: string;
}

// ==================== Dojo Context Types ====================

export enum DojoConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

export enum DojoError {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface DojoContextType {
  // Connection state
  connectionState: DojoConnectionState;
  error: DojoError | null;
  isConnected: boolean;
  isLoading: boolean;

  // Torii client instance
  toriiClient: ToriiClient | null;

  // Configuration
  config: DojoConfig;
  manifest: DojoManifest | null;

  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;

  // Query methods
  queryEntities: (filter: QueryFilter) => Promise<Entity[]>;
  subscribeToEntities: (
    filter: QueryFilter,
    callback: SubscriptionCallback
  ) => Promise<Subscription>;

  // System call methods
  executeSystemCall: (call: SystemCall) => Promise<TransactionResult>;
  executeBatchSystemCalls: (calls: SystemCall[]) => Promise<TransactionResult>;

  // Utility methods
  findContract: (tag: string) => ContractManifest | null;
  formatEntityKey: (namespace: string, model: string, keys: string[]) => string;
}

