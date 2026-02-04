import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { App } from '../../App';

// Mock the API
vi.mock('../../shared/api', () => ({
  api: {
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    clockInOut: vi.fn(),
    getRecords: vi.fn(),
  },
}));

describe('App Snapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
