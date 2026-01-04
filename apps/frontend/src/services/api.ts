import { ClockRecord, ClockInRequest, ClockOutRequest, ApiResponse } from '@attendance-kit/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function clockIn(request: ClockInRequest): Promise<ApiResponse<ClockRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}/clock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function clockOut(request: ClockOutRequest): Promise<ApiResponse<ClockRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}/clock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getRecords(userId?: string): Promise<ApiResponse<ClockRecord[]>> {
  try {
    const url = userId ? `${API_BASE_URL}/records?userId=${userId}` : `${API_BASE_URL}/records`;
    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
