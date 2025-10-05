// Backend API Types for AsTrade

// Market Data Types
export interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: number;
  maxOrderSize: number;
  tickSize: number;
  status: 'active' | 'inactive';
}

export interface MarketStats {
  symbol: string;
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  openPrice24h: number;
}

export interface OrderbookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface Orderbook {
  symbol: string;
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRate {
  symbol: string;
  fundingRate: number;
  fundingTimestamp: number;
  nextFundingTimestamp: number;
}

// Order Types
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected';
  createdAt: number;
  updatedAt: number;
  filledQuantity: number;
  remainingQuantity: number;
}

export interface PlaceOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  reduceOnly?: boolean;
}

export interface TWAPOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  duration: number; // in minutes
  priceLimit?: number;
}

// Account Types
export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  timestamp: number;
}

export interface AccountSummary {
  totalBalance: number;
  availableBalance: number;
  unrealizedPnl: number;
  totalMargin: number;
  freeMargin: number;
  marginLevel: number;
  openPositions: number;
  totalVolume24h: number;
}

export interface AccountFees {
  makerFeeRate: number;
  takerFeeRate: number;
  volume30d: number;
  feesTier: string;
}

export interface LeverageSettings {
  symbol: string;
  leverage: number;
  maxLeverage: number;
}

// Mission System Types
export interface Mission {
  id: string;
  planetId: number;
  title: string;
  description: string;
  type: 'trade' | 'volume' | 'profit' | 'streak' | 'exploration';
  requirements: {
    symbol?: string;
    volume?: number;
    trades?: number;
    profit?: number;
    streak?: number;
    side?: 'buy' | 'sell';
  };
  rewards: {
    xp: number;
    tokens?: number;
    nft?: string;
    title?: string;
  };
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress: {
    current: number;
    total: number;
  };
  deadline?: number;
}

export interface UserProgress {
  totalXp: number;
  level: number;
  currentPlanet: number;
  unlockedPlanets: number[];
  completedMissions: string[];
  achievements: string[];
  tradingStats: {
    totalVolume: number;
    totalTrades: number;
    winRate: number;
    totalPnl: number;
    bestStreak: number;
    currentStreak: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Rewards System Types
export interface DailyReward {
  day: number;
  reward: {
    amount: number;
    currency: 'credits';
    type: 'credits' | 'mystery_nft' | 'premium_nft';
    image_url?: string;
  };
  is_claimed: boolean;
  is_today: boolean;
  is_locked: boolean;
  amount: number;
}

export interface DailyRewardStatus {
  can_claim: boolean;
  current_streak: number;
  longest_streak: number;
  next_reward_in: string;
  today_reward: {
    day: number;
    amount: number;
    currency: 'credits';
    type: 'credits' | 'mystery_nft' | 'premium_nft';
    description: string;
  };
  week_rewards: DailyReward[];
  galaxy_explorer_days: number;
}

export interface ClaimRewardRequest {
  reward_type: 'daily_streak' | 'galaxy_explorer';
}

export interface ClaimRewardResponse {
  success: boolean;
  reward_data: {
    amount: number;
    currency: 'credits';
    type: 'credits' | 'mystery_nft' | 'premium_nft';
    description: string;
  };
  new_streak: number;
  message: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
}

export interface UserStreaks {
  daily_login: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
  };
  galaxy_explorer: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
  };
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  experience: number;
  total_trades: number;
  total_pnl: number;
  achievements: Achievement[];
  streaks: UserStreaks;
  recent_rewards: Array<{
    date: string;
    type: string;
    reward: {
      amount: number;
      currency: 'credits';
      type: 'credits' | 'mystery_nft' | 'premium_nft';
    };
    streak_count: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface StreakInfo {
  daily_login_streak: number;
  daily_login_longest: number;
  galaxy_explorer_days: number;
  can_claim_today: boolean;
  next_reward_in: string;
} 