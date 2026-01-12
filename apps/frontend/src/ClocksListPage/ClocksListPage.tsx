import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../shared/api/mockApi';
import { ClockRecord, RecordsFilter } from '../shared/types';
import './ClocksListPage.css';

export function ClocksListPage() {
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecordsFilter>({
    userId: '',
    startDate: '',
    endDate: '',
    type: 'all',
  });

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await mockApi.getRecords();
        setRecords(data);
      } catch (error) {
        console.error('Failed to load records:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, []);

  const loadRecords = async (newFilter?: RecordsFilter) => {
    setLoading(true);
    try {
      const filterToUse = newFilter || filter;
      const data = await mockApi.getRecords(filterToUse);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof RecordsFilter, value: string) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
  };

  const handleSearch = () => {
    loadRecords(filter);
  };

  const handleReset = () => {
    const emptyFilter: RecordsFilter = {
      userId: '',
      startDate: '',
      endDate: '',
      type: 'all',
    };
    setFilter(emptyFilter);
    loadRecords(emptyFilter);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="clocks-list-page">
      <div className="container">
        <h1>打刻一覧</h1>

        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="filterUserId">User ID</label>
            <input
              id="filterUserId"
              type="text"
              value={filter.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Search by user ID"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filterType">打刻種別</label>
            <select
              id="filterType"
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="clock-in">出勤</option>
              <option value="clock-out">退勤</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterStartDate">開始日時</label>
            <input
              id="filterStartDate"
              type="datetime-local"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filterEndDate">終了日時</label>
            <input
              id="filterEndDate"
              type="datetime-local"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="button-group">
            <button className="btn btn-primary" onClick={handleSearch}>
              検索
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              リセット
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="records-table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>日時</th>
                  <th>種別</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      打刻データがありません
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.userId}</td>
                      <td>{formatTimestamp(record.timestamp)}</td>
                      <td>
                        <span className={`badge ${record.type}`}>
                          {record.type === 'clock-in' ? '出勤' : '退勤'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="navigation">
          <Link to="/" className="link">
            ← 打刻画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
