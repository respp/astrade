import { ApiResponse } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000'; // Removed trailing slash
const API_VERSION = 'api/v1';

export const API_CONFIG = {
  BASE_URL: `${API_BASE_URL}/${API_VERSION}`,
  ENDPOINTS: {
    REGISTER_USER: '/users/register',
    GET_USER: '/users/{user_id}',
    GET_USER_BY_CAVOS: '/users/cavos/{cavos_user_id}',
    SETUP_EXTENDED: '/users/{user_id}/extended/setup',
    GET_EXTENDED_STATUS: '/users/{user_id}/extended/status',
    GET_INTEGRATION_STATUS: '/users/integration/status',
    GET_BALANCE: '/account/balance',

    // Future endpoints
    GET_POSITIONS: '/account/positions',
    GET_ACCOUNT_SUMMARY: '/account/summary',
    GET_ACCOUNT_FEES: '/account/fees',
    UPDATE_LEVERAGE: '/account/leverage',
    GET_LEVERAGE: '/account/leverage',
    GET_LIQUIDATION_PRICE: '/account/liquidation-price',
    GET_PNL_HISTORY: '/account/pnl-history',
    GET_MARGIN_REQUIREMENT: '/account/margin-requirement',
    GET_ACCOUNT_STATS: '/account/stats',
    UPDATE_POSITION_MODE: '/account/position-mode',
    GET_ACCOUNT_SETTINGS: '/account/settings',
    UPDATE_ACCOUNT_SETTINGS: '/account/settings',
    CREATE_ORDER: '/orders',
    GET_ORDERS: '/orders',
      GET_ORDER_HISTORY: '/orders/history',
    GET_ACTIVE_ORDERS: '/orders/active',
    CANCEL_ORDER: '/orders/{order_id}',
    GET_TRADES: '/orders/trades',
    SUBMIT_TWAP: '/orders/twap',
    GET_ORDER: '/orders/{order_id}',
    MODIFY_ORDER: '/orders/{order_id}',
    GET_MARKETS: '/markets',
    GET_MARKET_STATS: '/markets/stats',
    GET_TRENDING_MARKETS: '/markets/trending',

    // Stark Trading endpoints
    STARK_CREATE_ORDER: '/stark/orders',
    STARK_CANCEL_ORDER: '/stark/orders/{order_external_id}',
    STARK_CANCEL_ORDER_POST: '/stark/orders/cancel',
    STARK_GET_ACCOUNT: '/stark/account',
    STARK_INITIALIZE_CLIENT: '/stark/client/initialize',
    STARK_HEALTH: '/stark/health',

    // Planets endpoints
    GET_PLANETS: '/planets/',
    GET_PLANET_DETAIL: '/planets/{planet_id}',
    GET_QUIZ_DETAIL: '/planets/quiz/{quiz_id}',
    START_QUIZ: '/planets/quiz/{quiz_id}/start',
    SUBMIT_QUIZ: '/planets/quiz/submit',
    GET_USER_PROGRESS: '/planets/progress/overview',
    GET_QUIZ_LEADERBOARD: '/planets/quiz/{quiz_id}/leaderboard',
    PLANETS_HEALTH: '/planets/health',
    
    // Stark Price Streaming endpoints
    STARK_CURRENT_PRICE: '/stark/stream/prices/{symbol}/current',
    STARK_START_STREAMING: '/stark/stream/start/{symbol}',
    
    // Rewards System endpoints
    GET_DAILY_REWARDS_STATUS: '/rewards/daily-status',
    CLAIM_DAILY_REWARD: '/rewards/claim-daily',
    RECORD_ACTIVITY: '/rewards/record-activity',
    GET_ACHIEVEMENTS: '/rewards/achievements',
    GET_STREAK_INFO: '/rewards/streak-info',
    GET_USER_PROFILE: '/rewards/profile'
  }
};

// Helper function to replace URL parameters
export const buildUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value);
  });
  return url;
};

import { CONFIG } from '../config';

// Enable mock mode when backend is not available
const MOCK_MODE = CONFIG.MOCK_MODE;

// Custom error class for API errors
export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

interface ApiClientConfig {
  baseURL: string;
  apiVersion: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;
  private userId: string | null = null;

