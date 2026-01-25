/**
 * Test timeout constants (in milliseconds)
 */
export const TIMEOUTS = {
  WAIT_MESSAGE: 15000,
  CLOCK_ACTION: 30000,
  NETWORK_IDLE: 5000,
  DEFAULT_STEP: 30000,
} as const;

/**
 * Page selectors
 */
export const SELECTORS = {
  userId: '#userId',
  password: '#password',
  message: '.message',
  successMessage: '.message.success',
  clockListLink: '打刻一覧を見る',
  table: 'table',
} as const;
