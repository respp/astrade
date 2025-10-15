/**
 * Dojo Query Utilities
 * 
 * Provides utilities for querying entities from Torii.
 * Includes query builders and entity data parsers.
 */

import type { ToriiClient } from '@dojoengine/sdk';
import { Entity, QueryFilter } from './types';

/**
 * Build a keys clause for querying entities
 * Used to filter entities by specific key values
 */
export const buildKeysClause = (
  namespace: string,
  models: string[],
  keys: string[]
): any => {
  // Build the model keys with namespace prefix
  const modelKeys = models.map((model) => `${namespace}-${model}`);

  // Return a keys clause structure compatible with Torii
  return {
    Keys: {
      keys: keys,
      pattern_matching: 'FixedLen',
      models: modelKeys,
    },
  };
};

/**
 * Build a composite clause combining multiple conditions
 */
export const buildCompositeClause = (clauses: any[], operator: 'And' | 'Or' = 'And'): any => {
  if (clauses.length === 0) {
    return null;
  }
  if (clauses.length === 1) {
    return clauses[0];
  }

  return {
    Composite: {
      operator,
      clauses,
    },
  };
};

/**
 * Query entities from Torii by keys
 */
export const queryEntitiesByKeys = async (
  toriiClient: ToriiClient | null,
  namespace: string,
  models: string[],
  keys: string[]
): Promise<Entity[]> => {
  if (!toriiClient) {
    throw new Error('Torii client not initialized');
  }

  try {
    console.log('🔍 Querying entities by keys:', { namespace, models, keys });

    const clause = buildKeysClause(namespace, models, keys);

    // Use Torii SDK query method
    const result = await toriiClient.getEntities({
      clause,
      limit: 100,
      offset: 0,
    });

    console.log('✅ Query successful, entities found:', result?.length || 0);

    return result || [];
  } catch (error) {
    console.error('❌ Query failed:', error);
    throw error;
  }
};

/**
 * Query all entities of a specific model type
 */
export const queryEntitiesByModel = async (
  toriiClient: ToriiClient | null,
  namespace: string,
  model: string,
  limit: number = 100
): Promise<Entity[]> => {
  if (!toriiClient) {
    throw new Error('Torii client not initialized');
  }

  try {
    console.log('🔍 Querying entities by model:', { namespace, model, limit });

    // Build a clause that matches all entities with this model
    const modelKey = `${namespace}-${model}`;

    const result = await toriiClient.getEntities({
      clause: {
        Member: {
          model: modelKey,
          member: '*', // Match any member
          operator: 'Eq',
          value: { Primitive: { String: '*' } },
        },
      },
      limit,
      offset: 0,
    });

    console.log('✅ Query successful, entities found:', result?.length || 0);

    return result || [];
  } catch (error) {
    console.error('❌ Query failed:', error);
    throw error;
  }
};

/**
 * Subscribe to entity updates
 * Calls the callback whenever entities matching the filter are updated
 */
export const subscribeToEntityUpdates = async (
  toriiClient: ToriiClient | null,
  namespace: string,
  models: string[],
  keys: string[],
  callback: (entities: Entity[]) => void
): Promise<{ cancel: () => void } | null> => {
  if (!toriiClient) {
    throw new Error('Torii client not initialized');
  }

  try {
    console.log('📡 Subscribing to entity updates:', { namespace, models, keys });

    const clause = buildKeysClause(namespace, models, keys);

    const subscription = await toriiClient.onEntityUpdated(
      [{ clause }],
      (response: any) => {
        if (response.error) {
          console.error('❌ Subscription error:', response.error);
          return;
        }

        if (response.data) {
          console.log('🔔 Entity update received:', response.data);
          callback(response.data);
        }
      }
    );

    console.log('✅ Subscription created successfully');

    return subscription;
  } catch (error) {
    console.error('❌ Subscription failed:', error);
    throw error;
  }
};

/**
 * Parse entity data to extract a specific model
 */
export const parseEntityModel = <T = any>(
  entity: Entity,
  namespace: string,
  modelName: string
): T | null => {
  if (!entity.models || !entity.models[namespace]) {
    return null;
  }

  const model = entity.models[namespace][modelName];
  return model as T || null;
};

/**
 * Parse multiple entities to extract a specific model from each
 */
export const parseEntitiesModel = <T = any>(
  entities: Entity[],
  namespace: string,
  modelName: string
): T[] => {
  return entities
    .map((entity) => parseEntityModel<T>(entity, namespace, modelName))
    .filter((model): model is T => model !== null);
};

/**
 * Format entity key for Torii queries
 * Combines namespace, model, and keys into a single key string
 */
export const formatEntityKey = (namespace: string, model: string, keys: string[]): string => {
  return `${namespace}-${model}-${keys.join('-')}`;
};

/**
 * Extract entity ID from entity data
 */
export const getEntityId = (entity: Entity): string => {
  return entity.entityId || '';
};

