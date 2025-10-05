import { 
  StoryMission, 
  MissionObjective, 
  UserMissionProgress, 
  TradingEvent,
  MissionEvaluator,
  ObjectiveRequirements 
} from './types';
import { Order, Trade, Position } from '../api/types';

export class MissionEngine implements MissionEvaluator {
  private userProgress: Map<string, UserMissionProgress> = new Map();
  private activeMissions: Map<string, StoryMission> = new Map();

  // Initialize a mission for a user
  startMission(userId: string, mission: StoryMission): UserMissionProgress {
    const progress: UserMissionProgress = {
      userId,
      missionId: mission.id,
      status: 'in_progress',
      startedAt: Date.now(),
      objectives: {},
      currentObjectiveIndex: 0,
      metadata: {}
    };

    // Initialize objective progress
    mission.objectives.forEach(objective => {
      progress.objectives[objective.id] = {
        progress: 0,
        completed: false
      };
    });

    this.userProgress.set(`${userId}-${mission.id}`, progress);
    this.activeMissions.set(mission.id, mission);
    
    return progress;
  }

  // Process a trading event and update relevant mission progress
  processEvent(userId: string, event: TradingEvent): UserMissionProgress[] {
    const updatedProgress: UserMissionProgress[] = [];

    // Find all active missions for this user
    for (const [key, progress] of this.userProgress.entries()) {
      if (progress.userId === userId && progress.status === 'in_progress') {
        const mission = this.activeMissions.get(progress.missionId);
        if (mission) {
          const updated = this.evaluateProgress(mission, progress, event);
          if (updated !== progress) {
            this.userProgress.set(key, updated);
            updatedProgress.push(updated);
          }
        }
      }
    }

    return updatedProgress;
  }

  // Evaluate progress for a specific mission
  evaluateProgress(mission: StoryMission, userProgress: UserMissionProgress, tradingData: TradingEvent): UserMissionProgress {
    const updated = { ...userProgress };
    let progressMade = false;

    // Check each objective
    mission.objectives.forEach(objective => {
      const objectiveProgress = updated.objectives[objective.id];
      if (!objectiveProgress.completed) {
        const newProgress = this.evaluateObjective(objective, objectiveProgress, tradingData);
        if (newProgress.progress > objectiveProgress.progress) {
          updated.objectives[objective.id] = newProgress;
          progressMade = true;

          // Check if objective is now completed
          if (newProgress.progress >= objective.progress.target) {
            updated.objectives[objective.id].completed = true;
            updated.objectives[objective.id].completedAt = Date.now();
          }
        }
      }
    });

    // Check if entire mission is completed
    if (this.checkCompletion(mission, updated)) {
      updated.status = 'completed';
      updated.completedAt = Date.now();
    }

    return progressMade ? updated : userProgress;
  }

  // Evaluate a specific objective against trading data
  private evaluateObjective(
    objective: MissionObjective, 
    currentProgress: { progress: number; completed: boolean }, 
    event: TradingEvent
  ): { progress: number; completed: boolean; completedAt?: number } {
    const req = objective.requirements;
    let newProgress = currentProgress.progress;

    switch (objective.type) {
      case 'trade':
        newProgress = this.evaluateTradeObjective(req, currentProgress, event);
        break;
      case 'volume':
        newProgress = this.evaluateVolumeObjective(req, currentProgress, event);
        break;
      case 'profit':
        newProgress = this.evaluateProfitObjective(req, currentProgress, event);
        break;
      // Add more objective types as needed
    }

    return {
      progress: newProgress,
      completed: newProgress >= objective.progress.target,
      completedAt: newProgress >= objective.progress.target ? Date.now() : undefined
    };
  }

  // Evaluate trade-based objectives
  private evaluateTradeObjective(
    requirements: ObjectiveRequirements,
    currentProgress: { progress: number; completed: boolean },
    event: TradingEvent
  ): number {
    // Only count order_filled events for trade objectives
    if (event.type !== 'order_filled') return currentProgress.progress;

    const order = event.data as Order;
    
    // Check if order matches requirements
    if (requirements.symbol && order.symbol !== requirements.symbol) return currentProgress.progress;
    if (requirements.side && order.side !== requirements.side) return currentProgress.progress;
    if (requirements.orderType && order.type !== requirements.orderType) return currentProgress.progress;
    if (requirements.minQuantity && order.quantity < requirements.minQuantity) return currentProgress.progress;
    if (requirements.maxQuantity && order.quantity > requirements.maxQuantity) return currentProgress.progress;
    if (requirements.minPrice && order.price && order.price < requirements.minPrice) return currentProgress.progress;
    if (requirements.maxPrice && order.price && order.price > requirements.maxPrice) return currentProgress.progress;

    // Trade matches criteria, increment progress
    return currentProgress.progress + 1;
  }

