import { ClockRecord, ClockInOutRequest, ClockInOutResponse, RecordsFilter } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const api = {
  // Clock in or out
  clockInOut: async (request: ClockInOutRequest): Promise<ClockInOutResponse> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/clock/${request.type === 'clock-in' ? 'in' : 'out'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: request.userId,
          password: request.password,
        }),
      });

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

      const url = `${BACKEND_URL}/api/clock/records${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

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
