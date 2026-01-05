/**
 * Clock event representing a single clock-in or clock-out action
 */
export interface ClockEvent {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'clock-in' | 'clock-out';
  userName?: string;
}

/**
 * Clock record for display (aggregated view)
 * Used by frontend to show paired clock-in/clock-out records
 */
export interface ClockRecord {
  id: string;
  userId: string;
  clockInTime: Date;
  clockOutTime?: Date;
  type: 'clock-in' | 'clock-out';
}

/**
 * User information
 */
export interface User {
  id: string;
  name: string;
}

/**
 * Clock in request payload
 */
export interface ClockInRequest {
  userId: string;
  userName: string;
}

/**
 * Clock out request payload
 */
export interface ClockOutRequest {
  userId: string;
}
