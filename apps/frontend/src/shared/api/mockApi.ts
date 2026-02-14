import {
  ClockRecord,
  ClockInOutRequest,
  ClockInOutResponse,
  RecordsFilter,
} from '../types';

// Mock data storage
const mockRecords: ClockRecord[] = [
  {
    id: '1',
    userId: 'user001',
    timestamp: '2026-01-10T09:00:00Z',
    type: 'clock-in',
  },
  {
    id: '2',
    userId: 'user001',
    timestamp: '2026-01-10T18:00:00Z',
    type: 'clock-out',
  },
  {
    id: '3',
    userId: 'user002',
    timestamp: '2026-01-10T08:30:00Z',
    type: 'clock-in',
  },
  {
    id: '4',
    userId: 'user002',
    timestamp: '2026-01-10T17:30:00Z',
    type: 'clock-out',
  },
];

// Mock user credentials
const mockUsers: Record<string, string> = {
  user001: 'password123',
  user002: 'password456',
};

const TOKEN_STORAGE_KEY = 'attendance-kit-token';

export const mockApi = {
  login: async (userId: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!mockUsers[userId] || mockUsers[userId] !== password) {
      return false;
    }

    sessionStorage.setItem(TOKEN_STORAGE_KEY, `mock-token-${userId}`);
    return true;
  },

  hasSession: (): boolean => Boolean(sessionStorage.getItem(TOKEN_STORAGE_KEY)),

  // Clock in or out
  clockInOut: async (
    request: ClockInOutRequest,
  ): Promise<ClockInOutResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials
    if (
      !mockUsers[request.userId] ||
      mockUsers[request.userId] !== request.password
    ) {
      return {
        success: false,
        message: 'Invalid user ID or password',
      };
    }

    // Create new record
    const record: ClockRecord = {
      id: String(mockRecords.length + 1),
      userId: request.userId,
      timestamp: new Date().toISOString(),
      type: request.type,
    };

    mockRecords.push(record);

    return {
      success: true,
      record,
    };
  },

  // Get records with optional filtering
  getRecords: async (filter?: RecordsFilter): Promise<ClockRecord[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockRecords];

    if (filter?.userId) {
      filtered = filtered.filter((r) =>
        r.userId.toLowerCase().includes(filter.userId!.toLowerCase()),
      );
    }

    if (filter?.type && filter.type !== 'all') {
      filtered = filtered.filter((r) => r.type === filter.type);
    }

    if (filter?.startDate) {
      filtered = filtered.filter((r) => r.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter((r) => r.timestamp <= filter.endDate!);
    }

    // Sort by timestamp descending
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return filtered;
  },
};
