// Mission System Types for AsTrade

export interface StoryMission {
  id: string;
  planetId: number;
  chapter: number;
  title: string;
  description: string;
  storyText: string; // Narrative context
  objectives: MissionObjective[];
  rewards: MissionReward[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  prerequisites?: string[]; // IDs of missions that must be completed first
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // in minutes
}

export interface MissionObjective {
  id: string;
  type: 'trade' | 'volume' | 'profit' | 'streak' | 'hold_position' | 'market_analysis' | 'risk_management';
  description: string;
  requirements: ObjectiveRequirements;
  progress: {
    current: number;
    target: number;
    completed: boolean;
  };
}

export interface ObjectiveRequirements {
  // Trading objectives
  symbol?: string;
  side?: 'buy' | 'sell';
  orderType?: 'market' | 'limit';
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  
  // Volume/profit objectives
  totalVolume?: number;
  totalProfit?: number;
  totalTrades?: number;
  winRate?: number;
  
  // Streak objectives
  consecutiveWins?: number;
  consecutiveProfitableDays?: number;
  
  // Position management
  holdDuration?: number; // in minutes
  maxLoss?: number; // maximum allowed loss percentage
  leverageRange?: [number, number]; // [min, max] leverage
  
  // Market analysis
  correctPredictions?: number;
  marketDataAnalysis?: boolean;
  
  // Time constraints
  timeLimit?: number; // in minutes
  deadline?: number; // timestamp
}

export interface MissionReward {
  type: 'xp' | 'coins' | 'nft' | 'title' | 'unlock' | 'multiplier';
  amount?: number;
  item?: string;
  description: string;
}

export interface UserMissionProgress {
  userId: string;
  missionId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: number;
  completedAt?: number;
  objectives: Record<string, {
    progress: number;
    completed: boolean;
    completedAt?: number;
  }>;
  currentObjectiveIndex: number;
  metadata?: Record<string, any>; // For storing mission-specific data
}

// Planet-specific mission collections
export interface PlanetMissions {
  planetId: number;
  planetName: string;
  planetTheme: string;
  storyIntro: string;
  missions: StoryMission[];
  unlockRequirements: {
    previousPlanet?: number;
    minLevel?: number;
    requiredMissions?: string[];
  };
}

// Pre-defined missions for each planet
export const CRYPTO_PRIME_MISSIONS: StoryMission[] = [
  {
    id: 'cp_001_first_steps',
    planetId: 1,
    chapter: 1,
    title: 'First Steps in the Crypto Verse',
    description: 'Learn the basics of perpetual trading',
    storyText: 'Welcome to Crypto Prime, trader! This golden world holds the secrets of digital asset trading. Your journey begins with understanding the fundamentals.',
    objectives: [
      {
        id: 'cp_001_obj_1',
        type: 'trade',
        description: 'Place your first market buy order',
        requirements: {
          symbol: 'BTC-USDT',
          side: 'buy',
          orderType: 'market',
          minQuantity: 0.001,
        },
        progress: { current: 0, target: 1, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 100, description: '+100 XP for completing first trade' },
      { type: 'coins', amount: 50, description: '50 AsTrade coins' }
    ],
    status: 'available',
    difficulty: 'beginner',
    estimatedTime: 5
  },
  {
    id: 'cp_002_market_orders',
    planetId: 1,
    chapter: 2,
    title: 'Mastering Market Orders',
    description: 'Execute both buy and sell market orders',
    storyText: 'The market flows like cosmic energy. Learn to harness its power with swift market orders.',
    objectives: [
      {
        id: 'cp_002_obj_1',
        type: 'trade',
        description: 'Execute 3 market buy orders',
        requirements: {
          symbol: 'BTC-USDT',
          side: 'buy',
          orderType: 'market',
          minQuantity: 0.001,
        },
        progress: { current: 0, target: 3, completed: false }
      },
      {
        id: 'cp_002_obj_2',
        type: 'trade',
        description: 'Execute 3 market sell orders',
        requirements: {
          symbol: 'BTC-USDT',
          side: 'sell',
          orderType: 'market',
          minQuantity: 0.001,
        },
        progress: { current: 0, target: 3, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 200, description: '+200 XP for mastering market orders' },
      { type: 'title', item: 'Market Navigator', description: 'Special title: Market Navigator' }
    ],
    status: 'locked',
    prerequisites: ['cp_001_first_steps'],
    difficulty: 'beginner',
    estimatedTime: 15
  }
];

export const DEFI_NEXUS_MISSIONS: StoryMission[] = [
  {
    id: 'dn_001_limit_orders',
    planetId: 2,
    chapter: 1,
    title: 'The Art of Patience',
    description: 'Master limit orders and strategic positioning',
    storyText: 'DeFi Nexus teaches patience and precision. Here, timing is everything, and limit orders are your tools of choice.',
    objectives: [
      {
        id: 'dn_001_obj_1',
        type: 'trade',
        description: 'Place 5 successful limit orders',
        requirements: {
          symbol: 'ETH-USDT',
          orderType: 'limit',
        },
        progress: { current: 0, target: 5, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 300, description: '+300 XP for mastering limit orders' },
      { type: 'unlock', item: 'advanced_charting', description: 'Unlock advanced charting tools' }
    ],
    status: 'locked',
    difficulty: 'intermediate',
    estimatedTime: 30
  }
];

// Mission evaluation functions
export interface MissionEvaluator {
  evaluateProgress(mission: StoryMission, userProgress: UserMissionProgress, tradingData: any): UserMissionProgress;
  checkCompletion(mission: StoryMission, userProgress: UserMissionProgress): boolean;
  calculateRewards(mission: StoryMission): { xp: number; coins: number; items: string[] };
}

// Trading event types that trigger mission progress
export interface TradingEvent {
  type: 'order_placed' | 'order_filled' | 'position_opened' | 'position_closed' | 'profit_realized' | 'loss_realized';
  timestamp: number;
  symbol: string;
  data: any;
} 