  // Evaluate volume-based objectives
  private evaluateVolumeObjective(
    requirements: ObjectiveRequirements,
    currentProgress: { progress: number; completed: boolean },
    event: TradingEvent
  ): number {
    if (event.type !== 'order_filled') return currentProgress.progress;

    const order = event.data as Order;
    const volume = order.quantity * (order.price || 0);

    // Check symbol filter
    if (requirements.symbol && order.symbol !== requirements.symbol) return currentProgress.progress;

    // Add to volume progress
    return currentProgress.progress + volume;
  }

  // Evaluate profit-based objectives
  private evaluateProfitObjective(
    requirements: ObjectiveRequirements,
    currentProgress: { progress: number; completed: boolean },
    event: TradingEvent
  ): number {
    if (event.type !== 'profit_realized' && event.type !== 'loss_realized') return currentProgress.progress;

    const trade = event.data as Trade;
    
    // Check symbol filter
    if (requirements.symbol && trade.symbol !== requirements.symbol) return currentProgress.progress;

    // For profit objectives, only count positive PnL
    const pnl = event.data.pnl || 0;
    if (pnl > 0) {
      return currentProgress.progress + pnl;
    }

    return currentProgress.progress;
  }

  // Check if mission is completed
  checkCompletion(mission: StoryMission, userProgress: UserMissionProgress): boolean {
    return mission.objectives.every(objective => 
      userProgress.objectives[objective.id]?.completed === true
    );
  }

  // Calculate rewards for completed mission
  calculateRewards(mission: StoryMission): { xp: number; coins: number; items: string[] } {
    let xp = 0;
    let coins = 0;
    const items: string[] = [];

    mission.rewards.forEach(reward => {
      switch (reward.type) {
        case 'xp':
          xp += reward.amount || 0;
          break;
        case 'coins':
          coins += reward.amount || 0;
          break;
        case 'nft':
        case 'title':
        case 'unlock':
          if (reward.item) items.push(reward.item);
          break;
      }
    });

    return { xp, coins, items };
  }

  // Get user's progress for a specific mission
  getUserProgress(userId: string, missionId: string): UserMissionProgress | null {
    return this.userProgress.get(`${userId}-${missionId}`) || null;
  }

  // Get all active missions for a user
  getUserActiveMissions(userId: string): UserMissionProgress[] {
    const activeMissions: UserMissionProgress[] = [];
    
    for (const progress of this.userProgress.values()) {
      if (progress.userId === userId && progress.status === 'in_progress') {
        activeMissions.push(progress);
      }
    }
    
    return activeMissions;
  }

  // Get all completed missions for a user
  getUserCompletedMissions(userId: string): UserMissionProgress[] {
    const completedMissions: UserMissionProgress[] = [];
    
    for (const progress of this.userProgress.values()) {
      if (progress.userId === userId && progress.status === 'completed') {
        completedMissions.push(progress);
      }
    }
    
    return completedMissions;
  }

  // Create trading event from order data
  static createTradeEvent(order: Order): TradingEvent {
    return {
      type: order.status === 'filled' ? 'order_filled' : 'order_placed',
      timestamp: Date.now(),
      symbol: order.symbol,
      data: order
    };
  }

  // Create trading event from position data
  static createPositionEvent(position: Position, eventType: 'opened' | 'closed'): TradingEvent {
    return {
      type: eventType === 'opened' ? 'position_opened' : 'position_closed',
      timestamp: Date.now(),
      symbol: position.symbol,
      data: position
    };
  }

  // Create PnL event
  static createPnLEvent(symbol: string, pnl: number): TradingEvent {
    return {
      type: pnl > 0 ? 'profit_realized' : 'loss_realized',
      timestamp: Date.now(),
      symbol,
      data: { pnl }
    };
  }
}

// Global mission engine instance
export const missionEngine = new MissionEngine(); 