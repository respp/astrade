import { apiClient } from '../client';
import { ApiResponse } from '../types';

// Types for planets API
export interface Planet {
  id: number;
  name: string;
  description: string;
  color: string;
  order_index: number;
  total_quizzes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  planet_id: number;
  name: string;
  title: string;
  slug: string;
  description: string;
  quiz_code: string;
  order_index: number;
  xp_reward: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  order_index: number;
}

export interface UserPlanetProgress {
  id: number;
  user_id: string;
  planet_id: number;
  completed_quizzes: number;
  total_score: number;
  is_completed: boolean;
  first_completed_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserQuizProgress {
  id: number;
  user_id: string;
  quiz_id: number;
  score: number;
  total_questions: number;
  is_completed: boolean;
  completion_percentage: number;
  attempts: number;
  first_attempt_at: string | null;
  last_attempt_at: string | null;
  best_score: number;
  created_at: string;
  updated_at: string;
}

export interface PlanetWithProgress extends Planet {
  user_progress: UserPlanetProgress | null;
  quizzes: QuizWithProgress[];
}

export interface QuizWithProgress extends Quiz {
  user_progress: UserQuizProgress | null;
  questions: Question[];
}

export interface QuizAnswerRequest {
  question_id: number;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  response_time_seconds?: number;
}

export interface QuizSubmissionRequest {
  quiz_id: number;
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerResult {
  question_id: number;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  correct_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  explanation: string | null;
}

export interface QuizSubmissionResponse {
  quiz_id: number;
  score: number;
  total_questions: number;
  completion_percentage: number;
  is_completed: boolean;
  answers: QuizAnswerResult[];
  previous_best_score: number;
  is_new_best: boolean;
}

export interface QuizStartResponse {
  quiz_attempt_id: number;
  quiz: Quiz;
  questions: Question[];
  started_at: string;
}

export interface PlanetProgressSummary {
  planet_id: number;
  planet_name: string;
  planet_color: string;
  completed_quizzes: number;
  total_quizzes: number;
  total_score: number;
  is_completed: boolean;
  completion_percentage: number;
  last_activity_at: string | null;
}

export interface UserProgressOverview {
  planets: PlanetProgressSummary[];
  total_planets_completed: number;
  total_quizzes_completed: number;
  overall_score: number;
  overall_completion_percentage: number;
}

export interface PlanetsListResponse {
  planets: PlanetWithProgress[];
  user_overview: UserProgressOverview | null;
}

export interface PlanetDetailResponse {
  planet: Planet;
  user_progress: UserPlanetProgress | null;
  quizzes: QuizWithProgress[];
}

export interface QuizDetailResponse {
  quiz: Quiz;
  planet: Planet;
  user_progress: UserQuizProgress | null;
  questions: Question[];
  can_start: boolean;
  can_retake: boolean;
}

export class PlanetsService {
  /**
   * Get all planets with optional user progress
   */
  async getAllPlanets(userId?: string): Promise<ApiResponse<PlanetsListResponse>> {
    if (userId) {
      apiClient.setUserId(userId);
    }
    return apiClient.get<PlanetsListResponse>('/planets/');
  }

  /**
   * Get detailed information about a specific planet
   */
  async getPlanetDetail(planetId: number, userId?: string): Promise<ApiResponse<PlanetDetailResponse>> {
    if (userId) {
      apiClient.setUserId(userId);
    }
    return apiClient.get<PlanetDetailResponse>(`/planets/${planetId}`);
  }

  /**
   * Get detailed information about a specific quiz
   */
  async getQuizDetail(quizId: number, userId?: string): Promise<ApiResponse<QuizDetailResponse>> {
    if (userId) {
      apiClient.setUserId(userId);
    }
    return apiClient.get<QuizDetailResponse>(`/planets/quiz/${quizId}`);
  }

  /**
   * Start a quiz session (requires authentication)
   */
  async startQuiz(quizId: number, userId: string): Promise<ApiResponse<QuizStartResponse>> {
    // Set user ID for authentication
    apiClient.setUserId(userId);
    return apiClient.post<QuizStartResponse>(`/planets/quiz/${quizId}/start`, {});
  }

  /**
   * Submit quiz answers (requires authentication)
   */
  async submitQuiz(
    submission: QuizSubmissionRequest,
    userId: string
  ): Promise<ApiResponse<QuizSubmissionResponse>> {
    // Set user ID for authentication
    apiClient.setUserId(userId);
    return apiClient.post<QuizSubmissionResponse>('/planets/quiz/submit', submission);
  }

  /**
   * Get user progress overview (requires authentication)
   */
  async getUserProgressOverview(userId: string): Promise<ApiResponse<UserProgressOverview>> {
    // Set user ID for authentication
    apiClient.setUserId(userId);
    return apiClient.get<UserProgressOverview>('/planets/progress/overview');
  }

  /**
   * Get quiz leaderboard
   */
  async getQuizLeaderboard(quizId: number, limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/planets/quiz/${quizId}/leaderboard?limit=${limit}`);
  }

  /**
   * Check planets service health
   */
  async checkHealth(): Promise<ApiResponse<{ status: string; planets_count: number; service: string }>> {
    return apiClient.get<{ status: string; planets_count: number; service: string }>('/planets/health');
  }
}

// Create and export service instance
export const planetsService = new PlanetsService(); 