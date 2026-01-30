import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClocksListPage } from './ClocksListPage';
import { api } from '../shared/api';

// Mock the API - mock the index module which exports the api
vi.mock('../shared/api', () => ({
  api: {
    getRecords: vi.fn(),
  },
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('ClocksListPage', () => {
  const mockRecords = [
    {
      id: '1',
      userId: 'user001',
      timestamp: '2026-01-10T09:00:00Z',
      type: 'clock-in' as const,
    },
    {
      id: '2',
      userId: 'user001',
      timestamp: '2026-01-10T18:00:00Z',
      type: 'clock-out' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the records list page', async () => {
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<ClocksListPage />);
    
    expect(screen.getByText('打刻一覧')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
  });

  it('displays loading state initially', () => {
    vi.mocked(api.getRecords).mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<ClocksListPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays clocks after loading', async () => {
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('出勤')[0]).toBeInTheDocument();
    });
  });

  it('displays no data message when clocks are empty', async () => {
    vi.mocked(api.getRecords).mockResolvedValue([]);
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('打刻データがありません')).toBeInTheDocument();
    });
  });

  it('filters clocks by user ID', async () => {
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
    
    const userIdFilter = screen.getByLabelText('User ID');
    fireEvent.change(userIdFilter, { target: { value: 'user002' } });
    
    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(api.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user002' })
      );
    });
  });

  it('filters clocks by type', async () => {
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
    
    const typeFilter = screen.getByLabelText('打刻種別');
    fireEvent.change(typeFilter, { target: { value: 'clock-in' } });
    
    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(api.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'clock-in' })
      );
    });
  });

  it('resets filters', async () => {
    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
    
    const userIdFilter = screen.getByLabelText('User ID') as HTMLInputElement;
    fireEvent.change(userIdFilter, { target: { value: 'user002' } });
    
    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(userIdFilter.value).toBe('');
    });
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Authentication required. Please log in first.';
    vi.mocked(api.getRecords).mockRejectedValue(new Error(errorMessage));
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/打刻一覧を表示するには、打刻画面でログインしてください。/)).toBeInTheDocument();
    });
  });

  it('displays generic error message when fetch fails', async () => {
    vi.mocked(api.getRecords).mockRejectedValue(new Error('Failed to fetch records'));
    
    renderWithRouter(<ClocksListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch records')).toBeInTheDocument();
    });
  });
});
