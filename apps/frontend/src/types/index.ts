export interface ClockRecord {
  id: string;
  userId: string;
  timestamp: string;
  type: 'clock-in' | 'clock-out';
}

export interface ClockInOutRequest {
  userId: string;
  password: string;
  type: 'clock-in' | 'clock-out';
}

export interface ClockInOutResponse {
  success: boolean;
  record?: ClockRecord;
  message?: string;
}

export interface RecordsFilter {
  userId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'clock-in' | 'clock-out' | 'all';
}
