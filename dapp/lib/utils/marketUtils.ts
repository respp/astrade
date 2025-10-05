/**
 * Market utilities for quantity validation and formatting
 */

export interface MarketConfig {
  symbol: string;
  stepSize: number;
  minOrderSize: number;
  maxOrderSize: number;
  tickSize: number;
}

// Default market configurations based on common crypto precision
const MARKET_CONFIGS: Record<string, MarketConfig> = {
  'BTC-USD': {
    symbol: 'BTC-USD',
    stepSize: 0.0001, // 4 decimal places
    minOrderSize: 0.0001,
    maxOrderSize: 1000,
    tickSize: 0.1
  },
  'ETH-USD': {
    symbol: 'ETH-USD',
    stepSize: 0.01, // 2 decimal places
    minOrderSize: 0.01,
    maxOrderSize: 10000,
    tickSize: 0.01
  },
  'STRK-USD': {
    symbol: 'STRK-USD',
    stepSize: 0.1, // 1 decimal place
    minOrderSize: 0.1,
    maxOrderSize: 100000,
    tickSize: 0.01
  },
  'MATIC-USD': {
    symbol: 'MATIC-USD',
    stepSize: 1, // 0 decimal places
    minOrderSize: 1,
    maxOrderSize: 1000000,
    tickSize: 0.001
  }
};

/**
 * Get market configuration for a given symbol
 */
export function getMarketConfig(symbol: string): MarketConfig {
  return MARKET_CONFIGS[symbol] || {
    symbol,
    stepSize: 0.0001, // Default to BTC precision
    minOrderSize: 0.0001,
    maxOrderSize: 1000,
    tickSize: 0.1
  };
}

/**
 * Validate quantity for a specific market
 */
export function validateQuantity(quantity: string, market: string): { isValid: boolean; error?: string } {
  const config = getMarketConfig(market);
  const numValue = parseFloat(quantity);
  
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, error: 'Quantity must be greater than 0' };
  }
  
  if (numValue < config.minOrderSize) {
    return { 
      isValid: false, 
      error: `Minimum quantity is ${config.minOrderSize} ${market.split('-')[0]}` 
    };
  }
  
  if (numValue > config.maxOrderSize) {
    return { 
      isValid: false, 
      error: `Maximum quantity is ${config.maxOrderSize} ${market.split('-')[0]}` 
    };
  }
  
  // Check if quantity matches step size precision
  const remainder = numValue % config.stepSize;
  if (remainder > 0.00000001) { // Small epsilon for floating point comparison
    return { 
      isValid: false, 
      error: `Quantity must be in increments of ${config.stepSize} ${market.split('-')[0]}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Format quantity to match market step size
 */
export function formatQuantity(quantity: string, market: string): string {
  const config = getMarketConfig(market);
  const numValue = parseFloat(quantity);
  
  if (isNaN(numValue)) return '0';
  
  // Round to step size precision
  const stepSizeDecimals = config.stepSize.toString().split('.')[1]?.length || 0;
  return numValue.toFixed(stepSizeDecimals);
}

/**
 * Get the asset symbol from market (e.g., "BTC" from "BTC-USD")
 */
export function getAssetSymbol(market: string): string {
  return market.split('-')[0];
}

/**
 * Get default quantity for a market
 */
export function getDefaultQuantity(market: string): string {
  const config = getMarketConfig(market);
  return config.minOrderSize.toString();
} 