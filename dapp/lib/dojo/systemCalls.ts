/**
 * Dojo System Calls Utilities
 * 
 * Provides utilities for executing system calls on Dojo contracts.
 * Integrates with Cavos wallet for transaction signing.
 */

import { DojoManifest, SystemCall, TransactionResult, ContractManifest } from './types';

/**
 * Find a contract in the manifest by its tag
 */
export const findContractByTag = (
  manifest: DojoManifest | null,
  tag: string
): ContractManifest | null => {
  if (!manifest || !manifest.contracts) {
    return null;
  }

  const contract = manifest.contracts.find((c) => c.tag === tag);
  return contract || null;
};

/**
 * Find a contract in the manifest by its name
 */
export const findContractByName = (
  manifest: DojoManifest | null,
  name: string
): ContractManifest | null => {
  if (!manifest || !manifest.contracts) {
    return null;
  }

  const contract = manifest.contracts.find(
    (c) => c.name?.toLowerCase() === name.toLowerCase()
  );
  return contract || null;
};

/**
 * Build a system call object for a Dojo contract
 */
export const buildSystemCall = (
  contractAddress: string,
  entrypoint: string,
  calldata: any[] = []
): SystemCall => {
  return {
    contractAddress,
    entrypoint,
    calldata,
  };
};

/**
 * Format calldata for a system call
 * Converts JavaScript values to Starknet-compatible format
 */
export const formatCalldata = (params: any[]): string[] => {
  return params.map((param) => {
    if (typeof param === 'number') {
      return param.toString();
    }
    if (typeof param === 'string') {
      // If it's already a hex string, return as-is
      if (param.startsWith('0x')) {
        return param;
      }
      // Otherwise, treat as decimal string
      return param;
    }
    if (typeof param === 'boolean') {
      return param ? '1' : '0';
    }
    // For complex types, assume they're already formatted
    return param.toString();
  });
};

/**
 * Execute a system call using the Cavos wallet
 * Returns the transaction hash
 */
export const executeSystemCall = async (
  call: SystemCall,
  walletExecute: (
    contractAddress: string,
    entryPoint: string,
    calldata: any[]
  ) => Promise<any>
): Promise<TransactionResult> => {
  try {
    console.log('📝 Executing Dojo system call:', {
      contract: call.contractAddress,
      entrypoint: call.entrypoint,
      calldata: call.calldata,
    });

    const result = await walletExecute(
      call.contractAddress,
      call.entrypoint,
      call.calldata
    );

    console.log('✅ Dojo system call successful:', result);

    return {
      transaction_hash: result.transaction_hash || result.transactionHash || result,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Dojo system call failed:', error);
    throw error;
  }
};

/**
 * Execute multiple system calls as a batch transaction
 */
export const executeBatchSystemCalls = async (
  calls: SystemCall[],
  walletExecuteBatch: (calls: any[]) => Promise<any>
): Promise<TransactionResult> => {
  try {
    console.log('📝 Executing Dojo batch system calls:', {
      callCount: calls.length,
      calls: calls.map((c) => ({
        contract: c.contractAddress,
        entrypoint: c.entrypoint,
      })),
    });

    const formattedCalls = calls.map((call) => ({
      contractAddress: call.contractAddress,
      entrypoint: call.entrypoint,
      calldata: call.calldata,
    }));

    const result = await walletExecuteBatch(formattedCalls);

    console.log('✅ Dojo batch system calls successful:', result);

    return {
      transaction_hash: result.transaction_hash || result.transactionHash || result,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Dojo batch system calls failed:', error);
    throw error;
  }
};

/**
 * Helper to create a spawn system call (common pattern in Dojo)
 */
export const createSpawnCall = (
  manifest: DojoManifest | null,
  actionsContractTag: string = 'actions'
): SystemCall | null => {
  const contract = findContractByTag(manifest, actionsContractTag);
  if (!contract) {
    console.error(`❌ Contract with tag '${actionsContractTag}' not found in manifest`);
    return null;
  }

  return buildSystemCall(contract.address, 'spawn', []);
};

/**
 * Helper to create a generic action call
 */
export const createActionCall = (
  manifest: DojoManifest | null,
  entrypoint: string,
  calldata: any[] = [],
  actionsContractTag: string = 'actions'
): SystemCall | null => {
  const contract = findContractByTag(manifest, actionsContractTag);
  if (!contract) {
    console.error(`❌ Contract with tag '${actionsContractTag}' not found in manifest`);
    return null;
  }

  return buildSystemCall(contract.address, entrypoint, formatCalldata(calldata));
};

