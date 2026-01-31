import { ClockRecord, ClockInOutRequest, ClockInOutResponse, RecordsFilter } from '../types';
import { mockApi } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

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
const TOKEN_STORAGE_KEY = 'accessToken';

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

// Clear stored token
const clearToken = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
};

// ログインしてJWTトークンを取得（内部用・トークンは保存しない）
const loginInternal = async (userId: string, password: string): Promise<string | null> => {
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
    return data.accessToken;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

export const api = {
  // ログイン（公開API・トークンを保存）
  login: async (userId: string, password: string): Promise<{ token: string; userId: string } | null> => {
    if (USE_MOCK_API) {
      const mockUsers: Record<string, string> = {
        'user001': 'password123',
        'user002': 'password456',
      };
      
      if (!mockUsers[userId] || mockUsers[userId] !== password) {
        return null;
      }
      
      const token = 'mock-token';
      storeToken(token);
      sessionStorage.setItem('userId', userId);
      
      return { token, userId };
    }

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
      return {
        token: data.accessToken,
        userId: data.userId,
      };
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  // Clock in or out
  clockInOut: async (request: ClockInOutRequest): Promise<ClockInOutResponse> => {
    if (USE_MOCK_API) {
      const response = await mockApi.clockInOut(request);
      if (response.success && response.record) {
        storeToken('mock-token');
        sessionStorage.setItem('userId', request.userId);
      }
      return response;
    }

    try {
      // まずログインしてトークンを取得し、セッションに保存
      const token = await loginInternal(request.userId, request.password);
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication failed',
        };
      }

      // トークンをセッションに保存
      storeToken(token);
      // ユーザーIDも保存
      sessionStorage.setItem('userId', request.userId);

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
    if (USE_MOCK_API) {
      return mockApi.getRecords(filter);
    }

    try {
      // Get stored token
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token available');
        throw new Error('Authentication required. Please log in first.');
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
        if (response.status === 401) {
          // Token is invalid or expired; clear it
          clearToken();
          throw new Error('Authentication expired. Please log in again.');
        }
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
      throw error;
    }
  },
};
