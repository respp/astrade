import { useState, useEffect, useCallback } from 'react';
import { marketsService, ApiError } from '../api';
import { Market, MarketStats } from '../api/types';

// Hook for loading all markets
export const useMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketsService.getMarkets();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  return {
    markets,
    loading,
    error,
    refetch: loadMarkets,
  };
};

// Hook for loading market statistics
export const useMarketStats = () => {
  const [stats, setStats] = useState<MarketStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketsService.getMarketStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to load market stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  };
};

// Hook for loading specific market stats
export const useMarketStatsForSymbol = (symbol: string) => {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await marketsService.getMarketStatsForSymbol(symbol);
      setStats(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : `Failed to load stats for ${symbol}`);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  };
};

// Hook for loading trending markets
export const useTrendingMarkets = (limit: number = 10) => {
  const [trendingMarkets, setTrendingMarkets] = useState<MarketStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketsService.getTrendingMarkets(limit);
      setTrendingMarkets(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to load trending markets');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return {
    trendingMarkets,
    loading,
    error,
    refetch: loadTrending,
  };
};

// Hook for searching markets
export const useMarketSearch = () => {
  const [results, setResults] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await marketsService.searchMarkets(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearSearch,
  };
}; 