  constructor(baseURL: string = API_BASE_URL, apiVersion: string = API_VERSION) {
    this.config = {
      baseURL,
      apiVersion,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Clear authentication token
  clearAuthToken() {
    this.authToken = null;
  }

  // Set user ID for API requests
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Clear user ID
  clearUserId() {
    this.userId = null;
  }

  // Get user ID
  getUserId(): string | null {
    return this.userId;
  }

  // Get headers with authentication and user ID
  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    if (this.userId) {
      headers['X-User-ID'] = this.userId;
      console.log('🔑 Setting X-User-ID header:', this.userId);
    } else {
      console.warn('⚠️ No userId set for X-User-ID header');
    }
    return headers;
  }

  // Mock responses for development
  private getMockResponse(endpoint: string, method: string, data?: any): any {
    console.log(`🔄 Mock API: ${method} ${endpoint}`);
    
    // Rewards System Mock Responses
    if (endpoint.includes('/rewards/daily-status')) {
      return {
        success: true,
        data: {
          can_claim: true,
          current_streak: 2,
          longest_streak: 5,
          next_reward_in: "19h 37m",
          today_reward: {
            day: 3,
            amount: 100,
            currency: "credits",
            type: "mystery_nft",
            description: "Día 3 - NFT Misterioso"
          },
          week_rewards: [
            {
              day: 1,
              reward: { amount: 50, currency: "credits", type: "credits" },
              is_claimed: true,
              is_today: false,
              is_locked: false,
              amount: 50
            },
            {
              day: 2,
              reward: { amount: 75, currency: "credits", type: "credits" },
              is_claimed: true,
              is_today: false,
              is_locked: false,
              amount: 75
            },
            {
              day: 3,
              reward: { amount: 100, currency: "credits", type: "mystery_nft" },
              is_claimed: false,
              is_today: true,
              is_locked: false,
              amount: 100
            },
            {
              day: 4,
              reward: { amount: 125, currency: "credits", type: "credits" },
              is_claimed: false,
              is_today: false,
              is_locked: true,
              amount: 125
            },
            {
              day: 5,
              reward: { amount: 150, currency: "credits", type: "credits" },
              is_claimed: false,
              is_today: false,
              is_locked: true,
              amount: 150
            },
            {
              day: 6,
              reward: { amount: 200, currency: "credits", type: "credits" },
              is_claimed: false,
              is_today: false,
              is_locked: true,
              amount: 200
            },
            {
              day: 7,
              reward: { amount: 500, currency: "credits", type: "premium_nft" },
              is_claimed: false,
              is_today: false,
              is_locked: true,
              amount: 500
            }
          ],
          galaxy_explorer_days: 15
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/rewards/claim-daily') && method === 'POST') {
      return {
        success: true,
        data: {
          success: true,
          reward_data: {
            amount: 100,
            currency: "credits",
            type: "mystery_nft",
            description: "Day 3 - Mystery NFT"
          },
          new_streak: 3,
          message: "Reward claimed! +100 experience (Level 2)"
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/rewards/record-activity') && method === 'POST') {
      return {
        success: true,
        data: {
          success: true,
          message: "Activity recorded"
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/rewards/achievements')) {
      return {
        success: true,
        data: {
          achievements: [
            {
              id: "week_warrior",
              name: "Weekly Warrior",
              description: "Complete 7 consecutive days of login",
              unlocked: false,
              progress: 42
            },
            {
              id: "galaxy_master",
              name: "Galaxy Master",
              description: "Explore the galaxy for 30 consecutive days",
              unlocked: false,
              progress: 50
            },
            {
              id: "trade_master",
              name: "Trading Master",
              description: "Complete 100 successful trades",
              unlocked: true,
              progress: 100
            }
          ],
          daily_streak: {
            current_streak: 3,
            longest_streak: 5
          },
          galaxy_streak: {
            current_streak: 15,
            longest_streak: 15
          },
          level: 2,
          experience: 1250,
          total_trades: 45
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/rewards/profile')) {
      return {
        success: true,
        data: {
          user_id: "mock-user-123",
          display_name: "Space Trader",
          avatar_url: null,
          level: 2,
          experience: 1250,
          total_trades: 45,
          total_pnl: 1250.50,
          achievements: [
            {
              id: "trade_master",
              name: "Trading Master",
              unlocked: true,
              progress: 100
            }
          ],
          streaks: {
            daily_login: {
              current_streak: 3,
              longest_streak: 5,
              last_activity_date: "2025-07-28"
            },
            galaxy_explorer: {
              current_streak: 15,
              longest_streak: 15,
              last_activity_date: "2025-07-28"
            }
          },
          recent_rewards: [
            {
              date: "2025-07-28",
              type: "daily_streak",
              reward: {
                amount: 100,
                currency: "credits",
                type: "mystery_nft"
              },
              streak_count: 3
            }
          ],
          created_at: "2025-07-20T10:00:00Z",
          updated_at: "2025-07-28T23:35:42Z"
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/rewards/streak-info')) {
      return {
        success: true,
        data: {
          daily_login_streak: 3,
          daily_login_longest: 5,
          galaxy_explorer_days: 15,
          can_claim_today: true,
          next_reward_in: "19h 37m"
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/users/') && method === 'POST') {
      // Mock user creation
      return {
        success: true,
        data: {
          user_id: `mock-user-${Date.now()}`,
          created_at: new Date().toISOString()
        },
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/markets/')) {
      // Mock market data
      const mockMarkets = [
        {
          symbol: 'BTCUSD',
          baseAsset: 'BTC',
          quoteAsset: 'USD',
          lastPrice: 43250,
          priceChangePercent24h: 2.3,
          volume24h: 1250000,
          high24h: 44000,
          low24h: 42500,
          openPrice24h: 42800,
          status: 'active'
        },
        {
          symbol: 'ETHUSD',
          baseAsset: 'ETH',
          quoteAsset: 'USD',
          lastPrice: 2890,
          priceChangePercent24h: 5.7,
          volume24h: 850000,
          high24h: 2950,
          low24h: 2750,
          openPrice24h: 2800,
          status: 'active'
        }
      ];
      
      return {
        success: true,
        data: mockMarkets,
        timestamp: Date.now()
      };
    }
    
    if (endpoint.includes('/orders/') && method === 'POST') {
      // Mock order placement
      return {
        success: true,
        data: {
          id: `mock-order-${Date.now()}`,
          status: 'pending',
          symbol: data?.symbol || 'BTCUSD',
          side: data?.side || 'buy',
          type: data?.type || 'market',
          quantity: data?.quantity || 0.001,
          created_at: new Date().toISOString()
        },
        timestamp: Date.now()
      };
    }
    
    // Default mock response
    return {
      success: true,
      data: { message: 'Mock response', endpoint, method },
      timestamp: Date.now()
    };
  }

  // Get full API URL including version
  private getFullUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Use the new API_CONFIG base URL (already includes /api/v1)
    return `${API_CONFIG.BASE_URL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;
  }

  // Make HTTP request with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // If in mock mode and backend is not available, return mock data
    if (MOCK_MODE) {
      try {
        // Try to reach the backend first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const healthUrl = `${this.config.baseURL}/health`;
        console.log('🏥 Checking health at:', healthUrl);
        
        const testResponse = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal
        }).then(response => {
          clearTimeout(timeoutId);
          return response;
        }).catch(() => {
          clearTimeout(timeoutId);
          return null;
        });
        
        if (!testResponse) {
          console.log('⚠️ Backend not available, using mock data');
          // Backend not available, use mock
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
          return this.getMockResponse(endpoint, options.method || 'GET', options.body);
        }
      } catch (error) {
        console.log('⚠️ Health check failed, using mock data');
        return this.getMockResponse(endpoint, options.method || 'GET', options.body);
      }
    }

    // Check if endpoint is already a full URL or just a path
    const url = endpoint.startsWith('http') ? endpoint : this.getFullUrl(endpoint);


    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData = {};
      let errorText = '';
      
      try {
        // Try to parse as JSON first
        errorData = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to get the response as text
        try {
          errorText = await response.text();
          console.log('📄 Raw error response:', errorText);
          
          // Try to parse the text as JSON (sometimes the response is valid JSON but with wrong content-type)
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            // If all parsing fails, create a basic error structure
            errorData = {
              message: errorText || `Request failed with status ${response.status}`,
              status: response.status
            };
          }
        } catch (textError) {
          // If even text parsing fails, create a basic error structure
          errorData = {
            message: `Request failed with status ${response.status}`,
            status: response.status
          };
        }
      }
      
      console.error('❌ API request failed:', {
        url,
        status: response.status,
        error: errorData,
        rawText: errorText,
        errorDataKeys: Object.keys(errorData),
        errorDataStringified: JSON.stringify(errorData, null, 2)
      });
      
      // Extract error code and message from the backend response structure
      let errorCode = `HTTP_${response.status}`;
      let errorMessage = `Request failed with status ${response.status}`;
      
      // Check for the specific backend error structure: { status: "ERROR", error: { code: 1140, message: "..." } }
      if ((errorData as any).status === 'ERROR' && (errorData as any).error) {
        errorCode = (errorData as any).error.code?.toString() || errorCode;
        errorMessage = (errorData as any).error.message || errorMessage;
        console.log('🎯 Found ERROR status structure:', { errorCode, errorMessage });
      } else if ((errorData as any).error) {
        // Alternative structure: { error: { code: 1140, message: "..." } }
        errorCode = (errorData as any).error.code?.toString() || errorCode;
        errorMessage = (errorData as any).error.message || errorMessage;
        console.log('🎯 Found error structure:', { errorCode, errorMessage });
      } else if ((errorData as any).code) {
        // Direct structure: { code: 1140, message: "..." }
        errorCode = (errorData as any).code.toString();
        errorMessage = (errorData as any).message || errorMessage;
        console.log('🎯 Found direct code structure:', { errorCode, errorMessage });
      } else if ((errorData as any).message) {
        errorMessage = (errorData as any).message;
        console.log('🎯 Found message structure:', { errorCode, errorMessage });
      } else if ((errorData as any).detail) {
        // Check if there's a detail field that might contain the original error
        errorMessage = (errorData as any).detail;
        console.log('🎯 Found detail structure:', { errorCode, errorMessage });
        
        // Try to extract error code from detail if it contains JSON
        try {
          const detailMatch = (errorData as any).detail.match(/\{.*\}/);
          if (detailMatch) {
            const detailJson = JSON.parse(detailMatch[0]);
            if (detailJson.error && detailJson.error.code) {
              errorCode = detailJson.error.code.toString();
              errorMessage = detailJson.error.message || errorMessage;
              console.log('🎯 Extracted from detail JSON:', { errorCode, errorMessage });
            }
          }
        } catch (detailParseError) {
          console.log('⚠️ Could not parse detail as JSON');
        }
      }
      
      throw new ApiError(
        errorCode,
        errorMessage,
        errorData
      );
    }

    const data = await response.json();
    // Transform backend response format to frontend format
    // Handle different response formats from different endpoints
    let transformedResponse: ApiResponse<T>;
    
    if (data.success === true) {
      // Standard API response format with success wrapper
      transformedResponse = {
        success: true,
        data: data.data as T,
        message: data.message,
        error: data.error,
        timestamp: typeof data.timestamp === 'string' 
          ? new Date(data.timestamp).getTime() 
          : data.timestamp
      };
    } else if (data.status === 'ok') {
      // Alternative API response format with status wrapper
      transformedResponse = {
        success: true,
        data: data.data as T,
        message: data.message,
        error: data.error,
        timestamp: typeof data.timestamp === 'string' 
          ? new Date(data.timestamp).getTime() 
          : data.timestamp
      };
    } else if (data.planets || data.planet || data.quiz || data.quiz_id || data.completion_percentage !== undefined) {
      // Direct response from planets/quiz endpoints (no status wrapper)
      // Includes quiz submission responses which have quiz_id, completion_percentage, etc.
      transformedResponse = {
        success: true,
        data: data as T,
        message: undefined,
        error: undefined,
        timestamp: Date.now()
      };
    } else {
      // Unknown format, assume failure
      transformedResponse = {
        success: false,
        data: null as any,
        message: data.message,
        error: data.error || data,
        timestamp: Date.now()
      };
    }

    return transformedResponse;
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const fullUrl = this.getFullUrl(endpoint);
    const url = new URL(fullUrl);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }
    
    const finalUrl = fullUrl + url.search;
    return this.request<T>(finalUrl);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const requestData = data ? { ...data } : {};
    
    // Add user_id to request body if available and not already present
    if (this.userId && !requestData.user_id) {
      requestData.user_id = this.userId;
    }
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: Object.keys(requestData).length > 0 ? JSON.stringify(requestData) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const requestData = data ? { ...data } : {};
    
    // Add user_id to request body if available and not already present
    if (this.userId && !requestData.user_id) {
      requestData.user_id = this.userId;
    }
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: Object.keys(requestData).length > 0 ? JSON.stringify(requestData) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const requestData = data ? { ...data } : {};
    
    // Add user_id to request body if available and not already present
    if (this.userId && !requestData.user_id) {
      requestData.user_id = this.userId;
    }
    
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: Object.keys(requestData).length > 0 ? JSON.stringify(requestData) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(); 