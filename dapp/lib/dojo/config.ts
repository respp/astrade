/**
 * Dojo Configuration
 * 
 * Defines connection parameters for Dojo world integration.
 * Configuration is loaded from environment variables with sensible defaults.
 */

import { DojoConfig, DomainSeparator } from './types';

/**
 * Get Dojo configuration from environment variables
 * Defaults to local Katana development setup
 */
export const getDojoConfig = (): DojoConfig => {
  return {
    rpcUrl: process.env.EXPO_PUBLIC_DOJO_RPC_URL || 'http://localhost:5050',
    toriiUrl: process.env.EXPO_PUBLIC_DOJO_TORII_URL || 'http://localhost:8080',
    worldAddress: process.env.EXPO_PUBLIC_DOJO_WORLD_ADDRESS || '0x04fd367663e253d042fef50014873adba41eb40bfd52a3e686c1c37fe6e3dac0',
    namespace: process.env.EXPO_PUBLIC_DOJO_NAMESPACE || 'di',
    chainId: process.env.EXPO_PUBLIC_DOJO_CHAIN_ID || '0x4b4154414e41', // "KATANA"
  };
};

/**
 * Domain separator for transaction signing
 * Used by Starknet account to sign domain-specific messages
 */
export const getDomainSeparator = (): DomainSeparator => {
  return {
    name: process.env.EXPO_PUBLIC_DOJO_DOMAIN_NAME || 'astrade-dojo',
    version: process.env.EXPO_PUBLIC_DOJO_DOMAIN_VERSION || '1.0',
    chainId: process.env.EXPO_PUBLIC_DOJO_CHAIN_ID || 'KATANA',
    revision: process.env.EXPO_PUBLIC_DOJO_DOMAIN_REVISION || '1',
  };
};

/**
 * Validates Dojo configuration
 * Ensures all required fields are present
 */
export const validateDojoConfig = (config: DojoConfig): boolean => {
  if (!config.rpcUrl) {
    console.error('❌ Dojo RPC URL is required');
    return false;
  }

  if (!config.toriiUrl) {
    console.error('❌ Dojo Torii URL is required');
    return false;
  }

  if (!config.worldAddress) {
    console.warn('⚠️ Dojo world address not configured - some features may not work');
    // Don't fail validation, just warn - world might not be deployed yet
  }

  if (!config.namespace) {
    console.error('❌ Dojo namespace is required');
    return false;
  }

  return true;
};

/**
 * Default manifest structure (placeholder until actual deployment)
 * This will be replaced with actual manifest data from deployed contracts
 */
export const getDefaultManifest = () => {
  return {
    world: {
      address: process.env.EXPO_PUBLIC_DOJO_WORLD_ADDRESS || '0x04fd367663e253d042fef50014873adba41eb40bfd52a3e686c1c37fe6e3dac0',
      name: 'AsTrade World',
    },
    contracts: [
      {
        tag: 'di-actions',
        address: '0x00c15f8f861c8ab9e466c69d78ec701c9ad5952404a8d000a06c6217e67f5591',
        name: 'Actions',
      }
    ],
    models: [
      {
        name: 'Position',
        address: '0x04fd367663e253d042fef50014873adba41eb40bfd52a3e686c1c37fe6e3dac0',
      },
      {
        name: 'Moves',
        address: '0x04fd367663e253d042fef50014873adba41eb40bfd52a3e686c1c37fe6e3dac0',
      }
    ],
  };
};

/**
 * Check if Dojo is configured and ready to use
 */
export const isDojoConfigured = (): boolean => {
  const config = getDojoConfig();
  return validateDojoConfig(config) && config.worldAddress !== '';
};

