/**
 * Clock record representing a single clock in/out entry
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
