import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecordsListPage } from './RecordsListPage';
import { mockApi } from '../shared/api/mockApi';

// Mock the API
vi.mock('../shared/api/mockApi', () => ({
  mockApi: {
    getRecords: vi.fn(),
  },
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('RecordsListPage', () => {
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
    vi.mocked(mockApi.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<RecordsListPage />);
    
    expect(screen.getByText('打刻一覧')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
  });

  it('displays loading state initially', () => {
    vi.mocked(mockApi.getRecords).mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<RecordsListPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays records after loading', async () => {
    vi.mocked(mockApi.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<RecordsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('出勤')[0]).toBeInTheDocument();
    });
  });

  it('displays no data message when records are empty', async () => {
    vi.mocked(mockApi.getRecords).mockResolvedValue([]);
    
    renderWithRouter(<RecordsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('打刻データがありません')).toBeInTheDocument();
    });
  });

  it('filters records by user ID', async () => {
    vi.mocked(mockApi.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<RecordsListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
    
    const userIdFilter = screen.getByLabelText('User ID');
    fireEvent.change(userIdFilter, { target: { value: 'user002' } });
    
    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockApi.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user002' })
      );
    });
  });

  it('filters records by type', async () => {
    vi.mocked(mockApi.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<RecordsListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('user001').length).toBeGreaterThan(0);
    });
    
    const typeFilter = screen.getByLabelText('打刻種別');
    fireEvent.change(typeFilter, { target: { value: 'clock-in' } });
    
    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockApi.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'clock-in' })
      );
    });
  });

  it('resets filters', async () => {
    vi.mocked(mockApi.getRecords).mockResolvedValue(mockRecords);
    
    renderWithRouter(<RecordsListPage />);
    
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
});
