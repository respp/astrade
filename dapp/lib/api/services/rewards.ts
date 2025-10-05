import { apiClient } from '../client';
import { API_CONFIG } from '../client';
import {
  DailyRewardStatus,
  ClaimRewardRequest,
  ClaimRewardResponse,
  Achievement,
  UserProfile,
  StreakInfo,
  ApiResponse
} from '../types';

export class RewardsService {
  /**
   * Obtiene el estado completo de las recompensas diarias del usuario
   */
  static async getDailyRewardsStatus(): Promise<ApiResponse<DailyRewardStatus>> {
    return apiClient.get<DailyRewardStatus>(API_CONFIG.ENDPOINTS.GET_DAILY_REWARDS_STATUS);
  }

  /**
   * Reclama la recompensa diaria del usuario
   */
  static async claimDailyReward(rewardType: 'daily_streak' | 'galaxy_explorer'): Promise<ApiResponse<ClaimRewardResponse>> {
    const request: ClaimRewardRequest = { reward_type: rewardType };
    return apiClient.post<ClaimRewardResponse>(API_CONFIG.ENDPOINTS.CLAIM_DAILY_REWARD, request);
  }

  /**
   * Registra actividad de exploración de galaxia
   */
  static async recordActivity(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(API_CONFIG.ENDPOINTS.RECORD_ACTIVITY);
  }

  /**
   * Obtiene los logros del usuario
   */
  static async getAchievements(): Promise<ApiResponse<{
    achievements: Achievement[];
    daily_streak: { current_streak: number; longest_streak: number };
    galaxy_streak: { current_streak: number; longest_streak: number };
    level: number;
    experience: number;
    total_trades: number;
  }>> {
    return apiClient.get(API_CONFIG.ENDPOINTS.GET_ACHIEVEMENTS);
  }

  /**
   * Obtiene información detallada de los streaks del usuario
   */
  static async getStreakInfo(): Promise<ApiResponse<StreakInfo>> {
    return apiClient.get<StreakInfo>(API_CONFIG.ENDPOINTS.GET_STREAK_INFO);
  }

  /**
   * Obtiene el perfil completo del usuario con información de recompensas
   */
  static async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(API_CONFIG.ENDPOINTS.GET_USER_PROFILE);
  }

  // Nuevo método para inicializar datos de recompensas
  static async initializeRewardsData(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      // Primero registrar actividad para crear el streak inicial
      await this.recordActivity();
      
      // Luego obtener el estado actualizado
      await this.getDailyRewardsStatus();
      await this.getUserProfile();
      
      return {
        success: true,
        data: { success: true, message: 'Datos inicializados correctamente' },
        message: 'Datos inicializados correctamente',
        error: undefined,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        data: { success: false, message: 'Error al inicializar datos' },
        message: 'Error al inicializar datos',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      };
    }
  }
} 