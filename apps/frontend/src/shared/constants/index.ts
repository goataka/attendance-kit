import type { RecordsFilter } from '../types';

/**
 * Test user accounts
 */
export const TEST_ACCOUNTS = [
  { userId: 'user001', password: 'password123' },
  { userId: 'user002', password: 'password456' },
] as const;

/**
 * Default filter for records
 */
export const DEFAULT_FILTER: RecordsFilter = {
  userId: '',
  startDate: '',
  endDate: '',
  type: 'all',
};
