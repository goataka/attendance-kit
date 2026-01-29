import { ClockRecord, ClockInOutRequest, ClockInOutResponse, RecordsFilter } from '../types';

const DEFAULT_DEV_BACKEND_URL = 'http://localhost:3000';
const API_BASE_PATH = '/api';

const normalizeBaseUrl = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.trim();
  if (!trimmedBaseUrl) {
    return trimmedBaseUrl;
  }

  if (trimmedBaseUrl.endsWith(`${API_BASE_PATH}/`)) {
    return trimmedBaseUrl.slice(0, -(API_BASE_PATH.length + 1));
  }

  if (trimmedBaseUrl.endsWith(API_BASE_PATH)) {
    return trimmedBaseUrl.slice(0, -API_BASE_PATH.length);
  }

  return trimmedBaseUrl;
};

export const resolveBackendUrl = (
  envUrl: string | undefined = import.meta.env.VITE_BACKEND_URL,
  isDev: boolean = import.meta.env.DEV,
  windowOrigin: string | undefined =
    typeof window === 'undefined' ? undefined : window.location.origin,
): string => {
  if (envUrl?.trim()) {
    return normalizeBaseUrl(envUrl);
  }

  const resolvedUrl = isDev || !windowOrigin ? DEFAULT_DEV_BACKEND_URL : windowOrigin;
  return normalizeBaseUrl(resolvedUrl);
};

const BACKEND_URL = resolveBackendUrl();

// Token storage key
const TOKEN_STORAGE_KEY = 'attendance-kit-token';

// Get stored token
const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Store token
const storeToken = (token: string): void => {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

// ログインしてJWTトークンを取得
const login = async (userId: string, password: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}${API_BASE_PATH}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const token = data.accessToken;
    
    // Store token for future use
    if (token) {
      storeToken(token);
    }
    
    return token;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

export const api = {
  // Clock in or out
  clockInOut: async (request: ClockInOutRequest): Promise<ClockInOutResponse> => {
    try {
      // まずログインしてトークンを取得
      const token = await login(request.userId, request.password);
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication failed',
        };
      }

      // トークンを使ってClock APIを呼び出し
      const response = await fetch(
        `${BACKEND_URL}${API_BASE_PATH}/clock/${request.type === 'clock-in' ? 'in' : 'out'}`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: 'Remote',
          deviceId: 'web-client',
        }),
      },
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Failed to process request',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        record: {
          id: data.id,
          userId: data.userId,
          timestamp: data.timestamp,
          type: request.type,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  },

  // Get records with optional filtering
  getRecords: async (filter?: RecordsFilter): Promise<ClockRecord[]> => {
    try {
      // Get stored token
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token available');
        return [];
      }

      const params = new URLSearchParams();
      
      if (filter?.userId) {
        params.append('userId', filter.userId);
      }
      
      if (filter?.type && filter.type !== 'all') {
        params.append('type', filter.type);
      }
      
      if (filter?.startDate) {
        params.append('startDate', filter.startDate);
      }
      
      if (filter?.endDate) {
        params.append('endDate', filter.endDate);
      }

      const url = `${BACKEND_URL}${API_BASE_PATH}/clock/records${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      
      interface ClockRecordResponse {
        id: string;
        userId: string;
        timestamp: string;
        type: string;
      }
      
      return data.map((record: ClockRecordResponse) => ({
        id: record.id,
        userId: record.userId,
        timestamp: record.timestamp,
        type: record.type,
      }));
    } catch (error) {
      console.error('Failed to fetch records:', error);
      return [];
    }
  },
};
