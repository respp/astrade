import { useState, useEffect, useCallback, useRef } from 'react';
import { RewardsService } from '../api/services/rewards';
import { apiClient } from '../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DailyRewardStatus, 
  ClaimRewardResponse, 
  UserProfile, 
  Achievement,
  StreakInfo 
} from '../api/types';

// Simple global state to prevent duplicate requests
let globalState = {
  isLoading: false,
  lastFetch: 0,
  data: {
    dailyRewardsStatus: null as DailyRewardStatus | null,
    userProfile: null as UserProfile | null,
    achievements: [] as Achievement[],
    streakInfo: null as StreakInfo | null
  }
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

// Function to reset global state if it gets stuck
const resetGlobalState = () => {
  globalState.isLoading = false;
  globalState.lastFetch = 0;
  globalState.data = {
    dailyRewardsStatus: null,
    userProfile: null,
    achievements: [],
    streakInfo: null
  };
};

export const useRewards = () => {
  const { backendUserId } = useAuth();
  const [dailyRewardsStatus, setDailyRewardsStatus] = useState<DailyRewardStatus | null>(globalState.data.dailyRewardsStatus);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(globalState.data.userProfile);
  const [achievements, setAchievements] = useState<Achievement[]>(globalState.data.achievements);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(globalState.data.streakInfo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasInitialized = useRef(false);
  const componentId = useRef(Math.random().toString(36).slice(2));



  // Check if cache is fresh
  const isCacheFresh = () => {
    return Date.now() - globalState.lastFetch < CACHE_DURATION;
  };

  // Update local state from global state
  const syncWithGlobalState = useCallback(() => {
    setDailyRewardsStatus(globalState.data.dailyRewardsStatus);
    setUserProfile(globalState.data.userProfile);
    setAchievements(globalState.data.achievements);
    setStreakInfo(globalState.data.streakInfo);
  }, []);

  // Load all data with caching
  const loadAllData = useCallback(async (forceRefresh = false) => {
    // If there's already a request in progress, wait for it to complete
    if (globalState.isLoading) {
      // Wait for the request to complete (poll every 100ms)
      while (globalState.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      syncWithGlobalState();
      return;
    }

    // Use cache if fresh and not forcing refresh
    if (!forceRefresh && isCacheFresh() && globalState.data.dailyRewardsStatus) {
      syncWithGlobalState();
      return;
    }

    // Set a timeout to prevent hanging requests
    const timeoutId = setTimeout(() => {
      console.error('⏰ Request timeout - forcing cleanup');
      globalState.isLoading = false;
      setLoading(false);
      setError('Request timeout - please try again');
    }, 10000); // 10 second timeout

    try {
      globalState.isLoading = true;
      setLoading(true);
      setError(null);
      
      // Configure user ID
      if (backendUserId) {
        apiClient.setUserId(backendUserId);
      } else {
        const fallbackUserId = 'fb16ec78-ff70-4895-9ace-92a1d8202fdb';
        apiClient.setUserId(fallbackUserId);
      }
      
      // Make all requests in parallel with individual error handling
      const [rewardsResponse, profileResponse, achievementsResponse, streakResponse] = await Promise.all([
        RewardsService.getDailyRewardsStatus().catch(err => {
          console.error('❌ getDailyRewardsStatus failed:', err);
          return { success: false, error: err.message };
        }),
        RewardsService.getUserProfile().catch(err => {
          console.error('❌ getUserProfile failed:', err);
          return { success: false, error: err.message };
        }),
        RewardsService.getAchievements().catch(err => {
          console.error('❌ getAchievements failed:', err);
          return { success: false, error: err.message };
        }),
        RewardsService.getStreakInfo().catch(err => {
          console.error('❌ getStreakInfo failed:', err);
          return { success: false, error: err.message };
        })
      ]);
      
      // Clear timeout since requests completed
      clearTimeout(timeoutId);
      
      // Update global state
      if (rewardsResponse.success) {
        if (!(rewardsResponse as any).data || Object.keys((rewardsResponse as any).data).length === 0) {
          await RewardsService.initializeRewardsData();
          const updatedResponse = await RewardsService.getDailyRewardsStatus();
          if (updatedResponse.success) {
            globalState.data.dailyRewardsStatus = updatedResponse.data;
          }
        } else {
          globalState.data.dailyRewardsStatus = (rewardsResponse as any).data;
        }
      } else {
        console.warn('⚠️ Rewards response failed:', (rewardsResponse as any).error);
      }
      
      if (profileResponse.success) {
        globalState.data.userProfile = (profileResponse as any).data;
      } else {
        console.warn('⚠️ Profile response failed:', (profileResponse as any).error);
      }
      
      if (achievementsResponse.success) {
        globalState.data.achievements = (achievementsResponse as any).data.achievements;
      } else {
        console.warn('⚠️ Achievements response failed:', (achievementsResponse as any).error);
      }
      
      if (streakResponse.success) {
        globalState.data.streakInfo = (streakResponse as any).data;
      } else {
        console.warn('⚠️ Streak response failed:', (streakResponse as any).error);
      }
      
      globalState.lastFetch = Date.now();
      syncWithGlobalState();
      
    } catch (err) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('🚨 API request failed:', errorMessage);
      console.error('🚨 Full error:', err);
      
      // Force cleanup on error
      globalState.isLoading = false;
      setLoading(false);
    } finally {
      // Ensure cleanup always happens
      globalState.isLoading = false;
      setLoading(false);
    }
  }, [backendUserId, syncWithGlobalState]);

  // Load daily rewards status
  const loadDailyRewardsStatus = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Claim daily reward
  const claimDailyReward = useCallback(async (rewardType: 'daily_streak' | 'galaxy_explorer'): Promise<ClaimRewardResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await RewardsService.claimDailyReward(rewardType);
      if (response.success) {
        // Force refresh after claiming
        await loadAllData(true);
        return response.data;
      } else {
        setError(response.message || 'Error claiming reward');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Record activity
  const recordActivity = useCallback(async () => {
    try {
      const response = await RewardsService.recordActivity();
      if (response.success) {
        // Force refresh after recording activity
        await loadAllData(true);
      }
      return response.success;
    } catch (err) {
      console.error('Error recording activity:', err);
      return false;
    }
  }, [loadAllData]);

  // Individual loaders - now all use cached approach
  const loadUserProfile = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const loadAchievements = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const loadStreakInfo = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data only once per component instance
  useEffect(() => {
    if (backendUserId && !hasInitialized.current) {
      hasInitialized.current = true;
      loadAllData();
    }
  }, [backendUserId, loadAllData]);

  // Sync with global state on mount
  useEffect(() => {
    if (globalState.data.dailyRewardsStatus) {
      syncWithGlobalState();
    }
  }, [syncWithGlobalState]);

  return {
    // Estado
    dailyRewardsStatus,
    userProfile,
    achievements,
    streakInfo,
    loading,
    error,
    
    // Acciones
    loadDailyRewardsStatus,
    claimDailyReward,
    recordActivity,
    loadUserProfile,
    loadAchievements,
    loadStreakInfo,
    clearError,
    resetGlobalState
  };
}; 