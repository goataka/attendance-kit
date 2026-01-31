import type { RecordsFilter } from '../types';

export const TEST_ACCOUNTS = [
  { userId: 'user001', password: 'password123' },
  { userId: 'user002', password: 'password456' },
] as const;

export const DEFAULT_FILTER: RecordsFilter = {
  userId: '',
  startDate: '',
  endDate: '',
  type: 'all',
};
