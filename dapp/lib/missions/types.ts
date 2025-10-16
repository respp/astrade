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

export const VESU_MISSIONS: StoryMission[] = [
  {
    id: 'vesu_001_initial_investment',
    planetId: 5,
    chapter: 1,
    title: 'Discover Vesu Investment Hub',
    description: 'Make your first investment in Vesu ecosystem',
    storyText: 'Welcome to Vesu Planet! A revolutionary investment platform where traditional finance meets DeFi. Your journey into Vesu begins with understanding their unique investment opportunities.',
    objectives: [
      {
        id: 'vesu_001_obj_1',
        type: 'trade',
        description: 'Make your first Vesu investment (minimum $50)',
        requirements: {
          symbol: 'VESU-USDT',
          side: 'buy',
          orderType: 'market',
          minQuantity: 50,
        },
        progress: { current: 0, target: 1, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 500, description: '+500 XP for joining Vesu ecosystem' },
      { type: 'coins', amount: 100, description: '100 AsTrade coins' },
      { type: 'title', item: 'Vesu Pioneer', description: 'Special title: Vesu Pioneer' }
    ],
    status: 'available',
    difficulty: 'intermediate',
    estimatedTime: 10
  },
  {
    id: 'vesu_002_portfolio_diversification',
    planetId: 5,
    chapter: 2,
    title: 'Vesu Portfolio Master',
    description: 'Build a diversified Vesu investment portfolio',
    storyText: 'Vesu offers multiple investment products. Learn to diversify your portfolio across their innovative financial instruments.',
    objectives: [
      {
        id: 'vesu_002_obj_1',
        type: 'trade',
        description: 'Invest in 3 different Vesu products',
        requirements: {
          symbols: ['VESU-USDT', 'VESU-ETH', 'VESU-BTC'],
          side: 'buy',
          minQuantity: 25,
        },
        progress: { current: 0, target: 3, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 750, description: '+750 XP for portfolio diversification' },
      { type: 'nft', item: 'vesu_portfolio_badge', description: 'Vesu Portfolio Badge NFT' }
    ],
    status: 'locked',
    prerequisites: ['vesu_001_initial_investment'],
    difficulty: 'intermediate',
    estimatedTime: 20
  },
  {
    id: 'vesu_003_yield_optimization',
    planetId: 5,
    chapter: 3,
    title: 'Vesu Yield Strategist',
    description: 'Maximize returns through Vesu yield products',
    storyText: 'Vesu\'s yield products offer competitive returns. Learn to optimize your investments for maximum yield.',
    objectives: [
      {
        id: 'vesu_003_obj_1',
        type: 'profit',
        description: 'Generate $100+ profit from Vesu investments',
        requirements: {
          symbol: 'VESU-USDT',
          minProfit: 100,
        },
        progress: { current: 0, target: 100, completed: false }
      },
      {
        id: 'vesu_003_obj_2',
        type: 'hold_position',
        description: 'Hold Vesu position for 7+ days',
        requirements: {
          symbol: 'VESU-USDT',
          minDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
          minQuantity: 50,
        },
        progress: { current: 0, target: 1, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 1000, description: '+1000 XP for yield mastery' },
      { type: 'coins', amount: 200, description: '200 AsTrade coins' },
      { type: 'unlock', item: 'vesu_advanced_features', description: 'Unlock Vesu advanced features' }
    ],
    status: 'locked',
    prerequisites: ['vesu_002_portfolio_diversification'],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    id: 'vesu_004_community_engagement',
    planetId: 5,
    chapter: 4,
    title: 'Vesu Community Champion',
    description: 'Become an active member of the Vesu community',
    storyText: 'The Vesu community is at the heart of the platform. Engage with fellow investors and contribute to the ecosystem growth.',
    objectives: [
      {
        id: 'vesu_004_obj_1',
        type: 'volume',
        description: 'Accumulate $1000+ in Vesu trading volume',
        requirements: {
          symbol: 'VESU-USDT',
          minVolume: 1000,
        },
        progress: { current: 0, target: 1000, completed: false }
      },
      {
        id: 'vesu_004_obj_2',
        type: 'streak',
        description: 'Make Vesu investments for 5 consecutive days',
        requirements: {
          symbol: 'VESU-USDT',
          streakDays: 5,
          minQuantity: 10,
        },
        progress: { current: 0, target: 5, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 1500, description: '+1500 XP for community engagement' },
      { type: 'title', item: 'Vesu Champion', description: 'Special title: Vesu Champion' },
      { type: 'nft', item: 'vesu_champion_badge', description: 'Vesu Champion Badge NFT' }
    ],
    status: 'locked',
    prerequisites: ['vesu_003_yield_optimization'],
    difficulty: 'expert',
    estimatedTime: 60
  },
  {
    id: 'vesu_005_vesu_master',
    planetId: 5,
    chapter: 5,
    title: 'Vesu Investment Master',
    description: 'Achieve mastery in Vesu investment strategies',
    storyText: 'You have proven yourself as a Vesu expert. Master the advanced strategies and become a Vesu Investment Master.',
    objectives: [
      {
        id: 'vesu_005_obj_1',
        type: 'profit',
        description: 'Generate $500+ total profit from Vesu investments',
        requirements: {
          symbol: 'VESU-USDT',
          minProfit: 500,
        },
        progress: { current: 0, target: 500, completed: false }
      },
      {
        id: 'vesu_005_obj_2',
        type: 'volume',
        description: 'Accumulate $5000+ in total Vesu trading volume',
        requirements: {
          symbol: 'VESU-USDT',
          minVolume: 5000,
        },
        progress: { current: 0, target: 5000, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 2500, description: '+2500 XP for Vesu mastery' },
      { type: 'coins', amount: 500, description: '500 AsTrade coins' },
      { type: 'title', item: 'Vesu Master', description: 'Ultimate title: Vesu Master' },
      { type: 'nft', item: 'vesu_master_crown', description: 'Exclusive Vesu Master Crown NFT' }
    ],
    status: 'locked',
    prerequisites: ['vesu_004_community_engagement'],
    difficulty: 'expert',
    estimatedTime: 90
  }
];

export const STARKNET_TOKEN_MISSIONS: StoryMission[] = [
  {
    id: 'starknet_001_genesis_supply',
    planetId: 6,
    chapter: 1,
    title: 'Starknet Genesis Supply',
    description: 'Invest in Starknet Token Genesis pool',
    storyText: 'Welcome to the Starknet ecosystem! The Genesis pool offers an attractive 8.26% APR with $943.08K total supplied. Start your journey into Layer 2 scaling solutions.',
    objectives: [
      {
        id: 'starknet_001_obj_1',
        type: 'trade',
        description: 'Supply $100+ to Starknet Genesis pool',
        requirements: {
          symbol: 'STARKNET-USDT',
          side: 'buy',
          orderType: 'market',
          minQuantity: 100,
        },
        progress: { current: 0, target: 1, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 600, description: '+600 XP for Genesis supply' },
      { type: 'coins', amount: 150, description: '150 AsTrade coins' },
      { type: 'title', item: 'Starknet Pioneer', description: 'Special title: Starknet Pioneer' }
    ],
    status: 'available',
    difficulty: 'intermediate',
    estimatedTime: 10
  },
  {
    id: 'starknet_002_tether_lending',
    planetId: 6,
    chapter: 2,
    title: 'Tether USD Lending Strategy',
    description: 'Lend Tether USD to Vesu protocol',
    storyText: 'The Tether USD pool shows high utilization at 87.25% with $344.59K supplied and 7.3% APR. This indicates strong demand and good yield opportunities.',
    objectives: [
      {
        id: 'starknet_002_obj_1',
        type: 'trade',
        description: 'Lend $200+ USDT to Vesu protocol',
        requirements: {
          symbol: 'USDT-VESU',
          side: 'buy',
          orderType: 'market',
          minQuantity: 200,
        },
        progress: { current: 0, target: 1, completed: false }
      },
      {
        id: 'starknet_002_obj_2',
        type: 'hold_position',
        description: 'Hold USDT lending position for 14+ days',
        requirements: {
          symbol: 'USDT-VESU',
          minDuration: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
          minQuantity: 200,
        },
        progress: { current: 0, target: 1, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 800, description: '+800 XP for USDT lending mastery' },
      { type: 'coins', amount: 200, description: '200 AsTrade coins' },
      { type: 'nft', item: 'usdt_lender_badge', description: 'USDT Lender Badge NFT' }
    ],
    status: 'locked',
    prerequisites: ['starknet_001_genesis_supply'],
    difficulty: 'intermediate',
    estimatedTime: 20
  },
  {
    id: 'starknet_003_usdc_mega_pool',
    planetId: 6,
    chapter: 3,
    title: 'USD Coin Mega Pool',
    description: 'Master the largest USD Coin lending pool',
    storyText: 'The USD Coin pool is the largest with $5.26M total supplied, offering 4.94% APR at 64.31% utilization. This is a stable, high-volume opportunity for serious yield farmers.',
    objectives: [
      {
        id: 'starknet_003_obj_1',
        type: 'volume',
        description: 'Accumulate $1000+ in USDC lending volume',
        requirements: {
          symbol: 'USDC-VESU',
          minVolume: 1000,
        },
        progress: { current: 0, target: 1000, completed: false }
      },
      {
        id: 'starknet_003_obj_2',
        type: 'profit',
        description: 'Generate $50+ profit from USDC lending',
        requirements: {
          symbol: 'USDC-VESU',
          minProfit: 50,
        },
        progress: { current: 0, target: 50, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 1200, description: '+1200 XP for USDC mastery' },
      { type: 'coins', amount: 300, description: '300 AsTrade coins' },
      { type: 'title', item: 'USDC Master', description: 'Special title: USDC Master' }
    ],
    status: 'locked',
    prerequisites: ['starknet_002_tether_lending'],
    difficulty: 'advanced',
    estimatedTime: 30
  },
  {
    id: 'starknet_004_yield_optimization',
    planetId: 6,
    chapter: 4,
    title: 'Starknet Yield Optimization',
    description: 'Optimize yields across all Starknet pools',
    storyText: 'Master the art of yield optimization by strategically allocating across different pools based on utilization rates and APRs.',
    objectives: [
      {
        id: 'starknet_004_obj_1',
        type: 'trade',
        description: 'Supply to all 3 Starknet pools (Genesis, USDT, USDC)',
        requirements: {
          symbols: ['STARKNET-USDT', 'USDT-VESU', 'USDC-VESU'],
          side: 'buy',
          minQuantity: 100,
        },
        progress: { current: 0, target: 3, completed: false }
      },
      {
        id: 'starknet_004_obj_2',
        type: 'profit',
        description: 'Generate $200+ total profit from Starknet strategies',
        requirements: {
          symbol: 'STARKNET-COMBINED',
          minProfit: 200,
        },
        progress: { current: 0, target: 200, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 1500, description: '+1500 XP for yield optimization' },
      { type: 'coins', amount: 400, description: '400 AsTrade coins' },
      { type: 'nft', item: 'starknet_yield_master', description: 'Starknet Yield Master NFT' }
    ],
    status: 'locked',
    prerequisites: ['starknet_003_usdc_mega_pool'],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    id: 'starknet_005_starknet_champion',
    planetId: 6,
    chapter: 5,
    title: 'Starknet Ecosystem Champion',
    description: 'Become a champion of the Starknet ecosystem',
    storyText: 'You have mastered all aspects of Starknet yield farming. Now prove yourself as a true champion of the ecosystem with advanced strategies.',
    objectives: [
      {
        id: 'starknet_005_obj_1',
        type: 'volume',
        description: 'Accumulate $10000+ in total Starknet trading volume',
        requirements: {
          symbol: 'STARKNET-ALL',
          minVolume: 10000,
        },
        progress: { current: 0, target: 10000, completed: false }
      },
      {
        id: 'starknet_005_obj_2',
        type: 'profit',
        description: 'Generate $1000+ total profit from Starknet strategies',
        requirements: {
          symbol: 'STARKNET-ALL',
          minProfit: 1000,
        },
        progress: { current: 0, target: 1000, completed: false }
      },
      {
        id: 'starknet_005_obj_3',
        type: 'streak',
        description: 'Maintain active Starknet positions for 30+ consecutive days',
        requirements: {
          symbol: 'STARKNET-ALL',
          streakDays: 30,
          minQuantity: 500,
        },
        progress: { current: 0, target: 30, completed: false }
      }
    ],
    rewards: [
      { type: 'xp', amount: 3000, description: '+3000 XP for Starknet mastery' },
      { type: 'coins', amount: 750, description: '750 AsTrade coins' },
      { type: 'title', item: 'Starknet Champion', description: 'Ultimate title: Starknet Champion' },
      { type: 'nft', item: 'starknet_champion_crown', description: 'Exclusive Starknet Champion Crown NFT' }
    ],
    status: 'locked',
    prerequisites: ['starknet_004_yield_optimization'],
    difficulty: 'expert',
    estimatedTime: 90
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